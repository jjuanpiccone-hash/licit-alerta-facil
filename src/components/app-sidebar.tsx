import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Bell, Settings, Sparkles, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const items = [
  { to: "/dashboard", label: "Licitaciones", icon: LayoutDashboard },
  { to: "/alertas", label: "Mis alertas", icon: Bell },
  { to: "/preferencias", label: "Preferencias", icon: Settings },
];

export function AppSidebar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const handleSignOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const NavList = (
    <nav className="flex flex-col gap-1 p-3">
      {items.map((item) => {
        const active = location.pathname.startsWith(item.to);
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile topbar */}
      <div className="flex items-center justify-between border-b border-sidebar-border bg-sidebar px-4 py-3 text-sidebar-foreground md:hidden">
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
          <Sparkles className="size-5 text-sidebar-primary" />
          LicitIA
        </Link>
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-2 hover:bg-sidebar-accent"
          aria-label="Abrir menú"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Sidebar — desktop fixed, mobile drawer */}
      <aside
        className={cn(
          "z-40 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex-col",
          "md:flex md:w-64 md:shrink-0 md:min-h-screen md:sticky md:top-0",
          open ? "flex absolute inset-x-0 top-[57px] bottom-0" : "hidden",
        )}
      >
        <div className="hidden md:flex items-center gap-2 px-5 py-5 border-b border-sidebar-border">
          <Sparkles className="size-6 text-sidebar-primary" />
          <span className="text-lg font-semibold tracking-tight">LicitIA</span>
        </div>
        {NavList}
        <div className="mt-auto p-3 border-t border-sidebar-border">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="size-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}