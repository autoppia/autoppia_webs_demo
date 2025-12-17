"use client";

import { useSearchParams } from "next/navigation";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { useCart } from "@/context/CartContext";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/context/CartContext";
import { logEvent, EVENT_TYPES } from "@/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchProducts } from "@/dynamic/v2-data";
import { BlurCard } from "@/components/ui/BlurCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SafeImage } from "@/components/ui/SafeImage";
import { cn } from "@/library/utils";
import { LayoutGrid, List, SlidersHorizontal } from "lucide-react";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useSeedRouter();
  const urlQuery = searchParams.get("q") ?? "";
  const query = urlQuery.trim().toLowerCase();
  const categoryParam = (searchParams.get("category") ?? "all").toLowerCase();
  const { addToCart } = useCart();
  const dyn = useDynamicSystem();
  const [addedToCartId, setAddedToCartId] = useState<string | null>(null);
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(
    null
  );
  const [localQuery, setLocalQuery] = useState(urlQuery);
  const [activeCategory, setActiveCategory] = useState<string>(categoryParam || "all");
  const [sortOption, setSortOption] = useState<"relevance" | "price-asc" | "price-desc" | "rating">("relevance");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [formError, setFormError] = useState<string | null>(null);
  const categoryLabel =
    activeCategory === "all"
      ? "All products"
      : activeCategory.replace(/\b\w/g, (char) => char.toUpperCase());

  // Local text variants
  const dynamicV3TextVariants: Record<string, string[]> = {
    search_results_for: ["Search results for", "Results for", "Showing"],
    search_placeholder: [
      "Search products, brands, and categories",
      "Find products, brands, categories",
      "Search for products"
    ],
    search_cta: ["Search", "Find", "Go"],
    add_to_cart: ["Add to Cart", "Add to Basket", "Add"],
    view: ["View", "Details", "See More"],
    no_products_found: [
      "No products found",
      "No results",
      "Nothing found"
    ],
    back_to_home: ["Back to home", "Home", "Return"],
    view_wishlist: ["View wishlist", "Wishlist", "Saved items"],
    category: ["Category", "Categories", "Filter by"],
    sort_relevance: ["Sort: Relevance", "Relevance", "Default"],
    sort_price_asc: ["Price: Low to high", "Price: Low to High", "Cheapest first"],
    sort_price_desc: ["Price: High to low", "Price: High to Low", "Most expensive first"],
    sort_rating: ["Rating", "Highest rated", "Top rated"],
    grid: ["Grid", "Grid view", "Grid layout"],
    list: ["List", "List view", "List layout"]
  };

  useEffect(() => {
    setLocalQuery(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    setActiveCategory(categoryParam || "all");
  }, [categoryParam]);

  const quickFilters = [
    { label: "Top deals", query: "deal" },
    { label: "Home essentials", query: "home" },
    { label: "Kitchen finds", query: "kitchen" },
    { label: "Fitness gear", query: "fitness" },
    { label: "Headphones", query: "headphone" },
  ];

  const baseResults = searchProducts(query);
  const availableCategories = useMemo(() => {
    const options = new Set<string>(["all"]);
    for (const product of baseResults) {
      if (product.category) {
        options.add(product.category.toLowerCase());
      }
    }
    return Array.from(options);
  }, [baseResults]);

  // Dynamic ordering for categories and quick filters
  const orderedAvailableCategories = useMemo(() => {
    const order = dyn.v1.changeOrderElements("search-categories", availableCategories.length);
    return order.map((idx) => availableCategories[idx]);
  }, [dyn.seed, availableCategories]);

  const orderedQuickFilters = useMemo(() => {
    const order = dyn.v1.changeOrderElements("search-quick-filters", quickFilters.length);
    return order.map((idx) => quickFilters[idx]);
  }, [dyn.seed]);

  // Dynamic ordering for categories and quick filters
  const orderedAvailableCategories = useMemo(() => {
    const order = dyn.v1.changeOrderElements("search-categories", availableCategories.length);
    return order.map((idx) => availableCategories[idx]);
  }, [dyn.seed, availableCategories]);

  const orderedQuickFilters = useMemo(() => {
    const order = dyn.v1.changeOrderElements("search-quick-filters", quickFilters.length);
    return order.map((idx) => quickFilters[idx]);
  }, [dyn.seed]);

  const buildSearchUrl = (value: string, category: string) => {
    const params = new URLSearchParams();
    const trimmed = value.trim();
    if (trimmed) params.set("q", trimmed);
    if (category && category !== "all") params.set("category", category);
    return params.toString() ? `/search?${params.toString()}` : "/search";
  };
  const filteredResults = useMemo(() => {
    if (!activeQuickFilter) return baseResults;
    return baseResults.filter((product) =>
      `${product.title} ${product.category}`
        .toLowerCase()
        .includes(activeQuickFilter.toLowerCase())
    );
  }, [baseResults, activeQuickFilter]);

  const categoryFilteredResults = useMemo(() => {
    if (!activeCategory || activeCategory === "all") return filteredResults;
    const normalizedCategory = activeCategory.toLowerCase();
    return filteredResults.filter(
      (product) => (product.category || "").toLowerCase() === normalizedCategory
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

  // Dynamic ordering for products
  const orderedSortedResults = useMemo(() => {
    const order = dyn.v1.changeOrderElements("search-products", sortedResults.length);
    return order.map((idx) => sortedResults[idx]);
  }, [dyn.seed, sortedResults]);

  const resultCount = sortedResults.length;

  const handleSearchSubmit = (event?: React.FormEvent) => {
    event?.preventDefault();
    const trimmed = localQuery.trim();
    if (!trimmed && activeCategory === "all") {
      setFormError("Enter a product or choose a category to search.");
      return;
    }
    setFormError(null);
    router.push(buildSearchUrl(trimmed, activeCategory));
  };

  const handleCategoryChange = (value: string) => {
    const next = value.toLowerCase() || "all";
    if (next === activeCategory) return;
    setActiveCategory(next);
    setFormError(null);
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

  // Dynamic ordering for products
  const orderedSortedResults = useMemo(() => {
    const order = dyn.v1.changeOrderElements("search-products", sortedResults.length);
    return order.map((idx) => sortedResults[idx]);
  }, [dyn.seed, sortedResults]);

  const renderProductCard = (product: Product, index: number) => (
    dyn.v1.addWrapDecoy(`search-product-card-${product.id}`, (
      <BlurCard
        key={product.id}
        interactive
        id={dyn.v3.getVariant("product-card", ID_VARIANTS_MAP, `product-card-${index}`)}
        className={dyn.v3.getVariant("card", CLASS_VARIANTS_MAP, "flex min-h-[320px] flex-col gap-3 p-4")}
      >
        {dyn.v1.addWrapDecoy(`search-product-image-${product.id}`, (
          <button
            type="button"
            onClick={() => handleViewProduct(product)}
            aria-label={`View ${product.title}`}
            className="relative h-48 w-full overflow-hidden rounded-2xl bg-slate-50 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <SafeImage
              src={product.image}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 50vw, 320px"
              className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
              fallbackSrc="/images/homepage_categories/coffee_machine.jpg"
            />
          </button>
        ))}
        <div className="space-y-1 text-sm">
          <p className="line-clamp-2 font-semibold text-slate-900">
            {product.title}
          </p>
          <p className="text-slate-500">{product.brand || product.category}</p>
        </div>
        <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
          <span>{product.price}</span>
          <span className="text-xs text-emerald-600">
            {product.rating ?? "4.8"} ★
          </span>
        </div>
        <div className="flex gap-2">
          {dyn.v1.addWrapDecoy(`search-add-cart-btn-${product.id}`, (
            <Button
              id={dyn.v3.getVariant("add-to-cart", ID_VARIANTS_MAP, `add-cart-${index}`)}
              className={dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, "flex-1 rounded-full bg-slate-900 text-white hover:bg-slate-800")}
              onClick={() => handleAddToCart(product)}
            >
              {dyn.v3.getVariant("add_to_cart", dynamicV3TextVariants, "Add to Cart")}
            </Button>
          ))}
          {dyn.v1.addWrapDecoy(`search-view-btn-${product.id}`, (
            <Button
              variant="secondary"
              id={dyn.v3.getVariant("view-details-btn", ID_VARIANTS_MAP)}
              className={dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-700")}
              onClick={() => handleViewProduct(product)}
            >
              {dyn.v3.getVariant("view", dynamicV3TextVariants, "View")}
            </Button>
          ))}
        </div>
        {addedToCartId === product.id && (
          <p className="text-center text-xs font-semibold text-emerald-600">
            ✓ {dyn.v3.getVariant("add_to_cart", dynamicV3TextVariants, "Add to Cart")}
          </p>
        )}
      </BlurCard>
    ), product.id)
  );

  const renderProductRow = (product: Product, index: number) => (
    dyn.v1.addWrapDecoy(`search-product-row-${product.id}`, (
      <BlurCard
        key={`${product.id}-row`}
        interactive
        id={dyn.v3.getVariant("product-card", ID_VARIANTS_MAP, `product-row-${index}`)}
        className={dyn.v3.getVariant("card", CLASS_VARIANTS_MAP, "flex flex-col gap-4 p-4 md:flex-row md:items-center")}
      >
        {dyn.v1.addWrapDecoy(`search-product-row-image-${product.id}`, (
          <button
            type="button"
            onClick={() => handleViewProduct(product)}
            aria-label={`View ${product.title}`}
            className="relative h-32 w-full overflow-hidden rounded-2xl bg-slate-50 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 md:h-28 md:w-32"
          >
            <SafeImage
              src={product.image}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 50vw, 180px"
              className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
              fallbackSrc="/images/homepage_categories/coffee_machine.jpg"
            />
          </button>
        ))}
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
          {dyn.v1.addWrapDecoy(`search-row-add-cart-btn-${product.id}`, (
            <Button
              id={dyn.v3.getVariant("add-to-cart", ID_VARIANTS_MAP, `add-cart-row-${index}`)}
              className={dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, "rounded-full bg-slate-900 text-white hover:bg-slate-800")}
              onClick={() => handleAddToCart(product)}
            >
              {dyn.v3.getVariant("add_to_cart", dynamicV3TextVariants, "Add to Cart")}
            </Button>
          ))}
          {dyn.v1.addWrapDecoy(`search-row-view-btn-${product.id}`, (
            <Button
              variant="secondary"
              id={dyn.v3.getVariant("view-details-btn", ID_VARIANTS_MAP)}
              className={dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-700")}
              onClick={() => handleViewProduct(product)}
            >
              {dyn.v3.getVariant("view", dynamicV3TextVariants, "View")}
            </Button>
          ))}
        </div>
      </BlurCard>
    ), product.id)
  );

  return (
    dyn.v1.addWrapDecoy("search-page-container", (
      <section 
        id={dyn.v3.getVariant("search-page", ID_VARIANTS_MAP, "search-page")}
        className={dyn.v3.getVariant("section-container", CLASS_VARIANTS_MAP, "omnizon-container grid gap-8 py-28 lg:grid-cols-[280px,1fr]")}
      >
        {dyn.v1.addWrapDecoy("search-sidebar", (
          <aside 
            id={dyn.v3.getVariant("filter-sidebar", ID_VARIANTS_MAP, "search-sidebar")}
            className={dyn.v3.getVariant("filter-sidebar", CLASS_VARIANTS_MAP, "space-y-5 rounded-[32px] border border-white/60 bg-white/80 p-5 shadow-sm lg:sticky lg:top-32")}
          >
            {dyn.v1.addWrapDecoy("search-sidebar-header", (
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                  {dyn.v3.getVariant("search_results_for", dynamicV3TextVariants, "Search results for")}
                </p>
                <p className="text-2xl font-semibold text-slate-900">
                  {urlQuery || categoryLabel}
                </p>
                <p className="text-sm text-slate-500">
                  {resultCount} {resultCount === 1 ? "item" : "items"} ready · {categoryLabel}
                </p>
              </div>
            ))}
            {dyn.v1.addWrapDecoy("search-sidebar-form", (
              <form onSubmit={handleSearchSubmit} className="space-y-3">
                {dyn.v1.addWrapDecoy("search-sidebar-input", (
                  <Input
                    value={localQuery}
                    onChange={(event) => {
                      setLocalQuery(event.target.value);
                      if (formError) setFormError(null);
                    }}
                    id={dyn.v3.getVariant("search-input", ID_VARIANTS_MAP)}
                    placeholder={dyn.v3.getVariant("search_placeholder", dynamicV3TextVariants, "Search products, brands, and categories")}
                    className={dyn.v3.getVariant("input", CLASS_VARIANTS_MAP, "rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm")}
                  />
                ))}
                {dyn.v1.addWrapDecoy("search-sidebar-submit", (
                  <Button 
                    type="submit" 
                    id={dyn.v3.getVariant("search-button", ID_VARIANTS_MAP)}
                    className={dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, "w-full rounded-full bg-slate-900 text-white")}
                  >
                    {dyn.v3.getVariant("search_cta", dynamicV3TextVariants, "Search")}
                  </Button>
                ))}
                {formError && (
                  <p className="text-xs font-semibold text-red-600">{formError}</p>
                )}
              </form>
            ))}
            <div className="subtle-divider" />
            {dyn.v1.addWrapDecoy("search-sidebar-categories", (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  {dyn.v3.getVariant("category", dynamicV3TextVariants, "Category")}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {orderedAvailableCategories.map((category) => (
                    dyn.v1.addWrapDecoy(`search-category-${category}`, (
                      <button
                        key={category}
                        type="button"
                        onClick={() => handleCategoryChange(category)}
                        id={dyn.v3.getVariant("category-link", ID_VARIANTS_MAP, `category-${category}`)}
                        className={cn(
                          dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "rounded-full border px-3 py-2 text-xs font-semibold"),
                          activeCategory === category
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 text-slate-700 hover:border-slate-400"
                        )}
                      >
                        {category === "all"
                          ? "All"
                          : category.replace(/\b\w/g, (char) => char.toUpperCase())}
                      </button>
                    ), category)
                  ))}
                </div>
              </div>
            ))}
            <div className="subtle-divider" />
            {dyn.v1.addWrapDecoy("search-sidebar-quick-links", (
              <div className="space-y-2 text-sm text-slate-600">
                {dyn.v1.addWrapDecoy("search-wishlist-link", (
                  <button
                    type="button"
                    id={dyn.v3.getVariant("wishlist-button", ID_VARIANTS_MAP, "sidebar-wishlist")}
                    className={dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "w-full rounded-2xl border border-slate-200 px-3 py-2 text-left font-semibold text-slate-700 hover:border-slate-400")}
                    onClick={() => router.push("/wishlist")}
                  >
                    ↗ {dyn.v3.getVariant("view_wishlist", dynamicV3TextVariants, "View wishlist")}
                  </button>
                ))}
                {dyn.v1.addWrapDecoy("search-cart-link", (
                  <button
                    type="button"
                    id={dyn.v3.getVariant("cart-button", ID_VARIANTS_MAP, "sidebar-cart")}
                    className={dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "w-full rounded-2xl border border-slate-200 px-3 py-2 text-left font-semibold text-slate-700 hover:border-slate-400")}
                    onClick={() => router.push("/cart")}
                  >
                    ↗ {dyn.v3.getVariant("cart", TEXT_VARIANTS_MAP, "Jump to cart")}
                  </button>
                ))}
                {dyn.v1.addWrapDecoy("search-checkout-link", (
                  <button
                    type="button"
                    id={dyn.v3.getVariant("checkout-button", ID_VARIANTS_MAP, "sidebar-checkout")}
                    className={dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "w-full rounded-2xl border border-slate-200 px-3 py-2 text-left font-semibold text-slate-700 hover:border-slate-400")}
                    onClick={() => router.push("/checkout")}
                  >
                    ↗ {dyn.v3.getVariant("checkout", TEXT_VARIANTS_MAP, "Go to checkout")}
                  </button>
                ))}
              </div>
            ))}
          </aside>
        ))}
        {dyn.v1.addWrapDecoy("search-main-content", (
          <div className="space-y-6">
            {dyn.v1.addWrapDecoy("search-heading", (
              <SectionHeading
                eyebrow={dyn.v3.getVariant("search_button", TEXT_VARIANTS_MAP, "Search")}
                title={`${dyn.v3.getVariant("search_results_for", dynamicV3TextVariants, "Search results for")}: ${urlQuery || categoryLabel || "recommended picks"}`}
                description="Refine products, compare accessories, and explore curated bundles without losing your place. Sort, filter, or switch layouts while keeping context."
                actions={
                  <div className="flex gap-2">
                    {dyn.v1.addWrapDecoy("search-back-home-btn", (
                      <Button
                        variant="secondary"
                        id={dyn.v3.getVariant("back-button", ID_VARIANTS_MAP)}
                        className={dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700")}
                        onClick={() => router.push("/")}
                      >
                        {dyn.v3.getVariant("back_to_home", dynamicV3TextVariants, "Back to home")}
                      </Button>
                    ))}
                    {dyn.v1.addWrapDecoy("search-wishlist-btn", (
                      <Button
                        id={dyn.v3.getVariant("wishlist-button", ID_VARIANTS_MAP, "search-wishlist")}
                        className={dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, "rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white")}
                        onClick={() => router.push("/wishlist")}
                      >
                        {dyn.v3.getVariant("view_wishlist", dynamicV3TextVariants, "View wishlist")}
                      </Button>
                    ))}
                  </div>
                }
              />
            ))}

            {dyn.v1.addWrapDecoy("search-controls", (
              <div className="flex flex-col gap-3 rounded-[32px] border border-white/60 bg-white/80 px-4 py-3 shadow-sm md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <SlidersHorizontal className="h-4 w-4" />
                  {resultCount} {resultCount === 1 ? "item" : "items"} available
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {dyn.v1.addWrapDecoy("search-sort-select", (
                    <select
                      value={sortOption}
                      onChange={(event) =>
                        setSortOption(event.target.value as typeof sortOption)
                      }
                      id={dyn.v3.getVariant("sort-select", ID_VARIANTS_MAP)}
                      className={dyn.v3.getVariant("input", CLASS_VARIANTS_MAP, "rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 focus:border-slate-400 focus:outline-none")}
                    >
                      <option value="relevance">{dyn.v3.getVariant("sort_relevance", dynamicV3TextVariants, "Sort: Relevance")}</option>
                      <option value="price-asc">{dyn.v3.getVariant("sort_price_asc", dynamicV3TextVariants, "Price: Low to high")}</option>
                      <option value="price-desc">{dyn.v3.getVariant("sort_price_desc", dynamicV3TextVariants, "Price: High to low")}</option>
                      <option value="rating">{dyn.v3.getVariant("sort_rating", dynamicV3TextVariants, "Rating")}</option>
                    </select>
                  ))}
                  {dyn.v1.addWrapDecoy("search-view-toggle", (
                    <div className="inline-flex rounded-full border border-slate-200 bg-white">
                      {dyn.v1.addWrapDecoy("search-grid-btn", (
                        <button
                          type="button"
                          onClick={() => setViewMode("grid")}
                          id={dyn.v3.getVariant("grid-view-btn", ID_VARIANTS_MAP)}
                          className={cn(
                            dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "flex items-center gap-1 rounded-l-full px-3 py-2 text-sm font-semibold"),
                            viewMode === "grid"
                              ? "bg-slate-900 text-white"
                              : "text-slate-600"
                          )}
                        >
                          <LayoutGrid className="h-4 w-4" />
                          {dyn.v3.getVariant("grid", dynamicV3TextVariants, "Grid")}
                        </button>
                      ))}
                      {dyn.v1.addWrapDecoy("search-list-btn", (
                        <button
                          type="button"
                          onClick={() => setViewMode("list")}
                          id={dyn.v3.getVariant("list-view-btn", ID_VARIANTS_MAP)}
                          className={cn(
                            dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "flex items-center gap-1 rounded-r-full px-3 py-2 text-sm font-semibold"),
                            viewMode === "list"
                              ? "bg-slate-900 text-white"
                              : "text-slate-600"
                          )}
                        >
                          <List className="h-4 w-4" />
                          {dyn.v3.getVariant("list", dynamicV3TextVariants, "List")}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {orderedSortedResults.length === 0 ? (
              dyn.v1.addWrapDecoy("search-no-results", (
                <BlurCard className="p-10 text-center text-slate-600">
                  <p className="text-lg font-semibold text-slate-900">
                    {dyn.v3.getVariant("no_products_found", dynamicV3TextVariants, "No products found")}
                  </p>
                  <p className="mt-2 text-sm">
                    Try a different search or explore curated categories using the filters.
                  </p>
                </BlurCard>
              ))
            ) : viewMode === "grid" ? (
              dyn.v1.addWrapDecoy("search-grid-results", (
                <div className="grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {orderedSortedResults.map((product, index) => renderProductCard(product, index))}
                </div>
              ))
            ) : (
              dyn.v1.addWrapDecoy("search-list-results", (
                <div className="space-y-4">
                  {orderedSortedResults.map((product, index) => renderProductRow(product, index))}
                </div>
              ))
            )}
          </div>
        ))}
      </section>
    ))
  );
}
