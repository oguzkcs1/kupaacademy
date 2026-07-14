"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell, Search, Sun, Moon, LogOut, User, Settings, Menu, Command,
  CheckCheck, GraduationCap, Megaphone, Star,
} from "lucide-react";
import { KupaLogo } from "@/components/kupa-logo";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore, useUIStore } from "@/lib/store";
import { useDataStore } from "@/lib/data-store";
import { getInitials, ROLE_LABELS, formatRelativeTime } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ContentType } from "@/types";

const notifIcons: Record<ContentType | "system", React.ElementType> = {
  training: GraduationCap,
  system: Star,
  announcement: Megaphone,
  video: Bell,
  sop: Bell,
  recipe: Bell,
  product: Bell,
  document: Bell,
};

export function Header() {
  const { user, logout } = useAuthStore();
  const { setSidebarOpen } = useUIStore();
  const { getUserNotifications, markNotificationRead, markAllNotificationsRead } = useDataStore();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const notifications = user ? getUserNotifications(user.id) : [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(searchQuery.trim() ? `/search?q=${encodeURIComponent(searchQuery.trim())}` : "/search");
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="h-14 border-b border-border/70 bg-card/95 backdrop-blur-xl supports-[backdrop-filter]:bg-card/85 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center justify-between h-full px-5 gap-4">
        {/* Mobile menu */}
        <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8" onClick={() => setSidebarOpen(true)}>
          <Menu className="h-4 w-4" />
        </Button>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-sm hidden md:block">
          <div className="relative">
            <Search className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 transition-colors duration-200",
              searchFocused ? "text-primary" : "text-muted-foreground"
            )} />
            <Input
              placeholder="Ara..."
              className={cn(
                "pl-9 pr-12 h-9 text-sm bg-muted/60 border-transparent transition-all duration-200",
                "focus:bg-background focus:border-border focus:ring-0 focus-visible:ring-1 focus-visible:ring-primary/30"
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 text-[10px] text-muted-foreground/60 font-mono">
              <Command className="h-2.5 w-2.5" />K
            </kbd>
          </div>
        </form>

        {/* Mobil logo (arama gizliyken) */}
        <Link href="/dashboard" className="md:hidden flex items-center">
          <KupaLogo variant="color" width={78} height={34} />
        </Link>
        <div className="flex-1 md:hidden" />

        {/* Right actions */}
        <div className="flex items-center gap-1">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground relative">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-primary text-[10px] text-white font-bold flex items-center justify-center ring-2 ring-background">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80" sideOffset={8}>
              <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
                <p className="text-sm font-semibold">Bildirimler</p>
                {unreadCount > 0 && (
                  <button
                    onClick={() => user && markAllNotificationsRead(user.id)}
                    className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                  >
                    <CheckCheck className="w-3 h-3" />
                    Tümünü okundu say
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">Bildirim yok</p>
                  </div>
                ) : (
                  notifications.slice(0, 10).map((n) => {
                    const Icon = notifIcons[n.type] || Bell;
                    return (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={cn(
                          "flex items-start gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/50 transition-colors border-b border-border/30 last:border-0",
                          !n.read && "bg-primary/5"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                          n.type === "system" ? "bg-amber-100 dark:bg-amber-950" : "bg-primary/10"
                        )}>
                          <Icon className={cn("w-4 h-4", n.type === "system" ? "text-amber-600" : "text-primary")} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm font-medium", !n.read && "font-semibold")}>{n.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[11px] text-muted-foreground/60 mt-1">{formatRelativeTime(n.createdAt)}</p>
                        </div>
                        {!n.read && (
                          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Separator */}
          <div className="h-5 w-px bg-border mx-1" />

          {/* User menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-muted/60 transition-colors">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-[11px] bg-primary/10 text-primary font-semibold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-medium leading-tight">{user.name}</p>
                    <p className="text-[11px] text-muted-foreground leading-tight">{ROLE_LABELS[user.role]}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" sideOffset={8}>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">@{user.username}</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <User className="mr-2 h-4 w-4" /> Profilim
                </DropdownMenuItem>
                {user.role === "admin" && (
                  <DropdownMenuItem onClick={() => router.push("/admin/settings")}>
                    <Settings className="mr-2 h-4 w-4" /> Ayarlar
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> Çıkış Yap
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
