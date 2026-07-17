"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { PieChart, TrendingUp, AlertCircle, Trophy, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { scoreColor } from "@/components/operations/score-badge";
import { useOpsStore } from "@/lib/ops-store";
import { useDataStore } from "@/lib/data-store";
import { MAX_ITEM_SCORE } from "@/types/operations";
import { cn } from "@/lib/utils";

function barColor(pct: number): string {
  if (pct >= 90) return "bg-emerald-500";
  if (pct >= 70) return "bg-amber-500";
  return "bg-red-500";
}

function HBar({ label, value, detail, delay }: { label: string; value: number; detail?: string; delay: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium truncate">{label}</span>
        <span className={cn("font-bold tabular-nums text-xs", scoreColor(value))}>
          {value}{detail ?? "/100"}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.7, delay, ease: "easeOut" }}
          className={cn("h-full rounded-full", barColor(value))}
        />
      </div>
    </div>
  );
}

export default function OpsReportsPage() {
  const { runs, templates } = useOpsStore();
  const { branches: dataBranches } = useDataStore();
  const branches = dataBranches;
  const activeBranches = branches.filter((b) => b.status === "active");

  const scoredRuns = useMemo(() => runs.filter((r) => r.score != null), [runs]);

  // ── Şube karşılaştırması
  const branchStats = useMemo(
    () =>
      activeBranches
        .map((b) => {
          const bRuns = scoredRuns.filter((r) => r.branchId === b.id);
          return {
            branch: b,
            avg: bRuns.length
              ? Math.round(bRuns.reduce((a, r) => a + (r.score ?? 0), 0) / bRuns.length)
              : null,
            count: bRuns.length,
          };
        })
        .filter((s) => s.avg !== null)
        .sort((a, b) => b.avg! - a.avg!),
    [activeBranches, scoredRuns]
  );

  // ── Kategori bazlı başarı
  const categoryStats = useMemo(() => {
    const acc = new Map<string, { title: string; emoji: string; earned: number; max: number }>();
    for (const run of scoredRuns) {
      const template = templates.find((t) => t.id === run.templateId);
      if (!template) continue;
      for (const section of run.sections) {
        const tpl = template.sections.find((s) => s.id === section.sectionId);
        if (!tpl) continue;
        const cur = acc.get(tpl.title) ?? { title: tpl.title, emoji: tpl.emoji, earned: 0, max: 0 };
        for (const item of section.items) {
          cur.earned += item.score ?? 0;
          cur.max += MAX_ITEM_SCORE;
        }
        acc.set(tpl.title, cur);
      }
    }
    return Array.from(acc.values())
      .map((c) => ({ ...c, pct: c.max ? Math.round((c.earned / c.max) * 100) : 0 }))
      .sort((a, b) => b.pct - a.pct);
  }, [scoredRuns, templates]);

  // ── En çok eksik yapılan maddeler (puanı 3'ün altında olanlar)
  const weakItems = useMemo(() => {
    const acc = new Map<string, { label: string; section: string; count: number }>();
    for (const run of scoredRuns) {
      const template = templates.find((t) => t.id === run.templateId);
      if (!template) continue;
      for (const section of run.sections) {
        const tpl = template.sections.find((s) => s.id === section.sectionId);
        if (!tpl) continue;
        for (const item of section.items) {
          if (item.score !== null && item.score < 3) {
            const itemTpl = tpl.items.find((t) => t.id === item.itemId);
            if (!itemTpl) continue;
            const cur = acc.get(item.itemId) ?? { label: itemTpl.label, section: tpl.title, count: 0 };
            cur.count += 1;
            acc.set(item.itemId, cur);
          }
        }
      }
    }
    return Array.from(acc.values()).sort((a, b) => b.count - a.count).slice(0, 6);
  }, [scoredRuns, templates]);

  // ── Son 7 gün trendi
  const weekTrend = useMemo(() => {
    const days: { label: string; date: string; avg: number | null }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const date = d.toISOString().slice(0, 10);
      const dayRuns = scoredRuns.filter((r) => r.date === date);
      days.push({
        label: d.toLocaleDateString("tr-TR", { weekday: "short" }),
        date,
        avg: dayRuns.length
          ? Math.round(dayRuns.reduce((a, r) => a + (r.score ?? 0), 0) / dayRuns.length)
          : null,
      });
    }
    return days;
  }, [scoredRuns]);

  const best = branchStats[0];
  const worst = branchStats[branchStats.length - 1];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-teal-100 dark:bg-teal-950/50 flex items-center justify-center">
          <PieChart className="w-5 h-5 text-teal-600 dark:text-teal-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Operasyon Raporları</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {scoredRuns.length} tamamlanmış denetim üzerinden
          </p>
        </div>
      </div>

      {/* En iyi / en düşük özet */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="stat-accent-emerald">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center flex-shrink-0">
              <Trophy className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">En Başarılı Şube</p>
              <p className="font-bold truncate">{best?.branch.name ?? "—"}</p>
              {best && <p className={cn("text-sm font-bold tabular-nums", scoreColor(best.avg!))}>{best.avg}/100</p>}
            </div>
          </CardContent>
        </Card>
        <Card className="border-t-2 border-t-red-500">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/50 flex items-center justify-center flex-shrink-0">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">En Düşük Puanlı Şube</p>
              <p className="font-bold truncate">{worst?.branch.name ?? "—"}</p>
              {worst && <p className={cn("text-sm font-bold tabular-nums", scoreColor(worst.avg!))}>{worst.avg}/100</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Şube karşılaştırması */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              Şube Karşılaştırması
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {branchStats.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Henüz veri yok</p>
            ) : (
              branchStats.map((s, i) => (
                <HBar key={s.branch.id} label={s.branch.name} value={s.avg!} delay={0.1 + i * 0.08} />
              ))
            )}
          </CardContent>
        </Card>

        {/* Kategori bazlı başarı */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="w-4 h-4 text-muted-foreground" />
              Kategori Bazlı Başarı
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryStats.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Henüz veri yok</p>
            ) : (
              categoryStats.map((c, i) => (
                <HBar key={c.title} label={`${c.emoji} ${c.title}`} value={c.pct} delay={0.1 + i * 0.06} />
              ))
            )}
          </CardContent>
        </Card>

        {/* Haftalık trend */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Son 7 Gün Ortalama Puan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-40 pt-2">
              {weekTrend.map((d, i) => (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  {d.avg !== null && (
                    <span className={cn("text-[11px] font-bold tabular-nums", scoreColor(d.avg))}>{d.avg}</span>
                  )}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: d.avg !== null ? `${Math.max(d.avg, 4)}%` : "4%" }}
                    transition={{ duration: 0.6, delay: 0.15 + i * 0.06, ease: "easeOut" }}
                    className={cn(
                      "w-full max-w-10 rounded-t-lg",
                      d.avg !== null ? barColor(d.avg) : "bg-muted"
                    )}
                  />
                  <span className="text-[11px] text-muted-foreground">{d.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* En çok eksik yapılan maddeler */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-muted-foreground" />
              En Çok Eksik Yapılan Maddeler
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weakItems.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Harika! Düşük puanlı madde yok 🎉
              </p>
            ) : (
              <div className="space-y-2">
                {weakItems.map((w, i) => (
                  <motion.div
                    key={`${w.section}-${w.label}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/40 transition-colors"
                  >
                    <span className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{w.label}</p>
                      <p className="text-xs text-muted-foreground">{w.section}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs flex-shrink-0">
                      {w.count} kez
                    </Badge>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
