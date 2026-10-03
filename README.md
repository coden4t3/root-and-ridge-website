# Root and Ridge Systems — website

Production website for [rootandridgesystems.com](https://rootandridgesystems.com).

Plain static site: HTML, one CSS file and a few small JavaScript files. No framework, no build step, no dependencies.

## Structure: one flat folder

Every file sits at the top level of the repository with a unique name. There are **no subfolders on purpose**, so you can update the site by selecting all files and dragging them into GitHub's uploader without anything getting mixed up.

| Files | What they are |
| --- | --- |
| `index.html`, `services.html`, `how-it-works.html`, `pricing.html`, `about.html`, `contact.html`, `privacy.html`, `404.html` | The pages. Cloudflare serves `services.html` at `/services`, and so on. |
| `styles.css` | All styles; brand colors, fonts and spacing are at the top under **1. Brand tokens** |
| `site-config.js` | **Booking URL** (Calendly) and public email |
| `contact-form.js` | Contact form → Formspree (form ID `myezrvvw`), messages, validation |
| `main.js` | Mobile menu, booking buttons, email links |
| `roi-calculator.js` | Home page cost calculator |
| `js-flag.js` | Tiny helper for the mobile menu |
| `*.webp`, `*.png`, `*.svg`, `favicon.ico` | Logos, icons, social image, background art |
| `_headers`, `_redirects` | Cloudflare security headers and redirects |
| `robots.txt`, `sitemap.xml`, `site.webmanifest` | Search engines and browser icons |
| `.assetsignore` | Stops Cloudflare from serving this README and `.gitignore` |

**Rule for future files:** keep everything in the top level, and never give two files the same name.

## Deployment

The GitHub repository `coden4t3/root-and-ridge-website` is connected to Cloudflare (Workers static assets). Every commit to `main` deploys automatically within a couple of minutes. There's no build command.

## Updating the site through GitHub's website

1. Go to the repository → **Add file → Upload files**.
2. Select the changed files (or all files) on your computer and drag them in. Same-named files are replaced.
3. Commit to `main`.

## Common changes

| Change | Where |
| --- | --- |
| Booking link | `site-config.js` → `bookingUrl` (currently `https://calendly.com/hello-rootandridgesystems/30min`) |
| Public email | `site-config.js` → `contactEmail`; also search the `.html` files for the old address (it's there as a no-JavaScript fallback) |
| Contact form success/error wording | Top of `contact-form.js` |
| Formspree form | `formId` in `contact-form.js` **and** the form's `action` in `contact.html` |
| Prices | Only `pricing.html` (cards, FAQ, meta description) |
| Page text, titles, descriptions | The page's `.html` file |
| Navigation or footer | Repeated in every `.html` file; use find-and-replace across them |
| Colors, fonts, spacing | Top of `styles.css` |

After content changes, update the `<lastmod>` dates in `sitemap.xml`.

## Preview locally

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080/index.html. Locally, use the `.html` file names (`/services.html`); on Cloudflare the clean URLs (`/services`) work.

## Security headers

`_headers` allows scripts only from this site and `https://unpkg.com` (the Formspree library), and form submissions only to `https://formspree.io`. If you later embed a booking widget or add analytics, add their domains there, or the browser will block them.

## Secrets

None. The Calendly URL and Formspree form ID are public by design. Never commit passwords, API keys or tokens.
