import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Ingresar — LicitIA" },
      { name: "description", content: "Iniciá sesión o creá tu cuenta en LicitIA." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName, company_name: company },
          },
        });
        if (error) throw error;
        toast.success("¡Cuenta creada! Redirigiendo…");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hidden flex-col justify-between bg-sidebar p-10 text-sidebar-foreground md:flex">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <Sparkles className="size-5 text-sidebar-primary" />
          LicitIA
        </Link>
        <div>
          <h2 className="text-3xl font-bold leading-tight">
            "Cada licitación que se nos escapaba era un contrato perdido."
          </h2>
          <p className="mt-4 text-sidebar-foreground/70">
            ARCE publica licitaciones todos los días. LicitIA te avisa solo cuando hay una que te interesa.
          </p>
        </div>
        <p className="text-sm text-sidebar-foreground/60">Datos públicos de ARCE · Uruguay</p>
      </div>

      <div className="flex items-center justify-center bg-background p-6 md:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 md:hidden">
            <Link to="/" className="flex items-center gap-2 font-semibold text-foreground">
              <Sparkles className="size-5 text-primary" />
              LicitIA
            </Link>
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            {mode === "signin" ? "Ingresá a tu cuenta" : "Creá tu cuenta"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin" ? "¿No tenés cuenta?" : "¿Ya tenés cuenta?"}{" "}
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="font-medium text-primary hover:underline"
            >
              {mode === "signin" ? "Registrate" : "Iniciá sesión"}
            </button>
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-3">
            {mode === "signup" && (
              <>
                <Field label="Nombre" value={fullName} onChange={setFullName} required />
                <Field label="Empresa" value={company} onChange={setCompany} />
              </>
            )}
            <Field label="Email" type="email" value={email} onChange={setEmail} required />
            <Field
              label="Contraseña"
              type="password"
              value={password}
              onChange={setPassword}
              required
              minLength={8}
            />
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Procesando…" : mode === "signin" ? "Ingresar" : "Crear cuenta"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  minLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        minLength={minLength}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-ring/30 focus:border-ring focus:ring-2"
      />
    </label>
  );
}