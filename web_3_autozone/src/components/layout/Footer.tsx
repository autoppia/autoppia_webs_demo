"use client";

import Image from "next/image";
import { useSeed } from "@/seed-system";
import { getLayoutConfig } from "@/dynamic/v2-data";
import { getLayoutClasses } from "@/utils/seedLayout";
import { useV3Attributes } from "@/dynamic/v3-dynamic";

export function Footer() {
  const { seed } = useSeed();
  const layoutConfig = getLayoutConfig(seed);
  const layoutClasses = getLayoutClasses(layoutConfig);
  const { getText } = useV3Attributes();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className={`bg-white ${layoutClasses.footer}`}>
      {/* Back to top */}
      <button
        onClick={scrollToTop}
        className={`w-full py-4 bg-amazon-lightBlue hover:bg-amazon-blue text-white text-sm font-medium ${layoutClasses.buttons}`}
      >
        {getText("back_to_top")}
      </button>

      {/* Main Links */}
      <div className="bg-[#232f3e] py-10 text-white">
        <div className="omnizon-container grid grid-cols-2 md:grid-cols-4 gap-6 px-6">
          {/* Column: Get to Know Us */}
          <div className="min-w-[180px]">
            <h3 className="font-bold text-lg mb-3">{getText("get_to_know_us")}</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>Careers</li>
              <li>Blog</li>
              <li>About Autozon</li>
              <li>Investor Relations</li>
              <li>Autozon Devices</li>
              <li>Autozon Science</li>
            </ul>
          </div>

          {/* Column: Make Money */}
          <div className="min-w-[180px]">
            <h3 className="font-bold text-lg mb-3">{getText("make_money_with_us")}</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>Sell products on Autozon</li>
              <li>Sell on Autozon Business</li>
              <li>Sell apps on Autozon</li>
              <li>Become an Affiliate</li>
              <li>Advertise Your Products</li>
              <li>Self-Publish with Us</li>
            </ul>
          </div>

          {/* Column: Payment Products */}
          <div className="min-w-[180px]">
            <h3 className="font-bold text-lg mb-3">{getText("payment_products")}</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>Autozon Business Card</li>
              <li>Shop with Points</li>
              <li>Reload Your Balance</li>
              <li>Autozon Currency Converter</li>
            </ul>
          </div>

          {/* Column: Help */}
          <div className="min-w-[180px]">
            <h3 className="font-bold text-lg mb-3">{getText("let_us_help_you")}</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>Autozon and COVID-19</li>
              <li>Your Account</li>
              <li>Your Orders</li>
              <li>Shipping Rates & Policies</li>
              <li>Returns & Replacements</li>
              <li>Help</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="bg-[#131a22] py-6 text-white">
        <div className="omnizon-container flex flex-col items-center justify-center text-sm px-4">
          <h1 className="font-semibold mb-3">Autozone</h1>

          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-3 py-1 border border-gray-600 rounded-sm">
              English
            </button>
            <button className="px-3 py-1 border border-gray-600 rounded-sm">
              USD - U.S Dollar
            </button>
            <button className="px-3 py-1 border border-gray-600 rounded-sm flex items-center gap-1">
              <div className="relative h-3 w-5">
                <Image
                  src="/images/others/us_flag.png"
                  alt="United States"
                  fill
                  className="object-contain"
                />
              </div>
              United States
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
