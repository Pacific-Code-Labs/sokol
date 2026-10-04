import { Home, LogIn, Menu, LayoutGrid, ListOrdered, Tag, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { BrandLogo, Button, buttonVariants, Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@pacific-code-labs/sokol-design-system";
import { useLang } from "@/contexts/LangContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { tChrome } from "@/lib/chrome-i18n";
import { cn } from "@/lib/utils";
import { getBrandingVM } from "@/services/branding.service";
import { localizedPath, stripLangPrefix } from "@/lib/paths";
import { appHref, newTab } from "@/lib/links";

interface HeaderProps {
  /** Receives the element pages portal their own actions into (see HeaderSlot). */
  actionsRef?: (el: HTMLElement | null) => void;
}

interface NavItem {
  key: "features" | "how" | "pricing" | "demo";
  Icon: LucideIcon;
  /** Home section id (scrolls there) or a page path. */
  section?: string;
  path?: string;
  /** Primary (orange) call-to-action while it is not the current page. */
  cta?: boolean;
}

const NAV: NavItem[] = [
  { key: "features", Icon: LayoutGrid, section: "features" },
  { key: "how", Icon: ListOrdered, section: "how" },
  { key: "pricing", Icon: Tag, path: "/pricing" },
  { key: "demo", Icon: Sparkles, path: "/demo", cta: true },
];

export function Header({ actionsRef }: HeaderProps) {
  const { lang } = useLang();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { rest } = stripLangPrefix(pathname);
  const onHome = rest === "/";
  const [mobileOpen, setMobileOpen] = useState(false);

  const chrome = tChrome(lang);
  const brand = getBrandingVM(lang);

  const closeMobile = () => setMobileOpen(false);


  const hrefFor = (item: NavItem) =>
    localizedPath(lang, item.section ? `/${item.section}` : item.path);
  const isActive = (item: NavItem) => item.section ? rest === `/${item.section}` : !!item.path && rest.startsWith(item.path);

  // Section routes preserve clean paths; selecting the active section scrolls to it again.
  const onNavClick = (item: NavItem) => (e: React.MouseEvent) => {
    closeMobile();
    if (isActive(item)) {
      e.preventDefault();
      if (item.section) document.getElementById(item.section)?.scrollIntoView({ behavior: "smooth" });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <header className={cn((onHome || rest === "/how" || rest === "/features") && "premium-header", "sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 no-print")}>
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-8">
          <Link to={localizedPath(lang, "/")} onClick={(event) => {
            closeMobile();
            if (onHome) {
              event.preventDefault();
              navigate(localizedPath(lang, "/"), { replace: true });
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }} className="flex shrink-0 items-center gap-3 hover:opacity-90 transition-opacity">
            {/* Uploaded wordmark (light/dark) when there is one; else mark/icon + name + tagline. */}
            {brand.logoUrl ? (
              <BrandLogo name={brand.companyName} logoUrl={brand.logoUrl} logoUrlDark={brand.logoUrlDark} imgClassName="h-9" />
            ) : (
              <>
                <BrandLogo name={brand.companyName} markUrl={brand.markUrl} Icon={brand.LogoIcon} variant="mark" className="h-10 w-10 glow-red" />
                <div className="leading-tight">
                  <div className="text-lg font-bold tracking-tight">{brand.companyName} <span className="text-primary">{brand.companySuffix}</span></div>
                  <div className="text-xs text-muted-foreground hidden xl:block">{brand.tagline}</div>
                </div>
              </>
            )}
          </Link>

          <nav aria-label={chrome.nav.main} className="hidden lg:flex items-center gap-1">
            {NAV.map((item) => (
              <Link
                key={item.key}
                to={hrefFor(item)}
                onClick={onNavClick(item)}
                aria-current={isActive(item) ? "page" : undefined}
                className={
                  item.cta && !isActive(item)
                    ? cn(buttonVariants({ size: "sm" }), "ml-2")
                    : cn(
                        buttonVariants({ variant: "ghost", size: "sm" }),
                        "font-medium text-muted-foreground hover:text-foreground",
                        isActive(item) && "bg-muted text-foreground",
                        item.cta && "ml-2",
                      )
                }
              >
                {item.cta && <item.Icon className="h-4 w-4" />}
                {chrome.nav[item.key]}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div ref={actionsRef} className="contents" />
          {/* Tablet: the nav is in the menu, so keep the demo one tap away. */}
          {!rest.startsWith("/demo") && (
            <Link
              to={localizedPath(lang, "/demo")}
              className={cn(buttonVariants({ size: "sm" }), "hidden sm:inline-flex lg:hidden")}
            >
              <Sparkles className="h-4 w-4" />
              {chrome.nav.demo}
            </Link>
          )}
          {/* The app is a separate site: sign-in opens it in a new tab. */}
          <a href={appHref(lang, "/login")} {...newTab} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex")}>
            <LogIn className="h-4 w-4" />
            {chrome.nav.signIn}
          </a>
          <ThemeToggle />
          <LanguageToggle />

          {/* Mobile / tablet menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="md" className="h-10 w-10 px-0 lg:hidden" aria-label={chrome.nav.openMenu}>
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <brand.LogoIcon className="h-4 w-4 text-primary" aria-hidden />
                  {brand.companyName} <span className="text-primary">{brand.companySuffix}</span>
                </SheetTitle>
              </SheetHeader>
              <nav aria-label={chrome.nav.main} className="mt-6 flex flex-col gap-2">
                <Link to={localizedPath(lang, "/")} onClick={closeMobile} className={cn(buttonVariants({ variant: "ghost" }), "justify-start")}>
                  <Home className="h-4 w-4" />
                  {chrome.nav.home}
                </Link>
                {NAV.map((item) => (
                  <Link
                    key={item.key}
                    to={hrefFor(item)}
                    onClick={onNavClick(item)}
                    aria-current={isActive(item) ? "page" : undefined}
                    className={cn(buttonVariants({ variant: "ghost" }), "justify-start", isActive(item) && "bg-muted")}
                  >
                    <item.Icon className="h-4 w-4" />
                    {chrome.nav[item.key]}
                  </Link>
                ))}
                <a href={appHref(lang, "/login")} {...newTab} onClick={closeMobile} className={cn(buttonVariants({ variant: "ghost" }), "justify-start")}>
                  <LogIn className="h-4 w-4" />
                  {chrome.nav.signIn}
                </a>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
