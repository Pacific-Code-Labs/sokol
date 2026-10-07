// Validate the deployable HTML itself, independently of runtime React effects.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const out = path.resolve(process.argv[2] || "dist");
const pages = JSON.parse(await readFile(path.join(out, "seo-manifest.json"), "utf8"));
const sitemap = await readFile(path.join(out, "sitemap.xml"), "utf8");
assert.equal((sitemap.match(/<loc>/g) || []).length, pages.length, "Sitemap contains canonical pages only");
for (const page of pages) {
  const file = page.route === "/" ? "index.html" : page.route.slice(1) + ".html";
  const html = await readFile(path.join(out, file), "utf8");
  assert.match(html, /<h1\b[^>]*>[\s\S]+?<\/h1>/i, `${file}: initial HTML contains main heading`);
  assert.match(html, new RegExp(`<html[^>]*lang="${page.lang}"`), `${file}: document language`);
  assert.ok(html.includes(`href="${page.canonical}"`), `${file}: canonical present`);
  assert.equal((html.match(/rel="canonical"/g) || []).length, 1, `${file}: exactly one canonical`);
  assert.equal((html.match(/<title>/g) || []).length, 1, `${file}: exactly one title`);
  assert.ok(!/class="[^"]*\bpage-(?:enter|exit)\b/.test(html), `${file}: no transient page animation in initial HTML`);
  assert.ok(!/<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(html), `${file}: indexable`);
  assert.ok(sitemap.includes(`<loc>${page.canonical}</loc>`), `${file}: sitemap URL matches canonical`);
  for (const alternate of pages.filter((other) => other.key === page.key)) {
    assert.ok(html.includes(`hreflang="${alternate.lang}" href="${alternate.canonical}"`), `${file}: reciprocal ${alternate.lang} alternate`);
  }
  if (["privacy", "cookies", "terms", "privacidad", "terminos", "contact", "contacto"].includes(page.key)) {
    assert.ok(html.includes("pacificcoelabs@gmail.com"), `${file}: approved contact`);
    assert.ok(html.includes("Barrio El Cocal"), `${file}: approved address`);
    assert.ok(!html.includes("tsuru-markets.org"), `${file}: no obsolete contact`);
  }
}
const missing = await readFile(path.join(out, "404.html"), "utf8");
assert.match(missing, /name="robots" content="noindex,follow"/);
assert.ok(!missing.includes("location.replace"), "Missing pages must not redirect to the homepage");
assert.match(await readFile(path.join(out, "robots.txt"), "utf8"), /Sitemap: https:\/\//);
assert.ok(!sitemap.includes("<lastmod>"), "No synthetic build-date lastmod");
console.log(`Static checks passed: ${pages.length} pages, canonical sitemap, language alternates, legal contact and 404.`);
