-- ────────────────────────────────────────────────────────────────
-- ACIL DÜZELTME: ops_* tablolarında RLS'yi kapat
--
-- Sorun: security-v2.sql, ops_runs / ops_photos / ops_tasks tablolarına
-- RLS aktifleştirdi. Policy'ler her yazımda `x-kupa-session` HTTP
-- header'ıyla gelen oturumu Postgres tarafında doğrulamaya çalışıyor.
-- Supabase yönetilen PostgREST bu custom header'ı istekle beraber
-- Postgres'e iletmediği için `app_session_user_id()` NULL dönüyor,
-- tüm INSERT/UPDATE reddediliyor.
--
-- Belirtiler:
--   • Personel denetim tamamlıyor ama status 'in_progress' kalıyor
--   • Puanlama kaydolmuyor
--   • Fotoğraf yükleme sessizce başarısız
--
-- Çözüm: RLS'yi kapat, anon+authenticated'a tam erişim ver.
-- (users tablosunda da aynı yaklaşım uygulandı.)
-- Supabase Dashboard → SQL Editor → çalıştır.
-- ────────────────────────────────────────────────────────────────

-- 1) Kalıntı politikaları temizle
do $$
declare t text; p record;
begin
  foreach t in array array['ops_runs','ops_photos','ops_tasks','ops_templates'] loop
    if to_regclass('public.' || t) is not null then
      for p in select policyname from pg_policies where schemaname='public' and tablename=t loop
        execute format('drop policy if exists %I on public.%I', p.policyname, t);
      end loop;
    end if;
  end loop;
end $$;

-- 2) RLS'yi kapat ve tam erişim ver
alter table public.ops_runs      disable row level security;
alter table public.ops_photos    disable row level security;
alter table public.ops_tasks     disable row level security;
alter table public.ops_templates disable row level security;

grant all privileges on table public.ops_runs      to anon, authenticated;
grant all privileges on table public.ops_photos    to anon, authenticated;
grant all privileges on table public.ops_tasks     to anon, authenticated;
grant all privileges on table public.ops_templates to anon, authenticated;
