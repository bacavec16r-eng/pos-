import { create } from "zustand";
import { persist } from "zustand/middleware";
import { uid, todayKey } from "./format";

export type Category = { id: string; name: string };

export type Product = {
  id: string;
  barcode: string;
  name: string;
  sku: string;
  categoryId: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  image?: string;
};

export type CartLine = {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  image?: string;
};

export type Sale = {
  id: string;
  date: string; // ISO
  dayKey: string;
  lines: CartLine[];
  total: number;
  type: "cash" | "credit";
  customerId?: string;
};

export type Payment = { id: string; date: string; amount: number };

export type Debt = {
  id: string;
  customerName: string;
  customerPhone: string;
  createdAt: string;
  lines: CartLine[];
  total: number;
  payments: Payment[];
};

export type StoreSettings = {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  invoiceFooter: string;
};

type State = {
  categories: Category[];
  products: Product[];
  sales: Sale[];
  debts: Debt[];
  settings: StoreSettings;

  // mutations
  addCategory: (name: string) => void;
  updateCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;

  addProduct: (p: Omit<Product, "id">) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  findByBarcode: (code: string) => Product | undefined;

  recordSale: (lines: CartLine[]) => Sale;
  recordCredit: (
    customerName: string,
    customerPhone: string,
    lines: CartLine[]
  ) => Debt;
  addDebtPayment: (debtId: string, amount: number) => void;

  updateSettings: (s: Partial<StoreSettings>) => void;
  resetAll: () => void;
  importData: (data: Partial<State>) => void;
};

const seedCategories: Category[] = [
  { id: "c_drinks", name: "Boissons" },
  { id: "c_food", name: "Alimentation" },
  { id: "c_dairy", name: "Produits laitiers" },
  { id: "c_hygiene", name: "Hygiène" },
  { id: "c_grocery", name: "Épicerie" },
];

const seedProducts: Product[] = [
  { id: uid("p"), barcode: "6130000123456", name: "Coca-Cola 1L", sku: "COCA-1L", categoryId: "c_drinks", purchasePrice: 100, sellingPrice: 130, stock: 48, minStock: 12 },
  { id: uid("p"), barcode: "6130000123457", name: "Coca-Cola 33cl", sku: "COCA-33", categoryId: "c_drinks", purchasePrice: 40, sellingPrice: 60, stock: 120, minStock: 24 },
  { id: uid("p"), barcode: "6130000223456", name: "Hamoud Boualem 1L", sku: "HAMOUD-1L", categoryId: "c_drinks", purchasePrice: 90, sellingPrice: 120, stock: 36, minStock: 12 },
  { id: uid("p"), barcode: "6130000223457", name: "Hamoud Selecto 1L", sku: "SELECTO-1L", categoryId: "c_drinks", purchasePrice: 95, sellingPrice: 125, stock: 8, minStock: 12 },
  { id: uid("p"), barcode: "6130000323456", name: "Eau Minérale Ifri 1.5L", sku: "IFRI-15", categoryId: "c_drinks", purchasePrice: 30, sellingPrice: 50, stock: 200, minStock: 48 },
  { id: uid("p"), barcode: "6130000423456", name: "Lait Candia 1L", sku: "LAIT-CAN", categoryId: "c_dairy", purchasePrice: 90, sellingPrice: 110, stock: 60, minStock: 20 },
  { id: uid("p"), barcode: "6130000423457", name: "Lait Soummam 1L", sku: "LAIT-SOU", categoryId: "c_dairy", purchasePrice: 85, sellingPrice: 105, stock: 3, minStock: 20 },
  { id: uid("p"), barcode: "6130000523456", name: "Yaourt Soummam 4x", sku: "YAO-4", categoryId: "c_dairy", purchasePrice: 110, sellingPrice: 150, stock: 24, minStock: 10 },
  { id: uid("p"), barcode: "6130000623456", name: "Riz 1kg", sku: "RIZ-1KG", categoryId: "c_food", purchasePrice: 140, sellingPrice: 180, stock: 80, minStock: 20 },
  { id: uid("p"), barcode: "6130000623457", name: "Riz 5kg", sku: "RIZ-5KG", categoryId: "c_food", purchasePrice: 650, sellingPrice: 850, stock: 25, minStock: 8 },
  { id: uid("p"), barcode: "6130000723456", name: "Sucre 1kg", sku: "SUC-1KG", categoryId: "c_food", purchasePrice: 95, sellingPrice: 120, stock: 100, minStock: 25 },
  { id: uid("p"), barcode: "6130000823456", name: "Huile Afia 5L", sku: "HUILE-5L", categoryId: "c_food", purchasePrice: 1200, sellingPrice: 1450, stock: 18, minStock: 6 },
  { id: uid("p"), barcode: "6130000823457", name: "Huile Fleurial 1L", sku: "HUILE-1L", categoryId: "c_food", purchasePrice: 240, sellingPrice: 320, stock: 40, minStock: 12 },
  { id: uid("p"), barcode: "6130000923456", name: "Café Bonal 250g", sku: "CAFE-250", categoryId: "c_grocery", purchasePrice: 380, sellingPrice: 480, stock: 22, minStock: 8 },
  { id: uid("p"), barcode: "6130000923457", name: "Café Nescafé 200g", sku: "NES-200", categoryId: "c_grocery", purchasePrice: 850, sellingPrice: 1050, stock: 12, minStock: 5 },
  { id: uid("p"), barcode: "6130001023456", name: "Pâtes Spaghetti 500g", sku: "PAT-500", categoryId: "c_food", purchasePrice: 80, sellingPrice: 110, stock: 90, minStock: 25 },
  { id: uid("p"), barcode: "6130001123456", name: "Farine 1kg", sku: "FAR-1KG", categoryId: "c_food", purchasePrice: 70, sellingPrice: 95, stock: 70, minStock: 20 },
  { id: uid("p"), barcode: "6130001223456", name: "Savon Le Chat", sku: "SAV-LC", categoryId: "c_hygiene", purchasePrice: 110, sellingPrice: 160, stock: 45, minStock: 15 },
  { id: uid("p"), barcode: "6130001223457", name: "Dentifrice Signal", sku: "DENT-SIG", categoryId: "c_hygiene", purchasePrice: 180, sellingPrice: 250, stock: 28, minStock: 10 },
  { id: uid("p"), barcode: "6130001323456", name: "Thé Vert Sultan", sku: "THE-VRT", categoryId: "c_grocery", purchasePrice: 150, sellingPrice: 210, stock: 35, minStock: 10 },
];

