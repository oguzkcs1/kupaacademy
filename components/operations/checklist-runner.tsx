"use client";

import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, CheckCircle2, ChevronDown, Circle, ImagePlus, Loader2, Lock, PartyPopper,
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
import { isSectionComplete, type ChecklistType } from "@/types/operations";
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
  const [photoSectionId, setPhotoSectionId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingSection, setUploadingSection] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const run = runs.find(
    (r) => r.branchId === branchId && r.type === type && r.date === today
  );

  const locked = run?.status === "completed" || run?.status === "approved";

  // İlk açık bölümü şablon yüklendiğinde ayarla
  const firstSectionId = template?.sections[0]?.id ?? null;

  // İlerleme: fotoğrafı tamamlanan bölüm sayısı
  const progress = useMemo(() => {
    if (!run || !template) return 0;
    const total = template.sections.length;
    const done = run.sections.filter((sec) => {
      const tpl = template.sections.find((t) => t.id === sec.sectionId);
      return tpl ? isSectionComplete(sec, tpl) : false;
    }).length;
    return total === 0 ? 0 : Math.round((done / total) * 100);
  }, [run, template]);

  const allComplete = useMemo(() => {
    if (!run || !template) return false;
    return run.sections.every((sec) => {
      const tpl = template.sections.find((t) => t.id === sec.sectionId);
      return tpl ? isSectionComplete(sec, tpl) : false;
    });
  }, [run, template]);

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

  const handlePhotoClick = (sectionId: string) => {
    setPhotoSectionId(sectionId);
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const sectionId = photoSectionId;
    e.target.value = "";
    if (!file || !run || !sectionId || !user || !template) return;
    const sectionTpl = template.sections.find((s) => s.id === sectionId);
    setUploadingSection(sectionId);
    try {
      await addPhoto(file, {
        branchId,
        userId: user.id,
        runId: run.id,
        sectionId,
        categoryLabel: sectionTpl?.title ?? "",
      });
      toast.success(`${sectionTpl?.title} fotoğrafı yüklendi`);
    } catch {
      toast.error("Fotoğraf yüklenemedi — tekrar deneyin");
    } finally {
      setUploadingSection(null);
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

  // Şablonlar henüz yüklenmediyse
  if (!template) {
    return (
      <div className="max-w-2xl">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground text-sm">
            {_loaded ? "Şablon bulunamadı" : "Yükleniyor…"}
          </CardContent>
        </Card>
      </div>
    );
  }

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

      {/* Henüz başlamadıysa */}
      {!run || run.status === "pending" ? (
        <Card className="border-dashed">
          <CardContent className="py-12 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Camera className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">{template.title} henüz başlamadı</p>
              <p className="text-sm text-muted-foreground mt-1">
                {template.sections.length} kategori · her kategori için fotoğraf zorunlu
              </p>
            </div>
            <Button size="lg" onClick={handleStart} disabled={starting} className="min-w-44">
              {starting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Başlatılıyor…</>
              ) : (
                "Kontrole Başla"
              )}
            </Button>
          </CardContent>
        </Card>
      ) : locked ? (
        /* Tamamlandı ekranı */
        <Card>
          <CardContent className="py-12 flex flex-col items-center text-center gap-4">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center"
            >
              <PartyPopper className="w-7 h-7 text-emerald-600" />
            </motion.div>
            <div>
              <p className="font-semibold text-lg">Bugünkü {template.title.toLowerCase()} tamamlandı</p>
              <p className="text-sm text-muted-foreground mt-1">
                {run.status === "approved"
                  ? "Merkez tarafından değerlendirildi"
                  : "Merkez puanlaması bekleniyor"}
              </p>
            </div>
            {run.score != null ? (
              <div className="text-4xl font-bold tabular-nums">
                <span className={scoreColor(run.score)}>{run.score}</span>
                <span className="text-muted-foreground text-xl font-medium"> / 100</span>
              </div>
            ) : (
              <Badge variant="secondary" className="text-sm px-3 py-1">
                Puanlama merkez tarafından yapılacak
              </Badge>
            )}
            {run.managerComment && (
              <p className="text-sm text-muted-foreground max-w-sm italic">
                “{run.managerComment}”
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* İlerleme */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>İlerleme</span>
              <span className="tabular-nums font-medium">%{progress}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Kategori kartları */}
          <div className="space-y-3">
            {template.sections.map((sectionTpl) => {
              const sectionRun = run.sections.find((s) => s.sectionId === sectionTpl.id)!;
              const complete = isSectionComplete(sectionRun, sectionTpl);
              const isOpen = openSection === sectionTpl.id;
              const sectionPhotos = photos.filter((p) =>
                sectionRun.photoIds.includes(p.id)
              );

              return (
                <Card
                  key={sectionTpl.id}
                  className={cn(
                    "overflow-hidden transition-colors",
                    complete && "border-emerald-300 dark:border-emerald-800"
                  )}
                >
                  <button
                    className="w-full text-left"
                    onClick={() => setOpenSection(isOpen ? null : sectionTpl.id)}
                  >
                    <CardHeader className="py-4 flex flex-row items-center gap-3 space-y-0">
                      <span className="text-2xl">{sectionTpl.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base">{sectionTpl.title}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {sectionTpl.items.length} kontrol noktası
                          {sectionTpl.photoRequired && ` · ${sectionRun.photoIds.length} fotoğraf`}
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
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <CardContent className="pt-0 pb-4 space-y-4">
                          {/* Kontrol noktaları — bilgilendirme listesi */}
                          <div className="space-y-2">
                            {sectionTpl.items.map((item) => (
                              <div key={item.id} className="flex items-center gap-2.5 text-sm">
                                <Circle className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0" />
                                <span>{item.label}</span>
                              </div>
                            ))}
                          </div>

                          {/* Çekilen fotoğraflar */}
                          {sectionPhotos.length > 0 && (
                            <div className="grid grid-cols-4 gap-2">
                              {sectionPhotos.map((p) => (
                                <div key={p.id} className="aspect-square rounded-lg overflow-hidden bg-muted">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={p.url} alt={p.categoryLabel} className="w-full h-full object-cover" />
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Fotoğraf */}
                          {sectionTpl.photoRequired && (
                            <div className="pt-2 border-t border-border/60">
                              <Button
                                variant={sectionRun.photoIds.length > 0 ? "outline" : "default"}
                                size="sm"
                                onClick={() => handlePhotoClick(sectionTpl.id)}
                                disabled={uploadingSection === sectionTpl.id}
                                className="w-full sm:w-auto"
                              >
                                {uploadingSection === sectionTpl.id ? (
                                  <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Yükleniyor…</>
                                ) : (
                                  <>
                                    <ImagePlus className="w-4 h-4 mr-1.5" />
                                    {sectionRun.photoIds.length > 0
                                      ? `Fotoğraf Ekle (${sectionRun.photoIds.length})`
                                      : "Fotoğraf Çek (zorunlu)"}
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              );
            })}
          </div>

          {/* Gönder */}
          <div className="sticky bottom-4 pt-2">
            <Button
              size="lg"
              className="w-full shadow-lg"
              disabled={!allComplete || submitting}
              onClick={handleSubmit}
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Gönderiliyor...</>
              ) : allComplete ? (
                <>Kontrolü Tamamla ve Merkeze Gönder</>
              ) : (
                <><Lock className="w-4 h-4 mr-2" />Tüm kategorilerin fotoğrafı çekilmeli</>
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
