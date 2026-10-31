# Uchenna Godswill portfolio

Static multi-page site (no build step): `index`, `about`, `ventures`, `services`, `projects`, `reviews`, `contact`.

## Deploy to Netlify
- Drag the whole folder onto https://app.netlify.com/drop, **or** connect the GitHub repo
  (build command: none, publish directory: `.`; `netlify.toml` already sets this).

## Deploy to GitHub Pages
1. Create a repo and push these files to the `main` branch.
2. Repo **Settings → Pages → Build and deployment**: Source = *Deploy from a branch*, Branch = `main`, folder = `/ (root)`.
3. Your site appears at `https://<username>.github.io/<repo>/`. All links are relative, so it works under that sub-path.

## Make the forms work
Edit the top of `script.js`:
- `FORMSPREE_ENDPOINT`: create a form at https://formspree.io and paste its endpoint.
- `SUPABASE_URL` / `SUPABASE_ANON_KEY`: create a project at https://supabase.com, run `supabase.sql` in its SQL Editor, then copy the values from Project Settings → API.
Until then, forms fall back to opening the visitor's email app.
