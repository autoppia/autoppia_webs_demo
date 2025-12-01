"use client";

import { useEffect } from "react";
import { useCart } from "@/context/CartContext";

import { useV3Attributes } from "@/dynamic/v3-dynamic";
import { SeedLink } from "@/components/ui/SeedLink";
import { BlurCard } from "@/components/ui/BlurCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SafeImage } from "@/components/ui/SafeImage";
import { BadgeCheck, Minus, Plus, ShieldCheck, Truck, X } from "lucide-react";
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

  const { getText, getId } = useV3Attributes();
  const router = useSeedRouter();

  const toSentenceCase = (value: string | undefined, fallback: string) => {
    const base = (value || fallback).trim();
    return base ? base.charAt(0).toUpperCase() + base.slice(1) : fallback;
  };

  const toUpperLabel = (value: string | undefined, fallback: string) => {
    const base = value || fallback;
    return base.toUpperCase();
  };

  const cartEyebrow = toUpperLabel(
    getText("cart_overview"),
    "Cart overview"
  );
  const cartTitle = toSentenceCase(getText("shopping_cart"), "Shopping cart");
  const emptyCartTitle = toSentenceCase(getText("empty_cart"), "Your cart is empty");
  const emptyCartMessage = toSentenceCase(
    getText("empty_cart_message"),
    "Add items to see them here"
  );
  const continueShoppingLabel = toSentenceCase(
    getText("continue_shopping"),
    "Continue shopping"
  );
  const inStockLabel = toSentenceCase(getText("in_stock"), "In stock");
  const totalLabel = toSentenceCase(getText("total"), "Total");
  const subtotalLabel = toSentenceCase(getText("subtotal"), "Subtotal");
  const itemsLabel = toSentenceCase(getText("items"), "items");
  const orderTotalLabel = toSentenceCase(getText("order_total"), "Order total");
  const promoLabel = toUpperLabel(getText("promo_code"), "Promo code");

  const handleRemoveItem = (id: string) => {
    removeFromCart?.(id);
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
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white py-12">
      <div className="omnizon-container flex flex-col gap-10 lg:flex-row">
        <div className="flex-1 space-y-6">
          <SectionHeading
            eyebrow={cartEyebrow}
            title={cartTitle}
            description="Review every item, quantity, and total before checkout."
          />
          {items.length === 0 ? (
            <BlurCard className="p-10 text-center md:p-12">
              <p className="text-lg font-semibold text-slate-700">
                {emptyCartTitle}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {emptyCartMessage}
              </p>
              <div className="mt-4">
                <SeedLink href="/">
                  <Button className="rounded-full bg-slate-900 px-6 py-3 text-white hover:bg-slate-800">
                    {continueShoppingLabel}
                  </Button>
                </SeedLink>
              </div>
            </BlurCard>
          ) : (
            <div className="space-y-4">
              {items.map((item: CartItem) => {
                const itemPrice = Number.parseFloat(
                  item.price.replace(/[^0-9.]/g, "")
                );
                const itemTotal = itemPrice * item.quantity;
                return (
                  <BlurCard key={item.id} className="p-5">
                    <div className="flex flex-col gap-4 md:flex-row">
                      <div className="relative h-28 w-28 flex-shrink-0 rounded-2xl border border-white/60 bg-white">
                        <SafeImage
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="120px"
                          className="object-contain p-3"
                          fallbackSrc="/images/homepage_categories/coffee_machine.jpg"
                        />
                        <button
                          type="button"
                          onClick={() => router.push(`/${item.id}`)}
                          className="absolute inset-0"
                          aria-label={`View ${item.title}`}
                        />
                      </div>
                      <div className="flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                          <button
                            type="button"
                            onClick={() => router.push(`/${item.id}`)}
                            className="text-left text-base font-semibold text-slate-900 hover:text-indigo-600"
                          >
                            {item.title}
                          </button>
                          <button
                            id={getId("remove_button")}
                            onClick={() => handleRemoveItem(item.id)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900"
                          >
                            <X size={12} />
                            {getText("remove")}
                          </button>
                        </div>
                        <p className="text-xs text-slate-500">
                          {[item.brand, item.color]
                            .filter(Boolean)
                            .join(" • ")}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <span className="font-semibold text-slate-900">
                            ${itemPrice.toFixed(2)} / unit
                          </span>
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                            {inStockLabel}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
                          <div className="inline-flex items-center rounded-full border border-slate-200 bg-white">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(item, item.quantity - 1)
                              }
                              className="rounded-l-full px-3 py-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-4 py-1 font-semibold text-slate-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleUpdateQuantity(item, item.quantity + 1)
                              }
                              className="rounded-r-full px-3 py-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                              disabled={item.quantity >= 10}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                              {totalLabel}
                            </p>
                            <p className="text-lg font-semibold text-slate-900">
                              ${itemTotal.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </BlurCard>
                );
              })}
            </div>
          )}
        </div>

        <div className="w-full lg:w-96">
          <BlurCard className="space-y-5 p-6 lg:sticky lg:top-24">
            <div className="rounded-2xl bg-gradient-to-r from-indigo-500 to-sky-500 px-4 py-3 text-white">
              <p className="text-xs uppercase tracking-[0.4em]">
                Delivery savings
              </p>
              <p className="text-sm">
                {getText("qualifies_for_delivery")}{" "}
                <span className="font-semibold">{getText("free_delivery")}</span>
              </p>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="promo"
                className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500"
              >
                {promoLabel}
              </label>
              <div className="flex gap-2">
                <Input
                  id="promo"
                  placeholder="e.g. SAVE10"
                  disabled
                  className="rounded-full border-slate-200 bg-white"
                />
                <Button
                  type="button"
                  variant="secondary"
                  className="rounded-full bg-slate-900 px-4 py-2 text-white"
                  disabled
                >
                  Apply
                </Button>
              </div>
            </div>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>
                  {subtotalLabel} ({totalItems} {itemsLabel})
                </span>
                <span className="font-semibold text-slate-900">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated taxes</span>
                <span className="font-semibold text-slate-900">
                  ${(totalAmount * 0.08).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-white/50 pt-3">
              <span className="text-sm font-semibold text-slate-600">
                {orderTotalLabel}:
              </span>
              <span className="text-2xl font-semibold text-slate-900">
                ${(totalAmount * 1.08).toFixed(2)}
              </span>
            </div>
            {items.length > 0 ? (
              <SeedLink href="/checkout">
                <Button
                  id={getId("checkout_button")}
                  className="w-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 px-6 py-4 text-lg font-semibold text-white shadow-lg"
                  onClick={handleProceedToCheckout}
                >
                  {getText("proceed_to_checkout", "Checkout")}
                </Button>
              </SeedLink>
            ) : (
              <Button
                id={getId("checkout_button")}
                className="w-full rounded-full bg-slate-200 px-6 py-4 text-lg font-semibold text-slate-500"
                disabled
                onClick={handleProceedToCheckout}
              >
                {getText("proceed_to_checkout", "Checkout")}
              </Button>
            )}
              <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Buyer protection
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Fast shipping
                </div>
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4" />
                Verified partners
              </div>
            </div>
          </BlurCard>
        </div>
      </div>
    </div>
  );
}
