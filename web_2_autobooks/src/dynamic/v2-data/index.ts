export {
  dynamicDataProvider,
  getBooks,
  getBookById,
  getFeaturedBooks,
  getRelatedBooks,
  getBooksByGenre,
  getAvailableGenres,
  getAvailableYears,
  searchBooks,
  isDynamicModeEnabled,
  getLayoutConfig,
} from "./data-provider";
export type { BookSearchFilters } from "./data-provider";

// Export whenReady function
export const whenReady = () => dynamicDataProvider.whenReady();
