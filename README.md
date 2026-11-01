# Uchenna Godswill portfolio

Static multi-page site (no build step): `index`, `about`, `ventures`, `services`, `projects`, `reviews`, `contact`.

## Deploy to Netlify
- Drag the whole folder onto https://app.netlify.com/drop, **or** connect the GitHub repo
  (build command: none, publish directory: `.`; `netlify.toml` already sets this).

## Deploy to GitHub Pages
1. Create a repo and push these files to the `main` branch.
2. Repo **Settings → Pages → Build and deployment**: Source = *Deploy from a branch*, Branch = `main`, folder = `/ (root)`.
3. Your site appears at `https://<username>.github.io/<repo>/`. All links are relative, so it works under that sub-path.

## Admin panel (`/admin`)
Login at `your-site/admin` (there is deliberately no link to it); it opens the dashboard at `/admin/dashboard.html`. The navbar shows a **Dashboard** link only while an admin is signed in.
1. Create a free Supabase project. Put its URL and **anon public** key in `config.js` (never the service_role key).
2. SQL Editor: run `supabase.sql`, then `supabase-admin.sql` (first replace `YOUR_ADMIN_EMAIL`).
3. Authentication → Users → **Add user** with that same email and a strong password. Then turn **off** "Allow new users to sign up".
4. Commit and push; visit `/admin` and sign in.
Security note: the real protection is the database rules in `supabase-admin.sql` (only emails in the `admins` table can change anything). The hidden link is just convenience.

## Extra admin features
Run `supabase-features.sql` once in the Supabase SQL Editor (after the two earlier files). It adds Plugins, Webhooks, Social posts and the Media bucket. Then in the dashboard: **Appearance** (theme, colors, fonts, social links), **Media**, **Plugins**, **Webhooks**, **Social posts**.
Cross-platform posting: this site cannot hold your social network API keys safely, so a queued post is sent as a `post.publish` webhook to Zapier / Make / n8n, which publishes it to each platform.

## Make the forms work
Edit `config.js`:
- `FORMSPREE_ENDPOINT`: create a form at https://formspree.io and paste its endpoint.
- `SUPABASE_URL` / `SUPABASE_ANON_KEY`: create a project at https://supabase.com, run `supabase.sql` in its SQL Editor, then copy the values from Project Settings → API.
Until then, forms fall back to opening the visitor's email app.
