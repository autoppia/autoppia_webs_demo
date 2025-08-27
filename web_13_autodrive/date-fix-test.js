// Test file to demonstrate the date conversion issue and fix
const { format } = require('date-fns');

// Simulate the original problematic code
function originalDateConversion(date) {
  return date.toISOString().slice(0, 10);
}

// Simulate the fixed code
function fixedDateConversion(date) {
  return format(date, "yyyy-MM-dd");
}

// Test with a specific date (e.g., August 30, 2025)
const testDate = new Date(2025, 7, 30); // Month is 0-indexed, so 7 = August

console.log("Test Date:", testDate);
console.log("Original conversion (toISOString):", originalDateConversion(testDate));
console.log("Fixed conversion (format):", fixedDateConversion(testDate));

// Test with current date
const now = new Date();
console.log("\nCurrent Date:", now);
console.log("Original conversion (toISOString):", originalDateConversion(now));
console.log("Fixed conversion (format):", fixedDateConversion(now));

// Test timezone impact
console.log("\nTimezone offset:", now.getTimezoneOffset(), "minutes");
console.log("This explains why toISOString() can shift the date by one day"); 