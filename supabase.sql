-- ============================================================
-- Supabase setup for the CupidCreativeX / Uchenna Godswill site
-- ============================================================
-- HOW TO USE THIS FILE:
-- 1. Go to https://supabase.com, sign up free, create a new project.
-- 2. Open your project -> SQL Editor -> New query.
-- 3. Paste this entire file in and click "Run".
-- 4. Go to Project Settings -> API and copy:
--      - "Project URL"        -> paste into SUPABASE_URL in script.js
--      - "anon public" key    -> paste into SUPABASE_ANON_KEY in script.js
-- That's it — reviews, bookings, quiz leads, and contact messages will
-- all start saving into these tables automatically.
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- REVIEWS — shown publicly on the "What Our Clients Say" section
-- ------------------------------------------------------------
create table if not exists reviews (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  role        text,
  rating      int not null check (rating between 1 and 5),
  message     text not null,
  created_at  timestamptz not null default now()
);

alter table reviews enable row level security;

-- Anyone visiting the site can submit a review
create policy "Public can insert reviews"
  on reviews for insert
  to anon
  with check (true);

-- Anyone visiting the site can read reviews (needed to display them)
create policy "Public can read reviews"
  on reviews for select
  to anon
  using (true);


-- ------------------------------------------------------------
-- BOOKINGS — consultation requests. Private: only you should read these
-- (view them in Table Editor in your Supabase dashboard).
-- ------------------------------------------------------------
create table if not exists bookings (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  email           text not null,
  preferred_time  text,
  message         text,
  created_at      timestamptz not null default now()
);

alter table bookings enable row level security;

create policy "Public can insert bookings"
  on bookings for insert
  to anon
  with check (true);

-- No public select policy on purpose — only visible to you via the
-- Supabase dashboard (or an authenticated request), not the public site.


-- ------------------------------------------------------------
-- QUIZ LEADS — full project-quiz submissions. Private.
-- ------------------------------------------------------------
create table if not exists quiz_leads (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text,
  services    jsonb,
  features    jsonb,
  budget      text,
  timeline    text,
  details     text,
  created_at  timestamptz not null default now()
);

alter table quiz_leads enable row level security;

create policy "Public can insert quiz leads"
  on quiz_leads for insert
  to anon
  with check (true);


-- ------------------------------------------------------------
-- CONTACT MESSAGES — general contact form submissions. Private.
-- ------------------------------------------------------------
create table if not exists contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  message     text not null,
  created_at  timestamptz not null default now()
);

alter table contact_messages enable row level security;

create policy "Public can insert contact messages"
  on contact_messages for insert
  to anon
  with check (true);

-- ============================================================
-- Done. To view submissions any time: Supabase dashboard ->
-- Table Editor -> pick a table. Reviews will also appear live
-- on the website itself once SUPABASE_URL / SUPABASE_ANON_KEY
-- are set in script.js.
-- ============================================================
