-- ────────────────────────────────────────────────────────────────
-- ACIL DÜZELTME: session-header'a bağımlı tüm RLS'leri kapat
--
-- Sorun: security-v2.sql, training_completions / user_badges /
-- notifications / push_subscriptions tablolarına da HTTP header'a
-- bağlı RLS aktifleştirdi. Supabase managed PostgREST bu custom
-- header'ı iletmediği için app_session_user_id() NULL dönüyor,
-- INSERT/UPDATE/SELECT reddediliyor.
--
-- Belirtiler:
--   • Kullanıcı eğitimi tamamlıyor, "tamamlandı" görünüyor,
--     yeniledikten sonra sıfırlanıyor (insert reddedilmiş)
--   • Rozetler görünmüyor
--   • Bildirimler kaydolmuyor
--
-- Çözüm: users/ops_* için yapıldığı gibi RLS'yi kapat, tam erişim ver.
-- Yetki uygulama katmanında.
-- Supabase Dashboard → SQL Editor → çalıştır.
-- ────────────────────────────────────────────────────────────────

-- 1) Mevcut politikaları temizle
do $$
declare t text; p record;
begin
  foreach t in array array[
    'training_completions','user_badges','notifications','push_subscriptions',
    'companies','branches','categories','trainings','videos','recipes',
    'announcements','document_folders','documents','badges','job_applications'
  ] loop
    if to_regclass('public.' || t) is not null then
      for p in select policyname from pg_policies where schemaname='public' and tablename=t loop
        execute format('drop policy if exists %I on public.%I', p.policyname, t);
      end loop;
    end if;
  end loop;
end $$;

-- 2) RLS'yi kapat ve anon+authenticated'a tam erişim ver
do $$
declare t text;
begin
  foreach t in array array[
    'training_completions','user_badges','notifications','push_subscriptions',
    'companies','branches','categories','trainings','videos','recipes',
    'announcements','document_folders','documents','badges','job_applications'
  ] loop
    if to_regclass('public.' || t) is not null then
      execute format('alter table public.%I disable row level security', t);
      execute format('grant all privileges on table public.%I to anon, authenticated', t);
    end if;
  end loop;
end $$;
