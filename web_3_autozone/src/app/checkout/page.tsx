"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useV3Attributes } from "@/dynamic/v3-dynamic";
import { logEvent, EVENT_TYPES } from "@/events";
import { ToastContainer, toast } from "react-toastify";
import { BlurCard } from "@/components/ui/BlurCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BadgeCheck, ShieldCheck, Truck } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";

export default function CheckoutPage() {
  const { state, clearCart } = useCart();
  const { items, totalItems, totalAmount } = state;
  const { getText, getId } = useV3Attributes();

  const shipping = Number.parseFloat((Math.random() * 5 + 2).toFixed(2));
  const tax = Number.parseFloat((totalAmount * 0.08).toFixed(2));
  const orderTotal = totalAmount + tax + shipping;

  const deliveryDate1 = "Tomorrow, Jul 19";
  const deliveryDate2 = "Monday, Jul 21";
  const arrivalText = "Arriving Jul 19, 2024";

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white py-10">
        <div className="omnizon-container space-y-10">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
              Autozone
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">
              {getText("checkout")}{" "}
              <span className="text-indigo-600">
                ({totalItems} {getText("items")})
              </span>
            </h1>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1.2fr,0.8fr]">
            <div className="space-y-6">
              <SectionHeading
                eyebrow="Timeline"
                title="Review and confirm your order"
                description="Shipping, payment, and items are locked in once you place the order."
              />
              <BlurCard className="flex gap-4 p-5">
                <div className="rounded-full bg-slate-900 px-3 py-1 text-sm font-semibold text-white">
                  1
                </div>
                <div className="space-y-2 text-sm text-slate-600">
                  <p className="text-base font-semibold text-slate-900">
                    {getText("shipping_address")}
                  </p>
                  <p>
                    John Doe · 123 Main St · Cityville, ST 12345
                  </p>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                    Earliest arrival — {deliveryDate1}
                  </p>
                  <button className="text-xs font-semibold text-indigo-600 underline">
                    {getText("add_delivery_instructions")}
                  </button>
                </div>
              </BlurCard>

              <BlurCard className="flex gap-4 p-5">
                <div className="rounded-full bg-slate-900 px-3 py-1 text-sm font-semibold text-white">
                  2
                </div>
                <div className="space-y-2 text-sm text-slate-600">
                  <p className="text-base font-semibold text-slate-900">
                    {getText("payment_method")}
                  </p>
                  <p>{getText("paying_with")} MasterCard ending in 1234</p>
                  <p>{getText("billing_address_same")}</p>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                    Backup arrival — {deliveryDate2}
                  </p>
                </div>
              </BlurCard>

              <BlurCard className="p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-slate-900 px-3 py-1 text-sm font-semibold text-white">
                    3
                  </div>
                  <p className="text-base font-semibold text-slate-900">
                    {getText("review_items")}
                  </p>
                </div>
                <div className="mt-4 space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 rounded-2xl border border-white/60 bg-white/80 p-3"
                    >
                      <div className="relative h-14 w-14 rounded-2xl bg-white">
                        <SafeImage
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-contain p-2"
                          fallbackSrc="/images/homepage_categories/coffee_machine.jpg"
                        />
                      </div>
                      <div className="flex-1 text-sm text-slate-600">
                        <p className="font-semibold text-slate-900">
                          {item.title}
                        </p>
                        <p>
                          {getText("quantity")}: {item.quantity}
                        </p>
                        <p>
                          {getText("price")}: {item.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs uppercase tracking-[0.4em] text-slate-400">
                  {arrivalText}
                </p>
              </BlurCard>
            </div>

            <div className="space-y-6">
              <BlurCard className="space-y-5 p-6 lg:sticky lg:top-24">
                <div className="rounded-2xl bg-gradient-to-r from-indigo-500 to-sky-500 px-4 py-3 text-white">
                  <p className="text-xs uppercase tracking-[0.4em]">
                    Final review
                  </p>
                  <p>
                    {getText("qualifies_for_delivery")}{" "}
                    <span className="font-semibold">
                      {getText("free_delivery")}
                    </span>
                  </p>
                </div>
                <div className="text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>{getText("items")}</span>
                    <span className="font-semibold text-slate-900">
                      ${totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{getText("shipping_handling")}</span>
                    <span className="font-semibold text-slate-900">
                      ${shipping.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{getText("estimated_tax")}</span>
                    <span className="font-semibold text-slate-900">
                      ${tax.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-white/50 pt-3">
                  <span className="text-sm font-semibold text-slate-600">
                    {getText("order_total")}
                  </span>
                  <span className="text-2xl font-semibold text-slate-900">
                    ${orderTotal.toFixed(2)}
                  </span>
                </div>
                <Button
                  id={getId("checkout_button")}
                  className="w-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 px-6 py-4 text-lg font-semibold text-white shadow-lg"
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
                    toast.success("Order placed successfully!");
                    clearCart();
                  }}
                >
                  {getText("place_order", "Proceed")}
                </Button>
                <p className="text-center text-xs text-slate-500">
                  {getText("by_placing_order")}{" "}
                  <a href="/search?q=privacy" className="underline text-indigo-600">
                    {getText("privacy_notice")}
                  </a>{" "}
                  and{" "}
                  <a href="/search?q=terms" className="underline text-indigo-600">
                    {getText("conditions_of_use")}
                  </a>
                  .
                </p>
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
                    Secure checkout
                  </div>
                </div>
              </BlurCard>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
