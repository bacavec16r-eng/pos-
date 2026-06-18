import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Wallet, ChevronDown, ChevronRight, Plus } from "lucide-react";

import { AppLayout } from "@/components/AppLayout";
import { useStore, debtRemaining, type Debt } from "@/lib/store";
import { formatDA } from "@/lib/format";

export const Route = createFileRoute("/customers")({
  head: () => ({ meta: [{ title: "Crédits clients — Belle Beauté POS" }] }),
  component: CustomersPage,
});

function CustomersPage() {
  const { t } = useTranslation();
  const debts = useStore((s) => s.debts);
  const addDebtPayment = useStore((s) => s.addDebtPayment);
  const [open, setOpen] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState<Record<string, string>>({});

  const totalOutstanding = debts.reduce((a, d) => a + debtRemaining(d), 0);

  return (
    <AppLayout title={t("customers.title")}>
      <div className="p-4 space-y-4">
        <div className="rounded-md border bg-card p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded bg-destructive/10 text-destructive inline-flex items-center justify-center">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">{t("dashboard.unpaidDebts")}</div>
            <div className="text-2xl font-bold num">{formatDA(totalOutstanding)}</div>
          </div>
        </div>

        {debts.length === 0 ? (
          <div className="rounded-md border bg-card p-8 text-center text-sm text-muted-foreground">
            {t("customers.noDebts")}
          </div>
        ) : (
          <div className="rounded-md border bg-card overflow-hidden">
            {debts.map((d) => {
              const isOpen = open === d.id;
              const paid = d.payments.reduce((a, p) => a + p.amount, 0);
              const remaining = d.total - paid;
              return (
                <div key={d.id} className="border-b last:border-b-0">
                  <button
                    onClick={() => setOpen(isOpen ? null : d.id)}
                    className="w-full text-start px-4 py-3 hover:bg-muted/30 flex items-center gap-3"
                  >
                    {isOpen ? <ChevronDown className="h-4 w-4 rtl-flip" /> : <ChevronRight className="h-4 w-4 rtl-flip" />}
                    <div className="flex-1">
                      <div className="font-semibold">{d.customerName}</div>
                      <div className="text-xs text-muted-foreground num">{d.customerPhone || "—"}</div>
                    </div>
                    <div className="hidden sm:block text-end">
                      <div className="text-[11px] text-muted-foreground">{t("customers.totalDebt")}</div>
                      <div className="text-sm num font-medium">{formatDA(d.total)}</div>
                    </div>
                    <div className="hidden sm:block text-end">
                      <div className="text-[11px] text-muted-foreground">{t("customers.paid")}</div>
                      <div className="text-sm num text-success">{formatDA(paid)}</div>
                    </div>
                    <div className="text-end">
                      <div className="text-[11px] text-muted-foreground">{t("customers.remaining")}</div>
                      <div className={`text-base font-bold num ${remaining <= 0 ? "text-success" : "text-destructive"}`}>
                        {formatDA(remaining)}
                      </div>
                    </div>
                  </button>

                  {isOpen && (
                    <DebtDetails
                      debt={d}
                      payAmount={payAmount[d.id] ?? ""}
                      setPayAmount={(v) => setPayAmount({ ...payAmount, [d.id]: v })}
                      onPay={() => {
                        const amt = parseFloat(payAmount[d.id] ?? "");
                        if (!amt || amt <= 0) return toast.error(t("customers.paymentAmount"));
                        addDebtPayment(d.id, Math.min(amt, remaining));
                        setPayAmount({ ...payAmount, [d.id]: "" });
                        toast.success(t("customers.addPayment"));
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function DebtDetails({
  debt, payAmount, setPayAmount, onPay,
}: {
  debt: Debt;
  payAmount: string;
  setPayAmount: (v: string) => void;
  onPay: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="px-4 pb-4 grid lg:grid-cols-2 gap-4 bg-muted/20 border-t">
      <div>
        <div className="text-xs font-semibold text-muted-foreground mb-2 mt-3">
          {t("customers.productsTaken")}
        </div>
        <ul className="rounded border bg-card divide-y text-sm">
          {debt.lines.map((l, i) => (
            <li key={i} className="px-3 py-2 flex justify-between">
              <span>{l.name} <span className="text-muted-foreground">× {l.quantity}</span></span>
              <span className="num font-medium">{formatDA(l.unitPrice * l.quantity)}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <div className="text-xs font-semibold text-muted-foreground mb-2 mt-3">
          {t("customers.history")}
        </div>
        <ul className="rounded border bg-card divide-y text-sm">
          {debt.payments.length === 0 && (
            <li className="px-3 py-2 text-muted-foreground">{t("common.empty")}</li>
          )}
          {debt.payments.map((p) => (
            <li key={p.id} className="px-3 py-2 flex justify-between">
              <span className="text-muted-foreground num">
                {new Date(p.date).toLocaleString()}
              </span>
              <span className="num font-medium text-success">{formatDA(p.amount)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex gap-2">
          <input
            type="number"
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
            placeholder={t("customers.paymentAmount")}
            className="flex-1 h-10 px-3 rounded-md border bg-background text-sm num"
          />
          <button
            onClick={onPay}
            className="h-10 px-4 rounded-md bg-success text-success-foreground text-sm font-medium inline-flex items-center gap-2 hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> {t("customers.addPayment")}
          </button>
        </div>
      </div>
    </div>
  );
}
