"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DataReadyGate } from "@/components/DataReadyGate";
import { EVENT_TYPES, logEvent } from "@/library/events";
import type { Job } from "@/library/dataset";
import {
  loadAppliedJobs,
  persistAppliedJobs,
  type StoredAppliedJob,
} from "@/library/localState";

function AppliedJobsContent() {
  const [applied, setApplied] = useState<Record<string, StoredAppliedJob>>({});

  useEffect(() => {
    const loaded = loadAppliedJobs();
    setApplied(loaded);
    logEvent(EVENT_TYPES.VIEW_APPLIED_JOBS, {
      count: Object.keys(loaded).length,
    });
  }, []);

  useEffect(() => {
    persistAppliedJobs(applied);
  }, [applied]);

  const appliedList = useMemo(
    () =>
      Object.values(applied).sort(
        (a, b) =>
          new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
      ),
    [applied]
  );

  const cancelApplication = (job: Job) => {
    setApplied((prev) => {
      const next = { ...prev };
      delete next[job.id];
      return next;
    });
    logEvent(EVENT_TYPES.CANCEL_APPLICATION, {
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      location: job.location,
    });
  };

  return (
    <section className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Applied jobs ({appliedList.length})
          </h1>
          <p className="text-sm text-gray-600">
            Track the roles you have already applied to.
          </p>
        </div>
        <Link
          href="/jobs"
          className="text-blue-700 hover:text-blue-800 font-semibold"
        >
          ← Back to Jobs
        </Link>
      </div>

      {appliedList.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <div className="text-gray-600 mb-2">
            You have not applied to any jobs yet.
          </div>
          <Link href="/jobs" className="text-blue-600 hover:underline text-sm">
            Browse jobs to get started.
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {appliedList.map(({ job, appliedAt }) => (
            <div
              key={job.id}
              className="bg-white rounded-lg shadow p-4 border border-gray-100 flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {job.title}
                  </div>
                  <div className="text-sm text-gray-700">{job.company}</div>
                  <div className="text-xs text-gray-500">{job.location}</div>
                </div>
                <div className="text-xs text-gray-500">
                  Applied {new Date(appliedAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/jobs/${job.id}`}
                  className="text-blue-600 hover:underline text-sm"
                >
                  View details
                </Link>
                <button
                  className="text-sm text-red-600 hover:underline"
                  onClick={() => cancelApplication(job)}
                >
                  Cancel application
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function AppliedJobsPage() {
  return (
    <DataReadyGate>
      <AppliedJobsContent />
    </DataReadyGate>
  );
}
