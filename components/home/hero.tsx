import Link from "next/link";
import { SITE } from "@/data/site";
import { WHY } from "@/data/why";
import { Container } from "@/components/layout/container";

/**
 * The introduction, written as a prompt: the command that produced the
 * table, the site's name as the first line of output, and one sentence on
 * why it exists with a link to the full reasoning. Kept to three lines so
 * the table starts within the first screen.
 */
export function Hero({ snapshotDate }: { snapshotDate: string | null }) {
  const command = snapshotDate
    ? `$ ora compare --all --snapshot ${snapshotDate}`
    : "$ ora compare --all";

  return (
    <section className="border-b border-dashed border-line-strong bg-subtle">
      <Container width="wide">
        <div className="flex flex-col gap-1.5 py-5 sm:py-6">
          <p className="text-[12px] text-ink-muted">{command}</p>
          <h1 className="text-[20px] font-bold leading-snug tracking-[-0.01em] text-ink sm:text-[24px]">
            <span className="text-brand-ink">&gt;</span> {SITE.name}
            <span className="font-normal text-ink-muted"> — {SITE.tagline.replace(/\.$/, "")}</span>
            <span
              aria-hidden="true"
              className="cursor-blink ml-1.5 inline-block h-[0.8em] w-[0.5em] translate-y-[0.1em] bg-brand"
            />
          </h1>
          <p className="text-[13px] leading-relaxed text-ink-muted">
            {WHY.headline}{" "}
            <Link href="/why" className="font-medium text-brand-ink hover:underline">
              read why we built it →
            </Link>
          </p>
        </div>
      </Container>
    </section>
  );
}
