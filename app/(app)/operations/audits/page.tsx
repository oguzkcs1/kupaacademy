"use client";

import { useState } from "react";
import Link from "next/link";
import { ClipboardCheck, Sunrise, Sunset, Camera, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { RunStatusBadge } from "@/components/operations/run-status-badge";
import { ScoreBadge } from "@/components/operations/score-badge";
import { useOpsStore } from "@/lib/ops-store";
import { useDataStore } from "@/lib/data-store";
import { mockBranches } from "@/lib/mock-data";
import { formatRelativeTime } from "@/lib/utils";

export default function AuditsPage() {
  const { runs, photos } = useOpsStore();
  const { branches: dataBranches, users } = useDataStore();
  const branches = dataBranches.length > 0 ? dataBranches : mockBranches;

  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const branchName = (id: string) => branches.find((b) => b.id === id)?.name ?? "Şube";
  const userName = (id: string) => users.find((u) => u.id === id)?.name ?? "Personel";

  const filtered = [...runs]
    .filter((r) => branchFilter === "all" || r.branchId === branchFilter)
    .filter((r) => typeFilter === "all" || r.type === typeFilter)
    .sort((a, b) => b.date.localeCompare(a.date) || (b.startedAt ?? "").localeCompare(a.startedAt ?? ""));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-sky-100 dark:bg-sky-950/50 flex items-center justify-center">
          <ClipboardCheck className="w-5 h-5 text-sky-600 dark:text-sky-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Günlük Denetimler</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} kayıt</p>
        </div>
      </div>

      {/* Filtreler */}
      <div className="flex gap-2 flex-wrap">
        <Select value={branchFilter} onValueChange={setBranchFilter}>
          <SelectTrigger className="w-44 bg-card">
            <SelectValue placeholder="Şube" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Şubeler</SelectItem>
            {branches.filter((b) => b.status === "active").map((b) => (
              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36 bg-card">
            <SelectValue placeholder="Tür" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="opening">Açılış</SelectItem>
            <SelectItem value="closing">Kapanış</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Liste */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-14 text-muted-foreground">
              <ClipboardCheck className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Kayıt bulunamadı</p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {filtered.map((run) => {
                const photoCount = photos.filter((p) => p.runId === run.id).length;
                return (
                  <Link
                    key={run.id}
                    href={`/operations/audits/${run.id}`}
                    className="flex items-center gap-3 px-4 sm:px-5 py-3.5 hover:bg-muted/40 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                      {run.type === "opening"
                        ? <Sunrise className="w-4 h-4 text-amber-600" />
                        : <Sunset className="w-4 h-4 text-violet-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                        {branchName(run.branchId)}
                        <span className="text-muted-foreground font-normal"> · {run.type === "opening" ? "Açılış" : "Kapanış"}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {run.date} · {userName(run.userId)}
                        {run.completedAt && ` · ${formatRelativeTime(run.completedAt)}`}
                      </p>
                    </div>
                    {photoCount > 0 && (
                      <Badge variant="secondary" className="hidden sm:inline-flex text-xs gap-1">
                        <Camera className="w-3 h-3" />{photoCount}
                      </Badge>
                    )}
                    <ScoreBadge score={run.score} />
                    <RunStatusBadge status={run.status} className="hidden sm:inline-flex" />
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors flex-shrink-0" />
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
