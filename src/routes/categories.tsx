import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";

import { AppLayout } from "@/components/AppLayout";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/categories")({
  head: () => ({ meta: [{ title: "Catégories — Belle Beauté POS" }] }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { t } = useTranslation();
  const categories = useStore((s) => s.categories);
  const products = useStore((s) => s.products);
  const addCategory = useStore((s) => s.addCategory);
  const updateCategory = useStore((s) => s.updateCategory);
  const deleteCategory = useStore((s) => s.deleteCategory);

  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const add = () => {
    if (!newName.trim()) return;
    addCategory(newName.trim());
    setNewName("");
  };

  return (
    <AppLayout title={t("categories.title")}>
      <div className="p-4 space-y-3 max-w-3xl">
        <div className="flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t("common.name")}
            onKeyDown={(e) => e.key === "Enter" && add()}
            className="flex-1 h-10 px-3 rounded-md border bg-background text-sm"
          />
          <button onClick={add} className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-2 hover:opacity-90">
            <Plus className="h-4 w-4" /> {t("categories.addCategory")}
          </button>
        </div>

        <div className="rounded-md border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-start">{t("common.name")}</th>
                <th className="px-3 py-2 text-end">{t("categories.productsCount")}</th>
                <th className="px-3 py-2 text-end">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => {
                const count = products.filter((p) => p.categoryId === c.id).length;
                const isEditing = editing === c.id;
                return (
                  <tr key={c.id} className="border-t hover:bg-muted/30">
                    <td className="px-3 py-2">
                      {isEditing ? (
                        <input
                          autoFocus
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") { updateCategory(c.id, editName); setEditing(null); }
                            if (e.key === "Escape") setEditing(null);
                          }}
                          className="h-8 px-2 rounded border bg-background text-sm w-full"
                        />
                      ) : (
                        c.name
                      )}
                    </td>
                    <td className="px-3 py-2 text-end num text-muted-foreground">{count}</td>
                    <td className="px-3 py-2 text-end">
                      <div className="inline-flex gap-1">
                        {isEditing ? (
                          <>
                            <button onClick={() => { updateCategory(c.id, editName); setEditing(null); }} className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-success/10 text-success">
                              <Check className="h-4 w-4" />
                            </button>
                            <button onClick={() => setEditing(null)} className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-muted">
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => { setEditing(c.id); setEditName(c.name); }} className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-muted">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => count === 0 && deleteCategory(c.id)}
                              disabled={count > 0}
                              className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-destructive/10 text-destructive disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
