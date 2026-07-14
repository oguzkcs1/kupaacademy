-- =============================================
-- Kupa Academy - Güvenlik Sertleştirme
-- Şifre hash'leme (bcrypt) + sunucu taraflı login
-- (SQL Editor'de çalıştırın)
-- =============================================

create extension if not exists pgcrypto;

-- 1) Şifreleri otomatik bcrypt'le (insert/update'te düz metinse hash'le)
create or replace function hash_user_password()
returns trigger as $$
begin
  -- Zaten bcrypt hash'i ($2...) değilse hash'le
  if new.password is not null and new.password not like '$2%' then
    new.password := crypt(new.password, gen_salt('bf'));
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_hash_password on users;
create trigger trg_hash_password
  before insert or update on users
  for each row execute function hash_user_password();

-- 2) Mevcut düz metin şifreleri hash'e çevir (tek seferlik migrasyon)
update users
set password = crypt(password, gen_salt('bf'))
where password is not null and password not like '$2%';

-- 3) Sunucu taraflı login — şifre karşılaştırması DB'de yapılır,
--    dönen kayıtta password ALANI YOKTUR.
create or replace function app_login(p_username text, p_password text)
returns json as $$
  select to_jsonb(u) - 'password'
  from users u
  where u.username = p_username
    and u.status = 'active'
    and u.password = crypt(p_password, u.password)
  limit 1;
$$ language sql security definer;

-- anon ve authenticated bu fonksiyonu çağırabilsin
grant execute on function app_login(text, text) to anon, authenticated;

-- 4) Son giriş zamanını güncelleyen yardımcı (opsiyonel)
create or replace function app_touch_last_login(p_user_id text)
returns void as $$
  update users set last_login_at = now() where id = p_user_id;
$$ language sql security definer;
grant execute on function app_touch_last_login(text) to anon, authenticated;
