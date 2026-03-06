"use client";

import { Suspense } from "react";
import { WishlistPage } from "@/components/wishlist/WishlistPage";

export const dynamic = "force-dynamic";

export default function WishlistRoute() {
  return (
    <Suspense fallback={<div className="p-4">Loading wishlist…</div>}>
      <WishlistPage />
    </Suspense>
  );
}
