"use client";

import { useEffect, useMemo } from "react";
import { useCart } from "@/context/CartContext";

import { useDynamicSystem } from "@/dynamic/shared";
import { CLASS_VARIANTS_MAP, ID_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { SeedLink } from "@/components/ui/SeedLink";
import { BlurCard } from "@/components/ui/BlurCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SafeImage } from "@/components/ui/SafeImage";
import { BadgeCheck, Minus, Plus, ShieldCheck, Truck, X } from "lucide-react";
import { logEvent, EVENT_TYPES } from "@/events";

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

  const dyn = useDynamicSystem();
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
    dyn.v3.getVariant("cart_overview", TEXT_VARIANTS_MAP, "Cart overview"),
    "Cart overview"
  );
  const cartTitle = toSentenceCase(
    dyn.v3.getVariant("shopping_cart", TEXT_VARIANTS_MAP, "Shopping cart"),
    "Shopping cart"
  );
  const emptyCartTitle = toSentenceCase(
    dyn.v3.getVariant("empty_cart", TEXT_VARIANTS_MAP, "Your cart is empty"),
    "Your cart is empty"
  );
  const emptyCartMessage = toSentenceCase(
    dyn.v3.getVariant("empty_cart_message", TEXT_VARIANTS_MAP, "Add items to see them here"),
    "Add items to see them here"
  );
  const continueShoppingLabel = toSentenceCase(
    dyn.v3.getVariant("continue_shopping", TEXT_VARIANTS_MAP, "Continue shopping"),
    "Continue shopping"
  );
  const inStockLabel = toSentenceCase(
    dyn.v3.getVariant("in_stock", TEXT_VARIANTS_MAP, "In stock"),
    "In stock"
  );
  const totalLabel = toSentenceCase(
    dyn.v3.getVariant("total", TEXT_VARIANTS_MAP, "Total"),
    "Total"
  );
  const subtotalLabel = toSentenceCase(
    dyn.v3.getVariant("subtotal", TEXT_VARIANTS_MAP, "Subtotal"),
    "Subtotal"
  );
  const itemsLabel = toSentenceCase(
    dyn.v3.getVariant("items", TEXT_VARIANTS_MAP, "items"),
    "items"
  );
  const orderTotalLabel = toSentenceCase(
    dyn.v3.getVariant("order_total", TEXT_VARIANTS_MAP, "Order total"),
    "Order total"
  );
  const promoLabel = toUpperLabel(
    dyn.v3.getVariant("promo_code", TEXT_VARIANTS_MAP, "Promo code"),
    "Promo code"
  );

  const handleRemoveItem = (id: string) => {
    removeFromCart?.(id);
  };

  useEffect(() => {
    logEvent(EVENT_TYPES.VIEW_CART, {});
  }, []);

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

  const orderedItems = useMemo(() => {
    if (!items || items.length === 0) return [];
    const order = dyn.v1.changeOrderElements("cart-items", items.length);
    return order.map((idx) => items[idx]);
  }, [dyn.v1.changeOrderElements, items]);

  return (
    <div
      id={dyn.v3.getVariant("cart-page", ID_VARIANTS_MAP, "cart-page")}
      className={dyn.v3.getVariant(
        "cart-page",
        CLASS_VARIANTS_MAP,
        "min-h-screen bg-gradient-to-b from-white via-slate-50 to-white py-12"
      )}
    >
      {dyn.v1.addWrapDecoy(
        "cart-layout",
        (
          <div className="omnizon-container space-y-8">
            {dyn.v1.addWrapDecoy(
              "cart-heading",
              (
                <SectionHeading
                  eyebrow={cartEyebrow}
                  title={cartTitle}
                  description={dyn.v3.getVariant(
                    "cart_description",
                    TEXT_VARIANTS_MAP,
                    "Review every item, quantity, and total before checkout."
                  )}
                />
              )
            )}

            {items.length === 0 ? (
              dyn.v1.addWrapDecoy(
                "cart-empty",
                (
                  <BlurCard className="mx-auto max-w-2xl p-10 text-center md:p-12">
                    <p className="text-lg font-semibold text-slate-700">
                      {emptyCartTitle}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      {emptyCartMessage}
                    </p>
                    <div className="mt-4">
                      <SeedLink href="/">
                        <Button
                          id={dyn.v3.getVariant(
                            "continue-shopping-btn",
                            ID_VARIANTS_MAP,
                            "continue-shopping"
                          )}
                          className={dyn.v3.getVariant(
                            "button-primary",
                            CLASS_VARIANTS_MAP,
                            "rounded-full bg-slate-900 px-6 py-3 text-white hover:bg-slate-800"
                          )}
                        >
                          {continueShoppingLabel}
                        </Button>
                      </SeedLink>
                    </div>
                  </BlurCard>
                )
              )
            ) : (
              <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr),24rem] lg:items-start">
                {dyn.v1.addWrapDecoy(
                  "cart-main",
                  (
                    <div className="space-y-4">
                      {orderedItems.map((item: CartItem) => {
                        const itemPrice = Number.parseFloat(
                          item.price.replace(/[^0-9.]/g, "")
                        );
                        const itemTotal = itemPrice * item.quantity;
                        return dyn.v1.addWrapDecoy(
                          `cart-item-${item.id}`,
                          (
                            <BlurCard
                              key={item.id}
                              id={dyn.v3.getVariant(
                                "cart-item-card",
                                ID_VARIANTS_MAP,
                                `cart-item-${item.id}`
                              )}
                              className={dyn.v3.getVariant(
                                "card",
                                CLASS_VARIANTS_MAP,
                                "p-5"
                              )}
                            >
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
                                    aria-label={dyn.v3.getVariant(
                                      "view_product",
                                      TEXT_VARIANTS_MAP,
                                      `View ${item.title}`
                                    )}
                                  />
                                </div>
                                <div className="flex flex-1 flex-col gap-2">
                                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                                    <button
                                      type="button"
                                      onClick={() => router.push(`/${item.id}`)}
                                      id={dyn.v3.getVariant(
                                        "product-title",
                                        ID_VARIANTS_MAP,
                                        `cart-title-${item.id}`
                                      )}
                                      className={dyn.v3.getVariant(
                                        "link",
                                        CLASS_VARIANTS_MAP,
                                        "text-left text-base font-semibold text-slate-900 hover:text-indigo-600"
                                      )}
                                    >
                                      {item.title}
                                    </button>
                                    <button
                                      id={dyn.v3.getVariant(
                                        "remove_button",
                                        ID_VARIANTS_MAP,
                                        "remove-button"
                                      )}
                                      onClick={() => handleRemoveItem(item.id)}
                                      className={dyn.v3.getVariant(
                                        "button-secondary",
                                        CLASS_VARIANTS_MAP,
                                        "inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900"
                                      )}
                                    >
                                      <X size={12} />
                                      {dyn.v3.getVariant(
                                        "remove",
                                        TEXT_VARIANTS_MAP,
                                        "Remove"
                                      )}
                                    </button>
                                  </div>
                                  <p className="text-xs text-slate-500">
                                    {[item.brand, item.color]
                                      .filter(Boolean)
                                      .join(" • ")}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-3 text-sm">
                                    <span className="font-semibold text-slate-900">
                                      ${itemPrice.toFixed(2)} /{" "}
                                      {dyn.v3.getVariant(
                                        "unit",
                                        TEXT_VARIANTS_MAP,
                                        "unit"
                                      )}
                                    </span>
                                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                      {inStockLabel}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
                                    <div className="inline-flex items-center rounded-full border border-slate-200 bg-white">
                                      <button
                                        onClick={() =>
                                          handleUpdateQuantity(
                                            item,
                                            item.quantity - 1
                                          )
                                        }
                                        id={dyn.v3.getVariant(
                                          "qty-decrease",
                                          ID_VARIANTS_MAP,
                                          `qty-decrease-${item.id}`
                                        )}
                                        className={dyn.v3.getVariant(
                                          "button-secondary",
                                          CLASS_VARIANTS_MAP,
                                          "rounded-l-full px-3 py-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                                        )}
                                        disabled={item.quantity <= 1}
                                        aria-label={dyn.v3.getVariant(
                                          "decrease_quantity",
                                          TEXT_VARIANTS_MAP,
                                          "Decrease quantity"
                                        )}
                                      >
                                        <Minus size={14} />
                                      </button>
                                      <span className="px-4 py-1 font-semibold text-slate-900">
                                        {item.quantity}
                                      </span>
                                      <button
                                        onClick={() =>
                                          handleUpdateQuantity(
                                            item,
                                            item.quantity + 1
                                          )
                                        }
                                        id={dyn.v3.getVariant(
                                          "qty-increase",
                                          ID_VARIANTS_MAP,
                                          `qty-increase-${item.id}`
                                        )}
                                        className={dyn.v3.getVariant(
                                          "button-secondary",
                                          CLASS_VARIANTS_MAP,
                                          "rounded-r-full px-3 py-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                                        )}
                                        disabled={item.quantity >= 10}
                                        aria-label={dyn.v3.getVariant(
                                          "increase_quantity",
                                          TEXT_VARIANTS_MAP,
                                          "Increase quantity"
                                        )}
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
                          ),
                          item.id
                        );
                      })}
                    </div>
                  )
                )}

                {dyn.v1.addWrapDecoy(
                  "cart-summary",
                  (
                    <div className="w-full lg:w-96">
                      <BlurCard
                        id={dyn.v3.getVariant(
                          "cart-summary",
                          ID_VARIANTS_MAP,
                          "cart-summary"
                        )}
                        className={dyn.v3.getVariant(
                          "card",
                          CLASS_VARIANTS_MAP,
                          "space-y-5 p-6 lg:sticky lg:top-24"
                        )}
                      >
                    <div className="rounded-2xl bg-gradient-to-r from-indigo-500 to-sky-500 px-4 py-3 text-white">
                      <p className="text-xs uppercase tracking-[0.4em]">
                        {dyn.v3.getVariant(
                          "delivery_savings",
                          TEXT_VARIANTS_MAP,
                          "Delivery savings"
                        )}
                      </p>
                      <p className="text-sm">
                        {dyn.v3.getVariant(
                          "qualifies_for_delivery",
                          TEXT_VARIANTS_MAP,
                          "Your order qualifies for"
                        )}{" "}
                        <span className="font-semibold">
                          {dyn.v3.getVariant(
                            "free_delivery",
                            TEXT_VARIANTS_MAP,
                            "free delivery"
                          )}
                        </span>
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
                          placeholder={dyn.v3.getVariant(
                            "promo_placeholder",
                            TEXT_VARIANTS_MAP,
                            "e.g. SAVE10"
                          )}
                          disabled
                          className="rounded-full border-slate-200 bg-white"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          className="rounded-full bg-slate-900 px-4 py-2 text-white"
                          disabled
                        >
                          {dyn.v3.getVariant("apply", TEXT_VARIANTS_MAP, "Apply")}
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
                        <span>
                          {dyn.v3.getVariant(
                            "estimated_taxes",
                            TEXT_VARIANTS_MAP,
                            "Estimated taxes"
                          )}
                        </span>
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
                          id={dyn.v3.getVariant(
                            "checkout_button",
                            ID_VARIANTS_MAP,
                            "checkout-button"
                          )}
                          className={dyn.v3.getVariant(
                            "button-primary",
                            CLASS_VARIANTS_MAP,
                            "w-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 px-6 py-4 text-lg font-semibold text-white shadow-lg"
                          )}
                          onClick={handleProceedToCheckout}
                        >
                          {dyn.v3.getVariant(
                            "proceed_to_checkout",
                            TEXT_VARIANTS_MAP,
                            "Checkout"
                          )}
                        </Button>
                      </SeedLink>
                    ) : (
                      <Button
                        id={dyn.v3.getVariant(
                          "checkout_button",
                          ID_VARIANTS_MAP,
                          "checkout-button"
                        )}
                        className="w-full rounded-full bg-slate-200 px-6 py-4 text-lg font-semibold text-slate-500"
                        disabled
                        onClick={handleProceedToCheckout}
                      >
                        {dyn.v3.getVariant(
                          "proceed_to_checkout",
                          TEXT_VARIANTS_MAP,
                          "Checkout"
                        )}
                      </Button>
                    )}
                    <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        {dyn.v3.getVariant(
                          "buyer_protection",
                          TEXT_VARIANTS_MAP,
                          "Buyer protection"
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        {dyn.v3.getVariant(
                          "fast_shipping",
                          TEXT_VARIANTS_MAP,
                          "Fast shipping"
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <BadgeCheck className="h-4 w-4" />
                        {dyn.v3.getVariant(
                          "verified_partners",
                          TEXT_VARIANTS_MAP,
                          "Verified partners"
                        )}
                      </div>
                    </div>
                  </BlurCard>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
