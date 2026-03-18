"use client";
import { useEffect, useMemo, useState } from "react";
import { SeedLink } from "@/components/ui/SeedLink";
import { DataReadyGate } from "@/components/DataReadyGate";
import { EVENT_TYPES, logEvent } from "@/library/events";
import type { Job } from "@/library/dataset";
import {
  APPLICATION_STATUS_LABELS,
  loadNormalizedAppliedJobs,
  persistAppliedJobs,
  type StoredAppliedJob,
} from "@/library/localState";

function AppliedJobsContent() {
  const [applied, setApplied] = useState<Record<string, StoredAppliedJob>>({});
  const [isAppliedJobsHydrated, setIsAppliedJobsHydrated] = useState(false);

  useEffect(() => {
    const loaded = loadNormalizedAppliedJobs();
    setApplied(loaded);
    setIsAppliedJobsHydrated(true);
    logEvent(EVENT_TYPES.VIEW_APPLIED_JOBS, {
      count: Object.keys(loaded).length,
    });
  }, []);

  useEffect(() => {
    if (!isAppliedJobsHydrated) return;
    persistAppliedJobs(applied);
  }, [applied, isAppliedJobsHydrated]);

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
        <div className="flex items-center gap-4">
          <SeedLink
            href="/applications/pipeline"
            className="text-sm text-gray-700 hover:text-gray-900 hover:underline font-semibold"
          >
            Track application
          </SeedLink>
          <SeedLink
            href="/jobs"
            className="text-blue-700 hover:text-blue-800 font-semibold"
          >
            ← Back to Jobs
          </SeedLink>
        </div>
      </div>

      {appliedList.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <div className="text-gray-600 mb-2">
            You have not applied to any jobs yet.
          </div>
          <SeedLink href="/jobs" className="text-blue-600 hover:underline text-sm">
            Browse jobs to get started.
          </SeedLink>
        </div>
      ) : (
        <div className="space-y-4">
          {appliedList.map(({ job, appliedAt, status }) => (
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
                <div className="text-right">
                  <div className="text-xs text-gray-500 mb-1">
                    Applied {new Date(appliedAt).toLocaleDateString()}
                  </div>
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                    {APPLICATION_STATUS_LABELS[status ?? "applied"]}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <SeedLink
                  href={`/jobs/${job.id}`}
                  className="text-blue-600 hover:underline text-sm"
                >
                  View details
                </SeedLink>
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
