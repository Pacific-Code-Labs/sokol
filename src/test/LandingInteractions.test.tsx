import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { MemoryRouter, useLocation } from "react-router-dom";
import { Workflow } from "@/components/landing/Workflow";
import { LanguageToggle } from "@/components/LanguageToggle";
import type { LucideIcon } from "lucide-react";
vi.mock("@/components/landing/AnimatedIcon", () => ({ AnimatedIcon: ({ Icon }: { Icon: LucideIcon }) => <Icon aria-hidden="true" /> }));
import { LangProvider } from "@/contexts/LangContext";
import { getHeroVM, getHowItWorksVM } from "@/services/landing.service";

afterEach(() => { cleanup(); localStorage.clear(); vi.useRealTimers(); });

it("navigates workflow steps inside the card and disables the endpoints", () => {
  const cards = getHowItWorksVM("en").cards;
  render(<MemoryRouter><Workflow cards={cards} preview={getHeroVM("en").preview} demoHref="/en/demo" cta="Try the demo" previousLabel="Previous" nextLabel="Next" /></MemoryRouter>);
  const region = screen.getByRole("region", { name: "Explore the process" });
  const previous = within(region).getByRole("button", { name: "Previous" });
  const next = within(region).getByRole("button", { name: "Next" });
  expect(previous).toBeDisabled();
  expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
  fireEvent.click(next);
  expect(within(region).getByRole("heading")).toHaveTextContent(cards[1].title);
  expect(previous).toBeEnabled();
  fireEvent.click(next);
  expect(within(region).getByRole("heading")).toHaveTextContent(cards[2].title);
  expect(next).toBeDisabled();
  fireEvent.click(previous);
  expect(within(region).getByRole("heading")).toHaveTextContent(cards[1].title);
  expect(within(region).getByRole("link")).toHaveAttribute("href", "/en/demo");
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
