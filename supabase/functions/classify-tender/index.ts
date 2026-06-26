import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

const CATEGORIES = [
  "Construcción",
  "Tecnología",
  "Salud",
  "Alimentación",
  "Transporte",
  "Servicios profesionales",
  "Educación",
  "Limpieza y mantenimiento",
  "Seguridad",
  "Otros",
];

const SYSTEM = `Sos un asistente experto en licitaciones públicas uruguayas.
Dada una licitación de ARCE, devolvé un JSON con:
- category: una de [${CATEGORIES.join(", ")}]
- tags: array de 3 a 6 palabras clave en minúsculas
- summary: resumen claro en español rioplatense (máximo 6 líneas) con: qué se pide, fecha límite si está, presupuesto estimado si está, y requisitos clave inferidos.
- estimated_amount_uyu: número (en pesos uruguayos) o null si no se puede inferir.
Responde SOLO con JSON válido, sin texto extra.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { tender_id } = await req.json();
    if (!tender_id) throw new Error("tender_id requerido");

    const { data: tender, error } = await supabase
      .from("tenders")
      .select("*")
      .eq("id", tender_id)
      .maybeSingle();
    if (error || !tender) throw new Error("Licitación no encontrada");

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) throw new Error("OPENAI_API_KEY no configurada");

    const userMsg = `Título: ${tender.title}
Organismo: ${tender.organism}
Publicada: ${tender.published_at ?? "—"}
Cierre: ${tender.deadline ?? "—"}
Descripción: ${tender.description ?? "—"}
URL: ${tender.source_url ?? "—"}`;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userMsg },
        ],
        temperature: 0.2,
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      throw new Error(`OpenAI error: ${aiRes.status} ${t}`);
    }
    const json = await aiRes.json();
    const content = json.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content);

    await supabase
      .from("tenders")
      .update({
        category: CATEGORIES.includes(parsed.category) ? parsed.category : "Otros",
        tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 10) : [],
        ai_summary: typeof parsed.summary === "string" ? parsed.summary : null,
        estimated_amount:
          typeof parsed.estimated_amount_uyu === "number"
            ? parsed.estimated_amount_uyu
            : tender.estimated_amount,
        currency: tender.currency ?? "UYU",
        classified_at: new Date().toISOString(),
      })
      .eq("id", tender_id);

    // Fire-and-forget alert matching
    fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/match-and-alert`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      },
      body: JSON.stringify({ tender_id }),
    }).catch(() => {});

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});