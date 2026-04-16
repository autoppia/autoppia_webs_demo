"use client";
import { useEffect, useMemo, useState } from "react";
import type { MenuItem, MenuItemSize, Restaurant } from "@/data/restaurants";
import { useRestaurants } from "@/contexts/RestaurantContext";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { Loader2 } from "lucide-react";
import { AddToCartModal } from "./AddToCartModal";
import { EVENT_TYPES, logEvent } from "../library/events";
import { useLayout } from "@/contexts/LayoutProvider";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { SafeImage } from "@/components/ui/SafeImage";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHasHydrated } from "@/hooks/use-hydrated";

const STATIC_DYN = {
  v1: {
    addWrapDecoy: <T,>(_key: string, node: T) => node,
    changeOrderElements: (_key: string, count: number) =>
      Array.from({ length: count }, (_, i) => i),
  },
  v3: {
    getVariant: (_key: string, _map: unknown, fallback: string) => fallback,
  },
};

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-yellow-500 align-middle">
      {[1, 2, 3, 4, 5].map((num) => (
        <svg
          key={num}
          className={`inline w-4 h-4 ${
            num > Math.round(rating) ? "opacity-30" : ""
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.987a1 1 0 00.95.69h4.2c.969 0 1.371 1.24.588 1.81l-3.4 2.47a1 1 0 00-.364 1.118l1.286 3.987c.3.921-.755 1.688-1.54 1.118l-3.4-2.47a1 1 0 00-1.176 0l-3.4 2.47c-.784.57-1.838-.197-1.54-1.118l1.286-3.987a1 1 0 00-.364-1.118l-3.4-2.47c-.783-.57-.38-1.81.588-1.81h4.2a1 1 0 00.95-.69l1.286-3.987z" />
        </svg>
      ))}
      <span className="text-sm font-semibold text-zinc-700">{rating.toFixed(1)}</span>
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
  restaurant,
  onDeleteReview,
}: {
  reviews: Review[];
  restaurant: Restaurant;
  onDeleteReview?: (index: number) => void;
}) {
  const layout = useLayout();
  const seedStructure = layout.seed;
  const hasHydrated = useHasHydrated();
  const dynamicSystem = useDynamicSystem();
  const dyn = hasHydrated ? dynamicSystem : STATIC_DYN;
  if (!reviews?.length) return null;

  const reviewsTitleAttributes = layout.getElementAttributes("reviews-title", 0);
  const reviewsTitleId = dyn.v3.getVariant(
    "reviews-title",
    ID_VARIANTS_MAP,
    `${reviewsTitleAttributes.id ?? "reviews-title"}-${seedStructure}`
  );
  const reviewsTitleText = dyn.v3.getVariant("reviews-title", TEXT_VARIANTS_MAP, "Customer Reviews");

  return (
    dyn.v1.addWrapDecoy("reviews-section", (
    <section
      className={`mt-12 ${layout.restaurantDetail.reviewsClass} ${dyn.v3.getVariant('reviews-section-class', CLASS_VARIANTS_MAP, '')}`}
      id={dyn.v3.getVariant('reviews-section', ID_VARIANTS_MAP, 'reviews-section')}
      {...layout.getElementAttributes("reviews-section", 0)}
    >
      <h3
        className={`text-xl font-bold mb-4 ${layout.generateSeedClass("reviews-title")}`}
        {...reviewsTitleAttributes}
        id={reviewsTitleId}
        aria-label={dyn.v3.getVariant("reviews-title", TEXT_VARIANTS_MAP, reviewsTitleText)}
      >
        {reviewsTitleText}
      </h3>
      <div
        className={`space-y-4 ${layout.generateSeedClass('reviews-list')}`}
        {...layout.getElementAttributes('reviews-list', 0)}
      >
        {reviews.map((r, i) => (
          <div
            key={r.author + r.date}
            className={`flex items-start gap-4 rounded-xl border-2 border-zinc-300 bg-white p-5 shadow-sm group relative ${dyn.v3.getVariant('review-item-class', CLASS_VARIANTS_MAP, '')}`}
            id={dyn.v3.getVariant(`review-item-${i}`, ID_VARIANTS_MAP, `review-item-${i}`)}
          >
            <SafeImage
              src={r.avatar.startsWith("/media/") ? "" : r.avatar}
              alt={r.author}
              width={48}
              height={48}
              className="rounded-full border-2 border-zinc-400 object-cover"
              fallbackText=""
            />
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-1">
                <span className={`font-semibold ${dyn.v3.getVariant('review-author-class', CLASS_VARIANTS_MAP, '')}`}>{r.author}</span>
                <Stars rating={r.rating} />
              </div>
              <div className={`text-zinc-700 text-base ${dyn.v3.getVariant('review-comment-class', CLASS_VARIANTS_MAP, '')}`}>{r.comment}</div>
              <span className={`text-xs text-zinc-400 ${dyn.v3.getVariant('review-date-class', CLASS_VARIANTS_MAP, '')}`}>{r.date}</span>
            </div>
            {onDeleteReview && (
              <Button
                variant="ghost"
                size="sm"
                className={`opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50 ${dyn.v3.getVariant('delete-review-btn-class', CLASS_VARIANTS_MAP, '')}`}
                id={dyn.v3.getVariant("delete-review-btn", ID_VARIANTS_MAP, `delete-review-btn-${i}`)}
                onClick={() => {
                  onDeleteReview(i);
                  logEvent(EVENT_TYPES.DELETE_REVIEW, {
                    author: r.author,
                    rating: r.rating,
                    cuisine: restaurant.cuisine,
                    restaurantName: restaurant.name,
                    restaurantRating: restaurant.rating,
                  });
                }}
                aria-label={dyn.v3.getVariant('delete-review-btn', TEXT_VARIANTS_MAP, 'Delete review')}
              >
                {dyn.v3.getVariant('delete-review-btn-text', TEXT_VARIANTS_MAP, 'Delete')}
              </Button>
            )}
          </div>
        ))}
      </div>
    </section>
    ), 'reviews-section-wrapper')
  );
}

export default function RestaurantDetailPage({
  restaurantId,
}: {
  restaurantId: string;
}) {
  const layout = useLayout();
  const hasHydrated = useHasHydrated();
  const seedStructure = hasHydrated ? layout.seed : 0;
  const dynamicSystem = useDynamicSystem();
  const dyn = hasHydrated ? dynamicSystem : STATIC_DYN;
  const router = useSeedRouter();
  const { isLoading, getRestaurantById } = useRestaurants();
  const restaurant = useMemo(() => {
    return getRestaurantById(restaurantId);
  }, [restaurantId, getRestaurantById]);

  const addToCart = useCartStore((state) => state.addToCart);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalItem, setModalItem] = useState<MenuItem | null>(null);
  const [mode, setMode] = useState<"delivery" | "pickup">("delivery");
  const [reviews, setReviews] = useState<Review[]>(restaurant?.reviews ?? []);

  useEffect(() => {
    if (restaurant?.reviews) {
      setReviews(restaurant.reviews);
    }
  }, [restaurant?.reviews]);

  useEffect(() => {
    if (restaurant) {
      const eventPayload = {
        id: restaurant.id,
        name: restaurant.name,
        cuisine: restaurant.cuisine,
        rating: restaurant.rating,
      };

      logEvent(EVENT_TYPES.VIEW_RESTAURANT, eventPayload);
    }
  }, [restaurant]);

  // Keep SSR and first client render deterministic while provider data hydrates.
  if (!hasHydrated || (isLoading && !restaurant)) {
    return (
      <div className="flex items-center justify-center rounded-2xl border-2 border-zinc-300 bg-white py-16 shadow-md">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="mx-auto mt-8 max-w-3xl rounded-3xl border-2 border-zinc-400 bg-white p-10 text-center shadow-md">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">AutoDelivery</p>
        <h2 className="mt-3 text-2xl font-bold text-zinc-900">Restaurant not found</h2>
        <p className="mt-2 text-zinc-600">
          The restaurant you are trying to open is not available for this seed. Browse all restaurants to continue ordering.
        </p>
        <Button
          className="mt-6 rounded-full bg-emerald-600 px-6 text-white hover:bg-emerald-700"
          onClick={() => router.push("/restaurants")}
        >
          Back to restaurants
        </Button>
      </div>
    );
  }

  type CartCustomItem = {
    size?: MenuItemSize;
    options: string[];
    preferences?: string;
    quantity: number;
    unitPrice: number;
  };
  function handleAddToCart(custom: CartCustomItem) {
    if (modalItem && restaurant) {
      const transformedOptions =
        custom.options?.map((label) => ({ label })) ?? [];

      const payload: MenuItem = {
        ...modalItem,
        ...custom,
        options: transformedOptions,
      };

      addToCart(payload, restaurant.id, custom.quantity, {
        selectedSize: custom.size,
        selectedOptions: custom.options,
        preferences: custom.preferences,
        unitPrice: custom.unitPrice,
      });
      setModalOpen(false);
      setModalItem(null);
    }
  }

  return (
    dyn.v1.addWrapDecoy("restaurant-detail-page", (
    <div
      className={`mx-auto mt-4 max-w-5xl px-2 sm:px-0 ${layout.restaurantDetail.containerClass} ${dyn.v3.getVariant("container", CLASS_VARIANTS_MAP, "")} ds-${seedStructure}`}
      id={dyn.v3.getVariant('restaurant-detail-page', ID_VARIANTS_MAP, `restaurant-detail-page-${seedStructure}`)}
      aria-label={dyn.v3.getVariant('restaurant-detail-page', TEXT_VARIANTS_MAP, 'Restaurant detail page')}
    >
      {/* Header */}
      {dyn.v1.addWrapDecoy("restaurant-header", (
      <div
        className={`flex flex-col md:flex-row gap-6 md:items-center mt-6 mb-8 ${layout.restaurantDetail.headerClass} ds-${seedStructure}`}
        {...layout.getElementAttributes('restaurant-header', 0)}
      >
        <div className="relative h-52 w-full overflow-hidden rounded-xl border-2 border-zinc-400 shadow-md md:w-80">
          <SafeImage
            src={restaurant.image}
            alt={restaurant.name}
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 768px) 100vw, 400px"
          />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <h1
              className={`text-3xl font-bold ${layout.generateSeedClass('restaurant-name')} ds-${seedStructure}`}
              id={dyn.v3.getVariant('restaurant-name', ID_VARIANTS_MAP, `restaurant-name-${seedStructure}`)}
              aria-label={dyn.v3.getVariant('restaurant-name', TEXT_VARIANTS_MAP, restaurant.name)}
            >
              {dyn.v3.getVariant('restaurant-name', TEXT_VARIANTS_MAP, restaurant.name)}
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full border-2 border-emerald-700 bg-emerald-50 px-2 py-1 text-sm font-semibold text-emerald-900">
              ★ {restaurant.rating.toFixed(1)}
            </span>
          </div>
          <div
            className={`text-zinc-600 ${layout.generateSeedClass('restaurant-meta')} ds-${seedStructure}`}
            id={dyn.v3.getVariant('restaurant-meta', ID_VARIANTS_MAP, `restaurant-meta-${seedStructure}`)}
            aria-label={dyn.v3.getVariant('restaurant-meta', TEXT_VARIANTS_MAP, `${restaurant.cuisine} · ${restaurant.rating}`)}
          >
            {dyn.v3.getVariant('restaurant-meta', TEXT_VARIANTS_MAP, `${restaurant.cuisine} · ${restaurant.menu.length} dishes`)}
          </div>
          <p
            className={`text-zinc-600 ${layout.generateSeedClass('restaurant-description')} ds-${seedStructure}`}
            id={dyn.v3.getVariant('restaurant-description', ID_VARIANTS_MAP, `restaurant-description-${seedStructure}`)}
            aria-label={dyn.v3.getVariant('restaurant-description', TEXT_VARIANTS_MAP, restaurant.description)}
          >
            {dyn.v3.getVariant('restaurant-description', TEXT_VARIANTS_MAP, restaurant.description)}
          </p>
          <div className="flex gap-3 pt-1">
            <span className="text-sm text-zinc-500">Delivery {restaurant.deliveryTime || "30-45 min"}</span>
            <span className="text-sm text-zinc-500">Pickup {restaurant.pickupTime || "12-18 min"}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className={`${layout.generateSeedClass('back-button')} ds-${seedStructure} ${dyn.v3.getVariant('back-button', CLASS_VARIANTS_MAP, '')}`}
            id={dyn.v3.getVariant('back-button', ID_VARIANTS_MAP, `back-button-${seedStructure}`)}
            onClick={() => {
              logEvent(EVENT_TYPES.BACK_TO_ALL_RESTAURANTS, {
                fromRestaurantId: restaurant.id,
                fromRestaurantName: restaurant.name,
              });
              router.push('/restaurants');
            }}
            aria-label={dyn.v3.getVariant('back-button', TEXT_VARIANTS_MAP, 'Back to all restaurants')}
          >
            {dyn.v3.getVariant('back-button', TEXT_VARIANTS_MAP, '← Back to all restaurants')}
          </Button>
        </div>
      </div>
      ))}

      {/* Menu */}
      {dyn.v1.addWrapDecoy("menu-section", (
      <div>
        <h2
          className={`text-xl font-bold mb-4 ${layout.generateSeedClass('menu-title')} ds-${seedStructure}`}
          id={dyn.v3.getVariant('menu-title', ID_VARIANTS_MAP, `menu-title-${seedStructure}`)}
          aria-label={dyn.v3.getVariant('menu-title', TEXT_VARIANTS_MAP, 'Menu')}
        >
          {dyn.v3.getVariant('menu-title', TEXT_VARIANTS_MAP, 'Menu')}
        </h2>
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 gap-6 ${layout.restaurantDetail.menuClass}`}
          {...layout.getElementAttributes('menu-grid', 0)}
        >
          {(() => {
            const ordered = dyn.v1.changeOrderElements("menu-items", restaurant.menu.length);
            return ordered.map((orderIndex) => {
              const item = restaurant.menu[orderIndex];
              const index = orderIndex;
              return (
            <div
              key={item.id}
              className={`flex flex-col rounded-lg border-2 border-zinc-300 bg-white p-4 shadow-sm ${layout.generateSeedClass('menu-item')} ${dyn.v3.getVariant("card", CLASS_VARIANTS_MAP, "")} ds-${seedStructure}`}
              id={dyn.v3.getVariant(`menu-item-${index}`, ID_VARIANTS_MAP, `menu-item-${seedStructure}-${index}`)}
            >
              <div className="relative w-full h-32 mb-3 rounded-md overflow-hidden">
                <SafeImage
                  src={item.image}
                  alt={dyn.v3.getVariant(`menu-item-name-${index}`, TEXT_VARIANTS_MAP, item.name)}
                  fill
                  className="object-cover"
                />
              </div>
              <div
                className={`font-bold text-lg mb-1 ${layout.generateSeedClass('menu-item-name')} ds-${seedStructure}`}
                id={dyn.v3.getVariant(`menu-item-name-${index}`, ID_VARIANTS_MAP, `menu-item-name-${seedStructure}-${index}`)}
                aria-label={dyn.v3.getVariant(`menu-item-name-${index}`, TEXT_VARIANTS_MAP, item.name)}
              >
                {dyn.v3.getVariant(`menu-item-name-${index}`, TEXT_VARIANTS_MAP, item.name)}
              </div>
              <div
                className={`text-zinc-500 text-sm mb-2 flex-1 ${layout.generateSeedClass('menu-item-description')} ds-${seedStructure}`}
                id={dyn.v3.getVariant(`menu-item-description-${index}`, ID_VARIANTS_MAP, `menu-item-description-${seedStructure}-${index}`)}
                aria-label={dyn.v3.getVariant(`menu-item-description-${index}`, TEXT_VARIANTS_MAP, item.description)}
              >
                {dyn.v3.getVariant(`menu-item-description-${index}`, TEXT_VARIANTS_MAP, item.description)}
              </div>
              <div className="flex items-center justify-between mt-auto">
                <span
                  className={`font-semibold text-green-700 text-base ${layout.generateSeedClass('menu-item-price')} ds-${seedStructure}`}
                  id={dyn.v3.getVariant(`menu-item-price-${index}`, ID_VARIANTS_MAP, `menu-item-price-${seedStructure}-${index}`)}
                  aria-label={dyn.v3.getVariant(`menu-item-price-${index}`, TEXT_VARIANTS_MAP, `$${item.price.toFixed(2)}`)}
                >
                  ${item.price.toFixed(2)}
                </span>
                <Button
                  size="sm"
                  id={dyn.v3.getVariant('add-to-cart-btn', ID_VARIANTS_MAP, `add-to-cart-btn-${seedStructure}-${index}`)}
                  className={`${layout.generateSeedClass('add-to-cart-btn')} ${dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, "")} ds-${seedStructure}`}
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
                  aria-label={dyn.v3.getVariant('add-to-cart-btn', TEXT_VARIANTS_MAP, 'Add to Cart')}
                >
                  {dyn.v3.getVariant('add-to-cart-btn', TEXT_VARIANTS_MAP, 'Add to Cart')}
                </Button>
              </div>
            </div>
              );
            });
          })()}
        </div>
      </div>
      ))}

      {/* Reviews */}
      <ReviewsSection
        key="reviews"
        reviews={reviews}
        restaurant={restaurant}
        onDeleteReview={(index) => {
          setReviews((prev) => prev.filter((_, i) => i !== index));
        }}
      />

      {dyn.v1.addWrapDecoy("add-review-section", (
        <AddReviewForm
          restaurant={restaurant}
          onSubmit={(payload) => {
            setReviews((prev) => [
              {
                avatar: "",
                author: payload.author || "Guest",
                rating: payload.rating,
                comment: payload.comment,
                date: new Date().toLocaleDateString(),
              },
              ...prev,
            ]);
            logEvent(EVENT_TYPES.REVIEW_SUBMITTED, {
              ...payload,
              restaurantId: restaurant.id,
              restaurantName: restaurant.name,
              cuisine: restaurant.cuisine,
              restaurantRating: restaurant.rating,
            });
          }}
        />
      ))}

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
      {/* Floating Cart Access here! */}
      <CartFab />
    </div>
    ))
  );
}

