/**
 * Enhanced Testimonials Data with AI Generation Support
 * 
 * This file provides both static and dynamic testimonials data generation
 * for the Food Delivery application.
 */

import type { Testimonial } from "@/data/testimonials";
import { readJson, writeJson } from "@/shared/storage";
import { 
  generateProjectData, 
  isDataGenerationEnabled 
} from "@/shared/data-generator";
import { fetchSeededSelection, getSeedValueFromEnv, isDbLoadModeEnabled } from "@/shared/seeded-loader";
import { testimonials as originalTestimonials } from "@/data/testimonials";

// Configuration for testimonials generation
const TESTIMONIALS_CONFIG = {
  DEFAULT_COUNT: 5,
  CACHE_KEY: 'fooddelivery_generated_testimonials_v1'
};

/**
 * Generate testimonials using AI
 */
async function generateTestimonialsWithFallback(
  originalTestimonials: Testimonial[],
  count: number = TESTIMONIALS_CONFIG.DEFAULT_COUNT
): Promise<Testimonial[]> {
  if (!isDataGenerationEnabled()) {
    console.log("🔍 Data generation not enabled for testimonials, using original");
    return originalTestimonials;
  }

  try {
    const result = await generateProjectData(
      'web_7_food_delivery',
      count,
      ['testimonials']
    );

    if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
      console.log(`✅ Generated ${result.data.length} testimonials`);
      return result.data as Testimonial[];
    }
  } catch (error) {
    console.warn('Testimonials generation failed, using original testimonials:', error);
  }

  return originalTestimonials;
}

/**
 * Main initialization function for testimonials
 */
export async function initializeTestimonials(): Promise<Testimonial[]> {
  if (!isDataGenerationEnabled()) {
    console.log("🔍 Data generation not available for testimonials, using original");
    return originalTestimonials;
  }

  // Check cache first
  const cached = readCachedTestimonials();
  if (cached && cached.length > 0) {
    console.log("🔍 Using cached testimonials:", cached.length, "items");
    return cached;
  }

  try {
    const generatedTestimonials = await generateTestimonialsWithFallback(
      originalTestimonials,
      TESTIMONIALS_CONFIG.DEFAULT_COUNT
    );

    if (generatedTestimonials.length === 0) {
      console.log("No testimonials were generated, returning original testimonials.");
      return originalTestimonials;
    }

    // Cache results
    writeCachedTestimonials(generatedTestimonials);
    
    console.log(`✅ Successfully generated and cached ${generatedTestimonials.length} testimonials`);
    return generatedTestimonials;
  } catch (error) {
    console.error("❌ Failed to generate testimonials:", error);
    return originalTestimonials;
  }
}

/**
 * Load testimonials from database with seeded selection
 */
export async function loadTestimonialsFromDb(seedOverride?: number | null): Promise<Testimonial[]> {
  if (!isDbLoadModeEnabled()) {
    console.log("🔍 DB mode not enabled for testimonials, returning empty array");
    return [];
  }

  try {
    const fallbackSeed = getSeedValueFromEnv(1);
    const seed = typeof seedOverride === "number" && Number.isFinite(seedOverride) ? seedOverride : fallbackSeed;
    const limit = 10;
    console.log("🔍 Attempting to load testimonials from DB with seed:", seed, "limit:", limit);
    
    const selected = await fetchSeededSelection<Testimonial>({
      projectKey: "web_7_autodelivery",
      entityType: "testimonials",
      seedValue: seed,
      limit,
      method: "select",
    });
    
    console.log("🔍 Selected testimonials:", selected?.length || 0, "items");

    if (selected && selected.length > 0) {
      console.log("🔍 DB testimonials loaded:", selected.length, "items");
      return selected;
    }
    
    console.log("🔍 No testimonials found in DB, falling back to original testimonials");
    return originalTestimonials;
  } catch (error) {
    console.error("❌ Failed to load testimonials from DB:", error);
    return originalTestimonials;
  }
}

// Cache management
export function readCachedTestimonials(): Testimonial[] | null {
  return readJson<Testimonial[]>(TESTIMONIALS_CONFIG.CACHE_KEY);
}

export function writeCachedTestimonials(testimonials: Testimonial[]): void {
  writeJson(TESTIMONIALS_CONFIG.CACHE_KEY, testimonials);
}

export function clearCachedTestimonials(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TESTIMONIALS_CONFIG.CACHE_KEY);
  }
}

// Helper functions for testimonials data access
export function getTestimonialById(id: string, testimonials: Testimonial[] = originalTestimonials): Testimonial | undefined {
  return testimonials.find(testimonial => testimonial.id === id);
}

export function getRandomTestimonials(count: number = 3, testimonials: Testimonial[] = originalTestimonials): Testimonial[] {
  const shuffled = [...testimonials].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, testimonials.length));
}

export function getTestimonialsStats(testimonials: Testimonial[] = originalTestimonials) {
  return {
    totalTestimonials: testimonials.length,
    averageFeedbackLength: testimonials.reduce((sum, t) => sum + t.feedback.length, 0) / testimonials.length,
    uniqueNames: [...new Set(testimonials.map(t => t.name))].length
  };
}
