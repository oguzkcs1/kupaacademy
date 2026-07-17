-- Kupa Academy güvenli uygulama oturumu ve RLS politikaları
-- security.sql çalıştırıldıktan sonra bir kez çalıştırın.

create extension if not exists pgcrypto;

create table if not exists public.app_sessions (
  token uuid primary key default gen_random_uuid(),
  user_id text not null references public.users(id) on delete cascade,
  expires_at timestamptz not null default (now() + interval '30 days'),
  created_at timestamptz not null default now()
);
alter table public.app_sessions enable row level security;
revoke all on public.app_sessions from anon, authenticated;

create or replace function public.app_request_session_token()
returns uuid language plpgsql stable as $$
declare value text;
begin
  value := (current_setting('request.headers', true)::jsonb ->> 'x-kupa-session');
  if value is null or value = '' then return null; end if;
  return value::uuid;
exception when others then return null;
end;
$$;

create or replace function public.app_session_user_id()
returns text language sql stable security definer set search_path = public as $$
  select user_id from app_sessions
  where token = app_request_session_token() and expires_at > now()
  limit 1;
$$;

create or replace function public.app_session_role()
returns text language sql stable security definer set search_path = public as $$
  select u.role from users u where u.id = app_session_user_id() limit 1;
$$;

create or replace function public.app_session_branch_id()
returns text language sql stable security definer set search_path = public as $$
  select u.branch_id from users u where u.id = app_session_user_id() limit 1;
$$;

create or replace function public.app_is_admin()
returns boolean language sql stable as $$ select coalesce(app_session_role() = 'admin', false); $$;

-- Giriş artık kullanıcı bilgisiyle birlikte tahmin edilemez, süreli oturum anahtarı döndürür.
create or replace function public.app_login(p_username text, p_password text)
returns json language plpgsql security definer set search_path = public, extensions as $$
declare found_user users%rowtype; new_token uuid;
begin
  select * into found_user from users
  where username = p_username and status = 'active'
    and password = crypt(p_password, password)
  limit 1;
  if found_user.id is null then return null; end if;

  delete from app_sessions where expires_at <= now();
  insert into app_sessions(user_id) values(found_user.id) returning token into new_token;
  update users set last_login_at = now() where id = found_user.id;
  return json_build_object(
    'user', to_jsonb(found_user) - 'password',
    'sessionToken', new_token::text
  );
end;
$$;

create or replace function public.app_logout(p_token uuid)
returns void language sql security definer set search_path = public as $$
  delete from app_sessions where token = p_token;
$$;

revoke all on function public.app_login(text,text) from public;
revoke all on function public.app_logout(uuid) from public;
grant execute on function public.app_login(text,text), public.app_logout(uuid) to anon, authenticated;
grant execute on function public.app_session_user_id(), public.app_session_role(), public.app_session_branch_id(), public.app_is_admin() to anon, authenticated;

-- Şifre hash sütunu tarayıcıya asla açık değildir.
revoke select on public.users from anon, authenticated;
grant select (id,name,username,email,role,avatar,company_id,branch_id,department,position,status,created_at,last_login_at)
on public.users to anon, authenticated;

-- Önce eski gevşek politikaları temizle ve RLS'yi etkinleştir.
do $$
declare t text; p record;
begin
  foreach t in array array[
    'companies','branches','users','categories','trainings','training_completions',
    'videos','recipes','announcements','document_folders','documents','badges',
    'user_badges','notifications','ops_templates','ops_runs','ops_photos','ops_tasks',
    'push_subscriptions','job_applications'
  ] loop
    if to_regclass('public.' || t) is not null then
      execute format('alter table public.%I enable row level security', t);
      for p in select policyname from pg_policies where schemaname='public' and tablename=t loop
        execute format('drop policy if exists %I on public.%I', p.policyname, t);
      end loop;
    end if;
  end loop;
end $$;

-- Ortak akademi içeriği: giriş yapanlar okur, yalnız yönetici değiştirir.
do $$
declare t text;
begin
  foreach t in array array['companies','branches','users','categories','trainings','videos','recipes','announcements','document_folders','documents','badges','ops_templates'] loop
    if to_regclass('public.' || t) is not null then
      execute format('create policy %I on public.%I for select using (app_session_user_id() is not null)', t || '_read', t);
      execute format('create policy %I on public.%I for all using (app_is_admin()) with check (app_is_admin())', t || '_admin', t);
    end if;
  end loop;
end $$;

create policy completions_read on public.training_completions for select
  using (app_is_admin() or user_id = app_session_user_id());
create policy completions_insert on public.training_completions for insert
  with check (user_id = app_session_user_id());
create policy completions_admin on public.training_completions for all
  using (app_is_admin()) with check (app_is_admin());

create policy user_badges_read on public.user_badges for select
  using (app_is_admin() or user_id = app_session_user_id());
create policy user_badges_self on public.user_badges for insert
  with check (user_id = app_session_user_id());
create policy user_badges_admin on public.user_badges for all
  using (app_is_admin()) with check (app_is_admin());

create policy notifications_read on public.notifications for select
  using (app_is_admin() or user_id = app_session_user_id());
create policy notifications_insert on public.notifications for insert
  with check (app_is_admin() or user_id = app_session_user_id());
