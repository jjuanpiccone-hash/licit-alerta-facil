import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

const FREE_MONTHLY_LIMIT = 3;

async function sendWhatsapp(to: string, body: string) {
  const sid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const token = Deno.env.get("TWILIO_AUTH_TOKEN");
  const from = Deno.env.get("TWILIO_WHATSAPP_FROM"); // ej: whatsapp:+14155238886
  if (!sid || !token || !from) {
    throw new Error("Twilio no configurado (TWILIO_ACCOUNT_SID/AUTH_TOKEN/WHATSAPP_FROM)");
  }

  const params = new URLSearchParams({
    From: from,
    To: `whatsapp:${to.startsWith("+") ? to : "+" + to}`,
    Body: body,
  });

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: "Basic " + btoa(`${sid}:${token}`),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    },
  );
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Twilio ${res.status}: ${t}`);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { tender_id } = await req.json();
    if (!tender_id) throw new Error("tender_id requerido");

    const { data: tender } = await supabase
      .from("tenders")
      .select("*")
      .eq("id", tender_id)
      .maybeSingle();
    if (!tender) throw new Error("Licitación no encontrada");

    const { data: prefs } = await supabase
      .from("user_preferences")
      .select("*, profile:profiles(id, plan, whatsapp_number)")
      .eq("whatsapp_enabled", true);

    let matched = 0;
    let sent = 0;
    for (const p of prefs ?? []) {
      const profile = (p as unknown as {
        profile: { id: string; plan: "free" | "pro"; whatsapp_number: string | null } | null;
      }).profile;
      if (!profile?.whatsapp_number) continue;

      const catMatch =
        !p.categories?.length || (tender.category && p.categories.includes(tender.category));
      const haystack = `${tender.title} ${tender.description ?? ""} ${(tender.tags ?? []).join(" ")}`.toLowerCase();
      const kwMatch =
        !p.keywords?.length ||
        p.keywords.some((k: string) => k && haystack.includes(k.toLowerCase()));
      const amountMatch =
        !p.min_amount || (tender.estimated_amount ?? 0) >= p.min_amount;

      if (!(catMatch && kwMatch && amountMatch)) continue;
      matched++;

      // Quota for free plan
      if (profile.plan === "free") {
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        const { count } = await supabase
          .from("alerts_sent")
          .select("id", { count: "exact", head: true })
          .eq("user_id", profile.id)
          .gte("sent_at", monthStart.toISOString());
        if ((count ?? 0) >= FREE_MONTHLY_LIMIT) continue;
      }

      const body = `🚨 LicitIA — Nueva licitación
${tender.title}
Organismo: ${tender.organism}
${tender.category ? `Categoría: ${tender.category}\n` : ""}${tender.deadline ? `Cierre: ${tender.deadline}\n` : ""}${tender.ai_summary ?? ""}

Ver: ${tender.source_url ?? ""}`;

      try {
        await sendWhatsapp(profile.whatsapp_number, body);
        await supabase.from("alerts_sent").insert({
          user_id: profile.id,
          tender_id: tender.id,
          channel: "whatsapp",
          status: "sent",
        });
        sent++;
      } catch (err) {
        await supabase.from("alerts_sent").insert({
          user_id: profile.id,
          tender_id: tender.id,
          channel: "whatsapp",
          status: "failed",
          error_message: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return new Response(JSON.stringify({ ok: true, matched, sent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});