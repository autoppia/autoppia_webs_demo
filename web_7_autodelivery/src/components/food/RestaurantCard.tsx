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

  const cardIndex = parseInt(typeof id === 'string' ? id.replace('restaurant-', '') : '0') || 0;

  return (
    <>
      {dyn.v1.addWrapDecoy("restaurant-card", (
        <SeedLink 
          href={`/restaurants/${id || 'unknown'}`}
          onClick={handleClick}
          {...layout.getElementAttributes('VIEW_DELIVERY_RESTAURANT', cardIndex)}
        >
          <Card 
            id={dyn.v3.getVariant("restaurant-card", ID_VARIANTS_MAP, "restaurant-card")}
            className={`hover:shadow-xl transition-shadow duration-200 cursor-pointer ${layout.restaurantCard.containerClass} ${dyn.v3.getVariant("card", CLASS_VARIANTS_MAP, "")}`}
          >
            <div 
              id={dyn.v3.getVariant("restaurant-image", ID_VARIANTS_MAP, "restaurant-image")}
              className={`relative w-full h-48 rounded-t-xl overflow-hidden ${layout.restaurantCard.imageClass} ${dyn.v3.getVariant("card-image", CLASS_VARIANTS_MAP, "")}`}
            >
              <SafeImage
                src={image}
                alt={name}
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>
            <CardContent className={`p-4 ${layout.restaurantCard.containerClass}`}>
              <div className="flex items-center justify-between">
                <h2 
                  id={dyn.v3.getVariant("restaurant-name", ID_VARIANTS_MAP, "restaurant-name")}
                  className={`font-bold text-lg truncate ${layout.restaurantCard.titleClass} ${dyn.v3.getVariant("card-title", CLASS_VARIANTS_MAP, "")}`}
                >
                  {name}
                </h2>
                <span 
                  id={dyn.v3.getVariant("rating-stars", ID_VARIANTS_MAP, "rating-stars")}
                  className={`bg-green-100 text-green-700 rounded-full px-3 py-1 text-xs font-semibold ${dyn.v3.getVariant("badge", CLASS_VARIANTS_MAP, "")}`}
                >
                  ★ {rating}
                </span>
              </div>
              <div className={`text-zinc-500 text-sm mt-1 mb-0.5 ${layout.restaurantCard.descriptionClass}`}>{cuisine}</div>
              {description && <div className="text-xs text-zinc-400 line-clamp-2">{description}</div>}
            </CardContent>
          </Card>
        </SeedLink>
      ))}
    </>
  );
}
