-- Run AFTER the other SQL files. Safe to re-run.
create table if not exists faqs (id uuid primary key default gen_random_uuid(), question text not null, answer text not null, sort int not null default 0, published boolean not null default true, created_at timestamptz not null default now());
create table if not exists support_tickets (id uuid primary key default gen_random_uuid(), name text not null, email text not null, subject text, message text not null, page text,
  status text not null default 'new', priority text not null default 'med', reply text, notes text, created_at timestamptz not null default now());
do $$ declare t text; begin
  foreach t in array array['faqs','support_tickets'] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "admin all" on %I', t);
    execute format('create policy "admin all" on %I for all to authenticated using (is_admin()) with check (is_admin())', t);
  end loop;
end $$;
drop policy if exists "public read faqs" on faqs;
create policy "public read faqs" on faqs for select to anon using (published);
drop policy if exists "public insert tickets" on support_tickets;
create policy "public insert tickets" on support_tickets for insert to anon
  with check (status = 'new' and length(message) between 5 and 3000 and length(name) between 1 and 80 and length(email) between 5 and 120);
do $$ begin
  drop trigger if exists wh_ticket on support_tickets;
  create trigger wh_ticket after insert on support_tickets for each row execute function trg_fire('ticket.created');
exception when undefined_function then
  raise notice 'Run supabase-dashboard.sql first to get alerts for new tickets.';
end $$;
insert into faqs(question, answer, sort)
select * from (values
 ('How do I book a consultation?', 'Open the Contact page and choose the “Book a consultation” tab. Pick a date and time and your request is sent straight to me.', 1),
 ('How can I start a project?', 'Use “Start a project” on the site or send a message from the Contact page with a few details about what you need.', 2),
 ('Where can I see your work and credentials?', 'The Projects page has case studies, and the Credentials page lists qualifications and certifications.', 3),
 ('Can I download your CV?', 'Yes. Open the About page and use Preview CV or Download PDF.', 4),
 ('I sent a message but got no reply', 'Replies go to the email you provide, so please check your spam folder. You can also reach out on WhatsApp from the Contact tab of this chat.', 5)
) v(question, answer, sort) where not exists (select 1 from faqs);
