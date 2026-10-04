import { ArrowRight, MoveUpRight } from "lucide-react";
import { useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { CardVM, HeroVM } from "@/services/landing.service";

export function Workflow({ cards, preview, demoHref, cta }: { cards: CardVM[]; preview: HeroVM["preview"]; demoHref: string; cta: string }) {
  const [selected, setSelected] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const uid = useId();
  const activeIndex = Math.min(selected, Math.max(cards.length - 1, 0));
  const active = cards[activeIndex];
  if (!active) return null;
  return (
    <div className="premium-workflow">
      <div className="workflow-tabs" role="tablist" aria-label={preview.workflowLabel} aria-orientation="vertical">
        {cards.map((card, index) => (
          <button key={card.id} ref={el => { tabs.current[index] = el; }} role="tab" id={`${uid}-tab-${index}`} aria-controls={`${uid}-panel`} aria-selected={activeIndex === index} tabIndex={activeIndex === index ? 0 : -1}
            className="workflow-tab" onClick={() => setSelected(index)} onKeyDown={event => {
              let next = index;
              if (event.key === "ArrowDown") next = (index + 1) % cards.length;
              else if (event.key === "ArrowUp") next = (index - 1 + cards.length) % cards.length;
              else if (event.key === "Home") next = 0;
              else if (event.key === "End") next = cards.length - 1;
              else return;
              event.preventDefault(); setSelected(next); tabs.current[next]?.focus();
            }}>
            <span className="workflow-number">{String(index + 1).padStart(2, "0")}</span>
            <span><strong>{card.title}</strong><span>{card.description}</span></span>
            <ArrowRight aria-hidden="true" />
          </button>
        ))}
        <p className="workflow-hint">{preview.workflowHint}</p>
      </div>
      <div className="workflow-panel" role="tabpanel" id={`${uid}-panel`} aria-labelledby={`${uid}-tab-${activeIndex}`} tabIndex={0}>
        <div className="workflow-panel-top"><span className="premium-eyebrow">{preview.workflowLabel}</span><span className="workflow-count">{String(activeIndex + 1).padStart(2, "0")} / {String(cards.length).padStart(2, "0")}</span></div>
        <div className="workflow-visual" aria-hidden="true">
          <div className="workflow-orbit"><div className="workflow-orbit-inner"><active.Icon /></div></div>
          <div className="workflow-progress">{cards.map((card, i) => <span key={card.id} className={i <= activeIndex ? "is-complete" : ""} />)}</div>
        </div>
        <h3>{active.title}</h3><p>{active.description}</p>
        <Link to={demoHref} className="premium-text-link">{cta}<MoveUpRight aria-hidden="true" /></Link>
        <p className="workflow-note">{preview.workflowNote}</p>
      </div>
    </div>
  );
}

