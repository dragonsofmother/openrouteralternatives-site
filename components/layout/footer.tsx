import Link from "next/link";
import { FOOTER_LINKS } from "@/data/site";
import { Container } from "@/components/layout/container";
import { Wordmark } from "@/components/layout/wordmark";
import { formatDate } from "@/lib/format";

export function Footer({ updatedAt }: { updatedAt: string }) {
  return (
    <footer className="border-t border-line bg-subtle">
      <Container>
        <div className="flex flex-col gap-8 py-12 md:flex-row md:items-start md:justify-between">
          <div>
            <Wordmark showDomain />
            <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-ink-muted">
              A comparison of AI gateways, model routers and multi-provider AI APIs. Every figure
              carries its source and the date it was observed.
            </p>
            <p className="mt-4 text-[12.5px] text-ink-subtle">
              Last updated {formatDate(updatedAt)}
            </p>
          </div>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-6 gap-y-2.5 md:flex-col">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  {"external" in link && link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[13.5px] text-ink-muted transition-colors hover:text-ink"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-[13.5px] text-ink-muted transition-colors hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Container>
    </footer>
  );
}
