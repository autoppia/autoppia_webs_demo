"use client";

import { useEffect, useMemo, useState } from "react";
import { DataReadyGate } from "@/components/DataReadyGate";
import { SeedLink } from "@/components/ui/SeedLink";
import { useDynamicSystem } from "@/dynamic/shared";
import { CLASS_VARIANTS_MAP, ID_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { EVENT_TYPES, logEvent } from "@/library/events";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_ORDER,
  loadNormalizedAppliedJobs,
  persistAppliedJobs,
  type ApplicationStatus,
  type StoredAppliedJob,
} from "@/library/localState";

const STATUS_STEPPER_MOBILE_LABEL: Record<ApplicationStatus, string> = {
  applied: "Applied",
  under_review: "Review",
  shortlisted: "Shortlist",
  interview: "Interview",
  offered: "Offered",
  rejected: "Rejected",
};

const STATUS_PILL_CLASS: Record<ApplicationStatus, string> = {
  applied: "bg-[#e8f7e5] text-[#0f5132]",
  under_review: "bg-[#dff2dc] text-[#14532d]",
  shortlisted: "bg-[#e4f7f4] text-[#134e4a]",
  interview: "bg-amber-100 text-amber-800",
  offered: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800",
};

function getCompanyInitials(company: string): string {
  const words = company.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "AC";
  const initials = words.slice(0, 2).map((word) => word[0]?.toUpperCase() ?? "");
  return initials.join("") || "AC";
}

