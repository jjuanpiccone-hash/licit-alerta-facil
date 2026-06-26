// Scrapes the public ARCE (Compras Estatales Uruguay) listing of tenders
// and inserts new ones into the `tenders` table.
//
// ARCE no expone una API REST estable pública; este edge function hace fetch
// del buscador HTML y parsea las filas. Si ARCE cambia el HTML, ajustar los
// selectores en `parseListing` abajo.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { DOMParser, Element } from "https://deno.land/x/deno_dom@v0.1.46/deno-dom-wasm.ts";
import { corsHeaders } from "../_shared/cors.ts";

const ARCE_LIST_URL =
  "https://www.comprasestatales.gub.uy/consultas/llamados?est_lic=Abierto";

type ParsedTender = {
  external_id: string;
  title: string;
  organism: string;
  source_url: string;
  published_at: string | null;
  deadline: string | null;
  description: string | null;
};

function parseDate(s: string | null | undefined): string | null {
  if (!s) return null;
  const m = s.trim().match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!m) return null;
  const [, d, mo, y] = m;
  return `${y}-${mo}-${d}`;
}

function parseListing(html: string): ParsedTender[] {
  const doc = new DOMParser().parseFromString(html, "text/html");
  if (!doc) return [];

  const rows = Array.from(doc.querySelectorAll("table tr")) as Element[];
  const tenders: ParsedTender[] = [];

  for (const row of rows) {
    const cells = Array.from(row.querySelectorAll("td")) as Element[];
    if (cells.length < 3) continue;

    const link = row.querySelector("a[href]") as Element | null;
    if (!link) continue;
    const href = link.getAttribute("href") ?? "";
    if (!href.includes("/consultas/")) continue;

    const sourceUrl = href.startsWith("http")
      ? href
      : `https://www.comprasestatales.gub.uy${href}`;
    const externalId = (sourceUrl.match(/\/(\d+)(?:[\/?#]|$)/)?.[1]) ??
      sourceUrl.split("/").filter(Boolean).pop() ?? sourceUrl;

    const text = cells.map((c) => c.textContent.trim());
    const title = link.textContent.trim();
    const organism = text.find((t) => /ministerio|intendencia|anep|ute|antel|ose|asse|junta|banco/i.test(t)) ??
      text[0] ?? "Organismo no especificado";

    const publishedAt = parseDate(text.find((t) => /\d{2}\/\d{2}\/\d{4}/.test(t)) ?? null);
    const deadline = parseDate(text.reverse().find((t) => /\d{2}\/\d{2}\/\d{4}/.test(t)) ?? null);

    tenders.push({
      external_id: externalId,
      title,
      organism,
      source_url: sourceUrl,
      published_at: publishedAt,
      deadline,
      description: text.join(" · ").slice(0, 1500),
    });
  }
  return tenders;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const res = await fetch(ARCE_LIST_URL, {
      headers: { "User-Agent": "LicitIA/1.0 (+https://licitia.app)" },
    });
    if (!res.ok) {
      throw new Error(`ARCE responded ${res.status}`);
    }
    const html = await res.text();
    const parsed = parseListing(html);

    let inserted = 0;
    const insertedIds: string[] = [];
    for (const t of parsed) {
      const { data: existing } = await supabase
        .from("tenders")
        .select("id")
        .eq("external_id", t.external_id)
        .maybeSingle();
      if (existing) continue;

      const { data: row, error } = await supabase
        .from("tenders")
        .insert({
          external_id: t.external_id,
          title: t.title,
          organism: t.organism,
          source_url: t.source_url,
          published_at: t.published_at,
          deadline: t.deadline,
          description: t.description,
          status: "open",
        })
        .select("id")
        .single();

      if (!error && row) {
        inserted++;
        insertedIds.push(row.id);
      }
    }

    // Trigger downstream processing in background.
    if (insertedIds.length > 0) {
      const fnUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/classify-tender`;
      for (const id of insertedIds) {
        fetch(fnUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({ tender_id: id }),
        }).catch(() => {});
      }
    }

    return new Response(
      JSON.stringify({ ok: true, parsed: parsed.length, inserted }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});