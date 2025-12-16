"use client";
import { useState } from "react";
import type { Job } from "@/library/dataset";
import Image from "next/image";
import { SeedLink } from "@/components/ui/SeedLink";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { useV3Attributes } from "@/dynamic/v3-dynamic";

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
  const { getText } = useV3Attributes();
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
      className="flex items-center gap-4 bg-white rounded shadow p-4 w-full hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleViewJob}
    >
      <Image
        src={avatarError ? job.logo : getAvatarUrl()}
        alt={job.company}
        width={48}
        height={48}
        className="rounded-full object-cover bg-gray-100"
        onError={() => setAvatarError(true)}
      />
      <div className="flex-1">
        <div className="font-bold text-blue-800 text-lg leading-tight hover:text-blue-600">
          {job.title}
        </div>
        <div className="text-gray-700 font-medium">{job.company}</div>
        <div className="text-sm text-gray-500">{job.location}</div>
        {job.salary && (
          <div className="text-sm text-green-600 font-medium mt-1">
            {job.salary}
          </div>
        )}
      </div>
      <button
        className={`px-4 py-1.5 rounded-full font-semibold transition ${
          isApplied
            ? "bg-green-600 text-white cursor-default"
            : pending
            ? "bg-gray-400 text-white cursor-wait"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
        onClick={handleApply}
        disabled={isApplied || pending}
      >
        {isApplied
          ? getText("jobs_apply_done", "Applied")
          : pending
          ? getText("jobs_apply_pending", "Pending...")
          : getText("jobs_apply_button", "Apply")}
      </button>
    </SeedLink>
  );
}
