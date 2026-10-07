import { LegalBody, legalContent, type LegalKey } from "@/legal/LegalBody";
import { useLang } from "@/contexts/LangContext";
import { resolveSeo, useHeadTags } from "@/lib/seo";
import { SiteFooter } from "@/components/SiteFooter";

export default function Legal({ pageKey }: { pageKey: LegalKey }) {
  const { lang } = useLang();
  const page = legalContent.pages[pageKey];
  useHeadTags({ ...resolveSeo(pageKey, lang), title: `${page.title[lang]} — Sóköl`, description: page.description[lang] }, lang, pageKey);
  return <><LegalBody pageKey={pageKey} lang={lang} /><SiteFooter /></>;
}
