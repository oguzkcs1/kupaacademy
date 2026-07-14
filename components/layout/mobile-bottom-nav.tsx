"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Sunrise, Sunset, ChefHat, ClipboardCheck, Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore, useAuthStore } from "@/lib/store";

type NavItem = { label: string; href: string; icon: React.ElementType };

// Barista: sahada en sık kullandıkları — açılış/kapanış fotoğraf akışı
const baristaItems: NavItem[] = [
  { label: "Ana Sayfa", href: "/dashboard", icon: LayoutDashboard },
  { label: "Açılış", href: "/operations/opening", icon: Sunrise },
  { label: "Kapanış", href: "/operations/closing", icon: Sunset },
  { label: "Reçeteler", href: "/recipes", icon: ChefHat },
];

// Admin: operasyonu takip — denetimler öne çıkar
const adminItems: NavItem[] = [
  { label: "Ana Sayfa", href: "/dashboard", icon: LayoutDashboard },
  { label: "Operasyon", href: "/operations", icon: ClipboardCheck },
  { label: "Denetimler", href: "/operations/audits", icon: ClipboardCheck },
  { label: "Reçeteler", href: "/recipes", icon: ChefHat },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { setSidebarOpen } = useUIStore();
  const { user } = useAuthStore();
  const items = user?.role === "admin" ? adminItems : baristaItems;

  const isActive = (href: string) => {
    const exactOnly = href === "/dashboard" || href === "/operations";
    return pathname === href || (!exactOnly && pathname.startsWith(href + "/"));
  };

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5 h-16">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", active && "scale-110")} />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}
        {/* Menü — tam sidebar drawer'ı açar */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex flex-col items-center justify-center gap-1 text-muted-foreground active:text-foreground transition-colors"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-medium leading-none">Menü</span>
        </button>
      </div>
    </nav>
  );
}
