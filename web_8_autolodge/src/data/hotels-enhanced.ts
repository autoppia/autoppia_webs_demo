import { isDataGenerationEnabled, generateProjectData, getRandomHotelImage } from "@/shared/data-generator";
import { isDbLoadModeEnabled, fetchSeededSelection } from "@/shared/seeded-loader";
import { Hotel } from "@/types/hotel";

/**
 * Initialize hotels data - either from database, AI generation, or fallback to static data
 */
export async function initializeHotels(): Promise<Hotel[]> {
  // Check if database mode is enabled and we're in the browser (not during build)
  if (isDbLoadModeEnabled() && typeof window !== "undefined") {
    console.log('🗄️ Database mode enabled, loading hotels from database...');
    try {
      const dbData = await fetchSeededSelection({
        projectKey: "web_8_autolodge",
        entityType: "hotels",
        seedValue: 1, // Use default seed when no seed is provided
        limit: 50
      });
      
      if (dbData && dbData.length > 0) {
        console.log(`✅ Loaded ${dbData.length} hotels from database`);
        return dbData as Hotel[];
      } else {
        console.log('⚠️ No data found in database, falling back to static data');
      }
    } catch (error) {
      console.warn('⚠️ Database load failed, falling back to static data:', error);
    }
  }

  // If DB mode is enabled but we're server-side (during build), use static data with proper images
  if (isDbLoadModeEnabled() && typeof window === "undefined") {
    console.log('📊 DB mode enabled but running server-side, using static hotel data with Unsplash images');
    const staticData = await import("./hotels").then(m => m.default);
    // Update static data with proper images
    return staticData.map((hotel: Hotel, index: number) => ({
      ...hotel,
      image: getRandomHotelImage(index)
    }));
  }

  // Check if data generation is enabled
  if (!isDataGenerationEnabled()) {
    console.log('📊 Data generation disabled, using static hotel data');
    const staticData = await import("./hotels").then(m => m.default);
    // Update static data with proper images
    return staticData.map((hotel: Hotel, index: number) => ({
      ...hotel,
      image: getRandomHotelImage(index)
    }));
  }

  // Check for cached data first
  const cacheKey = "autolodge_generated_hotels_v1";
  const cached = typeof window !== "undefined" ? localStorage.getItem(cacheKey) : null;
  
  if (cached) {
    try {
      const parsedData = JSON.parse(cached);
      console.log('💾 Using cached hotel data:', parsedData.length, 'hotels');
      return parsedData;
    } catch (error) {
      console.warn('⚠️ Failed to parse cached data, regenerating...', error);
    }
  }

  console.log('🚀 Generating hotels for Autolodge...');
  
  try {
    const result = await generateProjectData("web_8_autolodge", 50);
    
    if (result.success && result.data.length > 0) {
      console.log(`✅ Generated ${result.data.length} hotels across 8 categories`);
      
      // Cache the results
      if (typeof window !== "undefined") {
        localStorage.setItem(cacheKey, JSON.stringify(result.data));
        console.log('💾 Cached results in localStorage (autolodge_generated_hotels_v1)');
      }
      
      return result.data;
    } else {
      console.warn('⚠️ Data generation failed, falling back to static data:', result.error);
      const staticData = await import("./hotels").then(m => m.default);
      // Update static data with proper images
      return staticData.map((hotel: Hotel, index: number) => ({
        ...hotel,
        image: getRandomHotelImage(index)
      }));
    }
  } catch (error) {
    console.error('❌ Data generation error, falling back to static data:', error);
    const staticData = await import("./hotels").then(m => m.default);
    // Update static data with proper images
    return staticData.map((hotel: Hotel, index: number) => ({
      ...hotel,
      image: getRandomHotelImage(index)
    }));
  }
}

/**
 * Clear cached hotel data
 */
export function clearHotelCache(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("autolodge_generated_hotels_v1");
    console.log('🗑️ Cleared hotel cache');
  }
}
