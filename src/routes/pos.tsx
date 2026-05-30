import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Search, ScanBarcode, Plus, Minus, X, Trash2, CreditCard,
  Receipt, Printer, ImageIcon,
} from "lucide-react";

import { AppLayout } from "@/components/AppLayout";
import { useStore, type CartLine, type Product } from "@/lib/store";
import { formatDA } from "@/lib/format";

export const Route = createFileRoute("/pos")({
  head: () => ({ meta: [{ title: "Caisse — Djazair Market POS" }] }),
  component: POSPage,
});

function POSPage() {
  const { t } = useTranslation();
  const products = useStore((s) => s.products);
  const categories = useStore((s) => s.categories);
  const findByBarcode = useStore((s) => s.findByBarcode);
  const recordSale = useStore((s) => s.recordSale);
  const recordCredit = useStore((s) => s.recordCredit);

  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<string>("all");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [creditOpen, setCreditOpen] = useState(false);
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (activeCat !== "all" && p.categoryId !== activeCat) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.includes(q)
      );
    });
  }, [products, search, activeCat]);

  const addToCart = (p: Product, qty = 1) => {
    if (p.stock <= 0) {
      toast.error(`${p.name} — ${t("inventory.outOfStock")}`);
      return;
    }
    setCart((prev) => {
      const ex = prev.find((l) => l.productId === p.id);
      if (ex) {
        return prev.map((l) =>
          l.productId === p.id
            ? { ...l, quantity: Math.min(l.quantity + qty, p.stock) }
            : l
        );
      }
      return [
        ...prev,
        {
          productId: p.id,
          name: p.name,
          unitPrice: p.sellingPrice,
          quantity: qty,
          image: p.image,
        },
      ];
    });
  };

  const handleSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const q = search.trim();
      if (!q) return;
      // Treat numeric input >= 6 digits as barcode
      if (/^\d{6,}$/.test(q)) {
        const p = findByBarcode(q);
        if (p) {
          addToCart(p);
          setSearch("");
          return;
        }
        toast.error(t("pos.notFound"));
        return;
      }
      if (filtered.length > 0) {
        addToCart(filtered[0]);
        setSearch("");
      } else {
        toast.error(t("pos.notFound"));
      }
    }
  };

  const setQty = (id: string, qty: number) => {
    if (qty <= 0) return setCart((c) => c.filter((l) => l.productId !== id));
    const p = products.find((x) => x.id === id);
    const max = p ? p.stock : qty;
    setCart((c) =>
      c.map((l) => (l.productId === id ? { ...l, quantity: Math.min(qty, max) } : l))
    );
  };
  const remove = (id: string) => setCart((c) => c.filter((l) => l.productId !== id));
  const clear = () => setCart([]);

  const subtotal = cart.reduce((a, l) => a + l.unitPrice * l.quantity, 0);
  const count = cart.reduce((a, l) => a + l.quantity, 0);

  const onComplete = () => {
    if (cart.length === 0) return;
    recordSale(cart);
    toast.success(t("pos.saleCompleted"), { description: formatDA(subtotal) });
    setCart([]);
    searchRef.current?.focus();
  };

  const onSaveCredit = () => {
    if (cart.length === 0) return;
    setCreditOpen(true);
  };

  const confirmCredit = () => {
    if (!custName.trim()) {
      toast.error(t("customers.customerName"));
      return;
    }
    recordCredit(custName.trim(), custPhone.trim(), cart);
    toast.success(t("pos.creditSaved"), {
      description: `${custName} — ${formatDA(subtotal)}`,
    });
    setCart([]);
    setCustName("");
    setCustPhone("");
    setCreditOpen(false);
    searchRef.current?.focus();
  };

  const onPrint = () => {
    if (cart.length === 0) return;
    window.print();
  };

  return (
    <AppLayout title={t("pos.title")}>
      <div className="flex h-full">
        {/* LEFT: products */}
        <section className="flex-1 min-w-0 flex flex-col border-r">
          <div className="p-3 border-b bg-card flex gap-2 items-center">
            <div className="relative flex-1">
              <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                ref={searchRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchKey}
                placeholder={t("pos.searchPlaceholder")}
                className="w-full h-11 ps-9 pe-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              type="button"
              onClick={() => searchRef.current?.focus()}
              className="h-11 px-4 inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
              title={t("pos.scanBarcode")}
            >
              <ScanBarcode className="h-4 w-4" />
              <span className="hidden sm:inline">{t("pos.scanBarcode")}</span>
            </button>
          </div>

          {/* Categories tabs */}
          <div className="px-3 py-2 border-b bg-card flex gap-1 overflow-x-auto">
            <CatChip active={activeCat === "all"} onClick={() => setActiveCat("all")}>
              {t("common.all")}
            </CatChip>
            {categories.map((c) => (
              <CatChip
                key={c.id}
                active={activeCat === c.id}
                onClick={() => setActiveCat(c.id)}
              >
                {c.name}
              </CatChip>
            ))}
          </div>

          {/* Product grid */}
          <div className="flex-1 overflow-auto p-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
              {filtered.map((p) => {
                const low = p.stock <= p.minStock;
                const out = p.stock <= 0;
                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={out}
                    onClick={() => addToCart(p)}
                    className={`group text-start bg-card border rounded-md p-2 hover:border-primary hover:shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="aspect-square w-full rounded bg-muted flex items-center justify-center overflow-hidden mb-2">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                      )}
                    </div>
                    <div className="text-xs font-medium line-clamp-2 min-h-[2rem]">{p.name}</div>
                    <div className="mt-1 flex items-center justify-between">
                      <div className="text-sm font-bold num">{formatDA(p.sellingPrice)}</div>
                      <StockBadge stock={p.stock} min={p.minStock} />
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 num">
                      {p.barcode}
                    </div>
                    {(low || out) && (
                      <div className="sr-only">
                        {out ? t("inventory.outOfStock") : t("inventory.low")}
                      </div>
                    )}
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground text-sm py-12">
                  {t("pos.notFound")}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* RIGHT: cart */}
        <aside className="w-[380px] xl:w-[420px] shrink-0 flex flex-col bg-card">
          <div className="h-12 px-4 border-b flex items-center justify-between">
            <div className="font-semibold flex items-center gap-2">
              <Receipt className="h-4 w-4" /> {t("pos.cart")}
              <span className="text-xs font-normal text-muted-foreground num">
                · {count}
              </span>
            </div>
            <button
              onClick={clear}
              disabled={cart.length === 0}
              className="text-xs inline-flex items-center gap-1 text-muted-foreground hover:text-destructive disabled:opacity-40"
            >
              <Trash2 className="h-3.5 w-3.5" /> {t("pos.clearCart")}
            </button>
          </div>

          <div className="flex-1 overflow-auto">
            {cart.length === 0 ? (
              <div className="h-full flex items-center justify-center p-6 text-center text-sm text-muted-foreground">
                {t("pos.emptyCart")}
              </div>
            ) : (
              <ul className="divide-y">
                {cart.map((l) => (
                  <li key={l.productId} className="p-3 flex gap-3">
                    <div className="h-12 w-12 shrink-0 rounded bg-muted flex items-center justify-center overflow-hidden">
                      {l.image ? (
                        <img src={l.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2">
                        <div className="text-sm font-medium truncate">{l.name}</div>
                        <button
                          onClick={() => remove(l.productId)}
                          className="text-muted-foreground hover:text-destructive"
                          aria-label="Remove"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="text-xs text-muted-foreground num">
                        {formatDA(l.unitPrice)} × {l.quantity}
                      </div>
                      <div className="mt-1.5 flex items-center justify-between">
                        <div className="inline-flex items-center rounded border">
                          <button
                            onClick={() => setQty(l.productId, l.quantity - 1)}
                            className="h-7 w-7 inline-flex items-center justify-center hover:bg-muted"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <input
                            value={l.quantity}
                            onChange={(e) =>
                              setQty(l.productId, parseInt(e.target.value) || 0)
                            }
                            className="w-10 h-7 text-center text-sm num bg-transparent focus:outline-none"
                          />
                          <button
                            onClick={() => setQty(l.productId, l.quantity + 1)}
                            className="h-7 w-7 inline-flex items-center justify-center hover:bg-muted"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="text-sm font-bold num">
                          {formatDA(l.unitPrice * l.quantity)}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Totals + actions */}
          <div className="border-t p-3 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("common.subtotal")}</span>
              <span className="num">{formatDA(subtotal)}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-medium">{t("common.total")}</span>
              <span className="text-2xl font-bold num">{formatDA(subtotal)}</span>
            </div>

            <button
              onClick={onComplete}
              disabled={cart.length === 0}
              className="w-full h-12 rounded-md bg-success text-success-foreground font-semibold inline-flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40"
            >
              <Receipt className="h-4 w-4" /> {t("pos.completeSale")}
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onSaveCredit}
                disabled={cart.length === 0}
                className="h-10 rounded-md border bg-background text-sm font-medium inline-flex items-center justify-center gap-2 hover:bg-muted disabled:opacity-40"
              >
                <CreditCard className="h-4 w-4" /> {t("pos.saveCredit")}
              </button>
              <button
                onClick={onPrint}
                disabled={cart.length === 0}
                className="h-10 rounded-md border bg-background text-sm font-medium inline-flex items-center justify-center gap-2 hover:bg-muted disabled:opacity-40"
              >
                <Printer className="h-4 w-4" /> {t("pos.printInvoice")}
              </button>
            </div>
          </div>
        </aside>
      </div>

      {creditOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setCreditOpen(false)}
        >
          <div
            className="bg-card rounded-lg shadow-lg w-full max-w-md p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-1">{t("pos.saveCredit")}</h3>
            <p className="text-sm text-muted-foreground mb-4 num">
              {t("common.total")}: {formatDA(subtotal)}
            </p>
            <div className="space-y-3">
              <Field label={t("customers.customerName")}>
                <input
                  autoFocus
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border bg-background text-sm"
                />
              </Field>
              <Field label={t("customers.customerPhone")}>
                <input
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border bg-background text-sm"
                />
              </Field>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setCreditOpen(false)}
                className="h-10 px-4 rounded-md border text-sm hover:bg-muted"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={confirmCredit}
                className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
              >
                {t("common.save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function CatChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 h-8 px-3 rounded-md text-xs font-medium border transition ${
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}

function StockBadge({ stock, min }: { stock: number; min: number }) {
  if (stock <= 0)
    return (
      <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive text-destructive-foreground font-medium">
        0
      </span>
    );
  if (stock <= Math.ceil(min / 2))
    return (
      <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive text-destructive-foreground font-medium num">
        {stock}
      </span>
    );
  if (stock <= min)
    return (
      <span className="text-[10px] px-1.5 py-0.5 rounded bg-warning text-warning-foreground font-medium num">
        {stock}
      </span>
    );
  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium num">
      {stock}
    </span>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-muted-foreground mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}
