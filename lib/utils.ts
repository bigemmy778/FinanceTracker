import dayjs from "dayjs"; // Library for working with dates.

// Formats a number into a currency string, e.g. $50.00.
export const formatCurrency = (value: number, currency = "USD"): string => {
  try {
    //Intl.NumberFormat handles currency formatting automatically, including currency symbols and separators.
    return new Intl.NumberFormat("en-US", {
      style: "currency", // Display the value as money.
      currency, // Choose the currency, e.g. USD, NGN, EUR.
      minimumFractionDigits: 2, // Always show at least 2 decimal places.
      maximumFractionDigits: 2, // Never show more than 2 decimal places.
    }).format(value); // Convert the number into formatted currency.
  } catch {
    return value.toFixed(2); // Fallback: show the number with 2 decimal places.
  }
};

// Converts a subscription date into MM/DD/YYYY format.
export const formatSubscriptionDateTime = (value?: string): string => {
  if (!value) return "Not provided"; // Handle missing dates.

  const parsedDate = dayjs(value); // Convert the string into a Day.js date.

  return parsedDate.isValid()
    ? parsedDate.format("MM/DD/YYYY") // Format valid dates.
    : "Not provided"; // Handle invalid dates.
};

// Capitalizes the first letter of a status.
export const formatStatusLabel = (value?: string): string => {
  if (!value) return "Unknown"; // Handle missing status.

  return value.charAt(0).toUpperCase() + value.slice(1);
  // Capitalize the first letter and keep the remaining letters.
};