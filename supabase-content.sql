-- Run AFTER the other SQL files. Safe to re-run.
create table if not exists page_content (key text primary key, page text, kind text not null default 'text', value text, href text, updated_at timestamptz not null default now());
create table if not exists site_pages (id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null, intro text, nav_label text,
  show_in_nav boolean not null default true, published boolean not null default true, sort int not null default 0, created_at timestamptz not null default now());
create table if not exists page_sections (id uuid primary key default gen_random_uuid(), page text not null default 'home', placement text not null default 'bottom', layout text not null default 'text',
  eyebrow text, heading text, body text, image_url text, button_text text, button_url text, style text not null default 'default', sort int not null default 0,
  published boolean not null default true, created_at timestamptz not null default now());
do $$ declare t text; begin
  foreach t in array array['page_content','site_pages','page_sections'] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "admin all" on %I', t);
    execute format('create policy "admin all" on %I for all to authenticated using (is_admin()) with check (is_admin())', t);
  end loop;
end $$;
drop policy if exists "public read page_content" on page_content;  create policy "public read page_content"  on page_content  for select to anon using (true);
drop policy if exists "public read site_pages" on site_pages;      create policy "public read site_pages"      on site_pages     for select to anon using (published);
drop policy if exists "public read page_sections" on page_sections; create policy "public read page_sections" on page_sections for select to anon using (published);
