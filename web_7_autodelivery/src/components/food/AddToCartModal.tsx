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
import {
  type MenuItem,
  type MenuItemSize,
  type MenuItemOption,
} from "@/data/restaurants";
import { EVENT_TYPES, logEvent } from "../library/events";
import { useSeedLayout } from "@/hooks/use-seed-layout";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { SafeImage } from "@/components/ui/SafeImage";

export type AddToCartModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: MenuItem;
  onAdd: (cartData: {
    size?: MenuItemSize;
    options: string[];
    preferences?: string;
    quantity: number;
    unitPrice: number;
  }) => void;
  initialSelection?: {
    size?: MenuItemSize | null;
    options?: string[];
    preferences?: string;
    quantity?: number;
  };
};

export function AddToCartModal({
  open,
  onOpenChange,
  item,
  onAdd,
  initialSelection,
}: AddToCartModalProps) {
  const [size, setSize] = React.useState<MenuItemSize | undefined>(
    item.sizes?.[0]
  );
  const [checkedOptions, setCheckedOptions] = React.useState<string[]>([]);
  const [preferences, setPreferences] = React.useState("");
  const [qty, setQty] = React.useState(1);
  const layout = useSeedLayout();
  const seedStructure = layout.seed;
  const dyn = useDynamicSystem();

  React.useEffect(() => {
    setSize(initialSelection?.size ?? item.sizes?.[0]);
    setCheckedOptions(initialSelection?.options ?? []);
    setPreferences(initialSelection?.preferences ?? "");
    setQty(initialSelection?.quantity ?? 1);
  }, [item, open, initialSelection]);

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
    logEvent(EVENT_TYPES.ADD_TO_CART_MENU_ITEM, {
      itemId: item.id,
      itemName: item.name,
      basePrice: item.price,
      size: size?.name,
      sizePriceMod: size?.priceMod || 0,
      options: checkedOptions,
      preferences,
      quantity: qty,
      totalPrice: price,
      restaurantId: item.restaurantId || "unknown",
      restaurantName: item.restaurantName || "Unknown Restaurant",
    });
    const unitPrice = item.price + (size?.priceMod || 0);
    onAdd({ size, options: checkedOptions, preferences, quantity: qty, unitPrice });
    onOpenChange(false);
  }

  const modalTitleId = dyn.v3.getVariant("add-to-cart-modal-title", ID_VARIANTS_MAP, `add-to-cart-modal-title-${seedStructure}`);
  const modalSubtitleId = `${modalTitleId}-item`;
  const sizeHeadingText = dyn.v3.getVariant("select-size-heading", TEXT_VARIANTS_MAP, "Select Size");
  const sizeHeadingId = dyn.v3.getVariant("select-size-heading", ID_VARIANTS_MAP, `select-size-heading-${seedStructure}`);
  const optionsHeadingText = dyn.v3.getVariant("select-options-heading", TEXT_VARIANTS_MAP, "Select Options");
  const optionsHeadingId = dyn.v3.getVariant("select-options-heading", ID_VARIANTS_MAP, `select-options-heading-${seedStructure}`);
  const preferencesHeadingText = dyn.v3.getVariant("preferences-heading", TEXT_VARIANTS_MAP, "Preferences (Optional)");
  const preferencesHeadingId = dyn.v3.getVariant("preferences-heading", ID_VARIANTS_MAP, `preferences-heading-${seedStructure}`);
  const preferencesPlaceholder = dyn.v3.getVariant("preferences_input", TEXT_VARIANTS_MAP, "Add special instructions");
  const preferencesTextareaId = dyn.v3.getVariant("preferences-textarea", ID_VARIANTS_MAP, `preferences-textarea-${seedStructure}`);
  const quantityLabel = dyn.v3.getVariant("quantity-label", TEXT_VARIANTS_MAP, "Quantity");
  const addToCartLabel = dyn.v3.getVariant("add-to-cart-btn", TEXT_VARIANTS_MAP, "Add to cart");
  const addButtonAttributes = layout.getElementAttributes("ADD_TO_CART_MENU_ITEM", 0);
  const addButtonId = dyn.v3.getVariant("add-to-cart-btn", ID_VARIANTS_MAP, `${addButtonAttributes.id ?? "add-to-cart-btn"}-${seedStructure}`);
  const addButtonAria = dyn.v3.getVariant("add-to-cart-btn", TEXT_VARIANTS_MAP, "Add item to cart");
  const decrementAttributes = layout.getElementAttributes("ITEM_DECREMENTED", 0);
  const decrementButtonId = dyn.v3.getVariant("quantity-decrease-button", ID_VARIANTS_MAP, `${decrementAttributes.id ?? "quantity-decrease"}-${seedStructure}`);
  const decrementAria = dyn.v3.getVariant("quantity-decrease-button", TEXT_VARIANTS_MAP, "Decrease quantity");
  const incrementAttributes = layout.getElementAttributes("ITEM_INCREMENTED", 0);
  const incrementButtonId = dyn.v3.getVariant("quantity-increase-button", ID_VARIANTS_MAP, `${incrementAttributes.id ?? "quantity-increase"}-${seedStructure}`);
  const incrementAria = dyn.v3.getVariant("quantity-increase-button", TEXT_VARIANTS_MAP, "Increase quantity");

  return (
    dyn.v1.addWrapDecoy("add-to-cart-modal", (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-xl rounded-2xl px-0 sm:px-0 p-0 ${layout.modal.containerClass} ${dyn.v3.getVariant("modal", CLASS_VARIANTS_MAP, "")}`}>
        <div className={`max-h-[90vh] overflow-y-auto ${layout.modal.contentClass}`}>
          <DialogHeader className={`px-6 pt-6 pb-0 ${layout.modal.headerClass}`}>
            <DialogTitle
              className={`${layout.modal.headerClass} space-y-1`}
              id={modalTitleId}
            >
              <span className="block text-base md:text-lg font-semibold">
                {dyn.v3.getVariant("add-to-cart-modal-title", TEXT_VARIANTS_MAP, "Customize your order")}
              </span>
              <span
                id={modalSubtitleId}
                className="block text-sm text-zinc-500 font-normal"
              >
                {item.name}
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 flex gap-3 items-center mb-2">
            <div className="rounded-xl overflow-hidden w-16 h-16 relative">
              <SafeImage
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
              <div className="font-semibold mb-2" id={sizeHeadingId}>
                {sizeHeadingText}
              </div>
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
              <div className="font-semibold mb-2" id={optionsHeadingId}>
                {optionsHeadingText}
              </div>
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
            <div className="font-semibold mb-2" id={preferencesHeadingId}>
              {preferencesHeadingText}
            </div>
            <Textarea
              id={preferencesTextareaId}
              placeholder={preferencesPlaceholder}
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              className="resize-none"
            />
          </div>

          <DialogFooter className="flex flex-col gap-3 mt-4 px-6 pb-6">
            <div className="flex items-center mt-4 mb-2 w-full gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-zinc-600">
                  {quantityLabel}
                </span>
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
                  aria-label={decrementAria}
                  {...decrementAttributes}
                  id={decrementButtonId}
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
                  aria-label={incrementAria}
                  {...incrementAttributes}
                  id={incrementButtonId}
                >
                  <Plus size={16} />
                </Button>
              </div>
              <Button
                className={`ml-auto px-6 py-2.5 text-lg rounded-full font-bold bg-orange-500 hover:bg-orange-600 ${dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, "")}`}
                onClick={handleAdd}
                {...addButtonAttributes}
                id={addButtonId}
                aria-label={addButtonAria}
              >
                {`${addToCartLabel} $${price.toFixed(2)}`}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
    ))
  );
}
