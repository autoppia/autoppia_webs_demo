"use client";

import { useEffect } from "react";
import { useCart } from "@/context/CartContext";

import { useV3Attributes } from "@/dynamic/v3-dynamic";
import Link from "next/link";
import { SeedLink } from "@/components/ui/SeedLink";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { useSearchParams } from "next/navigation";
import { withSeed } from "@/utils/seedRouting";

interface CartItem {
  id: string;
  title: string;
  price: string;
  quantity: number;
  image: string;
  brand?: string;
  color?: string;
}

export function CartPageContent() {
  const { state, removeFromCart, updateQuantity } = useCart();
  const { items, totalItems, totalAmount } = state;

  const { getText, getId } = useV3Attributes();
  const searchParams = useSearchParams();
  const router = useSeedRouter();

  const handleRemoveItem = (id: string) => {
    removeFromCart?.(id);
  };

  const getTopMarginClass = () => {
    const margins = ["mt-0", "mt-8", "mt-16", "mt-24", "mt-32"];
    return margins[Math.floor(Math.random() * margins.length)];
  };
  useEffect(() => {logEvent(EVENT_TYPES.VIEW_CART, {});}, []);

  const handleUpdateQuantity = (item: CartItem, newQuantity: number) => {
    const { id, title, quantity } = item;
    if (newQuantity >= 1 && newQuantity <= 10) {
      updateQuantity?.(id, newQuantity);
      logEvent(EVENT_TYPES.QUANTITY_CHANGED, {
        product_id: item.id,
        product_name: item.title,
        price: item.price,
        brand: item.brand || "generic",
        category: "utensils",
        rating: "8.6",
        previous_quantity: item.quantity,
        new_quantity: newQuantity,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  };

  const handleProceedToCheckout = () => {
    logEvent(EVENT_TYPES.PROCEED_TO_CHECKOUT, {
      total_items: totalItems,
      total_amount: totalAmount,
      products: items.map((item) => ({
        id: item.id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        brand: item.brand,
        color: item.color,
        category: item.category,
      })),
      created_at: new Date().toISOString(),
    });
  };

  return (
    <div className="bg-[#edeff0] min-h-screen py-10 mt-16">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row gap-6">
        {/* Cart Section */}
        <div className="flex-1">
          <div className="bg-white rounded-sm shadow-sm p-7 border border-gray-200">
            <h1 className="text-2xl md:text-3xl font-semibold leading-tight mb-4">
              {getText("shopping_cart")}
            </h1>
            {items.length > 0 && (
              <div className="hidden md:flex items-center border-b border-gray-200 pb-2 font-medium text-gray-700">
                <div className="flex-1">{getText("product")}</div>
                <div className="w-32 text-center">{getText("quantity")}</div>
                <div className="w-32 text-right">{getText("price")}</div>
                <div className="w-32 text-right">{getText("total")}</div>
              </div>
            )}

            {/* Cart Items or Empty */}
            <div className="my-8">
              {items.length === 0 ? (
                <div className="text-center p-8 text-lg text-gray-500">
                  <p className="mb-2">{getText("empty_cart")}</p>
                  <p className="mb-4 text-base text-gray-400">
                    {getText("empty_cart_message")}
                  </p>
                  <SeedLink href="/">
                    <Button className="bg-amazon-yellow hover:bg-amazon-darkYellow text-black font-semibold">
                      {getText("continue_shopping")}
                    </Button>
                  </SeedLink>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {items.map((item: CartItem) => {
                    const itemPrice = Number.parseFloat(
                      item.price.replace(/[^0-9.]/g, "")
                    );
                    const itemTotal = itemPrice * item.quantity;
                    return (
                      <div
                        key={item.id}
                        className="flex flex-col md:flex-row items-center md:items-stretch gap-4 border-b border-gray-100 pb-6 last:border-b-0"
                      >
                        {/* Product Image */}
                        <div className="w-24 h-24 flex-shrink-0 flex items-center justify-center bg-gray-50 rounded relative group">
                          <Image
                            src={item.image}
                            alt={item.title}
                            width={80}
                            height={80}
                            className="object-contain max-h-20 max-w-20"
                          />
                          {/* URL Display on Hover */}
                          <div className="absolute bottom-1 left-1 right-1 bg-black/80 text-white text-xs px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 truncate pointer-events-none">
                            /{item.id}
                          </div>
                        </div>
                        {/* Product Details */}
                        <div className="flex-1 flex flex-col justify-between">
                          <a
                            href={`#${item.id}`}
                            title={`View ${item.title} - Product ID: ${item.id}`}
                            onMouseEnter={() => {
                              window.history.replaceState(null, '', `#${item.id}`);
                            }}
                            onMouseLeave={() => {
                              window.history.replaceState(null, '', window.location.pathname);
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              router.push(withSeed(`/${item.id}`, searchParams));
                            }}
                            className="text-base font-medium hover:text-blue-600 no-underline cursor-pointer"
                          >
                            {item.title}
                          </a>
                          <div className="text-xs text-gray-500 mt-1">
                            {item.brand && `${getText("brand")}: ${item.brand}`}
                            {item.color && `, ${getText("color")}: ${item.color}`}
                          </div>
                          <div className="text-green-600 text-sm mt-1">
                            {getText("in_stock")}
                          </div>
                          <button
                            id={getId("remove_button")}
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-xs text-blue-500 hover:text-blue-700 hover:underline mt-2 flex items-center w-fit"
                          >
                            <X size={12} className="mr-1" /> {getText("remove")}
                          </button>
                        </div>
                        {/* Quantity */}
                        <div className="w-full md:w-32 flex items-center justify-center md:justify-center mt-2 md:mt-0">
                          <div className="flex items-center border border-gray-300 rounded">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(item, item.quantity - 1)
                              }
                              className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-3 py-1">{item.quantity}</span>
                            <button
                              onClick={() =>
                                handleUpdateQuantity(item, item.quantity + 1)
                              }
                              className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                              disabled={item.quantity >= 10}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                        {/* Price */}
                        <div className="w-full md:w-32 text-right mt-2 md:mt-0">
                          <span className="font-medium">
                            ${itemPrice.toFixed(2)}
                          </span>
                        </div>
                        {/* Total */}
                        <div className="w-full md:w-32 text-right mt-2 md:mt-0">
                          <span className="font-medium">
                            ${itemTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="flex flex-col md:flex-row justify-end items-end py-4 text-lg">
                <span className="font-medium text-right">
                  {getText("subtotal")} ({totalItems} {getText("items")}):
                </span>
                <span className="ml-2 font-bold text-right">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>
        {/* Order Summary Side Box */}
        <div className={`w-full md:w-80 ${getTopMarginClass()}`}>
          <div className="bg-white rounded-sm shadow-sm p-7 border border-gray-200 flex flex-col gap-4">
            <div className="text-md md:text-lg text-gray-700">
              {getText("subtotal")} (<span>{totalItems}</span> {getText("items")}):
              <span className="font-bold ml-1">${totalAmount.toFixed(2)}</span>
            </div>
            {items.length > 0 && (
              <>
                <div className="text-green-700 text-sm mb-2">
                  {getText("qualifies_for_delivery")}{" "}
                  <span className="font-semibold">{getText("free_delivery")}</span>
                </div>
                <div className="flex items-center mb-2">
                  <input type="checkbox" className="rounded mr-2" id="gift" />
                  <label htmlFor="gift" className="text-sm">
                    {getText("gift_checkbox")}
                  </label>
                </div>

                <SeedLink href="/checkout">
                  <Button
                    id={getId("checkout_button")}
                    className={`w-full font-semibold py-5 text-lg bg-amazon-yellow hover:bg-amazon-darkYellow text-white rounded-md ${getTopMarginClass()}`}
                    onClick={handleProceedToCheckout}
                  >
                    {getText("proceed_to_checkout")}
                  </Button>
                </SeedLink>
              </>
            )}
            {items.length === 0 && (
              <Button
                id={getId("checkout_button")}
                className={`w-full font-semibold py-5 text-lg bg-amazon-yellow hover:bg-amazon-darkYellow text-white rounded-md ${getTopMarginClass()}`}
                disabled
                onClick={handleProceedToCheckout}
              >
                {getText("proceed_to_checkout")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
