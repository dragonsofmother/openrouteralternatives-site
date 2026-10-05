import type {
  Capability,
  Deployment,
  Field,
  Gateway,
  Modality,
  ObservabilityLevel,
  OpenAiCompatibility,
} from "@/types";
import {
  CAPABILITY,
  DEPLOYMENT,
  EU_RESIDENCY,
  JURISDICTION,
  MODALITY,
  OBSERVABILITY,
  OPENAI_COMPATIBILITY,
  PRODUCT_STATUS,
} from "@/lib/taxonomy";
import { flagEmoji } from "@/lib/format";
import { metricDisplay } from "@/lib/metric";
import { routesOrEndpoints, secondaryCoverage } from "@/lib/gateway";
import { MetricCell, MetricStatusChip, metricTooltip } from "@/components/ui/metric-value";
import { Badge } from "@/components/ui/badge";
import { InfoTip } from "@/components/ui/tooltip";
import {
  NoValue,
  ProvenanceGlyph,
  ProvenanceMark,
  provenanceText,
} from "@/components/ui/data-status";
import { GatewayLogo } from "@/components/gateways/gateway-logo";
import { cn } from "@/lib/utils";

/**
 * Gateway name cell: mark, name linked to the vendor's own site where one is
 * confirmed, differentiator on up to two lines.
 *
 * The differentiator wraps rather than truncates so the column can stay
 * narrow without cutting the sentence short; anything beyond two lines is
 * clamped, and the full record is in the expanded row.
 */
export function GatewayCell({ gateway }: { gateway: Gateway }) {
  const nameClass = "block truncate text-[13.5px] font-semibold text-ink";
  return (
    <div className="flex items-center gap-3">
      <GatewayLogo gateway={gateway} size="md" />
      <div className="min-w-0">
        {gateway.website ? (
          <a
            href={gateway.website}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(nameClass, "hover:text-brand-ink")}
          >
            {gateway.name}
          </a>
        ) : (
          <span className={nameClass}>{gateway.name}</span>
        )}
        <p className="line-clamp-2 text-[11.5px] leading-snug text-ink-subtle">
          {gateway.differentiator}
        </p>
      </div>
    </div>
  );
}

/**
 * Model count.
 *
 * Delegates entirely to the shared metric component, so a measured count, a
 * vendor figure, a customer-configured gateway and an unpublished catalogue
 * all render through one consistent treatment.
 */
export function ModelsCell({ gateway }: { gateway: Gateway }) {
  return <MetricCell metric={gateway.models} />;
}

/**
 * Providers with routes or endpoints beneath, in one column.
 *
 * The provider figure leads because most gateways publish one. The route or
 * endpoint figure, where a vendor or this project recorded one, sits under it
 * with its own label and evidence, so "684 endpoints" is never read as a
 * provider or model count. Routes and endpoints stay separate fields in the
 * record; `routesOrEndpoints` picks whichever carries a figure. The column
 * sorts on providers.
 */
export function CoverageCell({ gateway }: { gateway: Gateway }) {
  const { metric, kind } = routesOrEndpoints(gateway);
  const figure = metricDisplay(metric.current);
  const tooltip = metricTooltip(metric.current);

  return (
    <div className="flex flex-col items-end gap-1">
      <MetricCell metric={gateway.providers} caption="providers" />
      {figure ? (
        <InfoTip label={tooltip}>
          <button
            type="button"
            aria-label={`${figure} ${kind}. ${tooltip}`}
            className="cursor-help text-right text-[11px] leading-tight text-ink-subtle"
          >
            <span className="tnum font-medium text-ink-muted">{figure}</span> {kind}
          </button>
        </InfoTip>
      ) : null}
    </div>
  );
}

/** The same pair at detail size, with the second figure where a vendor publishes both. */
export function CoverageDetail({ gateway }: { gateway: Gateway }) {
  const primary = routesOrEndpoints(gateway);
  const secondary = secondaryCoverage(gateway);
  const hasFigure = Boolean(metricDisplay(primary.metric.current));

  return (
    <div className="flex flex-col gap-1.5">
      <MetricCell
        metric={primary.metric}
        align="left"
        caption={hasFigure ? primary.kind : undefined}
      />
      {secondary ? (
        <span className="inline-flex flex-wrap items-center gap-x-2 text-[12.5px] text-ink-muted">
          <span>
            Also{" "}
            <span className="tnum font-medium text-ink">
              {metricDisplay(secondary.metric.current)}
            </span>{" "}
            {secondary.kind}
          </span>
          <MetricStatusChip value={secondary.metric.current} />
        </span>
      ) : null}
    </div>
  );
}

