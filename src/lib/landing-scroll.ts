/** Align the process card within the viewport below the sticky header. */
export function scrollToLandingSection(section: string, behavior: ScrollBehavior) {
  const element = document.getElementById(section);
  if (!element) return;
  const card = section === "how" ? element.querySelector(".workflow-panel") : null;
  if (!card) {
    element.scrollIntoView({ behavior });
    return;
  }
  const headerBottom = Math.max(0, document.querySelector("header")?.getBoundingClientRect().bottom ?? 0);
  const bounds = card.getBoundingClientRect();
  const space = Math.max(0, window.innerHeight - headerBottom);
  const cardTop = headerBottom + Math.max(0, (space - bounds.height) / 2);
  window.scrollTo({ top: Math.max(0, window.scrollY + bounds.top - cardTop), behavior });
}
