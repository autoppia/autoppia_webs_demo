"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CheckoutPage() {
  // Static mock data for hydration match
  const totalItems = 0;
  const totalAmount = 0;
  const shipping = 0;
  const tax = 0;
  const orderTotal = 0;
  const deliveryDate1 = "Tomorrow, Jul 19";
  const deliveryDate2 = "Monday, Jul 21";
  const arrivalText = "Arriving Jul 19, 2024";

  return (
    <div className="min-h-screen bg-[#fafbfc] w-full pb-16">
      {/* Subtle top bar */}
      <div className="w-full bg-gradient-to-b from-[#f3f3f3] to-[#ffffff] border-b flex flex-col items-center pt-2 pb-3">
        <div className="flex items-center gap-6">
          {/* Logo */}
          {/* <img src="/images/logo/logo.png" alt="Autozon" className="h-8 object-contain mb-1" /> */}
          <h1 className="font-semibold">Autozone</h1>
        </div>
        <div className="relative w-full">
          <div
            className="text-center mx-auto text-2xl font-light mt-2 mb-1 tracking-tight"
            style={{ letterSpacing: 0 }}
          >
            Checkout{" "}
            <span className="text-[#017185] text-xl align-middle">
              ({totalItems} item)
            </span>
            <span className="inline-block align-middle ml-2 mb-1">
              <svg viewBox="0 0 20 20" width={23} className="inline">
                <g>
                  <circle
                    cx="10"
                    cy="10"
                    r="9"
                    fill="none"
                    stroke="#aaaaaa"
                    strokeWidth="2"
                  />
                  <rect
                    x="7.25"
                    y="7"
                    width="5.5"
                    height="5"
                    rx="1.25"
                    stroke="#aaaaaa"
                    fill="none"
                  />
                  <rect
                    x="8.5"
                    y="10"
                    width="3"
                    height="5"
                    rx="1"
                    stroke="#aaaaaa"
                    fill="none"
                  />
                </g>
              </svg>
            </span>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row justify-between items-start mt-6 px-3 md:px-0">
        {/* Main left column */}
        <div className="flex-1 min-w-0 md:mr-8">
          {/* Step 1: Shipping */}
          <div className="px-0">
            <div className="flex items-start mb-2">
              <span className="font-bold text-lg text-gray-900 mr-3">1</span>
              <div className="flex-1 font-semibold text-base leading-7 text-black">
                Shipping Adress
              </div>
              <span className="text-[#017185] text-sm cursor-pointer select-none ml-2 font-normal">
                Change
              </span>
            </div>
            <div className="ml-8 text-sm text-black font-normal leading-5">
              User
              <br />
              4321 MISSION ST, DALY
              <br />
              CITY, CA 94016-1234
              <br />
              <span className="text-[#017185] hover:underline cursor-pointer text-xs mb-1 block mt-1">
                Add delivery instructions
              </span>
            </div>
          </div>
          <hr className="my-5 border-t border-[#e6e7e9]" />

          {/* Step 2: Payment */}
          <div className="px-0 mb-2">
            <div className="flex items-start mb-2">
              <span className="font-bold text-lg text-gray-900 mr-3">2</span>
              <div className="flex-1 font-semibold text-base leading-7 text-black">
                Payment method
              </div>
              <span className="text-[#017185] text-sm cursor-pointer select-none ml-2 font-normal">
                Change
              </span>
            </div>
            <div className="ml-8 text-sm">
              <div className="font-medium">Paying with Master 1234</div>
              <div className="text-xs mt-[2px] text-[#666]">
                Billing address: Same as shipping address
              </div>
              <div className="mt-2 flex gap-2 items-center text-sm">
                <span className="text-black">&#9660;</span>
                <span className="text-black">
                  Add a gift card or promotion code or voucher
                </span>
              </div>
              <div className="flex items-center mt-2 gap-2">
                <input
                  type="text"
                  placeholder="Enter code"
                  className="rounded-sm border border-[#b7b7b7] px-2 py-1 outline-none text-base text-black w-52"
                />
                <button className="rounded-md border px-5 py-[6px] text-sm transition bg-[#f3f3f3] hover:bg-[#e7e9ec]">
                  Apply
                </button>
              </div>
            </div>
          </div>
          <hr className="my-5 border-t border-[#e6e7e9]" />

          {/* Step 3: Review items/shipping */}
          <div className="px-0 mb-1">
            <div className="flex items-start mb-2">
              <span className="font-bold text-lg text-gray-900 mr-3">3</span>
              <div className="flex-1 font-semibold text-base leading-7 text-black">
                Review items and shipping
              </div>
            </div>

            {/* Arriving Card */}
            <div className="ml-8">
              <div className="shadow-sm border border-[#d5d9d9] rounded-md bg-white mb-4 flex flex-col min-h-[180px] p-5 max-w-[600px]">
                <div className="font-bold text-[18px] text-green-700 mb-1">
                  {arrivalText}
                </div>
                <div className="text-xs text-gray-500 mb-3">
                  Items shipped from Autozon.com
                </div>
                <div className="flex md:gap-10 gap-2 flex-col md:flex-row justify-between md:items-start">
                  <fieldset className="border-none p-0 pt-1 md:min-w-[250px]">
                    <legend className="block font-semibold text-base mb-2 md:mb-1 text-black">
                      Choose your delivery option
                    </legend>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 text-sm font-medium">
                        <input
                          type="radio"
                          name="deliveryOption"
                          defaultChecked
                          className="mt-0.5 accent-[#017185]"
                        />
                        <span className="">
                          <span className="text-black font-bold">
                            {deliveryDate1}
                          </span>{" "}
                          Free one day delivery
                        </span>
                      </label>
                      <label className="flex items-center gap-2 text-sm font-medium">
                        <input
                          type="radio"
                          name="deliveryOption"
                          className="mt-0.5 accent-[#017185]"
                        />
                        <span>
                          <span className="text-black font-bold">
                            {deliveryDate1}
                          </span>{" "}
                          1.99 - Key delivery
                        </span>
                      </label>
                      <label className="flex items-center gap-2 text-sm font-medium">
                        <input
                          type="radio"
                          name="deliveryOption"
                          className="mt-0.5 accent-[#017185]"
                        />
                        <span>
                          <span className="text-black font-bold">
                            {deliveryDate2}
                          </span>{" "}
                          FREE Autozon Day with Key Delivery
                        </span>
                      </label>
                    </div>
                  </fieldset>
                </div>
              </div>
              {/* Order total bottom card */}
              <div className="border border-[#d5d9d9] rounded-md bg-white p-4 max-w-[600px] flex flex-col md:flex-row items-center gap-3 mt-2">
                <Button className="bg-amazon-yellow hover:bg-amazon-darkYellow text-black font-semibold px-8 rounded min-w-[140px] py-2">
                  Place your order
                </Button>
                <span className="text-[20px] font-semibold text-[#b12704] block ml-2">
                  Order total: ${orderTotal.toFixed(2)}
                </span>
                <span className="block text-xs text-gray-500 mt-2 md:mt-0 md:ml-4">
                  By placing your order, you agree to Autozon's{" "}
                  <a className="text-[#017185] underline" href="#">
                    privacy notice
                  </a>{" "}
                  and{" "}
                  <a className="text-[#017185] underline" href="#">
                    conditions of use
                  </a>
                  .
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Sidebar right */}
        <div className="w-full md:w-[320px] flex-shrink-0 mt-8 md:mt-0">
          <div className="bg-white border border-[#d5d9d9] shadow-sm rounded-md p-5 pt-6 min-h-[350px] flex flex-col">
            <Button className="bg-amazon-yellow hover:bg-amazon-darkYellow text-black font-semibold w-full mb-2 py-2 rounded">
              Place your order
            </Button>
            <div className="text-[#565959] text-xs leading-tight mb-2 mt-1 px-1 text-center">
              By placing your order, you agree to Autozon's{" "}
              <a className="underline text-[#017185]" href="#">
                privacy notice
              </a>{" "}
              and{" "}
              <a className="underline text-[#017185]" href="#">
                conditions of use
              </a>
              .
            </div>
            <hr className="my-2 border-[#e6e7e9]" />
            <div className="font-semibold text-base mb-2 mt-4">
              Order Summary
            </div>
            <div className="flex flex-col text-[15px] px-1 text-[#222] gap-1 mb-2">
              <div className="flex justify-between">
                <span>Items:</span>
                <span className="tabular-nums">${totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping & handling:</span>
                <span className="tabular-nums">${shipping.toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-[#e6e7e9] flex flex-col gap-1 text-[15px]">
              <div className="flex justify-between">
                <span>Total before tax:</span>
                <span className="tabular-nums">${totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated tax to be collected:</span>
                <span className="tabular-nums">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold mt-3 text-base">
                <span className="text-[#b12704]">Order Total:</span>
                <span className="text-[#b12704]">${orderTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
