"use client";

import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { useCart } from "@/context/CartContext";
import { useV3Attributes } from "@/dynamic/v3-dynamic";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/context/CartContext";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchProducts } from "@/dynamic/v2-data";
import { BlurCard } from "@/components/ui/BlurCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/library/utils";
import { LayoutGrid, List, SlidersHorizontal } from "lucide-react";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useSeedRouter();
  const urlQuery = searchParams.get("q") ?? "";
  const query = urlQuery.toLowerCase() || "1";
  const categoryParam = (searchParams.get("category") ?? "all").toLowerCase();
  const { addToCart } = useCart();
  const { getText, getId } = useV3Attributes();
  const [addedToCartId, setAddedToCartId] = useState<string | null>(null);
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(
    null
  );
  const [localQuery, setLocalQuery] = useState(urlQuery);
  const [activeCategory, setActiveCategory] = useState<string>(categoryParam || "all");
  const [sortOption, setSortOption] = useState<"relevance" | "price-asc" | "price-desc" | "rating">("relevance");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    setLocalQuery(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    setActiveCategory(categoryParam || "all");
  }, [categoryParam]);

  const quickFilters = [
    { label: "Install kits", query: "install" },
    { label: "Ops hardware", query: "hardware" },
    { label: "Field audio", query: "microphone" },
    { label: "Smart notebooks", query: "notebook" },
    { label: "Desks & mounts", query: "desk" },
  ];

  const baseResults = useMemo(() => {
    const results = searchProducts(query);
    return Array.isArray(results) ? results : [];
  }, [query]);
  
  const availableCategories = useMemo(() => {
    const options = new Set<string>(["all"]);
    if (Array.isArray(baseResults)) {
      baseResults.forEach((product) => {
        if (product.category) {
          options.add(product.category.toLowerCase());
        }
      });
    }
    return Array.from(options);
  }, [baseResults]);

  const buildSearchUrl = (value: string, category: string) => {
    const params = new URLSearchParams();
    const trimmed = value.trim();
    if (trimmed) params.set("q", trimmed);
    if (category && category !== "all") params.set("category", category);
    return params.toString() ? `/search?${params.toString()}` : "/search";
  };
  const filteredResults = useMemo(() => {
    if (!Array.isArray(baseResults)) return [];
    if (!activeQuickFilter) return baseResults;
    return baseResults.filter((product) =>
      `${product.title} ${product.category}`
        .toLowerCase()
        .includes(activeQuickFilter.toLowerCase())
    );
  }, [baseResults, activeQuickFilter]);

  const categoryFilteredResults = useMemo(() => {
    if (!Array.isArray(filteredResults)) return [];
    if (!activeCategory || activeCategory === "all") return filteredResults;
    return filteredResults.filter((product) =>
      (product.category || "").toLowerCase().includes(activeCategory)
    );
  }, [filteredResults, activeCategory]);

  const sortedResults = useMemo(() => {
    const cloned = [...categoryFilteredResults];
    switch (sortOption) {
      case "price-asc":
        return cloned.sort(
          (a, b) =>
            Number.parseFloat(a.price.replace(/[^0-9.]/g, "")) -
            Number.parseFloat(b.price.replace(/[^0-9.]/g, ""))
        );
      case "price-desc":
        return cloned.sort(
          (a, b) =>
            Number.parseFloat(b.price.replace(/[^0-9.]/g, "")) -
            Number.parseFloat(a.price.replace(/[^0-9.]/g, ""))
        );
      case "rating":
        return cloned.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      default:
        return cloned;
    }
  }, [categoryFilteredResults, sortOption]);

  const resultCount = sortedResults.length;

  const handleSearchSubmit = (event?: React.FormEvent) => {
    event?.preventDefault();
    const trimmed = localQuery.trim();
    if (!trimmed && activeCategory === "all") return;
    router.push(buildSearchUrl(trimmed, activeCategory));
  };

  const handleCategoryChange = (value: string) => {
    const next = value.toLowerCase() || "all";
    if (next === activeCategory) return;
    setActiveCategory(next);
    logEvent(EVENT_TYPES.CATEGORY_FILTER, {
      category: next,
      query: localQuery.trim() || urlQuery,
      source: "search_page",
    });
    router.push(buildSearchUrl(localQuery || urlQuery, next));
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    logEvent(EVENT_TYPES.ADD_TO_CART, {
      productId: product.id,
      title: product.title,
      quantity: 1,
      price: product.price,
      category: product.category,
      brand: product.brand,
      rating: product.rating,
    });

    setAddedToCartId(product.id);
    setTimeout(() => setAddedToCartId(null), 1500);
  };

  const handleViewProduct = (product: Product) => {
    logEvent(EVENT_TYPES.VIEW_DETAIL, {
      productId: product.id,
      title: product.title,
      price: product.price || "$0.00",
      rating: product.rating ?? 0,
      brand: product.brand || "Generic",
      category: product.category || "Uncategorized",
    });
    router.push(`/${product.id}`);
  };

  const renderProductCard = (product: Product) => (
    <BlurCard
      key={product.id}
      interactive
      className="flex min-h-[320px] flex-col gap-3 p-4"
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => handleViewProduct(product)}
        onKeyDown={(event) => {
          if (event.key === "Enter") handleViewProduct(product);
        }}
        className="relative h-48 w-full overflow-hidden rounded-2xl bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
      >
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 50vw, 320px"
          className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="space-y-1 text-sm">
        <p className="line-clamp-2 font-semibold text-slate-900">
          {product.title}
        </p>
        <p className="text-slate-500">{product.brand || product.category}</p>
      </div>
      <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
        <span>{product.price}</span>
        <span className="text-xs text-emerald-600">
          {product.rating ? product.rating.toFixed(1) : "4.8"} ★
          {product.reviews !== undefined && (
            <span className="text-slate-500"> ({product.reviews})</span>
          )}
        </span>
      </div>
      <div className="flex gap-2">
        <Button
          id={getId("add_to_cart_button")}
          className="flex-1 rounded-full bg-slate-900 text-white hover:bg-slate-800"
          onClick={() => handleAddToCart(product)}
        >
          {getText("add_to_cart")}
        </Button>
        <Button
          variant="secondary"
          className="rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-700"
          onClick={() => handleViewProduct(product)}
        >
          View
        </Button>
      </div>
      {addedToCartId === product.id && (
        <p className="text-center text-xs font-semibold text-emerald-600">
          ✓ {getText("add_to_cart")}
        </p>
      )}
    </BlurCard>
  );

  const renderProductRow = (product: Product) => (
    <BlurCard
      key={`${product.id}-row`}
      interactive
      className="flex flex-col gap-4 p-4 md:flex-row md:items-center"
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => handleViewProduct(product)}
        onKeyDown={(event) => {
          if (event.key === "Enter") handleViewProduct(product);
        }}
        className="relative h-32 w-full overflow-hidden rounded-2xl bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 md:h-28 md:w-32"
      >
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 50vw, 180px"
          className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 text-sm">
        <p className="text-lg font-semibold text-slate-900">{product.title}</p>
        <p className="text-slate-500">{product.brand || product.category}</p>
        <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-900">
          <span>{product.price}</span>
          <span className="text-xs text-emerald-600">
            {product.rating ?? "4.8"} ★
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-2 md:w-48">
        <Button
          className="rounded-full bg-slate-900 text-white hover:bg-slate-800"
          onClick={() => handleAddToCart(product)}
        >
          {getText("add_to_cart")}
        </Button>
        <Button
          variant="secondary"
          className="rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-700"
          onClick={() => handleViewProduct(product)}
        >
          View
        </Button>
      </div>
    </BlurCard>
  );

  return (
    <section className="omnizon-container grid gap-8 py-28 lg:grid-cols-[280px,1fr]">
      <aside className="space-y-5 rounded-[32px] border border-white/60 bg-white/80 p-5 shadow-sm lg:sticky lg:top-32">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
            {getText("search_results_for")}
          </p>
          <p className="text-2xl font-semibold text-slate-900">{urlQuery || "All products"}</p>
          <p className="text-sm text-slate-500">
            {resultCount} {resultCount === 1 ? "kit" : "kits"} live
          </p>
        </div>
        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <Input
            value={localQuery}
            onChange={(event) => setLocalQuery(event.target.value)}
            placeholder={getText("search_placeholder", "Search installations, kits, teams")}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
          />
          <Button type="submit" className="w-full rounded-full bg-slate-900 text-white">
            {getText("search_cta", "Search")}
          </Button>
        </form>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Quick filters
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {quickFilters.map((filter) => (
              <button
                key={filter.label}
                type="button"
                onClick={() =>
                  setActiveQuickFilter((prev) =>
                    prev === filter.query ? null : filter.query
                  )
                }
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em]",
                  activeQuickFilter === filter.query
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 text-slate-600 hover:border-slate-400"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setActiveQuickFilter(null)}
            className="mt-3 text-xs font-semibold text-slate-500 underline-offset-4 hover:underline"
          >
            Clear filters
          </button>
        </div>
        <div className="subtle-divider" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Category
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {availableCategories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => handleCategoryChange(category)}
                className={cn(
                  "rounded-full border px-3 py-2 text-xs font-semibold",
                  activeCategory === category
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 text-slate-700 hover:border-slate-400"
                )}
              >
                {category === "all"
                  ? "All"
                  : category.replace(/\b\w/g, (char) => char.toUpperCase())}
              </button>
            ))}
          </div>
        </div>
        <div className="subtle-divider" />
        <div className="space-y-2 text-sm text-slate-600">
          <button
            type="button"
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-left font-semibold text-slate-700 hover:border-slate-400"
            onClick={() => router.push("/wishlist")}
          >
            ↗ View wishlist
          </button>
          <button
            type="button"
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-left font-semibold text-slate-700 hover:border-slate-400"
            onClick={() => router.push("/cart")}
          >
            ↗ Jump to cart
          </button>
          <button
            type="button"
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-left font-semibold text-slate-700 hover:border-slate-400"
            onClick={() => router.push("/checkout")}
          >
            ↗ Go to checkout
          </button>
        </div>
      </aside>
      <div className="space-y-6">
        <SectionHeading
          eyebrow="Search"
          title={`${getText("search_results_for")}: ${urlQuery || "auto suggestions"}`}
          description="Refine kits, accessories, and install hardware without leaving the page. Sort, filter, or switch layouts while keeping context."
          actions={
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                onClick={() => router.push("/")}
              >
                Back to home
              </Button>
              <Button
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                onClick={() => router.push("/wishlist")}
              >
                View wishlist
              </Button>
            </div>
          }
        />

        <div className="flex flex-col gap-3 rounded-[32px] border border-white/60 bg-white/80 px-4 py-3 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <SlidersHorizontal className="h-4 w-4" />
            {resultCount} {resultCount === 1 ? "kit" : "kits"} available
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={sortOption}
              onChange={(event) =>
                setSortOption(event.target.value as typeof sortOption)
              }
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 focus:border-slate-400 focus:outline-none"
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="price-asc">Price: Low to high</option>
              <option value="price-desc">Price: High to low</option>
              <option value="rating">Rating</option>
            </select>
            <div className="inline-flex rounded-full border border-slate-200 bg-white">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "flex items-center gap-1 rounded-l-full px-3 py-2 text-sm font-semibold",
                  viewMode === "grid"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600"
                )}
              >
                <LayoutGrid className="h-4 w-4" />
                Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={cn(
                  "flex items-center gap-1 rounded-r-full px-3 py-2 text-sm font-semibold",
                  viewMode === "list"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600"
                )}
              >
                <List className="h-4 w-4" />
                List
              </button>
            </div>
          </div>
        </div>

        {sortedResults.length === 0 ? (
          <BlurCard className="p-10 text-center text-slate-600">
            <p className="text-lg font-semibold text-slate-900">
              {getText("no_products_found")}
            </p>
            <p className="mt-2 text-sm">
              Try a different search or explore curated categories using the filters.
            </p>
          </BlurCard>
        ) : viewMode === "grid" ? (
          <div className="grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedResults.map(renderProductCard)}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedResults.map(renderProductRow)}
          </div>
        )}
      </div>
    </section>
  );
}
