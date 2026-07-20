# Kupa Academy — Kurulum Rehberi

## 1. Node.js Kurulumu

```bash
# Homebrew ile (önerilir)
brew install node@20

# veya NVM ile
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

## 2. Bağımlılıkları Yükle

```bash
cd /Users/oguz/Desktop/kupaacademy
npm install
```

## 3. Geliştirme Sunucusunu Başlat

```bash
npm run dev
```

Uygulama `http://localhost:3000` adresinde açılır.

## 4. Ortam Değişkenleri

`.env.local` ve Vercel ortamına şunları ekleyin:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
```

VAPID private key yalnız Supabase Edge Function secret olarak saklanmalıdır.

## 5. Supabase SQL Sırası

Yeni kurulumda SQL Editor içinde sırasıyla:

1. `supabase/schema.sql`
2. `supabase/ops-schema.sql`
3. `supabase/ops-item-photos.sql`
4. `supabase/career-schema.sql`
5. `supabase/security.sql`
6. `supabase/push-schema.sql`
7. `supabase/security-v2.sql` — her zaman en son
8. `supabase/personnel-registration.sql` — personel kayıt/onay akışı

`security-v2.sql` çalışınca mevcut oturumlar kapanır; kullanıcılar yeniden giriş yapar.

## Proje Yapısı

```
kupaacademy/
├── app/
│   ├── (auth)/login/          # Giriş sayfası
│   └── (app)/
│       ├── dashboard/          # Ana panel
│       ├── trainings/          # Eğitimler
│       ├── videos/             # Videolar
│       ├── recipes/            # Reçeteler
│       ├── operations/         # Operasyon merkezi
│       ├── products/           # Ürünler
│       ├── documents/          # Dokümanlar
│       ├── announcements/      # Duyurular
│       ├── quizzes/            # Sınavlar
│       ├── badges/             # Rozetler
│       ├── search/             # Arama
│       └── admin/
│           ├── trainings/      # Eğitim yönetimi
│           ├── users/          # Kullanıcı yönetimi
│           ├── media/          # Medya kütüphanesi
│           ├── reports/        # Raporlar
│           └── settings/       # Ayarlar
├── components/
│   ├── layout/                 # Sidebar, Header, AppLayout
│   ├── ui/                     # Tüm UI bileşenleri
│   └── providers/              # Theme provider
├── lib/
│   ├── db.ts                   # Supabase veri erişim katmanı
│   ├── data-store.ts           # Academy Zustand store
│   ├── ops-store.ts            # Operasyon Zustand store
│   ├── store.ts                # Oturum ve UI state
│   └── utils.ts                # Yardımcı fonksiyonlar
└── types/index.ts              # TypeScript tipleri
```

## Production Build

```bash
npm run build
```
