-- Run AFTER the other SQL files. Safe to re-run.
create table if not exists credentials (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'certification', title text not null, issuer text, year text,
  description text, credential_url text, image_url text, icon text,
  sort int not null default 0, published boolean not null default true, created_at timestamptz not null default now());
create table if not exists recommendations (
  id uuid primary key default gen_random_uuid(),
  name text not null, role text, rating int, message text not null,
  approved boolean not null default false, created_at timestamptz not null default now());

do $$ declare t text; begin
  foreach t in array array['credentials','recommendations'] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "admin all" on %I', t);
    execute format('create policy "admin all" on %I for all to authenticated using (is_admin()) with check (is_admin())', t);
  end loop;
end $$;
drop policy if exists "public read credentials" on credentials;
create policy "public read credentials" on credentials for select to anon using (published);
drop policy if exists "public read recommendations" on recommendations;
create policy "public read recommendations" on recommendations for select to anon using (approved);
drop policy if exists "public insert recommendations" on recommendations;
create policy "public insert recommendations" on recommendations for insert to anon
  with check (approved = false and length(message) between 10 and 2000 and length(name) between 1 and 80);

do $$ begin
  drop trigger if exists wh_recommendation on recommendations;
  create trigger wh_recommendation after insert on recommendations for each row execute function trg_fire('recommendation.created');
exception when undefined_function then
  raise notice 'Run supabase-dashboard.sql first to get webhook/activity alerts for new recommendations.';
end $$;

-- Services can use an image instead of an emoji icon
alter table services add column if not exists image_url text;
