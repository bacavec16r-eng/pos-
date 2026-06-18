import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar,
} from "recharts";

import { AppLayout } from "@/components/AppLayout";
import { useStore, debtRemaining } from "@/lib/store";
import { formatDA, todayKey, monthKey } from "@/lib/format";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Rapports — Belle Beauté POS" }] }),
  component: ReportsPage,
});

function ReportsPage() {
  const { t } = useTranslation();
  const sales = useStore((s) => s.sales);
  const products = useStore((s) => s.products);
  const categories = useStore((s) => s.categories);
  const debts = useStore((s) => s.debts);

  const daily = useMemo(() => {
    const out: { day: string; total: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = todayKey(d);
      const total = sales.filter((s) => s.dayKey === key).reduce((a, s) => a + s.total, 0);
      out.push({ day: `${d.getDate()}/${d.getMonth() + 1}`, total });
    }
    return out;
  }, [sales]);

  const monthly = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of sales) {
      const m = s.dayKey.slice(0, 7);
      map.set(m, (map.get(m) ?? 0) + s.total);
    }
    return [...map.entries()].sort().map(([m, total]) => ({ month: m, total }));
  }, [sales]);

  const topProducts = useMemo(() => {
    const c = new Map<string, { name: string; qty: number; revenue: number }>();
    for (const s of sales) for (const l of s.lines) {
      const ex = c.get(l.productId);
      if (ex) { ex.qty += l.quantity; ex.revenue += l.quantity * l.unitPrice; }
      else c.set(l.productId, { name: l.name, qty: l.quantity, revenue: l.quantity * l.unitPrice });
    }
    return [...c.values()].sort((a, b) => b.qty - a.qty).slice(0, 10);
  }, [sales]);

  const bestCats = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of sales) for (const l of s.lines) {
      const p = products.find((x) => x.id === l.productId);
      const cid = p?.categoryId ?? "—";
      m.set(cid, (m.get(cid) ?? 0) + l.unitPrice * l.quantity);
    }
    return [...m.entries()].map(([cid, v]) => ({
      name: categories.find((c) => c.id === cid)?.name ?? "—",
      total: v,
    })).sort((a, b) => b.total - a.total);
  }, [sales, products, categories]);

  const lowStock = products.filter((p) => p.stock <= p.minStock);

  return (
    <AppLayout title={t("reports.title")}>
      <div className="p-4 space-y-4">
        <Card title={t("reports.dailySales") + " (30j)"}>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 0% / 0.06)" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: any) => formatDA(Number(v))} contentStyle={{ borderRadius: 6, fontSize: 12 }} />
                <Line type="monotone" dataKey="total" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title={t("reports.monthlySales")}>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 0% / 0.06)" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: any) => formatDA(Number(v))} contentStyle={{ borderRadius: 6, fontSize: 12 }} />
                <Bar dataKey="total" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="grid lg:grid-cols-2 gap-4">
          <Card title={t("reports.mostSold")}>
            <Table
              headers={[t("common.name"), t("common.quantity"), t("common.total")]}
              rows={topProducts.map((p) => [p.name, p.qty.toString(), formatDA(p.revenue)])}
            />
          </Card>
          <Card title={t("reports.bestCategories")}>
            <Table
              headers={[t("common.name"), t("common.total")]}
              rows={bestCats.map((c) => [c.name, formatDA(c.total)])}
            />
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <Card title={t("inventory.lowStock")}>
            <Table
              headers={[t("common.name"), t("products.currentStock"), t("products.minStock")]}
              rows={lowStock.map((p) => [p.name, p.stock.toString(), p.minStock.toString()])}
            />
          </Card>
          <Card title={t("customers.title")}>
            <Table
              headers={[t("customers.customerName"), t("customers.remaining")]}
              rows={debts
                .filter((d) => debtRemaining(d) > 0)
                .map((d) => [d.customerName, formatDA(debtRemaining(d))])}
            />
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border bg-card">
      <div className="px-4 py-3 border-b text-sm font-semibold">{title}</div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-xs text-muted-foreground border-b">
          {headers.map((h, i) => (
            <th key={i} className={`py-2 ${i === 0 ? "text-start" : "text-end"} font-medium`}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr><td colSpan={headers.length} className="py-6 text-center text-muted-foreground">—</td></tr>
        )}
        {rows.map((r, i) => (
          <tr key={i} className="border-b last:border-b-0">
            {r.map((c, j) => (
              <td key={j} className={`py-2 ${j === 0 ? "text-start" : "text-end num"} ${j === r.length - 1 ? "font-medium" : ""}`}>{c}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
