import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicHeader } from "@/components/public-header";
import { Check } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Precios — LicitIA" },
      { name: "description", content: "Planes simples para monitorear ARCE y recibir alertas por WhatsApp." },
      { property: "og:title", content: "Precios — LicitIA" },
      { property: "og:description", content: "Empezá gratis. Subí a Pro cuando necesités alertas ilimitadas." },
    ],
  }),
  component: Pricing,
});

const plans = [
  {
    name: "Gratis",
    price: "UYU 0",
    period: "/ mes",
    desc: "Para probar y validar el flujo.",
    cta: "Empezar gratis",
    features: [
      "Acceso completo al dashboard",
      "Hasta 3 alertas por WhatsApp / mes",
      "Resúmenes IA cortos",
      "1 número de WhatsApp",
    ],
  },
  {
    name: "Pro",
    price: "UYU 990",
    period: "/ mes",
    desc: "Para empresas que licitan en serio.",
    cta: "Subir a Pro",
    highlight: true,
    features: [
      "Alertas por WhatsApp ilimitadas",
      "Resúmenes IA completos con requisitos",
      "Filtros avanzados por monto y organismo",
      "Historial completo de alertas",
      "Soporte por email",
    ],
  },
];

function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <section className="mx-auto max-w-5xl px-4 py-16 md:py-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Planes simples, sin sorpresas
          </h1>
          <p className="mt-4 text-muted-foreground">
            Empezá gratis. Pasá a Pro cuando quieras alertas ilimitadas y resúmenes completos.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {plans.map((p) => (
            <div
              key={p.name}
              className={
                p.highlight
                  ? "rounded-xl border-2 border-primary bg-card p-8 shadow-lg"
                  : "rounded-xl border border-border bg-card p-8"
              }
            >
              {p.highlight && (
                <span className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Más popular
                </span>
              )}
              <h2 className="mt-3 text-2xl font-bold text-foreground">{p.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-foreground">{p.price}</span>
                <span className="text-sm text-muted-foreground">{p.period}</span>
              </div>
              <Link
                to="/auth"
                className={
                  p.highlight
                    ? "mt-6 block rounded-md bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                    : "mt-6 block rounded-md border border-border bg-background px-4 py-2.5 text-center text-sm font-semibold text-foreground hover:bg-muted"
                }
              >
                {p.cta}
              </Link>
              <ul className="mt-6 space-y-3 text-sm text-foreground">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 text-accent" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}