"use client";

import { useEffect, useState } from "react";
import { requireValidSession, SessionExpiredError } from "@/lib/session-check";
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
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState(false);

  useEffect(() => {
    if (!_hasHydrated || !isAuthenticated) return;
    let active = true;
    let checking = false;
    const expired = () => {
      useAuthStore.setState({ user: null, isAuthenticated: false });
      window.location.replace("/login?reason=session-expired");
    };
    const check = async () => {
      if (checking || document.visibilityState === "hidden") return;
      checking = true;
      try {
        await requireValidSession();
        if (active) { setSessionReady(true); setSessionError(false); }
      } catch (error) {
        if (active && !(error instanceof SessionExpiredError)) setSessionError(true);
      } finally { checking = false; }
    };
    window.addEventListener("kupa-session-expired", expired);
    window.addEventListener("focus", check);
    window.addEventListener("online", check);
    document.addEventListener("visibilitychange", check);
    void check();
    return () => {
      active = false;
      window.removeEventListener("kupa-session-expired", expired);
      window.removeEventListener("focus", check);
      window.removeEventListener("online", check);
      document.removeEventListener("visibilitychange", check);
    };
  }, [_hasHydrated, isAuthenticated]);

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [_hasHydrated, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && sessionReady && !_loaded) {
      loadAll();
    }
  }, [isAuthenticated, sessionReady, _loaded, loadAll]);

  useEffect(() => {
    if (isAuthenticated && sessionReady && !opsLoaded) {
      loadOps();
    }
  }, [isAuthenticated, sessionReady, opsLoaded, loadOps]);

  if (!_hasHydrated) return null;
  if (!isAuthenticated) return null;
  if (!sessionReady) return <div className="p-6 text-center" role="status">
    {sessionError ? "Oturum kontrol edilemedi. İnternet bağlantınızı kontrol edin." : "Oturum kontrol ediliyor..."}
    {sessionError && <Button className="ml-3" onClick={() => window.location.reload()}>Tekrar dene</Button>}
  </div>;

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
