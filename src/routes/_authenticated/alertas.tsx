import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listAlerts } from "@/lib/tenders.functions";
import { formatRelative } from "@/lib/format";
import { Bell, CheckCircle2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/alertas")({
  head: () => ({ meta: [{ title: "Mis alertas — LicitIA" }] }),
  component: Alertas,
});

function Alertas() {
  const fn = useServerFn(listAlerts);
  const { data: alerts } = useSuspenseQuery({ queryKey: ["my-alerts"], queryFn: () => fn() });

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold text-foreground md:text-3xl">Mis alertas</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Historial de mensajes que te enviamos por WhatsApp.
      </p>

      {alerts.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-border bg-card p-12 text-center">
          <Bell className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 font-medium text-foreground">Todavía no recibiste alertas</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Configurá tus preferencias y te avisaremos en cuanto haya un match en ARCE.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-2">
          {alerts.map((a) => {
            const ok = a.status === "sent";
            const tender = (a as unknown as { tender?: { id: string; title: string; organism: string } }).tender;
            return (
              <li
                key={a.id}
                className="flex items-start gap-3 rounded-lg border border-border bg-card p-4"
              >
                {ok ? (
                  <CheckCircle2 className="mt-0.5 size-4 text-accent" />
                ) : (
                  <AlertCircle className="mt-0.5 size-4 text-destructive" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-foreground">{tender?.title ?? "—"}</div>
                  <div className="text-xs text-muted-foreground">
                    {tender?.organism} · {formatRelative(a.sent_at)} · vía {a.channel}
                  </div>
                  {a.error_message && (
                    <div className="mt-1 text-xs text-destructive">{a.error_message}</div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}