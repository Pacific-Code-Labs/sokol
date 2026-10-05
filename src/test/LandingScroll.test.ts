import { afterEach, describe, expect, it, vi } from "vitest";
import { scrollToLandingSection } from "@/lib/landing-scroll";

afterEach(() => { document.body.innerHTML = ""; vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("process navigation alignment", () => {
  it("centers the card below the sticky header from any scroll position", () => {
    document.body.innerHTML = '<header></header><section id="how"><div class="workflow-panel"></div></section>';
    vi.spyOn(document.querySelector("header")!, "getBoundingClientRect").mockReturnValue({ bottom: 72 } as DOMRect);
    vi.spyOn(document.querySelector(".workflow-panel")!, "getBoundingClientRect").mockReturnValue({ top: 1200, height: 400 } as DOMRect);
    vi.stubGlobal("innerHeight", 900);
    vi.stubGlobal("scrollY", 300);
    const scroll = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    scrollToLandingSection("how", "smooth");
    expect(scroll).toHaveBeenCalledWith({ top: 1214, behavior: "smooth" });
  });
  it("keeps an oversized card's start accessible below the header", () => {
    document.body.innerHTML = '<header></header><section id="how"><div class="workflow-panel"></div></section>';
    vi.spyOn(document.querySelector("header")!, "getBoundingClientRect").mockReturnValue({ bottom: 72 } as DOMRect);
    vi.spyOn(document.querySelector(".workflow-panel")!, "getBoundingClientRect").mockReturnValue({ top: 500, height: 600 } as DOMRect);
    vi.stubGlobal("innerHeight", 383);
    vi.stubGlobal("scrollY", 0);
    const scroll = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    scrollToLandingSection("how", "instant");
    expect(scroll).toHaveBeenCalledWith({ top: 428, behavior: "instant" });
  });
});
