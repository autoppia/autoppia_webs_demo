import { restaurants } from "@/data/restaurants";
import RestaurantCard from "./RestaurantCard";

export default function FeaturedRestaurantsGrid() {
  return (
    <section className="my-14">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">
        {/* Featured Restaurants */}
      </h2>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 max-w-6xl mx-auto">
        {restaurants.map((r) => (
          <RestaurantCard
            key={r.id}
            id={r.id}
            name={r.name}
            image={r.image}
            cuisine={r.cuisine}
            rating={r.rating}
            description={r.description}
          />
        ))}
      </div>
    </section>
  );
}
