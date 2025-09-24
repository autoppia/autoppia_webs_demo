"use client";

import { useEffect } from "react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";
import { logEvent, EVENT_TYPES } from "@/library/events";

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
              Shopping Cart
            </h1>
            {items.length > 0 && (
              <div className="hidden md:flex items-center border-b border-gray-200 pb-2 font-medium text-gray-700">
                <div className="flex-1">Product</div>
                <div className="w-32 text-center">Quantity</div>
                <div className="w-32 text-right">Price</div>
                <div className="w-32 text-right">Total</div>
              </div>
            )}

            {/* Cart Items or Empty */}
            <div className="my-8">
              {items.length === 0 ? (
                <div className="text-center p-8 text-lg text-gray-500">
                  <p className="mb-2">Your Autozon Cart is empty</p>
                  <p className="mb-4 text-base text-gray-400">
                    Your shopping cart is waiting. Give it purpose – fill it
                    with groceries, clothing, household supplies, electronics,
                    and more.
                  </p>
                  <Link href="/">
                    <Button className="bg-amazon-yellow hover:bg-amazon-darkYellow text-black font-semibold">
                      Continue Shopping
                    </Button>
                  </Link>
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
                        <div className="w-24 h-24 flex-shrink-0 flex items-center justify-center bg-gray-50 rounded">
                          <Image
                            src={item.image}
                            alt={item.title}
                            width={80}
                            height={80}
                            className="object-contain max-h-20 max-w-20"
                          />
                        </div>
                        {/* Product Details */}
                        <div className="flex-1 flex flex-col justify-between">
                          <Link
                            href={`/${item.id}`}
                            className="text-base font-medium hover:text-blue-600"
                          >
                            {item.title}
                          </Link>
                          <div className="text-xs text-gray-500 mt-1">
                            {item.brand && `Brand: ${item.brand}`}
                            {item.color && `, Color: ${item.color}`}
                          </div>
                          <div className="text-green-600 text-sm mt-1">
                            In Stock
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-xs text-blue-500 hover:text-blue-700 hover:underline mt-2 flex items-center w-fit"
                          >
                            <X size={12} className="mr-1" /> Remove
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
                  Subtotal ({totalItems} items):
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
              Subtotal (<span>{totalItems}</span> items):
              <span className="font-bold ml-1">${totalAmount.toFixed(2)}</span>
            </div>
            {items.length > 0 && (
              <>
                <div className="text-green-700 text-sm mb-2">
                  Your order qualifies for{" "}
                  <span className="font-semibold">FREE Delivery</span>
                </div>
                <div className="flex items-center mb-2">
                  <input type="checkbox" className="rounded mr-2" id="gift" />
                  <label htmlFor="gift" className="text-sm">
                    This order contains a gift
                  </label>
                </div>
                <Link href="/checkout">
                  <Button
                    className={`w-full font-semibold py-5 text-lg bg-amazon-yellow hover:bg-amazon-darkYellow text-white rounded-md ${getTopMarginClass()}`}
                    onClick={handleProceedToCheckout}
                  >
                    Proceed to checkout
                  </Button>
                </Link>
              </>
            )}
            {items.length === 0 && (
              <Button
                className={`w-full font-semibold py-5 text-lg bg-amazon-yellow hover:bg-amazon-darkYellow text-white rounded-md ${getTopMarginClass()}`}
                disabled
                onClick={handleProceedToCheckout}
              >
                Proceed to checkout
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
