import * as React from "react";
import Link from "next/link";
import Image from "next/image";

function formatDateRange(datesFrom: string, datesTo: string) {
  const fromDate = new Date(datesFrom);
  const toDate = new Date(datesTo);

  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };

  const fromFormatted = fromDate.toLocaleDateString("en-US", options);
  const toFormatted = toDate.toLocaleDateString("en-US", options);

  return `${fromFormatted} - ${toFormatted}`;
}

export function PropertyCard({
  image,
  title,
  location,
  rating,
  price,
  id,
  datesFrom,
  datesTo,
}: {
  image: string;
  title: string;
  location: string;
  rating: number;
  price: number;
  id: number;
  datesFrom: string;
  datesTo: string;
}) {
  return (
    <Link href={`/stay/${id}`} className="block">
      <div className="bg-white rounded-3xl shadow-md border flex flex-col overflow-hidden group relative transition hover:-translate-y-0.5 hover:shadow-xl cursor-pointer">
        <div className="relative aspect-[1.25/1] overflow-hidden">
          <Image
            src={image}
            alt={title}
            width={100}
            height={100}
            quality={30}
            className="w-full h-full object-cover group-hover:scale-105 transition"
          />
          {/* <button className="absolute top-3 right-3 p-2 bg-white/80 rounded-full z-10 border border-neutral-200 hover:bg-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              width={22}
              height={22}
              className="text-neutral-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              />
            </svg>
          </button> */}
        </div>
        <div className="p-4 flex flex-col gap-1 pb-2">
          <div className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="#FF5A5F"
              viewBox="0 0 24 24"
              stroke="none"
              width={16}
              height={16}
              className="inline"
            >
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
            <span className="font-semibold text-[15px] leading-none mr-1">
              {rating.toFixed(2)}
            </span>
          </div>
          <div className="font-medium text-[17px] text-neutral-800 truncate -mb-0.5">
            {title}
          </div>
          <div className="text-xs text-neutral-500">{location}</div>
          <div className="text-xs text-neutral-500 -mt-1">
            {formatDateRange(datesFrom, datesTo)}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className="font-semibold text-neutral-800">${price}</span>
            <span className="text-xs text-neutral-500">night</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
