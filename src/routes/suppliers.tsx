import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Truck, Phone, Mail, MapPin, X, Wallet } from "lucide-react";

import { AppLayout } from "@/components/AppLayout";
import { useStore, type Supplier } from "@/lib/store";
import { formatDA } from "@/lib/format";

export const Route = createFileRoute("/suppliers")({
  head: () => ({ meta: [{ title: "Fournisseurs — Belle Beauté POS" }] }),
  component: SuppliersPage,
});

const emptyForm: Omit<Supplier, "id" | "createdAt"> = {
  name: "", contact: "", phone: "", email: "", address: "", notes: "", outstanding: 0,
};

function SuppliersPage() {
  const { t } = useTranslation();
  const suppliers = useStore((s) => s.suppliers);
  const products = useStore((s) => s.products);
  const addSupplier = useStore((s) => s.addSupplier);
  const updateSupplier = useStore((s) => s.updateSupplier);
  const deleteSupplier = useStore((s) => s.deleteSupplier);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState(emptyForm);

  const productCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of products) {
      if (p.supplierId) m.set(p.supplierId, (m.get(p.supplierId) ?? 0) + 1);
    }
    return m;
  }, [products]);

  const totalOutstanding = suppliers.reduce((a, s) => a + (s.outstanding ?? 0), 0);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (s: Supplier) => {
    setEditing(s);
    setForm({
      name: s.name, contact: s.contact ?? "", phone: s.phone ?? "",
      email: s.email ?? "", address: s.address ?? "", notes: s.notes ?? "",
      outstanding: s.outstanding ?? 0,
    });
    setOpen(true);
  };
  const save = () => {
    if (!form.name.trim()) return toast.error(t("suppliers.name"));
    if (editing) { updateSupplier(editing.id, form); toast.success(t("common.save")); }
    else { addSupplier(form); toast.success(t("common.add")); }
    setOpen(false);
  };
  const del = (s: Supplier) => {
    if (confirm(t("suppliers.deleteConfirm"))) deleteSupplier(s.id);
  };

  return (
    <AppLayout title={t("suppliers.title")}>
      <div className="p-4 space-y-4">
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
          <Kpi icon={<Truck className="h-4 w-4" />} label={t("suppliers.suppliers")} value={suppliers.length.toString()} />
          <Kpi icon={<Wallet className="h-4 w-4 text-destructive" />} label={t("suppliers.totalOutstanding")} value={formatDA(totalOutstanding)} />
          <div className="rounded-md border bg-card p-4 flex items-center justify-end">
            <button onClick={openAdd} className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-2 hover:opacity-90">
              <Plus className="h-4 w-4" /> {t("suppliers.add")}
            </button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {suppliers.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-12 border border-dashed rounded-md">
              {t("suppliers.empty")}
            </div>
          )}
          {suppliers.map((s) => {
            const count = productCounts.get(s.id) ?? 0;
            const owing = s.outstanding ?? 0;
            return (
              <div key={s.id} className="rounded-lg border bg-card p-4 flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{s.name}</div>
                      {s.contact && <div className="text-xs text-muted-foreground truncate">{s.contact}</div>}
                    </div>
                  </div>
                  <div className="inline-flex gap-1">
                    <button onClick={() => openEdit(s)} className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-muted" title={t("common.edit")}>
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => del(s)} className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-destructive/10 text-destructive" title={t("common.delete")}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  {s.phone && <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> <span className="num">{s.phone}</span></div>}
                  {s.email && <div className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {s.email}</div>}
                  {s.address && <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {s.address}</div>}
                </div>
                <div className="flex items-center justify-between pt-2 mt-1 border-t">
                  <span className="text-xs text-muted-foreground">{t("suppliers.products")}: <span className="font-semibold text-foreground num">{count}</span></span>
                  <span className={`text-sm font-bold num ${owing > 0 ? "text-destructive" : "text-success"}`}>{formatDA(owing)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-card rounded-lg shadow-lg w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-3 border-b flex items-center justify-between">
              <h3 className="font-semibold">{editing ? t("suppliers.edit") : t("suppliers.add")}</h3>
              <button onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3">
              <Field label={t("suppliers.name")} className="col-span-2">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="inp" />
              </Field>
              <Field label={t("suppliers.contact")}>
                <input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} className="inp" />
              </Field>
              <Field label={t("suppliers.phone")}>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="inp num" />
              </Field>
              <Field label={t("suppliers.email")} className="col-span-2">
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="inp" />
              </Field>
              <Field label={t("suppliers.address")} className="col-span-2">
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="inp" />
              </Field>
              <Field label={t("suppliers.outstanding")}>
                <input type="number" value={form.outstanding} onChange={(e) => setForm({ ...form, outstanding: +e.target.value })} className="inp num" />
              </Field>
              <Field label={t("suppliers.notes")} className="col-span-2">
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="inp h-20 py-2" />
              </Field>
            </div>
            <div className="px-5 py-3 border-t flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="h-9 px-4 rounded-md border text-sm hover:bg-muted">{t("common.cancel")}</button>
              <button onClick={save} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">{t("common.save")}</button>
            </div>
          </div>
        </div>
      )}

      <style>{`.inp{height:2.25rem;padding:0 .75rem;border-radius:6px;border:1px solid var(--color-input);background:var(--color-background);font-size:.875rem;width:100%}`}</style>
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

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="block text-xs font-medium text-muted-foreground mb-1">{label}</span>
      {children}
    </label>
  );
}
