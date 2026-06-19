import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Package, AlertTriangle, AlertCircle, Boxes, CalendarClock } from "lucide-react";

import { AppLayout } from "@/components/AppLayout";
import { useStore, productTotalStock } from "@/lib/store";
import { formatDA, daysUntil, expiryStatus, formatDate } from "@/lib/format";

export const Route = createFileRoute("/inventory")({
  head: () => ({ meta: [{ title: "Inventaire — Belle Beauté POS" }] }),
  component: InventoryPage,
});

function InventoryPage() {
  const { t } = useTranslation();
  const products = useStore((s) => s.products);
  const categories = useStore((s) => s.categories);

  const [tab, setTab] = useState<"stock" | "expiry">("stock");
  const [expiryFilter, setExpiryFilter] = useState<30 | 60 | 90 | "all">(60);

  const totalUnits = products.reduce((a, p) => a + productTotalStock(p), 0);
  const valuation = products.reduce((a, p) => a + productTotalStock(p) * p.purchasePrice, 0);
  const lowStock = products.filter((p) => { const s = productTotalStock(p); return s > 0 && s <= p.minStock; });
  const outOfStock = products.filter((p) => productTotalStock(p) <= 0);

  // Expiry items
  const expiringItems = useMemo(() => {
    type Row = { id: string; name: string; variantName?: string; category: string; expiryDate: string; days: number; stock: number };
    const rows: Row[] = [];
    for (const p of products) {
      const cat = categories.find((c) => c.id === p.categoryId)?.name ?? "—";
      if (p.expiryDate) {
        const d = daysUntil(p.expiryDate);
        if (d !== null) rows.push({ id: p.id, name: p.name, category: cat, expiryDate: p.expiryDate, days: d, stock: p.stock });
      }
      if (p.variants) {
        for (const v of p.variants) {
          if (v.expiryDate) {
            const d = daysUntil(v.expiryDate);
            if (d !== null) rows.push({ id: `${p.id}:${v.id}`, name: p.name, variantName: v.name, category: cat, expiryDate: v.expiryDate, days: d, stock: v.stock });
          }
        }
      }
    }
    return rows.sort((a, b) => a.days - b.days);
  }, [products, categories]);

  const filteredExpiring = useMemo(() => {
    if (expiryFilter === "all") return expiringItems;
    return expiringItems.filter((r) => r.days <= expiryFilter);
  }, [expiringItems, expiryFilter]);

  const counts = {
    expired: expiringItems.filter((r) => r.days < 0).length,
    d30: expiringItems.filter((r) => r.days >= 0 && r.days <= 30).length,
    d60: expiringItems.filter((r) => r.days >= 0 && r.days <= 60).length,
    d90: expiringItems.filter((r) => r.days >= 0 && r.days <= 90).length,
  };

  return (
    <AppLayout title={t("inventory.title")}>
      <div className="p-4 space-y-4">
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
          <Kpi icon={<Package className="h-4 w-4" />} label={t("inventory.totalProducts")} value={products.length.toString()} />
          <Kpi icon={<Boxes className="h-4 w-4" />} label={t("inventory.totalUnits")} value={totalUnits.toString()} />
          <Kpi icon={<AlertTriangle className="h-4 w-4 text-warning-foreground" />} label={t("inventory.lowStock")} value={lowStock.length.toString()} />
          <Kpi icon={<AlertCircle className="h-4 w-4 text-destructive" />} label={t("inventory.outOfStock")} value={outOfStock.length.toString()} />
          <Kpi icon={<CalendarClock className="h-4 w-4 text-destructive" />} label={t("inventory.nearExpiry")} value={(counts.d60 + counts.expired).toString()} />
        </div>

        <div className="rounded-md border bg-card p-4">
          <div className="text-sm font-medium text-muted-foreground">{t("inventory.valuation")}</div>
          <div className="text-3xl font-bold mt-1 num">{formatDA(valuation)}</div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b">
          <TabBtn active={tab === "stock"} onClick={() => setTab("stock")}>{t("inventory.title")}</TabBtn>
          <TabBtn active={tab === "expiry"} onClick={() => setTab("expiry")}>
            {t("inventory.expiry")}
            {(counts.expired + counts.d30) > 0 && (
              <span className="ms-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold num">
                {counts.expired + counts.d30}
              </span>
            )}
          </TabBtn>
        </div>

        {tab === "stock" && (
          <div className="rounded-md border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b text-sm font-semibold">{t("inventory.title")}</div>
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-start">{t("common.name")}</th>
                  <th className="px-3 py-2 text-start">{t("products.category")}</th>
                  <th className="px-3 py-2 text-end">{t("products.minStock")}</th>
                  <th className="px-3 py-2 text-end">{t("products.currentStock")}</th>
                  <th className="px-3 py-2 text-end">{t("inventory.valuation")}</th>
                  <th className="px-3 py-2 text-end">{t("common.status")}</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const cat = categories.find((c) => c.id === p.categoryId)?.name ?? "—";
                  const stock = productTotalStock(p);
                  const out = stock <= 0;
                  const critical = !out && stock <= Math.ceil(p.minStock / 2);
                  const low = !out && !critical && stock <= p.minStock;
                  return (
                    <tr key={p.id} className="border-t hover:bg-muted/30">
                      <td className="px-3 py-2 font-medium">{p.name}</td>
                      <td className="px-3 py-2">{cat}</td>
                      <td className="px-3 py-2 text-end num text-muted-foreground">{p.minStock}</td>
                      <td className="px-3 py-2 text-end num font-medium">{stock}</td>
                      <td className="px-3 py-2 text-end num">{formatDA(stock * p.purchasePrice)}</td>
                      <td className="px-3 py-2 text-end">
                        {out ? <Badge tone="destructive">{t("inventory.outOfStock")}</Badge>
                          : critical ? <Badge tone="destructive">{t("inventory.critical")}</Badge>
                          : low ? <Badge tone="warning">{t("inventory.low")}</Badge>
                          : <Badge tone="muted">{t("inventory.ok")}</Badge>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {tab === "expiry" && (
          <div className="space-y-3">
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
              <ExpiryKpi label={t("inventory.expired")} value={counts.expired} tone="critical" />
              <ExpiryKpi label={t("inventory.expiringIn30")} value={counts.d30} tone="critical" />
              <ExpiryKpi label={t("inventory.expiringIn60")} value={counts.d60 - counts.d30} tone="warning" />
              <ExpiryKpi label={t("inventory.expiringIn90")} value={counts.d90 - counts.d60} tone="safe" />
            </div>

            <div className="flex gap-1">
              {([30, 60, 90, "all"] as const).map((f) => (
                <button key={f} onClick={() => setExpiryFilter(f)}
                  className={`h-8 px-3 rounded-md text-xs font-medium border ${expiryFilter === f ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted"}`}>
                  {f === "all" ? t("common.all") : `≤ ${f}j`}
                </button>
              ))}
            </div>

            <div className="rounded-md border bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-start">{t("common.name")}</th>
                    <th className="px-3 py-2 text-start">{t("products.category")}</th>
                    <th className="px-3 py-2 text-start">{t("inventory.expiryDate")}</th>
                    <th className="px-3 py-2 text-end">{t("inventory.daysLeft")}</th>
                    <th className="px-3 py-2 text-end">{t("products.currentStock")}</th>
                    <th className="px-3 py-2 text-end">{t("common.status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpiring.map((r) => {
                    const status = expiryStatus(r.expiryDate);
                    return (
                      <tr key={r.id} className="border-t hover:bg-muted/30">
                        <td className="px-3 py-2">
                          <div className="font-medium">{r.name}</div>
                          {r.variantName && <div className="text-[11px] text-muted-foreground">{r.variantName}</div>}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{r.category}</td>
                        <td className="px-3 py-2 num">{formatDate(r.expiryDate)}</td>
                        <td className={`px-3 py-2 text-end num font-medium ${r.days < 0 ? "text-destructive" : r.days <= 30 ? "text-destructive" : r.days <= 60 ? "text-warning-foreground" : ""}`}>
                          {r.days < 0 ? `${r.days}j` : `${r.days}j`}
                        </td>
                        <td className="px-3 py-2 text-end num">{r.stock}</td>
                        <td className="px-3 py-2 text-end">
                          {status === "expired" ? <Badge tone="destructive">{t("inventory.expired")}</Badge>
                            : status === "critical" ? <Badge tone="destructive">{t("inventory.critical")}</Badge>
                            : status === "warning" ? <Badge tone="warning">{t("inventory.low")}</Badge>
                            : <Badge tone="success">{t("inventory.ok")}</Badge>}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredExpiring.length === 0 && (
                    <tr><td colSpan={6} className="text-center text-muted-foreground py-8">{t("inventory.allClear")}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
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

function ExpiryKpi({ label, value, tone }: { label: string; value: number; tone: "critical" | "warning" | "safe" }) {
  const map = {
    critical: "bg-destructive/10 text-destructive border-destructive/20",
    warning: "bg-warning/15 text-warning-foreground border-warning/30",
    safe: "bg-success/10 text-success border-success/20",
  };
  return (
    <div className={`rounded-md border p-4 ${map[tone]}`}>
      <div className="text-xs font-medium opacity-80">{label}</div>
      <div className="text-2xl font-bold mt-1 num">{value}</div>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`h-9 px-4 text-sm font-medium border-b-2 -mb-px inline-flex items-center ${active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
      {children}
    </button>
  );
}

function Badge({ tone, children }: { tone: "destructive" | "warning" | "muted" | "success"; children: React.ReactNode }) {
  const map = {
    destructive: "bg-destructive text-destructive-foreground",
    warning: "bg-warning text-warning-foreground",
    muted: "bg-muted text-muted-foreground",
    success: "bg-success text-success-foreground",
  };
  return <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${map[tone]}`}>{children}</span>;
}
