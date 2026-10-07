import content from "./content.json";

export type LegalKey = keyof typeof content.pages;
export const isLegalKey = (key: string): key is LegalKey => Object.prototype.hasOwnProperty.call(content.pages, key);
export const legalContent = content;

export function LegalBody({ pageKey, lang }: { pageKey: LegalKey; lang: "es" | "en" }) {
  const page = content.pages[pageKey];
  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="mb-10 space-y-4 border-b border-border pb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{page.title[lang]}</h1>
        <p className="text-muted-foreground">{content.labels.updated[lang]}: <time dateTime={content.updated}>{content.updated}</time></p>
        <address className="not-italic text-sm leading-relaxed text-muted-foreground">
          <p>{content.operator.name}</p>
          <p>{content.operator.address}</p>
          <a className="underline underline-offset-4 hover:text-primary" href={`mailto:${content.operator.email}`}>{content.operator.email}</a>
        </address>
      </header>
      <div className="space-y-8">
        {page.sections.map((section, index) => (
          <section key={index} className="space-y-3">
            <h2 className="text-xl font-semibold">{section.heading[lang]}</h2>
            <p className="leading-relaxed text-muted-foreground">{section.body[lang]}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
