"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useV3Attributes } from "@/dynamic/v3-dynamic";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { ToastContainer, toast } from "react-toastify";

const getTopMarginClass = () => {
  const margins = ["mt-0", "mt-8", "mt-16", "mt-24", "mt-32"];
  return margins[Math.floor(Math.random() * margins.length)];
};

export default function CheckoutPage() {
  const { state, clearCart } = useCart();
  const { items, totalItems, totalAmount } = state;
  const { getText, getId } = useV3Attributes();

  const shipping = parseFloat((Math.random() * 5 + 2).toFixed(2));
  const tax = parseFloat((totalAmount * 0.08).toFixed(2));
  const orderTotal = totalAmount + tax + shipping;

  const deliveryDate1 = "Tomorrow, Jul 19";
  const deliveryDate2 = "Monday, Jul 21";
  const arrivalText = "Arriving Jul 19, 2024";

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-[#fafbfc] w-full pb-16 text-[#0F1111]">
        <div className="w-full bg-gradient-to-b from-[#f3f3f3] to-[#ffffff] border-b flex flex-col items-center pt-2 pb-3">
          <div className="flex items-center gap-6">
            <h1 className="font-semibold">Autozon</h1>
          </div>
          <div className="relative w-full">
            <div className="text-center mx-auto text-2xl font-light mt-2 mb-1 tracking-tight">
              {getText("checkout")}{" "}
              <span className="text-[#017185] text-xl align-middle">
                ({totalItems} {getText("items")})
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row justify-between items-start mt-6 px-3 md:px-0">
          <div className="flex-1 min-w-0 md:mr-8">
            <div className="px-0">
              <div className="flex items-start mb-2">
                <span className="font-bold text-lg text-gray-900 mr-3">1</span>
                <div className="flex-1 font-semibold text-base leading-7 text-black">
                  {getText("shipping_address")}
                </div>
              </div>
              <div className="ml-8 text-sm text-black">
                John Doe
                <br />
                123 Main St
                <br />
                Cityville, ST 12345
                <br />
                <span className="text-[#017185] hover:underline cursor-pointer text-xs mt-1 block">
                  {getText("add_delivery_instructions")}
                </span>
              </div>
            </div>

            <hr className="my-5 border-t border-[#e6e7e9]" />

            <div className="px-0 mb-2">
              <div className="flex items-start mb-2">
                <span className="font-bold text-lg text-gray-900 mr-3">2</span>
                <div className="flex-1 font-semibold text-base leading-7 text-black">
                  {getText("payment_method")}
                </div>
              </div>
              <div className="ml-8 text-sm">
                {getText("paying_with")} MasterCard ending in 1234
                <div className="mt-2">{getText("billing_address_same")}</div>
              </div>
            </div>

            <hr className="my-5 border-t border-[#e6e7e9]" />

            <div className="px-0 mb-1">
              <div className="flex items-start mb-2">
                <span className="font-bold text-lg text-gray-900 mr-3">3</span>
                <div className="flex-1 font-semibold text-base leading-7 text-black">
                  {getText("review_items")}
                </div>
              </div>

              <div className="ml-8 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center border rounded-md p-4 bg-white shadow-sm"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-16 object-contain mr-4"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-black">
                        {item.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {getText("quantity")}: {item.quantity}
                      </div>
                      <div className="text-xs text-gray-500">
                        {getText("price")}: ${item.price}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            className={`w-full md:w-[320px] flex-shrink-0 ${getTopMarginClass()}`}
          >
            <div className="bg-white border border-[#d5d9d9] shadow-sm rounded-md p-5 pt-6 min-h-[350px] flex flex-col">
              <Button
                id={getId("checkout_button")}
                className="bg-amazon-yellow hover:bg-amazon-darkYellow text-[#0F1111] font-semibold w-full mb-2 py-2 rounded"
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
              <div className="text-xs text-[#565959] text-center mt-2">
                {getText("by_placing_order")}{" "}
                <a href="#" className="underline text-[#017185]">
                  {getText("privacy_notice")}
                </a>{" "}
                and{" "}
                <a href="#" className="underline text-[#017185]">
                  {getText("conditions_of_use")}
                </a>
                .
              </div>
              <hr className="my-4 border-[#e6e7e9]" />
              <div className="text-base font-semibold mb-2">{getText("order_summary")}</div>
              <div className="flex justify-between text-sm">
                <span>{getText("items")}:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{getText("shipping_handling")}:</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span>{getText("total_before_tax")}:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{getText("estimated_tax")}:</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold mt-3">
                <span className="text-[#b12704]">{getText("order_total")}:</span>
                <span className="text-[#b12704]">${orderTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
