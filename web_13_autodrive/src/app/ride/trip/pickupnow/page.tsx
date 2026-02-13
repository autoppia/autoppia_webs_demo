"use client";
import { useState, useRef, useEffect } from "react";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { format } from "date-fns";
import RideNavbar from "../../../../components/RideNavbar";
import { EVENT_TYPES, logEvent } from "@/library/event";
import { DatePickerInput } from "../../../../components/DatePicker";
import { useSeedLayout } from "@/dynamic/v3-dynamic";
import { getEffectiveSeed } from "@/dynamic/v2-data";
import { useDynamicSystem } from "@/dynamic/shared";
import { CLASS_VARIANTS_MAP, ID_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { cn } from "@/library/utils";

function getTimeSlotsForDate(dateStr: string) {
  const results = [];
  let base = new Date();
  if (dateStr) {
    const [yyyy, mm, dd] = dateStr.split("-");
    base = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  }
  let startHour = 0,
    startMin = 0;
  const todayStr = format(new Date(), "yyyy-MM-dd");
  if (dateStr === todayStr) {
    // If today, start at now rounded up to next slot
    const now = new Date();
    base.setHours(now.getHours(), now.getMinutes(), 0, 0);
    let min = now.getMinutes();
    min = min % 10 === 0 ? min : min + (10 - (min % 10));
    if (min === 60) {
      base.setHours(now.getHours() + 1, 0, 0, 0);
      min = 0;
    } else {
      base.setMinutes(min);
    }
    startHour = base.getHours();
    startMin = base.getMinutes();
  }
  for (let h = startHour; h < 24; h++) {
    for (let m = h === startHour ? startMin : 0; m < 60; m += 10) {
      const d = new Date(base.getTime());
      d.setHours(h, m, 0, 0);
      const label = d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const value = d.toTimeString().slice(0, 5);
      results.push({ label, value });
    }
  }
  return results;
}

// Seed-based content variants for dynamic HTML
interface PickupPageVariant {
  title: string;
  infoItems: Array<{
    icon: JSX.Element;
    text: string;
  }>;
  removeButtonText: string;
  nextButtonText: string;
  termsLinkText: string;
  backgroundColor: string;
  accentColor: string;
  cardWidth: string;
  headerLayout: 'split' | 'stacked' | 'compact';
  infoPosition: 'before' | 'after';
  buttonStyle: 'rounded' | 'square' | 'pill';
}

function getPickupPageVariant(seed: number): PickupPageVariant {
  const variants: PickupPageVariant[] = [
    // Variant 1 - Default
    {
      title: "When do you want to be picked up?",
      infoItems: [
        {
          icon: (
            <svg width="19" height="19" fill="none" viewBox="0 0 24 24">
              <rect x="4" y="4" width="16" height="16" rx="4" fill="#2095d2" />
              <text x="12" y="16" textAnchor="middle" fontSize="12" fill="#fff">30</text>
            </svg>
          ),
          text: "Schedule your pick-up up to 30 days in advance.",
        },
        {
          icon: (
            <svg width="18" height="18" fill="none" viewBox="0 0 22 22">
              <path d="M11 3a8 8 0 1 1 0 16a8 8 0 0 1 0-16zm0 0v6l4 2" stroke="#2095d2" strokeWidth="1.2" fill="none" />
            </svg>
          ),
          text: "Additional waiting time included to start your trip.",
        },
        {
          icon: (
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <rect x="4" y="8" width="16" height="2" rx="1" fill="#2095d2" />
              <rect x="4" y="14" width="16" height="2" rx="1" fill="#2095d2" />
            </svg>
          ),
          text: "Cancel at no cost up to 60 minutes before.",
        },
      ],
      removeButtonText: "Remove",
      nextButtonText: "Next",
      termsLinkText: "View terms and conditions",
      backgroundColor: "#fafbfc",
      accentColor: "#2095d2",
      cardWidth: "400px",
      headerLayout: 'split',
      infoPosition: 'after',
      buttonStyle: 'rounded',
    },
    // Variant 2 - Compact Layout
    {
      title: "Select your pickup time",
      infoItems: [
        {
          icon: (
            <svg width="18" height="18" fill="none" viewBox="0 0 22 22">
              <circle cx="11" cy="11" r="8" stroke="#1e88e5" strokeWidth="1.5" fill="none" />
              <path d="M11 7v4l3 2" stroke="#1e88e5" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          ),
          text: "Book up to 30 days ahead for scheduled rides.",
        },
        {
          icon: (
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path d="M12 2v4m0 12v4m8-10h-4m-12 0h4" stroke="#1e88e5" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="12" cy="12" r="3" stroke="#1e88e5" strokeWidth="1.5" fill="none" />
            </svg>
          ),
          text: "Free cancellation available before 1 hour.",
        },
      ],
      removeButtonText: "Clear",
      nextButtonText: "Continue",
      termsLinkText: "See full terms",
      backgroundColor: "#f0f4f8",
      accentColor: "#1e88e5",
      cardWidth: "380px",
      headerLayout: 'compact',
      infoPosition: 'after',
      buttonStyle: 'square',
    },
    // Variant 3 - Stacked Header
    {
      title: "Choose pickup date and time",
      infoItems: [
        {
          icon: (
            <svg width="19" height="19" fill="none" viewBox="0 0 24 24">
              <rect x="3" y="5" width="18" height="16" rx="3" stroke="#0277bd" strokeWidth="1.5" fill="none" />
              <path d="M7 3v4m10-4v4M3 10h18" stroke="#0277bd" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          ),
          text: "Plan ahead - schedule rides 30 days in advance.",
        },
        {
          icon: (
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path d="M12 8v4l3 3" stroke="#0277bd" strokeWidth="1.8" strokeLinecap="round" fill="none" />
              <circle cx="12" cy="12" r="9" stroke="#0277bd" strokeWidth="1.5" fill="none" />
            </svg>
          ),
          text: "Extra wait time included for your convenience.",
        },
        {
          icon: (
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" stroke="#0277bd" strokeWidth="1.5" fill="none" />
              <path d="M9 12l2 2 4-4" stroke="#0277bd" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          ),
          text: "No charge for cancellations up to 60 min prior.",
        },
      ],
      removeButtonText: "Reset",
      nextButtonText: "Proceed",
      termsLinkText: "Terms & conditions",
      backgroundColor: "#e3f2fd",
      accentColor: "#0277bd",
      cardWidth: "420px",
      headerLayout: 'stacked',
      infoPosition: 'before',
      buttonStyle: 'rounded',
    },
    // Variant 4 - Minimal Design
    {
      title: "Set pickup schedule",
      infoItems: [
        {
          icon: (
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#00838f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ),
          text: "Reserve your ride up to a month ahead.",
        },
        {
          icon: (
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <rect x="5" y="5" width="14" height="14" rx="2" stroke="#00838f" strokeWidth="1.5" fill="none" />
              <path d="M9 11l2 2 4-4" stroke="#00838f" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          ),
          text: "Cancel free until 60 minutes before pickup.",
        },
      ],
      removeButtonText: "Clear All",
      nextButtonText: "Next Step",
      termsLinkText: "Read terms",
      backgroundColor: "#e0f2f1",
      accentColor: "#00838f",
      cardWidth: "360px",
      headerLayout: 'compact',
      infoPosition: 'after',
      buttonStyle: 'pill',
    },
    // Variant 5 - Bold Accent
    {
      title: "When should we pick you up?",
      infoItems: [
        {
          icon: (
            <svg width="19" height="19" fill="none" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="4" fill="#01579b" />
              <text x="12" y="16" textAnchor="middle" fontSize="11" fill="#fff" fontWeight="bold">30</text>
            </svg>
          ),
          text: "Schedule pickups up to 30 days in the future.",
        },
        {
          icon: (
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="#01579b" strokeWidth="2" fill="none" />
              <path d="M12 6v6l4 4" stroke="#01579b" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ),
          text: "Waiting time buffer included automatically.",
        },
        {
          icon: (
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path d="M12 2L2 12l10 10 10-10L12 2z" stroke="#01579b" strokeWidth="1.5" fill="none" />
              <path d="M8 12l2.5 2.5L15 9" stroke="#01579b" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          ),
          text: "Free to cancel until one hour before ride.",
        },
      ],
      removeButtonText: "Remove",
      nextButtonText: "Continue",
      termsLinkText: "View legal terms",
      backgroundColor: "#e1f5fe",
      accentColor: "#01579b",
      cardWidth: "410px",
      headerLayout: 'split',
      infoPosition: 'after',
      buttonStyle: 'rounded',
    },
    // Variant 6 - Card Emphasis
    {
      title: "Pick your ride time",
      infoItems: [
        {
          icon: (
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <rect x="4" y="4" width="16" height="16" rx="3" fill="#006064" />
              <circle cx="12" cy="12" r="4" fill="#fff" />
              <path d="M12 8v4l2 2" stroke="#006064" strokeWidth="1" strokeLinecap="round" />
            </svg>
          ),
          text: "Book scheduled rides 30 days ahead of time.",
        },
        {
          icon: (
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#006064" />
            </svg>
          ),
          text: "Waiting grace period included in all bookings.",
        },
        {
          icon: (
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <rect x="5" y="8" width="14" height="2" rx="1" fill="#006064" />
              <rect x="5" y="13" width="14" height="2" rx="1" fill="#006064" />
              <circle cx="12" cy="12" r="10" stroke="#006064" strokeWidth="1.5" fill="none" />
            </svg>
          ),
          text: "No charge cancellation up to 1 hour before.",
        },
      ],
      removeButtonText: "Delete",
      nextButtonText: "Confirm Time",
      termsLinkText: "Legal information",
      backgroundColor: "#e0f7fa",
      accentColor: "#006064",
      cardWidth: "395px",
      headerLayout: 'compact',
      infoPosition: 'before',
      buttonStyle: 'square',
    },
    // Variant 7 - Professional Style
    {
      title: "Schedule your pickup",
      infoItems: [
        {
          icon: (
            <svg width="19" height="19" fill="none" viewBox="0 0 24 24">
              <rect x="4" y="6" width="16" height="14" rx="2" stroke="#004d40" strokeWidth="1.5" fill="none" />
              <path d="M8 4v4m8-4v4M4 10h16" stroke="#004d40" strokeWidth="1.5" strokeLinecap="round" />
              <text x="12" y="17" textAnchor="middle" fontSize="9" fill="#004d40">30</text>
            </svg>
          ),
          text: "Advance scheduling available up to 30 days.",
        },
        {
          icon: (
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" stroke="#004d40" strokeWidth="1.5" fill="none" />
              <path d="M12 7v5l3.5 2" stroke="#004d40" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          ),
          text: "Additional wait time provided at no extra cost.",
        },
        {
          icon: (
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path d="M20 6L9 17l-5-5" stroke="#004d40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ),
          text: "Free cancellations available until 60 min prior.",
        },
      ],
      removeButtonText: "Clear Selection",
      nextButtonText: "Proceed",
      termsLinkText: "View all terms",
      backgroundColor: "#e8f5e9",
      accentColor: "#004d40",
      cardWidth: "415px",
      headerLayout: 'split',
      infoPosition: 'after',
      buttonStyle: 'rounded',
    },
    // Variant 8 - Modern Clean
    {
      title: "Select pickup date & time",
      infoItems: [
        {
          icon: (
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="#1565c0" strokeWidth="1.8" fill="none" />
              <path d="M12 6v6h6" stroke="#1565c0" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          ),
          text: "Plan up to 30 days in advance.",
        },
        {
          icon: (
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path d="M12 2v20M2 12h20" stroke="#1565c0" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="12" cy="12" r="4" stroke="#1565c0" strokeWidth="1.5" fill="none" />
            </svg>
          ),
          text: "Grace period included for pickup.",
        },
        {
          icon: (
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="4" stroke="#1565c0" strokeWidth="1.5" fill="none" />
              <path d="M7 12l3 3 7-7" stroke="#1565c0" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          ),
          text: "Cancel free up to 1 hour before.",
        },
      ],
      removeButtonText: "Reset",
      nextButtonText: "Continue",
      termsLinkText: "Terms of service",
      backgroundColor: "#f3f6fb",
      accentColor: "#1565c0",
      cardWidth: "385px",
      headerLayout: 'compact',
      infoPosition: 'after',
      buttonStyle: 'pill',
    },
    // Variant 9 - Vibrant
    {
      title: "Choose your pickup time",
      infoItems: [
        {
          icon: (
            <svg width="19" height="19" fill="none" viewBox="0 0 24 24">
              <rect x="3" y="5" width="18" height="16" rx="3" fill="#0d47a1" />
              <rect x="7" y="9" width="10" height="8" rx="1" fill="#fff" />
              <text x="12" y="15" textAnchor="middle" fontSize="7" fill="#0d47a1">30D</text>
            </svg>
          ),
          text: "Schedule rides for up to 30 days ahead.",
        },
        {
          icon: (
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" stroke="#0d47a1" strokeWidth="1.8" fill="none" />
              <path d="M12 6v6l4 2" stroke="#0d47a1" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          ),
          text: "Built-in waiting time for all scheduled rides.",
        },
        {
          icon: (
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path d="M5 12l5 5L20 7" stroke="#0d47a1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ),
          text: "No fees for cancelling before 60 minutes.",
        },
      ],
      removeButtonText: "Remove",
      nextButtonText: "Next",
      termsLinkText: "Read full terms",
      backgroundColor: "#e8eaf6",
      accentColor: "#0d47a1",
      cardWidth: "405px",
      headerLayout: 'stacked',
      infoPosition: 'before',
      buttonStyle: 'rounded',
    },
    // Variant 10 - Elegant
    {
      title: "Set your preferred pickup time",
      infoItems: [
        {
          icon: (
            <svg width="19" height="19" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="#1a237e" />
              <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#fff" fontWeight="600">30</text>
            </svg>
          ),
          text: "Reserve your pickup up to 30 days in advance.",
        },
        {
          icon: (
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="9" stroke="#1a237e" strokeWidth="1.8" fill="none" />
              <path d="M12 7v5h5" stroke="#1a237e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ),
          text: "Waiting time allowance included with each ride.",
        },
        {
          icon: (
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4" stroke="#1a237e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="10" stroke="#1a237e" strokeWidth="1.5" fill="none" />
            </svg>
          ),
          text: "Complimentary cancellation until 60 min before.",
        },
      ],
      removeButtonText: "Clear",
      nextButtonText: "Confirm",
      termsLinkText: "View terms",
      backgroundColor: "#ede7f6",
      accentColor: "#1a237e",
      cardWidth: "425px",
      headerLayout: 'split',
      infoPosition: 'after',
      buttonStyle: 'square',
    },
  ];

  // Map seed using the same formula as layouts: ((seed % 30) + 1) % 10 || 10
  const mappedSeed = ((seed % 30) + 1) % 10 || 10;
  return variants[mappedSeed - 1] || variants[0];
}

export default function PickupNowPage() {
  const router = useSeedRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string>("");
  const [showSlotPanel, setShowSlotPanel] = useState(false);
  const slotPanelRef = useRef<HTMLDivElement>(null);
  const { seed, isDynamicEnabled, generateId } = useSeedLayout();
  const dyn = useDynamicSystem();

  // Get seed-based variant
  const variant = getPickupPageVariant(seed);

  // Convert Date to string format for compatibility
  const date = selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");

  // Only calculate slots and set initial time on client
  const slots = isMounted ? getTimeSlotsForDate(date) : [];
  useEffect(() => {
    setIsMounted(true);
  }, []);
  // On mount (client only), check sessionStorage for pickup date/time
  useEffect(() => {
    if (!isMounted) return;
    if (typeof window !== "undefined") {
      const sd = sessionStorage.getItem("ud_pickupdate");
      const st = sessionStorage.getItem("ud_pickuptime");
      if (sd && st) {
        setSelectedDate(new Date(sd));
        setTime(st);
      }
    }
  }, [isMounted]);
  // Set first available time slot if needed
  useEffect(() => {
    if (isMounted && slots.length && !time) {
      setTime(slots[0]?.value || "");
    }
  }, [isMounted, slots, time]);
  useEffect(() => {
    if (!showSlotPanel) return;
    function handle(e: MouseEvent) {
      if (
        slotPanelRef.current &&
        !slotPanelRef.current.contains(e.target as Node)
      )
        setShowSlotPanel(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [showSlotPanel]);
  // Handler for Next button
  const handleNext = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("ud_pickupdate", date);
      sessionStorage.setItem("ud_pickuptime", time);
    }
    router.push("/ride/trip");
    console.log("Logging NEXT_PICKUP", { date, time, seed, variant: variant.title });
    logEvent(EVENT_TYPES.NEXT_PICKUP, {
      date,
      time,
      timestamp: new Date().toISOString(),
      scheduledDateTime: `${date}T${time}`,
      isFutureDate: new Date(`${date}T${time}`) > new Date(),
      seed: isDynamicEnabled ? seed : 1,
      variant: isDynamicEnabled ? `variant-${((seed % 30) + 1) % 10 || 10}` : 'default',
      variantTitle: variant.title,
      variantAccentColor: variant.accentColor,
      variantButtonStyle: variant.buttonStyle
    });
  };
  const handleRemove = () => {
    setSelectedDate(new Date());
    if (isMounted && slots.length) setTime(slots[0]?.value || "");
    setShowSlotPanel(false);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("ud_pickupdate");
      sessionStorage.removeItem("ud_pickuptime");
    }
  };
  // Get button style classes based on variant
  const getButtonClasses = (baseClasses: string) => {
    const roundedClasses = {
      'rounded': 'rounded-md',
      'square': 'rounded-sm',
      'pill': 'rounded-full',
    };
    return `${baseClasses} ${roundedClasses[variant.buttonStyle]}`;
  };

  return (
    dyn.v1.addWrapDecoy(
      "pickupnow-page",
      <div
        className="min-h-screen"
        style={{ backgroundColor: variant.backgroundColor }}
        data-seed={isDynamicEnabled ? seed : undefined}
        data-variant={isDynamicEnabled ? `variant-${((seed % 30) + 1) % 10 || 10}` : undefined}
      >
        {dyn.v1.addWrapDecoy("pickupnow-navigation-bar", <RideNavbar activeTab="ride" />)}
        <div className="flex gap-8 mt-8 px-8 pb-10 max-lg:flex-col max-lg:px-2 max-lg:gap-4">
          <section
            className="bg-white rounded-2xl shadow-xl p-8 flex flex-col max-lg:w-full mx-auto mt-2 relative border border-gray-100"
            style={{ width: variant.cardWidth, maxWidth: '100%' }}
            id={generateId('pickup-card', 0)}
            data-card-type="pickup-scheduler"
          >
          <div className={`flex items-center mb-6 ${variant.headerLayout === 'stacked' ? 'flex-col gap-3' : variant.headerLayout === 'compact' ? 'justify-center gap-4' : 'justify-between'}`}>
            <button
              onClick={() => router.back()}
              aria-label="Back"
              className={`w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition ${variant.headerLayout === 'stacked' ? 'self-start' : ''}`}
              id={generateId('back-button', 0)}
            >
              <svg width="22" height="22" fill="none" viewBox="0 0 20 20">
                <path
                  d="M13 16l-5-5 5-5"
                  stroke="#111"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <button
              onClick={handleRemove}
              className="text-[15px] text-gray-900 font-semibold"
              id={generateId('remove-button', 0)}
            >
              {variant.removeButtonText}
            </button>
          </div>
          <div
            className="font-bold text-xl mb-8 leading-tight"
            id={generateId('title', 0)}
          >
            {variant.title}
          </div>

          {/* Info items positioned BEFORE pickers */}
          {variant.infoPosition === 'before' && (
            <ul
              className="mb-6 text-[15px] text-gray-800 divide-y divide-gray-200 bg-white rounded-lg"
              id={generateId('info-list', 0)}
              data-position="before"
            >
              {variant.infoItems.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start py-3 px-0 gap-3"
                  id={generateId(`info-item-${index}`, 0)}
                >
                  <span className="mt-0.5">{item.icon}</span>
                  {item.text}
                </li>
              ))}
            </ul>
          )}

          {/* Date picker row */}
          {dyn.v1.addWrapDecoy("pickupnow-date-picker", (
            <div className={cn("mb-4", dyn.v3.getVariant("date-picker-container-class", CLASS_VARIANTS_MAP, ""))}>
              <DatePickerInput
              date={selectedDate}
              onDateChange={(newDate) => {
                setSelectedDate(newDate);
                setTime("");
                if (newDate) {
                  const dateString = format(newDate, "yyyy-MM-dd");
                  console.log("Logging SELECT_DATE", { date: dateString, seed });
                  logEvent(EVENT_TYPES.SELECT_DATE, {
                    date: dateString,
                    timestamp: new Date().toISOString(),
                    isToday: dateString === format(new Date(), "yyyy-MM-dd"),
                    isFutureDate: dateString > format(new Date(), "yyyy-MM-dd"),
                    seed: isDynamicEnabled ? seed : 1,
                    variant: isDynamicEnabled ? `variant-${((seed % 30) + 1) % 10 || 10}` : 'default'
                  });
                }
              }}
              placeholder="Select date"
              disabled={!isMounted}
              minDate={new Date()}
              maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)} // 30 days from now
              />
            </div>
          ))}
          {/* Time picker row */}
          {dyn.v1.addWrapDecoy("pickupnow-time-picker", (
            <div className={`mb-7 relative ${dyn.v3.getVariant("time-picker-container", CLASS_VARIANTS_MAP, "")}`}>
              <div
              className={`bg-gray-100 rounded-lg flex items-center px-4 py-3 cursor-pointer border border-gray-200 text-base group ${dyn.v3.getVariant("time-picker-container", CLASS_VARIANTS_MAP, "")}`}
              id={dyn.v3.getVariant("time-picker-div-id", ID_VARIANTS_MAP, generateId('time-picker', 0))}
              onClick={() => isMounted && setShowSlotPanel(!showSlotPanel)}
              tabIndex={0}
            >
              <svg
                width="22"
                height="22"
                fill="none"
                className="mr-3"
                viewBox="0 0 20 20"
              >
                <circle
                  cx="10"
                  cy="10"
                  r="8"
                  fill="#fff"
                  stroke={variant.accentColor}
                  strokeWidth="1.5"
                />
                <path
                  d="M10 6v4l2.5 2"
                  stroke={variant.accentColor}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span className="flex-1 text-base text-left font-medium text-gray-900">
                {isMounted
                  ? slots.find((s) => s.value === time)?.label ||
                    slots[0]?.label ||
                    "Select time"
                  : "--"}
              </span>
              <svg
                width="20"
                height="20"
                fill="none"
                className="ml-2"
                viewBox="0 0 20 20"
              >
                <path d="M16 7l-6 6-6-6" stroke={variant.accentColor} strokeWidth="1.5" />
              </svg>
            </div>
            {/* Time slot list dropdown */}
            {isMounted && showSlotPanel && (
              <div
                ref={slotPanelRef}
                className="absolute left-0 top-14 w-full max-h-64 overflow-y-auto bg-white rounded-lg shadow-xl z-40"
                style={{
                  boxShadow: "0 4px 32px 0 rgba(0,0,0,0.18)",
                  borderColor: variant.accentColor,
                  borderWidth: '1px',
                  borderStyle: 'solid'
                }}
                id={generateId('time-slots', 0)}
              >
                {slots.map((slot) => (
                  <button
                    key={slot.value}
                    type="button"
                    onClick={() => {
                      setTime(slot.value);
                      setShowSlotPanel(false);
                      console.log("Logging SELECT_TIME", { time: slot.value });
                      logEvent(EVENT_TYPES.SELECT_TIME, {
                        time: slot.value,
                        timestamp: new Date().toISOString(),
                        timeSlot: slot.label,
                        isAvailable: true,
                        seed: isDynamicEnabled ? seed : 1,
                        variant: isDynamicEnabled ? `variant-${((seed % 30) + 1) % 10 || 10}` : 'default'
                      });
                    }}
                    className={`block w-full text-left px-6 py-3 text-base font-medium hover:opacity-80 ${
                      time === slot.value
                        ? "font-bold"
                        : ""
                    }`}
                    style={{
                      backgroundColor: time === slot.value ? `${variant.accentColor}15` : 'transparent',
                      color: time === slot.value ? variant.accentColor : 'inherit'
                    }}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            )}
            </div>
          ))}
          {/* Info items positioned AFTER time picker */}
          {variant.infoPosition === 'after' && (
            <ul
              className="mb-4 text-[15px] text-gray-800 divide-y divide-gray-200 bg-white rounded-lg"
              id={generateId('info-list', 0)}
              data-position="after"
            >
              {variant.infoItems.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start py-3 px-0 gap-3"
                  id={generateId(`info-item-${index}`, 0)}
                >
                  <span className="mt-0.5">{item.icon}</span>
                  {item.text}
                </li>
              ))}
            </ul>
          )}

          <a
            className="text-xs underline text-[#222] mb-5"
            href="#"
            id={generateId('terms-link', 0)}
          >
            {variant.termsLinkText}
          </a>
          {dyn.v1.addWrapDecoy("pickupnow-continue-button", (
            <button
              onClick={handleNext}
              className={getButtonClasses("block w-full text-white py-3 text-lg font-bold mt-2 transition")}
              style={{
                backgroundColor: variant.accentColor,
                '--hover-color': `${variant.accentColor}dd`
              } as React.CSSProperties}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${variant.accentColor}dd`}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = variant.accentColor}
              id={dyn.v3.getVariant("pickupnow-next-button-id", ID_VARIANTS_MAP, generateId('next-button', 0))}
            >
              {variant.nextButtonText}
            </button>
          ))}
        </section>
        <section
          className="flex-1 min-w-0"
          id={generateId('map-section', 0)}
          data-section-type="map"
        >
          <div
            className="w-full h-full min-h-[640px] flex items-center justify-center rounded-2xl overflow-hidden bg-gray-100 shadow-md transition-all"
            style={{
              borderWidth: '2px',
              borderStyle: 'solid',
              borderColor: `${variant.accentColor}20`
            }}
          >
            <img
              src={seed % 2 === 0 ? "/map1.jpg" : "/map.jpg"}
              alt="Map showing pickup location"
              className="object-cover w-full h-full"
              style={{ objectFit: 'cover', maxHeight: '700px' }}
              loading="lazy"
              id={generateId('map-image', 0)}
            />
          </div>
        </section>
      </div>
    </div>
    )
  );
}
