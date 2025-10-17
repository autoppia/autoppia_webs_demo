"use client";
import { useCartStore } from "@/store/cart-store";
import Link from "next/link";
import { EVENT_TYPES, logEvent } from "@/components/library/events";
import { useSeedLayout } from "@/hooks/use-seed-layout";

export default function CartNavIcon() {
  const items = useCartStore((s) => s.items);
  const count = items.reduce((acc, i) => acc + i.quantity, 0);
  const layout = useSeedLayout();

  const handleClick = () => {
    logEvent(EVENT_TYPES.OPEN_CHECKOUT_PAGE, {
      itemCount: count,
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
    });
  };

  return (
    <div onClick={handleClick} className={layout.cart.iconClass}>
      <Link href="/cart" className="relative px-3 py-1 flex items-center group">
        <span className="text-zinc-700 group-hover:text-green-600 text-base">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.0}
            stroke="currentColor"
            className="h-[1.6em] w-[1.6em]"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 3h1.72c.512 0 .973.322 1.144.802l.36 1.039M7.5 14.25H19.125c.621 0 1.123-.507 1.123-1.134c0-.122-.018-.244-.052-.361L18.25 6.75H5.318"
            />
            <circle cx="8.5" cy="19.5" r="1.25" />
            <circle cx="18" cy="19.5" r="1.25" />
          </svg>
        </span>
        {count > 0 && (
          <span className={`absolute -top-1 -right-1 min-w-5 h-5 text-xs bg-green-600 text-white rounded-full flex items-center justify-center px-1 font-bold border-2 border-white ${layout.cart.badgeClass}`}>
            {count}
          </span>
        )}
      </Link>
    </div>
  );
}
