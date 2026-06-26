import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { PublicHeader } from "@/components/public-header";
import { Bell, Brain, FileText, Radar, Check } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LicitIA — Licitaciones del Estado uruguayo a tu WhatsApp" },
      { name: "description", content: "Los datos de ARCE son públicos. LicitIA te los trae clasificados, resumidos y a tu WhatsApp antes que tu competencia." },
      { property: "og:title", content: "LicitIA" },
      { property: "og:description", content: "Compras estatales de Uruguay, clasificadas y resumidas con IA, directo a tu WhatsApp." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              Fuente oficial · ARCE Uruguay
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-foreground md:text-6xl">
              Ganá licitaciones del Estado <span className="text-primary">antes que tu competencia</span>.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Los datos de ARCE son públicos — LicitIA te los trae <strong className="text-foreground">clasificados</strong>,{" "}
              <strong className="text-foreground">resumidos por IA</strong> y directo a tu <strong className="text-foreground">WhatsApp</strong>.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/auth"
                className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Empezar gratis
              </Link>
              <Link
                to="/pricing"
                className="rounded-md border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted"
              >
                Ver planes
              </Link>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">3 alertas/mes gratis · sin tarjeta de crédito.</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border bg-card/40 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">Así trabaja LicitIA por vos</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Mientras vos atendés tu negocio, nosotros monitoreamos ARCE, leemos los pliegos y te avisamos solo de lo que importa.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Radar, title: "Monitoreo continuo", desc: "Revisamos ARCE cada pocas horas. Nada se te escapa." },
              { icon: Brain, title: "Clasificación con IA", desc: "Cada licitación queda etiquetada por rubro y palabras clave." },
              { icon: FileText, title: "Resumen claro", desc: "Qué piden, fecha límite, presupuesto y requisitos — en 5 líneas." },
              { icon: Bell, title: "Alerta por WhatsApp", desc: "Te llega un mensaje cuando aparece algo que matchea con vos." },
            ].map((f) => (
              <div key={f.title} className="rounded-lg border border-border bg-card p-6">
                <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <f.icon className="size-5" />
                </div>
                <h3 className="mt-4 font-semibold text-foreground">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For who */}
      <section className="py-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">Pensado para pymes uruguayas</h2>
            <p className="mt-4 text-muted-foreground">
              Si tu empresa puede venderle al Estado pero no tenés tiempo de revisar ARCE todos los días, LicitIA es para vos. Configurás tus rubros y palabras clave una vez, y dejás de mirar el portal a mano.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-foreground">
              {[
                "Construcción, tecnología, alimentación, salud y más.",
                "Filtros por monto mínimo y organismo.",
                "Historial de alertas para auditar lo que recibiste.",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 text-accent" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="rounded-lg bg-muted/60 p-4 font-mono text-xs text-foreground">
              <div className="text-muted-foreground">📲 WhatsApp · LicitIA</div>
              <div className="mt-3">🚨 Nueva licitación que matchea con vos</div>
              <div className="mt-2"><strong>Intendencia de Montevideo</strong></div>
              <div>Adquisición de equipos informáticos para escuelas</div>
              <div className="mt-2 text-muted-foreground">Categoría: Tecnología · UYU 2.400.000</div>
              <div>Cierra: 14/07/2026</div>
              <div className="mt-2 text-primary">Ver detalles →</div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} LicitIA · Datos públicos de ARCE Uruguay
      </footer>
    </div>
  );
}
