"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/library/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  disabled = false,
  minDate,
  maxDate,
  className,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal bg-gray-100 border-gray-200 hover:bg-gray-50",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
          data-testid="date-picker-trigger"
          aria-label="Select date"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            <span data-testid="selected-date">
              {format(date, "PPP")}
            </span>
          ) : (
            <span data-testid="date-placeholder">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align="start"
        data-testid="date-picker-popover"
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          disabled={(date) => {
            if (minDate && date < minDate) return true;
            if (maxDate && date > maxDate) return true;
            return false;
          }}
          initialFocus
          data-testid="date-picker-calendar"
        />
      </PopoverContent>
    </Popover>
  );
}

// Alternative component that matches the existing design more closely
export function DatePickerInput({
  date,
  onDateChange,
  placeholder = "Select date",
  disabled = false,
  minDate,
  maxDate,
  className,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          className={cn(
            "bg-gray-100 rounded-lg flex items-center px-4 py-3 cursor-pointer text-base group border border-gray-200 hover:bg-gray-50",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          data-testid="date-picker-input-trigger"
          aria-label="Select date"
        >
          <svg
            width="22"
            height="22"
            fill="none"
            className="mr-3"
            viewBox="0 0 20 20"
          >
            <rect
              x="3"
              y="5"
              width="14"
              height="12"
              rx="3"
              fill="#fff"
              stroke="#2095d2"
              strokeWidth="1.5"
            />
            <path d="M3 8h14" stroke="#2095d2" strokeWidth="1.2" />
            <rect x="6" y="2" width="2" height="3" rx="1" fill="#2095d2" />
            <rect x="12" y="2" width="2" height="3" rx="1" fill="#2095d2" />
          </svg>
          <span
            className="flex-1 text-base font-[500] text-gray-900"
            data-testid="date-display"
          >
            {date ? format(date, "MMM dd, yyyy") : placeholder}
          </span>
          <svg
            width="22"
            height="22"
            fill="none"
            className="ml-2"
            viewBox="0 0 20 20"
          >
            <path d="M16 7l-6 6-6-6" stroke="#2095d2" strokeWidth="1.5" />
          </svg>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align="start"
        data-testid="date-picker-input-popover"
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          disabled={(date) => {
            if (minDate && date < minDate) return true;
            if (maxDate && date > maxDate) return true;
            return false;
          }}
          initialFocus
          data-testid="date-picker-input-calendar"
        />
      </PopoverContent>
    </Popover>
  );
}
