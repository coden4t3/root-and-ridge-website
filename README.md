# Root and Ridge Systems — website

Production website for [rootandridgesystems.com](https://rootandridgesystems.com).

It's a plain static site: HTML, one CSS file, and two small JavaScript files. There's no framework, no build step, and no dependencies to install. Cloudflare serves the `public/` folder exactly as it is in the repository.

---

## 1. Project structure

```
root-and-ridge-website/
├── README.md              ← this file
├── .gitignore
└── public/                ← everything the website serves (deploy this folder)
    ├── index.html         ← Home
    ├── services/index.html
    ├── how-it-works/index.html
    ├── pricing/index.html
    ├── about/index.html
    ├── contact/index.html ← booking + contact form
    ├── privacy/index.html
    ├── 404.html           ← "page not found" page (Cloudflare uses it automatically)
    ├── robots.txt
    ├── sitemap.xml
    ├── site.webmanifest
    ├── favicon.ico, favicon-32.png, apple-touch-icon.png
    ├── _headers           ← Cloudflare security + caching headers
    ├── _redirects         ← Cloudflare redirects
    └── assets/
        ├── css/styles.css         ← all styles; brand tokens at the top
        ├── js/site-config.js      ← booking URL and public email (edit here)
        ├── js/main.js             ← mobile menu, booking buttons, email links
        ├── js/contact-form.js     ← contact form: validation + Formspree (Contact page only)
        ├── js/roi-calculator.js   ← home page cost calculator (home page only)
        ├── js/js-flag.js          ← tiny helper so the mobile menu works without flicker
        └── img/                   ← logos, icons, social image, background lines
```

Each page lives in its own folder as `index.html`, which gives clean URLs such as `/pricing/`.

## 2. Preview locally

Any static file server works. From the repository root:

```bash
# Python (already installed on most Macs and Linux machines)
python3 -m http.server 8080 --directory public
```

Then open http://localhost:8080.

Notes for local preview:
- `_headers` and `_redirects` only take effect on Cloudflare, not locally.
- The local server shows its own 404 page instead of `404.html`.

## 3. Common content changes

| Change | Where |
| --- | --- |
| Booking link, public email | `public/assets/js/site-config.js` (see section 7) |
| Contact form messages, Formspree form ID | `public/assets/js/contact-form.js` (see section 7) |
| Colors, fonts, spacing, corner radius | Top of `public/assets/css/styles.css`, under **1. Brand tokens** |
| ROI calculator wording or starting numbers | The `#calculator` section of `index.html`; the math is in `assets/js/roi-calculator.js` |
| Page text | The page's `index.html`. Each section is clearly labeled with its heading. |
| Prices | **Only** `pricing/index.html`: the price cards, the pricing FAQ and the page's meta description. Other pages deliberately say "fixed fee" or "see pricing" so a price change is a one-file edit. |
| Page title and description for Google | The `<title>` and `<meta name="description">` near the top of each page |
| Navigation or footer links | The header and footer are repeated on every page (8 files). Use find-and-replace across `public/` so they stay identical. |
| Logo | `public/assets/img/`. Keep the same file names and sizes, or update `width`/`height` in the HTML. |
| Add a page | Copy an existing page folder, edit it, then add it to the nav/footer and to `sitemap.xml`. |

After editing, update `<lastmod>` dates in `sitemap.xml` for pages that changed.

## 4. How production deployment works

1. The repository `coden4t3/root-and-ridge-website` is connected to Cloudflare.
2. Every push or merge to the **`main`** branch triggers a new deployment automatically.
3. Pull requests and other branches get their own preview URLs, so you can check changes before merging.

### First-time Cloudflare setup (Cloudflare Pages)

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Pick `coden4t3/root-and-ridge-website`.
3. Build settings:
   - **Production branch:** `main`
   - **Framework preset:** None
   - **Build command:** leave empty
   - **Build output directory:** `public`
4. Save and deploy.
5. In the project → **Custom domains**, add `rootandridgesystems.com` and `www.rootandridgesystems.com`.

### Connecting the Namecheap domain

Choose one approach:

- **Recommended: move DNS to Cloudflare.** Add the domain to Cloudflare (free plan), then in Namecheap → Domain → **Nameservers** → *Custom DNS*, enter the two nameservers Cloudflare gives you. Custom domains, HTTPS and the www redirect then work automatically.
- **Keep DNS at Namecheap.** In Namecheap → **Advanced DNS**, add a `CNAME` record for `www` pointing to your `*.pages.dev` address. A root-domain record at Namecheap can't point to Pages directly, so you'd also set a Namecheap redirect from the bare domain to `https://www.rootandridgesystems.com`, and change the site's canonical URLs to use `www`. This is why the first option is simpler.

Either way, re-add your email provider's MX/TXT records (e.g. Google Workspace) wherever DNS lives.

**Preferred URL:** the site uses `https://rootandridgesystems.com` (no `www`) in canonical tags, the sitemap and structured data. Redirect `www` to the bare domain with a Cloudflare **Redirect Rule** (Rules → Redirect Rules → "Redirect from WWW to root" template).

<details>
<summary>Alternative: Cloudflare Workers with static assets</summary>

If you'd rather create a Worker than a Pages project, add a `wrangler.jsonc` at the repository root:

```jsonc
{
  "name": "root-and-ridge-website",
  "compatibility_date": "2026-10-01",
  "assets": { "directory": "./public", "not_found_handling": "404-page" }
}
```

Then connect the repo under **Workers & Pages → Create → Import a repository**. `_headers` and `_redirects` work the same way. Don't add this file if you use Pages.
</details>

## 5. Build command

None. There's nothing to compile or install.

## 6. Output directory

`public`

## 7. Booking and contact settings

The booking link and public email live in **`public/assets/js/site-config.js`**:

```js
window.RR_CONFIG = {
  bookingUrl: "https://calendly.com/hello-rootandridgesystems/30min",
  contactEmail: "hello@rootandridgesystems.com"
};
```

- **`bookingUrl`**: every "Book a Discovery Call" button on the site (they carry `data-cta="book"`) uses this link. It's currently set to the Calendly discovery-call page. If it's ever cleared, the buttons fall back to `/contact/`, so nothing breaks. While it's set, the Contact page also shows a "Pick a time" block at the top. The HTML keeps `href="/contact/"` on these buttons as the no-JavaScript fallback; don't replace it.
- **`contactEmail`**: the address shown in the footer, on the Contact page and in the privacy policy. It's also written into the HTML as a fallback for visitors without JavaScript; if you change it, search `public/` for the old address too.

**Contact form (Formspree).** The form on `/contact/` sends to Formspree form `myezrvvw` using Formspree's official vanilla JavaScript library, `@formspree/ajax@1`, loaded from unpkg on the Contact page only. The setup is in `public/assets/js/contact-form.js`:

- Our checks run first: name, email (valid format) and message are required; everything else is optional.
- While sending, the button is disabled and reads "Sending…", so a visitor can't submit twice.
- On success the visitor stays on the page, the form clears, and a confirmation appears.
- On failure, everything they typed stays in place and a plain-English error appears (no technical details).
- The success and error wording is at the top of `contact-form.js`.
- The form's `action` attribute in `contact/index.html` also points to `https://formspree.io/f/myezrvvw`, so the form still works without JavaScript (in that case Formspree shows its own thank-you page).
- To use a different Formspree form, change the ID in both places: `formId` in `contact-form.js` and the `action` in `contact/index.html`.
- Keep the hidden `_gotcha` field; it's Formspree's spam trap.

None of these values are secret: the Formspree form ID is meant to be public. Never put passwords or API keys in this repository.

## 8. Security headers

`public/_headers` sets a strict Content-Security-Policy that only allows files from this site, the Formspree library from `https://unpkg.com`, and form submissions to `https://formspree.io`. If you later:

- **embed** a Cal.com or Calendly widget on a page (rather than linking to it), add its domains to `script-src`, `frame-src` and `connect-src`;
- **add analytics** (e.g. Cloudflare Web Analytics), add its script domain to `script-src` and `connect-src`;
- **switch form providers**, replace `https://formspree.io` in `connect-src` and `form-action`, and `https://unpkg.com` in `script-src`.

If something stops loading after a change like this, the browser console will name the blocked domain.

## 9. Environment variables

None are needed. The site has no server code and no secrets.

## 10. Accessibility and performance notes

- Semantic landmarks, one `<h1>` per page, a skip link, labeled form fields, visible focus rings, and keyboard-friendly menu (Escape closes it).
- FAQs use native `<details>` elements, so they work without JavaScript.
- Animations respect the visitor's "reduce motion" setting.
- Images are WebP with fixed dimensions (no layout shift). The footer logo is lazy-loaded.
- Fonts use each device's native system font, so there are no font downloads.
