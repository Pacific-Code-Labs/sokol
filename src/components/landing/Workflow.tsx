import { ArrowLeft, ArrowRight, MoveUpRight } from "lucide-react";
import { AnimatePresence, m, useInView, useReducedMotion } from "motion/react";
import { useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatedIcon } from "@/components/landing/AnimatedIcon";
import { Button } from "@pacific-code-labs/sokol-design-system";
import type { CardVM, HeroVM } from "@/services/landing.service";

export function Workflow({ cards, preview, demoHref, cta, previousLabel, nextLabel }: { cards: CardVM[]; preview: HeroVM["preview"]; demoHref: string; cta: string; previousLabel: string; nextLabel: string }) {
  const [selected, setSelected] = useState(0);
  const [direction, setDirection] = useState(1);
  const visualRef = useRef<HTMLDivElement>(null);
  const visible = useInView(visualRef, { amount: 0.4 });
  const reduced = useReducedMotion();
  const animateRings = visible && !reduced;
  const uid = useId();
  const activeIndex = Math.min(selected, Math.max(cards.length - 1, 0));
  const active = cards[activeIndex];
  if (!active) return null;
  return (
    <div className="premium-workflow">
      <div className="workflow-panel" role="region" aria-label={preview.workflowLabel}>
        <div className="workflow-panel-top"><span className="premium-eyebrow">{preview.workflowLabel}</span><span className="workflow-count">{String(activeIndex + 1).padStart(2, "0")} / {String(cards.length).padStart(2, "0")}</span></div>
        <div className="workflow-visual" ref={visualRef}>
          <div className="workflow-navigation">
            <Button size="lg" className="p-0" variant="outline" disabled={activeIndex === 0} aria-label={previousLabel} aria-controls={`${uid}-step`} onClick={() => { setDirection(-1); setSelected(activeIndex - 1); }}><ArrowLeft aria-hidden="true" /></Button>
            <div className="workflow-orbit" aria-hidden="true">
              <svg className="workflow-rings" viewBox="0 0 160 160" focusable="false">
                <m.circle className="workflow-ring-outer" cx="80" cy="80" r="72" animate={{ r: animateRings ? [72, 78, 72] : 72 }} transition={{ duration: 7, repeat: animateRings ? Infinity : 0, ease: "easeInOut" }} />
                <m.circle className="workflow-ring-inner" cx="80" cy="80" r="59" animate={{ r: animateRings ? [59, 55, 59] : 59 }} transition={{ duration: 5, repeat: animateRings ? Infinity : 0, ease: "easeInOut" }} />
              </svg>
              <div className="workflow-orbit-inner">
                <AnimatePresence mode="wait" initial={false}>
                  <m.span key={active.id} className="workflow-icon-transition" initial={{ opacity: 0, scale: reduced ? 1 : 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: reduced ? 1 : 0.8 }} transition={{ duration: reduced ? 0 : 0.15 }}><AnimatedIcon Icon={active.Icon} /></m.span>
                </AnimatePresence>
              </div>
            </div>
            <Button size="lg" className="p-0" variant="outline" disabled={activeIndex === cards.length - 1} aria-label={nextLabel} aria-controls={`${uid}-step`} onClick={() => { setDirection(1); setSelected(activeIndex + 1); }}><ArrowRight aria-hidden="true" /></Button>
          </div>
          <div className="workflow-progress" aria-hidden="true">{cards.map((card, i) => <span key={card.id} className={i <= activeIndex ? "is-complete" : ""} />)}</div>
        </div>
        <div className="workflow-details">
        <div className="workflow-step" aria-live="polite" aria-atomic="true" id={`${uid}-step`}>
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <m.div key={active.id} custom={direction} variants={{ enter: (travel: number) => ({ opacity: 0, x: reduced ? 0 : travel * 18 }), shown: { opacity: 1, x: 0 }, leave: (travel: number) => ({ opacity: 0, x: reduced ? 0 : travel * -18 }) }} initial="enter" animate="shown" exit="leave" transition={{ duration: reduced ? 0 : 0.18, ease: "easeOut" }}><h3>{active.title}</h3><p>{active.description}</p></m.div>
          </AnimatePresence>
        </div>
        <Link to={demoHref} className="premium-text-link">{cta}<MoveUpRight aria-hidden="true" /></Link>
        </div>
        <p className="workflow-note">{preview.workflowNote}</p>
      </div>
    </div>
  );
}
