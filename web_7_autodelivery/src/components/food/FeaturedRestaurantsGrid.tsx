import Link from "next/link";
import { restaurants } from "@/data/restaurants";
import RestaurantCard from "./RestaurantCard";
import { EVENT_TYPES, logEvent } from "@/components/library/events";

export default function FeaturedRestaurantsGrid() {
  return (
    <section className="my-14">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">
        {/* Featured Restaurants */}
      </h2>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 max-w-6xl mx-auto">
        {restaurants.map((r) => (
          <Link
            key={r.id}
            href={`/restaurants/${r.id}`}
            onClick={() =>
              logEvent(EVENT_TYPES.VIEW_RESTAURANT, {
                id: r.id,
                name: r.name,
                cuisine: r.cuisine,
                rating: r.rating,
              })
            }
          >
            <RestaurantCard
              id={r.id}
              name={r.name}
              image={r.image}
              cuisine={r.cuisine}
              rating={r.rating}
              description={r.description}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
