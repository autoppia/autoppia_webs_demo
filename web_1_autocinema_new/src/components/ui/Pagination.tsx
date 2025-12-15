"use client";

import { useSearchParams, usePathname } from "next/navigation";
import { Button } from "./button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSeedRouter } from "@/hooks/useSeedRouter";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export function Pagination({ currentPage, totalPages, totalItems }: PaginationProps) {
  const router = useSeedRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }

    const query = params.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    router.push(url);
  };

  const startItem = (currentPage - 1) * 9 + 1;
  const endItem = Math.min(currentPage * 9, totalItems);

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
      <div className="text-sm text-white/70">
        Showing <span className="font-semibold text-white">{startItem}</span> to{" "}
        <span className="font-semibold text-white">{endItem}</span> of{" "}
        <span className="font-semibold text-white">{totalItems}</span> movies
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="border border-white/10 text-white hover:bg-white/10 disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            // Show first page, last page, current page, and pages around current
            const showPage =
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1);

            if (!showPage) {
              // Show ellipsis
              const prevPage = page - 1;
              if (
                prevPage === 1 ||
                prevPage === currentPage - 2 ||
                prevPage === totalPages - 2
              ) {
                return (
                  <span key={page} className="px-2 text-white/50">
                    ...
                  </span>
                );
              }
              return null;
            }

            return (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "ghost"}
                size="sm"
                onClick={() => goToPage(page)}
                className={`min-w-[40px] ${
                  currentPage === page
                    ? "bg-secondary text-black hover:bg-secondary/80"
                    : "border border-white/10 text-white hover:bg-white/10"
                }`}
              >
                {page}
              </Button>
            );
          })}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="border border-white/10 text-white hover:bg-white/10 disabled:opacity-50"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

