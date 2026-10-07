# Public SEO and policy build

## URL model

Spanish and English use /es and /en. Features and how-it-works are focused pages.

The production build emits 20 public HTML documents containing the rendered page body and head metadata, plus sitemap.xml, robots.txt and a noindex 404.html. Canonical URLs are slash-free except the Spanish Tsuru homepage (/). Trailing-slash variants and old aliases have redirect documents. GitHub Pages provides HTML/meta-refresh redirects; these are not HTTP 301 rules. Sitemaps contain only the final canonical URLs, with no synthetic build-date lastmod.

## Build and verification

Install dependencies with the repo's configured pnpm version, then install the build browser once:

```sh
pnpm exec playwright install chromium
pnpm build
```

CI installs Chromium with system dependencies. The static renderer serves the local Vite output at the public origin inside an isolated build browser so public API CORS works. It fetches only public published content. The deployed HTML/assets are not used for rendering. The build fails if content, metadata or rendering is invalid. Tsuru requires its configured public API/identity pool to be available; Sokol and Ujto retain their existing bundled/cached fallback behavior.

`pnpm check:static` verifies initial HTML headings, language, canonical sitemap membership, reciprocal language alternates, approved legal contact and the 404 document. Browser/Playwright code remains a development dependency and does not ship to users. seo-manifest.json contains public metadata only.

## Content publication

After publishing CMS content that changes public pages, run the existing GitHub Pages deployment workflow again (or deploy the next source commit). Runtime refresh still reads the live CMS. Rebuilding is necessary to refresh the initial HTML and SEO snapshot; a CMS save alone does not regenerate the deployed static files. Build and deploy the HTML and hashed assets together.

## Policy ownership

The public policies and approved operator information are source-controlled in src/legal/content.json, in Spanish and English. They intentionally override old generic policy text from the CMS. Update this file and rebuild when processing, providers, storage, contact details or terms change. Operator: Pacific Code Labs; public contact: pacificcoelabs@gmail.com; address: Puntarenas, Puntarenas. Barrio El Cocal. Calle 32, Costa Rica.

Email use is transactional only. No optional analytics, advertising tracker or consent banner was added. The cookie/storage notice describes known public storage and external requests. Authenticated product data retention, provider arrangements, rights-request operations and final legal suitability still need operational review before launch; this build does not certify legal compliance.

## Indexing controls and deployment

The related private app/admin shells use noindex. Their robots rules allow a crawler to read that instruction; robots.txt never protects private records. Authentication and authorization remain responsible for access control. No private app URLs belong in these public sitemaps.

These changes were prepared locally. After deploying, confirm direct public routes return 200, missing routes return 404, and inspect representative rendered URLs in Google Search Console and Bing Webmaster Tools. Submit each public host's sitemap.xml after those checks. Ownership verification and console submission are separate account actions.