/** Product development status, rendered only when it is not simply active. */
export function ProductStatusBadge({ gateway }: { gateway: Gateway }) {
  const status = gateway.productStatus;
  if (!status.value || status.value === "active") return null;
  const term = PRODUCT_STATUS[status.value];
  const description = status.note ? `${term.description} ${status.note}` : term.description;

  return (
    <InfoTip label={description}>
      <button type="button" className="cursor-help" aria-label={`${term.label}: ${description}`}>
        <Badge tone={term.tone} size="xs" dot>
          {term.label}
        </Badge>
      </button>
    </InfoTip>
  );
}

export function ProvidersCell({ gateway }: { gateway: Gateway }) {
  return <MetricCell metric={gateway.providers} />;
}

/** Modality badges, truncated so the table stays readable. */
export function ModalityCell({
  field,
  limit = 3,
}: {
  field: Field<Modality[]>;
  limit?: number;
}) {
  const modalities = field.value;
  if (!modalities || modalities.length === 0) return <NoValue compact field={field} />;

  const shown = modalities.slice(0, limit);
  const hidden = modalities.slice(limit);

  return (
    <div className="flex flex-wrap items-center gap-1">
      {shown.map((modality) => (
        <InfoTip key={modality} label={MODALITY[modality].description}>
          <button type="button" className="cursor-help" aria-label={MODALITY[modality].description}>
            <Badge tone="outline" size="xs">
              {MODALITY[modality].label}
            </Badge>
          </button>
        </InfoTip>
      ))}
      {hidden.length > 0 ? (
        <InfoTip
          label={
            <span>
              Also documented:{" "}
              {hidden.map((modality) => MODALITY[modality].label).join(", ")}.
            </span>
          }
        >
          <button
            type="button"
            className="cursor-help"
            aria-label={`${hidden.length} more modalities: ${hidden
              .map((modality) => MODALITY[modality].label)
              .join(", ")}`}
          >
            <Badge tone="neutral" size="xs">
              +{hidden.length}
            </Badge>
          </button>
        </InfoTip>
      ) : null}
    </div>
  );
}

/**
 * Jurisdiction: country of incorporation plus an EU / non-EU marker. Kept in
 * its own column, apart from residency, because the two are different facts.
 */
export function JurisdictionCell({ gateway }: { gateway: Gateway }) {
  const bucket = JURISDICTION[gateway.jurisdictionBucket];
  const country = gateway.country;

  return (
    <div className="flex flex-col items-start gap-1">
      {country.value ? (
        <span className="flex max-w-full items-start gap-1.5 text-[13px] leading-snug text-ink">
          {gateway.countryCode.value ? (
            <span aria-hidden="true" className="mt-px text-[13px] leading-none">
              {flagEmoji(gateway.countryCode.value)}
            </span>
          ) : null}
          <span className="min-w-0 break-words">
            {country.value}
            <ProvenanceMark field={country} />
          </span>
        </span>
      ) : (
        <NoValue compact field={country} />
      )}
      <InfoTip label={bucket.description}>
        <button type="button" className="cursor-help" aria-label={bucket.description}>
          <Badge tone={bucket.tone} size="xs">
            {bucket.badge ?? bucket.label}
          </Badge>
        </button>
      </InfoTip>
    </div>
  );
}

/** EU residency status badge with the explanation attached. */
export function ResidencyCell({ gateway }: { gateway: Gateway }) {
  const field = gateway.euResidency;
  const key = field.value ?? "needs-verification";
  const term = EU_RESIDENCY[key];
  const description = field.note ? `${term.description} ${field.note}` : term.description;

  return (
    <InfoTip label={description}>
      <button type="button" className="cursor-help" aria-label={`${term.label}: ${description}`}>
        <Badge tone={term.tone} size="xs" dot>
          {term.label}
        </Badge>
      </button>
    </InfoTip>
  );
}

/**
 * Deployment options, with zero data retention beneath where the column is
 * asked to carry it. They stay two fields in the record: one says where the
 * gateway can run, the other what it keeps.
 */
