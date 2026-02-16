/**
 * Web 9 – LinkedIn Lite Type Definitions
 *
 * TypeScript interfaces for Users, Posts, Jobs, and Recommendations.
 */

export interface Experience {
  title: string;
  company: string;
  logo: string;
  duration: string;
  location: string;
  description: string;
}

export interface User {
  username: string;
  name: string;
  avatar: string;
  bio: string;
  title: string;
  about?: string;
  experience?: Experience[];
}

export interface PostComment {
  id: string;
  user: User;
  text: string;
  timestamp: string;
}

export interface Post {
  id: string;
  user: User;
  content: string;
  timestamp: string;
  likes: number;
  liked: boolean;
  comments: PostComment[];
  image?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  logo: string;
  salary?: string;
  type?: string;
  experience?: string;
  description?: string;
  requirements?: string[];
  benefits?: string[];
  postedDate?: string;
  applicationCount?: number;
  companySize?: string;
  industry?: string;
  remote?: boolean;
}

export interface Recommendation {
  id: string;
  type: 'user' | 'job' | 'company' | 'skill' | 'event';
  title: string;
  description: string;
  reason: string;
  relevanceScore: number;
  category: string;
  image?: string;
  metadata?: {
    location?: string;
    company?: string;
    salary?: string;
    experience?: string;
    skills?: string[];
    industry?: string;
  };
}
