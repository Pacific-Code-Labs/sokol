import { useRef, type ReactNode } from "react";
import { m, useReducedMotion, useScroll, useTransform } from "motion/react";

export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // Fixed edge bands keep the readable middle consistent on short and tall screens.
  const opacity = useTransform(scrollYProgress, (progress) => {
    if (!ref.current || typeof window === "undefined") return 1;
    const height = ref.current.offsetHeight;
    const viewportHeight = window.innerHeight;
    const top = viewportHeight - progress * (viewportHeight + height);
    const entering = (viewportHeight - top) / 96;
    const leaving = (top + height - 80) / 120;
    return Math.max(0, Math.min(1, entering, leaving));
  });
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
