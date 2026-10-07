import { ArrowDown, ArrowRight, Check, MoveUpRight, ShieldCheck } from "lucide-react";
import { LazyMotion, domAnimation, MotionConfig } from "motion/react";
import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/SiteFooter";
import { AnimatedIcon } from "@/components/landing/AnimatedIcon";
import { FeatureVisual } from "@/components/landing/FeatureVisual";
import { BuildingBlueprint } from "@/components/landing/BuildingBlueprint";
import { ScrollSection } from "@/components/landing/ScrollSection";
import { Workflow } from "@/components/landing/Workflow";
import { Reveal } from "@/components/landing/Reveal";
import { useLang } from "@/contexts/LangContext";
import { tChrome } from "@/lib/chrome-i18n";
import { scrollToLandingSection } from "@/lib/landing-scroll";
import { localizedPath } from "@/lib/paths";
import { resolveSeo, useHeadTags } from "@/lib/seo";
import {
  getHeroVM, getProblemsVM, getSolutionsVM, getFeaturesVM, getHowItWorksVM, getCtaVM,
  type CardVM,
} from "@/services/landing.service";
import "@/styles/landing.css";

function FeatureCard({ card, index }: { card: CardVM; index: number }) {
  return (
    <Reveal className={`premium-feature premium-feature--${index}`} delay={(index % 3) * 0.06}>
      <div className="premium-feature-top"><span className="premium-icon"><AnimatedIcon Icon={card.Icon} /></span><h3>{card.title}</h3><span className="premium-card-index">{String(index + 1).padStart(2, "0")}</span></div>
      <p>{card.description}</p>
      <div className="feature-detail" aria-hidden="true">
        <FeatureVisual id={card.id} Icon={card.Icon} />
      </div>
    </Reveal>
  );
}


