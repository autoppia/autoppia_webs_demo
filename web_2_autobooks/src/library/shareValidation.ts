/**
 * Client-side validation for the share-book dialog (recipient name + email).
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isNonEmptyTrimmed(value: string): boolean {
  return value.trim().length > 0;
}

export function isValidRecipientEmail(email: string): boolean {
  const trimmed = email.trim();
  if (!trimmed) return false;
  return EMAIL_PATTERN.test(trimmed);
}

export interface ShareRecipientValidationResult {
  ok: boolean;
  recipientName: string;
  recipientEmail: string;
  error: string | null;
}

export function validateShareRecipientInput(
  recipientName: string,
  recipientEmail: string
): ShareRecipientValidationResult {
  const name = recipientName.trim();
  const email = recipientEmail.trim();

  if (!isNonEmptyTrimmed(name)) {
    return { ok: false, recipientName: name, recipientEmail: email, error: "Please enter the recipient's name." };
  }

  if (!isValidRecipientEmail(email)) {
    return {
      ok: false,
      recipientName: name,
      recipientEmail: email,
      error: "Please enter a valid email address.",
    };
  }

  return { ok: true, recipientName: name, recipientEmail: email, error: null };
}
