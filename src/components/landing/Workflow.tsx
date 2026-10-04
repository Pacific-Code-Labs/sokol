import { ArrowLeft, ArrowRight, MoveUpRight } from "lucide-react";
import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatedIcon } from "@/components/landing/AnimatedIcon";
import { Button } from "@/components/ui/button";
import type { CardVM, HeroVM } from "@/services/landing.service";

export function Workflow({ cards, preview, demoHref, cta, previousLabel, nextLabel }: { cards: CardVM[]; preview: HeroVM["preview"]; demoHref: string; cta: string; previousLabel: string; nextLabel: string }) {
  const [selected, setSelected] = useState(0);
  const uid = useId();
  const activeIndex = Math.min(selected, Math.max(cards.length - 1, 0));
  const active = cards[activeIndex];
  if (!active) return null;
  return (
    <div className="premium-workflow">
      <div className="workflow-panel" role="region" aria-label={preview.workflowLabel}>
        <div className="workflow-panel-top"><span className="premium-eyebrow">{preview.workflowLabel}</span><span className="workflow-count">{String(activeIndex + 1).padStart(2, "0")} / {String(cards.length).padStart(2, "0")}</span></div>
        <div className="workflow-visual" aria-hidden="true">
          <div className="workflow-orbit"><div className="workflow-orbit-inner"><AnimatedIcon Icon={active.Icon} /></div></div>
          <div className="workflow-progress">{cards.map((card, i) => <span key={card.id} className={i <= activeIndex ? "is-complete" : ""} />)}</div>
        </div>
        <div className="workflow-step" aria-live="polite" aria-atomic="true" id={`${uid}-step`}><h3>{active.title}</h3><p>{active.description}</p></div>
        <div className="workflow-navigation">
          <Button variant="outline" disabled={activeIndex === 0} aria-controls={`${uid}-step`} onClick={() => setSelected(activeIndex - 1)}><ArrowLeft aria-hidden="true" />{previousLabel}</Button>
          <Button disabled={activeIndex === cards.length - 1} aria-controls={`${uid}-step`} onClick={() => setSelected(activeIndex + 1)}>{nextLabel}<ArrowRight aria-hidden="true" /></Button>
        </div>
        <Link to={demoHref} className="premium-text-link">{cta}<MoveUpRight aria-hidden="true" /></Link>
        <p className="workflow-note">{preview.workflowNote}</p>
      </div>
    </div>
  );
}
