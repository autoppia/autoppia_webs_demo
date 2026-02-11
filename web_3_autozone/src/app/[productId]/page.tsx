"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Star, Share2, Heart, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Product, useCart } from "@/context/CartContext";
import { BlurCard } from "@/components/ui/BlurCard";
import { SectionHeading } from "@/components/ui/SectionHeading";

import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { logEvent, EVENT_TYPES } from "@/events";
import { Suspense } from "react";
import { getProductById } from "@/dynamic/v2";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { useSeed } from "@/context/SeedContext";
import {
  isInWishlist,
  toggleWishlistItem,
} from "@/library/wishlist";
import { SafeImage } from "@/components/ui/SafeImage";
import { getCategoryFallback } from "@/data/products-enhanced";


const DELIVERY_ADDRESS = "Daly City 94016";

// Generate dynamic delivery date (2-3 days from today)
const getDeliveryDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + (2 + Math.floor(Math.random() * 2)));
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
};

function ProductContent() {
  const router = useSeedRouter();
  const { productId } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const dyn = useDynamicSystem();
  const [addedToCart, setAddedToCart] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [wishlistAdded, setWishlistAdded] = useState(false);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "shared">(
    "idle"
  );
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const { seed } = useSeed();
  const order = seed % 3;
  const fallbackImage = getCategoryFallback(product?.category);
  const [deliveryDate, setDeliveryDate] = useState<string>("");

  const t = (key: string, fallback: string) =>
    dyn.v3.getVariant(key, TEXT_VARIANTS_MAP, fallback);
  
  // Debug: Verify V2 status
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("[productId/page] V2 status:", {
        v2Enabled: dyn.v2.isEnabled(),
        v2DbMode: dyn.v2.isDbModeEnabled(),
        v2AiGenerate: dyn.v2.isAiGenerateEnabled(),
        v2Fallback: dyn.v2.isFallbackMode(),
      });
    }
  }, [dyn.v2]);
  
  useEffect(() => {
    // Set delivery date on client side to avoid hydration mismatch
    setDeliveryDate(getDeliveryDate());
  }, []);

  useEffect(() => {
    setIsLoading(true);

    if (typeof productId === "string") {
      const foundProduct = getProductById(productId);
      if (foundProduct) {
        setProduct(foundProduct);
      }
      setIsLoading(false);
    }
  }, [productId]);

  const productEventData = useMemo(
    () =>
      product
        ? {
            productId: product.id,
            title: product.title,
            price: product.price,
            category: product.category,
            brand: product.brand,
            rating: product.rating,
          }
        : null,
    [product]
  );

  // Log view event
  useEffect(() => {
    if (productEventData) {
      logEvent(EVENT_TYPES.VIEW_DETAIL, { ...productEventData });
    }
  }, [productEventData]);

  useEffect(() => {
    if (product?.id) {
      setWishlistAdded(isInWishlist(product.id));
    }
  }, [product?.id]);

  const galleryImages = useMemo(() => {
    if (!product?.image) return [];
    // Just show one image since we don't have multiple angles
    return [product.image];
  }, [product?.image]);

  useEffect(() => {
    if (product?.id) {
      setActiveImage(0);
    }
  }, [product?.id]);

  const specEntries = useMemo(
    () =>
      [
        { label: "Brand", value: product?.brand },
        { label: "Color", value: product?.color },
        { label: "Size", value: product?.size },
        {
          label: "Dimensions",
          value:
            product?.dimensions?.length ||
            product?.dimensions?.width ||
            product?.dimensions?.depth
              ? `${product?.dimensions?.length ?? ""} ${product?.dimensions?.width ?? ""} ${product?.dimensions?.depth ?? ""}`.trim()
              : undefined,
        },
        {
          label: "Category",
          value: product?.category,
        },
        {
          label: "Care Instructions",
          value: product?.careInstructions,
        },
      ].filter((entry) => entry.value),
    [
      product?.brand,
      product?.careInstructions,
      product?.category,
      product?.color,
      product?.dimensions?.depth,
      product?.dimensions?.length,
      product?.dimensions?.width,
      product?.size,
    ]
  );

  // Dynamic ordering for spec entries
  const orderedSpecEntries = useMemo(() => {
    const order = dyn.v1.changeOrderElements("product-specs", specEntries.length);
    return order.map((idx) => specEntries[idx]);
  }, [dyn.v1.changeOrderElements, specEntries]);

  const highlightBullets = useMemo(() => {
    if (!product?.description) {
      return [
        "Built for everyday use with durable materials.",
        "Ships fast with easy returns included.",
        "Well-reviewed by shoppers for value and quality.",
      ];
    }
    return product.description.split("\n\n").slice(0, 4);
  }, [product?.description]);

  // Dynamic ordering for highlight bullets
  const orderedHighlightBullets = useMemo(() => {
    const order = dyn.v1.changeOrderElements("product-highlights", highlightBullets.length);
    return order.map((idx) => highlightBullets[idx]);
  }, [dyn.v1.changeOrderElements, highlightBullets]);

  const handleShareProduct = async () => {
    if (!product || !productEventData) return;
    const shareUrl =
      typeof window !== "undefined" ? window.location.href : product.id;

    logEvent(EVENT_TYPES.SHARE_PRODUCT, {
      ...productEventData,
      shareUrl,
    });

    try {
      if (navigator.share) {
        await navigator.share({
          title: product.title,
          text: product.description ?? product.title,
          url: shareUrl,
        });
        setShareStatus("shared");
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setShareStatus("copied");
      }
    } catch (error) {
      console.warn("Share cancelled", error);
    } finally {
      setTimeout(() => setShareStatus("idle"), 2500);
    }
  };

  const handleWishlistToggle = () => {
    if (!product || !productEventData) return;
    const { added } = toggleWishlistItem({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      category: product.category,
      brand: product.brand,
      rating: product.rating,
    });
    setWishlistAdded(added);
    logEvent(EVENT_TYPES.ADD_TO_WISHLIST, {
      ...productEventData,
      action: added ? "added" : "removed",
    });
  };

  const handleExploreToggle = () => {
    if (!product || !productEventData) return;
    const next = !isExploreOpen;
    setIsExploreOpen(next);
    logEvent(EVENT_TYPES.DETAILS_TOGGLE, {
      ...productEventData,
      section: "explore_further",
      expanded: next,
    });
  };

  const quantityInput = (
    dyn.v1.addWrapDecoy("product-quantity-input", (
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
        <label
          htmlFor={dyn.v3.getVariant("quantity-input", ID_VARIANTS_MAP, "quantity-select")}
          className="mb-1 block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400"
        >
          {t("qty", "Quantity")}
        </label>
        <select
          id={dyn.v3.getVariant("quantity-input", ID_VARIANTS_MAP, "quantity-select")}
          className={dyn.v3.getVariant("input", CLASS_VARIANTS_MAP, "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 focus:border-slate-400 focus:outline-none")}
          value={quantity}
          onChange={(e) => {
            if (!product) return;
            const newQty = Number.parseInt(e.target.value);
            setQuantity(newQty);
            logEvent(EVENT_TYPES.QUANTITY_CHANGED, {
              product_id: product.id,
              product_name: product.title,
              previous_quantity: quantity,
              new_quantity: newQty,
              price: product.price,
              category: product.category,
              brand: product.brand,
              rating: product.rating,
              updated_at: new Date().toISOString(),
            });
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
    ))
  );

  const addToCartButton = (
    dyn.v1.addWrapDecoy("product-add-cart-btn", (
      <Button
        id={dyn.v3.getVariant("add-to-cart", ID_VARIANTS_MAP, "add-to-cart-button")}
        className={dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, "mt-1 w-full rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-elevated hover:bg-slate-800")}
        onClick={() => {
          handleAddToCart();
          router.push("/cart");
        }}
      >
        {t("add_to_cart", "Add to cart")}
      </Button>
    ))
  );

  const buyNowButton = (
    dyn.v1.addWrapDecoy("product-buy-now-btn", (
      <Button
        id={dyn.v3.getVariant("buy-now", ID_VARIANTS_MAP, "buy-now-button")}
        className={dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, "w-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:from-indigo-600 hover:to-sky-600")}
        onClick={() => {
          if (!product) return;

          addToCart(product);
          logEvent(EVENT_TYPES.CHECKOUT_STARTED, {
            productId: product.id,
            title: product.title,
            quantity,
            price: product.price,
            category: product.category,
            brand: product.brand,
            rating: product.rating,
          });
          router.push("/checkout");
        }}
      >
        {t("buy_now", "Buy now")}
      </Button>
    ))
  );

  const actionMap = {
    quantity: quantityInput,
    add: addToCartButton,
    buy: buyNowButton,
  };

  // Predefined orders
  const layouts: Array<Array<keyof typeof actionMap>> = [
    ["quantity", "add", "buy"],
    ["buy", "quantity", "add"],
    ["add", "buy", "quantity"],
  ];

  const handleAddToCart = () => {
    if (!product) return;
    for (let index = 0; index < quantity; index += 1) {
      addToCart(product);
    }
    logEvent(EVENT_TYPES.ADD_TO_CART, {
      productId: product.id,
      title: product.title,
      quantity,
      price: product.price,
      category: product.category,
      brand: product.brand,
      rating: product.rating,
    });
    setAddedToCart(true);

    setTimeout(() => {
      setAddedToCart(false);
    }, 3000);
  };

  const renderDescription = (description: string) => {
    if (!description) return null;

    return description.split("\n\n").map((paragraph, idx) => (
      <p key={`para-${paragraph.substring(0, 10)}-${idx}`} className="leading-relaxed">
        {paragraph}
      </p>
    ));
  };

  const renderStars = (rating: number, reviews?: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={`star-${i}-${rating}`}
            size={18}
            className={`${
              i < fullStars
                ? "text-amber-500 fill-amber-500"
                : i === fullStars && hasHalfStar
                ? "text-amber-500 fill-amber-500"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-blue-600 text-sm font-medium">
          {rating.toFixed(1)}
          {reviews !== undefined && reviews > 0 && (
            <> ({reviews.toLocaleString()} {reviews === 1 ? 'review' : 'reviews'})</>
          )}
        </span>
      </div>
    );
  };

  if (isLoading) {
    return (
      dyn.v1.addWrapDecoy("product-loading", (
        <div className="omnizon-container py-8">
          <div className="text-center">
            <p className="mt-4">{t("loading_product", "Loading product")}...</p>
          </div>
        </div>
      ))
    );
  }

  if (!product) {
    return (
      dyn.v1.addWrapDecoy("product-not-found", (
        <div className="omnizon-container py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">{t("product_not_found", "Product not found")}</h1>
            <p className="mt-4">
              {t(
                "product_missing_message",
                "The product you are looking for does not exist or has been removed."
              )}
            </p>
            {dyn.v1.addWrapDecoy("product-return-home-btn", (
              <Button 
                className="mt-4" 
                id={dyn.v3.getVariant("back-button", ID_VARIANTS_MAP)}
                onClick={() => router.push("/")}
              >
                {t("return_to_home", "Return to home")}
              </Button>
            ))}
          </div>
        </div>
      ))
    );
  }

  const formattedPrice = product.price || "$0.00";
  const rating = product.rating || 0;

  return (
    dyn.v1.addWrapDecoy("product-page-main", (
      <main
        id={dyn.v3.getVariant("product-page", ID_VARIANTS_MAP, "product-page")}
        className={dyn.v3.getVariant("main-container", CLASS_VARIANTS_MAP, "bg-gradient-to-b from-white via-slate-50 to-white")}
        suppressHydrationWarning
      >
        {dyn.v1.addWrapDecoy("product-page-container", (
          // Keep page content aligned with the header by using the shared omnizon container padding.
          <div className="omnizon-container py-8">
            {dyn.v1.addWrapDecoy("product-page-content", (
              <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
                {dyn.v1.addWrapDecoy("product-page-left", (
                  <div className="space-y-6">
                    {dyn.v1.addWrapDecoy("product-gallery", (
                      <BlurCard 
                        id={dyn.v3.getVariant("product-gallery", ID_VARIANTS_MAP)}
                        className={dyn.v3.getVariant("card", CLASS_VARIANTS_MAP, "p-6")}
                      >
                        {dyn.v1.addWrapDecoy("product-gallery-content", (
                          <div className="grid gap-4 lg:grid-cols-[90px,1fr]">
                            {dyn.v1.addWrapDecoy("product-thumbnails", (
                              <div className="flex gap-3 overflow-x-auto lg:flex-col lg:overflow-y-auto">
                                {galleryImages.map((src, index) => (
                                  dyn.v1.addWrapDecoy(`product-thumbnail-${index}`, (
                                    <button
                                      key={src}
                                      type="button"
                                      onClick={() => setActiveImage(index)}
                                      id={dyn.v3.getVariant("product-image", ID_VARIANTS_MAP, `thumbnail-${index}`)}
                                      className={`relative h-20 w-20 rounded-2xl border-2 p-1 transition ${
                                        index === activeImage
                                          ? "border-slate-900"
                                          : "border-transparent opacity-60 hover:opacity-100"
                                      }`}
                                    >
                                      <SafeImage
                                        src={src}
                                        alt={`${product.title} thumbnail ${index + 1}`}
                                        fill
                                        sizes="80px"
                                        className="rounded-xl object-contain"
                                        fallbackSrc={fallbackImage}
                                      />
                                    </button>
                                  ), index.toString())
                                ))}
                              </div>
                            ))}
                            {dyn.v1.addWrapDecoy("product-main-image", (
                              <div className="relative aspect-square rounded-[32px] border border-white/50 bg-white">
                                <SafeImage
                                  src={galleryImages[activeImage] ?? product.image}
                                  alt={product.title}
                                  fill
                                  sizes="(max-width: 768px) 100vw, 600px"
                                  className="object-contain p-6"
                                  fallbackSrc={fallbackImage}
                                />
                              </div>
                            ))}
                          </div>
                        ))}
                      </BlurCard>
                    ))}

                    {dyn.v1.addWrapDecoy("product-info-card", (
                      <BlurCard 
                        id={dyn.v3.getVariant("product-info", ID_VARIANTS_MAP)}
                        className={dyn.v3.getVariant("card", CLASS_VARIANTS_MAP, "space-y-5 p-6")}
                      >
                        {dyn.v1.addWrapDecoy("product-title-section", (
                          <div className="space-y-2">
                            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                              {t("visit", "Visit")} {product.brand} {t("store", "Store")}
                            </p>
                            <h1 className="text-3xl font-semibold text-slate-900">
                              {product.title}
                            </h1>
                          </div>
                        ))}
                        {dyn.v1.addWrapDecoy("product-actions", (
                          <div className="flex flex-wrap gap-3">
                            {dyn.v1.addWrapDecoy("product-share-btn", (
                              <button
                                type="button"
                                onClick={handleShareProduct}
                                id={dyn.v3.getVariant("share-button", ID_VARIANTS_MAP)}
                                className={dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400")}
                              >
                                <Share2 className="h-4 w-4" />
                                <span>
                                  {shareStatus === "shared"
                                    ? t("share_success", "Shared")
                                    : shareStatus === "copied"
                                    ? t("link_copied", "Link copied")
                                    : t("share_product", "Share product")}
                                </span>
                              </button>
                            ))}
                            {dyn.v1.addWrapDecoy("product-wishlist-btn", (
                              <button
                                type="button"
                                onClick={handleWishlistToggle}
                                id={dyn.v3.getVariant("wishlist-button", ID_VARIANTS_MAP)}
                                className={dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400")}
                              >
                                <Heart
                                  className={`h-4 w-4 ${
                                    wishlistAdded ? "text-red-500 fill-red-100" : ""
                                  }`}
                                />
                                <span>
                                  {wishlistAdded
                                    ? t("in_wishlist", "In wishlist")
                                    : t("add_to_wishlist", "Add to wishlist")}
                                </span>
                              </button>
                            ))}
                          </div>
                        ))}
                        {dyn.v1.addWrapDecoy("product-price-rating", (
                          <div className="flex flex-wrap items-center gap-4">
                            {renderStars(rating, product.reviews)}
                            <span className="text-2xl font-semibold text-slate-900">
                              {formattedPrice}
                            </span>
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-emerald-700">
                              {t("in_stock", "In stock")}
                            </span>
                          </div>
                        ))}
                        <div className="space-y-4 text-sm text-slate-600">
                          {product.description && renderDescription(product.description)}
                        </div>
                        {orderedSpecEntries.length > 0 && (
                          dyn.v1.addWrapDecoy("product-specs", (
                            <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-600">
                              {orderedSpecEntries.map((entry) => (
                                dyn.v1.addWrapDecoy(`product-spec-${entry.label}`, (
                                  <div
                                    key={`${entry.label}-${entry.value}`}
                                    className="flex items-center justify-between gap-4"
                                  >
                                    <span className="text-slate-500">{entry.label}</span>
                                    <span className="font-semibold text-slate-900">
                                      {entry.value}
                                    </span>
                                  </div>
                                ), entry.label)
                              ))}
                            </div>
                          ))
                        )}
                      </BlurCard>
                    ))}

                    {dyn.v1.addWrapDecoy("product-highlights", (
                      <BlurCard 
                        id={dyn.v3.getVariant("product-highlights", ID_VARIANTS_MAP)}
                        className={dyn.v3.getVariant("card", CLASS_VARIANTS_MAP, "space-y-4 p-6")}
                      >
                        <h3 className="text-lg font-semibold text-slate-900">
                          {t("why_shoppers_love", "Why shoppers love it")}
                        </h3>
                        <ul className="space-y-2 text-sm text-slate-600">
                          {orderedHighlightBullets.map((point) => (
                            dyn.v1.addWrapDecoy(`product-highlight-${point.substring(0, 10)}`, (
                              <li key={`${point}-${product?.id ?? "detail"}`} className="flex gap-2">
                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-900" />
                                {point}
                              </li>
                            ), point)
                          ))}
                        </ul>
                      </BlurCard>
                    ))}
                  </div>
                ))}

                {dyn.v1.addWrapDecoy("product-page-right", (
                  <div className="space-y-6">
                    {dyn.v1.addWrapDecoy("product-purchase-card", (
                      <BlurCard 
                        id={dyn.v3.getVariant("product-purchase", ID_VARIANTS_MAP)}
                        className={dyn.v3.getVariant("card", CLASS_VARIANTS_MAP, "space-y-4 p-6")}
                      >
                        {dyn.v1.addWrapDecoy("product-purchase-header", (
                          <div className="flex items-center justify-between text-xs uppercase tracking-[0.4em] text-slate-400">
                            <span>{t("buy_new", "Buy new")}</span>
                            <span>
                              {t("deliver_to", "Deliver to")} {DELIVERY_ADDRESS}
                            </span>
                          </div>
                        ))}
                        <div className="text-3xl font-semibold text-slate-900">
                          {product.price}
                        </div>
                        <p className="text-sm text-slate-600">
                          {t("free_delivery_label", "Free delivery")}{" "}
                          <strong>{deliveryDate}</strong> —{" "}
                          {t("courier_partners", "Autozone courier partners")}
                        </p>
                        {layouts[order].map((elementKey) => (
                          <div key={elementKey}>{actionMap[elementKey]}</div>
                        ))}
                        {dyn.v1.addWrapDecoy("product-purchase-details", (
                          <dl className="grid gap-2 text-xs text-slate-500">
                            <div className="flex justify-between">
                              <dt>{t("ships_from", "Ships from")}</dt>
                              <dd className="text-slate-900">
                                {t("autozone_fulfillment", "Autozone Fulfillment")}
                              </dd>
                            </div>
                            <div className="flex justify-between">
                              <dt>{t("sold_by", "Sold by")}</dt>
                              <dd className="text-slate-900">
                                {product.brand || t("verified_partner", "Verified Partner")}
                              </dd>
                            </div>
                            <div className="flex justify-between">
                              <dt>{t("returns", "Returns")}</dt>
                              <dd className="text-slate-900">
                                {t("returns_policy", "30-day refund policy")}
                              </dd>
                            </div>
                            <div className="flex justify-between">
                              <dt>{t("payment", "Payment")}</dt>
                              <dd className="text-slate-900">
                                {t("secure_transaction", "Secure transaction")}
                              </dd>
                            </div>
                          </dl>
                        ))}
                      </BlurCard>
                    ))}

                    {dyn.v1.addWrapDecoy("product-shipping-card", (
                      <BlurCard 
                        id={dyn.v3.getVariant("product-shipping", ID_VARIANTS_MAP)}
                        className={dyn.v3.getVariant("card", CLASS_VARIANTS_MAP, "space-y-4 p-6")} 
                        data-variant="muted"
                      >
                        {dyn.v1.addWrapDecoy("product-shipping-header", (
                          <div className="flex items-center justify-between text-xs uppercase tracking-[0.4em] text-slate-400">
                            <span>{t("shipping_options", "Shipping options")}</span>
                            {dyn.v1.addWrapDecoy("product-shipping-toggle", (
                              <button
                                type="button"
                                onClick={handleExploreToggle}
                                id={dyn.v3.getVariant("toggle-button", ID_VARIANTS_MAP)}
                                className={dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600")}
                              >
                                {isExploreOpen ? (
                                  <ChevronUp className="h-3 w-3" />
                                ) : (
                                  <ChevronDown className="h-3 w-3" />
                                )}
                                {isExploreOpen
                                  ? t("collapse", "Collapse")
                                  : t("expand", "Expand")}
                              </button>
                            ))}
                          </div>
                        ))}
                        <p className="text-sm text-slate-600">
                          {t("deliver_to", "Deliver to")} {DELIVERY_ADDRESS}
                        </p>
                        {isExploreOpen && (
                          <ul className="space-y-2 text-sm text-slate-600">
                            <li>
                              •{" "}
                              {t(
                                "shipping_bullet_1",
                                "Choose standard, expedited, or same-day when available."
                              )}
                            </li>
                            <li>
                              •{" "}
                              {t(
                                "shipping_bullet_2",
                                "Free returns within 30 days on most items."
                              )}
                            </li>
                            <li>
                              •{" "}
                              {t(
                                "shipping_bullet_3",
                                "Bundle matching accessories for automatic discounts."
                              )}
                            </li>
                          </ul>
                        )}
                        {dyn.v1.addWrapDecoy("product-gift-receipt", (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <input
                              type="checkbox"
                              className="rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                              id={dyn.v3.getVariant("gift-receipt-checkbox", ID_VARIANTS_MAP, "gift-receipt")}
                            />
                            <label htmlFor={dyn.v3.getVariant("gift-receipt-checkbox", ID_VARIANTS_MAP, "gift-receipt")}>
                              {t("add_gift_receipt", "Add gift receipt")}
                            </label>
                          </div>
                        ))}
                        {addedToCart && (
                          <div className="rounded-full bg-emerald-100 px-4 py-2 text-center text-sm font-semibold text-emerald-700">
                            ✓ {t("added", "Added")}
                          </div>
                        )}
                      </BlurCard>
                    ))}
                  </div>
                ))}
              </div>
            ))}

            {product.description && (
              dyn.v1.addWrapDecoy("product-details-section", (
                <section className="mt-16 space-y-6">
                  <SectionHeading
                    eyebrow={t("about_this_item", "About this item")}
                    title={t("product_details", "Product details")}
                    description={t(
                      "product_details_description",
                      "What shoppers and our product team call out before you add it to cart."
                    )}
                  />
                  {dyn.v1.addWrapDecoy("product-details-card", (
                    <BlurCard 
                      id={dyn.v3.getVariant("product-details", ID_VARIANTS_MAP)}
                      className={dyn.v3.getVariant("card", CLASS_VARIANTS_MAP, "p-6")}
                    >
                      <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
                        {product.description
                          .split("\n\n")
                          .map((paragraph: string, idx: number) => (
                            <li key={`bullet-${paragraph.substring(0, 10)}-${idx}`}>
                              {paragraph}
                            </li>
                          ))}
                      </ul>
                    </BlurCard>
                  ))}
                </section>
              ))
            )}
          </div>
        ))}
      </main>
    ))
  );
}

export default function ProductPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-100 flex items-center justify-center">Loading product...</div>}>
      <ProductContent />
    </Suspense>
  );
}
