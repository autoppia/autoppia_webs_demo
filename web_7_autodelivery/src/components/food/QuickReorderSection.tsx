"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cart-store";
import { EVENT_TYPES, logEvent } from "@/components/library/events";
import { Clock, RotateCcw } from "lucide-react";
import { useLayout } from "@/contexts/LayoutProvider";
import { SafeImage } from "@/components/ui/SafeImage";

interface RecentOrder {
  id: string;
  name: string;
  image: string;
  price: number;
  restaurantId: string;
  restaurantName: string;
  cuisine: string;
  orderDate: string;
}

export default function QuickReorderSection() {
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const addToCart = useCartStore((s) => s.addToCart);
  const { getNavigationUrl } = useLayout();

  useEffect(() => {
    // Load recent orders from localStorage
    if (typeof window !== "undefined") {
      try {
        const recent = localStorage.getItem("recent-orders");
        if (recent) {
          const orders = JSON.parse(recent);
          setRecentOrders(orders.slice(0, 4)); // Show last 4 orders
        }
      } catch (error) {
        console.error("Error loading recent orders:", error);
      }
    }
  }, []);

  const handleQuickReorder = (order: RecentOrder) => {
    // Add item to cart
    addToCart({
      id: order.id,
      name: order.name,
      description: "",
      price: order.price,
      image: order.image,
    }, order.restaurantId);

    // Log the event
    logEvent(EVENT_TYPES.QUICK_REORDER, {
      itemId: order.id,
      itemName: order.name,
      restaurantId: order.restaurantId,
      restaurantName: order.restaurantName,
    });

    // Show success message
    alert(`${order.name} added to cart!`);
  };

  const handleViewRestaurant = (order: RecentOrder) => {
    logEvent(EVENT_TYPES.VIEW_RESTAURANT, {
      id: order.restaurantId,
      name: order.restaurantName,
      source: "quick_reorder"
    });
    window.location.href = getNavigationUrl(`/restaurants/${order.restaurantId}`);
  };

  if (recentOrders.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <RotateCcw className="h-5 w-5 text-green-600" />
        <h3 className="text-lg font-semibold">Quick Reorder</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {recentOrders.map((order) => (
          <Card key={order.id} className="hover:shadow-lg transition-shadow">
            <div className="relative h-24 rounded-t-lg overflow-hidden">
              <SafeImage
                src={order.image}
                alt={order.name}
                fill
                className="object-cover"
              />
              <Badge className="absolute top-2 left-2 bg-green-600 text-xs">
                Recent
              </Badge>
            </div>
            <CardContent className="p-3">
              <h4 className="font-semibold text-sm truncate mb-1">
                {order.name}
              </h4>
              <p className="text-xs text-zinc-600 mb-2">
                {order.restaurantName}
              </p>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-green-700 text-sm">
                  ${order.price.toFixed(2)}
                </span>
                <div className="flex items-center gap-1 text-xs text-zinc-500">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(order.orderDate).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex gap-1">
                <Button
                  size="sm"
                  className="flex-1 text-xs bg-green-600 hover:bg-green-700"
                  onClick={() => handleQuickReorder(order)}
                >
                  Reorder
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleViewRestaurant(order)}
                >
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
} 
