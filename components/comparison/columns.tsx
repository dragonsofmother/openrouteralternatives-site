"use client";

import type { Gateway } from "@/types";
import type { GatewayColumnDef, GatewayRow } from "@/lib/table";
import { numeric } from "@/lib/table";
import {
  EU_RESIDENCY,
  EU_RESIDENCY_ORDER,
  JURISDICTION,
  OPENAI_COMPATIBILITY_ORDER,
} from "@/lib/taxonomy";
import { sortableModelCount, sortableProviderCount } from "@/lib/gateway";
import {
  CertificationsCell,
  CoverageCell,
  DeploymentCell,
  EmployeesCell,
  GatewayCell,
  JurisdictionCell,
  ModalityCell,
  ModelsCell,
  OpenAiCompatibilityCell,
  ResidencyCell,
} from "@/components/comparison/cells";
import { cn } from "@/lib/utils";

/** Ordinal position of a residency label, so the column sorts meaningfully. */
function residencyRank(gateway: Gateway): number {
  return EU_RESIDENCY_ORDER.indexOf(gateway.euResidency.value ?? "needs-verification");
}

/**
 * Sort key for OpenAI compatibility: yes, partial, no, then a documented
 * unknown. Rows with no recorded value return undefined so they stay at the
 * bottom. This orders the column; it ranks nothing.
 */
function openAiCompatibilityRank(gateway: Gateway): number | undefined {
  const value = gateway.openaiCompatible.value;
  return value === null ? undefined : OPENAI_COMPATIBILITY_ORDER.indexOf(value);
}

export const COLUMN_LABELS: Record<string, string> = {
  gateway: "Gateway",
  jurisdiction: "Jurisdiction",
  residency: "EU residency",
  models: "Models",
  certifications: "Certifications",
  employees: "Employees",
  coverage: "Providers / routes",
  openaiCompatible: "OpenAI compatible",
  modalities: "Modalities",
  deployment: "Deployment · ZDR",
};

/**
 * Column definitions.
 *
 * The gateway name and jurisdiction columns do not sort: the table opens on
 * model count and jurisdiction is a filter, not an order. Every other
 * sortable column declares exactly one direction with `sortDescFirst`
 * (largest or deepest first for measured quantities, the taxonomy order for
 * labelled ones), and the table never reverses it. Rows without a value sort
 * last whatever the direction.
 *
 * These ten columns are the whole table. Funding, observability, ownership,
 * pricing, gateway location and social reach are recorded but live in the
 * expanded row: follower counts in particular are not a product property and
 * are never used to order anything on this site.
 *
 * `meta.width` is a preferred width; the table turns the set into proportions
 * so the table fills the container without scrolling.
 */
export const columns: GatewayColumnDef[] = [
  {
    id: "gateway",
    accessorFn: (gateway) => gateway.name,
    header: COLUMN_LABELS.gateway,
    cell: ({ row }) => <GatewayCell gateway={row.original} />,
    enableHiding: false,
    enableSorting: false,
    meta: { width: 196 },
  },
  {
    id: "jurisdiction",
    accessorFn: (gateway) => gateway.jurisdictionBucket,
    header: COLUMN_LABELS.jurisdiction,
    cell: ({ row }) => <JurisdictionCell gateway={row.original} />,
    enableSorting: false,
    meta: { width: 156 },
  },
  {
    id: "residency",
    accessorFn: residencyRank,
    header: COLUMN_LABELS.residency,
    cell: ({ row }) => <ResidencyCell gateway={row.original} />,
    sortFn: numeric,
    sortDescFirst: false,
    meta: { width: 144 },
  },
  {
    id: "models",
    accessorFn: sortableModelCount,
    header: COLUMN_LABELS.models,
    cell: ({ row }) => <ModelsCell gateway={row.original} />,
    sortFn: numeric,
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right", width: 108 },
  },
  {
    id: "certifications",
    accessorFn: (gateway) => gateway.certifications.value?.length ?? undefined,
    header: COLUMN_LABELS.certifications,
    cell: ({ row }) => <CertificationsCell field={row.original.certifications} />,
    sortFn: numeric,
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { width: 148 },
  },
  {
    id: "employees",
    accessorFn: (gateway) => gateway.employees.value?.min ?? undefined,
    header: COLUMN_LABELS.employees,
    cell: ({ row }) => <EmployeesCell gateway={row.original} />,
    sortFn: numeric,
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { width: 92 },
  },
  {
    id: "coverage",
    // Sorts on the provider count; the route or endpoint figure beneath it is
    // a different quantity and is shown, not ordered.
    accessorFn: sortableProviderCount,
    header: COLUMN_LABELS.coverage,
    cell: ({ row }) => <CoverageCell gateway={row.original} />,
    sortFn: numeric,
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right", width: 124 },
  },
  {
    id: "openaiCompatible",
    accessorFn: openAiCompatibilityRank,
    header: COLUMN_LABELS.openaiCompatible,
    cell: ({ row }) => <OpenAiCompatibilityCell field={row.original.openaiCompatible} />,
    sortFn: numeric,
    sortDescFirst: false,
    sortUndefined: "last",
    meta: { width: 112 },
  },
  {
    id: "modalities",
    accessorFn: (gateway) => gateway.modalities.value?.length ?? undefined,
    header: COLUMN_LABELS.modalities,
    cell: ({ row }) => <ModalityCell field={row.original.modalities} />,
    sortFn: numeric,
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { width: 148 },
  },
  {
    id: "deployment",
    // Number of documented deployment options: hosted only sorts below
    // hosted plus VPC, which sorts below hosted plus VPC plus on-prem. Zero
    // data retention is shown in the same cell and is not part of the order.
    accessorFn: (gateway) => gateway.deployment.value?.length ?? undefined,
    header: COLUMN_LABELS.deployment,
    cell: ({ row }) => (
      <DeploymentCell field={row.original.deployment} zdr={row.original.zeroDataRetention} />
    ),
    sortFn: numeric,
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { width: 156 },
  },
  {
    id: "expander",
    header: () => <span className="sr-only">Details</span>,
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => <ExpandButton row={row} />,
    meta: { align: "right", width: 56 },
  },
];

function ExpandButton({ row }: { row: GatewayRow }) {
  const expanded = row.getIsExpanded();
  return (
    <button
      type="button"
      onClick={row.getToggleExpandedHandler()}
      aria-expanded={expanded}
      aria-label={`${expanded ? "Hide" : "Show"} details for ${row.original.name}`}
      className="inline-flex size-7 items-center justify-center border border-line bg-surface text-ink-subtle transition-colors hover:border-line-strong hover:text-ink"
    >
      <span
        aria-hidden="true"
        className={cn("inline-block text-[12px] transition-transform duration-200", expanded && "rotate-90")}
      >
        ▸
      </span>
    </button>
  );
}

/** Plain-text labels, used by the mobile cards and by tests. */
export function residencyLabel(gateway: Gateway): string {
  return EU_RESIDENCY[gateway.euResidency.value ?? "needs-verification"].label;
}

export function jurisdictionLabel(gateway: Gateway): string {
  return JURISDICTION[gateway.jurisdictionBucket].label;
}
