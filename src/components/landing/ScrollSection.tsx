import { useRef } from "react";
import { m, useReducedMotion, useScroll, useTransform, type HTMLMotionProps } from "motion/react";

/** Fade at either viewport edge; reverse naturally when the scroll direction changes. */
export function ScrollSection(props: HTMLMotionProps<"section">) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 0.14, 0.78, 1], [0, 1, 1, 0]);
  return <m.section {...props} ref={ref} style={{ ...props.style, opacity: reduced ? 1 : opacity }} />;
}
