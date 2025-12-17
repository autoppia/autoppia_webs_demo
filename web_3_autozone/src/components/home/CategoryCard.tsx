"use client";

import { useMemo } from "react";
import { SeedLink } from "@/components/ui/SeedLink";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP } from "@/dynamic/v3";
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
  const dyn = useDynamicSystem();
  const router = useSeedRouter();

  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
  };

  const { horizontal, vertical } = getCardShiftClasses(seed);

  // Dynamic ordering for category items
  const orderedItems = useMemo(() => {
    if (singleImage || items.length === 0) return items;
    const order = dyn.v1.changeOrderElements(`category-card-${title}`, items.length);
    return order.map((idx) => items[idx]);
  }, [dyn.seed, items, title, singleImage]);

  return (
    dyn.v1.addWrapDecoy(`category-card-${title}`, (
      <Card 
        id={dyn.v3.getVariant("category-card", ID_VARIANTS_MAP, `category-card-${title}`)} 
        className={dyn.v3.getVariant("card", CLASS_VARIANTS_MAP, `category-card ${horizontal} ${vertical}`)}
      >
        {dyn.v1.addWrapDecoy(`category-card-content-${title}`, (
          <CardContent className="p-4">
            <h2 className="category-title">{title}</h2>

            {singleImage ? (
              dyn.v1.addWrapDecoy(`category-card-image-${title}`, (
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
              ))
            ) : (
              <div className={`grid ${gridCols[columns]} gap-4`}>
                {orderedItems.map((item, index) => (
                  dyn.v1.addWrapDecoy(`category-item-${item.title}-${index}`, (
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
                      id={dyn.v3.getVariant("category-link", ID_VARIANTS_MAP, `category-item-${index}`)}
                      className={dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, `space-y-2 transition-opacity block no-underline text-inherit group ${
                        item.link ? "hover:opacity-90 cursor-pointer" : "cursor-not-allowed opacity-70"
                      }`)}
                    >
                      {dyn.v1.addWrapDecoy(`category-item-image-${item.title}-${index}`, (
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
                      ))}
                      <h3 className="text-sm hover:text-blue-600">{item.title}</h3>
                    </button>
                  ), `${item.title}-${index}`)
                ))}
              </div>
            )}
          </CardContent>
        ))}

        {footerLink && (
          dyn.v1.addWrapDecoy(`category-card-footer-${title}`, (
            <CardFooter className="px-4 pt-0 pb-4">
              <SeedLink
                href={footerLink.href}
                id={dyn.v3.getVariant("category-link", ID_VARIANTS_MAP)}
                className={dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "text-sm text-blue-600 hover:text-blue-800 hover:underline")}
              >
                {footerLink.text}
              </SeedLink>
            </CardFooter>
          ))
        )}
      </Card>
    ), title)
  );
}
