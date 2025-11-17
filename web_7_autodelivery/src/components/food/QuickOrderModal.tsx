"use client";
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { EVENT_TYPES, logEvent } from "@/components/library/events";
import { Search, Clock, Star, MapPin, Zap, Loader2 } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useSeedLayout } from "@/hooks/use-seed-layout";
import { useRestaurants } from "@/contexts/RestaurantContext";
import { useLayout } from "@/contexts/LayoutProvider";

interface QuickOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function QuickOrderModal({ open, onOpenChange }: QuickOrderModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"popular" | "search" | "recent">("popular");
  const addToCart = useCartStore((s) => s.addToCart);
  const layout = useSeedLayout();
  const { getNavigationUrl } = useLayout();
  const { restaurants, isLoading } = useRestaurants();
  
  // Get popular restaurants (those with high ratings or featured)
  const popularRestaurants = useMemo(
    () =>
      restaurants
        .filter((r) => r.rating >= 4.5 || r.featured)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 6),
    [restaurants]
  );

  // Get recently viewed restaurants (from localStorage)
  const getRecentRestaurants = () => {
    // Check if we're in the browser environment
    if (typeof window === "undefined") {
      return [];
    }
    
    try {
      const recent = localStorage.getItem("recent-restaurants");
      if (recent) {
        const recentIds = JSON.parse(recent);
        return restaurants
          .filter(r => recentIds.includes(r.id))
          .slice(0, 6);
      }
    } catch (error) {
      console.error("Error parsing recent restaurants:", error);
    }
    return [];
  };

  const recentRestaurants = getRecentRestaurants();

  // Filter restaurants based on search
  const searchResults = searchQuery.trim() 
    ? restaurants.filter(r => 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  // Determine which restaurants to show based on active tab
  const getDisplayRestaurants = () => {
    switch (activeTab) {
      case "search":
        return searchResults;
      case "recent":
        return recentRestaurants;
      default:
        return popularRestaurants;
    }
  };

  const filteredRestaurants = getDisplayRestaurants();

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </DialogContent>
      </Dialog>
    );
  }

  const handleRestaurantClick = (restaurant: typeof restaurants[0]) => {
    logEvent(EVENT_TYPES.VIEW_RESTAURANT, {
      id: restaurant.id,
      name: restaurant.name,
      cuisine: restaurant.cuisine,
      rating: restaurant.rating,
      source: "quick_order_modal"
    });
    onOpenChange(false);
    // Navigate to restaurant page
    window.location.href = getNavigationUrl(`/restaurants/${restaurant.id}`);
  };

  const handleQuickOrder = (restaurant: typeof restaurants[0]) => {
    logEvent(EVENT_TYPES.QUICK_ORDER_STARTED, {
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      cuisine: restaurant.cuisine
    });
    onOpenChange(false);
    // Navigate to restaurant page to start ordering
    window.location.href = getNavigationUrl(`/restaurants/${restaurant.id}`);
  };

  const handleQuickAddPopular = (restaurant: typeof restaurants[0]) => {
    // Add the first popular item from the restaurant to cart
    if (restaurant.menu.length > 0) {
      const popularItem = restaurant.menu[0]; // First item as "popular"
      addToCart(popularItem, restaurant.id);
      
      logEvent(EVENT_TYPES.QUICK_REORDER, {
        itemId: popularItem.id,
        itemName: popularItem.name,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        source: "quick_order_modal"
      });
      
      alert(`${popularItem.name} from ${restaurant.name} added to cart!`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-4xl max-h-[80vh] overflow-y-auto ${layout.modal.containerClass}`}>
        <div className={layout.modal.contentClass}>
          <DialogHeader className={layout.modal.headerClass}>
            <DialogTitle className="text-2xl font-bold text-center">
              Quick Order
            </DialogTitle>
            <p className="text-center text-zinc-600">
              Choose a restaurant to start ordering delicious food
            </p>
          </DialogHeader>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
          <Input
            placeholder="Search restaurants or cuisines..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value.trim()) {
                setActiveTab("search");
              } else {
                setActiveTab("popular");
              }
            }}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-zinc-100 p-1 rounded-lg">
          <button
            onClick={() => {
              setActiveTab("popular");
              setSearchQuery("");
            }}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === "popular" 
                ? "bg-white text-zinc-900 shadow-sm" 
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Popular
          </button>
          {recentRestaurants.length > 0 && (
            <button
              onClick={() => {
                setActiveTab("recent");
                setSearchQuery("");
              }}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === "recent" 
                  ? "bg-white text-zinc-900 shadow-sm" 
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Recent
            </button>
          )}
          {searchQuery.trim() && (
            <button
              onClick={() => setActiveTab("search")}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === "search" 
                  ? "bg-white text-zinc-900 shadow-sm" 
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Search
            </button>
          )}
        </div>

        {/* Popular Restaurants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRestaurants.map((restaurant) => (
            <Card key={restaurant.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="relative h-32 rounded-t-lg overflow-hidden">
                <Image
                  src={restaurant.image}
                  alt={restaurant.name}
                  fill
                  className="object-cover"
                />
                {restaurant.featured && (
                  <Badge className="absolute top-2 left-2 bg-orange-500">
                    Featured
                  </Badge>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg truncate flex-1">
                    {restaurant.name}
                  </h3>
                  <div className="flex items-center gap-1 ml-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{restaurant.rating}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-zinc-600 mb-2">
                  <MapPin className="h-3 w-3" />
                  <span>{restaurant.cuisine}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-zinc-600 mb-3">
                  <Clock className="h-3 w-3" />
                  <span>{restaurant.deliveryTime}</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleRestaurantClick(restaurant)}
                  >
                    View Menu
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleQuickOrder(restaurant)}
                  >
                    Order Now
                  </Button>
                </div>
                {restaurant.menu.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2 text-xs text-zinc-600 hover:text-green-600"
                    onClick={() => handleQuickAddPopular(restaurant)}
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    Quick Add Popular Item
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredRestaurants.length === 0 && (
          <div className="text-center py-8">
            {activeTab === "search" && searchQuery.trim() ? (
              <>
                <p className="text-zinc-500 mb-4">No restaurants found for "{searchQuery}"</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveTab("popular");
                  }}
                >
                  View Popular Restaurants
                </Button>
              </>
            ) : activeTab === "recent" ? (
              <>
                <p className="text-zinc-500 mb-4">No recent restaurants</p>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("popular")}
                >
                  View Popular Restaurants
                </Button>
              </>
            ) : (
              <p className="text-zinc-500">No restaurants available</p>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="font-semibold mb-3">Quick Actions</h4>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                logEvent(EVENT_TYPES.VIEW_ALL_RESTAURANTS, { source: "quick_order_modal" });
                onOpenChange(false);
                window.location.href = getNavigationUrl("/restaurants");
              }}
            >
              View All Restaurants
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                window.location.href = getNavigationUrl("/cart");
              }}
            >
              View Cart
            </Button>
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
