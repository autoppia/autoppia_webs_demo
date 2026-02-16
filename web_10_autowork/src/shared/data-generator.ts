/**
 * Web 10 Autowork Type Definitions
 *
 * TypeScript interfaces for Jobs, Hires, Skills, and Experts.
 */

export interface AutoworkJob {
  id: string;
  title: string;
  status: 'Open' | 'Assigned' | 'In progress' | 'Completed';
  location: string; // City, Country
  budget: string; // $100 - $600
  requiredSkills: string[]; // e.g., Brakes, Engine diagnostics
  postedDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  notes?: string;
}

export interface AutoworkHire {
  name: string;
  country: string;
  rate: string; // $/hr
  rating: number; // 1.0 - 5.0
  jobs: number; // completed jobs
  role: string; // e.g., Automotive Technician
  avatar: string; // randomuser.me
  rehire: boolean;
  skills?: string[];
}

export interface AutoworkExpert {
  slug: string;
  name: string;
  country: string;
  role: string; // Senior Diagnostic Expert, Master Mechanic, etc.
  avatar: string; // randomuser.me
  rate: string; // $/hr
  rating: number; // 1.0 - 5.0
  jobs: number; // completed jobs
  specialties: string[];
  bio: string;
}
