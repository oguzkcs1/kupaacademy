"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Trash2, Megaphone, MoreHorizontal, AlertCircle, Info, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDataStore } from "@/lib/data-store";
import { formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const priorityConfig = {
  high: { label: "Önemli", icon: AlertCircle, dot: "bg-red-500", badge: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" },
  medium: { label: "Normal", icon: Info, dot: "bg-amber-500", badge: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
  low: { label: "Bilgi", icon: CheckCircle2, dot: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
};

export default function AdminAnnouncementsPage() {
  const { announcements, deleteAnnouncement, updateAnnouncement } = useDataStore();
  const [search, setSearch] = useState("");

  const filtered = announcements.filter((a) => !search || a.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl font-bold tracking-tight">Duyuru Yönetimi</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{announcements.length} duyuru</p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/announcements/new"><Plus className="w-4 h-4" />Yeni Duyuru</Link>
        </Button>
      </motion.div>

      <Card>
        <div className="p-4 border-b border-border/50">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Duyuru ara..." className="pl-9 h-9 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <CardContent className="p-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Megaphone className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Duyuru bulunamadı</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((ann, i) => {
                const cfg = priorityConfig[ann.priority];
                const Icon = cfg.icon;
                return (
                  <motion.div
                    key={ann.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-muted/40 transition-colors group"
                  >
                    <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", cfg.dot)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{ann.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn("text-[11px] px-2 py-0.5 rounded-full font-medium", cfg.badge)}>{cfg.label}</span>
                        <span className={cn(
                          "text-[11px] px-2 py-0.5 rounded-full font-medium",
                          ann.status === "published"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        )}>
                          {ann.status === "published" ? "Yayında" : "Taslak"}
                        </span>
                        <span className="text-xs text-muted-foreground">{formatRelativeTime(ann.createdAt)}</span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          updateAnnouncement(ann.id, { status: ann.status === "published" ? "draft" : "published" });
                          toast.success("Durum güncellendi");
                        }}>
                          {ann.status === "published" ? "Taslağa Al" : "Yayınla"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => { deleteAnnouncement(ann.id); toast.success("Duyuru silindi"); }}>
                          <Trash2 className="mr-2 h-4 w-4" />Sil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
