import { m, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import type { LucideIcon } from "lucide-react";

/** Decorative illustrations are keyed by content ID, so CMS reordering preserves their meaning. */
export function FeatureVisual({ id, Icon }: { id: string; Icon: LucideIcon }) {
  const ref = useRef<SVGSVGElement>(null);
  const visible = useInView(ref, { amount: 0.3 });
  const reduced = useReducedMotion();
  const active = visible && !reduced;
  const loop = (delay = 0) => ({ duration: 3.6, delay: active ? delay : 0, repeat: active ? Infinity : 0, ease: "easeInOut" as const });
  const pulse = (delay = 0) => ({ animate: { opacity: active ? [0.4, 1, 0.4] : 1 }, transition: loop(delay) });

  return (
    <m.svg ref={ref} viewBox="0 0 280 104" className="feature-visual" data-feature-visual={id} aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {id === "instant-analysis" ? <>
        {[24, 42, 33, 60, 48, 72, 62].map((height, i) => <m.rect key={i} className="visual-fill" x={28 + i * 33} y={88 - height} width="17" height={height} rx="4" animate={{ height: active ? [height * 0.65, height, height * 0.65] : height, attrY: active ? [88 - height * 0.65, 88 - height, 88 - height * 0.65] : 88 - height }} transition={loop(i * 0.13)} />)}
      </> : id === "nfpa-references" ? <>
        <rect className="visual-surface" x="36" y="22" width="68" height="72" rx="7" />
        <m.g animate={{ y: active ? [0, -4, 0] : 0 }} transition={loop()}>
          <rect className="visual-surface" x="59" y="10" width="68" height="72" rx="7" />
          <path d="M73 27H99M73 37H111M73 47H103M73 63H90" className="visual-grid" />
          <path d="M105 10V24H127" />
        </m.g>
        <m.path d="M141 49H178" strokeDasharray="4 6" {...pulse()} />
        <circle className="visual-tint" cx="214" cy="49" r="26" />
        <m.path d="M202 49L211 58L227 40" animate={{ pathLength: active ? [0.4, 1, 1] : 1, opacity: active ? [0.35, 1, 0.35] : 1 }} transition={loop(0.3)} />
      </> : id === "cr-context" ? <>
        <path className="visual-surface" d="M28 28L97 14L176 30L249 16V80L176 94L97 78L28 92Z" />
        <path className="visual-grid" d="M97 14V78M176 30V94M29 58L97 44L176 60L249 46M59 22L58 86M214 23V87" />
        <m.path d="M48 72L89 58L124 70L159 53L208 59L231 39" strokeDasharray="3 7" animate={{ strokeDashoffset: active ? [0, -40] : 0 }} transition={{ ...loop(), ease: "linear" }} />
        <m.g animate={{ y: active ? [0, -6, 0] : 0 }} transition={loop()}>
          <path className="visual-pin" d="M161 54S143 36 143 25A18 18 0 0 1 179 25C179 36 161 54 161 54Z" />
          <circle cx="161" cy="25" r="6" />
        </m.g>
        <m.ellipse cx="161" cy="60" rx="15" ry="4" className="visual-tint" {...pulse()} />
      </> : id === "structured-outputs" ? <>
        {[18, 0, -18].map((offset, i) => <m.g key={offset} animate={{ y: active ? [0, i === 2 ? -5 : i === 0 ? 5 : 0, 0] : 0 }} transition={loop(i * 0.15)}>
          <path className="visual-surface" d={`M55 ${48 + offset}L137 ${17 + offset}L222 ${48 + offset}L137 ${80 + offset}Z`} />
          <path className="visual-grid" d={`M84 ${48 + offset}L137 ${28 + offset}L193 ${48 + offset}L137 ${69 + offset}Z`} />
          <m.circle cx="137" cy={48 + offset} r="4" className="visual-fill" {...pulse(i * 0.3)} />
        </m.g>)}
      </> : id === "conversational" ? <>
        <m.g animate={{ x: active ? [0, 4, 0] : 0 }} transition={loop()}>
          <path className="visual-surface" d="M34 12H170A10 10 0 0 1 180 22V46A10 10 0 0 1 170 56H65L45 69V56H34A10 10 0 0 1 24 46V22A10 10 0 0 1 34 12Z" />
          <path className="visual-grid" d="M44 29H138M44 40H112" />
        </m.g>
        <path className="visual-tint" d="M116 51H247A9 9 0 0 1 256 60V80A9 9 0 0 1 247 89H233V99L216 89H116A9 9 0 0 1 107 80V60A9 9 0 0 1 116 51Z" />
        {[160, 181, 202].map((x, i) => <m.circle key={x} cx={x} cy="70" r="3.5" className="visual-fill" animate={{ y: active ? [0, -4, 0] : 0, opacity: active ? [0.35, 1, 0.35] : 1 }} transition={{ ...loop(i * 0.2), duration: 1.8 }} />)}
      </> : id === "export" ? <>
        <path className="visual-surface" d="M68 34V8H169L185 24V34M169 8V24H185" />
        <rect className="visual-surface" x="42" y="34" width="169" height="49" rx="10" />
        <path className="visual-grid" d="M59 49H83M68 65H185" />
        <m.circle cx="194" cy="48" r="3" className="visual-fill" {...pulse()} />
        <m.g animate={{ y: active ? [-3, 3, -3] : 0 }} transition={loop()}>
          <path className="visual-surface" d="M77 65H176V96H77Z" />
          <path className="visual-grid" d="M91 77H160M91 85H145" />
        </m.g>
        <m.g animate={{ y: active ? [0, 5, 0] : 0 }} transition={loop(0.2)}><path d="M243 26V58M233 48L243 58L253 48" /></m.g>
      </> : <>
        <circle className="visual-grid" cx="140" cy="52" r="38" />
        <m.circle cx="140" cy="52" r="29" {...pulse()} />
        <Icon x="124" y="36" width="32" height="32" />
      </>}
    </m.svg>
  );
}
