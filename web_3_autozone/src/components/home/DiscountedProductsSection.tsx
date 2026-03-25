"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/context/CartContext";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import {
  DISCOUNT_BUCKETS,
  getDiscountPercent,
  hasMeaningfulOriginalPrice,
  matchesDiscountBucket,
  type DiscountBucket,
} from "@/library/pricing";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";

type DiscountedProductsSectionProps = {
  allProducts: Product[];
  effectiveSeed: number;
};

export function DiscountedProductsSection({
  allProducts,
  effectiveSeed,
}: DiscountedProductsSectionProps) {
  const dyn = useDynamicSystem();
  const [bucket, setBucket] = useState<DiscountBucket | null>(20);

  const t = (key: string, fallback: string) =>
    dyn.v3.getVariant(key, TEXT_VARIANTS_MAP, fallback);

  const onSale = useMemo(
    () => allProducts.filter((p) => hasMeaningfulOriginalPrice(p.originalPrice, p.price)),
    [allProducts]
  );

  const filtered = useMemo(() => {
    if (bucket == null) return onSale;
    return onSale.filter((p) => {
      const pct = getDiscountPercent(p.originalPrice, p.price);
      return matchesDiscountBucket(pct, bucket);
    });
  }, [onSale, bucket]);

  if (onSale.length === 0) {
    return null;
  }

  return (
    <section
      id={dyn.v3.getVariant("discounted-products-section", ID_VARIANTS_MAP, "discounted-products")}
      className={dyn.v3.getVariant(
        "discounted-section",
        CLASS_VARIANTS_MAP,
        "omnizon-container mt-12 space-y-6"
      )}
    >
      <SectionHeading
        eyebrow={t("deals_eyebrow", "Save more")}
        title={t("discounted_products_title", "Discounted products")}
        description={t(
          "discounted_products_desc",
          "Items with a real list price drop. Pick a minimum discount tier to narrow results."
        )}
      />
      <div className="flex flex-wrap gap-2">
        {DISCOUNT_BUCKETS.map((b) =>
          dyn.v1.addWrapDecoy(`discount-filter-${b}`, (
            <button
              key={b}
              type="button"
              id={dyn.v3.getVariant("discount-filter", ID_VARIANTS_MAP, `discount-${b}pct`)}
              onClick={() => setBucket(b)}
              className={
                bucket === b
                  ? dyn.v3.getVariant(
                      "discount-filter-active",
                      CLASS_VARIANTS_MAP,
                      "rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow"
                    )
                  : dyn.v3.getVariant(
                      "discount-filter-idle",
                      CLASS_VARIANTS_MAP,
                      "rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400"
                    )
              }
            >
              {t(`discount_at_least_${b}`, `${b}%+ off`)}
            </button>
          ))
        )}
        <button
          type="button"
          id={dyn.v3.getVariant("discount-filter-all", ID_VARIANTS_MAP, "discount-all")}
          onClick={() => setBucket(null)}
          className={
            bucket === null
              ? "rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow"
              : "rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400"
          }
        >
          {t("discount_show_all", "All deals")}
        </button>
      </div>
      {filtered.length === 0 ? (
        <p className="text-sm text-slate-600">
          {t("discount_empty", "No products match this discount tier. Try another filter.")}
        </p>
      ) : (
        <ProductCarousel
          title={t("discounted_carousel_title", "On sale now")}
          products={filtered}
          seed={effectiveSeed + 31}
        />
      )}
    </section>
  );
}
