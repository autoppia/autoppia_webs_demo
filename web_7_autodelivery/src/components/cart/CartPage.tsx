"use client";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState, useEffect } from "react";
import { useHasHydrated } from "@/hooks/use-hydrated";
import { useRestaurants } from "@/contexts/RestaurantContext";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar, Clock, Home, Phone, Gift, ChevronRight, Loader2 } from "lucide-react";
import { useRef } from "react";
import QuickOrderModal from "../food/QuickOrderModal";

interface EditableTimeProps {
  value: string;
  onChange: (v: string) => void;
  editing: boolean;
  setEditing: (edit: boolean) => void;
  className?: string;
  id?: string;
}

function EditableTime({
  value,
  onChange,
  editing,
  setEditing,
  className,
  id,
}: EditableTimeProps) {
  const [tmp, setTmp] = useState(value);
  useEffect(() => {
    setTmp(value);
  }, [value]);

  if (editing) {
    return (
      <input
        id={id ? `${id}-input` : undefined}
        className={
          "border-b outline-none w-auto font-mono py-0.5 px-1 bg-zinc-50 " +
          (className || "")
        }
        value={tmp}
        onChange={(e) => setTmp(e.target.value)}
        onBlur={() => {
          setEditing(false);
          if (tmp.trim()) onChange(tmp);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setEditing(false);
            if (tmp.trim()) onChange(tmp);
          }
        }}
        autoFocus
      />
    );
  }

  return (
    <span
      id={id}
      className={"cursor-pointer hover:underline " + (className || "")}
      tabIndex={0}
      onClick={() => setEditing(true)}
    >
      {value}
    </span>
  );
}

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EVENT_TYPES, logEvent } from "../library/events";
import { useSeedLayout } from "@/hooks/use-seed-layout";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { AddToCartModal } from "../food/AddToCartModal";
import type { CartItem } from "@/store/cart-store";
import type { MenuItem } from "@/data/restaurants";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, clearCart, getTotal, updateCartItem } =
    useCartStore();
  const [form, setForm] = useState({ name: "", address: "", phone: "" });
  const [orderSuccess, setOrderSuccess] = useState(false);
  const hydrated = useHasHydrated();
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const layout = useSeedLayout();
  const seedStructure = layout.seed;
  const dyn = useDynamicSystem();
  const predefinedAddresses = [
    "710 Portofino Ln, Foster City, CA 94004",
    "450 Townsend St, San Francisco, CA 94107",
    "123 Elm Street, Palo Alto, CA 94301",
  ];
  const [customAddress, setCustomAddress] = useState(form.address);
  const [isDropoffModalOpen, setIsDropoffModalOpen] = useState(false);
  const dropoffOptions = [
    "Leave it at my door",
    "Hand it to me",
    "Meet outside",
    "Meet in the lobby",
    "Call upon arrival",
    "Text when arriving"
  ];
  const [selectedDropoff, setSelectedDropoff] = useState("Leave it at my door");
  const [isPickupInfoModalOpen, setIsPickupInfoModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  // MODE State
  const [mode, setMode] = useState<"delivery" | "pickup">("delivery");
  const formRef = useRef<HTMLFormElement>(null);
  const [deliveryTime, setDeliveryTime] = useState<
    "express" | "standard" | "scheduled"
  >("standard");
  const [quickOrderOpen, setQuickOrderOpen] = useState(false);
  const { restaurants, isLoading } = useRestaurants();
  const restaurant =
    items.length > 0
      ? restaurants.find((r) => r.id === items[0].restaurantId)
      : null;
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [deliveryPriority, setDeliveryPriority] = useState<"priority" | "normal">("normal");

  const [expressTime, setExpressTime] = useState(
    restaurant?.deliveryTime || "20-30 min"
  );
  const [standardTime, setStandardTime] = useState(
    restaurant?.deliveryTime || "20-30 min"
  );
  const [pickupTime, setPickupTime] = useState(
    restaurant?.pickupTime || "10-20 min"
  );

  const [editing, setEditing] = useState<{
    field: "express" | "standard" | "scheduled" | "pickup" | null;
  }>({ field: null });
  const [scheduledInput, setScheduledInput] = useState("");

  useEffect(() => {
    setExpressTime(restaurant?.deliveryTime || "20-30 min");
    setStandardTime(restaurant?.deliveryTime || "20-30 min");
    setPickupTime(restaurant?.pickupTime || "10-20 min");
  }, [restaurant?.deliveryTime, restaurant?.pickupTime]);

  // Listen for global quick-order trigger (from navbar)
  useEffect(() => {
    const handler = () => setQuickOrderOpen(true);
    if (typeof window !== "undefined") {
      window.addEventListener("autodelivery:openQuickOrder", handler);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("autodelivery:openQuickOrder", handler);
      }
    };
  }, []);

  useEffect(() => {
    if (hydrated && items.length > 0) {
      logEvent(EVENT_TYPES.OPEN_CHECKOUT_PAGE, {
        itemCount: items.reduce((acc: number, i: { quantity: number }) => acc + i.quantity, 0),
        items: items.map((item: { id: string; name: string; quantity: number; price: number }) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
      });
    }
  }, [hydrated, items]);

  if (isLoading && items.length > 0 && !restaurant) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
      </div>
    );
  }
  if (!hydrated) {
    return (
      <div className="flex justify-center py-16">
        <span className="animate-spin rounded-full border-4 border-zinc-200 border-t-green-500 w-10 h-10" />
      </div>
    );
  }

  if (items.length === 0 && !orderSuccess) {
    const emptyStateAttributes = layout.getElementAttributes("cart-empty-state", 0);
    const emptyMessage = dyn.v3.getVariant("cart-empty-message", TEXT_VARIANTS_MAP, "Your cart is empty.");
    const emptyMessageId = dyn.v3.getVariant(
      "cart-empty-message",
      ID_VARIANTS_MAP,
      `cart-empty-message-${seedStructure}`
    );

    return (
      <div
        className={`max-w-2xl mx-auto mt-24 text-center text-lg text-zinc-500 ${layout.cart.pageContainerClass}`}
        {...emptyStateAttributes}
        id={emptyMessageId}
      >
        {emptyMessage}
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleEditItem = (item: CartItem) => {
    setEditingItem(item);
    const foundRestaurant = restaurants.find((r) => r.id === item.restaurantId);
    const menuItem = foundRestaurant?.menu.find((m) => m.id === item.id);
    setEditingMenuItem(
      menuItem ?? {
        id: item.id,
        name: item.name,
        description: item.description || "",
        price: item.price,
        image: item.image,
        options: item.options,
        sizes: item.sizes,
        restaurantId: item.restaurantId,
        restaurantName: restaurant?.name,
      }
    );
    setEditModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logEvent(EVENT_TYPES.PLACE_ORDER, {
      name: form.name,
      phone: form.phone,
      address: form.address,
      mode,
      deliveryTime,
      dropoff: selectedDropoff,
      delivery_priority: deliveryPriority,
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      total: getTotal(),
    });

    setOrderSuccess(true);
    clearCart();
    setTimeout(() => setOrderSuccess(false), 7000);
  };

  const quantityLabel = dyn.v3.getVariant("quantity-label", TEXT_VARIANTS_MAP, "Quantity");
  const deliveryInformationTitle = mode === "pickup"
    ? dyn.v3.getVariant("delivery-information-title", TEXT_VARIANTS_MAP, "Pickup Details")
    : dyn.v3.getVariant("delivery-information-title", TEXT_VARIANTS_MAP, "Delivery Information");
  const deliveryInfoAttributes = layout.getElementAttributes("delivery-information-title", 0);
  const deliveryInformationId = dyn.v3.getVariant(
    "delivery-information-title",
    ID_VARIANTS_MAP,
    `delivery-information-title-${seedStructure}`
  );
  const customerNamePlaceholder = dyn.v3.getVariant("customer_name_input", TEXT_VARIANTS_MAP, "Your Name");
  const customerAddressPlaceholder = dyn.v3.getVariant("delivery_address_input", TEXT_VARIANTS_MAP, "Delivery Address");
  const customerPhonePlaceholder = dyn.v3.getVariant("contact_phone_input", TEXT_VARIANTS_MAP, "Contact Number");
  const customerNameId = dyn.v3.getVariant("customer-name-input", ID_VARIANTS_MAP, `customer-name-${seedStructure}`);
  const customerAddressId = dyn.v3.getVariant("delivery-address-input", ID_VARIANTS_MAP, `delivery-address-${seedStructure}`);
  const customerPhoneId = dyn.v3.getVariant("contact-phone-input", ID_VARIANTS_MAP, `contact-phone-${seedStructure}`);
  const placeOrderAttributes = layout.getElementAttributes("PLACE_ORDER", 0);
  const placeOrderId = dyn.v3.getVariant(
    "place-order-button",
    ID_VARIANTS_MAP,
    `place-order-button-${seedStructure}`
  );
  const placeOrderLabel = dyn.v3.getVariant("place-order-button", TEXT_VARIANTS_MAP, "Place Order");
  const placeOrderAria = dyn.v3.getVariant("place-order-button", TEXT_VARIANTS_MAP, "Place order");
  const deliveryModeAttrs = layout.getElementAttributes('DELIVERY_MODE', 0);
  const pickupModeAttrs = layout.getElementAttributes('PICKUP_MODE', 0);

  return (
    dyn.v1.addWrapDecoy("cart-page", (
    <div id="cart-page-container" className={`max-w-4xl mx-auto mt-8 px-4 ${layout.cart.pageContainerClass} ${dyn.v3.getVariant("container", CLASS_VARIANTS_MAP, "")}`}>
      <div id="delivery-mode-selector" className="flex justify-center mb-7 mt-2">
        <div className="flex gap-0 bg-zinc-100 rounded-full shadow-inner p-1 w-fit">
          <button
            id={dyn.v3.getVariant("delivery-mode-button", ID_VARIANTS_MAP, "delivery-mode-button")}
            onClick={() => {
              setMode("delivery");
              logEvent(EVENT_TYPES.DELIVERY_MODE, {
                mode: "delivery",
              });
            }}
            className={`px-6 py-2 rounded-full font-bold text-base flex flex-col items-center transition-all ${dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, "")} ${dyn.v3.getVariant("mode-toggle", CLASS_VARIANTS_MAP, "")} ${
              mode === "delivery"
                ? "bg-black text-white shadow"
                : "bg-transparent text-zinc-900 hover:bg-zinc-200"
            }`}
            aria-pressed={mode === "delivery"}
            {...deliveryModeAttrs}
          >
            {dyn.v3.getVariant("delivery-mode-label", TEXT_VARIANTS_MAP, "Delivery")}
          </button>
          <button
            id={dyn.v3.getVariant("pickup-mode-button", ID_VARIANTS_MAP, "pickup-mode-button")}
            onClick={() => {
              setMode("pickup");
              logEvent(EVENT_TYPES.PICKUP_MODE, {
                mode: "pickup",
              });
            }}
            className={`px-6 py-2 rounded-full font-bold text-base flex flex-col items-center transition-all ${dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, "")} ${dyn.v3.getVariant("mode-toggle", CLASS_VARIANTS_MAP, "")} ${
              mode === "pickup"
                ? "bg-black text-white shadow"
                : "bg-transparent text-zinc-900 hover:bg-zinc-200"
            }`}
            aria-pressed={mode === "pickup"}
            {...pickupModeAttrs}
          >
            {dyn.v3.getVariant("pickup-mode-label", TEXT_VARIANTS_MAP, "Pickup")}
          </button>
        </div>
      </div>
      {dyn.v1.addWrapDecoy("delivery-options", (
      <div id="delivery-options-container" className="bg-white rounded-2xl shadow-lg py-6 px-4 mb-8">
        <div className="flex items-center gap-2 mb-5">
          <Clock className="w-5 h-5 text-zinc-500" />
          <span className="text-base font-semibold">
            {mode === "delivery" ? "Delivery Time" : "Pickup Time"}
          </span>
          <span id="selected-time-display" className="ml-auto text-sm font-normal text-zinc-400">
            {mode === "pickup" ? (
              <EditableTime
                id="pickup-time-edit"
                value={pickupTime}
                onChange={setPickupTime}
                editing={editing.field === "pickup"}
                setEditing={(state) =>
                  setEditing({ field: state ? "pickup" : null })
                }
              />
            ) : deliveryTime === "express" ? (
              <EditableTime
                id="express-time-edit"
                value={expressTime}
                onChange={setExpressTime}
                editing={editing.field === "express"}
                setEditing={(state) =>
                  setEditing({ field: state ? "express" : null })
                }
              />
            ) : deliveryTime === "standard" ? (
              <EditableTime
                id="standard-time-edit"
                value={standardTime}
                onChange={setStandardTime}
                editing={editing.field === "standard"}
                setEditing={(state) =>
                  setEditing({ field: state ? "standard" : null })
                }
              />
            ) : scheduledInput ? (
              scheduledInput
            ) : (
              "Choose a time"
            )}
          </span>
        </div>
        {mode === "delivery" ? (
          <>
            <RadioGroup
              id="delivery-time-options"
              className="flex flex-row gap-4 mb-4"
              value={deliveryTime}
              onValueChange={(v) =>
                setDeliveryTime(v as "express" | "standard" | "scheduled")
              }
            >
              <div
                className={`border rounded-xl px-4 py-3 flex flex-col min-w-[8.5rem] cursor-pointer transition relative ${
                  deliveryTime === "express"
                    ? "border-black shadow-lg bg-zinc-50"
                    : "border-zinc-200 hover:border-black"
                }`}
              >
                <RadioGroupItem
                  id="express-delivery-option"
                  value="express"
                  className="absolute top-3 right-3 focus-visible:outline-none"
                />
                <div className="font-bold text-zinc-900 mb-0.5">Express</div>
                <div className="text-xs text-zinc-500">
                  <EditableTime
                    id="express-time-display"
                    value={expressTime}
                    onChange={setExpressTime}
                    editing={editing.field === "express"}
                    setEditing={(state) =>
                      setEditing({ field: state ? "express" : null })
                    }
                  />
                </div>
                <div className="text-xs text-orange-500 mt-0.5">
                  Direct to you + $2.99
                </div>
              </div>
              <div
                className={`border rounded-xl px-4 py-3 flex flex-col min-w-[8.5rem] cursor-pointer transition relative ${
                  deliveryTime === "standard"
                    ? "border-black shadow-lg bg-zinc-50"
                    : "border-zinc-200 hover:border-black"
                }`}
              >
                <RadioGroupItem
                  id="standard-delivery-option"
                  value="standard"
                  className="absolute top-3 right-3 focus-visible:outline-none"
                />
                <div className="font-bold text-zinc-900 mb-0.5">Standard</div>
                <div className="text-xs text-zinc-500">
                  <EditableTime
                    id="standard-time-display"
                    value={standardTime}
                    onChange={setStandardTime}
                    editing={editing.field === "standard"}
                    setEditing={(state) =>
                      setEditing({ field: state ? "standard" : null })
                    }
                  />
                </div>
              </div>
              <div
                className={`rounded-xl pr-8 pl-4 py-3 flex flex-col min-w-[10rem] cursor-pointer border transition relative ${
                  deliveryTime === "scheduled"
                    ? "border-black shadow-lg bg-zinc-50"
                    : "border-zinc-200 hover:border-black"
                }`}
              >
                <RadioGroupItem
                  id="scheduled-delivery-option"
                  value="scheduled"
                  className="absolute top-3 right-[3px] focus-visible:outline-none"
                />
                <div className="font-bold text-zinc-900 mb-0.5">
                  Schedule for later
                </div>
                <div className="text-xs text-zinc-400">
                  {deliveryTime === "scheduled" ? (
                    <input
                      id="scheduled-time-input"
                      className="border-b outline-none w-auto py-0.5 px-1 bg-zinc-50"
                      value={scheduledInput}
                      onChange={(e) => setScheduledInput(e.target.value)}
                      placeholder="Type a time: e.g., 7:15 pm"
                    />
                  ) : (
                    "Choose a time"
                  )}
                </div>
              </div>
            </RadioGroup>
            <div className="mb-6">
              <div className="text-sm font-semibold mb-2">Delivery priority</div>
              <div className="flex gap-3">
                {[
                  { id: "priority", label: "Priority: ready & rushed", value: "priority" },
                  { id: "normal", label: "Normal: standard prep", value: "normal" },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex-1 border rounded-xl px-4 py-3 cursor-pointer transition ${
                      deliveryPriority === opt.value
                        ? "border-black shadow-sm bg-zinc-50"
                        : "border-zinc-200 hover:border-black"
                    }`}
                  >
                    <input
                      type="radio"
                      name="delivery-priority"
                      value={opt.value}
                      className="hidden"
                      checked={deliveryPriority === opt.value}
                      onChange={() => {
                        setDeliveryPriority(opt.value as "priority" | "normal");
                        logEvent(EVENT_TYPES.DELIVERY_PRIORITY_SELECTED, {
                          priority: opt.value,
                          mode,
                          address: form.address,
                          name: form.name,
                          phone: form.phone,
                          restaurantId: restaurant?.id || "unknown",
                          restaurantName: restaurant?.name || "Unknown Restaurant",
                          items: items.map(item => ({
                            id: item.id,
                            name: item.name,
                            quantity: item.quantity,
                            price: item.price,
                          })),
                          cartTotal: getTotal(),
                        });
                      }}
                    />
                    <div className="font-semibold text-sm">{opt.label}</div>
                  </label>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="py-2 pl-1 text-sm">
            <span className="font-semibold">Pickup Time: </span>
            <EditableTime
              id="pickup-time-display"
              value={pickupTime}
              onChange={setPickupTime}
              editing={editing.field === "pickup"}
              setEditing={(state) =>
                setEditing({ field: state ? "pickup" : null })
              }
            />
          </div>
        )}
        <div id="delivery-details" className="divide-y divide-zinc-200 mt-3">
          {mode === "delivery" ? (
            <>
              <div id="address-section" className="flex items-center gap-3 py-3 cursor-pointer hover:bg-zinc-50 rounded-xl px-2">
                <Home className="w-5 h-5 text-zinc-500" />
                {dyn.v1.addWrapDecoy("address-selector-wrapper", (
                <div
                  id={dyn.v3.getVariant("address-selector", ID_VARIANTS_MAP, "address-selector")}
                  className={dyn.v3.getVariant("address-selector-class", CLASS_VARIANTS_MAP, "flex items-center gap-3 py-3 cursor-pointer hover:bg-zinc-50 rounded-xl px-2")}
                  onClick={() => {
                    setCustomAddress(form.address);
                    setIsAddressModalOpen(true);
                  }}
                >
                  <span className="font-semibold">
                    {form.address || "Select Address"}
                  </span>
                  <ChevronRight className="w-4 h-4 text-zinc-400 ml-auto" />
                </div>
                ), "address-selector-wrap")}

                {/* Modal Dialog */}
                <Dialog
                  open={isAddressModalOpen}
                  onOpenChange={setIsAddressModalOpen}
                >
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Select a Delivery Address</DialogTitle>
                    </DialogHeader>
                    <div id="address-options" className="flex flex-col gap-2 mt-2">
                      {predefinedAddresses.map((addr) => (
                        <button
                          id={`address-option-${addr.substring(0, 5).replace(/\s+/g, '-')}`}
                          key={addr}
                          onClick={() => {
                            setForm((f) => ({ ...f, address: addr }));
                            setIsAddressModalOpen(false);
                          }}
                          className="border border-zinc-300 rounded-lg px-4 py-2 hover:bg-zinc-100 text-left"
                        >
                          {addr}
                        </button>
                      ))}
                      <div id="custom-address-section" className="mt-4">
                        <label className="text-sm font-medium">
                          Custom Address
                        </label>
                        <Input
                          id="custom-address-input"
                          value={customAddress}
                          onChange={(e) => setCustomAddress(e.target.value)}
                          placeholder="Type your address"
                        />
                        <Button
                          id="save-address-button"
                          className={`mt-2 w-full ${layout.cart.buttonClass}`}
                          onClick={() => {
                            if (customAddress.trim()) {
                              setForm((f) => ({
                                ...f,
                                address: customAddress.trim(),
                              }));
                              logEvent(EVENT_TYPES.ADDRESS_ADDED, {
                                address: customAddress.trim(),
                                mode: "delivery",
                                restaurantId: restaurant?.id || "unknown",
                                restaurantName: restaurant?.name || "Unknown Restaurant",
                                items: items.map(item => ({
                                  itemId: item.id,
                                  name: item.name,
                                  quantity: item.quantity,
                                  price: item.price
                                })),
                                cartTotal: getTotal()
                              });
                              setIsAddressModalOpen(false);
                            }
                          }}
                        >
                          Save Address
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div id="dropoff-section" className="flex items-start gap-3 py-3 cursor-pointer hover:bg-zinc-50 rounded-xl px-2">
                <Home className="w-5 h-5 text-zinc-500 mt-3" />
                {dyn.v1.addWrapDecoy("dropoff-preferences-selector-wrapper", (
                <div
                  id={dyn.v3.getVariant("dropoff-preferences-selector", ID_VARIANTS_MAP, "dropoff-preferences-selector")}
                  className={dyn.v3.getVariant("dropoff-preferences-selector-class", CLASS_VARIANTS_MAP, "flex items-start gap-3 py-3 cursor-pointer hover:bg-zinc-50 rounded-xl px-2")}
                  onClick={() => setIsDropoffModalOpen(true)}
                >
                  <div>
                    <span className="font-semibold block">
                      {selectedDropoff}
                    </span>
                    {selectedDropoff === "Leave it at my door" && (
                      <span id="dropoff-instructions" className="block text-xs text-zinc-500">
                        Please ring the bell and drop off at the door, thank
                        you. Its around the corner on the ground floor
                      </span>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400 mt-2 ml-auto" />
                </div>
                ), "dropoff-preferences-selector-wrap")}
                <Dialog
                  open={isDropoffModalOpen}
                  onOpenChange={setIsDropoffModalOpen}
                >
                  <DialogContent className="max-w-sm">
                    <DialogHeader>
                      <DialogTitle>Select Drop-off Preference</DialogTitle>
                    </DialogHeader>
                    <div id="dropoff-options" className="flex flex-col gap-3 mt-3">
                      {dropoffOptions.map((option) => (
                        <button
                          id={`dropoff-option-${option.toLowerCase().replace(/\s+/g, '-')}`}
                          key={option}
                          onClick={() => {
                            setSelectedDropoff(option);
                            logEvent(EVENT_TYPES.DROPOFF_PREFERENCE, {
                              selectedPreference: option,
                              address: form.address,
                              name: form.name,
                              phone: form.phone,
                              mode,
                              restaurantId: restaurant?.id || "unknown",
                              restaurantName: restaurant?.name || "Unknown Restaurant",
                              items: items.map(item => ({
                                id: item.id,
                                name: item.name,
                                quantity: item.quantity,
                                price: item.price
                              })),
                              cartTotal: getTotal()
                            });
                            setIsDropoffModalOpen(false);
                          }}
                          className="border border-zinc-300 rounded-lg px-4 py-2 hover:bg-zinc-100 text-left"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              {dyn.v1.addWrapDecoy("contact-number-selector-wrapper", (
              <div
                id={dyn.v3.getVariant("contact-number-selector", ID_VARIANTS_MAP, "contact-number-selector")}
                className={dyn.v3.getVariant("contact-number-selector-class", CLASS_VARIANTS_MAP, "flex items-center gap-3 py-3 cursor-pointer hover:bg-zinc-50 rounded-xl px-2")}
                onClick={() => setIsContactModalOpen(true)}
              >
                <Phone className="w-5 h-5 text-zinc-500" />
                <span className="font-semibold">
                  {form.phone || "Add contact number"}
                </span>
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              </div>
              ), "contact-number-selector-wrap")}
            </>
          ) : (
            <>
              <div
                id="pickup-address-selector"
                className="flex items-center gap-3 py-3 cursor-pointer hover:bg-zinc-50 rounded-xl px-2"
                onClick={() => setIsPickupInfoModalOpen(true)}
              >
                <Home className="w-5 h-5 text-zinc-500" />
                <span className="font-semibold">
                  {form.address || "Select Pickup Address"}
                </span>
                <span className="ml-2 text-zinc-500 text-xs flex-1 truncate">
                  San Francisco, CA
                </span>
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              </div>
              <div
                id="pickup-contact-number-selector"
                className="flex items-center gap-3 py-3 cursor-pointer hover:bg-zinc-50 rounded-xl px-2"
                onClick={() => setIsContactModalOpen(true)}
              >
                <Phone className="w-5 h-5 text-zinc-500" />
                <span className="font-semibold">
                  {form.phone || "Add contact number"}
                </span>
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              </div>
              <Dialog
                open={isPickupInfoModalOpen}
                onOpenChange={setIsPickupInfoModalOpen}
              >
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Select a Pickup Address</DialogTitle>
                  </DialogHeader>
                  <div id="pickup-address-options" className="flex flex-col gap-2 mt-2">
                    {predefinedAddresses.map((addr) => (
                      <button
                        id={`pickup-address-option-${addr.substring(0, 5).replace(/\s+/g, '-')}`}
                        key={addr}
                        onClick={() => {
                          setForm((f) => ({ ...f, address: addr }));
                          setIsPickupInfoModalOpen(false);
                        }}
                        className="border border-zinc-300 rounded-lg px-4 py-2 hover:bg-zinc-100 text-left"
                      >
                        {addr}
                      </button>
                    ))}
                    <div id="pickup-custom-address-section" className="mt-4">
                      <label className="text-sm font-medium">
                        Custom Address
                      </label>
                      <Input
                        id="pickup-custom-address-input"
                        value={customAddress}
                        onChange={(e) => setCustomAddress(e.target.value)}
                        placeholder="Type your address"
                      />
                      <Button
                        id="save-pickup-address-button"
                        className="mt-2 w-full"
                        onClick={() => {
                          if (customAddress.trim()) {
                            setForm((f) => ({
                              ...f,
                              address: customAddress.trim(),
                            }));
                            logEvent(EVENT_TYPES.ADDRESS_ADDED, {
                              address: customAddress.trim(),
                              mode: "pickup",
                              restaurantId: restaurant?.id || "unknown",
                              restaurantName: restaurant?.name || "Unknown Restaurant",
                              items: items.map(item => ({
                                itemId: item.id,
                                name: item.name,
                                quantity: item.quantity,
                                price: item.price
                              })),
                              cartTotal: getTotal()
                              });
                              setIsPickupInfoModalOpen(false);
                            }
                          }}
                      >
                        Save Address
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>
      ))}
      {orderSuccess ? (
        <div id="order-success-message" className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-8 text-center text-xl font-semibold shadow">
          ✅ Order placed! Thank you for ordering 🙏
          <br />
          We'll deliver your meal soon.
        </div>
      ) : (
        <>
          <div id="cart-items-container" className="rounded-xl bg-white shadow p-4 mb-8">
            {items.map((item, idx) => {
              const decrementAttributes = layout.getElementAttributes("ITEM_DECREMENTED", idx);
              const incrementAttributes = layout.getElementAttributes("ITEM_INCREMENTED", idx);
              const removeAttributes = layout.getElementAttributes("EMPTY_CART", idx);
              const decrementId = dyn.v3.getVariant(
                "quantity-decrease-button",
                ID_VARIANTS_MAP,
                `quantity-decrease-${seedStructure}-${idx}`
              );
              const incrementId = dyn.v3.getVariant(
                "quantity-increase-button",
                ID_VARIANTS_MAP,
                `quantity-increase-${seedStructure}-${idx}`
              );
              const removeId = dyn.v3.getVariant(
                "empty-cart-button",
                ID_VARIANTS_MAP,
                `empty-cart-button-${seedStructure}-${idx}`
              );
              return (
                <div
                  id={`cart-item-${item.id}`}
                  key={item.id}
                  className="flex flex-col md:flex-row items-center gap-4 py-3 border-b last:border-b-0"
                >
                  <img
                    id={`item-image-${item.id}`}
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover border"
                  />
                  <div className="flex-1">
                    <div id={`item-name-${item.id}`} className="font-semibold">{item.name}</div>
                    <div id={`item-price-${item.id}`} className="text-zinc-500 text-sm">
                      ${item.price.toFixed(2)} • {item.quantity}x
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-xs font-semibold text-zinc-600">
                      {quantityLabel}
                    </span>
                    <Button
                      size="icon"
                      variant="outline"
                      className={layout.cart.buttonClass}
                      onClick={() => {
                        updateQuantity(item.id, item.quantity - 1);
                        logEvent(EVENT_TYPES.ITEM_DECREMENTED, {
                          itemId: item.id,
                          itemName: item.name,
                          quantity: item.quantity - 1,
                        });
                      }}
                      disabled={item.quantity === 1}
                      {...decrementAttributes}
                      id={decrementId}
                      aria-label={dyn.v3.getVariant("quantity-decrease-button", TEXT_VARIANTS_MAP, "Decrease quantity")}
                      title={dyn.v3.getVariant("quantity-decrease-button", TEXT_VARIANTS_MAP, "Decrease quantity")}
                    >
                      -
                    </Button>
                    <span id={`quantity-${item.id}`} className="px-2 font-bold">{item.quantity}</span>
                    <Button
                      size="icon"
                      variant="outline"
                      className={layout.cart.buttonClass}
                      onClick={() => {
                        updateQuantity(item.id, item.quantity + 1);
                        logEvent(EVENT_TYPES.ITEM_INCREMENTED, {
                          itemId: item.id,
                          itemName: item.name,
                          quantity: item.quantity + 1,
                        });
                      }}
                      {...incrementAttributes}
                      id={incrementId}
                      aria-label={dyn.v3.getVariant("quantity-increase-button", TEXT_VARIANTS_MAP, "Increase quantity")}
                      title={dyn.v3.getVariant("quantity-increase-button", TEXT_VARIANTS_MAP, "Increase quantity")}
                    >
                      +
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`text-xs ${dyn.v3.getVariant("edit-cart-button", CLASS_VARIANTS_MAP, "")}`}
                    id={dyn.v3.getVariant("edit-cart-button", ID_VARIANTS_MAP, `edit-cart-button-${item.id}`)}
                    onClick={() => {
                        handleEditItem(item);
                        logEvent(EVENT_TYPES.EDIT_CART_ITEM, {
                        itemId: item.id,
                        itemName: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        restaurantId: item.restaurantId,
                        restaurantName: restaurant?.name || "Unknown Restaurant",
                        cartTotal: getTotal(),
                      });
                    }}
                  >
                    {dyn.v3.getVariant("edit-cart-button", TEXT_VARIANTS_MAP, "Edit")}
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => {
                      removeFromCart(item.id);
                      logEvent(EVENT_TYPES.EMPTY_CART, {
                        itemId: item.id,
                        itemName: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        restaurantId: item.restaurantId,
                        restaurantName: restaurant?.name || "Unknown Restaurant",
                        cartTotal: getTotal(),
                      });
                    }}
                    {...removeAttributes}
                    id={removeId}
                    aria-label={dyn.v3.getVariant("empty-cart-button", TEXT_VARIANTS_MAP, "Remove item from cart")}
                    title={dyn.v3.getVariant("empty-cart-button", TEXT_VARIANTS_MAP, "Remove item from cart")}
                  >
                    ×
                  </Button>
                </div>
              );
            })}
            <div id="cart-total" className="flex justify-end text-lg font-bold pt-4">
              Total:{" "}
              <span id="total-amount" className="text-green-700 ml-2">
                ${getTotal().toFixed(2)}
              </span>
            </div>
          </div>
          {dyn.v1.addWrapDecoy("order-form", (
          <form
            id="order-form"
            ref={formRef}
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow p-6 w-full flex flex-col gap-4"
          >
            <h2
              className="font-semibold text-xl mb-2"
              {...deliveryInfoAttributes}
              id={deliveryInformationId}
            >
              {deliveryInformationTitle}
            </h2>
            <Input
              id={customerNameId}
              required
              name="name"
              placeholder={customerNamePlaceholder}
              value={form.name}
              onChange={handleChange}
              className={dyn.v3.getVariant("delivery-input", CLASS_VARIANTS_MAP, "")}
            />
            {mode === "delivery" && (
              <Input
                id={customerAddressId}
                required
                name="address"
                placeholder={customerAddressPlaceholder}
                value={form.address}
                onChange={handleChange}
                className={dyn.v3.getVariant("delivery-input", CLASS_VARIANTS_MAP, "")}
              />
            )}
            <Input
              id={customerPhoneId}
              required
              name="phone"
              placeholder={customerPhonePlaceholder}
              value={form.phone}
              onChange={handleChange}
              className={dyn.v3.getVariant("delivery-input", CLASS_VARIANTS_MAP, "")}
            />
            <Button
              {...placeOrderAttributes}
              id={placeOrderId}
              size="lg"
              className={`mt-3 ${layout.cart.buttonClass} ${dyn.v3.getVariant("place-order-button", CLASS_VARIANTS_MAP, "")}`}
              type="submit"
              disabled={items.length === 0}
              aria-label={placeOrderAria}
            >
              {placeOrderLabel}
            </Button>
          </form>
          ))}
          <QuickOrderModal open={quickOrderOpen} onOpenChange={setQuickOrderOpen} />
          <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Add contact number</DialogTitle>
              </DialogHeader>
              <Input
                id="contact-number-modal-input"
                value={form.phone}
                placeholder={customerPhonePlaceholder}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    phone: e.target.value,
                  }))
                }
              />
              <div className="flex justify-end">
                <Button
                  className="mt-3"
                  onClick={() => setIsContactModalOpen(false)}
                >
                  Save
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
      {editingItem && editingMenuItem && (
        <AddToCartModal
          open={editModalOpen}
          onOpenChange={(open) => {
            setEditModalOpen(open);
            if (!open) {
              setEditingItem(null);
              setEditingMenuItem(null);
            }
          }}
          item={editingMenuItem}
          initialSelection={{
            size: editingItem.selectedSize ?? undefined,
            options: editingItem.selectedOptions ?? editingItem.options?.map((o) => o.label) ?? [],
            preferences: editingItem.preferences ?? "",
            quantity: editingItem.quantity,
          }}
          onAdd={(custom) => {
            updateCartItem(editingItem.id, {
              selectedSize: custom.size,
              selectedOptions: custom.options,
              preferences: custom.preferences ?? "",
              quantity: custom.quantity,
              unitPrice: custom.unitPrice,
            });
            setEditModalOpen(false);
            setEditingItem(null);
            setEditingMenuItem(null);
          }}
        />
      )}
    </div>
    ))
  );
}
