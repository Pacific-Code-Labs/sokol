import { useEffect, useState } from "react";

type LandingSection = "features" | "how";

/** Track the section at the reading line without navigating or moving the page. */
export function useLandingSection(enabled: boolean, pathname: string) {
  const [section, setSection] = useState<LandingSection | null>(null);
  useEffect(() => {
    if (!enabled) {
      setSection(null);
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const headerBottom = document.querySelector("header")?.getBoundingClientRect().bottom ?? 64;
      const readingLine = headerBottom + Math.min(120, window.innerHeight * 0.2);
      const current = (["features", "how"] as const).find(id => {
        const bounds = document.getElementById(id)?.getBoundingClientRect();
        return bounds && bounds.top <= readingLine && bounds.bottom > readingLine;
      });
      setSection(current ?? null);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [enabled, pathname]);
  return section;
}
