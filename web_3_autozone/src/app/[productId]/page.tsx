"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Star, Share2, Heart, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Product, useCart } from "@/context/CartContext";

import { useV3Attributes } from "@/dynamic/v3-dynamic";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { Suspense } from "react";
import { getEffectiveSeed, getProductById } from "@/dynamic/v2-data";
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
  const [product, setProduct] = useState<any>(null);
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

  const { seed } = useSeed();
  const order = seed % 3;

  useEffect(() => {
    setIsLoading(true);

    if (typeof productId === "string") {
      const foundProduct: any = getProductById(productId);
      if (foundProduct) {
        setProduct(foundProduct);
      }
      setIsLoading(false);
    }
  }, [productId]);

  // Log view event
  useEffect(() => {
    if (product) {
      logEvent(EVENT_TYPES.VIEW_DETAIL, {
        productId: product.id,
        title: product.title,
        price: product.price,
        category: product.category,
        brand: product.brand,
        rating: product.rating,
      });
    }
  }, [product]);

  useEffect(() => {
    if (product?.id) {
      setWishlistAdded(isInWishlist(product.id));
    }
  }, [product?.id]);

  const handleShareProduct = async () => {
    if (!product) return;
    const shareUrl =
      typeof window !== "undefined" ? window.location.href : product.id;

    logEvent(EVENT_TYPES.SHARE_PRODUCT, {
      productId: product.id,
      title: product.title,
      price: product.price,
      category: product.category,
      brand: product.brand,
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
    if (!product) return;
    const { added } = toggleWishlistItem({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      category: product.category,
      brand: product.brand,
    });
    setWishlistAdded(added);
    logEvent(EVENT_TYPES.ADD_TO_WISHLIST, {
      productId: product.id,
      title: product.title,
      price: product.price,
      category: product.category,
      brand: product.brand,
      action: added ? "added" : "removed",
    });
  };

  const handleExploreToggle = () => {
    if (!product) return;
    const next = !isExploreOpen;
    setIsExploreOpen(next);
    logEvent(EVENT_TYPES.VIEW_MORE_DETAILS, {
      productId: product.id,
      title: product.title,
      section: "explore_further",
      expanded: next,
    });
  };

  const quantityInput = (
    <>
      <label htmlFor={getId("quantity_select")} className="mt-2 mb-1 block text-[15px]">
        {getText("quantity")}:
      </label>
      <select
        id={getId("quantity_select")}
        className="border border-[#D5D9D9] rounded-[4px] px-2 py-1 text-[15px] w-full mb-3"
        value={quantity}
        onChange={(e) => {
          const newQty = Number.parseInt(e.target.value);
          setQuantity(newQty);
          logEvent(EVENT_TYPES.QUANTITY_CHANGED, {
            product_id: product.id,
            product_name: product.title,
            previous_quantity: quantity,
            new_quantity: newQty,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            price: product.price,
            category: product.category,
            brand: product.brand,
            rating: product.rating,
          });
        }}
        style={{ maxWidth: "170px" }}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </>
  );

  const addToCartButton = (
    <Button
      id={getId("add_to_cart_button")}
      className="block w-full bg-[#17A2B8] hover:bg-[#1E90FF] text-white font-semibold rounded-[20px] py-2 mt-1 mb-2 text-base border border-[#FCD200] shadow"
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
      className="block w-full bg-[#FFA41C] hover:bg-[#f08804] text-white font-semibold rounded-[20px] text-base py-2 mb-2 border border-[#FFA41C]"
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
      className="container mx-auto px-2 md:px-4 py-6 bg-white"
      suppressHydrationWarning
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Product Image */}
        <div className="md:col-span-1">
          <div className="relative h-80 w-full bg-gray-100 mb-4">
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          <div className="flex space-x-2 mt-2 overflow-x-auto">
            <div className="border-2 border-gray-300 hover:border-gray-800 cursor-pointer w-16 h-16 relative flex-shrink-0">
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-contain p-1"
                unoptimized
              />
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="md:col-span-1">
          <h1 className="text-xl md:text-2xl font-medium mb-2">
            {product.title}
          </h1>
          <div className="text-sm text-blue-600 mb-2">
            {getText("visit_store")} {product.brand} {getText("store")}
          </div>

          <div className="flex flex-wrap gap-3 mb-4">
            <button
              type="button"
              onClick={handleShareProduct}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-400"
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
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-400"
            >
              <Heart
                className={`h-4 w-4 ${
                  wishlistAdded ? "text-red-500 fill-red-100" : ""
                }`}
              />
              <span>{wishlistAdded ? "In wishlist" : "Add to wishlist"}</span>
            </button>
          </div>

          <div className="mb-4">{renderStars(rating)}</div>

          <div className="border-t border-b border-gray-200 py-2 mb-4">
            <div className="flex items-center">
              <span className="text-xl font-bold">{formattedPrice}</span>
            </div>
          </div>

          <div className="mb-4 text-sm">
            {product.description && renderDescription(product.description)}
          </div>

          {/* Product Specifications */}
          <table className="min-w-full text-sm mb-4">
            <tbody>
              <tr>
                <td className="py-1 font-medium text-gray-500 pr-4">{getText("brand")}</td>
                <td className="py-1">{product.brand}</td>
              </tr>
              {product.color && (
                <tr>
                  <td className="py-1 font-medium text-gray-500 pr-4">{getText("color")}</td>
                  <td className="py-1">{product.color}</td>
                </tr>
              )}
              {product.size && (
                <tr>
                  <td className="py-1 font-medium text-gray-500 pr-4">{getText("size")}</td>
                  <td className="py-1">{product.size}</td>
                </tr>
              )}
              {product.dimensions?.depth && (
                <tr>
                  <td className="py-1 font-medium text-gray-500 pr-4">
                    Item Depth
                  </td>
                  <td className="py-1">{product.dimensions.depth}</td>
                </tr>
              )}
              {product.dimensions?.length && (
                <tr>
                  <td className="py-1 font-medium text-gray-500 pr-4">
                    Item dimensions L x W x H
                  </td>
                  <td className="py-1">{product.dimensions.length}</td>
                </tr>
              )}
              {product.careInstructions && (
                <tr>
                  <td className="py-1 font-medium text-gray-500 pr-4">
                    Product Care Instructions
                  </td>
                  <td className="py-1">{product.careInstructions}</td>
                </tr>
              )}
              <tr>
                <td className="py-1 font-medium text-gray-500 pr-4">
                  Category
                </td>
                <td className="py-1">{product.category}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Buy Box Right (Sticky on desktop, full-width mobile) */}
        <div className="md:col-span-1 w-full">
          <aside className="border border-[#D5D9D9] bg-white rounded-lg shadow-sm p-4 md:sticky md:top-20 min-w-[275px] max-w-xs mx-auto md:mx-0 text-[15px]">
            <div className="mb-2 flex items-center">
              <span className="text-xs font-bold mr-2">{getText("buy_new")}:</span>
              <span className="ml-auto">
                <input type="radio" checked readOnly aria-label="selected" />
              </span>
            </div>
            <div className="text-[28px] font-bold tracking-tight leading-snug mb-2 mt-0">
              {product.price}
            </div>
            <div className="leading-snug text-sm mb-1">
              <span className="text-[#007185] leading-tight font-medium">
                {getText("free_delivery")} <b>{DELIVERY_DATE}</b>
              </span>
              <span className="block text-[13px] mt-1 mb-0">
                on orders shipped by Autozon over $35
              </span>
            </div>
            <div className="flex items-center leading-tight gap-1 mt-1 mb-2 text-sm text-[#111]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="inline-block"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#666"
                strokeWidth="2"
              >
                <circle cx="12" cy="10" r="8" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{getText("deliver_to")} {DELIVERY_ADDRESS}</span>
            </div>
            <div className="text-[#007600] font-semibold my-1 text-base">
              {getText("in_stock")}
            </div>
            {layouts[order].map((element, index) => (
              <div key={index}>{element}</div>
            ))}

            <dl className="text-xs text-gray-700 mb-2 mt-2 leading-5 border-t border-b py-3 border-[#D5D9D9]">
              <div className="flex items-center py-0.5">
                <dt className="w-20 font-normal">{getText("ships_from")}</dt>
                <dd className="flex-1 pl-1 font-normal">
                  Autozon Fulfillment
                </dd>
              </div>
              <div className="flex items-center py-0.5">
                <dt className="w-20 font-normal">{getText("sold_by")}</dt>
                <dd className="flex-1 pl-1">
                  <span className="text-[#007185] hover:underline cursor-pointer">
                    {product.brand || "Verified Partner"}
                  </span>
                </dd>
              </div>
              <div className="flex items-center py-0.5">
                <dt className="w-20 font-normal">{getText("returns_policy")}</dt>
                <dd className="flex-1 pl-1">
                  <span className="text-[#007185] hover:underline cursor-pointer">
                    {getText("day_refund")}
                  </span>
                </dd>
              </div>
              <div className="flex items-center py-0.5">
                <dt className="w-20 font-normal">{getText("payment")}</dt>
                <dd className="flex-1 pl-1">
                  <span className="text-[#007185] underline">
                    {getText("secure_transaction")}
                  </span>
                </dd>
              </div>
            </dl>
            <div className="mb-2">
              <button
                type="button"
                onClick={handleExploreToggle}
                aria-expanded={isExploreOpen}
                className="text-xs text-[#007185] flex items-center gap-1"
              >
                {isExploreOpen ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
                {getText("see_more") || "Explore further"}
              </button>
              {isExploreOpen && (
                <ul className="mt-2 space-y-1 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                  <li className="flex gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#007185] mt-1.5" />
                    {getText("white_glove_option") ||
                      "White-glove install scheduling available during checkout."}
                  </li>
                  <li className="flex gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#007185] mt-1.5" />
                    {getText("carbon_offset") ||
                      "Eligible for carbon-neutral delivery credits."}
                  </li>
                  <li className="flex gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#007185] mt-1.5" />
                    {getText("bundle_service") ||
                      "Bundle with counter accessories for automatic discounts."}
                  </li>
                </ul>
              )}
            </div>
            <div className="flex items-center text-sm mb-2 mt-1">
              <input
                type="checkbox"
                className="mr-2 accent-[#017185]"
                id="gift-receipt"
              />
              <label htmlFor="gift-receipt" className="text-xs">
                {getText("add_gift_receipt")}
              </label>
            </div>
            <div className="border-t border-[#D5D9D9] pt-3 mt-4">
              <div className="flex items-center mb-2 gap-2">
                <input type="radio" id="used-like-new" name="used-new-switch" />
                <label
                  htmlFor="used-like-new"
                  className="text-[13px] text-[#111] font-semibold"
                >
                  {getText("save_with_used")}:
                </label>
              </div>
              <div className="mb-1 text-xl font-bold">$10.49</div>
              <div className="mb-1 text-sm">
                <span className="text-[#007185] font-medium">
                  {getText("free_delivery")} <b>{DELIVERY_DATE}</b>
                </span>
                <br />
                <span className="text-[13px]">
                  on orders shipped by Autozon over $35
                </span>
              </div>
              <div className="text-xs mt-1">
                {getText("ships_from")}{" "}
                <span className="text-[#007185]">
                  {product.brand || "Verified Partner"}
                </span>
              </div>
            </div>
            {addedToCart && (
              <div className="mt-3 p-2 bg-green-100 text-green-800 rounded text-center text-sm">
                ✓ Added to cart
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* About This Item section */}
      {product.description && (
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h2 className="text-xl font-bold mb-4">{getText("about_this_item")}</h2>
          <div className="pl-5 text-sm">
            <ul className="list-disc space-y-2">
              {product.description.split("\n\n").map((paragraph: string, idx: number) => (
                <li
                  key={`bullet-${paragraph.substring(0, 10)}-${idx}`}
                  className="mb-2"
                >
                  {paragraph}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
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
