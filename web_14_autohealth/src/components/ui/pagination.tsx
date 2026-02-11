"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/library/utils";

const DEFAULT_ITEMS_PER_PAGE = 10;

export interface PaginationProps {
  /** Total number of items (after filters). */
  totalItems: number;
  /** Current 1-based page. */
  currentPage: number;
  /** Callback when page changes (receives new 1-based page). */
  onPageChange: (page: number) => void;
  /** Items per page. Default 10. */
  itemsPerPage?: number;
  /** Optional class for the container. */
  className?: string;
  /** Optional data-testid prefix for buttons (e.g. "doctors-pagination"). */
  "data-testid"?: string;
}

export function Pagination({
  totalItems,
  currentPage,
  onPageChange,
  itemsPerPage = DEFAULT_ITEMS_PER_PAGE,
  className,
  "data-testid": dataTestId = "pagination",
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safePage = Math.max(1, Math.min(currentPage, totalPages));
  const startItem = totalItems === 0 ? 0 : (safePage - 1) * itemsPerPage + 1;
  const endItem = Math.min(safePage * itemsPerPage, totalItems);

  if (totalItems === 0) {
    return (
      <div className={cn("flex items-center justify-between gap-4 py-3", className)} data-testid={dataTestId}>
        <p className="text-sm text-muted-foreground">Showing 0 of 0</p>
      </div>
    );
  }

  return (
    <div
      className={cn("flex flex-wrap items-center justify-between gap-4 py-3", className)}
      data-testid={dataTestId}
    >
      <p className="text-sm text-muted-foreground">
        Showing {startItem}–{endItem} of {totalItems}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1}
          aria-label="Previous page"
          data-testid={`${dataTestId}-prev`}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <span className="text-sm text-muted-foreground px-2" aria-live="polite">
          Page {safePage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= totalPages}
          aria-label="Next page"
          data-testid={`${dataTestId}-next`}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export { DEFAULT_ITEMS_PER_PAGE as PAGINATION_PAGE_SIZE };