function PipelineContent() {
  const dyn = useDynamicSystem();
  const [applications, setApplications] = useState<Record<string, StoredAppliedJob>>({});
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<ApplicationStatus>("applied");
  const [isApplicationsHydrated, setIsApplicationsHydrated] = useState(false);

  useEffect(() => {
    const loaded = loadNormalizedAppliedJobs();
    setApplications(loaded);
    setIsApplicationsHydrated(true);
    logEvent(EVENT_TYPES.VIEW_APPLICATION_PIPELINE, {
      source: "applications_pipeline_page",
      seed: dyn.seed,
      count: Object.keys(loaded).length,
    });
  }, [dyn.seed]);

  useEffect(() => {
    if (!isApplicationsHydrated) return;
    persistAppliedJobs(applications);
  }, [applications, isApplicationsHydrated]);

  const searchFilteredEntries = useMemo(() => {
    const query = search.trim().toLowerCase();

    return Object.entries(applications).filter(([, data]) => {
      if (!query) return true;

      const haystack = [
        data.job.title,
        data.job.company,
        data.job.location,
        data.job.industry,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [applications, search]);

  const visibleEntries = useMemo(() => {
    const stageScopedEntries = searchFilteredEntries.filter(
      ([, data]) => (data.status ?? "applied") === stageFilter
    );

    return [...stageScopedEntries].sort((a, b) => {
      const aDate = a[1].statusUpdatedAt ?? a[1].appliedAt;
      const bDate = b[1].statusUpdatedAt ?? b[1].appliedAt;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });
  }, [searchFilteredEntries, stageFilter]);
  const orderedVisibleEntries = useMemo(() => {
    const order = dyn.v1.changeOrderElements("applications-pipeline-list", visibleEntries.length);
    return order
      .map((idx) => visibleEntries[idx])
      .filter(
        (entry): entry is [string, StoredAppliedJob] => Boolean(entry)
      );
  }, [visibleEntries, dyn.v1.changeOrderElements]);

  const totalApplications = Object.keys(applications).length;
  const totalVisible = orderedVisibleEntries.length;
  const stageCounts = useMemo<Record<ApplicationStatus, number>>(() => {
    const counts: Record<ApplicationStatus, number> = {
      applied: 0,
      under_review: 0,
      shortlisted: 0,
      interview: 0,
      offered: 0,
      rejected: 0,
    };

    for (const value of Object.values(applications)) {
      const status = value.status ?? "applied";
      counts[status] += 1;
    }

    return counts;
  }, [applications]);

  const updateStatus = (jobId: string, nextStatus: ApplicationStatus) => {
    setApplications((prev) => {
      const current = prev[jobId];
      if (!current) return prev;

      const currentStatus = current.status ?? "applied";
      if (currentStatus === nextStatus) return prev;

      logEvent(EVENT_TYPES.UPDATE_APPLICATION_STATUS, {
        source: "pipeline",
        jobId,
        jobTitle: current.job.title,
        company: current.job.company,
        previousStatus: currentStatus,
        nextStatus,
      });

      return {
        ...prev,
        [jobId]: {
          ...current,
          status: nextStatus,
          statusUpdatedAt: new Date().toISOString(),
        },
      };
    });
  };

  const removeApplication = (jobId: string) => {
    setApplications((prev) => {
      const current = prev[jobId];
      if (!current) return prev;

      const next = { ...prev };
      delete next[jobId];

      logEvent(EVENT_TYPES.CANCEL_APPLICATION, {
        source: "pipeline",
        jobId,
        jobTitle: current.job.title,
        company: current.job.company,
        location: current.job.location,
      });

      return next;
    });
  };

  return (
    <section
      id={dyn.v3.getVariant("applications_pipeline_section", ID_VARIANTS_MAP, "applications_pipeline_section")}
      className={`max-w-[1340px] mx-auto px-4 md:px-6 py-8 ${dyn.v3.getVariant("applications_pipeline_section_class", CLASS_VARIANTS_MAP, "")}`}
    >
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-gray-900">
            {dyn.v3.getVariant("applications_pipeline_title", TEXT_VARIANTS_MAP, "My Job Applications")}
          </h1>
          <p className="mt-2 text-base text-gray-600">
            {dyn.v3.getVariant(
              "applications_pipeline_subtitle",
              TEXT_VARIANTS_MAP,
              "Track your application progress across each stage."
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full border border-[#9ecf97] bg-[#eaf6e8] px-4 py-1.5 font-semibold text-[#14532d]">
            Total: {totalApplications}
          </span>
          <SeedLink
            href="/jobs"
            className="rounded-full border border-gray-300 bg-white px-4 py-1.5 font-semibold text-gray-800 hover:border-[#108a00] hover:text-[#108a00]"
          >
            Explore jobs
          </SeedLink>
        </div>
      </div>

      {dyn.v1.addWrapDecoy("applications-pipeline-stepper", (
      <div className="mb-6">
        <ol
          id={dyn.v3.getVariant("applications_pipeline_stepper", ID_VARIANTS_MAP, "applications_pipeline_stepper")}
          className="w-full flex items-stretch rounded-xl border border-[#d4ded1] bg-white overflow-hidden"
        >
          {APPLICATION_STATUS_ORDER.map((status, index) => {
            const isActive = stageFilter === status;
            const isFirst = index === 0;
            const isLast = index === APPLICATION_STATUS_ORDER.length - 1;
            return (
              <li
                key={status}
                className={`relative flex-1 min-w-0 ${
                  index > 0 ? "border-l border-[#d4ded1]" : ""
                }`}
              >
                <button
                  type="button"
                  className={`h-full w-full px-2.5 sm:px-3 md:px-4 lg:px-5 py-4 text-left transition-colors ${
                    isActive
                      ? "bg-[#14a800] text-white"
                      : "bg-white text-gray-900 hover:bg-[#f5f9f3]"
                  } ${isFirst ? "rounded-l-xl" : ""} ${isLast ? "rounded-r-xl" : ""} ${
                    dyn.v3.getVariant(
                      isActive
                        ? "applications_pipeline_step_active_class"
                        : "applications_pipeline_step_idle_class",
                      CLASS_VARIANTS_MAP,
                      ""
                    )
                  }`}
                  onClick={() => setStageFilter(status)}
                >
                  <p className="text-[11px] md:text-xs font-semibold uppercase tracking-wide leading-tight">
                    <span className="md:hidden">
                      {STATUS_STEPPER_MOBILE_LABEL[status]}
                      {stageCounts[status] > 0 ? ` (${stageCounts[status]})` : ""}
                    </span>
                    <span className="hidden md:inline">
                      {APPLICATION_STATUS_LABELS[status]}
                      {stageCounts[status] > 0 ? ` (${stageCounts[status]})` : ""}
                    </span>
                  </p>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
      ), "applications-pipeline-stepper-wrap")}

      {dyn.v1.addWrapDecoy("applications-pipeline-filters", (
      <div
        id={dyn.v3.getVariant("applications_pipeline_filters_card", ID_VARIANTS_MAP, "applications_pipeline_filters_card")}
        className={`mb-6 rounded-2xl border border-[#d4ded1] bg-white shadow-sm ${dyn.v3.getVariant("applications_pipeline_filters_card_class", CLASS_VARIANTS_MAP, "")}`}
      >
        <div className="border-b border-[#dbe5d8] px-4 md:px-6 py-3">
          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
              <span className="text-gray-600">
              {dyn.v3
                .getVariant(
                  "applications_pipeline_showing_records",
                  TEXT_VARIANTS_MAP,
                  "Showing {count} records"
                )
                .replace("{count}", String(totalVisible))}
            </span>
          </div>
        </div>

        <div className="px-4 md:px-6 py-4">
          <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
            <div className="flex items-center rounded-xl border border-[#cad8c6] bg-white">
              <input
                id={dyn.v3.getVariant("applications_pipeline_search_input", ID_VARIANTS_MAP, "applications_pipeline_search_input")}
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={dyn.v3.getVariant(
                  "applications_pipeline_search_placeholder",
                  TEXT_VARIANTS_MAP,
                  "Search by title, company, or location"
                )}
                className="w-full rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStageFilter("applied");
              }}
              className="rounded-full border border-[#108a00] px-4 py-2 text-sm font-semibold text-[#108a00] hover:bg-[#eaf6e8]"
            >
              {dyn.v3.getVariant("applications_pipeline_reset_filters", TEXT_VARIANTS_MAP, "Reset filters")}
            </button>
          </div>
        </div>
      </div>
      ), "applications-pipeline-filters-wrap")}

      {totalVisible === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#c7d6c2] bg-white px-8 py-14 text-center">
          <h2 className="text-xl font-semibold text-gray-900">No applications found</h2>
          <p className="mt-2 text-sm text-gray-600">
            Adjust filters or apply to jobs to start your tracker.
          </p>
          <SeedLink
            href="/jobs"
            className="mt-5 inline-flex rounded-full bg-[#14a800] px-5 py-2 text-sm font-semibold text-white hover:bg-[#108a00]"
          >
            Browse jobs
          </SeedLink>
        </div>
      ) : (
        dyn.v1.addWrapDecoy("applications-pipeline-results", (
        <div
          id={dyn.v3.getVariant("applications_pipeline_results_card", ID_VARIANTS_MAP, "applications_pipeline_results_card")}
          className={`rounded-2xl border border-[#d4ded1] bg-white shadow-sm overflow-hidden ${dyn.v3.getVariant("applications_pipeline_results_card_class", CLASS_VARIANTS_MAP, "")}`}
        >
          <ul
            id={dyn.v3.getVariant("applications_pipeline_results_list", ID_VARIANTS_MAP, "applications_pipeline_results_list")}
            className="divide-y divide-[#e6ece3]"
          >
            {orderedVisibleEntries.map(([jobId, data]) => {
              const currentStatus = data.status ?? "applied";
              const description =
                data.job.description && data.job.description.length > 0
                  ? data.job.description.slice(0, 220) +
                    (data.job.description.length > 220 ? "..." : "")
                  : "No application summary available yet.";

              return (
                <li key={jobId} id={`pipeline-card-${jobId}`} className="px-4 py-6 md:px-6">
                  <article className="grid gap-4 md:grid-cols-[minmax(0,1fr)_320px] md:items-start">
                    <div className="min-w-0">
                      <div className="mb-3 flex items-start gap-3">
                        <div className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#eaf6e8] text-sm font-bold text-[#14532d]">
                          {getCompanyInitials(data.job.company)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-2xl font-semibold leading-tight text-gray-900">
                              {data.job.title}
                            </h3>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                                STATUS_PILL_CLASS[currentStatus]
                              }`}
                            >
                              {APPLICATION_STATUS_LABELS[currentStatus]}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-700">{data.job.company}</p>
                          <p className="text-sm text-gray-500">{data.job.location}</p>
                        </div>
                      </div>

                      <div className="mb-3 text-sm leading-relaxed text-gray-700">{description}</div>

                      <div className="mb-3 flex flex-wrap gap-2 text-xs">
                        {data.job.industry && (
                          <span className="rounded-full bg-[#f1f5ef] px-2.5 py-1 text-gray-700">
                            {data.job.industry}
                          </span>
                        )}
                        {data.job.experience && (
                          <span className="rounded-full bg-[#f1f5ef] px-2.5 py-1 text-gray-700">
                            {data.job.experience}
                          </span>
                        )}
                        {data.job.type && (
                          <span className="rounded-full bg-[#f1f5ef] px-2.5 py-1 text-gray-700">
                            {data.job.type}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-gray-500 space-y-1">
                        <p>Applied {new Date(data.appliedAt).toLocaleDateString()}</p>
                        <p>
                          Updated{" "}
                          {new Date(data.statusUpdatedAt ?? data.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#d8e2d5] bg-[#fafdf9] p-3">
                      <label
                        htmlFor={`pipeline-status-${jobId}`}
                        className="mb-1 block text-xs font-semibold text-gray-600"
                      >
                        Stage
                      </label>
                      <select
                        id={`pipeline-status-${jobId}`}
                        className="mb-3 w-full rounded-lg border border-[#cdd9ca] bg-white px-2.5 py-2 text-sm text-gray-900 focus:border-[#108a00] focus:outline-none focus:ring-2 focus:ring-[#dff2dc]"
                        value={currentStatus}
                        onChange={(event) =>
                          updateStatus(jobId, event.target.value as ApplicationStatus)
                        }
                      >
                        {APPLICATION_STATUS_ORDER.map((option) => (
                          <option key={option} value={option}>
                            {APPLICATION_STATUS_LABELS[option]}
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center gap-4 text-sm">
                        <SeedLink
                          href={`/jobs/${jobId}`}
                          className="text-sm font-semibold text-[#108a00] hover:underline"
                        >
                          View job
                        </SeedLink>

                        <button
                          type="button"
                          onClick={() => removeApplication(jobId)}
                          className="text-sm font-semibold text-rose-600 hover:underline"
                        >
                          Withdraw
                        </button>
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        </div>
        ), "applications-pipeline-results-wrap")
      )}
    </section>
  );
}

export default function ApplicationPipelinePage() {
  return (
    <DataReadyGate>
      <PipelineContent />
    </DataReadyGate>
  );
}
