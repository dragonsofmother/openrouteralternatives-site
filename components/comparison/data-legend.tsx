import Link from "next/link";
import { METRIC_STATUS, METRIC_STATUS_ORDER, type Tone } from "@/lib/taxonomy";
import { InfoTip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const TONE_TEXT: Record<Tone, string> = {
  ok: "text-ok",
  info: "text-info",
  warn: "text-warn",
  caution: "text-caution",
  neutral: "text-ink-subtle",
  brand: "text-brand-ink",
};

/**
 * The evidence vocabulary as a one-line legend: each status is the glyph
 * the table prints under a figure, followed by its short name. The
 * methodology is the long form, not the only form.
 */
export function DataLegend({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-ink-muted",
        className,
      )}
    >
      <span className="text-ink-subtle">legend:</span>
      {METRIC_STATUS_ORDER.map((status) => {
        const term = METRIC_STATUS[status];
        return (
          <InfoTip key={status} label={term.description}>
            <button
              type="button"
              aria-label={`${term.label}: ${term.description}`}
              className="inline-flex cursor-help items-center gap-1.5 lowercase transition-colors hover:text-ink"
            >
              <span aria-hidden="true" className={TONE_TEXT[term.tone]}>
                {term.glyph}
              </span>
              {term.short}
            </button>
          </InfoTip>
        );
      })}
      <Link href="/#model-counting" className="ml-auto text-brand-ink hover:underline">
        how counts are established
      </Link>
    </div>
  );
}
