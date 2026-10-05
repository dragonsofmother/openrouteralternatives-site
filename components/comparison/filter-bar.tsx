"use client";

import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import type { Modality } from "@/types";
import type { GatewayFilters } from "@/lib/gateway";
import {
  DEPLOYMENT,
  DEPLOYMENT_ORDER,
  EU_RESIDENCY,
  EU_RESIDENCY_ORDER,
  GATEWAY_TYPE,
  GATEWAY_TYPE_ORDER,
  JURISDICTION,
  JURISDICTION_ORDER,
  MODALITY,
  MODALITY_ORDER,
} from "@/lib/taxonomy";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/** Filter modalities offered in the table UI, in the brief's order. */
const FILTERABLE_MODALITIES: Modality[] = MODALITY_ORDER.filter(
  (modality) => modality !== "audio" && modality !== "reranking",
);

const MENU_CONTENT =
  "z-50 max-h-[28rem] w-64 overflow-y-auto border border-line-strong bg-surface p-1.5 animate-fade-up";
const MENU_LABEL = "px-2 pb-1 pt-2 text-[11px] font-medium uppercase tracking-[0.07em] text-ink-subtle";
const MENU_ITEM =
  "flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] text-ink outline-none data-[highlighted]:bg-subtle";

/**
 * A select written as a command flag: the label is the flag name, the
 * default option reads "any".
 */
function Select<T extends string>({
  flag,
  label,
  value,
  options,
  onChange,
}: {
  flag: string;
  label: string;
  value: T | "all";
  options: { value: T; label: string }[];
  onChange: (value: T | "all") => void;
}) {
  const id = React.useId();
  const isActive = value !== "all";

  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="whitespace-nowrap text-[12px] text-ink-muted">
        <span className="sr-only">{label} </span>--{flag}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value as T | "all")}
          className={cn(
            "h-9 max-w-[13rem] appearance-none border bg-canvas py-0 pl-3 pr-8 text-[13px] transition-colors hover:border-line-strong",
            isActive ? "border-brand-line bg-brand-subtle font-bold text-brand-ink" : "border-line text-ink",
          )}
        >
        <option value="all">any</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle"
        />
      </div>
    </div>
  );
}

/** Check or radio mark inside a menu item. Colour never carries the state alone: the item text does. */
function Mark({ on, round = false }: { on: boolean; round?: boolean }) {
  return (
    <span
      className={cn(
        "flex size-4 shrink-0 items-center justify-center border",
        round ? "rounded-full" : "rounded",
        on ? "border-brand bg-brand text-white" : "border-line-strong",
      )}
    >
      {on ? <Check aria-hidden="true" className="size-3" /> : null}
    </span>
  );
}

/**
 * One row of controls above the table.
 *
 * Search, then the two filters the site is built around (jurisdiction and
 * EU residency) as self-labelling selects, then a single "More filters" menu
 * holding gateway type, deployment and modalities. There is no column picker:
 * every recorded attribute that is not a column is in the expanded row. Anything chosen inside
 * that menu is echoed as a removable chip beneath the row, so an active
 * filter is never hidden behind a closed menu.
 */
