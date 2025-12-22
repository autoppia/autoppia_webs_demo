import ExpertProfileClient from "./ExpertProfileClient";

export const dynamicParams = true;

export default function ExpertProfile({ params }: { params: { slug: string } }) {
  return <ExpertProfileClient slug={params.slug} />;
}
