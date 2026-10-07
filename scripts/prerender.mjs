import { fileURLToPath } from "node:url";
import { renderStatic } from "./render-static.mjs";
const keys = ["home", "demo", "pricing", "features", "how", "privacy", "cookies", "terms", "contact", "about"];
const slug = (key) => key === "home" ? "" : `/${key}`;
await renderStatic({
  outDir: fileURLToPath(new URL("../dist", import.meta.url)),
  site: "https://sokol.jcampos.dev",
  pages: ["es", "en"].flatMap((lang) => keys.map((key) => ({ route: `/${lang}${slug(key)}`, lang, key }))),
  aliases: Object.fromEntries(keys.map((key) => [slug(key) || "/", `/es${slug(key)}`])),
});
