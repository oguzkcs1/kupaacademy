"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, GraduationCap, Video, FileText, ChefHat,
  Package, Megaphone, FolderOpen, ClipboardList, Users, Award,
  BarChart3, Settings, Image, ChevronLeft, ChevronRight, Tag,
  Building2, Sunrise, Sunset, ClipboardCheck, Camera, ListTodo, PieChart,
  Store, ListChecks, Briefcase,
} from "lucide-react";
import { X } from "lucide-react";
import { KupaLogo } from "@/components/kupa-logo";
import { cn } from "@/lib/utils";
import { useUIStore, useAuthStore } from "@/lib/store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ROLE_LABELS, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { label: "Ana Sayfa", href: "/dashboard", icon: LayoutDashboard },
  { type: "separator", label: "İÇERİKLER" },
  { label: "Eğitimler", href: "/trainings", icon: GraduationCap },
  { label: "Videolar", href: "/videos", icon: Video },
  { label: "Reçeteler", href: "/recipes", icon: ChefHat },
  { label: "Ürünler", href: "/products", icon: Package },
  { label: "Dokümanlar", href: "/documents", icon: FolderOpen },
  { type: "separator", label: "OPERASYON MERKEZİ" },
  { label: "Operasyon Paneli", href: "/operations", icon: Building2 },
  { label: "Açılış Kontrolü", href: "/operations/opening", icon: Sunrise },
  { label: "Kapanış Kontrolü", href: "/operations/closing", icon: Sunset },
  { label: "Günlük Denetimler", href: "/operations/audits", icon: ClipboardCheck, adminOnly: true },
  { label: "Fotoğraf Galerisi", href: "/operations/gallery", icon: Camera },
  { label: "Görevler", href: "/operations/tasks", icon: ListTodo },
  { label: "Operasyon Raporları", href: "/operations/reports", icon: PieChart, adminOnly: true },
  { type: "separator", label: "YÖNETİM" },
  { label: "Duyurular", href: "/announcements", icon: Megaphone },
  { label: "Sınavlar", href: "/quizzes", icon: ClipboardList },
  { label: "Rozetler", href: "/badges", icon: Award },
  { type: "separator", label: "ADMİN", adminOnly: true },
  { label: "Eğitim Yönetimi", href: "/admin/trainings", icon: GraduationCap, adminOnly: true },
  { label: "Video Yönetimi", href: "/admin/videos", icon: Video, adminOnly: true },
  { label: "Reçete Yönetimi", href: "/admin/recipes", icon: ChefHat, adminOnly: true },
  { label: "Kategori Yönetimi", href: "/admin/categories", icon: Tag, adminOnly: true },
  { label: "Şube Yönetimi", href: "/admin/branches", icon: Store, adminOnly: true },
  { label: "Checklist Yönetimi", href: "/admin/checklists", icon: ListChecks, adminOnly: true },
  { label: "Doküman Yönetimi", href: "/admin/documents", icon: FolderOpen, adminOnly: true },
  { label: "Duyuru Yönetimi", href: "/admin/announcements", icon: Megaphone, adminOnly: true },
  { label: "Kullanıcılar", href: "/admin/users", icon: Users, adminOnly: true },
  { label: "Kariyer Başvuruları", href: "/admin/applications", icon: Briefcase, adminOnly: true },
  { label: "Medya Kütüphanesi", href: "/admin/media", icon: Image, adminOnly: true },
  { label: "Raporlar", href: "/admin/reports", icon: BarChart3, adminOnly: true },
  { label: "Ayarlar", href: "/admin/settings", icon: Settings, adminOnly: true },
];

