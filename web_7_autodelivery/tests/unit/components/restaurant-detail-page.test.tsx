import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import RestaurantDetailPage from "@/components/food/RestaurantDetailPage";

const pushMock = jest.fn();

jest.mock("@/contexts/RestaurantContext", () => ({
  useRestaurants: () => ({
    restaurants: [],
    isLoading: false,
    getRestaurantById: () => undefined,
  }),
}));

jest.mock("@/store/cart-store", () => ({
  useCartStore: (selector: (state: { addToCart: () => void; items: unknown[] }) => unknown) =>
    selector({ addToCart: jest.fn(), items: [] }),
}));

jest.mock("@/contexts/LayoutProvider", () => ({
  useLayout: () => ({
    seed: 1,
    restaurantDetail: { containerClass: "" },
    generateSeedClass: () => "",
    getElementAttributes: () => ({}),
  }),
}));

jest.mock("@/dynamic/shared", () => ({
  useDynamicSystem: () => ({
    v1: {
      addWrapDecoy: (_key: string, node: unknown) => node,
      changeOrderElements: (_key: string, count: number) =>
        Array.from({ length: count }, (_, i) => i),
    },
    v2: { isEnabled: () => true },
    v3: { getVariant: (_k: string, _m: unknown, fallback: string) => fallback },
  }),
}));

jest.mock("@/hooks/useSeedRouter", () => ({
  useSeedRouter: () => ({ push: pushMock }),
}));

describe("RestaurantDetailPage", () => {
  beforeEach(() => {
    pushMock.mockReset();
  });

  test("renders polished not-found state and navigates back", () => {
    render(React.createElement(RestaurantDetailPage, { restaurantId: "1" }));

    expect(screen.getByText("Restaurant not found")).toBeInTheDocument();
    expect(
      screen.getByText(
        "The restaurant you are trying to open is not available for this seed. Browse all restaurants to continue ordering."
      )
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Back to restaurants" }));
    expect(pushMock).toHaveBeenCalledWith("/restaurants");
  });
});
