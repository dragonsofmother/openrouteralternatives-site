"use client";

import * as React from "react";
import { flexRender, useTable } from "@tanstack/react-table";
import { ArrowDown, SearchX } from "lucide-react";
import type { Gateway } from "@/types";
import {
  EMPTY_FILTERS,
  activeFilterCount,
  filterGateways,
  type GatewayFilters,
} from "@/lib/gateway";
import {
  gatewayTableFeatures,
  type GatewayColumnDef,
  type GatewayColumnMeta,
} from "@/lib/table";
import { columns as defaultColumns } from "@/components/comparison/columns";
import { ExpandedRow } from "@/components/comparison/expanded-row";
import { FilterBar } from "@/components/comparison/filter-bar";
import { MobileGatewayCard } from "@/components/comparison/mobile-card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * The comparison table.
 *
 * Rows arrive alphabetical by gateway name and open that way — never a
 * ranking that places one company first. Each sortable column sorts in one
 * declared direction (`sortDescFirst` on the column), so a sort can never be
 * reversed to promote rows that hold no value. The gateway name and
 * jurisdiction columns do not sort at all.
 *
 * Model count is always the second order: a filtered view with no explicit
 * sort is ordered by it, largest first, and it breaks ties under any column
 * sort. Rows without a count stay at the bottom either way.
 */
