"use client";
import { useState, useMemo, useEffect } from "react";
import JobCard from "@/components/JobCard";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { useSeed } from "@/context/SeedContext";
import { dynamicDataProvider } from "@/dynamic/v2-data";
import { DataReadyGate } from "@/components/DataReadyGate";
import type { Job } from "@/library/dataset";
import {
  loadAppliedJobs,
  persistAppliedJobs,
  type StoredAppliedJob,
} from "@/library/localState";
import Link from "next/link";
import { useDynamicSystem } from "@/dynamic/shared";
import { CLASS_VARIANTS_MAP, ID_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";

interface Filters {
  search: string;
  experience: string;
  salary: string;
  location: string;
  remote: boolean;
}

function JobsContent() {
  const { seed, resolvedSeeds } = useSeed();
  resolvedSeeds;
  const layoutSeed = seed;
  const dyn = useDynamicSystem();
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

  const filterJobsBy = (currentFilters: Filters) => {
    return mockJobs.filter((job) => {
      if (
        currentFilters.search &&
        !job.title.toLowerCase().includes(currentFilters.search.toLowerCase()) &&
        !job.company.toLowerCase().includes(currentFilters.search.toLowerCase())
      ) {
        return false;
      }

      if (currentFilters.experience && job.experience !== currentFilters.experience) {
        return false;
      }

      if (currentFilters.location && job.location !== currentFilters.location) {
        return false;
      }

      if (currentFilters.remote && !job.remote) {
        return false;
      }

      if (currentFilters.salary && job.salary) {
        const salaryRange = currentFilters.salary;
        const jobSalary = job.salary.replace(/[$,]/g, "");
        const salaryMatch = jobSalary.match(/(\d+)/g);

        if (salaryMatch && salaryMatch.length >= 2) {
          const minSalary = parseInt(salaryMatch[0]);
          const maxSalary = parseInt(salaryMatch[1]);

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
          return false;
        }
      }

      return true;
    });
  };

  // Filter jobs based on all criteria
  const filteredJobs = useMemo(
    () => filterJobsBy(filters),
    [filters, mockJobs]
  );
  const orderedJobs = useMemo(() => {
    const order = dyn.v1.changeOrderElements("jobs-list", filteredJobs.length);
    return order.map((idx) => filteredJobs[idx]);
  }, [filteredJobs, dyn.seed]);

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
    const nextFilters = { ...filters, search: val };
    setFilters(nextFilters);

    const trimmed = val.trim();
    if (trimmed.length > 0) {
      const nextResults = filterJobsBy(nextFilters);
      logEvent(EVENT_TYPES.SEARCH_JOBS, {
        query: trimmed,
        filters: nextFilters,
        resultCount: nextResults.length,
      });
    }
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

  const filtersWithoutSearch = {
    experience: filters.experience,
    salary: filters.salary,
    location: filters.location,
    remote: filters.remote,
  };

  const hasActiveFilters = Object.values(filtersWithoutSearch).some(
    (value) => value !== "" && value !== false
  );

  useEffect(() => {
    if (!hasActiveFilters) return;
    logEvent(EVENT_TYPES.FILTER_JOBS, {
      filters: filtersWithoutSearch,
      resultCount: filteredJobs.length,
    });
  }, [
    filtersWithoutSearch.experience,
    filtersWithoutSearch.salary,
    filtersWithoutSearch.location,
    filtersWithoutSearch.remote,
    filteredJobs.length,
    hasActiveFilters,
  ]);

  const handleApplyJob = (job: Job) => {
    setAppliedJobs((prev) => {
      if (prev[job.id]) return prev;
      return {
        ...prev,
        [job.id]: { job, appliedAt: new Date().toISOString() },
      };
    });
  };

  const shuffledJobs = orderedJobs;
  const jobCardsClasses = "grid grid-cols-1 md:grid-cols-2 gap-4";
  const filtersClasses = "";

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-bold text-2xl">
          {dyn.v3.getVariant("jobs_title", TEXT_VARIANTS_MAP, "Job Search")}
        </h1>
        <Link
          href="/jobs/applied"
          className={`text-sm text-blue-700 hover:underline font-semibold ${dyn.v3.getVariant("view_applied_jobs_link", CLASS_VARIANTS_MAP, "")}`}
        >
          View applied jobs ({Object.keys(appliedJobs).length})
        </Link>
      </div>

      {/* Search Bar */}
      {dyn.v1.addWrapDecoy("job-search-input-container", (
      <div className="mb-6">
        <input
          id={dyn.v3.getVariant("jobs_search_input", ID_VARIANTS_MAP, "jobs_search_input")}
          className={`w-full rounded-full border border-gray-300 px-4 py-2 outline-blue-500 ${dyn.v3.getVariant("jobs_search_input_class", CLASS_VARIANTS_MAP, "")}`}
          value={filters.search}
          onChange={handleSearchInput}
          placeholder={dyn.v3.getVariant("jobs_search_placeholder",TEXT_VARIANTS_MAP,"Search jobs by title or company..."
          )}
        />
      </div>
      ), "job-search-input-wrap")}

      {/* Filters Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-base text-gray-900">
            {dyn.v3.getVariant("jobs_filters_title", TEXT_VARIANTS_MAP, "Filters")}
          </h2>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {dyn.v3.getVariant("jobs_clear_filters", TEXT_VARIANTS_MAP, "Clear all filters")}
            </button>
          )}
        </div>
      </div>

      {/* Filters Card */}
      {dyn.v1.addWrapDecoy("job-filters-card", (
      <div
        className={`bg-white rounded-lg shadow border border-gray-200 p-6 mb-6 ${filtersClasses}`}
        id={dyn.v3.getVariant("jobs_filters_card", ID_VARIANTS_MAP, "jobs_filters_card")}
      >
        <div className="flex flex-wrap items-end gap-4">
          {/* Experience Filter */}
          <div className="flex-1 min-w-[160px]">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {dyn.v3.getVariant("jobs_experience_label", TEXT_VARIANTS_MAP, "Experience Level")}
            </label>
            <select
              value={filters.experience}
              onChange={(e) => handleFilterChange("experience", e.target.value)}
              className={`w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${dyn.v3.getVariant("jobs_experience_selector", CLASS_VARIANTS_MAP, "")}`}
            >
              <option value="">
                {dyn.v3.getVariant("jobs_experience_any", TEXT_VARIANTS_MAP, "Any Experience")}
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
              {dyn.v3.getVariant("jobs_salary_label", TEXT_VARIANTS_MAP, "Salary Range")}
            </label>
            <select
              value={filters.salary}
              onChange={(e) => handleFilterChange("salary", e.target.value)}
              className={`w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${dyn.v3.getVariant("jobs_salary_selector", CLASS_VARIANTS_MAP, "")}`}
            >
              {salaryRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.value === ""
                    ? dyn.v3.getVariant("jobs_salary_any", TEXT_VARIANTS_MAP, "Any Salary")
                    : range.label}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div className="flex-1 min-w-[160px]">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {dyn.v3.getVariant("jobs_location_label", TEXT_VARIANTS_MAP, "Location")}
            </label>
            <select
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              className={`w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${dyn.v3.getVariant("jobs_location_selector", CLASS_VARIANTS_MAP, "")}`}
            >
              <option value="">
                {dyn.v3.getVariant("jobs_location_any", TEXT_VARIANTS_MAP, "Any Location")}
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
                {dyn.v3.getVariant("jobs_remote_only", TEXT_VARIANTS_MAP, "Remote Only")}
              </span>
            </label>
          </div>

          {/* Search Button */}
          <button
            id={dyn.v3.getVariant("jobs_search_button", ID_VARIANTS_MAP, "search-job-btn")}
            onClick={triggerSearchEvent}
            className={`bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors text-sm font-medium mb-1.5 ${dyn.v3.getVariant("jobs_search_button_class", CLASS_VARIANTS_MAP, "")}`}
          >
            {dyn.v3.getVariant("jobs_search_button", TEXT_VARIANTS_MAP, "Search")}
          </button>
        </div>
      </div>
      ), "job-filters-card-wrap")}
      {/* Results Count */}
      <div className="mb-4">
        <p className="text-gray-600">
          Showing {filteredJobs.length} of {mockJobs.length} jobs
        </p>
      </div>

      {/* Job Listings */}
      <div
        className={jobCardsClasses}
        id={dyn.v3.getVariant("jobs_list_container", ID_VARIANTS_MAP, "jobs_list_container")}
      >
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
