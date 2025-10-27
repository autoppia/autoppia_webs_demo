"use client";
import { useState } from "react";
import type { Job } from "@/library/dataset";
import Image from "next/image";
import { SeedLink } from "@/components/ui/SeedLink";
import { EVENT_TYPES, logEvent } from "@/library/events";

export default function JobCard({
  job,
  onApply,
}: {
  job: Job;
  onApply?: (id: string) => void;
}) {
  const [applied, setApplied] = useState<"none" | "pending" | "done">("none");

  const handleApply = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (applied !== "none") return;

    logEvent(EVENT_TYPES.APPLY_FOR_JOB, {
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      location: job.location,
    });

    setApplied("pending");
    setTimeout(() => setApplied("done"), 1000);
    onApply?.(job.id);
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
        src={job.logo}
        alt={job.company}
        width={48}
        height={48}
        className="rounded-md bg-gray-100"
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
          applied === "done"
            ? "bg-green-600 text-white cursor-default"
            : applied === "pending"
            ? "bg-gray-400 text-white cursor-wait"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
        onClick={handleApply}
        disabled={applied !== "none"}
      >
        {applied === "none"
          ? "Apply"
          : applied === "pending"
          ? "Pending..."
          : "Applied"}
      </button>
    </SeedLink>
  );
}
