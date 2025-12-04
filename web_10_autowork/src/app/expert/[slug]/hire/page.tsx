import { use } from "react";
import HireFormWrapperClient from "./HireFormWrapperClient";

export const dynamicParams = true;

export default function HireExpertPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  return <HireFormWrapperClient slug={slug} />;
}
