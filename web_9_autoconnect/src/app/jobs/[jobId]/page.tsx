import { use } from "react";
import JobDetailClient from "@/components/JobDetailClient";

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = use(params);
  return <JobDetailClient jobId={jobId} />;
}
