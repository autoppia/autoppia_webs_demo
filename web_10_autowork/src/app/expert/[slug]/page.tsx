import { use } from "react";
import ExpertProfileClient from "./ExpertProfileClient";

export const dynamicParams = true;

export default function ExpertProfile({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  return <ExpertProfileClient slug={slug} />;
}
