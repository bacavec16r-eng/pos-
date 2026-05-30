import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Package, AlertTriangle, AlertCircle, Boxes } from "lucide-react";

import { AppLayout } from "@/components/AppLayout";
import { useStore } from "@/lib/store";
import { formatDA } from "@/lib/format";

export const Route = createFileRoute("/inventory")({
  head: () => ({ meta: [{ title: "Inventaire — Djazair Market POS" }] }),
  component: InventoryPage,
});

function InventoryPage() {
  const { t } = useTranslation();
  const products = useStore((s) => s.products);
  const categories = useStore((s) => s.categories);

  const totalUnits = products.reduce((a, p) => a + p.stock, 0);
  const valuation = products.reduce((a, p) => a + p.stock * p.purchasePrice, 0);
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.minStock);
  const outOfStock = products.filter((p) => p.stock <= 0);

  return (
    <AppLayout title={t("inventory.title")}>
      <div className="p-4 space-y-4">
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <Kpi icon={<Package className="h-4 w-4" />} label={t("inventory.totalProducts")} value={products.length.toString()} />
          <Kpi icon={<Boxes className="h-4 w-4" />} label={t("inventory.totalUnits")} value={totalUnits.toString()} />
          <Kpi icon={<AlertTriangle className="h-4 w-4 text-warning-foreground" />} label={t("inventory.lowStock")} value={lowStock.length.toString()} />
          <Kpi icon={<AlertCircle className="h-4 w-4 text-destructive" />} label={t("inventory.outOfStock")} value={outOfStock.length.toString()} />
        </div>

        <div className="rounded-md border bg-card p-4">
          <div className="text-sm font-medium text-muted-foreground">{t("inventory.valuation")}</div>
          <div className="text-3xl font-bold mt-1 num">{formatDA(valuation)}</div>
        </div>

        <div className="rounded-md border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b text-sm font-semibold">
            {t("inventory.title")}
          </div>
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-start">{t("common.name")}</th>
                <th className="px-3 py-2 text-start">{t("products.category")}</th>
                <th className="px-3 py-2 text-end">{t("products.minStock")}</th>
                <th className="px-3 py-2 text-end">{t("products.currentStock")}</th>
                <th className="px-3 py-2 text-end">{t("inventory.valuation")}</th>
                <th className="px-3 py-2 text-end">État</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const cat = categories.find((c) => c.id === p.categoryId)?.name ?? "—";
                const out = p.stock <= 0;
                const critical = !out && p.stock <= Math.ceil(p.minStock / 2);
                const low = !out && !critical && p.stock <= p.minStock;
                return (
                  <tr key={p.id} className="border-t hover:bg-muted/30">
                    <td className="px-3 py-2 font-medium">{p.name}</td>
                    <td className="px-3 py-2">{cat}</td>
                    <td className="px-3 py-2 text-end num text-muted-foreground">{p.minStock}</td>
                    <td className="px-3 py-2 text-end num font-medium">{p.stock}</td>
                    <td className="px-3 py-2 text-end num">{formatDA(p.stock * p.purchasePrice)}</td>
                    <td className="px-3 py-2 text-end">
                      {out ? (
                        <Badge tone="destructive">{t("inventory.outOfStock")}</Badge>
                      ) : critical ? (
                        <Badge tone="destructive">{t("inventory.critical")}</Badge>
                      ) : low ? (
                        <Badge tone="warning">{t("inventory.low")}</Badge>
                      ) : (
                        <Badge tone="muted">{t("inventory.ok")}</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}

function Kpi({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
        <div className="h-7 w-7 rounded bg-muted inline-flex items-center justify-center">{icon}</div>
      </div>
      <div className="text-2xl font-bold mt-2 num">{value}</div>
    </div>
  );
}

function Badge({ tone, children }: { tone: "destructive" | "warning" | "muted"; children: React.ReactNode }) {
  const map = {
    destructive: "bg-destructive text-destructive-foreground",
    warning: "bg-warning text-warning-foreground",
    muted: "bg-muted text-muted-foreground",
  };
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${map[tone]}`}>
      {children}
    </span>
  );
}
