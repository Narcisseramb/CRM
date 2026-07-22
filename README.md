# Rambelson Global — dynamic site (Cloudflare Pages + D1)

Static marketing site (`index.html`, `story.html`, `quiz-demo.html`,
`guide-company-registration-madagascar.html`) plus a small serverless
backend built on **Cloudflare Pages Functions** and a **D1** database.

## What's dynamic

- **Contact form** (`/api/contact`) — stores every submission in D1 (`leads`
  table) and, if `RESEND_API_KEY` is configured, emails a notification. No
  more relying on the visitor's `mailto:` client.
- **Quiz results** (`/api/quiz`) — the Malagasy quiz demo posts each
  attempt's score to D1 (`quiz_results`) instead of only showing it client-side.
- **Content API** (`/api/content?lang=en|fr`) — the services grid and FAQ
  list on the homepage are fetched from D1 (`services`, `faqs` tables) and
  rendered client-side, so they can be edited without touching code. If the
  API is unreachable, the page falls back to the static English markup
  that ships in `index.html`.
- **EN / FR toggle** — a language switcher in the header swaps all static
  copy (translation dictionary embedded in `index.html`) and re-fetches
  services/FAQ content in the selected language. Malagasy was intentionally
  left out of this toggle.
- **Admin dashboard** (`/admin.html`) — token-gated page to view/delete
  leads, view quiz result stats, and add/edit/delete services and FAQ
  entries (writes straight to D1).

## Project layout

```
index.html, story.html, quiz-demo.html, guide-*.html   static pages
admin.html                                              admin dashboard (noindex)
functions/api/contact.js                                POST — save lead + optional email
functions/api/quiz.js                                    POST — save quiz result
functions/api/content.js                                 GET  — services + FAQ for a given lang
functions/api/admin/*                                     token-protected CRUD (leads, quiz-results, services, faqs)
functions/_lib/auth.js                                    shared bearer-token auth helper
schema.sql                                                D1 schema + seed data (EN/FR)
wrangler.toml                                             Pages + D1 binding config
```

## First-time deploy

1. **Install & log in to Wrangler** (if not already):
   ```
   npm install -g wrangler
   wrangler login
   ```

2. **Create the D1 database:**
   ```
   wrangler d1 create rambelson-global-db
   ```
   Copy the `database_id` it prints into `wrangler.toml`.

3. **Load the schema + seed content:**
   ```
   wrangler d1 execute rambelson-global-db --remote --file=./schema.sql
   ```

4. **Create the Pages project** (from the repo root):
   ```
   wrangler pages project create rambelson-global
   wrangler pages deploy .
   ```
   Or connect the GitHub repo directly in the Cloudflare dashboard
   (Pages → Create project → Connect to Git). Build command: none. Build
   output directory: `/`.

5. **Bind the D1 database to the Pages project** (dashboard: Pages project →
   Settings → Functions → D1 database bindings → add binding named `DB`
   pointing at `rambelson-global-db`). This mirrors `wrangler.toml` for the
   deployed (not just local) environment.

6. **Set secrets:**
   ```
   wrangler pages secret put ADMIN_TOKEN
   ```
   Pick a long random string — this is the password for `/admin.html`.

   Optional, to actually send email notifications for new leads (via
   [Resend](https://resend.com)):
   ```
   wrangler pages secret put RESEND_API_KEY
   wrangler pages secret put CONTACT_TO_EMAIL     # defaults to contact@rambelsonglobal.com
   wrangler pages secret put CONTACT_FROM_EMAIL   # must be a verified Resend sender
   ```
   Without `RESEND_API_KEY`, leads are still saved to D1 — just no email is sent.

## Local development

```
wrangler d1 execute rambelson-global-db --local --file=./schema.sql
wrangler pages dev . --d1=DB=rambelson-global-db --binding ADMIN_TOKEN=devtoken
```

Then open the printed local URL, and sign in to `/admin.html` with
`devtoken`.

## Notes

- `robots.txt` disallows `/admin.html`; it's also served with a `noindex`
  meta tag.
- Admin auth is a single shared bearer token compared against `ADMIN_TOKEN`
  — enough for one operator, not a multi-user permission system.
- `story.html` and `guide-company-registration-madagascar.html` remain
  static (English-only) — only the homepage content the owner is likely to
  update often (services, FAQ, contact form) was made dynamic.
