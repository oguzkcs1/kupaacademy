"use client";

import { cn } from "@/lib/utils";

export function scoreColor(score: number): string {
  if (score >= 90) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 70) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

export function scoreBg(score: number): string {
  if (score >= 90) return "bg-emerald-100 dark:bg-emerald-950/50";
  if (score >= 70) return "bg-amber-100 dark:bg-amber-950/50";
  return "bg-red-100 dark:bg-red-950/50";
}

export function ScoreBadge({ score, className }: { score?: number; className?: string }) {
  if (score == null) {
    return <span className={cn("text-xs text-muted-foreground", className)}>—</span>;
  }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums",
        scoreBg(score),
        scoreColor(score),
        className
      )}
    >
      {score}/100
    </span>
  );
}
