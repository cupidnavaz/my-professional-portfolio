# Uchenna Godswill'S Portfolio

<p align="center">
  <img src="assets/cupidcreativex-mark.png" alt="Uchenna Godswill logo" width="120" />
</p>

<p align="center">
  <a href="https://uchennagodswill.netlify.app/" target="_blank" rel="noreferrer">
    <img alt="Live Demo" src="https://img.shields.io/badge/Live-Demo-4FD1C5?style=for-the-badge&logo=netlify&logoColor=white" />
  </a>
  <img alt="Static Site" src="https://img.shields.io/badge/Stack-HTML%20%7C%20CSS%20%7C%20JS-8B5FE8?style=for-the-badge" />
  <img alt="Admin" src="https://img.shields.io/badge/Admin-Supabase-FF6B6B?style=for-the-badge" />
</p>

A polished multi-page portfolio and business website for Uchenna Godswill, designed to showcase data analytics, UX/UI design, web development, and agile project delivery in a single high-converting online presence.

This project is built as a static front-end website with no build step, and includes a hidden admin dashboard powered by Supabase for content and site management.

## Live site

- Production: https://uchennagodswill.netlify.app/
- GitHub: https://github.com/cupidnavaz/my-professional-portfolio

## Overview

<<<<<<< Updated upstream
This portfolio is built for a professional brand focused on:

- Data analysis and business intelligence
- UI/UX design and product thinking
- Web and app development
- Agile project management and delivery
- Digital consulting and client acquisition

The site includes a premium homepage, service pages, project case studies, client testimonials, credentials, contact forms, and a secure admin panel for content management.

## Features

- Responsive multi-page portfolio layout
- Strong personal branding and conversion-focused homepage
- Services, ventures, projects, reviews, credentials, and contact sections
- Interactive project modal and animated UI elements
- Contact and consultation forms with email fallback
- Hidden admin route at `/admin`
- Supabase-powered authentication and dashboard features
- SQL-based setup for admin access, analytics, media, and automation
- Ready for Netlify or GitHub Pages deployment

## Pages

The project includes the following pages:

- `index.html` — main landing page
- `about.html` — personal overview and professional story
- `ventures.html` — business ventures and related initiatives
- `services.html` — service catalog and offers
- `projects.html` — featured work and case studies
- `credentials.html` — credentials and achievements
- `reviews.html` — testimonials and social proof
- `contact.html` — contact and inquiry form
- `admin/` — hidden admin login and dashboard
- `404.html` — custom not-found page

## Tech stack

- HTML5
- CSS3
- Vanilla JavaScript
- Supabase
- Formspree
- Netlify / GitHub Pages hosting

## Project structure

```text
.
├── admin/
│   ├── dashboard.html
│   ├── index.html
│   └── ...
├── assets/
│   └── ...
├── .gitignore
├── .nojekyll
├── 404.html
├── about.html
├── cms.js
├── config.js
├── contact.html
├── credentials.html
├── fx.js
├── index.html
├── netlify.toml
├── projects.html
├── README.md
├── reviews.html
├── script.js
├── services.html
├── styles.css
├── supabase.sql
├── supabase-admin.sql
├── supabase-dashboard.sql
├── supabase-features.sql
├── supabase-pages.sql
├── ventures.html
└── ...
```

## Quick start

1. Clone the repository.
2. Open the site locally in your browser, or serve it with a simple static file server.
3. Update `config.js` with your real Formspree and Supabase values.

Example configuration:

```js
var FORMSPREE_ENDPOINT = 'https://formspree.io/f/your-form-id';
var SUPABASE_URL = 'https://your-project.supabase.co';
var SUPABASE_ANON_KEY = 'your-anon-key';
```

Important notes:

- Use the Supabase public anon key in the frontend.
- Never expose the service role key in a browser-based app.
- If the keys are not set, forms fall back to the user’s email client as a safe default.

## Admin panel setup

The project includes a hidden admin dashboard at `/admin`.

### 1) Create a Supabase project

- Create a Supabase project.
- Copy the project URL and public anon key into `config.js`.

### 2) Run the SQL setup files

Run the SQL files in order in the Supabase SQL editor:

1. `supabase.sql`
2. `supabase-admin.sql`
3. `supabase-features.sql`
4. `supabase-dashboard.sql`
5. `supabase-pages.sql`

For the admin setup specifically:

- Replace `YOUR_ADMIN_EMAIL` in `supabase-admin.sql` before running it.
- Create the matching admin user in Supabase Auth.
- Disable public sign-up once the admin account is added.

Then sign in at:

```text
/admin
```

The real security is enforced through the database policies in the SQL files, so the hidden UI is for convenience rather than the only protection layer.

## Extra features included

### Social / content automation

The project supports queued posts and webhooks for tools like Zapier, Make, or n8n so content can be pushed to multiple platforms without exposing social credentials in the front end.

### Dashboard analytics and automation

The admin dashboard includes support for:

- activity logging
- page view tracking
- task management
- reminders
- automation hooks
- `pg_cron`-based scheduling

### Credentials, recommendations, and CV

There is built-in support for:

- admin credentials management
- moderation of visitor recommendations and comments
- media uploads
- CV linking via `cv_url`

## Deployment

### Netlify

This repo is already prepared for Netlify.

Recommended options:

- Build command: leave blank or set to `none`
- Publish directory: `.`
- `netlify.toml` is included for static hosting configuration

### GitHub Pages

1. Push the project to a GitHub repository.
2. Go to repository settings.
3. Open Pages.
4. Use the following settings:
   - Source: Deploy from a branch
   - Branch: `main`
   - Folder: `/ (root)`
5. Your site will be available at:

```text
https://<username>.github.io/<repo>/
```

All links are relative, so the site works correctly under a repository subpath.

## Forms and integrations

Forms are wired through `config.js`:

- `FORMSPREE_ENDPOINT` — for Formspree-powered forms
- `SUPABASE_URL` and `SUPABASE_ANON_KEY` — for admin and database functionality

If these values are not configured, the site falls back to opening the visitor’s default email app so contact submissions can still be sent manually.

## Customization guide

Common updates you may want to make:

- Replace brand text and positioning in `index.html`
- Swap placeholder assets for real profile images or branding
- Update contact details and social links
- Replace testimonial content with real client feedback
- Add your actual CV and set the site metadata accordingly
- Configure Supabase and admin access properly before production use

## Notes

This project was designed to feel premium, fast, and conversion-focused while remaining easy to deploy and maintain.

The setup prioritizes a static, no-build workflow, making it ideal for a portfolio website that needs reliability, low hosting cost, and straightforward publishing.

## Author

Uchenna Godswill

Founder, CupidCreativeX Ventures

- Email: uchennagodswill9@gmail.com
- Phone: +2349039454419
- WhatsApp: https://wa.me/2349039454419

---
=======
## Editing every page
Run `supabase-content.sql` once. Then in Admin: **Edit page text** (change any text, button or image, hide sections), **Custom sections** (add new sections to any page) and **Custom pages** (new pages at `page.html?p=slug`, optionally in the menu).

## Make the forms work
Edit `config.js`:
- `FORMSPREE_ENDPOINT`: create a form at https://formspree.io and paste its endpoint.
- `SUPABASE_URL` / `SUPABASE_ANON_KEY`: create a project at https://supabase.com, run `supabase.sql` in its SQL Editor, then copy the values from Project Settings → API.
Until then, forms fall back to opening the visitor's email app.
>>>>>>> Stashed changes