export function FilterBar({
  filters,
  onChange,
  onReset,
  resultCount,
  totalCount,
}: {
  filters: GatewayFilters;
  onChange: (next: Partial<GatewayFilters>) => void;
  onReset: () => void;
  resultCount: number;
  totalCount: number;
}) {
  const searchId = React.useId();

  const moreCount =
    (filters.type !== "all" ? 1 : 0) +
    (filters.deployment !== "all" ? 1 : 0) +
    filters.modalities.length;
  const hasFilters =
    filters.search.trim() !== "" ||
    filters.jurisdiction !== "all" ||
    filters.residency !== "all" ||
    moreCount > 0;

  const toggleModality = (modality: Modality) => {
    onChange({
      modalities: filters.modalities.includes(modality)
        ? filters.modalities.filter((m) => m !== modality)
        : [...filters.modalities, modality],
    });
  };

  const typeOptions: { value: GatewayFilters["type"]; label: string }[] = [
    { value: "all", label: "Any type" },
    ...GATEWAY_TYPE_ORDER.map((type) => ({ value: type, label: GATEWAY_TYPE[type].label })),
    { value: "open-source", label: "Open source" },
  ];
  const deploymentOptions: { value: GatewayFilters["deployment"]; label: string }[] = [
    { value: "all", label: "Any deployment" },
    ...DEPLOYMENT_ORDER.map((deployment) => ({
      value: deployment,
      label: DEPLOYMENT[deployment].label,
    })),
  ];

  const chips: { key: string; label: string; clear: () => void }[] = [];
  if (filters.type !== "all") {
    chips.push({
      key: "type",
      label: filters.type === "open-source" ? "Open source" : GATEWAY_TYPE[filters.type].label,
      clear: () => onChange({ type: "all" }),
    });
  }
  if (filters.deployment !== "all") {
    chips.push({
      key: "deployment",
      label: DEPLOYMENT[filters.deployment].label,
      clear: () => onChange({ deployment: "all" }),
    });
  }
  for (const modality of filters.modalities) {
    chips.push({
      key: `modality-${modality}`,
      label: MODALITY[modality].label,
      clear: () => toggleModality(modality),
    });
  }

  return (
    <div className="border border-line-strong bg-surface lg:border-b-0">
      <div className="flex flex-wrap items-center gap-2 p-3">
        <div className="flex min-w-[14rem] flex-1 basis-full items-center gap-2 sm:basis-auto">
          <label htmlFor={searchId} className="whitespace-nowrap text-[12px] text-ink-muted">
            <span className="sr-only">Search </span>--search
          </label>
          <div className="relative min-w-0 flex-1">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle"
            />
            <input
              id={searchId}
              type="search"
              value={filters.search}
              onChange={(event) => onChange({ search: event.target.value })}
              placeholder="gateway, provider, capability…"
              className="h-9 w-full border border-line bg-canvas pl-9 pr-3 text-[13px] text-ink transition-colors placeholder:text-ink-subtle hover:border-line-strong"
            />
          </div>
        </div>

        <Select
          flag="jurisdiction"
          label="Jurisdiction"
          value={filters.jurisdiction}
          onChange={(value) => onChange({ jurisdiction: value })}
          options={JURISDICTION_ORDER.map((bucket) => ({
            value: bucket,
            label: JURISDICTION[bucket].label,
          }))}
        />
        <Select
          flag="residency"
          label="EU residency"
          value={filters.residency}
          onChange={(value) => onChange({ residency: value })}
          options={EU_RESIDENCY_ORDER.map((residency) => ({
            value: residency,
            label: EU_RESIDENCY[residency].label,
          }))}
        />

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            {/* A plain element, so the trigger's handlers and ref land on the button. */}
            <button
              type="button"
              className={cn(
                "inline-flex h-9 items-center gap-2 border px-3 text-[13px] transition-colors",
                moreCount > 0
                  ? "border-brand-line bg-brand-subtle text-brand-ink"
                  : "border-line bg-canvas text-ink-muted hover:border-line-strong hover:text-ink",
              )}
            >
              <SlidersHorizontal aria-hidden="true" className="size-3.5" />
              + more flags
              {moreCount > 0 ? (
                <Badge tone="brand" size="xs">
                  {moreCount}
                </Badge>
              ) : null}
              <ChevronDown aria-hidden="true" className="size-3.5" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content align="start" sideOffset={6} className={MENU_CONTENT}>
              <DropdownMenu.Label className={MENU_LABEL}>Gateway type</DropdownMenu.Label>
              <DropdownMenu.RadioGroup
                value={filters.type}
                onValueChange={(value) => onChange({ type: value as GatewayFilters["type"] })}
              >
                {typeOptions.map((option) => (
                  <DropdownMenu.RadioItem
                    key={option.value}
                    value={option.value}
                    onSelect={(event) => event.preventDefault()}
                    className={MENU_ITEM}
                  >
                    <Mark on={filters.type === option.value} round />
                    {option.label}
                  </DropdownMenu.RadioItem>
                ))}
              </DropdownMenu.RadioGroup>

              <DropdownMenu.Separator className="my-1 h-px bg-line" />
              <DropdownMenu.Label className={MENU_LABEL}>Deployment</DropdownMenu.Label>
              <DropdownMenu.RadioGroup
                value={filters.deployment}
                onValueChange={(value) =>
                  onChange({ deployment: value as GatewayFilters["deployment"] })
                }
              >
                {deploymentOptions.map((option) => (
                  <DropdownMenu.RadioItem
                    key={option.value}
                    value={option.value}
                    onSelect={(event) => event.preventDefault()}
                    className={MENU_ITEM}
                  >
                    <Mark on={filters.deployment === option.value} round />
                    {option.label}
                  </DropdownMenu.RadioItem>
                ))}
              </DropdownMenu.RadioGroup>

              <DropdownMenu.Separator className="my-1 h-px bg-line" />
              <DropdownMenu.Label className={MENU_LABEL}>Documented modalities</DropdownMenu.Label>
              {FILTERABLE_MODALITIES.map((modality) => {
                const checked = filters.modalities.includes(modality);
                return (
                  <DropdownMenu.CheckboxItem
                    key={modality}
                    checked={checked}
                    onCheckedChange={() => toggleModality(modality)}
                    onSelect={(event) => event.preventDefault()}
                    className={MENU_ITEM}
                  >
                    <Mark on={checked} />
                    {MODALITY[modality].label}
                  </DropdownMenu.CheckboxItem>
                );
              })}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        <div className="ml-auto flex items-center gap-3">
          <p aria-live="polite" className="text-[12.5px] text-ink-muted">
            <span className="tnum font-bold text-ink">{resultCount}</span>/
            <span className="tnum">{totalCount}</span> rows
          </p>
          {hasFilters ? (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[12.5px] text-ink-muted transition-colors hover:bg-subtle hover:text-ink"
            >
              <X aria-hidden="true" className="size-3.5" />
              Clear
            </button>
          ) : null}
        </div>
      </div>

      {chips.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 border-t border-line px-3 py-2">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.clear}
              aria-label={`Remove ${chip.label} filter`}
              className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-brand-line bg-brand-subtle px-2.5 text-[12.5px] text-brand-ink"
            >
              {chip.label}
              <X aria-hidden="true" className="size-3" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