function CartFab() {
  const items = useCartStore((s) => s.items);
  const router = useSeedRouter();
  const hasHydrated = useHasHydrated();
  const dynamicSystem = useDynamicSystem();
  const dyn = hasHydrated ? dynamicSystem : STATIC_DYN;
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
      className={dyn.v3.getVariant("cart-total-button-class", CLASS_VARIANTS_MAP, "fixed z-40 bottom-8 right-8 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg flex gap-2 px-6 py-3 items-center text-lg font-bold")}
      id={dyn.v3.getVariant("cart-total-button", ID_VARIANTS_MAP, "cart-total-button")}
      onClick={handleClick}
    >
      🛒{" "}
      <span>
        {total} item{total > 1 ? "s" : ""}
      </span>
    </button>
  );
}

function AddReviewForm({
  restaurant,
  onSubmit,
}: {
  restaurant: Restaurant;
  onSubmit: (payload: { author: string; rating: number; comment: string }) => void;
}) {
  const hasHydrated = useHasHydrated();
  const dynamicSystem = useDynamicSystem();
  const dyn = hasHydrated ? dynamicSystem : STATIC_DYN;
  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    onSubmit({
      author: author.trim() || "Guest",
      rating,
      comment: comment.trim(),
    });
    setComment("");
  };

  return (
    <Card className="mt-10 border-2 border-zinc-400 bg-white p-6 shadow-md">
      <h3 className="text-lg font-semibold mb-4">
        {dyn.v3.getVariant("review-title", TEXT_VARIANTS_MAP, "Leave a review")}
      </h3>
      {dyn.v1.addWrapDecoy("review-form", (
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={dyn.v3.getVariant("reviewer-name", ID_VARIANTS_MAP, "reviewer-name-input")}>
              {dyn.v3.getVariant("reviewer-name-label", TEXT_VARIANTS_MAP, "Name")}
            </Label>
            <Input
              id={dyn.v3.getVariant("reviewer-name", ID_VARIANTS_MAP, "reviewer-name-input")}
              className={dyn.v3.getVariant("review-input", CLASS_VARIANTS_MAP, "")}
              placeholder={dyn.v3.getVariant("reviewer-name-placeholder", TEXT_VARIANTS_MAP, "Your name")}
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={dyn.v3.getVariant("review-rating", ID_VARIANTS_MAP, "review-rating-input")}>
              {dyn.v3.getVariant("review-rating-label", TEXT_VARIANTS_MAP, "Rating")}
            </Label>
            <Select
              value={String(rating)}
              onValueChange={(v) => setRating(Number(v))}
            >
              <SelectTrigger
                id={dyn.v3.getVariant("review-rating", ID_VARIANTS_MAP, "review-rating-input")}
                className={dyn.v3.getVariant("select-trigger", CLASS_VARIANTS_MAP, "")}
              >
                <SelectValue placeholder={dyn.v3.getVariant("review-rating-placeholder", TEXT_VARIANTS_MAP, "Select rating")} />
              </SelectTrigger>
              <SelectContent>
                {[5, 4, 3, 2, 1].map((val) => (
                  <SelectItem key={val} value={String(val)}>
                    {val} stars
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor={dyn.v3.getVariant("review-comment", ID_VARIANTS_MAP, "review-comment-input")}>
            {dyn.v3.getVariant("review-comment-label", TEXT_VARIANTS_MAP, "Comment")}
          </Label>
          <Textarea
            id={dyn.v3.getVariant("review-comment", ID_VARIANTS_MAP, "review-comment-input")}
            placeholder={dyn.v3.getVariant("review-placeholder", TEXT_VARIANTS_MAP, `Share your experience at ${restaurant.name}`)}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className={dyn.v3.getVariant("review-textarea", CLASS_VARIANTS_MAP, "")}
          />
        </div>
        <Button
          type="submit"
          className={`bg-green-600 hover:bg-green-700 text-white ${dyn.v3.getVariant("submit-review", CLASS_VARIANTS_MAP, "")}`}
        >
          {dyn.v3.getVariant("submit-review", TEXT_VARIANTS_MAP, "Submit review")}
        </Button>
      </form>
      ))}
    </Card>
  );
}
