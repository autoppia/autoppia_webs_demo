import { notFound } from "next/navigation";
import HireFormClient from "./HireFormClient";
import { expertsInWork } from "@/library/dataset";

// ✅ Make sure this export is here for static generation
export const dynamicParams = false;

export function generateStaticParams() {
  return expertsInWork.map((expert) => ({ slug: expert.slug }));
}

export default async function HireExpertPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params; // Resolve the Promise
  const expert = expertsInWork.find((e) => e.slug === resolvedParams.slug);

  if (!expert) return notFound();

  return <HireFormClient expert={expert} />;
}