const Landing = ({ section }: { section?: "features" | "how" }) => {
  const { lang } = useLang();
  const demoHref = localizedPath(lang, "/demo");
  const chrome = tChrome(lang);
  const seoRoute = section ?? "home";
  useHeadTags(resolveSeo(seoRoute, lang), lang, seoRoute);
  const { hash } = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const legacy = hash.slice(1);
    if (legacy === "how" || legacy === "features") {
      navigate(localizedPath(lang, `/${legacy}`), { replace: true });
      return;
    }
    if (!section) return;
    const frame = requestAnimationFrame(() => scrollToLandingSection(section, "instant"));
    return () => cancelAnimationFrame(frame);
  }, [section, hash, lang, navigate]);
  const hero = getHeroVM(lang);
  const problems = getProblemsVM(lang);
  const solutions = getSolutionsVM(lang);
  const features = getFeaturesVM(lang);
  const how = getHowItWorksVM(lang);
  const cta = getCtaVM(lang);

  return (
    <LazyMotion features={domAnimation} strict>
    <MotionConfig reducedMotion="user">
    <div className="premium-landing">
      {!section && <>
      <ScrollSection className="premium-hero" aria-labelledby="landing-title">
        <div className="hero-atmosphere" aria-hidden="true" />
        <div className="container premium-hero-grid">
          <Reveal className="premium-hero-copy">
            <div className="premium-badge"><span className="badge-dot" /><AnimatedIcon Icon={hero.BadgeIcon} />{hero.badge}</div>
            <h1 id="landing-title">{hero.title}</h1>
            <p className="premium-hero-subtitle">{hero.subtitle}</p>
            <div className="premium-actions">
              <Button asChild size="lg" className="premium-button"><Link to={demoHref}>{hero.ctaPrimary}<ArrowRight aria-hidden="true" /></Link></Button>
              <Link to={localizedPath(lang, "/how")} className="premium-secondary">{hero.ctaSecondary}<ArrowDown aria-hidden="true" /></Link>
            </div>
            <p className="premium-hero-note"><AnimatedIcon Icon={ShieldCheck} />{cta.subtitle}</p>
          </Reveal>
          <Reveal className="premium-hero-art" delay={0.1}>
            <div className="blueprint-heading"><span className="premium-eyebrow">{hero.preview.eyebrow}</span><span className="blueprint-cross" aria-hidden="true">+</span></div>
            <div className="blueprint-scene"><div className="blueprint-halo" aria-hidden="true" /><BuildingBlueprint /></div>
            <div className="blueprint-caption"><span className="blueprint-caption-icon"><AnimatedIcon Icon={ShieldCheck} /></span><div><strong>{hero.preview.label}</strong><p>{hero.preview.caption}</p></div></div>
            <span className="blueprint-disclaimer">{hero.preview.illustrationLabel}</span>
          </Reveal>
        </div>
        <div className="container"><Reveal className="premium-trust">{hero.trust.split("·").map(item => <span key={item}><Check aria-hidden="true" />{item.trim()}</span>)}</Reveal></div>
      </ScrollSection>

      <ScrollSection className="premium-section premium-problems" aria-labelledby="problems-title">
        <div className="container">
          <Reveal className="premium-section-heading premium-heading-split"><span className="premium-eyebrow">{problems.heading.eyebrow}</span><h2 id="problems-title">{problems.heading.title}</h2></Reveal>
          <div className="premium-problem-grid">{problems.cards.map((card, i) => <Reveal key={card.id} className="premium-problem" delay={i * 0.06}><AnimatedIcon Icon={card.Icon} /><h3>{card.title}</h3><p>{card.description}</p></Reveal>)}</div>
        </div>
      </ScrollSection>

      <ScrollSection className="premium-section premium-solutions" aria-labelledby="solutions-title">
        <div className="container premium-solution-grid">
          <Reveal className="premium-section-heading"><span className="premium-eyebrow">{solutions.heading.eyebrow}</span><h2 id="solutions-title">{solutions.heading.title}</h2><p>{solutions.heading.subtitle}</p><Link to={demoHref} className="premium-text-link">{hero.ctaPrimary}<MoveUpRight aria-hidden="true" /></Link></Reveal>
          <div className="premium-solution-list">{solutions.cards.map((card, i) => <Reveal key={card.id} className="premium-solution" delay={i * 0.06}><span className="premium-icon"><AnimatedIcon Icon={card.Icon} /></span><div><h3>{card.title}</h3><p>{card.description}</p></div><span className="premium-card-index">{String(i + 1).padStart(2, "0")}</span></Reveal>)}</div>
        </div>
      </ScrollSection>

      </>}
      {(!section || section === "features") && <ScrollSection id="features" className="premium-section premium-features" aria-labelledby="features-title">
        <div className="container">
          <Reveal className="premium-section-heading"><span className="premium-eyebrow">{features.heading.eyebrow}</span>{section ? <h1 id="features-title">{features.heading.title}</h1> : <h2 id="features-title">{features.heading.title}</h2>}</Reveal>
          <div className="premium-feature-grid">{features.cards.map((card, i) => <FeatureCard key={card.id} card={card} index={i} />)}</div>
        </div>
      </ScrollSection>}

      {(!section || section === "how") && <ScrollSection id="how" className="premium-section premium-how" aria-labelledby="how-title">
        <div className="container">
          <Reveal className="premium-section-heading"><span className="premium-eyebrow">{how.heading.eyebrow}</span>{section ? <h1 id="how-title">{how.heading.title}</h1> : <h2 id="how-title">{how.heading.title}</h2>}</Reveal>
          <Reveal><Workflow cards={how.cards} preview={hero.preview} demoHref={demoHref} cta={hero.ctaPrimary} previousLabel={chrome.nav.previousStep} nextLabel={chrome.nav.nextStep} /></Reveal>
        </div>
      </ScrollSection>}

      <ScrollSection className="premium-cta-section" aria-labelledby="cta-title">
        <div className="container"><Reveal className="premium-cta"><div className="cta-orbits" aria-hidden="true"><i /><i /><i /></div><span className="premium-icon"><AnimatedIcon Icon={ShieldCheck} /></span><h2 id="cta-title">{cta.title}</h2><p>{cta.subtitle}</p><Button asChild size="lg" className="premium-button"><Link to={demoHref}>{cta.button}<ArrowRight aria-hidden="true" /></Link></Button></Reveal></div>
      </ScrollSection>
      <SiteFooter />
    </div>
    </MotionConfig>
    </LazyMotion>
  );
};
export default Landing;
