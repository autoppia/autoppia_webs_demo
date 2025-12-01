"use client";

import { SeedLink } from "@/components/ui/SeedLink";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useV3Attributes } from "@/dynamic/v3-dynamic";
import { logEvent, EVENT_TYPES } from "@/events";
import { SafeImage } from "@/components/ui/SafeImage";

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

const getCardShiftClasses = (seed = 1) => {
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

  const { getId } = useV3Attributes();
  const router = useSeedRouter();

  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
  };

  const { horizontal, vertical } = getCardShiftClasses(seed);

  return (
    <Card id={getId("category_card")} className={`category-card ${horizontal} ${vertical}`}>
      <CardContent className="p-4">
        <h2 className="category-title">{title}</h2>

        {singleImage ? (
          <SeedLink
            href={footerLink?.href || "/search"}
            className="block relative h-60 w-full hover:opacity-90 transition-opacity"
          >
            <SafeImage
              src={singleImage}
              alt={title}
              fill
              className="object-cover"
              fallbackSrc="/images/homepage_categories/coffee_machine.jpg"
            />
          </SeedLink>
        ) : (
          <div className={`grid ${gridCols[columns]} gap-4`}>
            {items.map((item, index) => (
              <button
                key={`${item.title}-${index}`}
                type="button"
                title={item.link ? `View ${item.title} - ${item.link}` : item.title}
                onClick={() => {
                  if (!item.link) return;
                  logEvent(EVENT_TYPES.VIEW_DETAIL, {
                    title: item.title,
                    section: title,
                    price: item.price || "$0.00",
                    rating: item.rating ?? 0,
                    brand: item.brand || "Generic",
                    category: item.category || title || "Uncategorized",
                  });
                  router.push(item.link);
                }}
                disabled={!item.link}
                className={`space-y-2 transition-opacity block no-underline text-inherit group ${
                  item.link ? "hover:opacity-90 cursor-pointer" : "cursor-not-allowed opacity-70"
                }`}
              >
                <div className="relative h-36 w-full">
                  <SafeImage
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover rounded-xl"
                    fallbackSrc="/images/homepage_categories/coffee_machine.jpg"
                  />
                  {/* URL Display on Hover - only show if there's a valid link */}
                  {item.link && (
                    <div className="absolute bottom-2 left-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 truncate pointer-events-none">
                      {item.link}
                    </div>
                  )}
                </div>
                <h3 className="text-sm hover:text-blue-600">{item.title}</h3>
              </button>
            ))}
          </div>
        )}
      </CardContent>

      {footerLink && (
        <CardFooter className="px-4 pt-0 pb-4">
          <SeedLink
            href={footerLink.href}
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            {footerLink.text}
          </SeedLink>
        </CardFooter>
      )}
    </Card>
  );
}
