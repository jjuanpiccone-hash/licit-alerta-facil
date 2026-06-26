import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyProfile, updateMyPreferences } from "@/lib/preferences.functions";
import { CATEGORIES } from "@/lib/categories";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/preferencias")({
  head: () => ({ meta: [{ title: "Preferencias — LicitIA" }] }),
  component: Preferencias,
});

function Preferencias() {
  const getFn = useServerFn(getMyProfile);
  const updateFn = useServerFn(updateMyPreferences);
  const qc = useQueryClient();
  const { data } = useSuspenseQuery({ queryKey: ["my-profile"], queryFn: () => getFn() });

  const [whatsapp, setWhatsapp] = useState(data.profile?.whatsapp_number ?? "");
  const [keywords, setKeywords] = useState((data.preferences?.keywords ?? []).join(", "));
  const [minAmount, setMinAmount] = useState(String(data.preferences?.min_amount ?? ""));
  const [selectedCats, setSelectedCats] = useState<string[]>(data.preferences?.categories ?? []);

  const mutation = useMutation({
    mutationFn: (payload: {
      whatsapp_number: string | null;
      categories: string[];
      keywords: string[];
      min_amount: number | null;
      whatsapp_enabled: boolean;
    }) => updateFn({ data: payload }),
    onSuccess: () => {
      toast.success("Preferencias guardadas");
      qc.invalidateQueries({ queryKey: ["my-profile"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });

  const toggleCat = (c: string) =>
    setSelectedCats((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      whatsapp_number: whatsapp.trim() || null,
      categories: selectedCats,
      keywords: keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
      min_amount: minAmount ? Number(minAmount) : null,
      whatsapp_enabled: true,
    });
  };

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-8">
      <h1 className="text-2xl font-bold text-foreground md:text-3xl">Preferencias</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Configurá qué tipo de licitaciones querés que te avisemos por WhatsApp.
      </p>

      <form onSubmit={onSave} className="mt-6 space-y-6">
        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="font-semibold text-foreground">WhatsApp</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Incluí el código de país, ej: <code>+59899123456</code>.
          </p>
          <input
            type="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="+598..."
            className="mt-3 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-ring focus:ring-2 focus:ring-ring/30 outline-none"
          />
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="font-semibold text-foreground">Categorías de interés</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const active = selectedCats.includes(c);
              return (
                <button
                  type="button"
                  key={c}
                  onClick={() => toggleCat(c)}
                  className={
                    active
                      ? "rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
                      : "rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground hover:bg-muted"
                  }
                >
                  {c}
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="font-semibold text-foreground">Palabras clave</h2>
          <p className="mt-1 text-sm text-muted-foreground">Separadas por coma.</p>
          <input
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="hospital, software, pintura…"
            className="mt-3 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-ring focus:ring-2 focus:ring-ring/30 outline-none"
          />
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="font-semibold text-foreground">Monto mínimo (UYU)</h2>
          <input
            type="number"
            min={0}
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            placeholder="0"
            className="mt-3 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-ring focus:ring-2 focus:ring-ring/30 outline-none"
          />
        </section>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {mutation.isPending ? "Guardando…" : "Guardar preferencias"}
        </button>
      </form>
    </div>
  );
}