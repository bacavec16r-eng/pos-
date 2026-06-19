import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { setLanguage } from "@/lib/i18n";
import { Clock, Globe } from "lucide-react";

export function Topbar({ title }: { title: string }) {
  const { i18n } = useTranslation();
  // Render time only after mount to avoid SSR/CSR mismatch.
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="h-14 shrink-0 bg-topbar text-topbar-foreground border-b flex items-center justify-between px-4">
      <h1 className="text-lg font-semibold">{title}</h1>
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground num min-w-[12rem] justify-end" suppressHydrationWarning>
          <Clock className="h-4 w-4" />
          <span suppressHydrationWarning>
            {now ? now.toLocaleString(i18n.language === "ar" ? "ar-DZ" : i18n.language) : ""}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <select
            value={i18n.language}
            onChange={(e) =>
              setLanguage(e.target.value as "fr" | "ar" | "en")
            }
            className="h-8 rounded-md border bg-background px-2 text-sm"
          >
            <option value="fr">Français</option>
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>
    </header>
  );
}
