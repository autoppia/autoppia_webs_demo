import * as React from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import Image from "next/image";
import { useV3Attributes } from "@/dynamic/v3-dynamic";

// Example static data
const RECENT_SEARCHES = [
  {
    country: "Barcelona",
    text: "Jul 12 - Jul 16 | 2 Guests",
    image: "/images/hotel1.jpeg", // changed from img to image
  },
  {
    country: "Lisbon",
    text: "Aug 15 - Aug 22 | 2 Guests",
    image: "/images/hotel2.jpeg",
  },
  {
    country: "Bali",
    text: "Jul 18 - Jul 24 | 6 Guests",
    image: "/images/hotel3.png",
  },
  {
    country: "Rome",
    text: "Jul 28 - Aug 10 | 4 Guests",
    image: "/images/hotel4.png",
  },
];

const REGIONS = [
  {
    label: "I'm flexible",
    img: "images/hotel1.jpeg",
  },
  { label: "Bali", img: "images/hotel5.png" },
  { label: "Kyoto", img: "images/hotel6.png" },
  { label: "Berlin", img: "images/hotel7.jpg" },
  { label: "Cape Town", img: "images/hotel8.jpg" },
  { label: "Queenstown", img: "images/hotel9.jpg" },
  { label: "Reykjavík", img: "images/hotel10.jpg" },
  { label: "Amsterdam", img: "images/hotel11.png" },
  { label: "Florence", img: "images/hotel12.png" },
];

export function WherePopover({
  children,
  searchTerm,
  setSearchTerm,
}: {
  children: React.ReactNode;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState(searchTerm);
  const { getText, getId } = useV3Attributes();

  // sync with parent
  React.useEffect(() => setInput(searchTerm), [searchTerm]);

  const commit = (val: string) => {
    setSearchTerm(val === "I'm flexible" ? "" : val);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        id={getId("where_popover_content")}
        sideOffset={12}
        align="start"
        className="min-w-[650px] shadow-xl px-0 py-4 rounded-3xl border bg-white"
      >
        <div className="flex flex-row gap-16 px-8">
          <div className="min-w-[220px]">
            <input
              className="mb-5 w-full px-3 py-2 border rounded-xl text-[15px] focus:outline-none focus:ring-2 ring-neutral-200 transition"
              placeholder={getText("where_placeholder", "Search destinations")}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && input.trim()) commit(input.trim());
              }}
            />
            <h3 className="font-semibold mb-3 text-neutral-800">
              {getText("recent_searches", "Recent searches")}
            </h3>
            <div className="flex flex-col gap-2">
              {RECENT_SEARCHES.map((r) => (
                <div
                  key={r.country}
                  className="flex gap-3 items-center px-2 py-2 rounded-xl hover:bg-neutral-100 cursor-pointer"
                  onClick={() => commit(r.country)}
                >
                  <img
                    src={r.image}
                    alt={r.country}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <div className="font-medium text-[17px] leading-none">
                      {r.country}
                    </div>
                    <div className="text-xs text-neutral-500 whitespace-nowrap">
                      {r.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-neutral-800">
              {getText("search_by_region", "Search by region")}
            </h3>
            <div className="grid grid-cols-3 gap-5">
              {REGIONS.map((r) => (
                <div
                  key={r.label}
                  className="flex flex-col gap-2 items-center p-2 rounded-2xl hover:bg-neutral-100 cursor-pointer transition border border-neutral-200 shadow-sm w-[100px] h-[110px]"
                  onClick={() => commit(r.label)}
                >
                  <img
                    src={r.img}
                    className="rounded-xl w-16 h-14 object-cover"
                    alt={r.label}
                  />
                  <span className="text-[15px] font-medium text-neutral-700 text-center whitespace-nowrap leading-4">
                    {r.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
