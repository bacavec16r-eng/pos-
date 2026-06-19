import { useEffect, useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppLayout({ title, children }: { title: string; children: ReactNode }) {
  // Defer rendering store-driven UI to client to avoid SSR/CSR mismatch
  // (zustand persist rehydrates only in the browser, and several formats
  //  depend on locale / Date.now() which differ between server and client).
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={title} />
        <main className="flex-1 overflow-auto bg-background" suppressHydrationWarning>
          {mounted ? children : null}
        </main>
      </div>
    </div>
  );
}
