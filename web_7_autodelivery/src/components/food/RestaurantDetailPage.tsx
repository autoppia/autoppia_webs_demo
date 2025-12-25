"use client";
import { useEffect, useMemo, useState } from "react";
import { MenuItem, MenuItemSize, type Restaurant } from "@/data/restaurants";
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
  const dyn = useDynamicSystem();
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
            key={i}
            className={`bg-white rounded-xl shadow p-5 flex items-start gap-4 group relative ${dyn.v3.getVariant('review-item-class', CLASS_VARIANTS_MAP, '')}`}
            id={dyn.v3.getVariant(`review-item-${i}`, ID_VARIANTS_MAP, `review-item-${i}`)}
          >
            <SafeImage
              src={r.avatar}
              alt={r.author}
              width={48}
              height={48}
              className="rounded-full object-cover border"
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
                id={dyn.v3.getVariant(`delete-review-btn-${i}`, ID_VARIANTS_MAP, `delete-review-btn-${i}`)}
                onClick={() => {
                  onDeleteReview(i);
                  logEvent(EVENT_TYPES.DELETE_REVIEW, {
                    reviewIndex: i,
                    author: r.author,
                    rating: r.rating,
                    restaurantId: restaurant.id,
                    restaurantName: restaurant.name,
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
  const seedStructure = layout.seed;
  const dyn = useDynamicSystem();
  const router = useSeedRouter();
  const { restaurants, isLoading } = useRestaurants();
  const restaurant = useMemo(() => {
    return restaurants.find((r) => r.id === restaurantId);
  }, [restaurantId, restaurants]);

  const addToCart = useCartStore((state) => state.addToCart);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalItem, setModalItem] = useState<MenuItem | null>(null);
  const [mode, setMode] = useState<"delivery" | "pickup">("delivery");
  const [reviews, setReviews] = useState<Review[]>(restaurant?.reviews ?? []);

  useEffect(() => {
    if (restaurant?.reviews) {
      setReviews(restaurant.reviews);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurant?.id]);

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

  if (isLoading && !restaurant) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!restaurant)
    return <div className="text-lg text-zinc-500">Restaurant not found.</div>;

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
      className={`max-w-5xl mx-auto px-2 sm:px-0 ${layout.restaurantDetail.containerClass} ${dyn.v3.getVariant("container", CLASS_VARIANTS_MAP, "")} ds-${seedStructure}`}
      id={dyn.v3.getVariant('restaurant-detail-page', ID_VARIANTS_MAP, `restaurant-detail-page-${seedStructure}`)}
      aria-label={dyn.v3.getVariant('restaurant-detail-page', TEXT_VARIANTS_MAP, 'Restaurant detail page')}
    >
      {/* Header */}
      <div 
        className={`flex flex-col md:flex-row gap-6 md:items-center mt-6 mb-8 ${layout.restaurantDetail.headerClass} ds-${seedStructure}`}
        {...layout.getElementAttributes('restaurant-header', 0)}
      >
        <div className="relative w-full md:w-80 h-52 rounded-xl overflow-hidden shadow">
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
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-green-700 bg-green-50 border border-green-100 px-2 py-1 rounded-full">
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
            className={`${layout.generateSeedClass('back-button')} ds-${seedStructure}`}
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

      {/* Menu */}
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
              className={`bg-white rounded-lg shadow p-4 flex flex-col ${layout.generateSeedClass('menu-item')} ${dyn.v3.getVariant("card", CLASS_VARIANTS_MAP, "")} ds-${seedStructure}`}
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

      {/* Reviews */}
      <ReviewsSection 
        key="reviews"
        reviews={reviews} 
        restaurant={restaurant}
        onDeleteReview={(index) => {
          setReviews((prev) => prev.filter((_, i) => i !== index));
        }}
      />

      <AddReviewForm
        restaurant={restaurant}
        onSubmit={(payload) => {
          setReviews((prev) => [
            {
              avatar: "/media/avatars/default-avatar.jpg",
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

function AddReviewForm({
  restaurant,
  onSubmit,
}: {
  restaurant: Restaurant;
  onSubmit: (payload: { author: string; rating: number; comment: string }) => void;
}) {
  const dyn = useDynamicSystem();
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
    <Card className="mt-10 p-6 bg-white shadow-sm border border-zinc-200">
      <h3 className="text-lg font-semibold mb-4">Leave a review</h3>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={dyn.v3.getVariant("reviewer-name", ID_VARIANTS_MAP, "reviewer-name-input")}>Name</Label>
            <Input
              id={dyn.v3.getVariant("reviewer-name", ID_VARIANTS_MAP, "reviewer-name-input")}
              placeholder="Your name"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={dyn.v3.getVariant("review-rating", ID_VARIANTS_MAP, "review-rating-input")}>Rating</Label>
            <Select
              value={String(rating)}
              onValueChange={(v) => setRating(Number(v))}
            >
              <SelectTrigger id={dyn.v3.getVariant("review-rating", ID_VARIANTS_MAP, "review-rating-input")}>
                <SelectValue placeholder="Select rating" />
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
          <Label htmlFor={dyn.v3.getVariant("review-comment", ID_VARIANTS_MAP, "review-comment-input")}>Comment</Label>
          <Textarea
            id={dyn.v3.getVariant("review-comment", ID_VARIANTS_MAP, "review-comment-input")}
            placeholder={dyn.v3.getVariant("review-placeholder", TEXT_VARIANTS_MAP, `Share your experience at ${restaurant.name}`)}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
        </div>
        <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
          Submit review
        </Button>
      </form>
    </Card>
  );
}
