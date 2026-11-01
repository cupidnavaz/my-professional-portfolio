-- Run in Supabase SQL Editor AFTER supabase.sql and supabase-admin.sql. Safe to re-run.
create extension if not exists pg_net;

create table if not exists plugins (key text primary key, name text not null, enabled boolean not null default false, config text);
create table if not exists webhooks (
  id uuid primary key default gen_random_uuid(), name text not null, url text not null,
  events text, secret text, active boolean not null default true, created_at timestamptz not null default now());
create table if not exists social_posts (
  id uuid primary key default gen_random_uuid(), content text not null, image_url text, link_url text,
  platforms text, status text not null default 'draft', sent_at timestamptz, created_at timestamptz not null default now());

insert into plugins(key,name,enabled,config) values
 ('google_analytics','Google Analytics 4',false,''),('meta_pixel','Meta Pixel',false,''),
 ('tawk_to','Tawk.to live chat',false,''),('custom_css','Custom CSS',false,''),('custom_js','Custom JavaScript',false,'')
on conflict (key) do nothing;

do $$ declare t text; begin
  foreach t in array array['plugins','webhooks','social_posts'] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "admin all" on %I', t);
    execute format('create policy "admin all" on %I for all to authenticated using (is_admin()) with check (is_admin())', t);
  end loop;
end $$;
drop policy if exists "public read plugins" on plugins;
create policy "public read plugins" on plugins for select to anon using (enabled);

-- Webhooks: sent from the database whenever something happens
create or replace function fire_webhooks(ev text, payload jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare w record;
begin
  for w in select * from webhooks where active
           and (coalesce(events,'') = '' or ev = any(string_to_array(replace(events,' ',''), ','))) loop
    perform net.http_post(url := w.url,
      body := jsonb_build_object('event', ev, 'data', payload, 'sent_at', now()),
      headers := jsonb_build_object('Content-Type','application/json','X-Webhook-Secret', coalesce(w.secret,'')));
  end loop;
end $$;

create or replace function trg_fire() returns trigger language plpgsql security definer set search_path = public as $$
begin perform fire_webhooks(tg_argv[0], to_jsonb(new)); return new; end $$;
drop trigger if exists wh_booking on bookings;
create trigger wh_booking after insert on bookings for each row execute function trg_fire('booking.created');
drop trigger if exists wh_message on contact_messages;
create trigger wh_message after insert on contact_messages for each row execute function trg_fire('message.created');
drop trigger if exists wh_lead on quiz_leads;
create trigger wh_lead after insert on quiz_leads for each row execute function trg_fire('lead.created');
drop trigger if exists wh_review on reviews;
create trigger wh_review after insert on reviews for each row execute function trg_fire('review.created');

-- Cross-platform posting: status "queued" sends event post.publish, then marks it "sent"
create or replace function trg_post() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'queued' then
    perform fire_webhooks('post.publish', to_jsonb(new));
    new.status := 'sent'; new.sent_at := now();
  end if;
  return new;
end $$;
drop trigger if exists wh_post on social_posts;
create trigger wh_post before insert or update of status on social_posts for each row execute function trg_post();

-- Media library storage
insert into storage.buckets (id, name, public) values ('media','media',true) on conflict (id) do nothing;
drop policy if exists "media public read" on storage.objects;
create policy "media public read" on storage.objects for select using (bucket_id = 'media');
drop policy if exists "media admin write" on storage.objects;
create policy "media admin write" on storage.objects for all to authenticated
  using (bucket_id = 'media' and is_admin()) with check (bucket_id = 'media' and is_admin());
