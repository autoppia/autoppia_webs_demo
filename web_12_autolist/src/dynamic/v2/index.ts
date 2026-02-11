/**
 * V2 Data Loading System
 * 
 * Loads different data subsets based on v2 seed.
 */

export {
  dynamicDataProvider,
  whenReady,
  getTasks,
  getTaskById,
  searchTasks,
  getTasksByPriority,
  getCompletedTasks,
  getActiveTasks,
  isDynamicModeEnabled,
} from "./data-provider";
