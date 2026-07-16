"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Crown, Flame, TrendingUp, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useOpsStore } from "@/lib/ops-store";
import { useDataStore } from "@/lib/data-store";
import { useAuthStore } from "@/lib/store";
import { mockBranches } from "@/lib/mock-data";
import { scoreColor } from "@/components/operations/score-badge";
import { cn } from "@/lib/utils";

type Period = "week" | "month" | "all";

const periods: { key: Period; label: string }[] = [
  { key: "week", label: "Bu Hafta" },
  { key: "month", label: "Bu Ay" },
  { key: "all", label: "Tüm Zamanlar" },
];

function inPeriod(date: string, period: Period): boolean {
  if (period === "all") return true;
  const d = new Date(date + "T00:00:00");
  const now = new Date();
  if (period === "month") {
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }
  // week: son 7 gün
  const diff = (now.getTime() - d.getTime()) / 86400000;
  return diff <= 7;
}

export default function LeaderboardPage() {
  const { user } = useAuthStore();
  const { runs } = useOpsStore();
  const { branches: dataBranches } = useDataStore();
  const branches = (dataBranches.length > 0 ? dataBranches : mockBranches).filter((b) => b.status === "active");
  const [period, setPeriod] = useState<Period>("month");

  const ranking = useMemo(() => {
    const scored = runs.filter((r) => r.score != null && inPeriod(r.date, period));
    const byBranch = branches.map((b) => {
      const rs = scored.filter((r) => r.branchId === b.id);
      const avg = rs.length ? Math.round(rs.reduce((a, r) => a + (r.score ?? 0), 0) / rs.length) : null;
      return { branch: b, avg, count: rs.length };
    });
    // puanı olanlar önce, yüksekten düşüğe; puanı olmayanlar en sonda
    return byBranch.sort((a, b) => {
      if (a.avg == null && b.avg == null) return 0;
      if (a.avg == null) return 1;
      if (b.avg == null) return -1;
      return b.avg - a.avg;
    });
  }, [runs, branches, period]);

  const myBranchId = user?.branchId;
  const podium = ranking.filter((r) => r.avg != null).slice(0, 3);
  const rest = ranking.filter((r) => r.avg != null).slice(3);
  const noData = ranking.every((r) => r.avg == null);

  const medalColor = ["text-amber-500", "text-slate-400", "text-orange-600"];
  const podiumBg = [
    "from-amber-100 to-amber-50 dark:from-amber-950/40 dark:to-transparent border-amber-300 dark:border-amber-800",
    "from-slate-100 to-slate-50 dark:from-slate-800/40 dark:to-transparent border-slate-300 dark:border-slate-700",
    "from-orange-100 to-orange-50 dark:from-orange-950/40 dark:to-transparent border-orange-300 dark:border-orange-800",
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Başlık */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center">
          <Trophy className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Şube Şampiyonası</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Operasyon puanına göre şube sıralaması — hadi zirveye! 🔥
          </p>
        </div>
      </div>

      {/* Dönem seçimi */}
      <div className="flex gap-2">
        {periods.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-medium transition-all",
              period === p.key ? "bg-primary text-white shadow-sm"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {noData ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Bu dönem için henüz puan yok</p>
            <p className="text-xs mt-1">Kontroller tamamlanıp puanlandıkça sıralama oluşacak.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Podyum — ilk 3 */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            {podium.map((r, i) => {
              const isMine = r.branch.id === myBranchId;
              return (
                <Card
                  key={r.branch.id}
                  className={cn(
                    "relative overflow-hidden bg-gradient-to-b border-2",
                    podiumBg[i],
                    i === 0 && "sm:-translate-y-2",
                    isMine && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  )}
                >
                  <CardContent className="p-5 text-center">
                    {i === 0 ? (
                      <Crown className={cn("w-7 h-7 mx-auto", medalColor[i])} />
                    ) : (
                      <Medal className={cn("w-7 h-7 mx-auto", medalColor[i])} />
                    )}
                    <p className="text-2xl font-bold mt-2">{i + 1}.</p>
                    <p className="font-semibold text-sm mt-1 truncate">{r.branch.name}</p>
                    <p className={cn("text-3xl font-bold tabular-nums mt-2", scoreColor(r.avg!))}>{r.avg}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{r.count} kontrol</p>
                    {isMine && (
                      <span className="inline-block mt-2 text-[10px] font-semibold text-primary bg-primary/10 rounded-full px-2 py-0.5">
                        SENİN ŞUBEN
                      </span>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </motion.div>

          {/* Kalan sıralama */}
          {rest.length > 0 && (
            <Card>
              <CardContent className="p-0 divide-y divide-border">
                {rest.map((r, i) => {
                  const rank = i + 4;
                  const isMine = r.branch.id === myBranchId;
                  return (
                    <div
                      key={r.branch.id}
                      className={cn(
                        "flex items-center gap-4 px-5 py-3.5",
                        isMine && "bg-primary/5"
                      )}
                    >
                      <span className="w-7 text-center font-bold text-muted-foreground tabular-nums">{rank}</span>
                      <span className="flex-1 font-medium text-sm">
                        {r.branch.name}
                        {isMine && <span className="ml-2 text-[10px] font-semibold text-primary">· Senin şuben</span>}
                      </span>
                      <span className="text-xs text-muted-foreground">{r.count} kontrol</span>
                      <span className={cn("font-bold tabular-nums w-10 text-right", scoreColor(r.avg!))}>{r.avg}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Motivasyon kartı */}
          <Card className="bg-gradient-to-r from-primary/[0.06] to-transparent border-primary/20">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Flame className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Sıralamada yüksel!</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Açılış ve kapanış kontrollerini eksiksiz ve özenle yaparak şubenin
                  puanını yükselt. Her detay sıralamada fark yaratır.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
