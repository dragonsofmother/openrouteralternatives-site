import Link from "next/link";
import { FOOTER_LINKS } from "@/data/site";
import { Container } from "@/components/layout/container";
import { formatDate } from "@/lib/format";

/** One status line, the way a shell signs off. */
export function Footer({ updatedAt, gatewayCount }: { updatedAt: string; gatewayCount: number }) {
  return (
    <footer className="border-t border-line-strong bg-subtle">
      <Container width="wide">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 py-4 text-[12px] text-ink-muted">
          <span>
            -- {gatewayCount} gateways · last updated {formatDate(updatedAt)}
          </span>
          {FOOTER_LINKS.map((link) =>
            "external" in link && link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="lowercase text-brand-ink hover:underline"
              >
                {link.label}
              </a>
            ) : (
              <Link key={link.href} href={link.href} className="lowercase text-brand-ink hover:underline">
                {link.label}
              </Link>
            ),
          )}
          <span className="ml-auto">exit 0</span>
        </div>
      </Container>
    </footer>
  );
}
