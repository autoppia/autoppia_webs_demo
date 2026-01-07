"use client";
import { useState } from "react";
import type { Job } from "@/library/dataset";
import Image from "next/image";
import { SeedLink } from "@/components/ui/SeedLink";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { useDynamicSystem } from "@/dynamic/shared";
import { CLASS_VARIANTS_MAP, ID_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { cn } from "@/library/utils";

export default function JobCard({
  job,
  onApply,
  isApplied = false,
}: {
  job: Job;
  onApply?: (job: Job) => void;
  isApplied?: boolean;
}) {
  const [pending, setPending] = useState(false);
  const dyn = useDynamicSystem();
  const [avatarError, setAvatarError] = useState(false);

  // Generate a unique avatar based on job ID
  const getAvatarUrl = () => {
    // Extract number from job ID (e.g., "j1" -> 1, "j15" -> 15)
    const jobNumber = parseInt(job.id.replace(/\D/g, "")) || 1;
    // Use a range of avatar IDs (1-70) from pravatar.cc
    const avatarId = ((jobNumber - 1) % 70) + 1;
    return `https://i.pravatar.cc/150?img=${avatarId}`;
  };

  const handleApply = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (pending || isApplied) return;

    logEvent(EVENT_TYPES.APPLY_FOR_JOB, {
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      location: job.location,
    });

    setPending(true);
    onApply?.(job);
    setTimeout(() => setPending(false), 600);
  };

  const handleViewJob = () => {
    logEvent(EVENT_TYPES.VIEW_JOB, {
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      location: job.location,
    });
  };

  return (
    <SeedLink
      href={`/jobs/${job.id}`}
      className={cn(
        "flex items-center gap-4 bg-white rounded shadow p-4 w-full hover:shadow-md transition-shadow cursor-pointer",
        dyn.v3.getVariant("job_card", CLASS_VARIANTS_MAP, "")
      )}
      id={dyn.v3.getVariant(`job_card_${job.id}`, ID_VARIANTS_MAP, `job_card_${job.id}`)}
      onClick={handleViewJob}
    >
      {dyn.v1.addWrapDecoy(
        "job-card-media",
        <Image
          src={avatarError ? job.logo : getAvatarUrl()}
          alt={job.company}
          width={48}
          height={48}
          className="rounded-full object-cover bg-gray-100"
          onError={() => setAvatarError(true)}
        />
      )}
      <div className="flex-1">
        <div className="font-bold text-blue-800 text-lg leading-tight hover:text-blue-600">
          {job.title}
        </div>
        <div className="text-gray-700 font-medium">
          {job.company}
        </div>
        <div className="text-sm text-gray-500">
          {job.location}
        </div>
        {job.salary && (
          <div className="text-sm text-green-600 font-medium mt-1">
            {job.salary}
          </div>
        )}
      </div>
      {dyn.v1.addWrapDecoy(
        "job-card-cta",
        <button
          className={cn(
            "px-4 py-1.5 rounded-full font-semibold transition",
            isApplied
              ? "bg-green-600 text-white cursor-default"
              : pending
              ? "bg-gray-400 text-white cursor-wait"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          )}
          onClick={handleApply}
          disabled={isApplied || pending}
        >
          {isApplied
            ? dyn.v3.getVariant("jobs_apply_done", TEXT_VARIANTS_MAP, "Applied")
            : pending
            ? dyn.v3.getVariant("jobs_apply_pending", TEXT_VARIANTS_MAP, "Pending...")
            : dyn.v3.getVariant("jobs_apply_button", TEXT_VARIANTS_MAP, "Apply")}
        </button>
      )}
    </SeedLink>
  );
}
