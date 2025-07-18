"use client";
import { useState } from "react";
import type { Job } from "@/library/dataset";
import Image from "next/image";
import { EVENT_TYPES, logEvent } from "@/library/events";

export default function JobCard({
  job,
  onApply,
}: {
  job: Job;
  onApply?: (id: string) => void;
}) {
  const [applied, setApplied] = useState<"none" | "pending" | "done">("none");

  const handleApply = () => {
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

  return (
    <div className="flex items-center gap-4 bg-white rounded shadow p-4 w-full">
      <Image
        src={job.logo}
        alt={job.company}
        width={48}
        height={48}
        className="rounded-md bg-gray-100"
      />
      <div className="flex-1">
        <div className="font-bold text-blue-800 text-lg leading-tight">
          {job.title}
        </div>
        <div className="text-gray-700 font-medium">{job.company}</div>
        <div className="text-sm text-gray-500">{job.location}</div>
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
    </div>
  );
}
