"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { NAV_LINKS, REPOSITORY_URL } from "@/data/site";
import { formatCompactCount } from "@/lib/format";
import { Container } from "@/components/layout/container";
import { StarButton } from "@/components/layout/star-button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

/** The wordmark is a shell prompt: the working directory and a prompt character. */
export function Prompt({ className }: { className?: string }) {
  return (
    <span className={cn("whitespace-nowrap text-[13.5px] font-bold", className)}>
      <span className="text-brand-ink">~/openrouter-alternatives</span>
      <span className="text-ink-muted"> $</span>
    </span>
  );
}

export function Header({ stars }: { stars: number | null }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = React.useState(false);

  // Close the mobile menu on navigation by adjusting state during render,
  // which React prefers over an effect that immediately calls setState.
  const [lastPath, setLastPath] = React.useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  // Hash links point at sections of the homepage and are never "current".
  const isActive = (href: string) => !href.includes("#") && pathname === href;

  const linkClass = (href: string) =>
    cn(
      "border px-2 py-1 text-[13px] transition-colors",
      isActive(href)
        ? "border-brand-line bg-brand-subtle text-brand-ink"
        : "border-transparent text-ink-muted hover:border-line hover:text-ink",
    );

  return (
    <header className="sticky top-0 z-40 border-b border-line-strong bg-canvas">
      <Container width="wide">
        <div className="flex h-13 items-center gap-5">
          <Link href="/" className="shrink-0" aria-label="OpenRouter Alternatives, home">
            <Prompt />
          </Link>

          <nav aria-label="Primary" className="hidden flex-1 lg:block">
            <ul className="flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className={linkClass(link.href)}
                  >
                    [{link.label.toLowerCase()}]
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
              className="inline-flex size-8 items-center justify-center border border-line text-ink-muted transition-colors hover:border-line-strong hover:text-ink lg:hidden"
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
        <div id="mobile-nav" className="border-t border-dashed border-line bg-canvas lg:hidden">
          <Container width="wide">
            <nav aria-label="Primary mobile">
              <ul className="flex flex-col gap-1 py-3">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={isActive(link.href) ? "page" : undefined}
                      onClick={() => setMenuOpen(false)}
                      className={cn("block text-[15px]", linkClass(link.href))}
                    >
                      [{link.label.toLowerCase()}]
                    </Link>
                  </li>
                ))}
                <li>
                  <a
                    href={REPOSITORY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block border border-transparent px-2 py-1 text-[15px] text-ink-muted hover:text-ink"
                  >
                    [star on github{stars !== null ? ` · ${formatCompactCount(stars)}` : ""}]
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
