-- Run AFTER supabase.sql, supabase-admin.sql, supabase-features.sql. Safe to re-run.
create table if not exists activity_log (id uuid primary key default gen_random_uuid(), kind text, message text, actor text, created_at timestamptz not null default now());
create table if not exists page_views (id uuid primary key default gen_random_uuid(), path text, referrer text, created_at timestamptz not null default now());
create table if not exists tasks (id uuid primary key default gen_random_uuid(), title text not null, details text, due_at timestamptz, priority text default 'med',
  done boolean not null default false, source text default 'manual', notified_at timestamptz, created_at timestamptz not null default now());
create table if not exists reminders (id uuid primary key default gen_random_uuid(), title text not null, remind_at timestamptz not null, kind text default 'general', ref text,
  done boolean not null default false, notified_at timestamptz, created_at timestamptz not null default now());
create table if not exists event_handlers (id uuid primary key default gen_random_uuid(), name text not null, event text not null, action text not null default 'create_task',
  title text not null default 'Follow up: {name}', offset_hours int not null default 24, active boolean not null default true, created_at timestamptz not null default now());

do $$ declare t text; begin
  foreach t in array array['activity_log','page_views','tasks','reminders','event_handlers'] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "admin all" on %I', t);
    execute format('create policy "admin all" on %I for all to authenticated using (is_admin()) with check (is_admin())', t);
  end loop;
end $$;
drop policy if exists "public insert views" on page_views;
create policy "public insert views" on page_views for insert to anon with check (length(coalesce(path,'')) <= 200);

-- Event handlers: run configured actions whenever a public event happens
create or replace function run_handlers(ev text, rec jsonb) returns void language plpgsql security definer set search_path = public as $$
declare h record; ttl text;
begin
  for h in select * from event_handlers where active and event = ev loop
    ttl := replace(h.title, '{name}', coalesce(rec->>'name','someone'));
    if h.action = 'create_task' then
      insert into tasks(title, due_at, source) values (ttl, now() + make_interval(hours => h.offset_hours), 'handler:'||ev);
    elsif h.action = 'create_reminder' then
      insert into reminders(title, remind_at, kind, ref) values (ttl, now() + make_interval(hours => h.offset_hours), 'handler', rec->>'id');
    end if;
  end loop;
end $$;

create or replace function trg_fire() returns trigger language plpgsql security definer set search_path = public as $$
begin
  begin perform fire_webhooks(tg_argv[0], to_jsonb(new)); exception when others then null; end;
  begin insert into activity_log(kind, message) values (tg_argv[0], coalesce(to_jsonb(new)->>'name','someone')); exception when others then null; end;
  begin perform run_handlers(tg_argv[0], to_jsonb(new)); exception when others then null; end;
  return new;
end $$;

-- Reminders and overdue tasks are pushed to your webhooks (e.g. Make/Zapier -> email/WhatsApp)
create or replace function process_reminders() returns void language plpgsql security definer set search_path = public as $$
declare r record;
begin
  for r in select * from reminders where not done and notified_at is null and remind_at <= now() loop
    perform fire_webhooks('reminder.due', to_jsonb(r));
    update reminders set notified_at = now() where id = r.id;
    insert into activity_log(kind, message) values ('reminder.due', r.title);
  end loop;
  for r in select * from tasks where not done and notified_at is null and due_at is not null and due_at <= now() loop
    perform fire_webhooks('task.due', to_jsonb(r));
    update tasks set notified_at = now() where id = r.id;
    insert into activity_log(kind, message) values ('task.due', r.title);
  end loop;
end $$;

do $$ begin
  create extension if not exists pg_cron;
  perform cron.unschedule('process-reminders') where exists (select 1 from cron.job where jobname = 'process-reminders');
  perform cron.schedule('process-reminders', '*/5 * * * *', 'select public.process_reminders()');
exception when others then
  raise notice 'pg_cron not enabled (Database > Extensions > pg_cron). Dashboard reminders still work; automatic webhook delivery needs it.';
end $$;

insert into event_handlers(name,event,action,title,offset_hours)
select * from (values
 ('Follow up new bookings','booking.created','create_reminder','Follow up with {name} about their booking',24),
 ('Reply to project leads','lead.created','create_task','Reply to project lead: {name}',48),
 ('Answer contact messages','message.created','create_task','Answer message from {name}',24),
 ('Review new feedback','review.created','create_task','Check new review from {name}',72)
) v(name,event,action,title,offset_hours) where not exists (select 1 from event_handlers);
