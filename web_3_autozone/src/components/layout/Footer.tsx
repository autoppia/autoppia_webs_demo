"use client";

import Image from "next/image";
import { ArrowUp } from "lucide-react";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-white">
      {/* Back to top button */}
      <button
        onClick={scrollToTop}
        className="w-full py-4 bg-amazon-lightBlue hover:bg-amazon-blue text-white text-sm font-medium"
      >
        Back to top
      </button>

      {/* Main footer */}
      <div className="bg-[#232f3e] py-10 text-white">
        <div className="omnizon-container grid grid-cols-1 md:grid-cols-4 gap-6 px-4">
          <div>
            <h3 className="font-bold text-lg mb-3">Get to Know Us</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="cursor-default text-gray-300">Careers</span>
              </li>
              <li>
                <span className="cursor-default text-gray-300">Blog</span>
              </li>
              <li>
                <span className="cursor-default text-gray-300">
                  About Autozon
                </span>
              </li>
              <li>
                <span className="cursor-default text-gray-300">
                  Investor Relations
                </span>
              </li>
              <li>
                <span className="cursor-default text-gray-300">
                  Autozon Devices
                </span>
              </li>
              <li>
                <span className="cursor-default text-gray-300">
                  Autozon Science
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-3">Make Money with Us</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="cursor-default text-gray-300">
                  Sell products on Autozon
                </span>
              </li>
              <li>
                <span className="cursor-default text-gray-300">
                  Sell on Autozon Business
                </span>
              </li>
              <li>
                <span className="cursor-default text-gray-300">
                  Sell apps on Autozon
                </span>
              </li>
              <li>
                <span className="cursor-default text-gray-300">
                  Become an Affiliate
                </span>
              </li>
              <li>
                <span className="cursor-default text-gray-300">
                  Advertise Your Products
                </span>
              </li>
              <li>
                <span className="cursor-default text-gray-300">
                  Self-Publish with Us
                </span>
              </li>
              <li>
                <span className="cursor-default text-gray-300">
                  Host an Autozon Hub
                </span>
              </li>
              <li>
                <span className="cursor-default text-gray-300">
                  See More Make Money with Us
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-3">Autozon Payment Products</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="cursor-default text-gray-300">
                  Autozon Business Card
                </span>
              </li>
              <li>
                <span className="cursor-default text-gray-300">
                  Shop with Points
                </span>
              </li>
              <li>
                <span className="cursor-default text-gray-300">
                  Reload Your Balance
                </span>
              </li>
              <li>
                <span className="cursor-default text-gray-300">
                  Autozon Currency Converter
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-3">Let Us Help You</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="cursor-default text-gray-300">
                  Autozon and COVID-19
                </span>
              </li>
              <li>
                <span className="cursor-default text-gray-300">
                  Your Account
                </span>
              </li>
              <li>
                <span className="cursor-default text-gray-300">
                  Your Orders
                </span>
              </li>
              <li>
                <span className="cursor-default text-gray-300">
                  Shipping Rates & Policies
                </span>
              </li>
              <li>
                <span className="cursor-default text-gray-300">
                  Returns & Replacements
                </span>
              </li>
              <li>
                <span className="cursor-default text-gray-300">
                  Manage Your Content and Devices
                </span>
              </li>
              <li>
                <span className="cursor-default text-gray-300">Help</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer bottom */}
      <div className="bg-[#131a22] py-6 text-white">
        <div className="omnizon-container flex flex-col items-center">
          <div className="relative h-8 w-28 my-4">
            {/* <Image
              src="/images/logo/logo.png"
              alt="Autozon"
              fill
              className="object-contain"
            /> */}
            <h1 className="font-semibold">Autozone</h1>
          </div>

          <div className="flex flex-wrap justify-center gap-4 my-4">
            <button className="px-3 py-1 border border-gray-600 rounded-sm text-sm flex items-center gap-1">
              <span>English</span>
            </button>

            <button className="px-3 py-1 border border-gray-600 rounded-sm text-sm flex items-center gap-1">
              <span>USD - U.S Dollar</span>
            </button>

            <button className="px-3 py-1 border border-gray-600 rounded-sm text-sm flex items-center gap-1">
              <div className="relative h-3 w-5 mr-1">
                <Image
                  src="/images/others/us_flag.png"
                  alt="United States"
                  fill
                  className="object-contain"
                />
              </div>
              <span>United States</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