export function ComparisonTable({
  gateways,
  initialFilters,
  showFilters = true,
  columns = defaultColumns,
  caption,
}: {
  gateways: Gateway[];
  initialFilters?: Partial<GatewayFilters>;
  showFilters?: boolean;
  columns?: GatewayColumnDef[];
  caption?: string;
}) {
  const [filters, setFilters] = React.useState<GatewayFilters>({
    ...EMPTY_FILTERS,
    ...initialFilters,
  });
  const [sorting, setSorting] = React.useState<{ id: string; desc: boolean }[]>([]);

  const data = React.useMemo(
    () => (showFilters ? filterGateways(gateways, filters) : gateways),
    [gateways, filters, showFilters],
  );

  const hasActiveFilters = showFilters && activeFilterCount(filters) > 0;
  const effectiveSorting = React.useMemo(() => {
    if (sorting.some((entry) => entry.id === "models")) return sorting;
    if (sorting.length === 0 && !hasActiveFilters) return sorting;
    return [...sorting, { id: "models", desc: true }];
  }, [sorting, hasActiveFilters]);

  const table = useTable({
    features: gatewayTableFeatures,
    data,
    columns,
    state: { sorting: effectiveSorting },
    onSortingChange: setSorting,
    getRowCanExpand: () => true,
    getRowId: (row) => row.id,
    enableSortingRemoval: false,
  });

  const updateFilters = React.useCallback((next: Partial<GatewayFilters>) => {
    setFilters((current) => ({ ...current, ...next }));
  }, []);

  const resetFilters = React.useCallback(() => {
    setFilters({ ...EMPTY_FILTERS, ...initialFilters });
  }, [initialFilters]);

  const rows = table.getRowModel().rows;
  const visibleColumns = table.getVisibleLeafColumns();
  const visibleColumnCount = visibleColumns.length;

  // Preferred widths become proportions of the visible set, so the columns
  // fill the container instead of forcing a horizontal scroll. The table only
  // scrolls once the viewport is narrower than roughly three quarters of the
  // visible columns' preferred widths put together.
  const totalWidth = visibleColumns.reduce(
    (sum, column) =>
      sum + ((column.columnDef.meta as GatewayColumnMeta | undefined)?.width ?? 120),
    0,
  );
  const widthFor = (width?: number) => `${(((width ?? 120) / totalWidth) * 100).toFixed(3)}%`;

  // The table scrolls horizontally, so an expanded row would otherwise be laid
  // out at the full scroll width and run off the right edge. Pin it to the left
  // of the scroll container and size it to the visible area instead.
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [panelWidth, setPanelWidth] = React.useState<number | null>(null);
  React.useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    const observer = new ResizeObserver(() => setPanelWidth(element.clientWidth));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <TooltipProvider delayDuration={120}>
      <div>
        {showFilters ? (
          <FilterBar
            filters={filters}
            onChange={updateFilters}
            onReset={resetFilters}
            resultCount={data.length}
            totalCount={gateways.length}
          />
        ) : null}

        {/* Desktop: full table with proportional columns, sticky header and sticky first column. */}
        <div
          ref={scrollRef}
          className={cn(
            "scroll-shadow-x hidden overflow-x-auto border border-line bg-surface shadow-card lg:block",
            showFilters ? "rounded-b-card" : "rounded-card",
          )}
        >
          <table
            className="w-full table-fixed border-collapse text-left"
            style={{ minWidth: Math.round(totalWidth * 0.78) }}
          >
            {caption ? <caption className="sr-only">{caption}</caption> : null}
            <thead className="sticky top-0 z-20">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header, index) => {
                    const meta = header.column.columnDef.meta as GatewayColumnMeta | undefined;
                    const canSort = header.column.getCanSort();
                    const sorted = header.column.getIsSorted();
                    // Only the leading sort is announced; the model-count
                    // tiebreak is shown as a muted arrow.
                    const isPrimary = Boolean(sorted) && header.column.getSortIndex() === 0;

                    return (
                      <th
                        key={header.id}
                        scope="col"
                        aria-sort={
                          isPrimary
                            ? sorted === "asc"
                              ? "ascending"
                              : "descending"
                            : canSort
                              ? "none"
                              : undefined
                        }
                        style={{ width: widthFor(meta?.width) }}
                        className={cn(
                          "border-b border-line bg-subtle px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-muted first:pl-4 last:pr-4",
                          index === 0 && "sticky left-0 z-10",
                          meta?.align === "right" && "text-right",
                        )}
                      >
                        {canSort ? (
                          <button
                            type="button"
                            onClick={() =>
                              header.column.toggleSorting(
                                header.column.columnDef.sortDescFirst ?? false,
                              )
                            }
                            className={cn(
                              "group inline-flex items-center gap-1.5 rounded transition-colors hover:text-ink",
                              meta?.align === "right" && "flex-row-reverse",
                              isPrimary && "text-ink",
                            )}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {sorted ? (
                              <ArrowDown
                                aria-hidden="true"
                                className={cn("size-3", !isPrimary && "opacity-40")}
                              />
                            ) : (
                              <ArrowDown
                                aria-hidden="true"
                                className="size-3 opacity-0 transition-opacity group-hover:opacity-50"
                              />
                            )}
                          </button>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumnCount} className="px-4 py-16">
                    <EmptyState onReset={resetFilters} />
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <React.Fragment key={row.id}>
                    <tr
                      className={cn(
                        "group border-b border-line transition-colors last:border-b-0",
                        row.getIsExpanded() ? "bg-subtle" : "hover:bg-subtle",
                      )}
                    >
                      {row.getVisibleCells().map((cell, index) => {
                        const meta = cell.column.columnDef.meta as GatewayColumnMeta | undefined;
                        return (
                          <td
                            key={cell.id}
                            className={cn(
                              "px-3 py-3 align-middle first:pl-4 last:pr-4",
                              index === 0 &&
                                "sticky left-0 z-10 bg-surface group-hover:bg-subtle",
                              index === 0 && row.getIsExpanded() && "bg-subtle",
                              meta?.align === "right" && "text-right",
                            )}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        );
                      })}
                    </tr>
                    {row.getIsExpanded() ? (
                      <tr className="border-b border-line">
                        <td colSpan={visibleColumnCount} className="p-0">
                          <div
                            className="sticky left-0"
                            style={panelWidth ? { width: panelWidth } : undefined}
                          >
                            <ExpandedRow gateway={row.original} />
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Below the lg breakpoint: one card per gateway rather than a squeezed table. */}
        <div className="flex flex-col gap-3 lg:hidden">
          {showFilters ? <div className="h-3" aria-hidden="true" /> : null}
          {rows.length === 0 ? (
            <div className="rounded-card border border-line bg-surface px-4 py-12 shadow-card">
              <EmptyState onReset={resetFilters} />
            </div>
          ) : (
            rows.map((row) => <MobileGatewayCard key={row.id} gateway={row.original} />)
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center text-center">
      <span className="flex size-10 items-center justify-center rounded-full border border-line bg-subtle">
        <SearchX aria-hidden="true" className="size-4 text-ink-subtle" />
      </span>
      <p className="mt-4 text-[14.5px] font-medium text-ink">No gateways match these filters</p>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-muted">
        Filters match recorded values only. A gateway whose catalogue is configured by the
        customer, or whose provider does not publish a figure, will not match a filter that asks
        for a specific value.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-4 rounded-lg border border-line bg-surface px-3 py-1.5 text-[13px] text-ink transition-colors hover:bg-subtle"
      >
        Clear filters
      </button>
    </div>
  );
}
