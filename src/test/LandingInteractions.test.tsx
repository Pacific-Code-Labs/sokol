import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { MemoryRouter, useLocation } from "react-router-dom";
import { Workflow } from "@/components/landing/Workflow";
import { LanguageToggle } from "@/components/LanguageToggle";
import { LangProvider } from "@/contexts/LangContext";
import { getHeroVM, getHowItWorksVM } from "@/services/landing.service";

afterEach(() => { cleanup(); localStorage.clear(); vi.useRealTimers(); });

it("selects workflow steps with pointer and keyboard, keeping the panel associated with its selected tab", () => {
  const cards = getHowItWorksVM("en").cards;
  render(<MemoryRouter><Workflow cards={cards} preview={getHeroVM("en").preview} demoHref="/en/demo" cta="Try the demo" /></MemoryRouter>);
  const tabs = screen.getAllByRole("tab");
  fireEvent.click(tabs[1]);
  expect(tabs[1]).toHaveAttribute("aria-selected", "true");
  expect(within(screen.getByRole("tabpanel")).getByRole("heading")).toHaveTextContent(cards[1].title);
  fireEvent.keyDown(tabs[1], { key: "ArrowDown" });
  expect(tabs[2]).toHaveFocus();
  expect(tabs[2]).toHaveAttribute("aria-selected", "true");
  expect(screen.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", tabs[2].id);
  fireEvent.keyDown(tabs[2], { key: "ArrowDown" });
  expect(tabs[0]).toHaveFocus();
  fireEvent.keyDown(tabs[0], { key: "End" });
  expect(tabs[2]).toHaveFocus();
  expect(within(screen.getByRole("tabpanel")).getByRole("link")).toHaveAttribute("href", "/en/demo");
});

it.each(["es", "en"] as const)("shows the current %s flag and preserves the page, search and section when switching", lang => {
  vi.useFakeTimers();
  localStorage.setItem("sokol-lang", lang);
  function Location() { const location = useLocation(); return <output data-testid="location">{location.pathname + location.search + location.hash}</output>; }
  const view = render(<MemoryRouter initialEntries={[`/${lang}/pricing?plan=free#compare`]}><LangProvider><LanguageToggle /><Location /></LangProvider></MemoryRouter>);
  expect(view.container.querySelector("svg")).toHaveAttribute("data-language", lang);
  const button = screen.getByRole("button");
  expect(button.getAttribute("aria-label")).toMatch(lang === "es" ? /Idioma actual: Español/ : /Current language: English/);
  fireEvent.click(button);
  act(() => { vi.advanceTimersByTime(300); });
  expect(screen.getByTestId("location")).toHaveTextContent(`/${lang === "es" ? "en" : "es"}/pricing?plan=free#compare`);
});
