import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useSuspenseQuery, queryOptions, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listTenders } from "@/lib/tenders.functions";
import { CATEGORIES, STATUS_LABELS } from "@/lib/categories";
import { formatMoney, formatRelative, formatDate } from "@/lib/format";
import { Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Licitaciones — LicitIA" }] }),
  component: Dashboard,
  errorComponent: ({ error }) => (
    <div className="p-6 text-sm text-destructive">Error: {error.message}</div>
  ),
});

const tendersQuery = (filters: { category?: string; status?: string; search?: string }) =>
  queryOptions({
    queryKey: ["tenders", filters],
    queryFn: () => listTenders({ data: { ...filters, limit: 50 } }),
  });

function Dashboard() {
  const [category, setCategory] = useState<string>("");
  const [status, setStatus] = useState<string>("open");
  const [search, setSearch] = useState("");
  const fn = useServerFn(listTenders);
  const qc = useQueryClient();

  const filters = {
    category: category || undefined,
    status: status || undefined,
    search: search || undefined,
  };

  const { data: tenders } = useSuspenseQuery({
    ...tendersQuery(filters),
    queryFn: () => fn({ data: { ...filters, limit: 50 } }),
  });

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Licitaciones</h1>
        <p className="text-sm text-muted-foreground">
          {tenders.length} resultado{tenders.length === 1 ? "" : "s"} · datos públicos de ARCE
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 grid gap-3 md:grid-cols-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título…"
            className="w-full rounded-md border border-input bg-card pl-9 pr-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-md border border-input bg-card px-3 py-2 text-sm"
        >
          <option value="">Todas las categorías</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border border-input bg-card px-3 py-2 text-sm"
        >
          <option value="">Todos los estados</option>
          <option value="open">Abiertas</option>
          <option value="closed">Cerradas</option>
          <option value="awarded">Adjudicadas</option>
        </select>
      </div>

      {/* List */}
      {tenders.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
          <p className="text-foreground">No hay licitaciones con esos filtros.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Recién conectado: el primer scraping de ARCE puede tardar unas horas. Probá quitar filtros.
          </p>
          <button
            onClick={() => qc.invalidateQueries({ queryKey: ["tenders"] })}
            className="mt-4 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            Refrescar
          </button>
        </div>
      ) : (
        <ul className="space-y-3">
          {tenders.map((t) => (
            <li key={t.id}>
              <Link
                to="/tenders/$id"
                params={{ id: t.id }}
                className="block rounded-lg border border-border bg-card p-5 transition hover:border-primary/40 hover:shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded bg-primary/10 px-2 py-0.5 font-medium text-primary">
                        {t.category ?? "Sin clasificar"}
                      </span>
                      <span className="rounded bg-muted px-2 py-0.5 text-muted-foreground">
                        {STATUS_LABELS[t.status] ?? t.status}
                      </span>
                      <span className="text-muted-foreground">{t.organism}</span>
                    </div>
                    <h3 className="mt-2 font-semibold text-foreground">{t.title}</h3>
                    {t.ai_summary && (
                      <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                        {t.ai_summary}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-semibold text-foreground">
                      {formatMoney(t.estimated_amount, t.currency ?? "UYU")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t.deadline ? `Cierra ${formatDate(t.deadline)}` : formatRelative(t.published_at)}
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}