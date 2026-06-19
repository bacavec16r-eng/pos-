import { create } from "zustand";
import { persist } from "zustand/middleware";
import { uid, todayKey } from "./format";

export type Category = { id: string; name: string };

export type ProductVariant = {
  id: string;
  name: string;           // e.g. "110 Porcelain"
  sku: string;
  barcode: string;
  shade?: string;
  image?: string;
  purchasePrice?: number; // falls back to product.purchasePrice
  sellingPrice?: number;  // falls back to product.sellingPrice
  stock: number;
  minStock: number;
  expiryDate?: string;    // ISO YYYY-MM-DD
};

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
  images?: string[];      // gallery (extra URLs in addition to `image`)
  expiryDate?: string;    // ISO YYYY-MM-DD
  supplierId?: string;
  variants?: ProductVariant[];
};

export type Supplier = {
  id: string;
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  outstanding?: number;   // current outstanding balance, DA
  createdAt: string;
};

export type CartLine = {
  productId: string;
  variantId?: string;
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
  suppliers: Supplier[];
  sales: Sale[];
  debts: Debt[];
  settings: StoreSettings;

  addCategory: (name: string) => void;
  updateCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;

  addProduct: (p: Omit<Product, "id">) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  addSupplier: (s: Omit<Supplier, "id" | "createdAt">) => void;
  updateSupplier: (id: string, s: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;

  findByBarcode: (code: string) => { product: Product; variant?: ProductVariant } | undefined;

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

const seedSuppliers: Supplier[] = [
  { id: "sup_loreal", name: "L'Oréal Algérie", contact: "Karim Belkacem", phone: "021 55 12 34", email: "contact@loreal.dz", address: "Zone industrielle, Alger", outstanding: 145000, createdAt: new Date().toISOString() },
  { id: "sup_unilever", name: "Unilever Maghreb", contact: "Sofia Mansouri", phone: "021 66 78 90", email: "ventes@unilever.dz", address: "Reghaïa, Alger", outstanding: 0, createdAt: new Date().toISOString() },
  { id: "sup_arabian", name: "Arabian Oud Distrib.", contact: "Yacine Cherif", phone: "0555 11 22 33", email: "oud.dz@gmail.com", address: "Bab Ezzouar, Alger", outstanding: 78000, createdAt: new Date().toISOString() },
  { id: "sup_local", name: "Belle Studio (Local)", contact: "Amina Khelifi", phone: "0770 44 55 66", email: "amina@bellestudio.dz", address: "Hydra, Alger", outstanding: 0, createdAt: new Date().toISOString() },
];

// helpers to generate seed expiry dates relative to today
function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const fitMeVariants: ProductVariant[] = [
  { id: uid("v"), name: "110 Porcelain", sku: "MAY-FM-110", barcode: "3600531495110", shade: "Porcelain", stock: 6, minStock: 3, expiryDate: addDays(420) },
  { id: uid("v"), name: "115 Ivory",     sku: "MAY-FM-115", barcode: "3600531495115", shade: "Ivory",     stock: 9, minStock: 3, expiryDate: addDays(380) },
  { id: uid("v"), name: "120 Classic Ivory", sku: "MAY-FM-120", barcode: "3600531495120", shade: "Classic Ivory", stock: 4, minStock: 3, expiryDate: addDays(45) },
  { id: uid("v"), name: "128 Warm Nude", sku: "MAY-FM-128", barcode: "3600531495128", shade: "Warm Nude", stock: 12, minStock: 3, expiryDate: addDays(500) },
  { id: uid("v"), name: "220 Natural Beige", sku: "MAY-FM-220", barcode: "3600531495220", shade: "Natural Beige", stock: 7, minStock: 3, expiryDate: addDays(300) },
];

const seedProducts: Product[] = [
  // Maybelline — Fit Me with variants
  { id: uid("p"), barcode: "3600531495123", name: "Fit Me Foundation", sku: "MAY-FM", categoryId: "c_makeup", brand: "Maybelline", volume: "30ml", purchasePrice: 1100, sellingPrice: 1490, stock: 38, minStock: 8, supplierId: "sup_loreal", expiryDate: addDays(420), variants: fitMeVariants },
  { id: uid("p"), barcode: "3600531495124", name: "Sky High Mascara", sku: "MAY-SKY", categoryId: "c_eyes", brand: "Maybelline", volume: "7.2ml", purchasePrice: 950, sellingPrice: 1290, stock: 42, minStock: 10, supplierId: "sup_loreal", expiryDate: addDays(180) },
  { id: uid("p"), barcode: "3600531495125", name: "Super Stay Lipstick 015", sku: "MAY-SS-015", categoryId: "c_lips", brand: "Maybelline", shade: "Cherry", purchasePrice: 850, sellingPrice: 1190, stock: 35, minStock: 10, supplierId: "sup_loreal", expiryDate: addDays(720) },
  // L'Oréal
  { id: uid("p"), barcode: "3600523715201", name: "Revitalift Sérum Hyaluronique", sku: "LOR-REV-SER", categoryId: "c_skincare", brand: "L'Oréal Paris", volume: "30ml", purchasePrice: 2200, sellingPrice: 2890, stock: 18, minStock: 6, supplierId: "sup_loreal", expiryDate: addDays(55) },
  { id: uid("p"), barcode: "3600523715202", name: "Hyaluron Expert Crème", sku: "LOR-HE-CRM", categoryId: "c_skincare", brand: "L'Oréal Paris", volume: "50ml", purchasePrice: 1800, sellingPrice: 2390, stock: 4, minStock: 6, supplierId: "sup_loreal", expiryDate: addDays(25) },
  { id: uid("p"), barcode: "3600523715203", name: "Elvive Shampoing Total Repair", sku: "LOR-ELV-TR", categoryId: "c_hair", brand: "L'Oréal Paris", volume: "400ml", purchasePrice: 480, sellingPrice: 690, stock: 60, minStock: 15, supplierId: "sup_loreal", expiryDate: addDays(540) },
  // Garnier
  { id: uid("p"), barcode: "3600541234001", name: "Vitamin C Sérum", sku: "GAR-VITC", categoryId: "c_skincare", brand: "Garnier", volume: "30ml", purchasePrice: 1200, sellingPrice: 1690, stock: 22, minStock: 8, supplierId: "sup_loreal", expiryDate: addDays(85) },
  { id: uid("p"), barcode: "3600541234002", name: "Eau Micellaire Tout-en-1", sku: "GAR-MIC", categoryId: "c_skincare", brand: "Garnier", volume: "400ml", purchasePrice: 650, sellingPrice: 890, stock: 38, minStock: 10, supplierId: "sup_loreal", expiryDate: addDays(300) },
  // Nivea (Unilever stand-in)
  { id: uid("p"), barcode: "4005900123001", name: "Nivea Soft Crème", sku: "NIV-SOFT", categoryId: "c_body", brand: "Nivea", volume: "200ml", purchasePrice: 380, sellingPrice: 550, stock: 80, minStock: 20, supplierId: "sup_unilever", expiryDate: addDays(600) },
  { id: uid("p"), barcode: "4005900123002", name: "Q10 Lotion Anti-Âge", sku: "NIV-Q10", categoryId: "c_body", brand: "Nivea", volume: "250ml", purchasePrice: 850, sellingPrice: 1190, stock: 24, minStock: 8, supplierId: "sup_unilever", expiryDate: addDays(15) },
  // Dove
  { id: uid("p"), barcode: "8901030712001", name: "Dove Body Wash Original", sku: "DOV-BW", categoryId: "c_body", brand: "Dove", volume: "500ml", purchasePrice: 520, sellingPrice: 750, stock: 45, minStock: 12, supplierId: "sup_unilever", expiryDate: addDays(400) },
  { id: uid("p"), barcode: "8901030712002", name: "Dove Shampoing Nutrition", sku: "DOV-SH", categoryId: "c_hair", brand: "Dove", volume: "400ml", purchasePrice: 580, sellingPrice: 820, stock: 32, minStock: 10, supplierId: "sup_unilever", expiryDate: addDays(220) },
  // Yves Rocher
  { id: uid("p"), barcode: "3660005412301", name: "Yves Rocher Comme une Évidence EDP", sku: "YR-EVI", categoryId: "c_perfume", brand: "Yves Rocher", volume: "50ml", purchasePrice: 3200, sellingPrice: 4290, stock: 12, minStock: 4, supplierId: "sup_arabian", expiryDate: addDays(900) },
  // Lattafa
  { id: uid("p"), barcode: "6291108731001", name: "Lattafa Yara EDP", sku: "LAT-YARA", categoryId: "c_perfume", brand: "Lattafa", volume: "100ml", purchasePrice: 2800, sellingPrice: 3990, stock: 20, minStock: 6, supplierId: "sup_arabian" },
  { id: uid("p"), barcode: "6291108731002", name: "Lattafa Asad EDP", sku: "LAT-ASAD", categoryId: "c_perfume", brand: "Lattafa", volume: "100ml", purchasePrice: 3100, sellingPrice: 4290, stock: 3, minStock: 6, supplierId: "sup_arabian" },
  // Ard Al Zaafaran
  { id: uid("p"), barcode: "6291107841001", name: "Ard Al Zaafaran Dirham EDP", sku: "AAZ-DIR", categoryId: "c_perfume", brand: "Ard Al Zaafaran", volume: "100ml", purchasePrice: 2400, sellingPrice: 3490, stock: 15, minStock: 5, supplierId: "sup_arabian" },
  // Huda Beauty
  { id: uid("p"), barcode: "6291108551001", name: "Huda Faux Filter Foundation", sku: "HUD-FAUX", categoryId: "c_makeup", brand: "Huda Beauty", shade: "Toffee 400N", volume: "35ml", purchasePrice: 4200, sellingPrice: 5490, stock: 9, minStock: 4, supplierId: "sup_local", expiryDate: addDays(200) },
  { id: uid("p"), barcode: "6291108551002", name: "Huda Lip Contour Matte", sku: "HUD-LIPC", categoryId: "c_lips", brand: "Huda Beauty", shade: "Vixen", purchasePrice: 1900, sellingPrice: 2590, stock: 14, minStock: 5, supplierId: "sup_local", expiryDate: addDays(800) },
  // The Ordinary
  { id: uid("p"), barcode: "0769915190001", name: "The Ordinary Niacinamide 10% + Zinc 1%", sku: "TO-NIA10", categoryId: "c_skincare", brand: "The Ordinary", volume: "30ml", purchasePrice: 950, sellingPrice: 1390, stock: 26, minStock: 8, supplierId: "sup_local", expiryDate: addDays(75) },
  { id: uid("p"), barcode: "0769915190002", name: "The Ordinary Hyaluronic Acid 2% + B5", sku: "TO-HA2", categoryId: "c_skincare", brand: "The Ordinary", volume: "30ml", purchasePrice: 1050, sellingPrice: 1490, stock: 19, minStock: 8, supplierId: "sup_local", expiryDate: addDays(40) },
  // Nail care
  { id: uid("p"), barcode: "5000167234001", name: "Vernis à Ongles Rose Glow", sku: "NL-ROSE", categoryId: "c_nails", brand: "Belle Studio", shade: "Rose Glow", volume: "12ml", purchasePrice: 220, sellingPrice: 390, stock: 55, minStock: 15, supplierId: "sup_local" },
  // Tools
  { id: uid("p"), barcode: "5000167234002", name: "Pinceau Fond de Teint Pro", sku: "TL-BRUSH", categoryId: "c_tools", brand: "Belle Studio", purchasePrice: 380, sellingPrice: 590, stock: 28, minStock: 8, supplierId: "sup_local" },
  { id: uid("p"), barcode: "5000167234003", name: "Éponge Beauty Blender", sku: "TL-SPONGE", categoryId: "c_tools", brand: "Belle Studio", purchasePrice: 250, sellingPrice: 450, stock: 40, minStock: 12, supplierId: "sup_local" },
  // Men
  { id: uid("p"), barcode: "4005900778001", name: "Nivea Men Sensitive After Shave", sku: "NIV-M-AS", categoryId: "c_men", brand: "Nivea Men", volume: "100ml", purchasePrice: 480, sellingPrice: 690, stock: 22, minStock: 8, supplierId: "sup_unilever", expiryDate: addDays(500) },
  // Gift set
  { id: uid("p"), barcode: "9990000001234", name: "Coffret Cadeau Beauté Rose", sku: "GIFT-ROSE", categoryId: "c_gift", brand: "Belle Studio", purchasePrice: 2800, sellingPrice: 4290, stock: 8, minStock: 3, supplierId: "sup_local" },
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

function stockOf(p: Product): number {
  if (p.variants && p.variants.length > 0) {
    return p.variants.reduce((a, v) => a + v.stock, 0);
  }
  return p.stock;
}

function applyLineToProduct(p: Product, l: CartLine): Product {
  if (l.productId !== p.id) return p;
  if (l.variantId && p.variants && p.variants.length > 0) {
    const variants = p.variants.map((v) =>
      v.id === l.variantId ? { ...v, stock: Math.max(0, v.stock - l.quantity) } : v
    );
    const newStock = variants.reduce((a, v) => a + v.stock, 0);
    return { ...p, variants, stock: newStock };
  }
  return { ...p, stock: Math.max(0, p.stock - l.quantity) };
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      categories: seedCategories,
      products: seedProducts,
      suppliers: seedSuppliers,
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
        set((s) => ({
          products: s.products.map((p) => {
            if (p.id !== id) return p;
            const merged = { ...p, ...patch };
            if (merged.variants && merged.variants.length > 0) {
              merged.stock = merged.variants.reduce((a, v) => a + v.stock, 0);
            }
            return merged;
          }),
        })),
      deleteProduct: (id) =>
        set((s) => ({ products: s.products.filter((p) => p.id !== id) })),

      addSupplier: (sup) =>
        set((s) => ({
          suppliers: [
            { ...sup, id: uid("sup"), createdAt: new Date().toISOString() },
            ...s.suppliers,
          ],
        })),
      updateSupplier: (id, patch) =>
        set((s) => ({
          suppliers: s.suppliers.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),
      deleteSupplier: (id) =>
        set((s) => ({ suppliers: s.suppliers.filter((x) => x.id !== id) })),

      findByBarcode: (code) => {
        const c = code.trim();
        for (const p of get().products) {
          if (p.barcode === c) return { product: p };
          if (p.variants) {
            const v = p.variants.find((x) => x.barcode === c);
            if (v) return { product: p, variant: v };
          }
        }
        return undefined;
      },

      recordSale: (lines) => {
        const total = lines.reduce((a, l) => a + l.unitPrice * l.quantity, 0);
        const sale: Sale = { id: uid("s"), date: new Date().toISOString(), dayKey: todayKey(), lines, total, type: "cash" };
        set((s) => ({
          sales: [sale, ...s.sales],
          products: s.products.map((p) => {
            const ls = lines.filter((x) => x.productId === p.id);
            return ls.reduce(applyLineToProduct, p);
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
            const ls = lines.filter((x) => x.productId === p.id);
            return ls.reduce(applyLineToProduct, p);
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
          suppliers: seedSuppliers,
          sales: [],
          debts: [],
          settings: defaultSettings,
        }),

      importData: (data) =>
        set((s) => ({
          categories: data.categories ?? s.categories,
          products: data.products ?? s.products,
          suppliers: data.suppliers ?? s.suppliers,
          sales: data.sales ?? s.sales,
          debts: data.debts ?? s.debts,
          settings: data.settings ?? s.settings,
        })),
    }),
    {
      name: "belle-beaute-pos-v1",
      version: 2,
      migrate: (persisted: any, fromVersion) => {
        if (!persisted) return persisted;
        // v1 -> v2: ensure suppliers, gallery fields exist; preserve user products.
        if (fromVersion < 2) {
          if (!Array.isArray(persisted.suppliers)) {
            persisted.suppliers = seedSuppliers;
          }
          if (Array.isArray(persisted.products)) {
            persisted.products = persisted.products.map((p: any) => ({
              ...p,
              images: Array.isArray(p.images) ? p.images : [],
              variants: Array.isArray(p.variants) ? p.variants : undefined,
            }));
          }
        }
        return persisted;
      },
    }
  )
);

export function debtRemaining(d: Debt): number {
  return d.total - d.payments.reduce((a, p) => a + p.amount, 0);
}

export function productTotalStock(p: Product): number {
  return stockOf(p);
}

export function variantPrice(p: Product, v?: ProductVariant): { selling: number; purchase: number } {
  return {
    selling: v?.sellingPrice ?? p.sellingPrice,
    purchase: v?.purchasePrice ?? p.purchasePrice,
  };
}
