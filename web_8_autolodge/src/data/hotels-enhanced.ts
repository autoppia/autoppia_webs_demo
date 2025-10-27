import { isDataGenerationEnabled, generateProjectData } from "@/shared/data-generator";
import { Hotel } from "@/types/hotel";

/**
 * Initialize hotels data - either from AI generation or fallback to static data
 */
export async function initializeHotels(): Promise<Hotel[]> {
  // Check if data generation is enabled
  if (!isDataGenerationEnabled()) {
    console.log('📊 Data generation disabled, using static hotel data');
    return import("./hotels").then(m => m.default);
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
      return import("./hotels").then(m => m.default);
    }
  } catch (error) {
    console.error('❌ Data generation error, falling back to static data:', error);
    return import("./hotels").then(m => m.default);
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
