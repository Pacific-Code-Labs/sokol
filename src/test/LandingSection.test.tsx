import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useLandingSection } from "@/hooks/useLandingSection";

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.useRealTimers(); });

it("tracks both scroll directions, clears outside sections and ignores non-landing pages", () => {
  vi.useFakeTimers();
  let offset = 0;
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function () {
    const top = this.id === "features" ? 500 - offset : this.id === "how" ? 1200 - offset : 0;
    const height = this.tagName === "HEADER" ? 64 : 700;
    return { top, bottom: top + height, left: 0, right: 100, width: 100, height, x: 0, y: top, toJSON() {} };
  });
  function Probe({ enabled = true }: { enabled?: boolean }) {
    const section = useLandingSection(enabled, enabled ? "/en/features" : "/en/demo");
    return <><header /><section id="features" /><section id="how" /><output>{section ?? "none"}</output></>;
  }
  const view = render(<Probe />);
  const tick = () => act(() => { vi.advanceTimersToNextFrame(); });
  const scrollTo = (next: number) => { offset = next; fireEvent.scroll(window); tick(); };
  tick();
  expect(screen.getByRole("status")).toHaveTextContent("none");
  scrollTo(500);
  expect(screen.getByRole("status")).toHaveTextContent("features");
  scrollTo(1200);
  expect(screen.getByRole("status")).toHaveTextContent("how");
  scrollTo(500);
  expect(screen.getByRole("status")).toHaveTextContent("features");
  scrollTo(1950);
  expect(screen.getByRole("status")).toHaveTextContent("none");
  view.rerender(<Probe enabled={false} />);
  scrollTo(500);
  expect(screen.getByRole("status")).toHaveTextContent("none");
});
