import ExpertProfileClient from "./ExpertProfileClient";

export const dynamicParams = true;

export default async function ExpertProfile({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ExpertProfileClient slug={slug} />;
}
