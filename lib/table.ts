import {
  columnVisibilityFeature,
  createExpandedRowModel,
  createSortedRowModel,
  rowExpandingFeature,
  rowSortingFeature,
  sortFns,
  tableFeatures,
  type ColumnDef,
  type Row,
  type SortFn,
} from "@tanstack/react-table";
import type { Gateway } from "@/types";

/**
 * Feature set for the comparison table.
 *
 * TanStack Table v9 requires features to be registered explicitly, which keeps
 * the client bundle to the three behaviours this table actually uses: sorting,
 * row expansion and column visibility. No pagination or filtering models are
 * pulled in, because filtering happens on the dataset before it reaches the
 * table.
 */
export const gatewayTableFeatures = tableFeatures({
  rowSortingFeature,
  rowExpandingFeature,
  columnVisibilityFeature,
  sortedRowModel: createSortedRowModel(),
  expandedRowModel: createExpandedRowModel(),
  sortFns,
});

export type GatewayTableFeatures = typeof gatewayTableFeatures;
export type GatewayColumnDef = ColumnDef<GatewayTableFeatures, Gateway>;
export type GatewayRow = Row<GatewayTableFeatures, Gateway>;

/** Per-column presentation hints read by the table shell. */
export interface GatewayColumnMeta {
  align?: "left" | "right";
  /**
   * Preferred width in pixels. The table turns the visible columns' widths
   * into proportions so they fill the container, and only scrolls once the
   * viewport is narrower than roughly three quarters of their sum.
   */
  width?: number;
}

/**
 * Numeric comparator for measured columns.
 *
 * Rows with no value are handled by `sortUndefined: "last"` on the column
 * rather than here: that pushes them to the bottom whatever the direction, so
 * an unmeasured catalogue can never reach the top. Each column also declares
 * its single sort direction with `sortDescFirst`, and the table never reverses
 * it.
 */
export const numeric: SortFn<GatewayTableFeatures, Gateway> = (rowA, rowB, columnId) => {
  const left = rowA.getValue(columnId) as number;
  const right = rowB.getValue(columnId) as number;
  return left - right;
};
