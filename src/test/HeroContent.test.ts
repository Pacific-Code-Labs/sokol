import { afterEach, expect, it, vi } from "vitest";
const cache = vi.hoisted(() => ({ documents: {} as Record<string, unknown> }));
vi.mock("@pacific-code-labs/sokol-design-system", () => ({ cachedPublishedContent: () => cache.documents, loadPublishedContent: vi.fn() }));
import { getBundledHero, getHero, initContent } from "@/repositories/content.repository";

afterEach(() => { cache.documents = {}; initContent(); });

it("keeps older published hero copy and fills missing preview fields from the bundled document", () => {
  const { preview: _preview, ...legacy } = getBundledHero();
  cache.documents = { hero: { ...legacy, title: { en: "Published title", es: "Título publicado" } } };
  initContent();
  expect(getHero().title.en).toBe("Published title");
  expect(getHero().preview).toEqual(getBundledHero().preview);
});

it("honors partial CMS preview overrides without dropping the remaining bilingual fields", () => {
  const label = { en: "Published illustration", es: "Ilustración publicada" };
  cache.documents = { hero: { ...getBundledHero(), preview: { label } } };
  initContent();
  expect(getHero().preview.label).toEqual(label);
  expect(getHero().preview.workflowNote).toEqual(getBundledHero().preview.workflowNote);
});
