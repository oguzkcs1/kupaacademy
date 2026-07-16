"use client";

import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, CheckCircle2, ChevronDown, ImagePlus, Loader2, Lock, PartyPopper, Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { RunStatusBadge } from "@/components/operations/run-status-badge";
import { scoreColor } from "@/components/operations/score-badge";
import { useOpsStore } from "@/lib/ops-store";
import { useAuthStore } from "@/lib/store";
import { useDataStore } from "@/lib/data-store";
import { mockBranches } from "@/lib/mock-data";
import { isSectionComplete, isItemComplete, isRunPhotoComplete, type ChecklistType } from "@/types/operations";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function ChecklistRunner({ type }: { type: ChecklistType }) {
  const { user } = useAuthStore();
  const { branches: dataBranches } = useDataStore();
  const branches = dataBranches.length > 0 ? dataBranches : mockBranches;
  const activeBranches = branches.filter((b) => b.status === "active");

  const { getTemplate, runs, startRun, addPhoto, completeRun, photos, _loaded } = useOpsStore();
  const template = getTemplate(type);

  const isAdmin = user?.role === "admin";
  const [branchId, setBranchId] = useState<string>(
    user?.branchId ?? activeBranches[0]?.id ?? ""
  );
  const [openSection, setOpenSection] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoTarget, setPhotoTarget] = useState<{ sectionId: string; itemId: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingItem, setUploadingItem] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const run = runs.find(
    (r) => r.branchId === branchId && r.type === type && r.date === today
  );
  const locked = run?.status === "completed" || run?.status === "approved";
  const firstSectionId = template?.sections[0]?.id ?? null;

  // İlerleme: fotoğrafı çekilen madde / toplam madde
  const progress = useMemo(() => {
    if (!run) return 0;
    let done = 0, total = 0;
    for (const sec of run.sections) {
      for (const it of sec.items) { total++; if (isItemComplete(it)) done++; }
    }
    return total === 0 ? 0 : Math.round((done / total) * 100);
  }, [run]);

  const allComplete = useMemo(() => (run ? isRunPhotoComplete(run) : false), [run]);

  const handleStart = async () => {
    if (!user || !branchId || !template) return;
    setStarting(true);
    try {
      await startRun(branchId, user.id, type);
      setOpenSection(firstSectionId);
      toast.success(`${template.title} başlatıldı`);
    } catch {
      toast.error("Başlatılırken hata oluştu");
    } finally {
      setStarting(false);
    }
  };

  const handlePhotoClick = (sectionId: string, itemId: string) => {
    setPhotoTarget({ sectionId, itemId });
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const target = photoTarget;
    e.target.value = "";
    if (!file || !run || !target || !user || !template) return;
    const sectionTpl = template.sections.find((s) => s.id === target.sectionId);
    const itemTpl = sectionTpl?.items.find((i) => i.id === target.itemId);
    setUploadingItem(target.itemId);
    try {
      await addPhoto(file, {
        branchId,
        userId: user.id,
        runId: run.id,
        sectionId: target.sectionId,
        itemId: target.itemId,
        categoryLabel: sectionTpl?.title ?? "",
      });
      toast.success(`${itemTpl?.label ?? "Madde"} fotoğrafı yüklendi`);
    } catch {
      toast.error("Fotoğraf yüklenemedi — tekrar deneyin");
    } finally {
      setUploadingItem(null);
    }
  };

  const handleSubmit = async () => {
    if (!run) return;
    setSubmitting(true);
    try {
      await completeRun(run.id);
      toast.success("Kontrol gönderildi — merkez tarafından puanlanacak 🎉");
    } catch {
      toast.error("Gönderilirken hata oluştu");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  if (!template) {
    return (
      <div className="max-w-2xl">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground text-sm">
            {_loaded ? "Şablon bulunamadı — Checklist Yönetimi'nden madde ekleyin" : "Yükleniyor…"}
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalItems = template.sections.reduce((a, s) => a + s.items.length, 0);

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Üst bar: şube + durum */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {isAdmin ? (
          <Select value={branchId} onValueChange={setBranchId}>
            <SelectTrigger className="w-full sm:w-56 bg-card">
              <SelectValue placeholder="Şube seçin" />
            </SelectTrigger>
            <SelectContent>
              {activeBranches.map((b) => (
                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Badge variant="secondary" className="w-fit text-sm px-3 py-1">
            {branches.find((b) => b.id === branchId)?.name ?? "Şube"}
          </Badge>
        )}
        {run && <RunStatusBadge status={run.status} />}
      </div>

      {!run || run.status === "pending" ? (
        <Card className="border-dashed">
          <CardContent className="py-12 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Camera className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">{template.title} henüz başlamadı</p>
              <p className="text-sm text-muted-foreground mt-1">
                {template.sections.length} bölüm · {totalItems} madde · her madde için ayrı fotoğraf
              </p>
            </div>
            <Button size="lg" onClick={handleStart} disabled={starting} className="min-w-44">
              {starting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Başlatılıyor…</>
              ) : "Kontrole Başla"}
            </Button>
          </CardContent>
        </Card>
      ) : locked ? (
        <Card>
          <CardContent className="py-12 flex flex-col items-center text-center gap-4">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center"
            >
              <PartyPopper className="w-7 h-7 text-emerald-600" />
            </motion.div>
            <div>
              <p className="font-semibold text-lg">Bugünkü {template.title.toLowerCase()} tamamlandı</p>
              <p className="text-sm text-muted-foreground mt-1">
                {run.status === "approved" ? "Merkez tarafından değerlendirildi" : "Merkez puanlaması bekleniyor"}
              </p>
            </div>
            {run.score != null ? (
              <div className="text-4xl font-bold tabular-nums">
                <span className={scoreColor(run.score)}>{run.score}</span>
                <span className="text-muted-foreground text-xl font-medium"> / 100</span>
              </div>
            ) : (
              <Badge variant="secondary" className="text-sm px-3 py-1">Puanlama merkez tarafından yapılacak</Badge>
            )}
            {run.managerComment && (
              <p className="text-sm text-muted-foreground max-w-sm italic">“{run.managerComment}”</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* İlerleme */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>İlerleme · fotoğraflanan maddeler</span>
              <span className="tabular-nums font-medium">%{progress}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Bölümler */}
          <div className="space-y-3">
            {template.sections.map((sectionTpl) => {
              const sectionRun = run.sections.find((s) => s.sectionId === sectionTpl.id);
              if (!sectionRun) return null;
              const complete = isSectionComplete(sectionRun, sectionTpl);
              const isOpen = openSection === sectionTpl.id;
              const doneCount = sectionRun.items.filter(isItemComplete).length;

              return (
                <Card
                  key={sectionTpl.id}
                  className={cn("overflow-hidden transition-colors", complete && "border-emerald-300 dark:border-emerald-800")}
                >
                  <button className="w-full text-left" onClick={() => setOpenSection(isOpen ? null : sectionTpl.id)}>
                    <CardHeader className="py-4 flex flex-row items-center gap-3 space-y-0">
                      <span className="text-2xl">{sectionTpl.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base">{sectionTpl.title}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {doneCount}/{sectionTpl.items.length} madde fotoğraflandı
                        </p>
                      </div>
                      {complete ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                      )}
                    </CardHeader>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                      >
                        <CardContent className="pt-0 pb-4 space-y-3">
                          {sectionTpl.items.map((item) => {
                            const itemRun = sectionRun.items.find((i) => i.itemId === item.id);
                            const itemPhotos = photos.filter((p) => itemRun?.photoIds.includes(p.id));
                            const done = itemRun ? isItemComplete(itemRun) : false;
                            const uploading = uploadingItem === item.id;
                            return (
                              <div
                                key={item.id}
                                className={cn(
                                  "rounded-xl border p-3 transition-colors",
                                  done ? "border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-800" : "border-border"
                                )}
                              >
                                <div className="flex items-center gap-2.5">
                                  <span className={cn(
                                    "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0",
                                    done ? "bg-emerald-500 text-white" : "border-2 border-muted-foreground/30"
                                  )}>
                                    {done && <Check className="w-3 h-3" strokeWidth={3} />}
                                  </span>
                                  <span className="text-sm font-medium flex-1">{item.label}</span>
                                </div>

                                {/* Bu maddenin fotoğrafları */}
                                {itemPhotos.length > 0 && (
                                  <div className="grid grid-cols-4 gap-2 mt-2.5 pl-7">
                                    {itemPhotos.map((p) => (
                                      <div key={p.id} className="aspect-square rounded-lg overflow-hidden bg-muted">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={p.url} alt={item.label} className="w-full h-full object-cover" />
                                      </div>
                                    ))}
                                  </div>
                                )}

                                <div className="pl-7 mt-2.5">
                                  <Button
                                    variant={done ? "outline" : "default"}
                                    size="sm"
                                    disabled={uploading}
                                    onClick={() => handlePhotoClick(sectionTpl.id, item.id)}
                                    className="w-full sm:w-auto"
                                  >
                                    {uploading ? (
                                      <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Yükleniyor…</>
                                    ) : (
                                      <><ImagePlus className="w-4 h-4 mr-1.5" />{done ? "Yeniden Çek / Ekle" : "Fotoğraf Çek"}</>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              );
            })}
          </div>

          {/* Gönder */}
          <div className="sticky bottom-20 lg:bottom-4 pt-2">
            <Button
              size="lg" className="w-full shadow-lg"
              disabled={!allComplete || submitting}
              onClick={handleSubmit}
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Gönderiliyor…</>
              ) : allComplete ? (
                <>Kontrolü Tamamla ve Merkeze Gönder</>
              ) : (
                <><Lock className="w-4 h-4 mr-2" />Her maddenin fotoğrafı çekilmeli</>
              )}
            </Button>
          </div>
        </>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelected}
      />
    </div>
  );
}
