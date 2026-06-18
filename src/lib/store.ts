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
  brand?: string;
  shade?: string;
  volume?: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  image?: string;
};

export type CartLine = {
  productId: string;
  name: string;
  brand?: string;
  unitPrice: number;
  quantity: number;
  image?: string;
};

export type Sale = {
  id: string;
  date: string;
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

  addCategory: (name: string) => void;
  updateCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;

  addProduct: (p: Omit<Product, "id">) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  findByBarcode: (code: string) => Product | undefined;

  recordSale: (lines: CartLine[]) => Sale;
  recordCredit: (customerName: string, customerPhone: string, lines: CartLine[]) => Debt;
  addDebtPayment: (debtId: string, amount: number) => void;

  updateSettings: (s: Partial<StoreSettings>) => void;
  resetAll: () => void;
  importData: (data: Partial<State>) => void;
};

const seedCategories: Category[] = [
  { id: "c_makeup", name: "Maquillage" },
  { id: "c_skincare", name: "Soin du visage" },
  { id: "c_perfume", name: "Parfums" },
  { id: "c_hair", name: "Cheveux" },
  { id: "c_body", name: "Soin du corps" },
  { id: "c_tools", name: "Accessoires beauté" },
  { id: "c_nails", name: "Ongles" },
  { id: "c_lips", name: "Lèvres" },
  { id: "c_eyes", name: "Yeux" },
  { id: "c_men", name: "Homme" },
  { id: "c_gift", name: "Coffrets cadeaux" },
];

const seedProducts: Product[] = [
  // Maybelline
  { id: uid("p"), barcode: "3600531495123", name: "Fit Me Foundation 220", sku: "MAY-FM-220", categoryId: "c_makeup", brand: "Maybelline", shade: "Natural Beige", volume: "30ml", purchasePrice: 1100, sellingPrice: 1490, stock: 28, minStock: 8 },
  { id: uid("p"), barcode: "3600531495124", name: "Sky High Mascara", sku: "MAY-SKY", categoryId: "c_eyes", brand: "Maybelline", volume: "7.2ml", purchasePrice: 950, sellingPrice: 1290, stock: 42, minStock: 10 },
  { id: uid("p"), barcode: "3600531495125", name: "Super Stay Lipstick 015", sku: "MAY-SS-015", categoryId: "c_lips", brand: "Maybelline", shade: "Cherry", purchasePrice: 850, sellingPrice: 1190, stock: 35, minStock: 10 },
  // L'Oréal
  { id: uid("p"), barcode: "3600523715201", name: "Revitalift Sérum Hyaluronique", sku: "LOR-REV-SER", categoryId: "c_skincare", brand: "L'Oréal Paris", volume: "30ml", purchasePrice: 2200, sellingPrice: 2890, stock: 18, minStock: 6 },
  { id: uid("p"), barcode: "3600523715202", name: "Hyaluron Expert Crème", sku: "LOR-HE-CRM", categoryId: "c_skincare", brand: "L'Oréal Paris", volume: "50ml", purchasePrice: 1800, sellingPrice: 2390, stock: 4, minStock: 6 },
  { id: uid("p"), barcode: "3600523715203", name: "Elvive Shampoing Total Repair", sku: "LOR-ELV-TR", categoryId: "c_hair", brand: "L'Oréal Paris", volume: "400ml", purchasePrice: 480, sellingPrice: 690, stock: 60, minStock: 15 },
  // Garnier
  { id: uid("p"), barcode: "3600541234001", name: "Vitamin C Sérum", sku: "GAR-VITC", categoryId: "c_skincare", brand: "Garnier", volume: "30ml", purchasePrice: 1200, sellingPrice: 1690, stock: 22, minStock: 8 },
  { id: uid("p"), barcode: "3600541234002", name: "Eau Micellaire Tout-en-1", sku: "GAR-MIC", categoryId: "c_skincare", brand: "Garnier", volume: "400ml", purchasePrice: 650, sellingPrice: 890, stock: 38, minStock: 10 },
  // Nivea
  { id: uid("p"), barcode: "4005900123001", name: "Nivea Soft Crème", sku: "NIV-SOFT", categoryId: "c_body", brand: "Nivea", volume: "200ml", purchasePrice: 380, sellingPrice: 550, stock: 80, minStock: 20 },
  { id: uid("p"), barcode: "4005900123002", name: "Q10 Lotion Anti-Âge", sku: "NIV-Q10", categoryId: "c_body", brand: "Nivea", volume: "250ml", purchasePrice: 850, sellingPrice: 1190, stock: 24, minStock: 8 },
  // Dove
  { id: uid("p"), barcode: "8901030712001", name: "Dove Body Wash Original", sku: "DOV-BW", categoryId: "c_body", brand: "Dove", volume: "500ml", purchasePrice: 520, sellingPrice: 750, stock: 45, minStock: 12 },
  { id: uid("p"), barcode: "8901030712002", name: "Dove Shampoing Nutrition", sku: "DOV-SH", categoryId: "c_hair", brand: "Dove", volume: "400ml", purchasePrice: 580, sellingPrice: 820, stock: 32, minStock: 10 },
  // Yves Rocher
  { id: uid("p"), barcode: "3660005412301", name: "Yves Rocher Comme une Évidence EDP", sku: "YR-EVI", categoryId: "c_perfume", brand: "Yves Rocher", volume: "50ml", purchasePrice: 3200, sellingPrice: 4290, stock: 12, minStock: 4 },
  // Lattafa
  { id: uid("p"), barcode: "6291108731001", name: "Lattafa Yara EDP", sku: "LAT-YARA", categoryId: "c_perfume", brand: "Lattafa", volume: "100ml", purchasePrice: 2800, sellingPrice: 3990, stock: 20, minStock: 6 },
  { id: uid("p"), barcode: "6291108731002", name: "Lattafa Asad EDP", sku: "LAT-ASAD", categoryId: "c_perfume", brand: "Lattafa", volume: "100ml", purchasePrice: 3100, sellingPrice: 4290, stock: 3, minStock: 6 },
  // Ard Al Zaafaran
  { id: uid("p"), barcode: "6291107841001", name: "Ard Al Zaafaran Dirham EDP", sku: "AAZ-DIR", categoryId: "c_perfume", brand: "Ard Al Zaafaran", volume: "100ml", purchasePrice: 2400, sellingPrice: 3490, stock: 15, minStock: 5 },
  // Huda Beauty
  { id: uid("p"), barcode: "6291108551001", name: "Huda Faux Filter Foundation", sku: "HUD-FAUX", categoryId: "c_makeup", brand: "Huda Beauty", shade: "Toffee 400N", volume: "35ml", purchasePrice: 4200, sellingPrice: 5490, stock: 9, minStock: 4 },
  { id: uid("p"), barcode: "6291108551002", name: "Huda Lip Contour Matte", sku: "HUD-LIPC", categoryId: "c_lips", brand: "Huda Beauty", shade: "Vixen", purchasePrice: 1900, sellingPrice: 2590, stock: 14, minStock: 5 },
  // The Ordinary
  { id: uid("p"), barcode: "0769915190001", name: "The Ordinary Niacinamide 10% + Zinc 1%", sku: "TO-NIA10", categoryId: "c_skincare", brand: "The Ordinary", volume: "30ml", purchasePrice: 950, sellingPrice: 1390, stock: 26, minStock: 8 },
  { id: uid("p"), barcode: "0769915190002", name: "The Ordinary Hyaluronic Acid 2% + B5", sku: "TO-HA2", categoryId: "c_skincare", brand: "The Ordinary", volume: "30ml", purchasePrice: 1050, sellingPrice: 1490, stock: 19, minStock: 8 },
  // Nail care
  { id: uid("p"), barcode: "5000167234001", name: "Vernis à Ongles Rose Glow", sku: "NL-ROSE", categoryId: "c_nails", brand: "Belle Studio", shade: "Rose Glow", volume: "12ml", purchasePrice: 220, sellingPrice: 390, stock: 55, minStock: 15 },
  // Tools
  { id: uid("p"), barcode: "5000167234002", name: "Pinceau Fond de Teint Pro", sku: "TL-BRUSH", categoryId: "c_tools", brand: "Belle Studio", purchasePrice: 380, sellingPrice: 590, stock: 28, minStock: 8 },
  { id: uid("p"), barcode: "5000167234003", name: "Éponge Beauty Blender", sku: "TL-SPONGE", categoryId: "c_tools", brand: "Belle Studio", purchasePrice: 250, sellingPrice: 450, stock: 40, minStock: 12 },
  // Men
  { id: uid("p"), barcode: "4005900778001", name: "Nivea Men Sensitive After Shave", sku: "NIV-M-AS", categoryId: "c_men", brand: "Nivea Men", volume: "100ml", purchasePrice: 480, sellingPrice: 690, stock: 22, minStock: 8 },
  // Gift set
  { id: uid("p"), barcode: "9990000001234", name: "Coffret Cadeau Beauté Rose", sku: "GIFT-ROSE", categoryId: "c_gift", brand: "Belle Studio", purchasePrice: 2800, sellingPrice: 4290, stock: 8, minStock: 3 },
];

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
        const q = 1 + Math.floor(Math.random() * 2);
        lines.push({ productId: p.id, name: p.name, brand: p.brand, unitPrice: p.sellingPrice, quantity: q, image: p.image });
      }
      const total = lines.reduce((a, l) => a + l.unitPrice * l.quantity, 0);
      out.push({ id: uid("s"), date: d.toISOString(), dayKey: todayKey(d), lines, total, type: "cash" });
    }
  }
  return out;
}

