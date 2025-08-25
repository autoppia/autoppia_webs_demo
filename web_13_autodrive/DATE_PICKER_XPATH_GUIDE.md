# Date Picker XPath Selectors Guide

## Overview
The date picker component has been updated to provide better XPath selectors for automation testing. The new implementation replaces the native HTML `<input type="date">` with a custom React component that includes proper data attributes and semantic structure.

## Available XPath Selectors

### 1. Date Picker Trigger
- **XPath**: `//div[@data-testid="date-picker-input-trigger"]`
- **Description**: The main trigger button that opens the date picker popover
- **Action**: Click to open the date picker

### 2. Date Display
- **XPath**: `//span[@data-testid="date-display"]`
- **Description**: Shows the currently selected date or placeholder text
- **Content**: Displays date in "MMM dd, yyyy" format (e.g., "Jan 15, 2025")

### 3. Date Picker Popover
- **XPath**: `//div[@data-testid="date-picker-input-popover"]`
- **Description**: The popover container that holds the calendar
- **Visibility**: Only visible when date picker is open

### 4. Calendar Component
- **XPath**: `//div[@data-testid="date-picker-input-calendar"]`
- **Description**: The calendar component with navigation and date selection
- **Contains**: Month navigation, day grid, and date selection buttons

### 5. Calendar Navigation
- **Previous Month**: `//button[@aria-label="Previous month"]`
- **Next Month**: `//button[@aria-label="Next month"]`
- **Month/Year Display**: `//h2[@class="rdp-caption_label"]`

### 6. Date Selection
- **Specific Date**: `//button[@data-value="2025-01-15"]` (for January 15, 2025)
- **Today's Date**: `//button[contains(@class, "rdp-day_today")]`
- **Selected Date**: `//button[contains(@class, "rdp-day_selected")]`
- **Available Dates**: `//button[not(contains(@class, "rdp-day_disabled"))]`

## Example Automation Scripts

### Opening the Date Picker
```javascript
// Click the date picker trigger
await driver.findElement(By.xpath('//div[@data-testid="date-picker-input-trigger"]')).click();
```

### Selecting a Specific Date
```javascript
// Open the date picker
await driver.findElement(By.xpath('//div[@data-testid="date-picker-input-trigger"]')).click();

// Select January 15, 2025
await driver.findElement(By.xpath('//button[@data-value="2025-01-15"]')).click();
```

### Navigating to Different Month
```javascript
// Open the date picker
await driver.findElement(By.xpath('//div[@data-testid="date-picker-input-trigger"]')).click();

// Navigate to next month
await driver.findElement(By.xpath('//button[@aria-label="Next month"]')).click();
```

### Verifying Selected Date
```javascript
// Check the displayed date
const dateDisplay = await driver.findElement(By.xpath('//span[@data-testid="date-display"]'));
const selectedDate = await dateDisplay.getText();
console.log('Selected date:', selectedDate);
```

## Component Features

### Accessibility
- Proper ARIA labels for screen readers
- Keyboard navigation support
- Focus management

### Validation
- Minimum date: Today
- Maximum date: 30 days from today
- Disabled dates are visually distinct

### Styling
- Matches the existing design system
- Blue color scheme (#2095d2)
- Responsive design

## Migration Notes

### Before (Native Input)
```html
<input type="date" min="2025-01-15" value="2025-01-15" />
```

### After (Custom Component)
```jsx
<DatePickerInput
  date={selectedDate}
  onDateChange={setSelectedDate}
  minDate={new Date()}
  maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
/>
```

## Testing Recommendations

1. **Visual Testing**: Verify the date picker opens and displays correctly
2. **Date Selection**: Test selecting various dates including today, future dates
3. **Navigation**: Test month navigation buttons
4. **Validation**: Test that past dates are disabled
5. **Accessibility**: Test keyboard navigation and screen reader compatibility
6. **Mobile**: Test on mobile devices for touch interaction

## Troubleshooting

### Common Issues
1. **Date picker not opening**: Check if the trigger element is clickable
2. **Date not updating**: Verify the `onDateChange` callback is working
3. **Styling issues**: Ensure CSS variables are properly defined
4. **Accessibility issues**: Check ARIA labels and keyboard navigation

### Debug XPath
```javascript
// Test if element exists
const element = await driver.findElement(By.xpath('//div[@data-testid="date-picker-input-trigger"]'));
console.log('Element found:', await element.isDisplayed());
``` 