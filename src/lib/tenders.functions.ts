import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const ListInput = z.object({
  category: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  minAmount: z.number().optional(),
  limit: z.number().min(1).max(100).default(50),
});

export const listTenders = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ListInput.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("tenders")
      .select("*")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(data.limit);
    if (data.category) q = q.eq("category", data.category);
    if (data.status) q = q.eq("status", data.status);
    if (data.minAmount) q = q.gte("estimated_amount", data.minAmount);
    if (data.search) q = q.ilike("title", `%${data.search}%`);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

const IdInput = z.object({ id: z.string().uuid() });

export const getTender = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => IdInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("tenders")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Licitación no encontrada");
    return row;
  });

export const listAlerts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("alerts_sent")
      .select("*, tender:tenders(id, title, organism, category)")
      .eq("user_id", context.userId)
      .order("sent_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });