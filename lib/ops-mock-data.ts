import type {
  ChecklistTemplate, ChecklistRun, OpsPhoto, OpsTask,
} from "@/types/operations";

// ─── Checklist Şablonları ────────────────────────────────────────────────────

export const openingTemplate: ChecklistTemplate = {
  id: "tpl-opening",
  type: "opening",
  title: "Açılış Kontrolü",
  sections: [
    {
      id: "sec-open-clean",
      title: "Temizlik",
      emoji: "🧹",
      photoRequired: true,
      items: [
        { id: "op-clean-1", label: "Masalar" },
        { id: "op-clean-2", label: "Sandalyeler" },
        { id: "op-clean-3", label: "Yerler" },
        { id: "op-clean-4", label: "WC" },
      ],
    },
    {
      id: "sec-open-bar",
      title: "Bar",
      emoji: "☕",
      photoRequired: true,
      items: [
        { id: "op-bar-1", label: "Espresso Makinesi" },
        { id: "op-bar-2", label: "Grinder" },
        { id: "op-bar-3", label: "Bardaklar" },
        { id: "op-bar-4", label: "Şuruplar" },
      ],
    },
    {
      id: "sec-open-cake",
      title: "Pasta Dolabı",
      emoji: "🍰",
      photoRequired: true,
      items: [
        { id: "op-cake-1", label: "Doluluk" },
        { id: "op-cake-2", label: "Etiketler" },
        { id: "op-cake-3", label: "Düzen" },
      ],
    },
    {
      id: "sec-open-front",
      title: "Dış Cephe",
      emoji: "🏪",
      photoRequired: true,
      items: [
        { id: "op-front-1", label: "Tabela" },
        { id: "op-front-2", label: "Sandviç Board" },
        { id: "op-front-3", label: "Bahçe" },
      ],
    },
  ],
};

export const closingTemplate: ChecklistTemplate = {
  id: "tpl-closing",
  type: "closing",
  title: "Kapanış Kontrolü",
  sections: [
    {
      id: "sec-close-bar",
      title: "Bar Temizliği",
      emoji: "🧽",
      photoRequired: true,
      items: [
        { id: "cl-bar-1", label: "Bar Tezgahı" },
        { id: "cl-bar-2", label: "Makine Temizliği" },
        { id: "cl-bar-3", label: "Grinder Temizliği" },
      ],
    },
    {
      id: "sec-close-pos",
      title: "POS & Kasa",
      emoji: "💳",
      photoRequired: true,
      items: [
        { id: "cl-pos-1", label: "POS Kapanışı" },
        { id: "cl-pos-2", label: "Kasa Sayımı" },
        { id: "cl-pos-3", label: "Z Raporu" },
      ],
    },
    {
      id: "sec-close-store",
      title: "Depo & Çöp",
      emoji: "📦",
      photoRequired: true,
      items: [
        { id: "cl-store-1", label: "Çöplerin Atılması" },
        { id: "cl-store-2", label: "Depo Düzeni" },
        { id: "cl-store-3", label: "Soğuk Hava Kontrolü" },
      ],
    },
    {
      id: "sec-close-power",
      title: "Elektrik & Güvenlik",
      emoji: "🔌",
      photoRequired: true,
      items: [
        { id: "cl-pow-1", label: "Elektrikler" },
        { id: "cl-pow-2", label: "Klima" },
        { id: "cl-pow-3", label: "Kapılar & Kilitler" },
      ],
    },
  ],
};

export const opsTemplates = [openingTemplate, closingTemplate];

// ─── Yardımcılar ────────────────────────────────────────────────────────────

