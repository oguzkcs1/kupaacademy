"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar, MobileSidebar } from "./sidebar";
import { Header } from "./header";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { useAuthStore } from "@/lib/store";
import { useDataStore } from "@/lib/data-store";
import { useOpsStore } from "@/lib/ops-store";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const { loadAll, retryLoad, _loaded, _error } = useDataStore();
  const { loadAll: loadOps, retryLoad: retryOps, _loaded: opsLoaded, _error: opsError } = useOpsStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [_hasHydrated, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && !_loaded) {
      loadAll();
    }
  }, [isAuthenticated, _loaded, loadAll]);

  useEffect(() => {
    if (isAuthenticated && !opsLoaded) {
      loadOps();
    }
  }, [isAuthenticated, opsLoaded, loadOps]);

  if (!_hasHydrated) return null;
  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <MobileSidebar />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Header />
        {(_error || opsError) && (
          <div className="mx-4 mt-3 sm:mx-6 flex items-center gap-3 rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <p className="min-w-0 flex-1 text-sm">{_error || opsError}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => (_error ? retryLoad() : retryOps())}
              className="h-8 shrink-0"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Tekrar Dene
            </Button>
          </div>
        )}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="p-4 sm:p-6 pb-24 lg:pb-10 max-w-[1600px]"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
