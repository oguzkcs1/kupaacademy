// ─── Operasyon Merkezi Veri Modeli ──────────────────────────────────────────
// Supabase Storage / Auth / GPS / AI skorlama gibi gelecek özellikler için
// alanlar opsiyonel olarak şimdiden modellenmiştir.

export type ChecklistType = "opening" | "closing";

/** Her madde 0 | 1 | 2 | 3 | 5 puan alabilir. null = henüz puanlanmadı */
export type ItemScore = 0 | 1 | 2 | 3 | 5;
export const SCORE_OPTIONS: ItemScore[] = [0, 1, 2, 3, 5];
export const MAX_ITEM_SCORE: ItemScore = 5;

export type RunStatus =
  | "pending"      // gün başladı, henüz kontrol yapılmadı
  | "in_progress"  // şube doldurmaya başladı
  | "completed"    // şube tamamladı, yönetici onayı bekliyor
  | "approved"     // yönetici onayladı
  | "revision";    // yönetici revize istedi

// ─── Şablonlar ───────────────────────────────────────────────────────────────

export interface ChecklistTemplateItem {
  id: string;
  label: string;
}

export interface ChecklistSection {
  id: string;
  title: string;
  /** lucide ikon adı yerine emoji — şablon datası UI'dan bağımsız kalsın */
  emoji: string;
  items: ChecklistTemplateItem[];
  /** Fotoğraf olmadan bölüm tamamlanamaz */
  photoRequired: boolean;
}

export interface ChecklistTemplate {
  id: string;
  type: ChecklistType;
  title: string;
  sections: ChecklistSection[];
}

// ─── Çalışma (Run) kayıtları ─────────────────────────────────────────────────

export interface RunItemResult {
  itemId: string;
  score: ItemScore | null;
  /** Her maddenin KENDİ fotoğrafı — OpsPhoto.id referansları */
  photoIds: string[];
}

export interface RunSectionResult {
  sectionId: string;
  items: RunItemResult[];
  /** (Geriye dönük uyumluluk — artık fotoğraflar madde bazında tutulur) */
  photoIds: string[];
  note?: string;
}

export interface ChecklistRun {
  id: string;
  type: ChecklistType;
  templateId: string;
  branchId: string;
  userId: string;
  /** YYYY-MM-DD */
  date: string;
  startedAt?: string;
  completedAt?: string;
  status: RunStatus;
  sections: RunSectionResult[];
  /** 0-100 normalize edilmiş puan (completeRun sırasında hesaplanır) */
  score?: number;
  managerComment?: string;
  /** Gelecek: GPS doğrulaması */
  gpsLat?: number;
  gpsLng?: number;
  /** Gelecek: AI operasyon skoru */
  aiScore?: number;
}

// ─── Fotoğraflar ─────────────────────────────────────────────────────────────

export interface OpsPhoto {
  id: string;
  /** Şimdilik mock URL — ileride Supabase Storage path */
  url: string;
  storagePath?: string;
  branchId: string;
  userId: string;
  runId?: string;
  sectionId?: string;
  /** Fotoğrafın ait olduğu madde — karışmayı önler */
  itemId?: string;
  /** Görüntülenen kategori etiketi (ör. "Temizlik", "Bar") */
  categoryLabel: string;
  takenAt: string;
  /** Gelecek: AI fotoğraf analizi sonucu */
  aiAnalysis?: string;
}

// ─── Görevler ────────────────────────────────────────────────────────────────

export type OpsTaskStatus = "pending" | "completed";

export interface OpsTask {
  id: string;
  title: string;
  description?: string;
  branchId: string;
  assigneeId?: string;
  dueDate?: string;
  status: OpsTaskStatus;
  createdBy: string;
  createdAt: string;
  completedAt?: string;
}

// ─── Yardımcı hesaplar ───────────────────────────────────────────────────────

/** Bir run'ın 0-100 puanını hesaplar (puanlanmamış maddeler 0 sayılır) */
export function calculateRunScore(run: ChecklistRun): number {
  let earned = 0;
  let max = 0;
  for (const section of run.sections) {
    for (const item of section.items) {
      earned += item.score ?? 0;
      max += MAX_ITEM_SCORE;
    }
  }
  if (max === 0) return 0;
  return Math.round((earned / max) * 100);
}

/** Bir madde tamamlandı mı: kendi fotoğrafı çekilmiş olmalı */
export function isItemComplete(item: RunItemResult): boolean {
  return (item.photoIds?.length ?? 0) > 0;
}

/**
 * Personel için bölüm tamamlama: bölümdeki HER maddenin kendi fotoğrafı çekilmiş olmalı.
 * Puanlama personel tarafından değil, merkez (admin) tarafından yapılır.
 */
export function isSectionComplete(
  section: RunSectionResult,
  _template: ChecklistSection
): boolean {
  if (section.items.length === 0) return false;
  return section.items.every(isItemComplete);
}

/** Personel gönderebilir mi: tüm maddelerin fotoğrafı tamam mı */
export function isRunPhotoComplete(run: ChecklistRun): boolean {
  return run.sections.every(
    (sec) => sec.items.length > 0 && sec.items.every(isItemComplete)
  );
}

/** Merkez puanlaması tamamlandı mı: tüm maddeler puanlanmış olmalı */
export function isRunFullyScored(run: ChecklistRun): boolean {
  return run.sections.every((sec) => sec.items.every((i) => i.score !== null));
}
