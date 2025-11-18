"use client";

import { useSearchParams } from "next/navigation";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { useCart } from "@/context/CartContext";
import { useV3Attributes } from "@/dynamic/v3-dynamic";
import { useState } from "react";
import type { Product } from "@/context/CartContext";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { Button } from "@/components/ui/button";
import { searchProducts } from "@/dynamic/v2-data";
import { withSeed } from "@/seed-system/navigation/routing-utils";

const getTopMarginClass = () => {
  const margins = ["mt-0", "mt-8", "mt-16", "mt-24", "mt-32"];
  return margins[Math.floor(Math.random() * margins.length)];
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useSeedRouter();
  const query = searchParams.get("q")?.toLowerCase() || "1";
  const { addToCart } = useCart();
  const { getText, getId } = useV3Attributes();
  const [addedToCartId, setAddedToCartId] = useState<string | null>(null);

  const results = searchProducts(query);

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

  return (
    <div className="p-4 mt-28">
      <h2 className="text-lg font-bold mb-4">
        {getText("search_results_for")}: <span className="text-blue-600">{query}</span>
      </h2>
      {results.length === 0 && <p>{getText("no_products_found")}</p>}

      {/* Add top margin to shift the whole grid block */}
      <div
        className={`grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 ${getTopMarginClass()}`}
      >
        {results.map((product, index) => (
          <a
            id={product.id}
            key={product.id}
            href={`#${product.id}`}
            title={`View ${product.title} - Product ID: ${product.id}`}
            onMouseEnter={() => {
              window.history.replaceState(null, '', `#${product.id}`);
            }}
            onMouseLeave={() => {
              window.history.replaceState(null, '', window.location.pathname);
            }}
            onClick={(e) => {
              e.preventDefault();
              logEvent(EVENT_TYPES.VIEW_DETAIL, {
                productId: product.id,
                title: product.title,
                price: product.price || "$0.00",
                rating: product.rating ?? 0,
                brand: product.brand || "Generic",
                category: product.category || "Uncategorized",
              });
              router.push(withSeed(`/${product.id}`, searchParams));
            }}
            className={`${getTopMarginClass()} block no-underline text-inherit cursor-pointer group`}
          >
            <div className="border p-3 rounded bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow relative">
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.title}
                  className="h-32 w-full object-contain mb-2"
                />
                {/* URL Display on Hover */}
                <div className="absolute bottom-2 left-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 truncate pointer-events-none">
                  /{product.id}
                </div>
              </div>
              <h3 className="text-sm font-medium">{product.title}</h3>
              <p className="text-sm text-gray-500 mb-2">{product.price}</p>
              <Button
                id={getId("add_to_cart_button")}
                className="w-full bg-amazon-yellow hover:bg-amazon-darkYellow text-black text-sm font-semibold"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(product);
                }}
              >
                {getText("add_to_cart")}
              </Button>
              {addedToCartId === product.id && (
                <p className="text-green-600 text-xs text-center mt-1">
                  ✓ {getText("add_to_cart")}
                </p>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
