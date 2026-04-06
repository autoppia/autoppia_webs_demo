import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import QuickOrderModal from "@/components/food/QuickOrderModal";

const addToCartMock = jest.fn();

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => React.createElement("div", null, children),
  DialogContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
  DialogHeader: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
  DialogTitle: ({ children }: { children: React.ReactNode }) => React.createElement("h2", null, children),
  DialogDescription: ({ children }: { children: React.ReactNode }) =>
    React.createElement("p", null, children),
}));

jest.mock("@/store/cart-store", () => ({
  useCartStore: (selector: (state: { addToCart: typeof addToCartMock }) => unknown) =>
    selector({ addToCart: addToCartMock }),
}));

jest.mock("@/contexts/RestaurantContext", () => ({
  useRestaurants: () => ({
    isLoading: false,
    restaurants: [
      {
        id: "r1",
        name: "Green Bowl",
        cuisine: "Healthy",
        rating: 4.7,
        featured: true,
        deliveryTime: "20-30 min",
        pickupTime: "10-15 min",
        image: "/images/sample.jpg",
        menu: [{ id: "m1", name: "Protein Bowl", price: 12 }],
      },
    ],
  }),
}));

jest.mock("@/contexts/LayoutProvider", () => ({
  useLayout: () => ({ getNavigationUrl: (path: string) => path }),
}));

jest.mock("@/hooks/use-seed-layout", () => ({
  useSeedLayout: () => ({ modal: { containerClass: "", contentClass: "", headerClass: "" } }),
}));

jest.mock("@/dynamic/shared", () => ({
  useDynamicSystem: () => ({
    v1: {
      addWrapDecoy: (_key: string, node: unknown) => node,
      changeOrderElements: (_key: string, count: number) =>
        Array.from({ length: count }, (_, i) => i),
    },
    v3: { getVariant: (_k: string, _m: unknown, fallback: string) => fallback },
  }),
}));

jest.mock("@/hooks/useSeedRouter", () => ({
  useSeedRouter: () => ({ push: jest.fn() }),
}));

describe("QuickOrderModal", () => {
  beforeEach(() => {
    addToCartMock.mockReset();
    global.fetch = jest.fn().mockResolvedValue({ ok: true } as never);
  });

  test("shows inline confirmation message after quick-adding popular item", () => {
    render(React.createElement(QuickOrderModal, { open: true, onOpenChange: jest.fn() }));

    fireEvent.click(screen.getByRole("button", { name: /Quick Add Popular Item/i }));

    expect(addToCartMock).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText("Protein Bowl from Green Bowl added to cart.")
    ).toBeInTheDocument();
  });
});
