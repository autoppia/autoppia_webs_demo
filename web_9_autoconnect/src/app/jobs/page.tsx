"use client";
import { useState, useMemo, useEffect } from "react";
import JobCard from "@/components/JobCard";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { useSeed } from "@/context/SeedContext";
import {
  getEffectiveLayoutConfig,
  getLayoutClasses,
  getShuffledItems,
} from "@/dynamic/v1-layouts";
import { useV3Attributes } from "@/dynamic/v3-dynamic";
import { dynamicDataProvider } from "@/dynamic/v2-data";
import { DataReadyGate } from "@/components/DataReadyGate";
import type { Job } from "@/library/dataset";
import {
  loadAppliedJobs,
  persistAppliedJobs,
  type StoredAppliedJob,
} from "@/library/localState";
import Link from "next/link";

interface Filters {
  search: string;
  experience: string;
  salary: string;
  location: string;
  remote: boolean;
}

function JobsContent() {
  const { seed, resolvedSeeds } = useSeed();
  const layoutSeed = resolvedSeeds.v1 ?? resolvedSeeds.base ?? seed;
  const layout = getEffectiveLayoutConfig(layoutSeed);
  const { getText } = useV3Attributes();
  const [filters, setFilters] = useState<Filters>({
    search: "",
    experience: "",
    salary: "",
    location: "",
    remote: false,
  });
  const [appliedJobs, setAppliedJobs] = useState<
    Record<string, StoredAppliedJob>
  >({});

  useEffect(() => {
    setAppliedJobs(loadAppliedJobs());
  }, []);

  useEffect(() => {
    persistAppliedJobs(appliedJobs);
  }, [appliedJobs]);

  // Get jobs from dynamic provider
  const mockJobs = dynamicDataProvider.getJobs();

  // Get unique values for filter options
  const uniqueLocations = useMemo(() => {
    const locations = mockJobs
      .map((job) => job.location)
      .filter((location) => location);
    return Array.from(new Set(locations)).sort();
  }, []);

  const uniqueExperiences = useMemo(() => {
    const experiences = mockJobs
      .map((job) => job.experience)
      .filter((experience) => experience);
    return Array.from(new Set(experiences)).sort();
  }, []);

  const salaryRanges = [
    { value: "", label: "Any Salary" },
    { value: "0-50000", label: "Under $50,000" },
    { value: "50000-75000", label: "$50,000 - $75,000" },
    { value: "75000-100000", label: "$75,000 - $100,000" },
    { value: "100000-125000", label: "$100,000 - $125,000" },
    { value: "125000-150000", label: "$125,000 - $150,000" },
    { value: "150000+", label: "$150,000+" },
  ];

  // Filter jobs based on all criteria
  const filteredJobs = useMemo(() => {
    return mockJobs.filter((job) => {
      // Search filter
      if (
        filters.search &&
        !job.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !job.company.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      // Experience filter
      if (filters.experience && job.experience !== filters.experience) {
        return false;
      }

      // Location filter
      if (filters.location && job.location !== filters.location) {
        return false;
      }

      // Remote filter
      if (filters.remote && !job.remote) {
        return false;
      }

      // Salary filter
      if (filters.salary && job.salary) {
        const salaryRange = filters.salary;
        const jobSalary = job.salary.replace(/[$,]/g, "");
        const salaryMatch = jobSalary.match(/(\d+)/g);

        if (salaryMatch && salaryMatch.length >= 2) {
          const minSalary = parseInt(salaryMatch[0]);
          const maxSalary = parseInt(salaryMatch[1]);

          // Check if the job's salary range overlaps with the selected filter range
          switch (salaryRange) {
            case "0-50000":
              if (minSalary >= 50000) return false;
              break;
            case "50000-75000":
              if (maxSalary < 50000 || minSalary > 75000) return false;
              break;
            case "75000-100000":
              if (maxSalary < 75000 || minSalary > 100000) return false;
              break;
            case "100000-125000":
              if (maxSalary < 100000 || minSalary > 125000) return false;
              break;
            case "125000-150000":
              if (maxSalary < 125000 || minSalary > 150000) return false;
              break;
            case "150000+":
              if (maxSalary < 150000) return false;
              break;
          }
        } else {
          // If we can't parse the salary properly, exclude the job
          return false;
        }
      }

      return true;
    });
  }, [filters]);

  function triggerSearchEvent() {
    const query = filters.search.trim();
    logEvent(EVENT_TYPES.SEARCH_JOBS, {
      query,
      filters,
      resultCount: filteredJobs.length,
    });
  }
  function handleSearchInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setFilters((prev) => ({ ...prev, search: val }));

    // if (val.trim().length >= 2) {
    //   logEvent(EVENT_TYPES.SEARCH_JOBS, {
    //     query: val.trim(),
    //     filters: filters,
    //     resultCount: filteredJobs.length,
    //   });
    // }
  }

  function handleFilterChange(
    filterType: keyof Filters,
    value: string | boolean
  ) {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  }

  function clearFilters() {
    setFilters({
      search: "",
      experience: "",
      salary: "",
      location: "",
      remote: false,
    });
  }

  useEffect(() => {
    const hasFilters = Object.values(filters).some(
      (value) => value !== "" && value !== false
    );
    if (hasFilters) {
      logEvent(EVENT_TYPES.FILTER_JOBS, {
        filters,
        resultCount: filteredJobs.length,
      });
    }
  }, [filters, filteredJobs.length]);

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== "" && value !== false
  );

  const handleApplyJob = (job: Job) => {
    setAppliedJobs((prev) => {
      if (prev[job.id]) return prev;
      return {
        ...prev,
        [job.id]: { job, appliedAt: new Date().toISOString() },
      };
    });
  };

  const shuffledJobs = getShuffledItems(filteredJobs, layoutSeed);
  const jobCardsClasses = getLayoutClasses(layout, "jobCardsLayout");
  const filtersClasses = getLayoutClasses(layout, "filtersPosition");

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-bold text-2xl">
          {getText("jobs_title", "Job Search")}
        </h1>
        <Link
          href="/jobs/applied"
          className="text-sm text-blue-700 hover:underline font-semibold"
        >
          View applied jobs ({Object.keys(appliedJobs).length})
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          className="w-full rounded-full border border-gray-300 px-4 py-2 outline-blue-500"
          value={filters.search}
          onChange={handleSearchInput}
          placeholder={getText(
            "jobs_search_placeholder",
            "Search jobs by title or company..."
          )}
        />
      </div>

      {/* Filters Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-base text-gray-900">
            {getText("jobs_filters_title", "Filters")}
          </h2>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {getText("jobs_clear_filters", "Clear all filters")}
            </button>
          )}
        </div>
      </div>

      {/* Filters Card */}
      <div
        className={`bg-white rounded-lg shadow border border-gray-200 p-6 mb-6 ${filtersClasses}`}
      >
        <div className="flex flex-wrap items-end gap-4">
          {/* Experience Filter */}
          <div className="flex-1 min-w-[160px]">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {getText("jobs_experience_label", "Experience Level")}
            </label>
            <select
              value={filters.experience}
              onChange={(e) => handleFilterChange("experience", e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">
                {getText("jobs_experience_any", "Any Experience")}
              </option>
              {uniqueExperiences.map((experience) => (
                <option key={experience} value={experience}>
                  {experience}
                </option>
              ))}
            </select>
          </div>

          {/* Salary Filter */}
          <div className="flex-1 min-w-[160px]">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {getText("jobs_salary_label", "Salary Range")}
            </label>
            <select
              value={filters.salary}
              onChange={(e) => handleFilterChange("salary", e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {salaryRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.value === ""
                    ? getText("jobs_salary_any", "Any Salary")
                    : range.label}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div className="flex-1 min-w-[160px]">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {getText("jobs_location_label", "Location")}
            </label>
            <select
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">
                {getText("jobs_location_any", "Any Location")}
              </option>
              {uniqueLocations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          {/* Remote Filter */}
          <div className="flex items-center mb-1.5">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.remote}
                onChange={(e) => handleFilterChange("remote", e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="ml-2 text-sm font-medium text-gray-700 whitespace-nowrap">
                {getText("jobs_remote_only", "Remote Only")}
              </span>
            </label>
          </div>

          {/* Search Button */}
          <button
            id="search-job-btn"
            onClick={triggerSearchEvent}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors text-sm font-medium mb-1.5"
          >
            {getText("jobs_search_button", "Search")}
          </button>
        </div>
      </div>
      {/* Results Count */}
      <div className="mb-4">
        <p className="text-gray-600">
          Showing {filteredJobs.length} of {mockJobs.length} jobs
        </p>
      </div>

      {/* Job Listings */}
      <div className={jobCardsClasses}>
        {shuffledJobs.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 italic mb-2">No jobs found.</div>
            <p className="text-sm text-gray-400">
              Try adjusting your filters or search terms.
            </p>
          </div>
        ) : (
          shuffledJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isApplied={Boolean(appliedJobs[job.id])}
              onApply={handleApplyJob}
            />
          ))
        )}
      </div>
    </section>
  );
}

export default function JobsPage() {
  return (
    <DataReadyGate>
      <JobsContent />
    </DataReadyGate>
  );
}