export function DeploymentCell({
  field,
  zdr,
}: {
  field: Field<Deployment[]>;
  zdr?: Field<Capability>;
}) {
  const options =
    field.value && field.value.length > 0 ? (
      <div className="flex flex-wrap gap-1">
        {field.value.map((deployment) => (
          <InfoTip key={deployment} label={DEPLOYMENT[deployment].description}>
            <button
              type="button"
              className="cursor-help"
              aria-label={DEPLOYMENT[deployment].description}
            >
              <Badge tone="outline" size="xs">
                {DEPLOYMENT[deployment].label}
              </Badge>
            </button>
          </InfoTip>
        ))}
      </div>
    ) : (
      <NoValue compact field={field} />
    );

  if (!zdr) return options;

  return (
    <div className="flex flex-col items-start gap-1.5">
      {options}
      <span className="inline-flex items-center gap-1.5">
        <span className="text-[10.5px] font-medium uppercase tracking-[0.06em] text-ink-subtle">
          ZDR
        </span>
        <CapabilityCell field={zdr} />
      </span>
    </div>
  );
}

export function CapabilityCell({ field }: { field: Field<Capability> }) {
  if (!field.value || field.value === "unknown") return <NoValue compact field={field} />;
  const term = CAPABILITY[field.value];
  const description = field.note ? `${term.description} ${field.note}` : term.description;

  return (
    <InfoTip label={description}>
      <button type="button" className="cursor-help" aria-label={`${term.label}: ${description}`}>
        <Badge tone={term.tone} size="xs">
          {term.label}
        </Badge>
      </button>
    </InfoTip>
  );
}

/**
 * OpenAI API compatibility.
 *
 * Four labels, never a score. A field with no recorded value renders the
 * "Unknown" label with the field's own status in the tooltip, so a gap in the
 * research reads differently from a documented "unknown".
 */
export function OpenAiCompatibilityCell({
  field,
  size = "xs",
}: {
  field: Field<OpenAiCompatibility>;
  size?: "xs" | "sm";
}) {
  const recorded = field.value !== null;
  const key: OpenAiCompatibility = field.value ?? "unknown";
  const term = OPENAI_COMPATIBILITY[key];
  const description = !recorded
    ? `${term.label}. ${provenanceText(field)}`
    : field.note
      ? `${term.description} ${field.note}`
      : term.description;

  return (
    <InfoTip label={description}>
      <button
        type="button"
        className="cursor-help"
        aria-label={`OpenAI compatible: ${description}`}
      >
        <Badge tone={recorded ? term.tone : "neutral"} size={size} dot={recorded}>
          {term.label}
          {recorded ? <ProvenanceGlyph field={field} /> : null}
        </Badge>
      </button>
    </InfoTip>
  );
}

/**
 * Built-in observability level.
 *
 * One of five labels on the scale the methodology defines, never a score. The
 * tooltip carries the level's definition and what was found in the vendor's
 * material; a field with no recorded level renders its status instead.
 */
export function ObservabilityCell({
  field,
  size = "xs",
}: {
  field: Field<ObservabilityLevel>;
  size?: "xs" | "sm";
}) {
  if (!field.value) return <NoValue compact field={field} />;
  const term = OBSERVABILITY[field.value];
  const description = `${term.description} ${provenanceText(field)}`;

  return (
    <InfoTip label={description}>
      <button
        type="button"
        className="cursor-help"
        aria-label={`Observability ${term.label}: ${description}`}
      >
        <Badge tone={term.tone} size={size} dot>
          {term.label}
          <ProvenanceGlyph field={field} />
        </Badge>
      </button>
    </InfoTip>
  );
}

export function CertificationsCell({ field }: { field: Field<string[]> }) {
  if (!field.value) return <NoValue compact field={field} />;

  // A verified empty list is a researched absence: the vendor states it holds
  // none, which is a different and more useful fact than "not yet checked".
  if (field.value.length === 0) {
    const description =
      field.note ?? "The vendor does not claim any security certifications.";
    return (
      <InfoTip label={description}>
        <button
          type="button"
          className="cursor-help"
          aria-label={`None claimed: ${description}`}
        >
          <Badge tone="warn" size="xs" dot>
            None claimed
          </Badge>
        </button>
      </InfoTip>
    );
  }

  return (
    <div className="flex flex-wrap gap-1">
      {field.value.map((certification) => (
        <Badge key={certification} tone="outline" size="xs">
          {certification}
        </Badge>
      ))}
      <ProvenanceMark field={field} />
    </div>
  );
}

export function EmployeesCell({ gateway }: { gateway: Gateway }) {
  const field = gateway.employees;
  if (!field.value) return <NoValue compact field={field} />;

  const label = `LinkedIn company-size band. Precise headcounts are not derived from third-party databases. ${provenanceText(field)}`;

  return (
    <InfoTip label={label}>
      <button
        type="button"
        className="tnum cursor-help text-[13px] text-ink"
        aria-label={`LinkedIn company-size band ${field.value.band}. ${label}`}
      >
        {field.value.band}
        <ProvenanceGlyph field={field} />
      </button>
    </InfoTip>
  );
}

