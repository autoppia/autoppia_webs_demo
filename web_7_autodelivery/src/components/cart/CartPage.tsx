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
import { useDynamicStructure } from "@/contexts/DynamicStructureContext";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, clearCart, getTotal } =
    useCartStore();
  const [form, setForm] = useState({ name: "", address: "", phone: "" });
  const [orderSuccess, setOrderSuccess] = useState(false);
  const hydrated = useHasHydrated();
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const layout = useSeedLayout();
  const { getText, getPlaceholder, getId, getAria, seedStructure } = useDynamicStructure();
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
  // MODE State
  const [mode, setMode] = useState<"delivery" | "pickup">("delivery");
  const formRef = useRef<HTMLFormElement>(null);
  const [deliveryTime, setDeliveryTime] = useState<
    "express" | "standard" | "scheduled"
  >("standard");
  const { restaurants, isLoading } = useRestaurants();
  const restaurant =
    items.length > 0
      ? restaurants.find((r) => r.id === items[0].restaurantId)
      : null;

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
    const emptyMessage = getText("cart-empty-message", "Your cart is empty.");
    const emptyMessageId = getId(
      "cart-empty-message",
      `${emptyStateAttributes.id ?? "cart-empty-message"}-${seedStructure}`
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logEvent(EVENT_TYPES.PLACE_ORDER, {
      name: form.name,
      phone: form.phone,
      address: form.address,
      mode,
      deliveryTime,
      dropoff: selectedDropoff,
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

  const quantityLabel = getText("quantity-label", "Quantity");
  const deliveryInformationTitle = getText("delivery-information-title", "Delivery Information");
  const deliveryInfoAttributes = layout.getElementAttributes("delivery-information-title", 0);
  const deliveryInformationId = getId(
    "delivery-information-title",
    `${deliveryInfoAttributes.id ?? "delivery-information-title"}-${seedStructure}`
  );
  const customerNamePlaceholder = getPlaceholder("customer_name_input", "Your Name");
  const customerAddressPlaceholder = getPlaceholder("delivery_address_input", "Delivery Address");
  const customerPhonePlaceholder = getPlaceholder("contact_phone_input", "Contact Number");
  const customerNameId = getId("customer-name-input", `customer-name-${seedStructure}`);
  const customerAddressId = getId("delivery-address-input", `delivery-address-${seedStructure}`);
  const customerPhoneId = getId("contact-phone-input", `contact-phone-${seedStructure}`);
  const placeOrderAttributes = layout.getElementAttributes("PLACE_ORDER", 0);
  const placeOrderId = getId(
    "place-order-button",
    `${placeOrderAttributes.id ?? "place-order-button"}-${seedStructure}`
  );
  const placeOrderLabel = getText("place-order-button", "Place Order");
  const placeOrderAria = getAria("place-order-button", "Place order");

  return (
    <div id="cart-page-container" className={`max-w-3xl mx-auto mt-8 px-4 ${layout.cart.pageContainerClass}`}>
      <div id="delivery-mode-selector" className="flex justify-center mb-7 mt-2">
        <div className="flex gap-0 bg-zinc-100 rounded-full shadow-inner p-1 w-fit">
          <button
            id="delivery-mode-button"
            onClick={() => {
              setMode("delivery");
              logEvent(EVENT_TYPES.DELIVERY_MODE, {
                mode: "delivery",
              });
            }}
            className={`px-6 py-2 rounded-full font-bold text-base flex flex-col items-center transition-all ${
              mode === "delivery"
                ? "bg-black text-white shadow"
                : "bg-transparent text-zinc-900 hover:bg-zinc-200"
            }`}
            aria-pressed={mode === "delivery"}
            {...layout.getElementAttributes('DELIVERY_MODE', 0)}
          >
            Delivery
          </button>
          <button
            id="pickup-mode-button"
            onClick={() => {
              setMode("pickup");
              logEvent(EVENT_TYPES.PICKUP_MODE, {
                mode: "pickup",
              });
            }}
            className={`px-6 py-2 rounded-full font-bold text-base flex flex-col items-center transition-all ${
              mode === "pickup"
                ? "bg-black text-white shadow"
                : "bg-transparent text-zinc-900 hover:bg-zinc-200"
            }`}
            aria-pressed={mode === "pickup"}
            {...layout.getElementAttributes('PICKUP_MODE', 0)}
          >
            Pickup
          </button>
        </div>
      </div>
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
          <RadioGroup
            id="delivery-time-options"
            className="flex flex-row gap-4 mb-6"
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
                <div
                  id="address-selector"
                  className="flex items-center gap-3 py-3 cursor-pointer hover:bg-zinc-50 rounded-xl px-2"
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
                <div
                  id="dropoff-preferences-selector"
                  className="flex items-start gap-3 py-3 cursor-pointer hover:bg-zinc-50 rounded-xl px-2"
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
              <div
                id="contact-number-selector"
                className="flex items-center gap-3 py-3 cursor-pointer hover:bg-zinc-50 rounded-xl px-2"
                onClick={() =>
                  formRef.current?.scrollIntoView({ behavior: "smooth" })
                }
              >
                <Phone className="w-5 h-5 text-zinc-500" />
                <span className="font-semibold">
                  {form.phone || "Add contact number"}
                </span>
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              </div>
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
                onClick={() =>
                  formRef.current?.scrollIntoView({ behavior: "smooth" })
                }
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
              const decrementId = getId(
                "quantity-decrease-button",
                `${decrementAttributes.id ?? "quantity-decrease"}-${seedStructure}-${idx}`
              );
              const incrementId = getId(
                "quantity-increase-button",
                `${incrementAttributes.id ?? "quantity-increase"}-${seedStructure}-${idx}`
              );
              const removeId = getId(
                "empty-cart-button",
                `${removeAttributes.id ?? "empty-cart-button"}-${seedStructure}-${idx}`
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
                      aria-label={getAria("quantity-decrease-button", "Decrease quantity")}
                      title={getAria("quantity-decrease-button", "Decrease quantity")}
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
                      aria-label={getAria("quantity-increase-button", "Increase quantity")}
                      title={getAria("quantity-increase-button", "Increase quantity")}
                    >
                      +
                    </Button>
                  </div>
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
                    aria-label={getAria("empty-cart-button", "Remove item from cart")}
                    title={getAria("empty-cart-button", "Remove item from cart")}
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
          <form
            id="order-form"
            ref={formRef}
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow p-6 max-w-lg mx-auto flex flex-col gap-4"
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
            />
            <Input
              id={customerAddressId}
              required
              name="address"
              placeholder={customerAddressPlaceholder}
              value={form.address}
              onChange={handleChange}
            />
            <Input
              id={customerPhoneId}
              required
              name="phone"
              placeholder={customerPhonePlaceholder}
              value={form.phone}
              onChange={handleChange}
            />
            <Button
              {...placeOrderAttributes}
              id={placeOrderId}
              size="lg"
              className={`mt-3 ${layout.cart.buttonClass}`}
              type="submit"
              disabled={items.length === 0}
              aria-label={placeOrderAria}
            >
              {placeOrderLabel}
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
