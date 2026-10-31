-- ============================================================
-- ADMIN PANEL setup. Run AFTER supabase.sql, in Supabase -> SQL Editor.
-- 1) Replace YOUR_ADMIN_EMAIL below with the email you will log in with.
-- 2) In Supabase -> Authentication -> Users: "Add user" with that SAME email + a strong password.
-- 3) In Authentication -> Providers/Sign In: turn OFF "Allow new users to sign up".
-- Safe to re-run.
-- ============================================================
create extension if not exists pgcrypto;
create table if not exists admins (email text primary key);
insert into admins(email) values ('YOUR_ADMIN_EMAIL') on conflict do nothing;

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from admins where lower(email) = lower(coalesce(auth.jwt() ->> 'email','')));
$$;
grant execute on function is_admin() to anon, authenticated;

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, category text not null default 'data',
  tag text, title text not null, client text, duration text,
  summary text, overview text, request text, challenge text, solution text, results text,
  tools text, icon text default '📁', image_url text,
  featured boolean not null default false, sort int not null default 0,
  published boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  title text unique not null, description text, icon text default '✨', color text default 'blue',
  includes text, sort int not null default 0, published boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists settings (key text primary key, value text);

alter table reviews          add column if not exists approved boolean not null default true;
alter table bookings         add column if not exists status text default 'new', add column if not exists notes text;
alter table quiz_leads       add column if not exists status text default 'new', add column if not exists notes text;
alter table contact_messages add column if not exists status text default 'new', add column if not exists notes text;

do $$ declare t text; begin
  foreach t in array array['admins','projects','services','settings','reviews','bookings','quiz_leads','contact_messages'] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "admin all" on %I', t);
    execute format('create policy "admin all" on %I for all to authenticated using (is_admin()) with check (is_admin())', t);
  end loop;
end $$;

drop policy if exists "Public can read reviews" on reviews;
drop policy if exists "public read reviews" on reviews;
create policy "public read reviews"  on reviews  for select to anon using (approved);
drop policy if exists "public read projects" on projects;
create policy "public read projects" on projects for select to anon using (published);
drop policy if exists "public read services" on services;
create policy "public read services" on services for select to anon using (published);
drop policy if exists "public read settings" on settings;
create policy "public read settings" on settings for select to anon using (true);

