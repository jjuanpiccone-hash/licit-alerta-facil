import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-2 font-semibold text-foreground">
          <Sparkles className="size-5 text-primary" />
          LicitIA
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <a href="/#features" className="hover:text-foreground">Cómo funciona</a>
          <Link to="/pricing" className="hover:text-foreground">Precios</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/auth"
            className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            Ingresar
          </Link>
          <Link
            to="/auth"
            className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Probá gratis
          </Link>
        </div>
      </div>
    </header>
  );
}