# Kupa Academy — Geliştirme Notu

## Mimari

- Next.js 14 App Router + TypeScript + Tailwind + Radix UI.
- Academy verileri `lib/data-store.ts`, operasyon verileri `lib/ops-store.ts` üzerinden yönetilir.
- Tüm kalıcı veri erişimi `lib/db.ts` → Supabase şeklindedir.
- Oturum/UI state'i `lib/store.ts` içindeki Zustand store'larındadır.
- Roller yalnız `admin` ve `barista`dır. Yeni rol eklemeden önce ürün sahibine danış.
- Mevcut route, component ve tasarım yapısını yeniden yazma; küçük ve geriye uyumlu değişiklikler yap.

## Güvenlik

- `supabase/security.sql` bcrypt ve şifre RPC'lerini kurar.
- `supabase/security-v2.sql` süreli uygulama oturumu, RLS politikaları ve operasyon alan korumasını kurar.
- SQL sırası: `schema.sql` → `ops-schema.sql` → ilgili ek şemalar → `security.sql` → `push-schema.sql` → `security-v2.sql`.
- İstemcideki rol yalnız UI içindir; gerçek yetki RLS tarafından doğrulanır.
- Service role ve VAPID private key kesinlikle `NEXT_PUBLIC_*` değişkenlerine veya repoya yazılmaz.

## Push Bildirimleri

- Tarayıcı aboneliği: `lib/push.ts` ve `components/push-toggle.tsx`.
- Gönderim: `supabase/functions/send-push/index.ts`.
- Edge Function `x-kupa-session` oturumunu doğrular.
- Vercel: `NEXT_PUBLIC_VAPID_PUBLIC_KEY` gerekir.
- Supabase secrets: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` gerekir.

## Kontrol

```bash
npm run build
```

Build geçmeden deploy/commit yapma. Gerçek veriler yerine mock fallback ekleme.
