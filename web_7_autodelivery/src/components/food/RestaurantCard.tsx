import { Card, CardContent } from "@/components/ui/card";
import { SafeImage } from "@/components/ui/SafeImage";
import { SeedLink } from "@/components/ui/SeedLink";
import { EVENT_TYPES, logEvent } from "@/components/library/events";
import { useLayout } from "@/contexts/LayoutProvider";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP } from "@/dynamic/v3";

interface RestaurantCardProps {
  id: string;
  name: string;
  image: string;
  cuisine: string;
  rating: number;
  description?: string;
}

export default function RestaurantCard({ id, name, image, cuisine, rating, description }: RestaurantCardProps) {
  const layout = useLayout();
  const dyn = useDynamicSystem();

  const handleClick = () => {
    // Ensure id is valid before proceeding
    if (!id) {
      console.warn("RestaurantCard: id is undefined or null");
      return;
    }

    // Log the event
    logEvent(EVENT_TYPES.VIEW_RESTAURANT, {
      id,
      name,
      cuisine,
      rating,
    });

    // Save to recent restaurants
    if (typeof window !== "undefined") {
      try {
        const recent = localStorage.getItem("recent-restaurants");
        let recentIds = recent ? JSON.parse(recent) : [];

        // Remove if already exists and add to front
        recentIds = recentIds.filter((restId: string) => restId !== id);
        recentIds.unshift(id);

        // Keep only last 10
        recentIds = recentIds.slice(0, 10);

        localStorage.setItem("recent-restaurants", JSON.stringify(recentIds));
      } catch (error) {
        console.error("Error saving recent restaurant:", error);
      }
    }
  };

  const cardIndex = Number.parseInt(typeof id === 'string' ? id.replace('restaurant-', '') : '0') || 0;

  return (
    <>
      {dyn.v1.addWrapDecoy("restaurant-card", (
        <SeedLink
          href={`/restaurants/${id || 'unknown'}`}
          onClick={handleClick}
          className="block h-full"
          {...layout.getElementAttributes('VIEW_DELIVERY_RESTAURANT', cardIndex)}
        >
          <Card
            id={dyn.v3.getVariant("restaurant-card", ID_VARIANTS_MAP, "restaurant-card")}
            className={`group flex h-full min-h-[320px] cursor-pointer flex-col overflow-hidden rounded-2xl border border-emerald-200/80 bg-white shadow-[0_10px_30px_-22px_rgba(2,132,199,0.75)] transition-all duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-[0_20px_40px_-28px_rgba(5,150,105,0.8)] ${layout.restaurantCard.containerClass} ${dyn.v3.getVariant("card", CLASS_VARIANTS_MAP, "")}`}
          >
            <div
              id={dyn.v3.getVariant("restaurant-image", ID_VARIANTS_MAP, "restaurant-image")}
              className={`relative h-52 w-full overflow-hidden ${layout.restaurantCard.imageClass} ${dyn.v3.getVariant("card-image", CLASS_VARIANTS_MAP, "")}`}
            >
              <SafeImage
                src={image}
                alt={name}
                fill
                style={{ objectFit: 'cover' }}
                className="transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 400px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/35 to-transparent" />
            </div>
            <CardContent className={`flex flex-1 flex-col space-y-2 bg-gradient-to-b from-white to-emerald-50/30 p-4 ${layout.restaurantCard.containerClass}`}>
              <div className="flex items-center justify-between">
                <h2
                  id={dyn.v3.getVariant("restaurant-name", ID_VARIANTS_MAP, "restaurant-name")}
                  className={`truncate text-lg font-bold text-zinc-900 ${layout.restaurantCard.titleClass} ${dyn.v3.getVariant("card-title", CLASS_VARIANTS_MAP, "")}`}
                >
                  {name}
                </h2>
                <span
                  id={dyn.v3.getVariant("rating-stars", ID_VARIANTS_MAP, "rating-stars")}
                  className={`rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ${dyn.v3.getVariant("badge", CLASS_VARIANTS_MAP, "")}`}
                >
                  ★ {rating}
                </span>
              </div>
              <div className={`text-sm font-medium text-emerald-700 ${layout.restaurantCard.descriptionClass}`}>{cuisine}</div>
              {description && <div className="line-clamp-2 text-sm text-zinc-500">{description}</div>}
            </CardContent>
          </Card>
        </SeedLink>
      ))}
    </>
  );
}