/** Sidebar iç içeriği — hem masaüstü hem mobil drawer tarafından kullanılır */
function SidebarContent({ collapsed, onNavClick }: { collapsed: boolean; onNavClick?: () => void }) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";
  const filtered = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <>
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-3 border-b border-[hsl(var(--sidebar-border))] flex-shrink-0">
        {collapsed ? (
          <KupaLogo variant="dark" width={44} height={44} className="rounded" />
        ) : (
          <KupaLogo variant="dark" width={130} height={65} />
        )}
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 py-3">
        <nav className="px-2.5 space-y-0.5">
          {filtered.map((item, i) => {
            if (item.type === "separator") {
              return (
                <div key={i} className={cn("pt-4 pb-1", collapsed ? "hidden" : "block")}>
                  <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--sidebar-foreground))]/35">
                    {item.label}
                  </p>
                </div>
              );
            }

            const Icon = item.icon!;
            const exactOnly = item.href === "/dashboard" || item.href === "/operations";
            const isActive = pathname === item.href || (!exactOnly && pathname.startsWith(item.href + "/"));

            return (
              <Link
                key={item.href}
                href={item.href!}
                onClick={onNavClick}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-3 lg:py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer relative overflow-hidden",
                  collapsed && "justify-center px-0",
                  isActive
                    ? "text-white bg-primary/25 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
                    : "text-[hsl(var(--sidebar-foreground))]/60 hover:text-white hover:bg-[hsl(var(--sidebar-accent))]"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 bg-primary rounded-full" />
                )}
                <Icon className={cn(
                  "flex-shrink-0 transition-colors duration-200",
                  collapsed ? "w-5 h-5" : "w-4 h-4",
                  isActive ? "text-primary" : "text-[hsl(var(--sidebar-foreground))]/50 group-hover:text-white/80"
                )} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User */}
      {user && (
        <div className="border-t border-[hsl(var(--sidebar-border))] p-3 flex-shrink-0">
          <div className={cn(
            "flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-[hsl(var(--sidebar-accent))] cursor-pointer",
            collapsed && "justify-center px-0"
          )}>
            <Avatar className="w-8 h-8 flex-shrink-0 ring-2 ring-primary/30">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-xs bg-primary/20 text-primary font-semibold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="overflow-hidden flex-1 min-w-0">
                <p className="text-sm font-medium text-white/85 truncate leading-tight">{user.name}</p>
                <p className="text-xs text-[hsl(var(--sidebar-foreground))]/40 truncate">{ROLE_LABELS[user.role]}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/** Masaüstü sidebar — akışta, daraltılabilir (lg ve üzeri) */
export function Sidebar() {
  const { sidebarCollapsed, toggleSidebarCollapse } = useUIStore();

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 68 : 256 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="hidden lg:flex flex-col h-screen bg-[hsl(var(--sidebar-background))] border-r border-[hsl(var(--sidebar-border))] relative flex-shrink-0 overflow-hidden shadow-lg shadow-black/20"
    >
      <SidebarContent collapsed={sidebarCollapsed} />

      {/* Collapse button */}
      <button
        onClick={toggleSidebarCollapse}
        className="absolute -right-3 top-[72px] h-6 w-6 rounded-full border border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))]/60 hover:text-white flex items-center justify-center shadow-md transition-colors z-10"
      >
        {sidebarCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </motion.aside>
  );
}

/** Mobil off-canvas drawer — hamburgerle açılır (lg altı) */
export function MobileSidebar() {
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSidebarOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          {/* Drawer */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className="absolute left-0 top-0 h-full w-[280px] max-w-[85vw] flex flex-col bg-[hsl(var(--sidebar-background))] border-r border-[hsl(var(--sidebar-border))] shadow-2xl"
          >
            <button
              onClick={() => setSidebarOpen(false)}
              aria-label="Menüyü kapat"
              className="absolute right-3 top-4 h-9 w-9 rounded-lg text-[hsl(var(--sidebar-foreground))]/60 hover:text-white hover:bg-[hsl(var(--sidebar-accent))] flex items-center justify-center z-10"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent collapsed={false} onNavClick={() => setSidebarOpen(false)} />
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
