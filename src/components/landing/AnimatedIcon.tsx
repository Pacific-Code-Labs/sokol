import { useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import { useAnimate, useInView, useReducedMotion, stagger } from "motion/react";

/** Animate the SVG strokes themselves, only while visible. */
export function AnimatedIcon({ Icon, className }: { Icon: LucideIcon; className?: string }) {
  const [scope, animate] = useAnimate<HTMLSpanElement>();
  const visible = useInView(scope, { amount: 0.4 });
  const reduced = useReducedMotion();
  useEffect(() => {
    const strokes = "svg path, svg line, svg polyline, svg polygon, svg circle, svg rect";
    const controls = visible && !reduced
      ? animate(strokes, { pathLength: [1, 0.65, 1], opacity: [1, 0.5, 1] }, { duration: 3.5, delay: stagger(0.12), repeat: Infinity, repeatDelay: 0.8, ease: "easeInOut" })
      : animate(strokes, { pathLength: 1, opacity: 1 }, { duration: 0 });
    return () => controls.stop();
  }, [Icon, visible, reduced, animate]);
  return <span ref={scope} className="animated-icon" aria-hidden="true"><Icon className={className} /></span>;
}
