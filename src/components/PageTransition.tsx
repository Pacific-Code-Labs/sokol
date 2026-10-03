import { useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { stripLangPrefix } from "@/lib/paths";

/**
 * Wraps page content and re-applies the ".page-enter" animation class on every
 * location.pathname change. Keying by the route without its language prefix preserves form/demo state
 * during language changes. Navigating to another page forces React
 * to remount it, which restarts the CSS animation. The animation itself is a
 * no-op under prefers-reduced-motion (see src/index.css).
 *
 * A new page starts at the top. A language switch (same page, other prefix)
 * keeps the scroll position, and `#section` links are scrolled by the page.
 *
 * No framer-motion — pure CSS + a remount key.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const { pathname, hash } = useLocation();
  const { rest } = stripLangPrefix(pathname);
  const prevRest = useRef(rest);

  useLayoutEffect(() => {
    if (rest !== prevRest.current && !hash) window.scrollTo({ top: 0 });
    prevRest.current = rest;
  }, [rest, hash]);

  return (
    <div key={rest} className="page-enter">
      {children}
    </div>
  );
}

export default PageTransition;