-- Starter content copied from the current site so nothing disappears
insert into projects(slug,category,tag,title,client,duration,summary,overview,request,challenge,solution,results,tools,icon,featured,sort) values
($s$northstar-dashboard$s$,$s$data$s$,$s$Data Analytics$s$,$s$Northstar Sales Dashboard$s$,$s$Northstar Distribution (40-person sales team)$s$,$s$6 weeks$s$,$s$A Power BI + SQL reporting layer that replaced five conflicting spreadsheets with one trusted, role-based dashboard.$s$,$s$A Power BI + SQL reporting layer that replaced five conflicting spreadsheets with one trusted, role-based dashboard.$s$,$s$Leadership wanted a single source of truth for weekly sales numbers instead of five spreadsheets that never quite agreed with each other.$s$,$s$Sales data lived across three disconnected systems with no consistent definition of a ‘closed deal,’ so every report told a different story.$s$,$s$Built a SQL data warehouse layer to normalize the three sources, then designed a Power BI dashboard with role-based views for reps, managers, and leadership.$s$,$s$Weekly reporting time dropped from a full day to under two hours, and the sales team now works from one trusted number instead of five.$s$,$s$Power BI, SQL Server, Python (ETL), DAX$s$,$s$📊$s$,true,0),
($s$fieldnote-analytics$s$,$s$data$s$,$s$Data Analytics$s$,$s$Fieldnote Ops Analytics$s$,$s$Fieldnote Field Services$s$,$s$5 weeks$s$,$s$A real-time operations dashboard that surfaced crew bottlenecks the same day instead of a week later.$s$,$s$A real-time operations dashboard that surfaced crew bottlenecks the same day instead of a week later.$s$,$s$Ops managers wanted to see crew utilization and job bottlenecks in real time instead of finding out about problems a week later.$s$,$s$Field data was logged on paper and entered into spreadsheets days after each job, so problems surfaced far too late to act on.$s$,$s$Introduced a lightweight digital intake form feeding a live ops dashboard with utilization, delay, and completion-rate tracking.$s$,$s$Bottlenecks are now caught same-day instead of a week later, and average job turnaround improved by 18%.$s$,$s$Looker Studio, Google Sheets API, Zapier$s$,$s$🥧$s$,false,1),
($s$loomwell-storefront$s$,$s$data$s$,$s$Web Development$s$,$s$Loomwell Storefront Rebuild$s$,$s$Loomwell (DTC home goods brand)$s$,$s$8 weeks$s$,$s$A headless storefront migration that made the site fast and let the marketing team edit it without a developer.$s$,$s$A headless storefront migration that made the site fast and let the marketing team edit it without a developer.$s$,$s$Replace a slow, template-locked storefront with something fast, and something the marketing team could update themselves.$s$,$s$The old site took six-plus seconds to load on mobile, and every content change required a developer to ship it.$s$,$s$Rebuilt on a headless commerce stack with a visual page builder for the marketing team and an aggressive performance budget baked into every template.$s$,$s$Mobile load time dropped to under 2 seconds and conversion rate rose 34% in the first full month post-launch.$s$,$s$Next.js, Shopify Headless, Tailwind CSS, Vercel$s$,$s$🛒$s$,true,2),
($s$harborline-app$s$,$s$web$s$,$s$App Development$s$,$s$Harborline Booking App$s$,$s$Harborline Marina Services$s$,$s$10 weeks$s$,$s$A cross-platform booking app that replaced three disconnected spreadsheets with one live, shared calendar.$s$,$s$A cross-platform booking app that replaced three disconnected spreadsheets with one live, shared calendar.$s$,$s$Replace three separate booking spreadsheets with one system that both staff and customers could use.$s$,$s$Double-bookings were common because staff worked from different spreadsheets that were never kept in sync.$s$,$s$Built a cross-platform booking app with a shared live calendar, automated conflict checks, and customer self-service booking.$s$,$s$Double-bookings dropped to zero within the first three months, and staff save roughly 6 hours a week on manual coordination.$s$,$s$React Native, Firebase, Stripe$s$,$s$📅$s$,false,3),
($s$nimbus-app-ux$s$,$s$data$s$,$s$UI/UX Design$s$,$s$Nimbus Mobile App UX$s$,$s$Nimbus (seed-stage fintech app)$s$,$s$4 weeks$s$,$s$An onboarding-flow redesign, backed by user testing, that nearly halved first-week drop-off.$s$,$s$An onboarding-flow redesign, backed by user testing, that nearly halved first-week drop-off.$s$,$s$First-week user drop-off was high and the founders couldn’t pinpoint exactly where people were getting stuck.$s$,$s$The onboarding flow asked for too much information too early, before users had seen any real value from the app.$s$,$s$Ran a short round of user testing, then redesigned onboarding to defer non-essential steps and front-load a quick, tangible win.$s$,$s$First-week drop-off fell by nearly half after the redesigned flow shipped.$s$,$s$Figma, Maze (user testing), FigJam$s$,$s$📲$s$,false,4),
($s$vantage-dashboard-ux$s$,$s$uiux$s$,$s$UI/UX Design$s$,$s$Vantage Dashboard UX$s$,$s$Vantage Analytics (internal data team)$s$,$s$3 weeks$s$,$s$A wireframe-to-prototype redesign that made a years-old internal dashboard usable without training.$s$,$s$A wireframe-to-prototype redesign that made a years-old internal dashboard usable without training.$s$,$s$The data team’s internal dashboard had grown organically for years and nobody outside the team could use it without training.$s$,$s$Years of ad-hoc additions meant no consistent layout, unclear hierarchy, and duplicate charts nobody fully trusted.$s$,$s$Ran quick stakeholder interviews, then wireframed and prototyped a simplified layout organized around the three decisions the dashboard actually needed to support.$s$,$s$New starters can now use the dashboard without training, and two duplicate reporting tools were retired.$s$,$s$Figma, Miro$s$,$s$📝$s$,false,5),
($s$aperture-brand-system$s$,$s$data$s$,$s$Branding & UI$s$,$s$Aperture Brand System$s$,$s$Aperture (early-stage SaaS startup)$s$,$s$5 weeks$s$,$s$A full visual identity and component library built ahead of a seed fundraising round.$s$,$s$A full visual identity and component library built ahead of a seed fundraising round.$s$,$s$Founders needed a professional brand identity ahead of a seed fundraising round.$s$,$s$The existing logo was a placeholder from a freelancer marketplace with no supporting system — no defined colors, type, or usage rules.$s$,$s$Designed a full identity system: logo, color palette, typography, and a component library so the brand stayed consistent across the product and marketing site.$s$,$s$The founders reported the new identity was referenced positively by two investors during fundraising conversations.$s$,$s$Illustrator, Figma, Brand guidelines doc$s$,$s$🎨$s$,true,6),
($s$orbitmark-identity$s$,$s$branding$s$,$s$Branding & Graphics$s$,$s$Orbitmark Logo & Identity$s$,$s$Orbitmark (pre-launch startup)$s$,$s$3 weeks$s$,$s$A logo, type system, and color palette delivered on a fixed, non-negotiable launch deadline.$s$,$s$A logo, type system, and color palette delivered on a fixed, non-negotiable launch deadline.$s$,$s$Needed a full visual identity built fast, ahead of a product launch event with a fixed date.$s$,$s$The launch date was fixed and non-negotiable, leaving very little room for design revisions.$s$,$s$Ran a compressed identity sprint — logo concepts, palette, and type system finalized and delivered inside three weeks.$s$,$s$Identity was ready two days ahead of the launch event with zero late-stage revisions needed.$s$,$s$Illustrator, Figma$s$,$s$🔵$s$,false,7)
on conflict (slug) do nothing;

