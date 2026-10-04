// Verify the built HTML consumed by link-preview crawlers (no JavaScript).
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const seo = JSON.parse(await readFile(new URL("src/content/seo.json", root), "utf8"));
const branding = JSON.parse(await readFile(new URL("src/content/branding.json", root), "utf8"));
const site = seo.siteUrl.replace(/\/$/, "");
const routes = ["", "demo", "pricing", "features", "how"];
let checked = 0;
for (const prefix of ["", "es", "en"]) {
  const lang = prefix || "es";
  const ref = branding.socialCardUrl[lang];
  const image = new URL(ref, `${site}/`).href;
  for (const route of routes) {
    const parts = [prefix, route].filter(Boolean);
    const html = await readFile(new URL(`dist/${parts.length ? parts.join("/") + ".html" : "index.html"}`, root), "utf8");
    const label = `/${parts.join("/")}`;
    for (const [attribute, key] of [["property", "og:image"], ["name", "twitter:image"]]) {
      const matches = [...html.matchAll(new RegExp(`<meta ${attribute}="${key}" content="([^"]*)"`, "g"))];
      assert.equal(matches.length, 1, `${label}: exactly one ${key}`);
      assert.equal(matches[0][1], image, `${label}: ${key} uses ${lang}`);
    }
    assert.match(html, new RegExp(`<html\\b[^>]*lang="${lang}"`), `${label}: document language`);
    assert.ok(html.includes(`content="${lang === "en" ? "en_US" : "es_CR"}"`), `${label}: locale`);
    if (!prefix) {
      const target = `/es${route ? `/${route}` : ""}`;
      assert.ok(html.includes(`content="0;url=${target}"`), `${label}: defaults to Spanish`);
    }
    checked++;
  }
  // Bundled PNGs must be present in the deployment and match the sharing size.
  const png = await readFile(new URL(`dist${ref}`, root));
  assert.equal(png.subarray(1, 4).toString(), "PNG");
  assert.equal(png.readUInt32BE(16), 1200, `${lang}: image width`);
  assert.equal(png.readUInt32BE(20), 630, `${lang}: image height`);
}
console.log(`[social-previews] verified ${checked} URLs and 1200×630 PNGs in ${fileURLToPath(new URL("dist", root))}`);
