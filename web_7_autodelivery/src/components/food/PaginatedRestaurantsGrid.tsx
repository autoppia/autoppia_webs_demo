"use client";
import { useState } from "react";
import { restaurants } from "@/data/restaurants";
import RestaurantCard from "./RestaurantCard";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import React from "react";

interface PaginatedRestaurantsGridProps {
  filteredRestaurants?: typeof restaurants;
  title?: string;
}

export default function PaginatedRestaurantsGrid({ 
  filteredRestaurants = restaurants, 
  title = "All Restaurants" 
}: PaginatedRestaurantsGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const restaurantsPerPage = 12;
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredRestaurants.length / restaurantsPerPage);
  const startIndex = (currentPage - 1) * restaurantsPerPage;
  const endIndex = startIndex + restaurantsPerPage;
  const currentRestaurants = filteredRestaurants.slice(startIndex, endIndex);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of the restaurants section
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="my-14">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">
        {title}
      </h2>
      
      {/* Results count */}
      <div className="text-center text-zinc-600 mb-6">
        Showing {startIndex + 1}-{Math.min(endIndex, filteredRestaurants.length)} of {filteredRestaurants.length} restaurants
      </div>

      {/* Restaurants Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 max-w-6xl mx-auto mb-8">
        {currentRestaurants.map((r) => (
          <RestaurantCard
            key={r.id}
            id={r.id}
            name={r.name}
            image={r.image}
            cuisine={r.cuisine}
            rating={r.rating}
            description={r.description}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            {/* Previous button */}
            <PaginationItem>
              <PaginationPrevious 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) {
                    handlePageChange(currentPage - 1);
                  }
                }}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>

            {/* Page numbers */}
            {getPageNumbers().map((page, index) => {
              // Add ellipsis if there's a gap
              const prevPage = getPageNumbers()[index - 1];
              const showEllipsis = prevPage && page - prevPage > 1;
              
              return (
                <React.Fragment key={page}>
                  {showEllipsis && (
                    <PaginationItem>
                      <span className="px-3 py-2">...</span>
                    </PaginationItem>
                  )}
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === page}
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(page);
                      }}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                </React.Fragment>
              );
            })}

            {/* Next button */}
            <PaginationItem>
              <PaginationNext 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) {
                    handlePageChange(currentPage + 1);
                  }
                }}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </section>
  );
} 