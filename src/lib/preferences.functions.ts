import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [{ data: profile }, { data: prefs }] = await Promise.all([
      context.supabase.from("profiles").select("*").eq("id", context.userId).maybeSingle(),
      context.supabase.from("user_preferences").select("*").eq("user_id", context.userId).maybeSingle(),
    ]);
    return { profile, preferences: prefs };
  });

const UpdateInput = z.object({
  full_name: z.string().max(120).optional(),
  company_name: z.string().max(120).optional(),
  whatsapp_number: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{8,20}$/u, "Número de WhatsApp inválido")
    .optional()
    .or(z.literal("")),
  categories: z.array(z.string()).max(20),
  keywords: z.array(z.string()).max(50),
  min_amount: z.number().nonnegative().nullable().optional(),
  whatsapp_enabled: z.boolean(),
});

export const updateMyPreferences = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => UpdateInput.parse(input))
  .handler(async ({ data, context }) => {
    const { error: pErr } = await context.supabase
      .from("profiles")
      .update({
        full_name: data.full_name ?? null,
        company_name: data.company_name ?? null,
        whatsapp_number: data.whatsapp_number || null,
      })
      .eq("id", context.userId);
    if (pErr) throw new Error(pErr.message);

    const { error: prefErr } = await context.supabase
      .from("user_preferences")
      .upsert({
        user_id: context.userId,
        categories: data.categories,
        keywords: data.keywords,
        whatsapp_enabled: data.whatsapp_enabled,
        min_amount: data.min_amount ?? null,
      });
    if (prefErr) throw new Error(prefErr.message);
    return { ok: true };
  });