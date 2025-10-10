"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  seed: number;
}

const getCardShiftClasses = (seed: number = 1) => {
  const marginLeftRightOptions = ["ml-0", "ml-2", "ml-4", "mr-2", "mr-4"];
  const marginTopOptions = ["mt-2", "mt-12", "mt-4", "mt-16", "mt-24"];
  const index = seed % marginLeftRightOptions.length;

  return {
    horizontal: marginLeftRightOptions[index],
    vertical: marginTopOptions[index],
  };
};

export function CategoryCard({
  title,
  items,
  footerLink,
  columns = 2,
  singleImage,
  seed = 1,
}: CategoryCardProps) {
  const router = useRouter();
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
  };

  const { horizontal, vertical } = getCardShiftClasses(seed);

  return (
    <Card className={`category-card ${horizontal} ${vertical}`}>
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
              <a
                href={item.link || "#"}
                title={item.link ? `View ${item.title} - ${item.link}` : item.title}
                key={`${item.title}-${index}`}
                onClick={(e) => {
                  if (item.link && item.link !== "#") {
                    e.preventDefault();
                    logEvent(EVENT_TYPES.VIEW_DETAIL, {
                      title: item.title,
                      section: title,
                      price: item.price || "$0.00",
                      rating: item.rating ?? 0,
                      brand: item.brand || "Generic",
                      category: item.category || title || "Uncategorized",
                    });
                    router.push(item.link);
                  }
                }}
                className="space-y-2 hover:opacity-90 transition-opacity block no-underline text-inherit cursor-pointer group"
              >
                <div className="relative h-36 w-full">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                  {/* URL Display on Hover - only show if there's a valid link */}
                  {item.link && item.link !== "#" && (
                    <div className="absolute bottom-2 left-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 truncate pointer-events-none">
                      {item.link}
                    </div>
                  )}
                </div>
                <h3 className="text-sm hover:text-blue-600">{item.title}</h3>
              </a>
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
