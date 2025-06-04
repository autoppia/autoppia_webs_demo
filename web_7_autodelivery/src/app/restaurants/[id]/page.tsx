// src/app/restaurants/[id]/page.tsx
import { notFound } from 'next/navigation';
import RestaurantDetailPage from '@/components/food/RestaurantDetailPage';
import type { NextPage } from 'next';

// Define props with params as a Promise
type Props = {
  params: Promise<{ id: string }>;
};

// Use async function to handle Promise
const Page: NextPage<Props> = async ({ params }) => {
  const { id } = await params; // Await the params to resolve the Promise
  if (!id) {
    notFound(); // Handle missing ID with 404
  }
  return <RestaurantDetailPage restaurantId={id} />;
};

export default Page;