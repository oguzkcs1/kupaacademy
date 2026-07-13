"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RunStatus } from "@/types/operations";

const config: Record<RunStatus, { label: string; className: string }> = {
  pending: {
    label: "Bekliyor",
    className: "bg-muted text-muted-foreground border-transparent",
  },
  in_progress: {
    label: "Devam Ediyor",
    className: "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400 border-transparent",
  },
  completed: {
    label: "Onay Bekliyor",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-transparent",
  },
  approved: {
    label: "Onaylandı",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-transparent",
  },
  revision: {
    label: "Revize",
    className: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400 border-transparent",
  },
};

export function RunStatusBadge({ status, className }: { status: RunStatus; className?: string }) {
  const c = config[status];
  return <Badge className={cn(c.className, "font-medium", className)}>{c.label}</Badge>;
}
