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
} from "./data-provider";
export type { BookSearchFilters } from "./data-provider";

// Export whenReady function
import { dynamicDataProvider } from "./data-provider";

export const whenReady = () => dynamicDataProvider.whenReady();
