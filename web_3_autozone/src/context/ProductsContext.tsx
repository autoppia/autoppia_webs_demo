"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Product } from "@/context/CartContext";
import { dynamicDataProvider } from "@/utils/dynamicDataProvider";
import { loadProductsFromDb } from "@/data/products-enhanced";
import { isDbLoadModeEnabled } from "@/shared/seeded-loader";
import { isDataGenerationEnabled } from "@/shared/data-generator";
import { useSeed } from "@/context/SeedContext";

interface ProductsContextValue {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const ProductsContext = createContext<ProductsContextValue>({
  products: [],
  isLoading: true,
  error: null,
  refresh: async () => {},
});

export function ProductsProvider({ children }: { children: ReactNode }) {
  const dbMode = useMemo(() => isDbLoadModeEnabled(), []);
  const dataGenerationEnabled = useMemo(() => isDataGenerationEnabled(), []);
  const { seed } = useSeed();

  const [products, setProducts] = useState<Product[]>(() => dynamicDataProvider.getProducts());
  const [isLoading, setIsLoading] = useState<boolean>(dbMode || (dataGenerationEnabled && !dynamicDataProvider.isReady()));
  const [error, setError] = useState<string | null>(null);

  const ensureLocalProducts = useCallback(async () => {
    if (!dynamicDataProvider.isReady()) {
      try {
        await dynamicDataProvider.whenReady();
      } catch (err) {
        console.warn("Failed to await dynamic data provider readiness:", err);
      }
    }
    return dynamicDataProvider.getProducts();
  }, []);

  const loadDbProducts = useCallback(
    async (seedValue: number) => {
      setIsLoading(true);
      try {
        const dbProducts = await loadProductsFromDb(seedValue);
        if (dbProducts.length > 0) {
          setProducts(dbProducts);
          setError(null);
          return;
        }
        const fallback = await ensureLocalProducts();
        setProducts(fallback);
        setError("Seeded dataset unavailable, showing fallback catalog.");
      } catch (err) {
        console.error("Failed to load seeded products:", err);
        const fallback = await ensureLocalProducts();
        setProducts(fallback);
        setError(err instanceof Error ? err.message : "Failed to load seeded data");
      } finally {
        setIsLoading(false);
      }
    },
    [ensureLocalProducts]
  );

  const loadLocalProducts = useCallback(async () => {
    if (dataGenerationEnabled && !dynamicDataProvider.isReady()) {
      setIsLoading(true);
    }
    const localProducts = await ensureLocalProducts();
    setProducts(localProducts);
    setError(null);
    setIsLoading(false);
  }, [dataGenerationEnabled, ensureLocalProducts]);

  useEffect(() => {
    const bootstrap = async () => {
      if (dbMode) {
        await loadDbProducts(seed);
        return;
      }

      await loadLocalProducts();
    };

    bootstrap();
  }, [dbMode, loadDbProducts, loadLocalProducts, seed]);

  const refresh = useCallback(async () => {
    if (dbMode) {
      await loadDbProducts(seed);
      return;
    }
    await loadLocalProducts();
  }, [dbMode, loadDbProducts, loadLocalProducts, seed]);

  return (
    <ProductsContext.Provider
      value={{
        products,
        isLoading,
        error,
        refresh,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductsProvider");
  }
  return context;
};