function today(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

const photoPool = [
  "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=70",
  "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=70",
  "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&q=70",
  "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&q=70",
  "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&q=70",
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=70",
  "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&q=70",
  "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=70",
  "https://images.unsplash.com/photo-1517705008128-361805f42e86?w=800&q=70",
  "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=800&q=70",
  "https://images.unsplash.com/photo-1525610553991-2bede1a236e2?w=800&q=70",
  "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=800&q=70",
];

// ─── Mock Fotoğraflar ────────────────────────────────────────────────────────

export const mockOpsPhotos: OpsPhoto[] = [
  // Bugün — Kadıköy açılış
  { id: "oph-1", url: photoPool[0], branchId: "branch-1", userId: "user-2", runId: "run-today-1-open", sectionId: "sec-open-clean", categoryLabel: "Temizlik", takenAt: `${today()}T07:42:00` },
  { id: "oph-2", url: photoPool[1], branchId: "branch-1", userId: "user-2", runId: "run-today-1-open", sectionId: "sec-open-bar", categoryLabel: "Bar", takenAt: `${today()}T07:48:00` },
  { id: "oph-3", url: photoPool[2], branchId: "branch-1", userId: "user-2", runId: "run-today-1-open", sectionId: "sec-open-cake", categoryLabel: "Pasta Dolabı", takenAt: `${today()}T07:55:00` },
  { id: "oph-4", url: photoPool[3], branchId: "branch-1", userId: "user-2", runId: "run-today-1-open", sectionId: "sec-open-front", categoryLabel: "Dış Cephe", takenAt: `${today()}T08:01:00` },
  // Bugün — Beşiktaş açılış
  { id: "oph-5", url: photoPool[4], branchId: "branch-2", userId: "user-3", runId: "run-today-2-open", sectionId: "sec-open-clean", categoryLabel: "Temizlik", takenAt: `${today()}T07:35:00` },
  { id: "oph-6", url: photoPool[5], branchId: "branch-2", userId: "user-3", runId: "run-today-2-open", sectionId: "sec-open-bar", categoryLabel: "Bar", takenAt: `${today()}T07:44:00` },
  { id: "oph-7", url: photoPool[6], branchId: "branch-2", userId: "user-3", runId: "run-today-2-open", sectionId: "sec-open-cake", categoryLabel: "Pasta Dolabı", takenAt: `${today()}T07:52:00` },
  { id: "oph-8", url: photoPool[7], branchId: "branch-2", userId: "user-3", runId: "run-today-2-open", sectionId: "sec-open-front", categoryLabel: "Dış Cephe", takenAt: `${today()}T07:58:00` },
  // Dün — Kadıköy kapanış
  { id: "oph-9", url: photoPool[8], branchId: "branch-1", userId: "user-2", runId: "run-yest-1-close", sectionId: "sec-close-bar", categoryLabel: "Bar Temizliği", takenAt: `${today(-1)}T22:10:00` },
  { id: "oph-10", url: photoPool[9], branchId: "branch-1", userId: "user-2", runId: "run-yest-1-close", sectionId: "sec-close-pos", categoryLabel: "POS & Kasa", takenAt: `${today(-1)}T22:18:00` },
  { id: "oph-11", url: photoPool[10], branchId: "branch-3", userId: "user-2", runId: "run-yest-3-open", sectionId: "sec-open-bar", categoryLabel: "Bar", takenAt: `${today(-1)}T07:50:00` },
  { id: "oph-12", url: photoPool[11], branchId: "branch-3", userId: "user-2", runId: "run-yest-3-open", sectionId: "sec-open-clean", categoryLabel: "Temizlik", takenAt: `${today(-1)}T07:40:00` },
];

// ─── Mock Run'lar ────────────────────────────────────────────────────────────

function fullSections(template: ChecklistTemplate, scorePattern: (idx: number) => 0 | 1 | 2 | 3 | 5, photosByRun: OpsPhoto[]) {
  return template.sections.map((sec) => ({
    sectionId: sec.id,
    items: sec.items.map((item, i) => ({ itemId: item.id, score: scorePattern(i) })),
    photoIds: photosByRun.filter((p) => p.sectionId === sec.id).map((p) => p.id),
  }));
}

const perfect = () => 5 as const;
const good = (i: number) => (i % 3 === 0 ? 3 : 5) as 3 | 5;
const weak = (i: number) => ([5, 3, 2, 1][i % 4]) as 5 | 3 | 2 | 1;

export const mockOpsRuns: ChecklistRun[] = [
  // ── Bugün: Kadıköy açılış tamamlandı — merkez puanlaması bekliyor
  {
    id: "run-today-1-open",
    type: "opening",
    templateId: "tpl-opening",
    branchId: "branch-1",
    userId: "user-2",
    date: today(),
    startedAt: `${today()}T07:40:00`,
    completedAt: `${today()}T08:05:00`,
    status: "completed",
    sections: openingTemplate.sections.map((sec) => ({
      sectionId: sec.id,
      items: sec.items.map((item) => ({ itemId: item.id, score: null })),
      photoIds: mockOpsPhotos
        .filter((p) => p.runId === "run-today-1-open" && p.sectionId === sec.id)
        .map((p) => p.id),
    })),
  },
  // ── Bugün: Beşiktaş açılış onaylandı
  {
    id: "run-today-2-open",
    type: "opening",
    templateId: "tpl-opening",
    branchId: "branch-2",
    userId: "user-3",
    date: today(),
    startedAt: `${today()}T07:30:00`,
    completedAt: `${today()}T08:00:00`,
    status: "approved",
    sections: fullSections(openingTemplate, perfect, mockOpsPhotos.filter((p) => p.runId === "run-today-2-open")),
    score: 100,
    managerComment: "Harika bir açılış, teşekkürler!",
  },
  // ── Bugün: Nişantaşı açılış bekliyor
  {
    id: "run-today-3-open",
    type: "opening",
    templateId: "tpl-opening",
    branchId: "branch-3",
    userId: "user-2",
    date: today(),
    status: "pending",
    sections: openingTemplate.sections.map((sec) => ({
      sectionId: sec.id,
      items: sec.items.map((item) => ({ itemId: item.id, score: null })),
      photoIds: [],
    })),
  },
  // ── Dün: Kadıköy açılış + kapanış
  {
    id: "run-yest-1-open",
    type: "opening",
    templateId: "tpl-opening",
    branchId: "branch-1",
    userId: "user-2",
    date: today(-1),
    startedAt: `${today(-1)}T07:38:00`,
    completedAt: `${today(-1)}T08:02:00`,
    status: "approved",
    sections: fullSections(openingTemplate, good, []),
    score: 91,
  },
  {
    id: "run-yest-1-close",
    type: "closing",
    templateId: "tpl-closing",
    branchId: "branch-1",
    userId: "user-2",
    date: today(-1),
    startedAt: `${today(-1)}T22:00:00`,
    completedAt: `${today(-1)}T22:25:00`,
    status: "approved",
    sections: fullSections(closingTemplate, perfect, mockOpsPhotos.filter((p) => p.runId === "run-yest-1-close")),
    score: 100,
  },
  // ── Dün: Nişantaşı açılış düşük puan + revize
  {
    id: "run-yest-3-open",
    type: "opening",
    templateId: "tpl-opening",
    branchId: "branch-3",
    userId: "user-2",
    date: today(-1),
    startedAt: `${today(-1)}T07:35:00`,
    completedAt: `${today(-1)}T08:20:00`,
    status: "revision",
    sections: fullSections(openingTemplate, weak, mockOpsPhotos.filter((p) => p.runId === "run-yest-3-open")),
    score: 55,
    managerComment: "Pasta dolabı düzeni ve dış cephe fotoğrafı yetersiz. Lütfen tekrar kontrol edin.",
  },
  // ── Dün: Beşiktaş kapanış
  {
    id: "run-yest-2-close",
    type: "closing",
    templateId: "tpl-closing",
    branchId: "branch-2",
    userId: "user-3",
    date: today(-1),
    startedAt: `${today(-1)}T21:55:00`,
    completedAt: `${today(-1)}T22:15:00`,
    status: "approved",
    sections: fullSections(closingTemplate, good, []),
    score: 88,
  },
];

// ─── Mock Görevler ───────────────────────────────────────────────────────────

export const mockOpsTasks: OpsTask[] = [
  {
    id: "otask-1",
    title: "Pasta dolabı düzenlenecek",
    description: "Etiketler yenilenecek, ürün yerleşimi standarda uygun hale getirilecek.",
    branchId: "branch-3",
    assigneeId: "user-2",
    dueDate: today(1),
    status: "pending",
    createdBy: "user-1",
    createdAt: `${today(-1)}T10:00:00`,
  },
  {
    id: "otask-2",
    title: "Dış cephe tabela temizliği",
    branchId: "branch-1",
    assigneeId: "user-2",
    dueDate: today(2),
    status: "pending",
    createdBy: "user-1",
    createdAt: `${today()}T09:15:00`,
  },
  {
    id: "otask-3",
    title: "Espresso makinesi bakım randevusu",
    description: "Servis firması aranıp haftalık bakım planlanacak.",
    branchId: "branch-2",
    assigneeId: "user-3",
    dueDate: today(-1),
    status: "completed",
    createdBy: "user-1",
    createdAt: `${today(-3)}T14:00:00`,
    completedAt: `${today(-1)}T16:30:00`,
  },
];
