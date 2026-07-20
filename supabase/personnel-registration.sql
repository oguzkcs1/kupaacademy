-- Kupa Academy - Personel kayıt ve yönetici onay akışı
-- security.sql ve security-v2.sql sonrasında bir kez çalıştırın.

create extension if not exists pgcrypto;

-- Kayıt ekranının giriş yapmadan yalnızca aktif şubeleri okuyabilmesi için.
create or replace function public.app_public_branches()
returns table(id text, name text, company_id text, address text)
language sql stable security definer set search_path = public as $$
  select b.id, b.name, b.company_id, b.address
  from public.branches b
  where b.status = 'active'
  order by b.name;
$$;

-- Dışarıdan rol/durum gönderilemez. Her kayıt barista + pending oluşturulur.
create or replace function public.app_register_personnel(
  p_name text,
  p_username text,
  p_password text,
  p_branch_id text
)
returns json
language plpgsql security definer set search_path = public, extensions as $$
declare
  clean_name text := trim(coalesce(p_name, ''));
  clean_username text := lower(trim(coalesce(p_username, '')));
  branch_company text;
  new_id text;
begin
  if length(clean_name) < 3 then
    return json_build_object('ok', false, 'reason', 'invalid_name');
  end if;
  if clean_username !~ '^[a-z0-9._]{3,30}$' then
    return json_build_object('ok', false, 'reason', 'invalid_username');
  end if;
  if length(coalesce(p_password, '')) < 6 then
    return json_build_object('ok', false, 'reason', 'weak_password');
  end if;

  select b.company_id into branch_company
  from public.branches b
  where b.id = p_branch_id and b.status = 'active';
  if branch_company is null then
    return json_build_object('ok', false, 'reason', 'invalid_branch');
  end if;

  if exists(select 1 from public.users where lower(username) = clean_username) then
    return json_build_object('ok', false, 'reason', 'username_taken');
  end if;

  new_id := 'user-' || replace(gen_random_uuid()::text, '-', '');
  insert into public.users (
    id, name, username, password, role, company_id, branch_id,
    department, position, status
  ) values (
    new_id, clean_name, clean_username,
    crypt(p_password, gen_salt('bf')),
    'barista', branch_company, p_branch_id,
    'Operasyon', 'Barista', 'pending'
  );

  return json_build_object('ok', true);
exception
  when unique_violation then
    return json_build_object('ok', false, 'reason', 'username_taken');
  when others then
    raise warning 'app_register_personnel error: %', sqlerrm;
    return json_build_object('ok', false, 'reason', 'unknown');
end;
$$;

revoke all on function public.app_public_branches() from public;
revoke all on function public.app_register_personnel(text,text,text,text) from public;
grant execute on function public.app_public_branches() to anon, authenticated;
grant execute on function public.app_register_personnel(text,text,text,text) to anon, authenticated;
