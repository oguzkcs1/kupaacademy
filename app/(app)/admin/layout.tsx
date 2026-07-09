"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { ShieldAlert } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, _hasHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (_hasHydrated && user?.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [_hasHydrated, user, router]);

  if (!_hasHydrated) return null;

  if (user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <ShieldAlert className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold">Erişim Reddedildi</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          Bu sayfaya erişmek için yönetici yetkisi gerekiyor.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
