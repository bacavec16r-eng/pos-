import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Download, Upload, RotateCcw } from "lucide-react";

import { AppLayout } from "@/components/AppLayout";
import { useStore } from "@/lib/store";
import { setLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Paramètres — Djazair Market POS" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { t, i18n } = useTranslation();
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const resetAll = useStore((s) => s.resetAll);
  const importData = useStore((s) => s.importData);

  const exportAll = () => {
    const state = useStore.getState();
    const data = {
      categories: state.categories,
      products: state.products,
      sales: state.sales,
      debts: state.debts,
      settings: state.settings,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `djazair-pos-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("settings.export"));
  };

  const importAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    f.text().then((txt) => {
      try {
        const data = JSON.parse(txt);
        importData(data);
        toast.success(t("settings.import"));
      } catch {
        toast.error("Invalid file");
      }
    });
    e.target.value = "";
  };

  return (
    <AppLayout title={t("settings.title")}>
      <div className="p-4 space-y-4 max-w-2xl">
        <Section title={t("settings.store")}>
          <Row label={t("settings.storeName")}>
            <input
              value={settings.storeName}
              onChange={(e) => updateSettings({ storeName: e.target.value })}
              className="inp"
            />
          </Row>
          <Row label={t("settings.storeAddress")}>
            <input
              value={settings.storeAddress}
              onChange={(e) => updateSettings({ storeAddress: e.target.value })}
              className="inp"
            />
          </Row>
          <Row label={t("settings.storePhone")}>
            <input
              value={settings.storePhone}
              onChange={(e) => updateSettings({ storePhone: e.target.value })}
              className="inp num"
            />
          </Row>
        </Section>

        <Section title={t("settings.invoice")}>
          <Row label={t("settings.invoiceFooter")}>
            <input
              value={settings.invoiceFooter}
              onChange={(e) => updateSettings({ invoiceFooter: e.target.value })}
              className="inp"
            />
          </Row>
        </Section>

        <Section title={t("settings.language")}>
          <Row label={t("settings.language")}>
            <select
              value={i18n.language}
              onChange={(e) => setLanguage(e.target.value as "fr" | "ar" | "en")}
              className="inp"
            >
              <option value="fr">Français</option>
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </Row>
        </Section>

        <Section title={t("settings.backup")}>
          <div className="flex flex-wrap gap-2">
            <button onClick={exportAll} className="h-10 px-4 rounded-md border text-sm inline-flex items-center gap-2 hover:bg-muted">
              <Download className="h-4 w-4" /> {t("settings.export")}
            </button>
            <label className="h-10 px-4 rounded-md border text-sm inline-flex items-center gap-2 hover:bg-muted cursor-pointer">
              <Upload className="h-4 w-4" /> {t("settings.import")}
              <input type="file" accept="application/json" className="hidden" onChange={importAll} />
            </label>
            <button
              onClick={() => {
                if (confirm(t("settings.resetConfirm"))) {
                  resetAll();
                  toast.success(t("settings.reset"));
                }
              }}
              className="h-10 px-4 rounded-md border border-destructive/40 text-destructive text-sm inline-flex items-center gap-2 hover:bg-destructive/10"
            >
              <RotateCcw className="h-4 w-4" /> {t("settings.reset")}
            </button>
          </div>
        </Section>
      </div>

      <style>{`.inp{height:2.25rem;padding:0 .75rem;border-radius:6px;border:1px solid var(--color-input);background:var(--color-background);font-size:.875rem;width:100%}`}</style>
    </AppLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border bg-card">
      <div className="px-4 py-3 border-b text-sm font-semibold">{title}</div>
      <div className="p-4 space-y-3">{children}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid sm:grid-cols-[180px_1fr] gap-2 items-center">
      <span className="text-sm text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
