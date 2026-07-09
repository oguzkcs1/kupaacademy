import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, locale = "tr-TR") {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date, locale = "tr-TR") {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date) {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffSec = Math.floor(Math.abs(diffMs) / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  const future = diffMs < 0;
  const suffix = future ? "sonra" : "önce";

  if (diffSec < 60) return "az önce";
  if (diffMin < 60) return `${diffMin} dakika ${suffix}`;
  if (diffHour < 24) return `${diffHour} saat ${suffix}`;
  if (diffDay === 1) return future ? "yarın" : "dün";
  if (diffDay < 30) return `${diffDay} gün ${suffix}`;
  if (diffMonth < 12) return `${diffMonth} ay ${suffix}`;
  return `${diffYear} yıl ${suffix}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return m > 0 ? `${h} sa ${m} dk` : `${h} sa`;
  if (m > 0) return s > 0 ? `${m} dk ${s} sn` : `${m} dk`;
  return `${s} sn`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[çÇ]/g, "c")
    .replace(/[ğĞ]/g, "g")
    .replace(/[ıİ]/g, "i")
    .replace(/[öÖ]/g, "o")
    .replace(/[şŞ]/g, "s")
    .replace(/[üÜ]/g, "u")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export const ROLE_LABELS: Record<string, string> = {
  admin: "Yönetici",
  barista: "Barista",
};

export const STATUS_LABELS: Record<string, string> = {
  published: "Yayınlandı",
  draft: "Taslak",
  archived: "Arşivlendi",
  active: "Aktif",
  inactive: "Pasif",
};

export const CONTENT_TYPE_LABELS: Record<string, string> = {
  training: "Eğitim",
  video: "Video",
  sop: "SOP",
  recipe: "Reçete",
  product: "Ürün",
  document: "Doküman",
  announcement: "Duyuru",
};
