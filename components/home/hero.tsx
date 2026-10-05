import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SITE } from "@/data/site";
import { WHY } from "@/data/why";
import { formatDate } from "@/lib/format";
import { Container } from "@/components/layout/container";

/**
 * Compact introduction above the table: name and tagline on one line, then
 * one sentence on why the site exists with a link to the full reasoning and
 * the date of the current catalogue snapshot. Kept short so the table starts
 * within the first screen.
 */
export function Hero({ snapshotDate }: { snapshotDate: string | null }) {
  return (
    <section className="border-b border-line bg-subtle/60">
      <Container width="wide">
        <div className="flex flex-col gap-1.5 py-5 sm:py-6">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="text-[24px] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[28px]">
              {SITE.name}
            </h1>
            <p className="text-[15px] text-ink-muted">{SITE.tagline}</p>
          </div>
          <p className="text-[13.5px] leading-relaxed text-ink-muted">
            {WHY.headline}{" "}
            <Link
              href="/why"
              className="inline-flex items-center gap-1 font-medium text-brand-ink hover:underline"
            >
              Read why we built it
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
            {snapshotDate ? (
              <span className="text-ink-subtle">
                {" "}
                · Model catalogue snapshot {formatDate(snapshotDate)}
              </span>
            ) : null}
          </p>
        </div>
      </Container>
    </section>
  );
}
