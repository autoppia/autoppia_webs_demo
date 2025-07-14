"use client";
import { useState } from "react";
import { mockJobs } from "@/library/dataset";
import JobCard from "@/components/JobCard";
import { logEvent, EVENT_TYPES } from "@/library/events";

export default function JobsPage() {
  const [q, setQ] = useState("");

  const jobs = q
    ? mockJobs.filter(
        (job) =>
          job.title.toLowerCase().includes(q.toLowerCase()) ||
          job.company.toLowerCase().includes(q.toLowerCase())
      )
    : mockJobs;

  function handleSearchInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQ(val);

    if (val.trim().length >= 2) {
      logEvent(EVENT_TYPES.SEARCH_JOBS, {
        query: val.trim(),
        resultCount: mockJobs.filter(
          (job) =>
            job.title.toLowerCase().includes(val.toLowerCase()) ||
            job.company.toLowerCase().includes(val.toLowerCase())
        ).length,
      });
    }
  }

  return (
    <section>
      <h1 className="font-bold text-2xl mb-6">Job Search</h1>
      <input
        className="w-full rounded-full border border-gray-300 px-4 py-2 mb-6 outline-blue-500"
        value={q}
        onChange={handleSearchInput}
        placeholder="Search jobs by title or company..."
      />
      <div className="flex flex-col gap-4">
        {jobs.length === 0 ? (
          <div className="text-gray-500 italic">No jobs found.</div>
        ) : (
          jobs.map((job) => <JobCard key={job.id} job={job} />)
        )}
      </div>
    </section>
  );
}
