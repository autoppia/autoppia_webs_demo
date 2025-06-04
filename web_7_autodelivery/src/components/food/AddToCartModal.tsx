"use client";
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Minus, Plus } from "lucide-react";
import Image from "next/image";
import {
  type MenuItem,
  type MenuItemSize,
  type MenuItemOption,
} from "@/data/restaurants";
import { EVENT_TYPES, logEvent } from "../library/events";

export type AddToCartModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: MenuItem;
  onAdd: (cartData: {
    size?: MenuItemSize;
    options: string[];
    preferences?: string;
    quantity: number;
  }) => void;
};

export function AddToCartModal({
  open,
  onOpenChange,
  item,
  onAdd,
}: AddToCartModalProps) {
  const [size, setSize] = React.useState<MenuItemSize | undefined>(
    item.sizes?.[0]
  );
  const [checkedOptions, setCheckedOptions] = React.useState<string[]>([]);
  const [preferences, setPreferences] = React.useState("");
  const [qty, setQty] = React.useState(1);

  React.useEffect(() => {
    setSize(item.sizes?.[0]);
    setCheckedOptions([]);
    setPreferences("");
    setQty(1);
  }, [item, open]);

  const price = React.useMemo(() => {
    let p = item.price;
    if (size) p += size.priceMod;
    return p * qty;
  }, [item.price, size, qty]);

  function handleOptionChange(opt: string, checked: boolean) {
    setCheckedOptions((prev) =>
      checked ? [...prev, opt] : prev.filter((o) => o !== opt)
    );
  }

  function handleAdd() {
    logEvent(EVENT_TYPES.ADD_TO_CART, {
      itemId: item.id,
      itemName: item.name,
      basePrice: item.price,
      size: size?.name,
      sizePriceMod: size?.priceMod || 0,
      options: checkedOptions,
      preferences,
      quantity: qty,
      totalPrice: price,
    });
    onAdd({ size, options: checkedOptions, preferences, quantity: qty });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-2xl px-0 sm:px-0 p-0">
        <div className="max-h-[90vh] overflow-y-auto">
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle>{item.name}</DialogTitle>
          </DialogHeader>
          <div className="px-6 flex gap-3 items-center mb-2">
            <div className="rounded-xl overflow-hidden w-16 h-16 relative">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
            <span className="text-zinc-700 text-lg font-semibold">
              ${item.price.toFixed(2)}
            </span>
          </div>
          <div className="px-6 w-full mb-2 text-zinc-600 text-sm">
            {item.description}
          </div>

          {item.sizes && (
            <div className="px-6 mt-4">
              <div className="font-semibold mb-2">Select Size</div>
              <RadioGroup
                value={size?.name || ""}
                onValueChange={(name) =>
                  setSize(item.sizes!.find((s) => s.name === name))
                }
              >
                {item.sizes.map((s, i) => (
                  <div
                    key={s.name}
                    className="flex items-center justify-between border rounded-lg py-3 px-3 mb-2"
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value={s.name} id={s.name} />
                      <label htmlFor={s.name} className="cursor-pointer">
                        {s.name}
                      </label>
                      <span className="ml-3 text-xs text-zinc-400">
                        {s.cal} cal
                      </span>
                    </div>
                    <span className="text-zinc-600 font-medium text-sm">
                      {s.priceMod ? "+$" + s.priceMod.toFixed(2) : "Included"}
                    </span>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {item.options && item.options.length > 0 && (
            <div className="px-6 mt-3">
              <div className="font-semibold mb-2">Select Options</div>
              <div className="flex flex-col gap-2">
                {item.options.map((opt) => (
                  <label
                    className="flex items-center gap-2 text-zinc-700 text-sm cursor-pointer"
                    key={opt.label}
                  >
                    <Checkbox
                      checked={checkedOptions.includes(opt.label)}
                      onCheckedChange={(checked) =>
                        handleOptionChange(opt.label, !!checked)
                      }
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="px-6 mt-4">
            <div className="font-semibold mb-2">Preferences (Optional)</div>
            <Textarea
              placeholder="Add special instructions"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              className="resize-none"
            />
          </div>

          <DialogFooter className="flex flex-col gap-3 mt-4 px-6 pb-6">
            <div className="flex items-center mt-4 mb-2 w-full gap-4">
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    const newQty = Math.max(1, qty - 1);
                    if (newQty !== qty) {
                      logEvent(EVENT_TYPES.ITEM_DECREMENTED, {
                        itemId: item.id,
                        itemName: item.name,
                        newQuantity: newQty,
                      });
                      setQty(newQty);
                    }
                  }}
                  aria-label="Decrease"
                >
                  <Minus size={16} />
                </Button>
                <span className="font-bold text-lg w-6 text-center">{qty}</span>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    const newQty = qty + 1;
                    logEvent(EVENT_TYPES.ITEM_INCREMENTED, {
                      itemId: item.id,
                      itemName: item.name,
                      newQuantity: newQty,
                    });
                    setQty(newQty);
                  }}
                  aria-label="Increase"
                >
                  <Plus size={16} />
                </Button>
              </div>
              <Button
                className="ml-auto px-6 py-2.5 text-lg rounded-full font-bold bg-orange-500 hover:bg-orange-600"
                onClick={handleAdd}
              >
                Add to cart ${price.toFixed(2)}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
