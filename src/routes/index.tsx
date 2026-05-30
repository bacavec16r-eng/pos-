import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  TrendingUp, Calendar, AlertTriangle, Wallet, ScanBarcode, ArrowRight,
} from "lucide-react";

import { AppLayout } from "@/components/AppLayout";
import { useStore, debtRemaining } from "@/lib/store";
import { formatDA, todayKey, monthKey } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Tableau de bord — Djazair Market POS" }] }),
  component: Dashboard,
});

const PIE_COLORS = ["#0ea5b7", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#0284c7"];

function Dashboard() {
  const { t } = useTranslation();
  const sales = useStore((s) => s.sales);
  const products = useStore((s) => s.products);
  const categories = useStore((s) => s.categories);
  const debts = useStore((s) => s.debts);

  const today = todayKey();
  const month = monthKey();

  const salesToday = sales
    .filter((s) => s.dayKey === today)
    .reduce((a, s) => a + s.total, 0);
  const salesMonth = sales
    .filter((s) => s.dayKey.startsWith(month))
    .reduce((a, s) => a + s.total, 0);
  const lowStock = products.filter((p) => p.stock <= p.minStock).length;
  const unpaid = debts.reduce((a, d) => a + debtRemaining(d), 0);

  // Daily 7-day revenue
  const days: { day: string; total: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = todayKey(d);
    const total = sales.filter((s) => s.dayKey === key).reduce((a, s) => a + s.total, 0);
    days.push({
      day: d.toLocaleDateString(undefined, { weekday: "short" }),
      total,
    });
  }

  // Top products
  const counter = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const s of sales) {
    for (const l of s.lines) {
      const ex = counter.get(l.productId);
      if (ex) {
        ex.qty += l.quantity;
        ex.revenue += l.quantity * l.unitPrice;
      } else {
        counter.set(l.productId, {
          name: l.name,
          qty: l.quantity,
          revenue: l.quantity * l.unitPrice,
        });
      }
    }
  }
  const topProducts = [...counter.values()].sort((a, b) => b.qty - a.qty).slice(0, 6);

  // Category split
  const catRevenue = new Map<string, number>();
  for (const s of sales) {
    for (const l of s.lines) {
      const p = products.find((x) => x.id === l.productId);
      const cid = p?.categoryId ?? "unknown";
      catRevenue.set(cid, (catRevenue.get(cid) ?? 0) + l.quantity * l.unitPrice);
    }
  }
  const catData = [...catRevenue.entries()].map(([cid, v]) => ({
    name: categories.find((c) => c.id === cid)?.name ?? "—",
    value: v,
  }));

  return (
    <AppLayout title={t("dashboard.title")}>
      <div className="p-4 space-y-4">
        {/* Quick POS CTA */}
        <Link
          to="/pos"
          className="flex items-center justify-between rounded-md border bg-card p-4 hover:border-primary transition"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-primary text-primary-foreground flex items-center justify-center">
              <ScanBarcode className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold">{t("nav.pos")}</div>
              <div className="text-xs text-muted-foreground">
                {t("pos.searchPlaceholder")}
              </div>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground rtl-flip" />
        </Link>

        {/* KPI cards */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <Kpi icon={<TrendingUp className="h-4 w-4" />} label={t("dashboard.salesToday")} value={formatDA(salesToday)} tone="success" />
          <Kpi icon={<Calendar className="h-4 w-4" />} label={t("dashboard.salesMonth")} value={formatDA(salesMonth)} tone="primary" />
          <Kpi icon={<AlertTriangle className="h-4 w-4" />} label={t("dashboard.lowStockCount")} value={lowStock.toString()} tone="warning" />
          <Kpi icon={<Wallet className="h-4 w-4" />} label={t("dashboard.unpaidDebts")} value={formatDA(unpaid)} tone="destructive" />
        </div>

        {/* Charts */}
        <div className="grid gap-3 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-md border bg-card p-4">
            <div className="text-sm font-semibold mb-3">{t("dashboard.dailyRevenue")}</div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={days}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 0% / 0.06)" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(v: any) => formatDA(Number(v))}
                    contentStyle={{ borderRadius: 6, fontSize: 12 }}
                  />
                  <Bar dataKey="total" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-md border bg-card p-4">
            <div className="text-sm font-semibold mb-3">{t("dashboard.bestCategories")}</div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={catData} dataKey="value" nameKey="name" outerRadius={80}>
                    {catData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => formatDA(Number(v))} contentStyle={{ borderRadius: 6, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top products */}
        <div className="rounded-md border bg-card">
          <div className="px-4 py-3 border-b text-sm font-semibold">
            {t("dashboard.topProducts")}
          </div>
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-muted/40">
              <tr>
                <th className="text-start font-medium px-4 py-2">{t("common.name")}</th>
                <th className="text-end font-medium px-4 py-2">{t("common.quantity")}</th>
                <th className="text-end font-medium px-4 py-2">{t("common.total")}</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center text-muted-foreground py-6">
                    {t("common.empty")}
                  </td>
                </tr>
              )}
              {topProducts.map((p, i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-2">{p.name}</td>
                  <td className="px-4 py-2 text-end num">{p.qty}</td>
                  <td className="px-4 py-2 text-end num font-medium">{formatDA(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}

function Kpi({
  icon, label, value, tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "primary" | "success" | "warning" | "destructive";
}) {
  const toneMap = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning-foreground",
    destructive: "bg-destructive/10 text-destructive",
  };
  return (
    <div className="rounded-md border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
        <div className={`h-7 w-7 rounded inline-flex items-center justify-center ${toneMap[tone]}`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold mt-2 num">{value}</div>
    </div>
  );
}
