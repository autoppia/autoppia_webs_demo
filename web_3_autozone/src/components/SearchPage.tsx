"use client";

import { useSearchParams } from "next/navigation";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import type { Product } from "@/context/CartContext";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { Button } from "@/components/ui/button";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.toLowerCase() || "";
  const { addToCart } = useCart();
  const [addedToCartId, setAddedToCartId] = useState<string | null>(null);

  const results = products.filter((p) =>
    p.title.toLowerCase().includes(query)
  );

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
        Search Results for: <span className="text-blue-600">{query}</span>
      </h2>
      {results.length === 0 && <p>No products found.</p>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {results.map((product) => (
          <div key={product.id} className="border p-3 rounded bg-white shadow-sm">
            <img
              src={product.image}
              alt={product.title}
              className="h-32 w-full object-contain mb-2"
            />
            <h3 className="text-sm font-medium">{product.title}</h3>
            <p className="text-sm text-gray-500 mb-2">{product.price}</p>
            <Button
              className="w-full bg-amazon-yellow hover:bg-amazon-darkYellow text-black text-sm font-semibold"
              onClick={() => handleAddToCart(product)}
            >
              Add to Cart
            </Button>
            {addedToCartId === product.id && (
              <p className="text-green-600 text-xs text-center mt-1">✓ Added to cart</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
