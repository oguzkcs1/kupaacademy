"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Megaphone, AlertCircle, Info, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/lib/store";
import { useDataStore } from "@/lib/data-store";
import { formatRelativeTime } from "@/lib/utils";
import type { Announcement } from "@/types";
import { cn } from "@/lib/utils";

const priorityConfig = {
  high: {
    icon: AlertCircle,
    label: "Önemli",
    class: "text-red-600 bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-900",
    badge: "destructive" as const,
  },
  medium: {
    icon: Info,
    label: "Normal",
    class: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/50 border-yellow-200 dark:border-yellow-900",
    badge: "warning" as const,
  },
  low: {
    icon: CheckCircle2,
    label: "Bilgi",
    class: "text-green-600 bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-900",
    badge: "success" as const,
  },
};

function AnnouncementCard({ ann }: { ann: Announcement }) {
  const config = priorityConfig[ann.priority];
  const Icon = config.icon;

  return (
    <Card className={cn("border", config.class)}>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="mt-0.5 flex-shrink-0">
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold">{ann.title}</h3>
              <Badge variant={config.badge} className="shrink-0 text-xs">
                {config.label}
              </Badge>
            </div>
            <p className="text-sm mt-2 leading-relaxed opacity-90">{ann.content}</p>
            <p className="text-xs opacity-60 mt-3">{formatRelativeTime(ann.createdAt)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const priorityRank = { high: 0, medium: 1, low: 2 };

export default function AnnouncementsPage() {
  const { user } = useAuthStore();
  const { announcements } = useDataStore();
  const isAdmin = user?.role === "admin";

  // Barista: yalnızca yayınlanmış + kendisine hedeflenmiş duyurular
  const visible = announcements
    .filter((a) => {
      if (isAdmin) return true;
      if (a.status !== "published") return false;
      const roleOk = !a.targetRoles?.length || a.targetRoles.includes(user!.role);
      const branchOk = !a.targetBranches?.length || (user?.branchId ? a.targetBranches.includes(user.branchId) : false);
      return roleOk && branchOk;
    })
    .sort((a, b) => {
      const p = priorityRank[a.priority] - priorityRank[b.priority];
      if (p !== 0) return p;
      return b.createdAt.localeCompare(a.createdAt);
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Duyurular</h1>
          <p className="text-muted-foreground mt-1">{visible.length} duyuru</p>
        </div>
        {isAdmin && (
          <Button asChild>
            <Link href="/admin/announcements/new">
              <Plus className="w-4 h-4" />
              Yeni Duyuru
            </Link>
          </Button>
        )}
      </div>

      {visible.length > 0 ? (
        <div className="space-y-3">
          {visible.map((ann) => (
            <AnnouncementCard key={ann.id} ann={ann} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Megaphone className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">Duyuru bulunmuyor</p>
        </div>
      )}
    </div>
  );
}