const defaultSettings: StoreSettings = {
  storeName: "Belle Beauté",
  storeAddress: "Alger Centre, Algérie",
  storePhone: "0555 00 00 00",
  invoiceFooter: "Merci pour votre confiance — Restez belle ✨",
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
        set((s) => ({ categories: s.categories.map((c) => (c.id === id ? { ...c, name } : c)) })),
      deleteCategory: (id) =>
        set((s) => ({ categories: s.categories.filter((c) => c.id !== id) })),

      addProduct: (p) => set((s) => ({ products: [{ ...p, id: uid("p") }, ...s.products] })),
      updateProduct: (id, patch) =>
        set((s) => ({ products: s.products.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      deleteProduct: (id) =>
        set((s) => ({ products: s.products.filter((p) => p.id !== id) })),

      findByBarcode: (code) => get().products.find((p) => p.barcode === code.trim()),

      recordSale: (lines) => {
        const total = lines.reduce((a, l) => a + l.unitPrice * l.quantity, 0);
        const sale: Sale = { id: uid("s"), date: new Date().toISOString(), dayKey: todayKey(), lines, total, type: "cash" };
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
        const debt: Debt = { id: uid("d"), customerName, customerPhone, createdAt: new Date().toISOString(), lines, total, payments: [] };
        const sale: Sale = { id: uid("s"), date: new Date().toISOString(), dayKey: todayKey(), lines, total, type: "credit", customerId: debt.id };
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
              ? { ...d, payments: [...d.payments, { id: uid("pay"), date: new Date().toISOString(), amount }] }
              : d
          ),
        })),

      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

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
    { name: "belle-beaute-pos-v1" }
  )
);

export function debtRemaining(d: Debt): number {
  return d.total - d.payments.reduce((a, p) => a + p.amount, 0);
}
