import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getTender } from "@/lib/tenders.functions";
import { formatMoney, formatDate } from "@/lib/format";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { STATUS_LABELS } from "@/lib/categories";

export const Route = createFileRoute("/_authenticated/tenders/$id")({
  head: () => ({ meta: [{ title: "Licitación — LicitIA" }] }),
  component: TenderDetail,
  errorComponent: ({ error }) => (
    <div className="p-6 text-sm text-destructive">{error.message}</div>
  ),
  notFoundComponent: () => <div className="p-6">No encontrada.</div>,
});

function TenderDetail() {
  const { id } = Route.useParams();
  const fn = useServerFn(getTender);
  const { data: t } = useSuspenseQuery({
    queryKey: ["tender", id],
    queryFn: () => fn({ data: { id } }),
  });

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-8">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Volver
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded bg-primary/10 px-2 py-0.5 font-medium text-primary">
          {t.category ?? "Sin clasificar"}
        </span>
        <span className="rounded bg-muted px-2 py-0.5 text-muted-foreground">
          {STATUS_LABELS[t.status] ?? t.status}
        </span>
      </div>
      <h1 className="mt-3 text-2xl font-bold text-foreground md:text-3xl">{t.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t.organism}</p>

      <div className="mt-6 grid gap-3 rounded-lg border border-border bg-card p-5 md:grid-cols-3">
        <Stat label="Monto estimado" value={formatMoney(t.estimated_amount, t.currency ?? "UYU")} />
        <Stat label="Fecha límite" value={formatDate(t.deadline)} />
        <Stat label="Publicada" value={formatDate(t.published_at)} />
      </div>

      {t.ai_summary && (
        <section className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">Resumen IA</h2>
          <p className="mt-2 whitespace-pre-line text-sm text-foreground">{t.ai_summary}</p>
        </section>
      )}

      {t.tags && t.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {t.tags.map((tag: string) => (
            <span key={tag} className="rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-xs text-foreground">
              {tag}
            </span>
          ))}
        </div>
      )}

      {t.description && (
        <section className="mt-6">
          <h2 className="text-sm font-semibold text-foreground">Descripción original</h2>
          <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{t.description}</p>
        </section>
      )}

      {t.source_url && (
        <a
          href={t.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Ver en ARCE <ExternalLink className="size-4" />
        </a>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}