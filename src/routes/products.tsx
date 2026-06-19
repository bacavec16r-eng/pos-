import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, ImageIcon, X, Sparkles } from "lucide-react";

import { AppLayout } from "@/components/AppLayout";
import { useStore, productTotalStock, type Product, type ProductVariant } from "@/lib/store";
import { formatDA, uid, formatDate, expiryStatus } from "@/lib/format";

export const Route = createFileRoute("/products")({
  head: () => ({ meta: [{ title: "Produits — Belle Beauté POS" }] }),
  component: ProductsPage,
});

const emptyForm: Omit<Product, "id"> = {
  barcode: "", name: "", sku: "", categoryId: "",
  brand: "", shade: "", volume: "",
  purchasePrice: 0, sellingPrice: 0, stock: 0, minStock: 0,
  image: "", images: [], expiryDate: "", supplierId: "", variants: undefined,
};

function ProductsPage() {
  const { t } = useTranslation();
  const products = useStore((s) => s.products);
  const categories = useStore((s) => s.categories);
  const suppliers = useStore((s) => s.suppliers);
  const addProduct = useStore((s) => s.addProduct);
  const updateProduct = useStore((s) => s.updateProduct);
  const deleteProduct = useStore((s) => s.deleteProduct);

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Omit<Product, "id">>(emptyForm);
  const [galleryText, setGalleryText] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.sku.toLowerCase().includes(s) ||
        (p.brand?.toLowerCase().includes(s) ?? false) ||
        p.barcode.includes(s)
    );
  }, [products, q]);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyForm, categoryId: categories[0]?.id ?? "" });
    setGalleryText("");
    setOpen(true);
  };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ ...p, images: p.images ?? [], variants: p.variants ? [...p.variants] : undefined });
    setGalleryText((p.images ?? []).join("\n"));
    setOpen(true);
  };
  const save = () => {
    if (!form.name.trim()) return toast.error(t("common.name"));
    const images = galleryText.split("\n").map((x) => x.trim()).filter(Boolean);
    const payload: Omit<Product, "id"> = { ...form, images };
    if (payload.variants && payload.variants.length > 0) {
      payload.stock = payload.variants.reduce((a, v) => a + (v.stock || 0), 0);
    }
    if (editing) {
      updateProduct(editing.id, payload);
      toast.success(t("common.save"));
    } else {
      addProduct(payload);
      toast.success(t("common.add"));
    }
    setOpen(false);
  };
  const del = (p: Product) => {
    if (confirm(t("products.deleteConfirm"))) deleteProduct(p.id);
  };

  // Variant editor helpers
  const addVariant = () => {
    const v: ProductVariant = {
      id: uid("v"), name: "", sku: "", barcode: "", shade: "",
      stock: 0, minStock: 0,
    };
    setForm((f) => ({ ...f, variants: [...(f.variants ?? []), v] }));
  };
  const updateVariant = (id: string, patch: Partial<ProductVariant>) => {
    setForm((f) => ({
      ...f,
      variants: (f.variants ?? []).map((v) => (v.id === id ? { ...v, ...patch } : v)),
    }));
  };
  const removeVariant = (id: string) => {
    setForm((f) => ({ ...f, variants: (f.variants ?? []).filter((v) => v.id !== id) }));
  };

  return (
    <AppLayout title={t("products.title")}>
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("common.search")}
              className="w-full h-10 ps-9 pe-3 rounded-md border bg-background text-sm" />
          </div>
          <button onClick={openAdd}
            className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-2 hover:opacity-90">
            <Plus className="h-4 w-4" /> {t("products.addProduct")}
          </button>
        </div>

        <div className="rounded-md border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-start"></th>
                <th className="px-3 py-2 text-start">{t("common.name")}</th>
                <th className="px-3 py-2 text-start">{t("products.brand")}</th>
                <th className="px-3 py-2 text-start">{t("products.supplier")}</th>
                <th className="px-3 py-2 text-start">{t("products.category")}</th>
                <th className="px-3 py-2 text-end">{t("products.sellingPrice")}</th>
                <th className="px-3 py-2 text-end">{t("products.currentStock")}</th>
                <th className="px-3 py-2 text-start">{t("products.expiryDate")}</th>
                <th className="px-3 py-2 text-end">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const cat = categories.find((c) => c.id === p.categoryId)?.name ?? "—";
                const sup = suppliers.find((s) => s.id === p.supplierId)?.name ?? "—";
                const total = productTotalStock(p);
                const exp = expiryStatus(p.expiryDate);
                const expClass =
                  exp === "expired" || exp === "critical" ? "text-destructive font-medium"
                  : exp === "warning" ? "text-warning-foreground" : "";
                return (
                  <tr key={p.id} className="border-t hover:bg-muted/30">
                    <td className="px-3 py-2">
                      <div className="h-9 w-9 rounded bg-muted flex items-center justify-center overflow-hidden">
                        {p.image ? <img src={p.image} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="h-4 w-4 text-muted-foreground/40" />}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-medium flex items-center gap-1.5">
                        {p.name}
                        {p.variants && p.variants.length > 0 && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary inline-flex items-center gap-0.5">
                            <Sparkles className="h-2.5 w-2.5" /> {p.variants.length}
                          </span>
                        )}
                      </div>
                      {p.shade && <div className="text-[11px] text-muted-foreground">{p.shade}{p.volume ? ` · ${p.volume}` : ""}</div>}
                    </td>
                    <td className="px-3 py-2">
                      {p.brand ? <span className="brand-badge">{p.brand}</span> : <span className="text-muted-foreground text-xs">—</span>}
                    </td>
                    <td className="px-3 py-2 text-xs">{sup}</td>
                    <td className="px-3 py-2">{cat}</td>
                    <td className="px-3 py-2 text-end num font-medium">{formatDA(p.sellingPrice)}</td>
                    <td className="px-3 py-2 text-end num">
                      <span className={total <= 0 ? "text-destructive font-medium" : total <= p.minStock ? "text-warning-foreground" : ""}>{total}</span>
                    </td>
                    <td className={`px-3 py-2 text-xs ${expClass}`}>{p.expiryDate ? formatDate(p.expiryDate) : "—"}</td>
                    <td className="px-3 py-2 text-end">
                      <div className="inline-flex gap-1">
                        <button onClick={() => openEdit(p)} className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-muted" title={t("common.edit")}>
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => del(p)} className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-destructive/10 text-destructive" title={t("common.delete")}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="text-center text-muted-foreground py-8">{t("common.empty")}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-auto" onClick={() => setOpen(false)}>
          <div className="bg-card rounded-lg shadow-lg w-full max-w-3xl my-8" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-3 border-b flex items-center justify-between sticky top-0 bg-card rounded-t-lg">
              <h3 className="font-semibold">{editing ? t("products.editProduct") : t("products.addProduct")}</h3>
              <button onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5 space-y-5 max-h-[75vh] overflow-auto">
              <div className="grid grid-cols-2 gap-3">
                <FormField label={t("common.name")} className="col-span-2">
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="inp" />
                </FormField>
                <FormField label={t("products.brand")}>
                  <input value={form.brand ?? ""} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="inp" />
                </FormField>
                <FormField label={t("products.category")}>
                  <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="inp">
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </FormField>
                <FormField label={t("products.supplier")}>
                  <select value={form.supplierId ?? ""} onChange={(e) => setForm({ ...form, supplierId: e.target.value || undefined })} className="inp">
                    <option value="">{t("products.noSupplier")}</option>
                    {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </FormField>
                <FormField label={t("products.expiryDate")}>
                  <input type="date" value={form.expiryDate ?? ""} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} className="inp" />
                </FormField>
                <FormField label={t("products.shade")}>
                  <input value={form.shade ?? ""} onChange={(e) => setForm({ ...form, shade: e.target.value })} className="inp" />
                </FormField>
                <FormField label={t("products.volume")}>
                  <input value={form.volume ?? ""} onChange={(e) => setForm({ ...form, volume: e.target.value })} className="inp" placeholder="ex. 50ml" />
                </FormField>
                <FormField label={t("products.barcode")}>
                  <input value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} className="inp num" />
                </FormField>
                <FormField label={t("products.sku")}>
                  <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="inp" />
                </FormField>
                <FormField label={t("products.image")} className="col-span-2">
                  <input value={form.image ?? ""} onChange={(e) => setForm({ ...form, image: e.target.value })} className="inp" placeholder="https://…" />
                </FormField>
                <FormField label={t("products.gallery")} className="col-span-2">
                  <textarea value={galleryText} onChange={(e) => setGalleryText(e.target.value)}
                    className="inp h-20 py-2 resize-y" placeholder={"https://…\nhttps://…"} />
                  {galleryText.trim() && (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {galleryText.split("\n").map((x) => x.trim()).filter(Boolean).map((url, i) => (
                        <img key={i} src={url} alt="" className="h-12 w-12 rounded object-cover border" onError={(e) => ((e.currentTarget.style.display = "none"))} />
                      ))}
                    </div>
                  )}
                </FormField>
                <FormField label={t("products.purchasePrice")}>
                  <input type="number" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: +e.target.value })} className="inp num" />
                </FormField>
                <FormField label={t("products.sellingPrice")}>
                  <input type="number" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: +e.target.value })} className="inp num" />
                </FormField>
                <FormField label={t("products.currentStock") + (form.variants && form.variants.length > 0 ? " (auto)" : "")}>
                  <input type="number" disabled={!!(form.variants && form.variants.length > 0)} value={form.stock} onChange={(e) => setForm({ ...form, stock: +e.target.value })} className="inp num disabled:opacity-50" />
                </FormField>
                <FormField label={t("products.minStock")}>
                  <input type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: +e.target.value })} className="inp num" />
                </FormField>
              </div>

              {/* Variants editor */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" /> {t("products.variants")}
                  </div>
                  <button type="button" onClick={addVariant}
                    className="text-xs h-8 px-3 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 inline-flex items-center gap-1">
                    <Plus className="h-3.5 w-3.5" /> {t("products.addVariant")}
                  </button>
                </div>
                {!form.variants || form.variants.length === 0 ? (
                  <div className="text-xs text-muted-foreground text-center py-4 border border-dashed rounded">
                    {t("common.empty")}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {form.variants.map((v) => (
                      <div key={v.id} className="grid grid-cols-12 gap-2 items-start p-2 rounded border bg-muted/20">
                        <input className="inp col-span-3" placeholder={t("products.variantName")} value={v.name} onChange={(e) => updateVariant(v.id, { name: e.target.value })} />
                        <input className="inp col-span-2 num" placeholder={t("products.barcode")} value={v.barcode} onChange={(e) => updateVariant(v.id, { barcode: e.target.value })} />
                        <input className="inp col-span-2" placeholder={t("products.sku")} value={v.sku} onChange={(e) => updateVariant(v.id, { sku: e.target.value })} />
                        <input className="inp col-span-2 num" type="number" placeholder={t("products.sellingPrice")} value={v.sellingPrice ?? ""} onChange={(e) => updateVariant(v.id, { sellingPrice: e.target.value ? +e.target.value : undefined })} />
                        <input className="inp col-span-1 num" type="number" placeholder="Stock" value={v.stock} onChange={(e) => updateVariant(v.id, { stock: +e.target.value })} />
                        <input className="inp col-span-1 num" type="number" placeholder="Min" value={v.minStock} onChange={(e) => updateVariant(v.id, { minStock: +e.target.value })} />
                        <button type="button" onClick={() => removeVariant(v.id)} className="col-span-1 h-9 inline-flex items-center justify-center rounded hover:bg-destructive/10 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <input className="inp col-span-6" placeholder="Image URL" value={v.image ?? ""} onChange={(e) => updateVariant(v.id, { image: e.target.value })} />
                        <input className="inp col-span-3" placeholder={t("products.shade")} value={v.shade ?? ""} onChange={(e) => updateVariant(v.id, { shade: e.target.value })} />
                        <input className="inp col-span-3" type="date" value={v.expiryDate ?? ""} onChange={(e) => updateVariant(v.id, { expiryDate: e.target.value })} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="px-5 py-3 border-t flex justify-end gap-2 sticky bottom-0 bg-card rounded-b-lg">
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

function FormField({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="block text-xs font-medium text-muted-foreground mb-1">{label}</span>
      {children}
    </label>
  );
}
