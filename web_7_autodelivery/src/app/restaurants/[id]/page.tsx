import RestaurantDetailPage from '@/components/food/RestaurantDetailPage';

export default function Page({ params }: { params: { id: string } }) {
  return <RestaurantDetailPage restaurantId={params.id} />;
}