insert into services(title,description,icon,color,includes,sort) values
($s$Web & App Development$s$,$s$Fast, responsive builds — from marketing sites to full product front-ends and mobile-friendly web apps. Clean code, sensible architecture, and performance budgets built in from day one.$s$,$s$💻$s$,$s$blue$s$,$s$Responsive websites, Web apps, API integration, Performance optimization, Maintenance & support$s$,0),
($s$Generative AI Services$s$,$s$AI-powered tools and workflows that automate the repetitive parts of your business — from internal copilots to customer-facing assistants, built on real production data rather than demos.$s$,$s$🤖$s$,$s$orange$s$,$s$AI chat & assistants, Workflow automation, Prompt engineering, Model integration$s$,1),
($s$UI/UX Design$s$,$s$Interfaces designed around what people are actually trying to get done — wireframes and prototypes tested against real tasks, not just aesthetics.$s$,$s$🎨$s$,$s$magenta$s$,$s$User research, Wireframing, Prototyping, Design systems, Usability testing$s$,2),
($s$Data Analytics & Insights$s$,$s$Dashboards and reporting pipelines that teams actually use to decide things — connected directly to your existing data sources, not another static spreadsheet.$s$,$s$📊$s$,$s$blue$s$,$s$Dashboard design, SQL & ETL pipelines, Power BI / Looker, KPI reporting$s$,3),
($s$Graphics Design$s$,$s$Logos, marketing assets, and visual language that stay consistent as you grow — built as a system, not a one-off file that's hard to reuse.$s$,$s$🖌️$s$,$s$teal$s$,$s$Logo design, Brand style guides, Marketing collateral, Social media assets$s$,4),
($s$Digital Consultation$s$,$s$Strategic guidance to plan your digital transformation before a line of code is written — scoping, tooling decisions, and roadmap planning that avoids expensive rebuilds later.$s$,$s$🧭$s$,$s$violet$s$,$s$Tech stack audits, Roadmapping, Vendor selection, Process design$s$,5),
($s$Digital Marketing$s$,$s$Campaigns and growth strategy to get your product in front of the right people — grounded in the same analytics discipline used across every other service.$s$,$s$📣$s$,$s$orange$s$,$s$SEO, Content strategy, Paid campaigns, Analytics & reporting$s$,6)
on conflict (title) do nothing;

