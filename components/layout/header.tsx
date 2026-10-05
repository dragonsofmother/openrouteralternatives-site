"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { NAV_LINKS, REPOSITORY_URL } from "@/data/site";
import { formatCompactCount } from "@/lib/format";
import { Container } from "@/components/layout/container";
import { StarButton } from "@/components/layout/star-button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Wordmark } from "@/components/layout/wordmark";
import { cn } from "@/lib/utils";

export function Header({ stars }: { stars: number | null }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on navigation by adjusting state during render,
  // which React prefers over an effect that immediately calls setState.
  const [lastPath, setLastPath] = React.useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  // Hash links point at sections of the homepage and are never "current".
  const isActive = (href: string) => !href.includes("#") && pathname === href;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-[background-color,border-color,box-shadow] duration-200",
        scrolled
          ? "border-line bg-canvas/85 shadow-card backdrop-blur-md supports-[backdrop-filter]:bg-canvas/75"
          : "border-transparent bg-canvas",
      )}
    >
      <Container>
        <div className="flex h-15 items-center gap-4">
          <Link
            href="/"
            className="shrink-0 rounded-md"
            aria-label="OpenRouter Alternatives, home"
          >
            <Wordmark />
          </Link>

          <nav aria-label="Primary" className="hidden flex-1 lg:block">
            <ul className="flex items-center gap-0.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className={cn(
                      "rounded-lg px-2.5 py-1.5 text-[13.5px] transition-colors",
                      isActive(link.href)
                        ? "bg-subtle font-medium text-ink"
                        : "text-ink-muted hover:bg-subtle hover:text-ink",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <StarButton stars={stars} className="hidden lg:inline-flex" />
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="inline-flex size-8 items-center justify-center rounded-lg border border-line bg-surface text-ink-muted transition-colors hover:text-ink lg:hidden"
            >
              {menuOpen ? (
                <X aria-hidden="true" className="size-4" />
              ) : (
                <Menu aria-hidden="true" className="size-4" />
              )}
            </button>
          </div>
        </div>
      </Container>

      {menuOpen ? (
        <div id="mobile-nav" className="border-t border-line bg-canvas lg:hidden">
          <Container>
            <nav aria-label="Primary mobile">
              <ul className="flex flex-col py-2">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={isActive(link.href) ? "page" : undefined}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "block rounded-lg px-3 py-2.5 text-[15px] transition-colors",
                        isActive(link.href)
                          ? "bg-subtle font-medium text-ink"
                          : "text-ink-muted hover:bg-subtle hover:text-ink",
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <a
                    href={REPOSITORY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-lg px-3 py-2.5 text-[15px] text-ink-muted transition-colors hover:bg-subtle hover:text-ink"
                  >
                    Star on GitHub
                    {stars !== null ? (
                      <span className="tnum text-ink-subtle">· {formatCompactCount(stars)}</span>
                    ) : null}
                    <ArrowUpRight aria-hidden="true" className="size-3.5" />
                  </a>
                </li>
              </ul>
            </nav>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
