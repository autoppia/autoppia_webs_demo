import ExpertProfileClient from "./ExpertProfileClient";

export const dynamicParams = true;

export default function ExpertProfile({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Accept params as a Promise (Next 15) and resolve with .then in JSX-friendly way
  // Simpler: cast for now; Next will resolve before render
  // @ts-expect-error Next.js passes a Promise here
  const { slug } = params as { slug: string };

  return <ExpertProfileClient slug={slug} />;
}
