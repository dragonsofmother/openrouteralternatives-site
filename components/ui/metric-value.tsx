import type { Metric, MetricValue } from "@/types/metric";
import { METRIC_STATUS, type Tone } from "@/lib/taxonomy";
import { allObservations, metricDisplay } from "@/lib/metric";
import { formatDateShort } from "@/lib/format";
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

/** Full tooltip text: what the status means, plus anything specific to this value. */
export function metricTooltip(value: MetricValue): string {
  const term = METRIC_STATUS[value.status];
  const dated =
    value.status === "measured" && value.date
      ? `Counted from the provider's public catalogue on ${formatDateShort(value.date)}.`
      : term.description;
  return value.note ? `${dated} ${value.note}` : dated;
}

/**
 * The figure to print for a metric.
 *
 * A quantified current observation prints as itself. A "multiple figures"
 * status has no single value, so the figures on record are printed together
 * (at most two), which says more than the word "multiple" would. Every other
 * unquantified status prints nothing here and lets the evidence line explain.
 */
export function metricFigure(metric: Metric): string | null {
  const current = metric.current;
  const shown = metricDisplay(current);
  if (shown) return shown;
  if (current.status !== "conflicting") return null;
  const figures = Array.from(
    new Set(
      (metric.history ?? []).map(metricDisplay).filter((d): d is string => Boolean(d)),
    ),
  );
  return figures.length ? figures.slice(0, 2).join(" / ") : null;
}

/**
 * A figure of the other evidence kind, worth surfacing next to the current one.
 *
 * Beside a measurement, the vendor's own figure; beside a vendor or catalogue
 * figure, this project's newest measurement (LLM scope first, so the pairing
 * stays comparable). The gap between the two is itself informative.
 */
export function parallelObservation(
  metric: Metric,
): { label: string; observation: MetricValue } | null {
  const current = metric.current;
  const observations = allObservations(metric).filter((o) => o !== current && metricDisplay(o));

  if (current.status === "measured") {
    const vendor = observations.find((o) => o.status === "official" || o.status === "catalogue");
    return vendor ? { label: "published", observation: vendor } : null;
  }
  if (current.status === "official" || current.status === "catalogue") {
    const measured =
      observations.find((o) => o.status === "measured" && o.scope === "llm") ??
      observations.find((o) => o.status === "measured");
    return measured ? { label: "measured", observation: measured } : null;
  }
  return null;
}

/**
 * The compact metric used throughout the comparison table.
 *
 * A figure sits on the first line and its evidence on the second, as the
 * status glyph and its short name in small muted text. Where there is no
 * figure the evidence line carries the meaning on its own, so an absent
 * number still reads as a fact about the product rather than as a hole in
 * the research. `caption` names what the figure counts where the column can
 * hold more than one kind of quantity.
 */
export function MetricCell({
  metric,
  className,
  align = "right",
  caption,
}: {
  metric: Metric;
  className?: string;
  align?: "left" | "right";
  caption?: string;
}) {
  const current = metric.current;
  const term = METRIC_STATUS[current.status];
  const shown = metricFigure(metric);
  const tooltip = metricTooltip(current);
  const parallel = parallelObservation(metric);
  const evidence =
    current.status === "measured" && current.date
      ? `measured ${formatDateShort(current.date)}`
      : term.short.toLowerCase();

  return (
    <InfoTip label={tooltip}>
      <button
        type="button"
        aria-label={`${shown ?? term.label}${caption ? ` ${caption}` : ""}. ${tooltip}`}
        className={cn(
          "cursor-help leading-tight",
          align === "right" ? "text-right" : "text-left",
          className,
        )}
      >
        <span className="block">
          {shown ? (
            <span className="tnum text-[15px] font-bold text-brand-ink">{shown}</span>
          ) : (
            <span className="text-[15px] font-bold text-ink-subtle" aria-hidden="true">
              —
            </span>
          )}
        </span>
        <span className={cn("block text-[11px]", TONE_TEXT[term.tone])}>
          <span aria-hidden="true">{term.glyph}</span> {evidence}
          {caption ? <span className="text-ink-subtle"> · {caption}</span> : null}
        </span>
        {parallel ? (
          <span className="block text-[11px] text-ink-subtle">
            {parallel.label}: {metricDisplay(parallel.observation)}
          </span>
        ) : null}
      </button>
    </InfoTip>
  );
}

/**
 * Non-interactive status marker, for use inside a link or button where a
 * second interactive element would be invalid HTML. The explanation must be
 * carried by the parent's accessible name.
 */
export function MetricStatusText({ value }: { value: MetricValue }) {
  const term = METRIC_STATUS[value.status];
  return (
    <span className={cn("inline-flex items-center gap-1 text-[11.5px]", TONE_TEXT[term.tone])}>
      <span aria-hidden="true">{term.glyph}</span>
      {term.short}
    </span>
  );
}

/** Small inline status marker, used in detail lists. */
export function MetricStatusChip({ value }: { value: MetricValue }) {
  const term = METRIC_STATUS[value.status];
  return (
    <InfoTip label={metricTooltip(value)}>
      <button
        type="button"
        aria-label={`${term.label}. ${metricTooltip(value)}`}
        className={cn(
          "inline-flex cursor-help items-center gap-1 text-[11.5px]",
          TONE_TEXT[term.tone],
        )}
      >
        <span aria-hidden="true">{term.glyph}</span>
        {term.short}
      </button>
    </InfoTip>
  );
}
