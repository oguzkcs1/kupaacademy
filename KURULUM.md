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

## 4. Demo Giriş Bilgileri

- **E-posta:** ahmet@kupacoffee.com  
- **Şifre:** demo123

## Proje Yapısı

```
kupaacademy/
├── app/
│   ├── (auth)/login/          # Giriş sayfası
│   └── (app)/
│       ├── dashboard/          # Ana panel
│       ├── trainings/          # Eğitimler
│       ├── videos/             # Videolar
│       ├── sops/               # SOP'lar
│       ├── recipes/            # Reçeteler
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
│   ├── mock-data.ts            # Demo veriler
│   ├── store.ts                # Zustand state management
│   └── utils.ts                # Yardımcı fonksiyonlar
└── types/index.ts              # TypeScript tipleri
```

## Sonraki Adımlar (Backend Entegrasyonu)

1. **Supabase** kurulumu — PostgreSQL + Auth + Storage
2. `lib/mock-data.ts` → gerçek API çağrılarıyla değiştir
3. `lib/store.ts` → Supabase Auth entegrasyonu
4. TipTap block editörünü tam entegre et
5. Drag & drop sıralama (@dnd-kit)