// Seed a few past sales so dashboard has data
function seedSales(): Sale[] {
  const out: Sale[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const n = 2 + Math.floor(Math.random() * 4);
    for (let k = 0; k < n; k++) {
      const lines: CartLine[] = [];
      const items = 1 + Math.floor(Math.random() * 3);
      for (let j = 0; j < items; j++) {
        const p = seedProducts[Math.floor(Math.random() * seedProducts.length)];
        const q = 1 + Math.floor(Math.random() * 3);
        lines.push({ productId: p.id, name: p.name, unitPrice: p.sellingPrice, quantity: q, image: p.image });
      }
      const total = lines.reduce((a, l) => a + l.unitPrice * l.quantity, 0);
      out.push({
        id: uid("s"),
        date: d.toISOString(),
        dayKey: todayKey(d),
        lines,
        total,
        type: "cash",
      });
    }
  }
  return out;
}

const defaultSettings: StoreSettings = {
  storeName: "Supérette El Djazair",
  storeAddress: "Alger, Algérie",
  storePhone: "0555 00 00 00",
  invoiceFooter: "Merci pour votre visite !",
};

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      categories: seedCategories,
      products: seedProducts,
      sales: seedSales(),
      debts: [],
      settings: defaultSettings,

      addCategory: (name) =>
        set((s) => ({ categories: [...s.categories, { id: uid("c"), name }] })),
      updateCategory: (id, name) =>
        set((s) => ({
          categories: s.categories.map((c) => (c.id === id ? { ...c, name } : c)),
        })),
      deleteCategory: (id) =>
        set((s) => ({ categories: s.categories.filter((c) => c.id !== id) })),

      addProduct: (p) =>
        set((s) => ({ products: [{ ...p, id: uid("p") }, ...s.products] })),
      updateProduct: (id, patch) =>
        set((s) => ({
          products: s.products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      deleteProduct: (id) =>
        set((s) => ({ products: s.products.filter((p) => p.id !== id) })),

      findByBarcode: (code) => get().products.find((p) => p.barcode === code.trim()),

      recordSale: (lines) => {
        const total = lines.reduce((a, l) => a + l.unitPrice * l.quantity, 0);
        const sale: Sale = {
          id: uid("s"),
          date: new Date().toISOString(),
          dayKey: todayKey(),
          lines,
          total,
          type: "cash",
        };
        set((s) => ({
          sales: [sale, ...s.sales],
          products: s.products.map((p) => {
            const l = lines.find((x) => x.productId === p.id);
            return l ? { ...p, stock: Math.max(0, p.stock - l.quantity) } : p;
          }),
        }));
        return sale;
      },

      recordCredit: (customerName, customerPhone, lines) => {
        const total = lines.reduce((a, l) => a + l.unitPrice * l.quantity, 0);
        const debt: Debt = {
          id: uid("d"),
          customerName,
          customerPhone,
          createdAt: new Date().toISOString(),
          lines,
          total,
          payments: [],
        };
        const sale: Sale = {
          id: uid("s"),
          date: new Date().toISOString(),
          dayKey: todayKey(),
          lines,
          total,
          type: "credit",
          customerId: debt.id,
        };
        set((s) => ({
          debts: [debt, ...s.debts],
          sales: [sale, ...s.sales],
          products: s.products.map((p) => {
            const l = lines.find((x) => x.productId === p.id);
            return l ? { ...p, stock: Math.max(0, p.stock - l.quantity) } : p;
          }),
        }));
        return debt;
      },

      addDebtPayment: (debtId, amount) =>
        set((s) => ({
          debts: s.debts.map((d) =>
            d.id === debtId
              ? {
                  ...d,
                  payments: [
                    ...d.payments,
                    { id: uid("pay"), date: new Date().toISOString(), amount },
                  ],
                }
              : d
          ),
        })),

      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      resetAll: () =>
        set({
          categories: seedCategories,
          products: seedProducts,
          sales: [],
          debts: [],
          settings: defaultSettings,
        }),

      importData: (data) =>
        set((s) => ({
          categories: data.categories ?? s.categories,
          products: data.products ?? s.products,
          sales: data.sales ?? s.sales,
          debts: data.debts ?? s.debts,
          settings: data.settings ?? s.settings,
        })),
    }),
    { name: "djz-market-pos" }
  )
);

export function debtRemaining(d: Debt): number {
  return d.total - d.payments.reduce((a, p) => a + p.amount, 0);
}
