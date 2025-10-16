import { Suspense } from "react";
import { CartPageContent } from "@/components/cart/CartPageContent";

// Force dynamic rendering to avoid prerendering issues
export const dynamic = 'force-dynamic';

export default function CartPage() {
  return (
    <Suspense fallback={<div className="bg-[#edeff0] min-h-screen py-10 mt-16 flex items-center justify-center">Loading cart...</div>}>
      <CartPageContent />
    </Suspense>
  );
}

