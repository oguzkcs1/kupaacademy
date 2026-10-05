"use client";

import { useMemo, useState } from "react";
import { Archive, CalendarDays, CheckSquare, Loader2, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RunStatusBadge } from "@/components/operations/run-status-badge";
import { ScoreBadge } from "@/components/operations/score-badge";
import { useDataStore } from "@/lib/data-store";
import { useOpsStore } from "@/lib/ops-store";
import type { ChecklistType } from "@/types/operations";

type TypeFilter = "all" | ChecklistType;

export default function AuditArchivePage() {
  const { runs, photos, deleteRuns } = useOpsStore();
  const { branches, users } = useDataStore();
  const [beforeDate, setBeforeDate] = useState("");
  const [branchId, setBranchId] = useState("all");
  const [type, setType] = useState<TypeFilter>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const filteredRuns = useMemo(() => {
    return runs
      .filter((run) => !beforeDate || run.date < beforeDate)
      .filter((run) => branchId === "all" || run.branchId === branchId)
      .filter((run) => type === "all" || run.type === type)
      .sort((a, b) => b.date.localeCompare(a.date) || (b.startedAt ?? "").localeCompare(a.startedAt ?? ""));
  }, [runs, beforeDate, branchId, type]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedRuns = filteredRuns.filter((run) => selectedSet.has(run.id));
  const selectedPhotos = photos.filter((photo) => photo.runId && selectedSet.has(photo.runId));
  const allVisibleSelected = filteredRuns.length > 0 && filteredRuns.every((run) => selectedSet.has(run.id));

  const branchName = (id: string) => branches.find((branch) => branch.id === id)?.name ?? "Silinmiş şube";
  const userName = (id: string) => users.find((user) => user.id === id)?.name ?? "Bilinmeyen kullanıcı";

  const toggleRun = (id: string) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((currentId) => currentId !== id) : [...current, id]);
  };

  const toggleAllVisible = () => {
    setSelectedIds((current) => {
      const visibleIds = filteredRuns.map((run) => run.id);
      if (allVisibleSelected) return current.filter((id) => !visibleIds.includes(id));
      return Array.from(new Set([...current, ...visibleIds]));
    });
  };

  const clearFilters = () => {
    setBeforeDate("");
    setBranchId("all");
    setType("all");
    setSelectedIds([]);
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) return;
    setDeleting(true);
    try {
      await deleteRuns(selectedIds);
      toast.success(`${selectedIds.length} denetim ve bağlı fotoğraf kayıtları silindi`);
      setSelectedIds([]);
      setConfirmOpen(false);
    } catch (error) {
      console.error("Audit deletion failed", error);
      toast.error("Denetimler silinemedi. Storage izinlerini kontrol edin.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center shrink-0">
          <Archive className="w-5 h-5 text-rose-600 dark:text-rose-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Denetim Arşivi</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Geçmiş açılış ve kapanış kayıtlarını filtreleyin, ardından kalıcı olarak temizleyin.</p>
        </div>
      </div>

      <Card className="border-amber-200/70 dark:border-amber-900/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><CalendarDays className="w-4 h-4 text-primary" /> Silme kapsamı</CardTitle>
          <CardDescription>Tarihten önceki kayıtları getirin; yalnızca seçtiklerinizi silin. Bu işlem geri alınamaz.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2.5">
          <div className="space-y-1">
            <label htmlFor="before-date" className="text-xs font-medium text-muted-foreground">Bu tarihten öncekiler</label>
            <input
              id="before-date"
              type="date"
              value={beforeDate}
              onChange={(event) => { setBeforeDate(event.target.value); setSelectedIds([]); }}
              className="flex h-10 w-[170px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Şube</label>
            <Select value={branchId} onValueChange={(value) => { setBranchId(value); setSelectedIds([]); }}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm şubeler</SelectItem>
                {branches.map((branch) => <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Kontrol türü</label>
            <Select value={type} onValueChange={(value) => { setType(value as TypeFilter); setSelectedIds([]); }}>
              <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="opening">Açılış</SelectItem>
                <SelectItem value="closing">Kapanış</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="ghost" className="self-end" onClick={clearFilters}><X className="w-4 h-4 mr-1.5" />Filtreleri temizle</Button>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-muted-foreground"><strong className="text-foreground">{filteredRuns.length}</strong> denetim bulundu</p>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && <Badge variant="secondary">{selectedIds.length} kayıt seçildi</Badge>}
          <Button variant="outline" size="sm" disabled={filteredRuns.length === 0} onClick={toggleAllVisible}>
            <CheckSquare className="w-4 h-4 mr-1.5" />{allVisibleSelected ? "Seçimi kaldır" : "Tümünü seç"}
          </Button>
          <Button variant="destructive" size="sm" disabled={selectedIds.length === 0} onClick={() => setConfirmOpen(true)}>
            <Trash2 className="w-4 h-4 mr-1.5" />Seçilenleri sil
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {filteredRuns.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground"><Archive className="w-9 h-9 mx-auto mb-3 opacity-25" /><p className="text-sm">Bu filtrelerle eşleşen denetim bulunamadı.</p></div>
          ) : (
            <div className="divide-y divide-border/60">
              {filteredRuns.map((run) => {
                const photoCount = photos.filter((photo) => photo.runId === run.id).length;
                const isSelected = selectedSet.has(run.id);
                return (
                  <label key={run.id} className="flex items-center gap-3 px-4 sm:px-5 py-3.5 cursor-pointer hover:bg-muted/40 transition-colors">
                    <input type="checkbox" checked={isSelected} onChange={() => toggleRun(run.id)} className="h-4 w-4 accent-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{branchName(run.branchId)} <span className="font-normal text-muted-foreground">· {run.type === "opening" ? "Açılış" : "Kapanış"}</span></p>
                      <p className="text-xs text-muted-foreground mt-0.5">{run.date} · {userName(run.userId)} · {photoCount} fotoğraf</p>
                    </div>
                    <ScoreBadge score={run.score} />
                    <RunStatusBadge status={run.status} className="hidden sm:inline-flex" />
                  </label>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Seçili denetimler kalıcı olarak silinsin mi?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedRuns.length} denetim kaydı ve bu kayıtlara ait {selectedPhotos.length} fotoğraf silinecek. Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Vazgeç</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={deleting} onClick={handleDelete}>
              {deleting ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Siliniyor...</> : <><Trash2 className="w-4 h-4 mr-1.5" />Kalıcı olarak sil</>}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
