import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import branding from "@/content/branding.json";
import seo from "@/content/seo.json";
import type { Lang } from "@/lib/i18n";

const published = vi.hoisted(() => ({ cards: { es: "", en: "" } }));
vi.mock("@/repositories/content.repository", () => ({
  getBranding: () => ({ socialCardUrl: published.cards }),
  getBundledBranding: () => branding,
  getSeo: () => seo,
}));
import { resolveSeo, useHeadTags } from "@/lib/seo";

afterEach(() => {
  cleanup();
  document.head.innerHTML = "";
  published.cards = { es: "", en: "" };
});

it("keeps language-specific bundled cards when published branding fields are empty", () => {
  for (const lang of ["es", "en"] as const) {
    expect(resolveSeo("home", lang).ogImage).toBe(`https://sokol.jcampos.dev/brand/social-card-${lang}.png`);
  }
});

it("honors a CMS sharing image override for its language", () => {
  published.cards.en = "https://media.sokol.jcampos.dev/custom-en.png";
  expect(resolveSeo("home", "en").ogImage).toBe(published.cards.en);
  expect(resolveSeo("home", "es").ogImage).toContain("social-card-es.png");
});

it("updates OG and Twitter together when navigating between languages", () => {
  function Head({ lang }: { lang: Lang }) {
    useHeadTags(resolveSeo("pricing", lang), lang, "pricing");
    return null;
  }
  const view = render(<Head lang="en" />);
  for (const lang of ["en", "es"] as const) {
    view.rerender(<Head lang={lang} />);
    const image = `https://sokol.jcampos.dev/brand/social-card-${lang}.png`;
    expect(document.querySelector('meta[property="og:image"]')?.getAttribute("content")).toBe(image);
    expect(document.querySelector('meta[name="twitter:image"]')?.getAttribute("content")).toBe(image);
    expect(document.querySelector('meta[property="og:url"]')?.getAttribute("content")).toBe(`https://sokol.jcampos.dev/${lang}/pricing`);
    expect(document.querySelectorAll('meta[property="og:image"]')).toHaveLength(1);
    const schema = JSON.parse(document.getElementById("site-page-schema")!.textContent!);
    expect(schema.url).toBe(`https://sokol.jcampos.dev/${lang}/pricing`);
    expect(schema.inLanguage).toBe(lang);
    expect(document.querySelectorAll("#site-page-schema")).toHaveLength(1);
  }
});

it.each(["how", "features"])("resolves the %s path and its language alternates", route => {
  for (const lang of ["es", "en"] as const) {
    expect(resolveSeo(route, lang).canonical).toBe(`https://sokol.jcampos.dev/${lang}/${route}`);
    expect(resolveSeo(route, lang).title).toBe(seo.pages[route as "how" | "features"][lang].title);
  }
});