create policy notifications_update on public.notifications for update
  using (app_is_admin() or user_id = app_session_user_id());

create policy ops_runs_read on public.ops_runs for select
  using (app_is_admin() or branch_id = app_session_branch_id());
create policy ops_runs_write on public.ops_runs for insert
  with check (app_is_admin() or (branch_id = app_session_branch_id() and user_id = app_session_user_id()));
create policy ops_runs_update on public.ops_runs for update
  using (app_is_admin() or (branch_id = app_session_branch_id() and user_id = app_session_user_id()));

create policy ops_photos_read on public.ops_photos for select
  using (app_is_admin() or branch_id = app_session_branch_id());
create policy ops_photos_write on public.ops_photos for insert
  with check (app_is_admin() or (branch_id = app_session_branch_id() and user_id = app_session_user_id()));
create policy ops_photos_admin on public.ops_photos for all
  using (app_is_admin()) with check (app_is_admin());

create policy ops_tasks_read on public.ops_tasks for select
  using (app_is_admin() or branch_id = app_session_branch_id() or assignee_id = app_session_user_id());
create policy ops_tasks_admin on public.ops_tasks for all
  using (app_is_admin()) with check (app_is_admin());
create policy ops_tasks_assignee_update on public.ops_tasks for update
  using (assignee_id = app_session_user_id());

create policy push_self_read on public.push_subscriptions for select
  using (user_id = app_session_user_id());
create policy push_self_insert on public.push_subscriptions for insert
  with check (user_id = app_session_user_id());
create policy push_self_update on public.push_subscriptions for update
  using (user_id = app_session_user_id()) with check (user_id = app_session_user_id());
create policy push_self_delete on public.push_subscriptions for delete
  using (user_id = app_session_user_id());

-- Kariyer formu dışarıdan başvuru kabul eder; başvuruları yalnız yönetici görür.
create policy career_public_insert on public.job_applications for insert with check (true);
create policy career_admin on public.job_applications for all
  using (app_is_admin()) with check (app_is_admin());

-- Barista, operasyon kaydına fotoğraf/checklist ekleyebilir ancak puan, yönetici
-- yorumu, şube veya onay durumunu tarayıcıdan değiştirerek manipüle edemez.
create or replace function public.protect_ops_run_review_fields()
returns trigger language plpgsql set search_path = public as $$
declare section_index int; item_index int; old_score jsonb;
begin
  if current_user in ('postgres','service_role','supabase_admin') or app_is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.score := null;
    new.manager_comment := null;
    new.status := 'in_progress';
  else
    new.branch_id := old.branch_id;
    new.user_id := old.user_id;
    new.template_id := old.template_id;
    new.date := old.date;
    new.score := old.score;
    new.manager_comment := old.manager_comment;
    if new.status not in ('in_progress','completed') then new.status := old.status; end if;
  end if;

  -- Her checklist maddesinin puanı yalnız merkez tarafından yazılır.
  if jsonb_typeof(new.sections) = 'array' then
    for section_index in 0..jsonb_array_length(new.sections)-1 loop
      if jsonb_typeof(new.sections #> array[section_index::text,'items']) = 'array' then
        for item_index in 0..jsonb_array_length(new.sections #> array[section_index::text,'items'])-1 loop
          old_score := case when tg_op = 'UPDATE'
            then old.sections #> array[section_index::text,'items',item_index::text,'score']
            else 'null'::jsonb end;
          new.sections := jsonb_set(
            new.sections,
            array[section_index::text,'items',item_index::text,'score'],
            coalesce(old_score, 'null'::jsonb), true
          );
        end loop;
      end if;
    end loop;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_ops_run_review on public.ops_runs;
create trigger trg_protect_ops_run_review
before insert or update on public.ops_runs
for each row execute function public.protect_ops_run_review_fields();

-- Atanan personel görevde yalnız durum/tamamlanma zamanını değiştirebilir.
create or replace function public.protect_ops_task_fields()
returns trigger language plpgsql set search_path = public as $$
begin
  if current_user in ('postgres','service_role','supabase_admin') or app_is_admin() then return new; end if;
  new.title := old.title;
  new.description := old.description;
  new.branch_id := old.branch_id;
  new.assignee_id := old.assignee_id;
  new.due_date := old.due_date;
  new.created_by := old.created_by;
  return new;
end;
$$;

drop trigger if exists trg_protect_ops_task on public.ops_tasks;
create trigger trg_protect_ops_task before update on public.ops_tasks
for each row execute function public.protect_ops_task_fields();

-- Operasyon fotoğrafları herkese açık yazılamaz/silinemez.
drop policy if exists "ops_photos_read" on storage.objects;
drop policy if exists "ops_photos_insert" on storage.objects;
drop policy if exists "ops_photos_delete" on storage.objects;
create policy "ops_photos_read" on storage.objects for select
  using (bucket_id = 'ops-photos' and app_session_user_id() is not null);
create policy "ops_photos_insert" on storage.objects for insert
  with check (bucket_id = 'ops-photos' and app_session_user_id() is not null);
create policy "ops_photos_delete" on storage.objects for delete
  using (bucket_id = 'ops-photos' and app_is_admin());
