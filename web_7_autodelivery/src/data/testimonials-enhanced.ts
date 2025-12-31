/**
 * Enhanced Testimonials Data with AI Generation Support
 * 
 * This file provides both static and dynamic testimonials data generation
 * for the Food Delivery application.
 */

import type { Testimonial } from "@/data/testimonials";
import { testimonials as originalTestimonials } from "@/data/testimonials";




// Helper functions for testimonials data access
export function getRandomTestimonials(count: number = 3, testimonials: Testimonial[] = originalTestimonials): Testimonial[] {
  const shuffled = [...testimonials].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, testimonials.length));
}
