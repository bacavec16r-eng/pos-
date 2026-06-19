import { Link, useRouterState } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  ScanBarcode,
  Sparkles,
  Tags,
  Boxes,
  Users,
  BarChart3,
  Settings,
  Flower2,
  Truck,
} from "lucide-react";

const items = [
  { to: "/", icon: LayoutDashboard, key: "dashboard" },
  { to: "/pos", icon: ScanBarcode, key: "pos" },
  { to: "/products", icon: Sparkles, key: "products" },
  { to: "/categories", icon: Tags, key: "categories" },
  { to: "/inventory", icon: Boxes, key: "inventory" },
  { to: "/suppliers", icon: Truck, key: "suppliers" },
  { to: "/customers", icon: Users, key: "customers" },
  { to: "/reports", icon: BarChart3, key: "reports" },
  { to: "/settings", icon: Settings, key: "settings" },
] as const;

export function Sidebar() {
  const { t } = useTranslation();
  const path = useRouterState({ select: (r) => r.location.pathname });

  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="h-14 flex items-center gap-2 px-4 border-b border-sidebar-border">
        <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
          <Flower2 className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold">{t("app.name")}</div>
          <div className="text-[11px] text-sidebar-foreground/60">
            {t("app.tagline")}
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {items.map((it) => {
          const active = it.to === "/" ? path === "/" : path.startsWith(it.to);
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm border-l-2 transition-colors ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground border-primary"
                  : "border-transparent hover:bg-sidebar-accent/40"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{t(`nav.${it.key}`)}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-3 text-[11px] text-sidebar-foreground/50 border-t border-sidebar-border">
        v1.1 · Offline
      </div>
    </aside>
  );
}
