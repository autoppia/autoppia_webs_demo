export {
  isDynamicModeEnabled,
  getEffectiveSeed,
  getLayoutConfig,
  getStaticTasks,
  getStaticCalendarEvents,
  getStaticProjects,
  getStaticTeams,
} from "./data-provider";

// Export whenReady function
export const whenReady = () => {
  const { DynamicDataProvider } = require("./data-provider");
  return DynamicDataProvider.getInstance().whenReady();
};
