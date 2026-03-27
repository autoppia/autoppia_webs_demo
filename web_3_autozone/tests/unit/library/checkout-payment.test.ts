import {
  cardDigitsOnly,
  cardLastFour,
  validateCardCvv,
  validateCardExpiry,
  validateCardName,
  validateCardNumber,
  validateOnlinePayment,
} from "@/library/checkout-payment";

describe("checkout-payment validation", () => {
  test("cardDigitsOnly strips non-digits", () => {
    expect(cardDigitsOnly("4242-4242-4242-4242")).toBe("4242424242424242");
  });

  test("cardLastFour returns last four or null", () => {
    expect(cardLastFour("4242424242424242")).toBe("4242");
    expect(cardLastFour("424")).toBeNull();
  });

  test("validateCardName", () => {
    expect(validateCardName("")).not.toBeNull();
    expect(validateCardName("Jo")).toBeNull();
  });

  test("validateCardNumber length rules", () => {
    expect(validateCardNumber("4242424242424242")).toBeNull();
    expect(validateCardNumber("424242424242")).not.toBeNull();
  });

  test("validateCardExpiry MM/YY", () => {
    expect(validateCardExpiry("12 / 30")).toBeNull();
    expect(validateCardExpiry("13/30")).not.toBeNull();
    expect(validateCardExpiry("bad")).not.toBeNull();
  });

  test("validateCardCvv", () => {
    expect(validateCardCvv("123")).toBeNull();
    expect(validateCardCvv("12")).not.toBeNull();
  });

  test("validateOnlinePayment aggregates first error", () => {
    expect(
      validateOnlinePayment({
        cardName: "",
        cardNumber: "4242424242424242",
        expiry: "12/30",
        cvv: "123",
      })
    ).not.toBeNull();
    expect(
      validateOnlinePayment({
        cardName: "Jane Doe",
        cardNumber: "4242424242424242",
        expiry: "12/30",
        cvv: "123",
      })
    ).toBeNull();
  });
});
