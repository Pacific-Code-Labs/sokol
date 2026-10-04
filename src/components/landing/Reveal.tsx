import { useRef, type ReactNode } from "react";
import { m, useReducedMotion, useScroll, useTransform } from "motion/react";

export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 90%", "end 30%"] });
  // Fade each visible content block, including cards in sections taller than the viewport.
  const opacity = useTransform(scrollYProgress, [0, 0.14, 0.5, 1], [0, 1, 1, 0]);
  return (
    <m.div
      ref={ref}
      className={["premium-reveal", className].filter(Boolean).join(" ")}
      style={{ opacity: reduced ? 1 : opacity }}
      initial={false}
      whileInView={reduced ? undefined : { y: [16, 0] }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </m.div>
  );
}
