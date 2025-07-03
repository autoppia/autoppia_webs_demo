import { notFound } from "next/navigation";
import { experts } from "../../experts";
import HireFormClient from "./HireFormClient";

// ✅ Make sure this export is here for static generation
export const dynamicParams = false;

export function generateStaticParams() {
  return experts.map((expert) => ({ slug: expert.slug }));
}

export default async function HireExpertPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params; // Resolve the Promise
  const expert = experts.find((e) => e.slug === resolvedParams.slug);

  if (!expert) return notFound();

  return <HireFormClient expert={expert} />;
}
