"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { logEvent, EVENT_TYPES } from "@/library/events";

interface CategoryItem {
  image: string;
  title: string;
  link?: string;
  price?: string;
  rating?: number;
  brand?: string;
  category?: string;
}

interface CategoryCardProps {
  title: string;
  items: CategoryItem[];
  footerLink?: {
    text: string;
    href: string;
  };
  columns?: 2 | 3 | 4;
  singleImage?: string;
}

export function CategoryCard({
  title,
  items,
  footerLink,
  columns = 2,
  singleImage,
}: CategoryCardProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
  };

  return (
    <Card className="category-card">
      <CardContent className="p-4">
        <h2 className="category-title">{title}</h2>

        {singleImage ? (
          <Link
            href={footerLink?.href || "#"}
            className="block relative h-60 w-full hover:opacity-90 transition-opacity"
          >
            <Image
              src={singleImage}
              alt={title}
              fill
              className="object-cover"
            />
          </Link>
        ) : (
          <div className={`grid ${gridCols[columns]} gap-4`}>
            {items.map((item, index) => (
              <Link
                href={item.link || "#"}
                key={`${item.title}-${index}`}
                onClick={() =>
                  logEvent(EVENT_TYPES.VIEW_DETAIL, {
                    title: item.title,
                    section: title,
                    price: item.price || "$0.00",
                    rating: item.rating ?? 0,
                    brand: item.brand || "Generic",
                    category: item.category || title || "Uncategorized",
                  })
                }
                className="space-y-2 hover:opacity-90 transition-opacity"
              >
                <div className="relative h-36 w-full">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-sm hover:text-blue-600">{item.title}</h3>
              </Link>
            ))}
          </div>
        )}
      </CardContent>

      {footerLink && (
        <CardFooter className="px-4 pt-0 pb-4">
          <Link
            href={footerLink.href}
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            {footerLink.text}
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
