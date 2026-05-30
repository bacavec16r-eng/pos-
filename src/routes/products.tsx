import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, ImageIcon, X } from "lucide-react";

import { AppLayout } from "@/components/AppLayout";
import { useStore, type Product } from "@/lib/store";
import { formatDA } from "@/lib/format";

export const Route = createFileRoute("/products")({
  head: () => ({ meta: [{ title: "Produits — Djazair Market POS" }] }),
  component: ProductsPage,
});

const emptyForm: Omit<Product, "id"> = {
  barcode: "",
  name: "",
  sku: "",
  categoryId: "",
  purchasePrice: 0,
  sellingPrice: 0,
  stock: 0,
  minStock: 0,
  image: "",
};

function ProductsPage() {
  const { t } = useTranslation();
  const products = useStore((s) => s.products);
  const categories = useStore((s) => s.categories);
  const addProduct = useStore((s) => s.addProduct);
  const updateProduct = useStore((s) => s.updateProduct);
  const deleteProduct = useStore((s) => s.deleteProduct);

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Omit<Product, "id">>(emptyForm);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.sku.toLowerCase().includes(s) ||
        p.barcode.includes(s)
    );
  }, [products, q]);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyForm, categoryId: categories[0]?.id ?? "" });
    setOpen(true);
  };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ ...p });
    setOpen(true);
  };
  const save = () => {
    if (!form.name.trim()) return toast.error(t("common.name"));
    if (editing) {
      updateProduct(editing.id, form);
      toast.success(t("common.save"));
    } else {
      addProduct(form);
      toast.success(t("common.add"));
    }
    setOpen(false);
  };
  const del = (p: Product) => {
    if (confirm(t("products.deleteConfirm"))) {
      deleteProduct(p.id);
    }
  };

  return (
    <AppLayout title={t("products.title")}>
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("common.search")}
              className="w-full h-10 ps-9 pe-3 rounded-md border bg-background text-sm"
            />
          </div>
          <button
            onClick={openAdd}
            className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-2 hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> {t("products.addProduct")}
          </button>
        </div>

        <div className="rounded-md border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-start"></th>
                <th className="px-3 py-2 text-start">{t("common.name")}</th>
                <th className="px-3 py-2 text-start">{t("products.barcode")}</th>
                <th className="px-3 py-2 text-start">{t("products.sku")}</th>
                <th className="px-3 py-2 text-start">{t("products.category")}</th>
                <th className="px-3 py-2 text-end">{t("products.purchasePrice")}</th>
                <th className="px-3 py-2 text-end">{t("products.sellingPrice")}</th>
                <th className="px-3 py-2 text-end">{t("products.currentStock")}</th>
                <th className="px-3 py-2 text-end">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const cat = categories.find((c) => c.id === p.categoryId)?.name ?? "—";
                return (
                  <tr key={p.id} className="border-t hover:bg-muted/30">
                    <td className="px-3 py-2">
                      <div className="h-9 w-9 rounded bg-muted flex items-center justify-center overflow-hidden">
                        {p.image ? (
                          <img src={p.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-muted-foreground/40" />
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 font-medium">{p.name}</td>
                    <td className="px-3 py-2 num text-xs text-muted-foreground">{p.barcode}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{p.sku}</td>
                    <td className="px-3 py-2">{cat}</td>
                    <td className="px-3 py-2 text-end num">{formatDA(p.purchasePrice)}</td>
                    <td className="px-3 py-2 text-end num font-medium">{formatDA(p.sellingPrice)}</td>
                    <td className="px-3 py-2 text-end num">
                      <span
                        className={
                          p.stock <= 0
                            ? "text-destructive font-medium"
                            : p.stock <= p.minStock
                            ? "text-warning-foreground"
                            : ""
                        }
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-end">
                      <div className="inline-flex gap-1">
                        <button
                          onClick={() => openEdit(p)}
                          className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-muted"
                          title={t("common.edit")}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => del(p)}
                          className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-destructive/10 text-destructive"
                          title={t("common.delete")}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center text-muted-foreground py-8">
                    {t("common.empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-card rounded-lg shadow-lg w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3 border-b flex items-center justify-between">
              <h3 className="font-semibold">
                {editing ? t("products.editProduct") : t("products.addProduct")}
              </h3>
              <button onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3">
              <FormField label={t("common.name")} className="col-span-2">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="inp" />
              </FormField>
              <FormField label={t("products.barcode")}>
                <input value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} className="inp num" />
              </FormField>
              <FormField label={t("products.sku")}>
                <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="inp" />
              </FormField>
              <FormField label={t("products.category")}>
                <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="inp">
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </FormField>
              <FormField label={t("products.image")}>
                <input value={form.image ?? ""} onChange={(e) => setForm({ ...form, image: e.target.value })} className="inp" placeholder="https://…" />
              </FormField>
              <FormField label={t("products.purchasePrice")}>
                <input type="number" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: +e.target.value })} className="inp num" />
              </FormField>
              <FormField label={t("products.sellingPrice")}>
                <input type="number" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: +e.target.value })} className="inp num" />
              </FormField>
              <FormField label={t("products.currentStock")}>
                <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: +e.target.value })} className="inp num" />
              </FormField>
              <FormField label={t("products.minStock")}>
                <input type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: +e.target.value })} className="inp num" />
              </FormField>
            </div>
            <div className="px-5 py-3 border-t flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="h-9 px-4 rounded-md border text-sm hover:bg-muted">
                {t("common.cancel")}
              </button>
              <button onClick={save} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
                {t("common.save")}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`.inp{height:2.25rem;padding:0 .75rem;border-radius:6px;border:1px solid var(--color-input);background:var(--color-background);font-size:.875rem;width:100%}`}</style>
    </AppLayout>
  );
}

function FormField({
  label, children, className,
}: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="block text-xs font-medium text-muted-foreground mb-1">{label}</span>
      {children}
    </label>
  );
}
