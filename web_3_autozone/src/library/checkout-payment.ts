export type PaymentMethodChoice = "on_delivery" | "online";

export type OnlineCardFields = {
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
};

/** Digits only, empty string if none. */
export function cardDigitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function cardLastFour(digits: string): string | null {
  const d = cardDigitsOnly(digits);
  if (d.length < 4) return null;
  return d.slice(-4);
}

export function validateCardName(name: string): string | null {
  const t = name.trim();
  if (t.length < 2) return "Enter the name on the card.";
  if (t.length > 120) return "Name is too long.";
  return null;
}

export function validateCardNumber(numberRaw: string): string | null {
  const d = cardDigitsOnly(numberRaw);
  if (d.length < 13 || d.length > 19) {
    return "Enter a valid card number (13–19 digits).";
  }
  return null;
}

/** Expects MM/YY or MM / YY (flexible spacing). */
export function validateCardExpiry(expiryRaw: string): string | null {
  const compact = expiryRaw.replace(/\s/g, "");
  const m = /^(\d{2})\/(\d{2})$/.exec(compact);
  if (!m) return "Use MM/YY for expiry.";
  const month = Number.parseInt(m[1], 10);
  if (month < 1 || month > 12) return "Invalid expiry month.";
  return null;
}

export function validateCardCvv(cvvRaw: string): string | null {
  const d = cardDigitsOnly(cvvRaw);
  if (d.length < 3 || d.length > 4) return "Enter a 3- or 4-digit security code.";
  return null;
}

export function validateOnlinePayment(fields: OnlineCardFields): string | null {
  return (
    validateCardName(fields.cardName) ??
    validateCardNumber(fields.cardNumber) ??
    validateCardExpiry(fields.expiry) ??
    validateCardCvv(fields.cvv)
  );
}
