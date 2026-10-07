import { Link } from "react-router-dom";
import { BrandLogo } from "@pacific-code-labs/sokol-design-system";
import { useLang } from "@/contexts/LangContext";
import { localizedPath } from "@/lib/paths";
import { appHref, newTab } from "@/lib/links";
import { getBrandingVM } from "@/services/branding.service";
import { getFooterVM } from "@/services/landing.service";
import { legalContent } from "@/legal/LegalBody";

const linkCls = "hover:text-primary transition-colors";

/**
 * The landing's footer (content: footer.json + branding.json), shared by every page. Same layout
 * as the Tsuru landing: brand + description, link groups, then copyright and the studio credit.
 */
export function SiteFooter() {
  const { lang } = useLang();
  const brand = getBrandingVM(lang);
  const footer = getFooterVM(lang);
  const sectionLink = (id: string, label: string) => (
    <Link to={localizedPath(lang, `/${id}`)} className={linkCls}>{label}</Link>
  );

  return (
    <footer className="border-t border-border bg-muted/40 no-print">
      <div className="container pt-8 pb-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2">
            <Link to={localizedPath(lang, "/")} className="mb-4 inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
              <BrandLogo name={brand.companyName} suffix={brand.companySuffix} logoUrl={brand.logoUrl} logoUrlDark={brand.logoUrlDark} markUrl={brand.markUrl} Icon={brand.LogoIcon} imgClassName="h-9" />
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{footer.description}</p>
          </div>

          {/* Product */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">{footer.groups.product}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>{sectionLink("features", footer.links.features)}</li>
              <li>{sectionLink("how", footer.links.how)}</li>
              <li><Link to={localizedPath(lang, "/pricing")} className={linkCls}>{footer.links.pricing}</Link></li>
              <li><Link to={localizedPath(lang, "/demo")} className={linkCls}>{footer.links.demo}</Link></li>
            </ul>
          </div>

          {/* Account (the app is a separate site: new tab) */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">{footer.groups.account}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href={appHref(lang, "/login")} {...newTab} className={linkCls}>{footer.links.signIn}</a></li>
              <li><a href={appHref(lang, "/register")} {...newTab} className={linkCls}>{footer.links.signUp}</a></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold">{legalContent.labels.legal[lang]}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {Object.entries(legalContent.pages).map(([key, page]) => <li key={key}><Link className={linkCls} to={localizedPath(lang, `/${key}`)}>{page.title[lang]}</Link></li>)}
            </ul>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-border pt-5 text-sm text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} {brand.companyName} {brand.companySuffix}. {footer.rights}
          </p>

          {/* Studio credit — the logo ships with alpha, so it sits on both themes without a plate. */}
          <a href={footer.madeBy.url} {...newTab} className="group flex items-center gap-2 hover:text-primary transition-colors">
            <span>{footer.madeBy.label}</span>
            <img
              src={footer.madeBy.logoUrl}
              alt={footer.madeBy.name}
              className="h-7 w-auto opacity-90 transition-opacity group-hover:opacity-100"
              loading="lazy"
            />
            <span className="font-medium text-foreground/80 transition-colors group-hover:text-primary">{footer.madeBy.name}</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
