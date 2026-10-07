// Render the production app, including published public content, into static HTML.
// The browser is a build dependency only; no browser automation ships to visitors.
import { createServer } from "node:http";
import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

export async function renderStatic({ outDir, site, pages, aliases = {}, base = "/" }) {
  const out = path.resolve(outDir);
  const shell = await readFile(path.join(out, "index.html"), "utf8");
  const prefix = base.replace(/\/$/, "");
  const publicPath = (route) => prefix + route;
  const esc = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".woff2": "font/woff2" };
  const routes = new Set(pages.map(({ route }) => publicPath(route)));
  // Known routes always receive the original Vite shell, never an earlier snapshot.
  const server = createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
      if (routes.has(pathname)) {
        res.writeHead(200, { "Content-Type": "text/html" });
        return res.end(shell);
      }
      if (prefix && !pathname.startsWith(prefix + "/")) { res.writeHead(404); return res.end(); }
      const file = path.resolve(out, "." + pathname.slice(prefix.length));
      if (!file.startsWith(out + path.sep) || !(await stat(file)).isFile()) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" });
      res.end(await readFile(file));
    } catch { res.writeHead(404); res.end(); }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  let browser;
  const snapshots = [];
  const renderedHeads = new Map();
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
    // Serve local build bytes at the real public origin so the published API's
    // CORS policy is exercised correctly. Never load the deployed HTML/assets.
    await context.route(new URL(site).origin + "/**", async (route) => {
      const request = new URL(route.request().url());
      const response = await route.fetch({ url: `http://127.0.0.1:${server.address().port}${request.pathname}${request.search}` });
      await route.fulfill({ response });
    });
    for (const { route, lang, key } of pages) {
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      const canonical = site.replace(/\/$/, "") + publicPath(route);
      await page.goto(canonical, { waitUntil: "networkidle", timeout: 60000 });
      await page.waitForFunction(({ canonical, lang }) => {
        return document.querySelector("#root h1")?.textContent?.trim() &&
          document.querySelector('link[rel="canonical"]')?.getAttribute("href") === canonical &&
          document.documentElement.lang === lang &&
          document.querySelector("#root")?.textContent?.trim().length > 150;
      }, { canonical, lang }, { timeout: 30000 }).catch(async (error) => {
        const state = await page.evaluate(() => ({ title: document.title, lang: document.documentElement.lang, canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href"), heading: document.querySelector("h1")?.textContent, text: document.body.innerText.slice(0, 250) }));
        throw new Error(`Cannot render ${route}: ${JSON.stringify({ ...state, errors })}`, { cause: error });
      });
      // Reveal content which normally animates into view, then restore the top.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 800) {
          window.scrollTo(0, y);
          await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(400);
      if (errors.length) throw new Error(`${route}: ${errors.join("; ")}`);
      const data = await page.evaluate(() => ({
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.content,
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href"),
        robots: document.querySelector('meta[name="robots"]')?.content || "index,follow",
        heading: document.querySelector("#root h1")?.textContent,
      }));
      if (!data.description || /noindex/i.test(data.robots) || data.canonical !== canonical) throw new Error(`Invalid SEO snapshot: ${route}`);
      const jsonLd = JSON.stringify({ "@context": "https://schema.org", "@type": "WebPage", name: data.title, description: data.description, url: canonical, inLanguage: lang }).replace(/</g, "\\u003c");
      await page.evaluate((json) => {
        document.querySelectorAll('script[type="application/ld+json"]').forEach((el) => el.remove());
        const el = document.createElement("script");
        el.id = "site-page-schema";
        el.type = "application/ld+json";
        el.textContent = json;
        document.head.appendChild(el);
        // A snapshot is a settled document, not an entrance/exit animation frame.
        // React restores transition classes when it mounts for interactive use.
        document.querySelectorAll(".page-enter, .page-exit, .language-enter, .language-exit, .lang-anim-in, .lang-anim-out").forEach((element) => {
          element.classList.remove("page-enter", "page-exit", "language-enter", "language-exit", "lang-anim-in", "lang-anim-out");
        });
      }, jsonLd);
      const html = await page.content();
      renderedHeads.set(route, html.match(/<head[^>]*>([\s\S]*?)<\/head>/i)?.[1] || "");
      const file = route === "/" ? "index.html" : route.slice(1) + ".html";
      await mkdir(path.dirname(path.join(out, file)), { recursive: true });
      await writeFile(path.join(out, file), html);
      snapshots.push({ route, lang, key, ...data });
      console.log(`Rendered ${route}`);
      await page.close();
    }
  } finally {
    await browser?.close();
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
  const redirects = {
    ...Object.fromEntries(pages.filter(({ route }) => route !== "/").map(({ route }) => [route + "/", route])),
    ...Object.fromEntries(Object.entries(aliases).filter(([route]) => route !== "/").map(([route, target]) => [route + "/", target])),
    ...aliases,
  };
  for (const [route, target] of Object.entries(redirects)) {
    const destination = target.startsWith("http") ? target : publicPath(target);
    const canonical = target.startsWith("http") ? target : site.replace(/\/$/, "") + destination.split("#")[0];
    const lang = /\/en(?:\/|$|#)/.test(destination) ? "en" : "es";
    const targetHead = (renderedHeads.get(target.split("#")[0]) || "").replace(/<script(?![^>]*application\/ld\+json)[^>]*>[\s\S]*?<\/script>/gi, "");
    const html = targetHead ? `<!doctype html><html lang="${lang}"><head>${targetHead}<meta http-equiv="refresh" content="0;url=${esc(destination)}"></head><body><a href="${esc(destination)}">${lang === "en" ? "Continue" : "Continuar"}</a><script>location.replace(${JSON.stringify(destination).replace(/</g, "\\u003c")});</script></body></html>` : `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${lang === "en" ? "Continue" : "Continuar"}</title><link rel="canonical" href="${esc(canonical)}"><meta http-equiv="refresh" content="0;url=${esc(destination)}"></head><body><a href="${esc(destination)}">${lang === "en" ? "Continue" : "Continuar"}</a><script>location.replace(${JSON.stringify(destination).replace(/</g, "\\u003c")});</script></body></html>`;
    const file = route === "/" ? "index.html" : route.endsWith("/") ? route.slice(1) + "index.html" : route.slice(1) + ".html";
    await mkdir(path.dirname(path.join(out, file)), { recursive: true });
    await writeFile(path.join(out, file), html);
  }
  const entries = snapshots.map((page) => {
    const equivalents = snapshots.filter((other) => other.key === page.key);
    return `  <url><loc>${esc(page.canonical)}</loc>${equivalents.map((other) => `<xhtml:link rel="alternate" hreflang="${other.lang}" href="${esc(other.canonical)}"/>`).join("")}</url>`;
  });
  await writeFile(path.join(out, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join("\n")}\n</urlset>\n`);
  await writeFile(path.join(out, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${site.replace(/\/$/, "")}${prefix}/sitemap.xml\n`);
  await writeFile(path.join(out, "404.html"), `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><title>404 — Página no encontrada / Page not found</title></head><body><main><h1>404 — Página no encontrada / Page not found</h1><p><a href="${esc(prefix || "/")}">Inicio / Home</a></p></main></body></html>`);
  await writeFile(path.join(out, "seo-manifest.json"), JSON.stringify(snapshots, null, 2) + "\n");
  console.log(`Static SEO: ${snapshots.length} rendered pages, ${Object.keys(redirects).length} redirect documents, sitemap and real 404 fallback.`);
}
