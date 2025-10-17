"use client";

import { useState } from "react";
import { DatePickerInput } from "./DatePicker";

export function DatePickerTest() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Date Picker Test</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Select Date:</label>
          <DatePickerInput
            date={selectedDate}
            onDateChange={setSelectedDate}
            placeholder="Choose a date"
            minDate={new Date()}
            maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
          />
        </div>
        
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-2">Selected Date Info:</h3>
          <p><strong>Date:</strong> {selectedDate ? selectedDate.toLocaleDateString() : 'None'}</p>
          <p><strong>ISO String:</strong> {selectedDate ? selectedDate.toISOString() : 'None'}</p>
          <p><strong>Timestamp:</strong> {selectedDate ? selectedDate.getTime() : 'None'}</p>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">XPath Selectors:</h3>
          <ul className="text-sm space-y-1">
            <li><code>{'//div[@data-testid="date-picker-input-trigger"]'}</code> - Trigger button</li>
            <li><code>{'//span[@data-testid="date-display"]'}</code> - Date display</li>
            <li><code>{'//div[@data-testid="date-picker-input-popover"]'}</code> - Popover container</li>
            <li><code>{'//div[@data-testid="date-picker-input-calendar"]'}</code> - Calendar component</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 