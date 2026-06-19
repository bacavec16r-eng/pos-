import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  fr: {
    translation: {
      app: { name: "Belle Beauté POS", tagline: "Gestion beauté & cosmétiques" },
      nav: {
        dashboard: "Tableau de bord",
        pos: "Caisse / Ventes",
        products: "Produits",
        categories: "Catégories",
        inventory: "Inventaire",
        suppliers: "Fournisseurs",
        customers: "Crédits clients",
        reports: "Rapports",
        settings: "Paramètres",
      },
      common: {
        search: "Rechercher", add: "Ajouter", edit: "Modifier", delete: "Supprimer",
        save: "Enregistrer", cancel: "Annuler", close: "Fermer", confirm: "Confirmer",
        total: "Total", subtotal: "Sous-total", quantity: "Quantité", price: "Prix",
        name: "Nom", phone: "Téléphone", actions: "Actions", all: "Tous", none: "Aucun",
        loading: "Chargement…", empty: "Aucune donnée", today: "Aujourd'hui",
        thisMonth: "Ce mois", yes: "Oui", no: "Non", status: "État",
      },
      pos: {
        title: "Caisse",
        searchPlaceholder: "Scanner ou rechercher un produit (code-barres, nom, SKU)…",
        scanBarcode: "Scanner code-barres", cart: "Panier",
        emptyCart: "Le panier est vide. Scannez ou cherchez un produit.",
        clearCart: "Vider", completeSale: "Encaisser", saveCredit: "Vente à crédit",
        printInvoice: "Imprimer ticket", itemsCount: "{{count}} article",
        itemsCount_plural: "{{count}} articles", notFound: "Produit non trouvé",
        saleCompleted: "Vente enregistrée", creditSaved: "Crédit enregistré",
        stock: "Stock", chooseVariant: "Choisir une teinte / variante",
      },
      products: {
        title: "Produits", addProduct: "Ajouter un produit", editProduct: "Modifier le produit",
        barcode: "Code-barres", sku: "Référence", category: "Catégorie", brand: "Marque",
        shade: "Teinte", volume: "Contenance", purchasePrice: "Prix d'achat",
        sellingPrice: "Prix de vente", currentStock: "Stock actuel", minStock: "Stock minimum",
        image: "Image principale (URL)", gallery: "Galerie d'images (une URL par ligne)",
        deleteConfirm: "Supprimer ce produit ?", supplier: "Fournisseur",
        expiryDate: "Date d'expiration", variants: "Variantes / Teintes",
        addVariant: "Ajouter une variante", variantName: "Nom de la variante",
        noSupplier: "— Sans fournisseur —",
      },
      categories: {
        title: "Catégories", addCategory: "Ajouter une catégorie", productsCount: "Produits",
      },
      inventory: {
        title: "Inventaire", valuation: "Valorisation du stock", lowStock: "Stock faible",
        outOfStock: "Rupture", critical: "Critique", low: "Faible", ok: "OK",
        totalProducts: "Produits", totalUnits: "Unités en stock", expiry: "Expiration",
        nearExpiry: "Produits bientôt périmés", expired: "Périmés",
        expiringIn30: "Expire sous 30 jours", expiringIn60: "Expire sous 60 jours",
        expiringIn90: "Expire sous 90 jours", expiryDate: "Date d'expiration",
        daysLeft: "Jours restants", allClear: "Aucun produit proche de l'expiration",
      },
      suppliers: {
        title: "Fournisseurs", add: "Ajouter un fournisseur", edit: "Modifier le fournisseur",
        name: "Nom du fournisseur", contact: "Personne de contact", phone: "Téléphone",
        email: "Email", address: "Adresse", notes: "Notes",
        outstanding: "Solde dû", products: "Produits fournis",
        deleteConfirm: "Supprimer ce fournisseur ?", empty: "Aucun fournisseur",
        totalOutstanding: "Total à payer", suppliers: "Fournisseurs",
      },
      customers: {
        title: "Crédits clients", totalDebt: "Dette totale", paid: "Payé",
        remaining: "Restant", addPayment: "Enregistrer paiement", paymentAmount: "Montant",
        history: "Historique des paiements", productsTaken: "Produits pris",
        customerName: "Nom du client", customerPhone: "Téléphone",
        noDebts: "Aucun crédit en cours",
      },
      reports: {
        title: "Rapports", dailySales: "Ventes journalières", monthlySales: "Ventes mensuelles",
        mostSold: "Produits les plus vendus", bestCategories: "Meilleures catégories",
      },
      settings: {
        title: "Paramètres", store: "Informations du magasin", storeName: "Nom du magasin",
        storeAddress: "Adresse", storePhone: "Téléphone", invoice: "Paramètres ticket",
        invoiceFooter: "Message bas de ticket", backup: "Sauvegarde",
        export: "Exporter les données", import: "Importer les données", language: "Langue",
        reset: "Réinitialiser les données", resetConfirm: "Effacer toutes les données ? Action irréversible.",
      },
      dashboard: {
        title: "Tableau de bord", salesToday: "Ventes aujourd'hui",
        salesMonth: "Ventes ce mois", lowStockCount: "Produits en stock faible",
        unpaidDebts: "Dettes impayées", topProducts: "Produits les plus vendus",
        dailyRevenue: "Revenu journalier (7 jours)", bestCategories: "Meilleures catégories",
        nearExpiry: "Produits bientôt périmés",
      },
    },
  },
  ar: {
    translation: {
      app: { name: "بيل بوتيه", tagline: "إدارة متجر التجميل والعطور" },
      nav: {
        dashboard: "لوحة التحكم", pos: "الصندوق / المبيعات", products: "المنتجات",
        categories: "الفئات", inventory: "المخزون", suppliers: "الموردون",
        customers: "ديون الزبائن", reports: "التقارير", settings: "الإعدادات",
      },
      common: {
        search: "بحث", add: "إضافة", edit: "تعديل", delete: "حذف", save: "حفظ",
        cancel: "إلغاء", close: "إغلاق", confirm: "تأكيد", total: "المجموع",
        subtotal: "المجموع الفرعي", quantity: "الكمية", price: "السعر", name: "الاسم",
        phone: "الهاتف", actions: "إجراءات", all: "الكل", none: "لا شيء",
        loading: "جار التحميل…", empty: "لا توجد بيانات", today: "اليوم",
        thisMonth: "هذا الشهر", yes: "نعم", no: "لا", status: "الحالة",
      },
      pos: {
        title: "الصندوق",
        searchPlaceholder: "امسح أو ابحث عن منتج (الباركود، الاسم، SKU)…",
        scanBarcode: "مسح الباركود", cart: "السلة",
        emptyCart: "السلة فارغة. امسح أو ابحث عن منتج.",
        clearCart: "تفريغ", completeSale: "إتمام البيع", saveCredit: "بيع بالدين",
        printInvoice: "طباعة الفاتورة", itemsCount: "{{count}} منتج",
        itemsCount_plural: "{{count}} منتجات", notFound: "المنتج غير موجود",
        saleCompleted: "تم تسجيل البيع", creditSaved: "تم تسجيل الدين",
        stock: "المخزون", chooseVariant: "اختر اللون / النسخة",
      },
      products: {
        title: "المنتجات", addProduct: "إضافة منتج", editProduct: "تعديل المنتج",
        barcode: "الباركود", sku: "المرجع", category: "الفئة", brand: "العلامة التجارية",
        shade: "اللون / الدرجة", volume: "الحجم", purchasePrice: "سعر الشراء",
        sellingPrice: "سعر البيع", currentStock: "المخزون الحالي", minStock: "الحد الأدنى",
        image: "الصورة الرئيسية (رابط)", gallery: "معرض الصور (رابط في كل سطر)",
        deleteConfirm: "حذف هذا المنتج؟", supplier: "المورد", expiryDate: "تاريخ الانتهاء",
        variants: "النسخ / الألوان", addVariant: "إضافة نسخة", variantName: "اسم النسخة",
        noSupplier: "— بدون مورد —",
      },
      categories: { title: "الفئات", addCategory: "إضافة فئة", productsCount: "المنتجات" },
      inventory: {
        title: "المخزون", valuation: "قيمة المخزون", lowStock: "مخزون منخفض",
        outOfStock: "نفاد المخزون", critical: "حرج", low: "منخفض", ok: "جيد",
        totalProducts: "المنتجات", totalUnits: "الوحدات في المخزون",
        expiry: "الانتهاء", nearExpiry: "منتجات قاربت على الانتهاء", expired: "منتهية الصلاحية",
        expiringIn30: "ينتهي خلال 30 يوما", expiringIn60: "ينتهي خلال 60 يوما",
        expiringIn90: "ينتهي خلال 90 يوما", expiryDate: "تاريخ الانتهاء",
        daysLeft: "الأيام المتبقية", allClear: "لا توجد منتجات قاربت على الانتهاء",
      },
      suppliers: {
        title: "الموردون", add: "إضافة مورد", edit: "تعديل المورد", name: "اسم المورد",
        contact: "شخص الاتصال", phone: "الهاتف", email: "البريد الإلكتروني",
        address: "العنوان", notes: "ملاحظات", outstanding: "المبلغ المستحق",
        products: "المنتجات الموردة", deleteConfirm: "حذف هذا المورد؟",
        empty: "لا يوجد موردون", totalOutstanding: "المستحقات الإجمالية", suppliers: "الموردون",
      },
      customers: {
        title: "ديون الزبائن", totalDebt: "إجمالي الدين", paid: "المدفوع",
        remaining: "المتبقي", addPayment: "تسجيل دفعة", paymentAmount: "المبلغ",
        history: "سجل الدفعات", productsTaken: "المنتجات المأخوذة",
        customerName: "اسم الزبون", customerPhone: "الهاتف", noDebts: "لا توجد ديون",
      },
      reports: {
        title: "التقارير", dailySales: "المبيعات اليومية", monthlySales: "المبيعات الشهرية",
        mostSold: "الأكثر مبيعا", bestCategories: "أفضل الفئات",
      },
      settings: {
        title: "الإعدادات", store: "معلومات المحل", storeName: "اسم المحل",
        storeAddress: "العنوان", storePhone: "الهاتف", invoice: "إعدادات الفاتورة",
        invoiceFooter: "نص أسفل الفاتورة", backup: "النسخ الاحتياطي",
        export: "تصدير البيانات", import: "استيراد البيانات", language: "اللغة",
        reset: "إعادة تعيين البيانات", resetConfirm: "مسح كل البيانات؟ لا يمكن التراجع.",
      },
      dashboard: {
        title: "لوحة التحكم", salesToday: "مبيعات اليوم", salesMonth: "مبيعات الشهر",
        lowStockCount: "منتجات بمخزون منخفض", unpaidDebts: "ديون غير مدفوعة",
        topProducts: "الأكثر مبيعا", dailyRevenue: "الإيرادات اليومية (7 أيام)",
        bestCategories: "أفضل الفئات", nearExpiry: "منتجات قاربت على الانتهاء",
      },
    },
  },
  en: {
    translation: {
      app: { name: "Belle Beauté POS", tagline: "Beauty & cosmetics manager" },
      nav: {
        dashboard: "Dashboard", pos: "POS / Sales", products: "Products",
        categories: "Categories", inventory: "Inventory", suppliers: "Suppliers",
        customers: "Customer debts", reports: "Reports", settings: "Settings",
      },
      common: {
        search: "Search", add: "Add", edit: "Edit", delete: "Delete", save: "Save",
        cancel: "Cancel", close: "Close", confirm: "Confirm", total: "Total",
        subtotal: "Subtotal", quantity: "Quantity", price: "Price", name: "Name",
        phone: "Phone", actions: "Actions", all: "All", none: "None",
        loading: "Loading…", empty: "No data", today: "Today", thisMonth: "This month",
        yes: "Yes", no: "No", status: "Status",
      },
      pos: {
        title: "Cashier", searchPlaceholder: "Scan or search a product (barcode, name, SKU)…",
        scanBarcode: "Scan barcode", cart: "Cart",
        emptyCart: "Cart is empty. Scan or search a product.",
        clearCart: "Clear", completeSale: "Complete Sale", saveCredit: "Save as Credit",
        printInvoice: "Print Invoice", itemsCount: "{{count}} item",
        itemsCount_plural: "{{count}} items", notFound: "Product not found",
        saleCompleted: "Sale recorded", creditSaved: "Credit saved",
        stock: "Stock", chooseVariant: "Choose a shade / variant",
      },
      products: {
        title: "Products", addProduct: "Add product", editProduct: "Edit product",
        barcode: "Barcode", sku: "SKU", category: "Category", brand: "Brand",
        shade: "Shade", volume: "Volume", purchasePrice: "Purchase price",
        sellingPrice: "Selling price", currentStock: "Current stock", minStock: "Min stock",
        image: "Main image (URL)", gallery: "Gallery (one URL per line)",
        deleteConfirm: "Delete this product?", supplier: "Supplier", expiryDate: "Expiry date",
        variants: "Variants / Shades", addVariant: "Add variant", variantName: "Variant name",
        noSupplier: "— No supplier —",
      },
      categories: { title: "Categories", addCategory: "Add category", productsCount: "Products" },
      inventory: {
        title: "Inventory", valuation: "Stock valuation", lowStock: "Low stock",
        outOfStock: "Out of stock", critical: "Critical", low: "Low", ok: "OK",
        totalProducts: "Products", totalUnits: "Units in stock", expiry: "Expiry",
        nearExpiry: "Products near expiry", expired: "Expired",
        expiringIn30: "Expires in 30 days", expiringIn60: "Expires in 60 days",
        expiringIn90: "Expires in 90 days", expiryDate: "Expiry date",
        daysLeft: "Days left", allClear: "No products near expiry",
      },
      suppliers: {
        title: "Suppliers", add: "Add supplier", edit: "Edit supplier",
        name: "Supplier name", contact: "Contact person", phone: "Phone", email: "Email",
        address: "Address", notes: "Notes", outstanding: "Outstanding balance",
        products: "Products supplied", deleteConfirm: "Delete this supplier?",
        empty: "No suppliers", totalOutstanding: "Total outstanding", suppliers: "Suppliers",
      },
      customers: {
        title: "Customer debts", totalDebt: "Total debt", paid: "Paid", remaining: "Remaining",
        addPayment: "Record payment", paymentAmount: "Amount", history: "Payment history",
        productsTaken: "Products taken", customerName: "Customer name", customerPhone: "Phone",
        noDebts: "No outstanding debts",
      },
      reports: {
        title: "Reports", dailySales: "Daily sales", monthlySales: "Monthly sales",
        mostSold: "Most sold products", bestCategories: "Best categories",
      },
      settings: {
        title: "Settings", store: "Store information", storeName: "Store name",
        storeAddress: "Address", storePhone: "Phone", invoice: "Invoice settings",
        invoiceFooter: "Invoice footer message", backup: "Backup",
        export: "Export data", import: "Import data", language: "Language",
        reset: "Reset data", resetConfirm: "Erase all data? This cannot be undone.",
      },
      dashboard: {
        title: "Dashboard", salesToday: "Sales today", salesMonth: "Sales this month",
        lowStockCount: "Low-stock products", unpaidDebts: "Unpaid debts",
        topProducts: "Top selling products", dailyRevenue: "Daily revenue (7 days)",
        bestCategories: "Best categories", nearExpiry: "Products near expiry",
      },
    },
  },
};

const savedLang =
  typeof window !== "undefined" ? localStorage.getItem("belle-lang") || "fr" : "fr";

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources, lng: savedLang, fallbackLng: "fr",
    interpolation: { escapeValue: false },
  });
}

export function setLanguage(lng: "fr" | "ar" | "en") {
  i18n.changeLanguage(lng);
  if (typeof window !== "undefined") {
    localStorage.setItem("belle-lang", lng);
    document.documentElement.lang = lng;
    document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
  }
}

if (typeof window !== "undefined") {
  document.documentElement.lang = savedLang;
  document.documentElement.dir = savedLang === "ar" ? "rtl" : "ltr";
}

export default i18n;
