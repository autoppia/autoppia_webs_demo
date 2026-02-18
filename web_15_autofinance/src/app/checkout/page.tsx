"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { logEvent, EVENT_TYPES } from "@/events";
import { ToastContainer, toast } from "react-toastify";
import { BlurCard } from "@/components/ui/BlurCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BadgeCheck, ShieldCheck, Truck, ShoppingBag } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { useEffect, useMemo, useState } from "react";
import { useDynamicSystem } from "@/dynamic/shared";
import { CLASS_VARIANTS_MAP, ID_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";

export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  const router = useSeedRouter();
  const { state, clearCart } = useCart();
  const { items, totalItems, totalAmount } = state;
  const dyn = useDynamicSystem();

  // Free shipping over $50, otherwise $5.99
  const shipping = totalAmount >= 50 ? 0 : 5.99;
  const tax = Number.parseFloat((totalAmount * 0.08).toFixed(2));
  const orderTotal = totalAmount + tax + shipping;

  // Avoid hydration mismatch: compute date string on client after mount.
  const [formattedDate, setFormattedDate] = useState<string>("");
  useEffect(() => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 2);
    setFormattedDate(
      deliveryDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      })
    );
  }, []);

  const orderedItems = useMemo(() => {
    if (!items || items.length === 0) return [];
    const order = dyn.v1.changeOrderElements("checkout-items", items.length);
    return order.map((idx) => items[idx]);
  }, [dyn.v1.changeOrderElements, items]);

  useEffect(() => {
    if (totalItems === 0) {
      toast.info("Your cart is empty. Redirecting to shop...");
      setTimeout(() => router.push("/search"), 2000);
    }
  }, [totalItems, router]);

  if (totalItems === 0) {
    return (
      <>
        <ToastContainer />
        <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white py-20">
          <div className="omnizon-container text-center space-y-6">
            <ShoppingBag className="h-16 w-16 mx-auto text-slate-300" />
            <h1 className="text-2xl font-semibold text-slate-900">
              Your cart is empty
            </h1>
            <p className="text-slate-600">
              Add some products to your cart to continue shopping.
            </p>
            <Button
              onClick={() => router.push("/search")}
              className="rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 px-8 py-3 text-white shadow-lg"
            >
              Browse Products
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ToastContainer />
      <div
        id={dyn.v3.getVariant("checkout-page", ID_VARIANTS_MAP, "checkout")}
        className={dyn.v3.getVariant(
          "checkout-page",
          CLASS_VARIANTS_MAP,
          "min-h-screen bg-gradient-to-b from-white via-slate-50 to-white py-10"
        )}
      >
        {dyn.v1.addWrapDecoy(
          "checkout-container",
          (
            <div className="omnizon-container space-y-10">
              {dyn.v1.addWrapDecoy(
                "checkout-header",
                (
                  <div className="text-center">
                    <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                      {dyn.v3.getVariant(
                        "checkout_eyebrow",
                        TEXT_VARIANTS_MAP,
                        "Autozone Checkout"
                      )}
                    </p>
                    <h1 className="text-3xl font-semibold text-slate-900">
                      {dyn.v3.getVariant(
                        "review_order",
                        TEXT_VARIANTS_MAP,
                        "Review Your Order"
                      )}{" "}
                      <span className="text-indigo-600">
                        ({totalItems} {totalItems === 1 ? "item" : "items"})
                      </span>
                    </h1>
                  </div>
                )
              )}

              <div className="grid gap-10 lg:grid-cols-[1.2fr,0.8fr]">
                {dyn.v1.addWrapDecoy(
                  "checkout-main",
                  (
                    <div className="space-y-6">
                      {dyn.v1.addWrapDecoy(
                        "checkout-heading",
                        (
                          <SectionHeading
                            eyebrow={dyn.v3.getVariant(
                              "order_timeline",
                              TEXT_VARIANTS_MAP,
                              "Order timeline"
                            )}
                            title={dyn.v3.getVariant(
                              "review_and_confirm",
                              TEXT_VARIANTS_MAP,
                              "Review and confirm"
                            )}
                            description={dyn.v3.getVariant(
                              "checkout_description",
                              TEXT_VARIANTS_MAP,
                              "Please verify your shipping address, payment method, and items before placing your order."
                            )}
                          />
                        )
                      )}

                      {/* Step 1: Shipping Address */}
                      {dyn.v1.addWrapDecoy(
                        "checkout-shipping",
                        (
                          <BlurCard
                            id={dyn.v3.getVariant(
                              "checkout-shipping",
                              ID_VARIANTS_MAP,
                              "checkout-shipping"
                            )}
                            className={dyn.v3.getVariant(
                              "card",
                              CLASS_VARIANTS_MAP,
                              "flex gap-4 p-5"
                            )}
                          >
                            <div className="flex-shrink-0 rounded-full bg-slate-900 px-3 py-1 text-sm font-semibold text-white h-fit">
                              1
                            </div>
                            <div className="flex-1 space-y-2 text-sm">
                              <p className="text-base font-semibold text-slate-900">
                                {dyn.v3.getVariant(
                                  "shipping_address",
                                  TEXT_VARIANTS_MAP,
                                  "Shipping Address"
                                )}
                              </p>
                              <p className="text-slate-700">
                                <strong>John Doe</strong>
                                <br />
                                123 Main Street
                                <br />
                                Cityville, ST 12345
                              </p>
                              <p className="text-xs uppercase tracking-[0.3em] text-emerald-600 font-semibold">
                                {dyn.v3.getVariant(
                                  "estimated_delivery",
                                  TEXT_VARIANTS_MAP,
                                  "Estimated Delivery"
                                )}
                                :{" "}
                                <span suppressHydrationWarning>
                                  {formattedDate || "—"}
                                </span>
                              </p>
                            </div>
                          </BlurCard>
                        )
                      )}

                      {/* Step 2: Payment Method */}
                      {dyn.v1.addWrapDecoy(
                        "checkout-payment",
                        (
                          <BlurCard className="flex gap-4 p-5">
                            <div className="flex-shrink-0 rounded-full bg-slate-900 px-3 py-1 text-sm font-semibold text-white h-fit">
                              2
                            </div>
                            <div className="flex-1 space-y-2 text-sm">
                              <p className="text-base font-semibold text-slate-900">
                                {dyn.v3.getVariant(
                                  "payment_method",
                                  TEXT_VARIANTS_MAP,
                                  "Payment Method"
                                )}
                              </p>
                              <p className="text-slate-700">
                                MasterCard ending in 1234
                              </p>
                              <p className="text-slate-600 text-xs">
                                {dyn.v3.getVariant(
                                  "billing_matches_shipping",
                                  TEXT_VARIANTS_MAP,
                                  "Billing address matches shipping address"
                                )}
                              </p>
                            </div>
                          </BlurCard>
                        )
                      )}

                      {/* Step 3: Review Items */}
                      {dyn.v1.addWrapDecoy(
                        "checkout-items",
                        (
                          <BlurCard className="p-5">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="flex-shrink-0 rounded-full bg-slate-900 px-3 py-1 text-sm font-semibold text-white">
                                3
                              </div>
                              <p className="text-base font-semibold text-slate-900">
                                {dyn.v3.getVariant(
                                  "order_items",
                                  TEXT_VARIANTS_MAP,
                                  "Order Items"
                                )}
                              </p>
                            </div>
                            <div className="space-y-3">
                              {orderedItems.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-3"
                                >
                                  <div className="relative h-16 w-16 flex-shrink-0 rounded-xl bg-slate-50 overflow-hidden">
                                    <SafeImage
                                      src={item.image}
                                      alt={item.title}
                                      fill
                                      className="object-contain p-2"
                                      fallbackSrc="/images/homepage_categories/default.jpg"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-slate-900 truncate">
                                      {item.title}
                                    </p>
                                    <p className="text-sm text-slate-600">
                                      {dyn.v3.getVariant(
                                        "qty",
                                        TEXT_VARIANTS_MAP,
                                        "Qty"
                                      )}
                                      : {item.quantity} × {item.price}
                                    </p>
                                    <p className="text-sm font-semibold text-slate-900">
                                      $
                                      {(
                                        Number.parseFloat(
                                          item.price.replace("$", "")
                                        ) * item.quantity
                                      ).toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </BlurCard>
                        )
                      )}
                    </div>
                  )
                )}

                {/* Order Summary Sidebar */}
                {dyn.v1.addWrapDecoy(
                  "checkout-summary",
                  (
                    <div className="space-y-6">
                      <BlurCard className="space-y-5 p-6 lg:sticky lg:top-24">
                        <div className="rounded-2xl bg-gradient-to-r from-indigo-500 to-sky-500 px-4 py-3 text-white">
                          <p className="text-xs uppercase tracking-[0.4em] font-semibold">
                            {dyn.v3.getVariant(
                              "order_summary",
                              TEXT_VARIANTS_MAP,
                              "Order Summary"
                            )}
                          </p>
                          {shipping === 0 && (
                            <p className="text-sm mt-1">
                              {dyn.v3.getVariant(
                                "free_shipping_banner",
                                TEXT_VARIANTS_MAP,
                                "🎉 You qualify for free shipping!"
                              )}
                            </p>
                          )}
                        </div>

                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between text-slate-600">
                            <span>
                              {dyn.v3.getVariant(
                                "subtotal",
                                TEXT_VARIANTS_MAP,
                                "Subtotal"
                              )}{" "}
                              ({totalItems}{" "}
                              {totalItems === 1 ? "item" : "items"})
                            </span>
                            <span className="font-semibold text-slate-900">
                              ${totalAmount.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>
                              {dyn.v3.getVariant(
                                "shipping_handling",
                                TEXT_VARIANTS_MAP,
                                "Shipping & Handling"
                              )}
                            </span>
                            <span className="font-semibold text-slate-900">
                              {shipping === 0
                                ? dyn.v3.getVariant(
                                    "free",
                                    TEXT_VARIANTS_MAP,
                                    "FREE"
                                  )
                                : `$${shipping.toFixed(2)}`}
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>
                              {dyn.v3.getVariant(
                                "estimated_tax",
                                TEXT_VARIANTS_MAP,
                                "Estimated Tax"
                              )}
                            </span>
                            <span className="font-semibold text-slate-900">
                              ${tax.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                          <span className="text-sm font-semibold text-slate-700">
                            {dyn.v3.getVariant(
                              "order_total",
                              TEXT_VARIANTS_MAP,
                              "Order Total"
                            )}
                          </span>
                          <span className="text-2xl font-bold text-slate-900">
                            ${orderTotal.toFixed(2)}
                          </span>
                        </div>

                        <Button
                          id={dyn.v3.getVariant(
                            "finalize-order-button",
                            ID_VARIANTS_MAP,
                            "finalize-order-button"
                          )}
                          className={dyn.v3.getVariant(
                            "button-primary",
                            CLASS_VARIANTS_MAP,
                            "w-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 px-6 py-4 text-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all"
                          )}
                          onClick={() => {
                            logEvent(EVENT_TYPES.ORDER_COMPLETED, {
                              items: items.map((item) => ({
                                id: item.id,
                                title: item.title,
                                quantity: item.quantity,
                                price: `${item.price}`,
                              })),
                              totalItems,
                              totalAmount: totalAmount.toFixed(2),
                              tax: tax.toFixed(2),
                              shipping: shipping.toFixed(2),
                              orderTotal: orderTotal.toFixed(2),
                            });
                            toast.success("🎉 Order placed successfully!");
                            setTimeout(() => {
                              clearCart();
                              router.push("/");
                            }, 1500);
                          }}
                        >
                          {dyn.v3.getVariant(
                            "finalize_order",
                            TEXT_VARIANTS_MAP,
                            "Finalize order"
                          )}
                        </Button>

                        <p className="text-center text-xs text-slate-500">
                          {dyn.v3.getVariant(
                            "checkout_terms_prefix",
                            TEXT_VARIANTS_MAP,
                            "By placing your order, you agree to our"
                          )}{" "}
                          <button
                            onClick={() => router.push("/")}
                            className="underline text-indigo-600 hover:text-indigo-700"
                          >
                            {dyn.v3.getVariant(
                              "privacy_policy",
                              TEXT_VARIANTS_MAP,
                              "Privacy Policy"
                            )}
                          </button>{" "}
                          {dyn.v3.getVariant(
                            "and",
                            TEXT_VARIANTS_MAP,
                            "and"
                          )}{" "}
                          <button
                            onClick={() => router.push("/")}
                            className="underline text-indigo-600 hover:text-indigo-700"
                          >
                            {dyn.v3.getVariant(
                              "terms_of_service",
                              TEXT_VARIANTS_MAP,
                              "Terms of Service"
                            )}
                          </button>
                          .
                        </p>

                        <div className="flex flex-wrap gap-3 pt-2 text-xs text-slate-600 border-t border-slate-200">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-emerald-600" />
                            <span>
                              {dyn.v3.getVariant(
                                "buyer_protection",
                                TEXT_VARIANTS_MAP,
                                "Buyer Protection"
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-indigo-600" />
                            <span>
                              {dyn.v3.getVariant(
                                "fast_shipping",
                                TEXT_VARIANTS_MAP,
                                "Fast Shipping"
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BadgeCheck className="h-4 w-4 text-sky-600" />
                            <span>
                              {dyn.v3.getVariant(
                                "secure_checkout",
                                TEXT_VARIANTS_MAP,
                                "Secure Checkout"
                              )}
                            </span>
                          </div>
                        </div>
                      </BlurCard>
                    </div>
                  )
                )}
              </div>
            </div>
          )
        )}
      </div>
    </>
  );
}
