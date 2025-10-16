export const dynamicParams = false;

import { notFound } from "next/navigation";
import { getExpert } from "../experts";
import BookConsultationLogger from "./BookConsultationLogger";
import ExpertProfileClient from "./ExpertProfileClient";
import { experts } from "@/library/dataset";

export function generateStaticParams() {
  return experts.map((e) => ({ slug: e.slug }));
}



export default async function ExpertProfile({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params; // Resolve the Promise
  const expert = getExpert(resolvedParams.slug);
  if (!expert) return notFound();

  // Note: This is a server component, so we can't use the hook directly
  // The layout will be applied in the client component

  return (
    <>
      {/* Client component for event logging */}
      <BookConsultationLogger expert={expert} />
      <ExpertProfileClient expert={expert} />
    </>
  );
}
