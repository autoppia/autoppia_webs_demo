"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Star, Share2, Heart, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Product, useCart } from "@/context/CartContext";
import { BlurCard } from "@/components/ui/BlurCard";
import { SectionHeading } from "@/components/ui/SectionHeading";

import { useV3Attributes } from "@/dynamic/v3-dynamic";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { Suspense } from "react";
import { getProductById } from "@/dynamic/v2-data";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { useSeed } from "@/context/SeedContext";
import {
  isInWishlist,
  toggleWishlistItem,
} from "@/library/wishlist";


// Static date to avoid hydration mismatch
const DELIVERY_DATE = "Sunday, October 13";
const DELIVERY_ADDRESS = "Daly City 94016";

function ProductContent() {
  const router = useSeedRouter();
  const { productId } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { getText, getId } = useV3Attributes();
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
    const separator = product.image.includes("?") ? "&" : "?";
    const variants = [
      product.image,
      `${product.image}${separator}angle=left`,
      `${product.image}${separator}angle=detail`,
      `${product.image}${separator}angle=packaging`,
    ];
    return Array.from(new Set(variants));
  }, [product?.image]);

  useEffect(() => {
    setActiveImage(0);
  }, [product?.id]);

  const specEntries = useMemo(
    () =>
      [
        { label: getText("brand"), value: product?.brand },
        { label: getText("color"), value: product?.color },
        { label: getText("size"), value: product?.size },
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
          label: getText("category", "Category"),
          value: product?.category,
        },
        {
          label: getText("care_instructions", "Care instructions"),
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
      getText,
    ]
  );

  const highlightBullets = useMemo(() => {
    if (!product?.description) {
      return [
        "Designed for multi-location deployment teams.",
        "Pairs with Autozone install scheduling.",
        "Eligible for carbon-neutral routing offsets.",
      ];
    }
    return product.description.split("\n\n").slice(0, 4);
  }, [product?.description]);

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
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <label
        htmlFor={getId("quantity_select")}
        className="mb-1 block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400"
      >
        {getText("quantity")}
      </label>
      <select
        id={getId("quantity_select")}
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 focus:border-slate-400 focus:outline-none"
        value={quantity}
        onChange={(e) => {
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
  );

  const addToCartButton = (
    <Button
      id={getId("add_to_cart_button")}
      className="mt-1 w-full rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-elevated hover:bg-slate-800"
      onClick={() => {
        handleAddToCart();
        router.push("/cart");
      }}
    >
      {getText("add_to_cart")}
    </Button>
  );

  const buyNowButton = (
    <Button
      id={getId("buy_now_button")}
      className="w-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:from-indigo-600 hover:to-sky-600"
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
      {getText("buy_now")}
    </Button>
  );

  // Predefined orders
  const layouts = [
    [quantityInput, addToCartButton, buyNowButton],
    [buyNowButton, quantityInput, addToCartButton],
    [addToCartButton, buyNowButton, quantityInput],
  ];

  const handleAddToCart = () => {
    if (!product) return;
    Array.from({ length: quantity }).forEach(() => addToCart(product));
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
      <p key={`para-${paragraph.substring(0, 10)}-${idx}`} className="mb-4">
        {paragraph}
      </p>
    ));
  };

  const renderStars = (rating: number) => {
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
                ? "text-amazon-darkYellow fill-amazon-darkYellow"
                : i === fullStars && hasHalfStar
                ? "text-amazon-darkYellow fill-amazon-darkYellow"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-blue-600">{rating} {getText("ratings")}</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="mt-4">{getText("loading_product")}...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{getText("product_not_found")}</h1>
          <p className="mt-4">
            The product you are looking for does not exist or has been removed.
          </p>
          <Button className="mt-4" onClick={() => router.push("/")}>
            {getText("return_to_home")}
          </Button>
        </div>
      </div>
    );
  }

  const formattedPrice = product.price || "$0.00";
  const rating = product.rating || 0;

  return (
    <main
      className="bg-gradient-to-b from-white via-slate-50 to-white"
      suppressHydrationWarning
    >
      <div className="omnizon-container px-2 py-8 md:px-4">
        <div className="grid gap-10 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="space-y-8">
            <BlurCard className="p-6">
              <div className="grid gap-4 lg:grid-cols-[90px,1fr]">
                <div className="flex gap-3 overflow-x-auto lg:flex-col lg:overflow-y-auto">
                  {galleryImages.map((src, index) => (
                    <button
                      key={`${src}-${index}`}
                      type="button"
                      onClick={() => setActiveImage(index)}
                      className={`relative h-20 w-20 rounded-2xl border-2 p-1 transition ${
                        index === activeImage
                          ? "border-slate-900"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={src}
                        alt={`${product.title} thumbnail ${index + 1}`}
                        fill
                        sizes="80px"
                        className="rounded-xl object-contain"
                      />
                    </button>
                  ))}
                </div>
                <div className="relative aspect-square rounded-[32px] border border-white/50 bg-white">
                  <Image
                    src={galleryImages[activeImage] ?? product.image}
                    alt={product.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 600px"
                    className="object-contain p-6"
                  />
                </div>
              </div>
            </BlurCard>

            <BlurCard className="space-y-4 p-6">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                  {getText("visit_store")} {product.brand} {getText("store")}
                </p>
                <h1 className="text-3xl font-semibold text-slate-900">
                  {product.title}
                </h1>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleShareProduct}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400"
                >
                  <Share2 className="h-4 w-4" />
                  <span>
                    {shareStatus === "shared"
                      ? getText("share_success") || "Shared"
                      : shareStatus === "copied"
                      ? getText("link_copied") || "Link copied"
                      : "Share product"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleWishlistToggle}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400"
                >
                  <Heart
                    className={`h-4 w-4 ${
                      wishlistAdded ? "text-red-500 fill-red-100" : ""
                    }`}
                  />
                  <span>{wishlistAdded ? "In wishlist" : "Add to wishlist"}</span>
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                {renderStars(rating)}
                <span className="text-2xl font-semibold text-slate-900">
                  {formattedPrice}
                </span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-emerald-700">
                  {getText("in_stock")}
                </span>
              </div>
              <div className="space-y-3 text-sm text-slate-600">
                {product.description && renderDescription(product.description)}
              </div>
              {specEntries.length > 0 && (
                <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-600">
                  {specEntries.map((entry) => (
                    <div
                      key={`${entry.label}-${entry.value}`}
                      className="flex items-center justify-between gap-4"
                    >
                      <span className="text-slate-500">{entry.label}</span>
                      <span className="font-semibold text-slate-900">
                        {entry.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </BlurCard>

            <BlurCard className="space-y-3 p-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Why ops teams pick it
              </h3>
              <ul className="space-y-2 text-sm text-slate-600">
                {highlightBullets.map((point, idx) => (
                  <li key={`${point}-${idx}`} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-900" />
                    {point}
                  </li>
                ))}
              </ul>
            </BlurCard>
          </div>

          <div className="space-y-6">
            <BlurCard className="space-y-4 p-6">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.4em] text-slate-400">
                <span>{getText("buy_new")}</span>
                <span>{getText("deliver_to")} {DELIVERY_ADDRESS}</span>
              </div>
              <div className="text-3xl font-semibold text-slate-900">
                {product.price}
              </div>
              <p className="text-sm text-slate-600">
                {getText("free_delivery")} <strong>{DELIVERY_DATE}</strong> — Autozone crews available
              </p>
              {layouts[order].map((element, index) => (
                <div key={index}>{element}</div>
              ))}
              <dl className="grid gap-2 text-xs text-slate-500">
                <div className="flex justify-between">
                  <dt>{getText("ships_from")}</dt>
                  <dd className="text-slate-900">Autozone Fulfillment</dd>
                </div>
                <div className="flex justify-between">
                  <dt>{getText("sold_by")}</dt>
                  <dd className="text-slate-900">
                    {product.brand || "Verified Partner"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>{getText("returns_policy")}</dt>
                  <dd className="text-slate-900">{getText("day_refund")}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>{getText("payment")}</dt>
                  <dd className="text-slate-900">
                    {getText("secure_transaction")}
                  </dd>
                </div>
              </dl>
            </BlurCard>

            <BlurCard className="space-y-4 p-5" data-variant="muted">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.4em] text-slate-400">
                <span>Delivery intelligence</span>
                <button
                  type="button"
                  onClick={handleExploreToggle}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600"
                >
                  {isExploreOpen ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                  {getText("see_more") || "Expand"}
                </button>
              </div>
              <p className="text-sm text-slate-600">
                {getText("deliver_to")} {DELIVERY_ADDRESS}
              </p>
              {isExploreOpen && (
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>
                    {getText("white_glove_option") ||
                      "White-glove install scheduling available during checkout."}
                  </li>
                  <li>
                    {getText("carbon_offset") ||
                      "Eligible for carbon-neutral delivery credits."}
                  </li>
                  <li>
                    {getText("bundle_service") ||
                      "Bundle with counter accessories for automatic discounts."}
                  </li>
                </ul>
              )}
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                  id="gift-receipt"
                />
                <label htmlFor="gift-receipt">{getText("add_gift_receipt")}</label>
              </div>
              {addedToCart && (
                <div className="rounded-full bg-emerald-100 px-4 py-2 text-center text-sm font-semibold text-emerald-700">
                  ✓ Added to cart
                </div>
              )}
            </BlurCard>
          </div>
        </div>

        {product.description && (
          <section className="mt-16 space-y-6">
            <SectionHeading
              eyebrow={getText("about_this_item")}
              title="Deployment notes"
              description="What crews and coordinators call out when rolling this kit into the field."
            />
            <BlurCard className="p-6">
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
          </section>
        )}
      </div>
    </main>
  );
}

export default function ProductPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-100 flex items-center justify-center">Loading product...</div>}>
      <ProductContent />
    </Suspense>
  );
}
