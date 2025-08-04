"use client";
import { useEffect, useMemo, useState } from "react";
import { MenuItem, MenuItemSize, restaurants } from "@/data/restaurants";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trash } from "lucide-react";
import { AddToCartModal } from "./AddToCartModal";
import { EVENT_TYPES, logEvent } from "../library/events";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-block text-yellow-500 align-middle">
      {[1, 2, 3, 4, 5].map((num) => (
        <svg
          key={num}
          className={`inline w-4 h-4 ${
            num > Math.round(rating) ? "opacity-25" : ""
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.987a1 1 0 00.95.69h4.2c.969 0 1.371 1.24.588 1.81l-3.4 2.47a1 1 0 00-.364 1.118l1.286 3.987c.3.921-.755 1.688-1.54 1.118l-3.4-2.47a1 1 0 00-1.176 0l-3.4 2.47c-.784.57-1.838-.197-1.54-1.118l1.286-3.987a1 1 0 00-.364-1.118l-3.4-2.47c-.783-.57-.38-1.81.588-1.81h4.2a1 1 0 00.95-.69l1.286-3.987z" />
        </svg>
      ))}
    </span>
  );
}
type Review = {
  avatar: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
};
function ReviewsSection({
  reviews,
  isAdmin,
}: {
  reviews: Review[];
  isAdmin?: boolean;
}) {
  const [localReviews, setLocalReviews] = useState(reviews);
  const handleDelete = (idx: number) => {
    const deleted = localReviews[idx];

    logEvent(EVENT_TYPES.DELETE_REVIEW, {
      author: deleted.author,
      rating: deleted.rating,
      comment: deleted.comment,
      date: deleted.date,
    });

    setLocalReviews((r) => r.filter((_, i) => i !== idx));
  };

  if (!localReviews?.length) return null;
  return (
    <section className="mt-12">
      <h3 className="text-xl font-bold mb-4">Customer Reviews</h3>
      <div className="space-y-4">
        {localReviews.map((r, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow p-5 flex items-start gap-4 group relative"
          >
            <Image
              src={r.avatar}
              alt={r.author}
              width={48}
              height={48}
              className="rounded-full object-cover border"
            />
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-1">
                <span className="font-semibold">{r.author}</span>
                <Stars rating={r.rating} />
              </div>
              <div className="text-zinc-700 text-base">{r.comment}</div>
              <span className="text-xs text-zinc-400 ">{r.date}</span>
            </div>
            {isAdmin && (
              <button
                aria-label="Delete review"
                title="Delete review"
                className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full shadow bg-zinc-100 text-zinc-400 hover:bg-red-100 hover:text-red-700 transition duration-150"
                onClick={() => handleDelete(i)}
              >
                <Trash size={18} />
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function RestaurantDetailPage({
  restaurantId,
}: {
  restaurantId: string;
}) {
  const isAdmin = true; // <-- Set false to test regular user (admin-only delete)
  const router = useRouter();
  // fix restaurant
  const restaurant = useMemo(() => {
    return restaurants.find((r) => r.id === restaurantId)!;
  }, [restaurantId]);
  useEffect(() => {
    if (restaurant) {
      const eventPayload = {
        id: restaurant.id,
        name: restaurant.name,
        cuisine: restaurant.cuisine,
        rating: restaurant.rating,
      };

      logEvent(EVENT_TYPES.VIEW_RESTAURANT, eventPayload);
      console.log("VIEW_RESTAURANT event triggered:", eventPayload);
    }
  }, [restaurant]);
  const addToCart = useCartStore((state) => state.addToCart);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalItem, setModalItem] = useState<MenuItem | null>(null);

  // Delivery/Pickup toggle state
  const [mode, setMode] = useState<"delivery" | "pickup">("delivery");

  if (!restaurant)
    return <div className="text-lg text-zinc-500">Restaurant not found.</div>;

  type CartCustomItem = {
    size?: MenuItemSize;
    options: string[];
    preferences?: string;
    quantity: number;
  };
  function handleAddToCart(custom: CartCustomItem) {
    if (modalItem) {
      const transformedOptions =
        custom.options?.map((label) => ({ label })) ?? [];

      const payload: MenuItem = {
        ...modalItem,
        ...custom,
        options: transformedOptions,
      };

      addToCart(payload, restaurant.id);
      setModalOpen(false);
      setModalItem(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-0">
      <div className="flex flex-col md:flex-row gap-6 md:items-center mt-6 mb-6">
        <div className="relative w-full md:w-72 h-48 rounded-xl overflow-hidden shadow">
          <Image
            src={restaurant.image}
            alt={restaurant.name}
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 768px) 100vw, 400px"
          />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-1">{restaurant.name}</h1>
          <div className="text-zinc-500 mb-2">
            {restaurant.cuisine} &middot;{" "}
            <span className="font-semibold text-green-700">
              ★ {restaurant.rating}
            </span>
          </div>
          <p className="text-zinc-600 mb-2">{restaurant.description}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              logEvent(EVENT_TYPES.BACK_TO_ALL_RESTAURANTS, {
                fromRestaurantId: restaurant.id,
                fromRestaurantName: restaurant.name,
              });
              router.back();
            }}
          >
            ← Back to all restaurants
          </Button>
        </div>
      </div>
      <h2 className="text-xl font-bold mb-4 mt-10">Menu</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {restaurant.menu.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow p-4 flex flex-col"
          >
            <div className="relative w-full h-32 mb-3 rounded-md overflow-hidden">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="font-bold text-lg mb-1">{item.name}</div>
            <div className="text-zinc-500 text-sm mb-2 flex-1">
              {item.description}
            </div>
            <div className="flex items-center justify-between mt-auto">
              <span className="font-semibold text-green-700 text-base">
                ${item.price.toFixed(2)}
              </span>
              <Button
                size="sm"
                id="add-to-cart-modal-btn"
                onClick={() => {
                  logEvent(EVENT_TYPES.ADD_TO_CART_MODAL_OPEN, {
                    restaurantId: restaurant.id,
                    restaurantName: restaurant.name,
                    itemId: item.id,
                    itemName: item.name,
                    itemPrice: item.price,
                  });
                  const itemWithRestaurant = {
                    ...item,
                    restaurantId: restaurant.id,
                    restaurantName: restaurant.name
                  };

                  setModalOpen(true);
                  setModalItem(itemWithRestaurant);
                }}
              >
                Add to Cart
              </Button>
            </div>
          </div>
        ))}
      </div>
      {/* Modal for item customizations */}
      {modalOpen && modalItem && (
        <AddToCartModal
          open={modalOpen}
          onOpenChange={(o) => {
            setModalOpen(o);
            if (!o) setModalItem(null);
          }}
          item={modalItem}
          onAdd={handleAddToCart}
        />
      )}
      {/* Reviews section */}
      <ReviewsSection reviews={restaurant.reviews} isAdmin={isAdmin} />
      {/* Floating Cart Access here! */}
      <CartFab />
    </div>
  );
}

function CartFab() {
  const items = useCartStore((s) => s.items);
  const router = useRouter();
  const total = items.reduce((acc, i) => acc + i.quantity, 0);

  if (total === 0) return null;

  const handleClick = () => {
    logEvent(EVENT_TYPES.OPEN_CHECKOUT_PAGE, {
      itemCount: total,
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
    });
    router.push("/cart");
  };

  return (
    <button
      className="fixed z-40 bottom-8 right-8 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg flex gap-2 px-6 py-3 items-center text-lg font-bold"
      onClick={handleClick}
    >
      🛒{" "}
      <span>
        {total} item{total > 1 ? "s" : ""}
      </span>
    </button>
  );
}
