"use client";
import { useEffect, useMemo, useState } from "react";
import { EVENT_TYPES, logEvent } from "@/library/events";
import Image from "next/image";
import { SeedLink } from "@/components/ui/SeedLink";
import { dynamicDataProvider } from "@/dynamic/v2-data";
import { DataReadyGate } from "@/components/DataReadyGate";
import {
  loadAppliedJobs,
  persistAppliedJobs,
  type StoredAppliedJob,
} from "@/library/localState";

function JobDetailContent({ jobId }: { jobId: string }) {
  const job = dynamicDataProvider.getJobById(jobId);
  const [appliedJobs, setAppliedJobs] = useState<
    Record<string, StoredAppliedJob>
  >({});
  const isApplied = useMemo(() => Boolean(appliedJobs[jobId]), [appliedJobs, jobId]);

  useEffect(() => {
    setAppliedJobs(loadAppliedJobs());
  }, []);

  useEffect(() => {
    persistAppliedJobs(appliedJobs);
  }, [appliedJobs]);

  useEffect(() => {
    if (job) {
      const payload = {
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        location: job.location,
        timestamp: new Date().toISOString(),
      };

      console.log("📣 VIEW_JOB event:", payload);
      logEvent(EVENT_TYPES.VIEW_JOB, payload);
    }
  }, [job]);

  if (!job) {
    return (
      <div className="text-center text-red-600 mt-8">
        <h1 className="text-2xl font-bold mb-4">Job Not Found</h1>
        <p className="mb-4">The job you're looking for doesn't exist.</p>
        <SeedLink
          href="/jobs"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          ← Back to Jobs
        </SeedLink>
      </div>
    );
  }

  const handleApply = () => {
    if (!job || isApplied) return;

    logEvent(EVENT_TYPES.APPLY_FOR_JOB, {
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      location: job.location,
    });

    setAppliedJobs((prev) => ({
      ...prev,
      [job.id]: { job, appliedAt: new Date().toISOString() },
    }));
  };

  const handleCancel = () => {
    if (!job || !isApplied) return;
    setAppliedJobs((prev) => {
      const next = { ...prev };
      delete next[job.id];
      return next;
    });
    logEvent(EVENT_TYPES.CANCEL_APPLICATION, {
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      location: job.location,
      source: "job_detail",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <section className="max-w-4xl mx-auto">
      {/* Back Button */}
      <SeedLink
        href="/jobs"
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        onClick={() =>
          logEvent(EVENT_TYPES.BACK_TO_ALL_JOBS, {
            jobId: job.id,
            title: job.title,
            company: job.company,
            location: job.location,
          })
        }
      >
        ← Back to Jobs
      </SeedLink>

      {/* Job Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            <Image
              src={job.logo}
              alt={`${job.company} logo`}
              width={80}
              height={80}
              className="rounded-lg bg-gray-100 object-contain"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {job.title}
            </h1>
            <div className="text-lg font-medium text-blue-800 mb-2">
              {job.company}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
              <span className="flex items-center">
                📍 {job.location}
                {job.remote && " (Remote)"}
              </span>
              {job.type && (
                <span className="flex items-center">💼 {job.type}</span>
              )}
              {job.experience && (
                <span className="flex items-center">⏰ {job.experience}</span>
              )}
              {job.salary && (
                <span className="flex items-center">💰 {job.salary}</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {job.industry && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {job.industry}
                </span>
              )}
              {job.companySize && (
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {job.companySize}
                </span>
              )}
              {job.remote && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  Remote
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Posted {job.postedDate && formatDate(job.postedDate)}
                {job.applicationCount && (
                  <span className="ml-4">
                    • {job.applicationCount} applicants
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  className={`px-6 py-2 rounded-full font-semibold transition ${
                    isApplied
                      ? "bg-green-600 text-white cursor-default"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                  onClick={handleApply}
                  disabled={isApplied}
                >
                  {isApplied ? "Applied" : "Apply Now"}
                </button>
                {isApplied && (
                  <button
                    onClick={handleCancel}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Cancel application
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Job Description */}
      {job.description && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Job Description
          </h2>
          <p className="text-gray-700 leading-relaxed">{job.description}</p>
        </div>
      )}

      {/* Requirements */}
      {job.requirements && job.requirements.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Requirements</h2>
          <ul className="space-y-2">
            {job.requirements.map((requirement, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-600 mr-2 mt-1">•</span>
                <span className="text-gray-700">{requirement}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Benefits */}
      {job.benefits && job.benefits.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Benefits</h2>
          <ul className="space-y-2">
            {job.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-600 mr-2 mt-1">✓</span>
                <span className="text-gray-700">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Company Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">About {job.company}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {job.industry && (
            <div>
              <span className="font-medium text-gray-700">Industry:</span>
              <span className="ml-2 text-gray-600">{job.industry}</span>
            </div>
          )}
          {job.companySize && (
            <div>
              <span className="font-medium text-gray-700">Company Size:</span>
              <span className="ml-2 text-gray-600">{job.companySize}</span>
            </div>
          )}
          {job.location && (
            <div>
              <span className="font-medium text-gray-700">Location:</span>
              <span className="ml-2 text-gray-600">{job.location}</span>
            </div>
          )}
          {job.remote !== undefined && (
            <div>
              <span className="font-medium text-gray-700">Remote Work:</span>
              <span className="ml-2 text-gray-600">
                {job.remote ? "Yes" : "No"}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function JobDetailClient({ jobId }: { jobId: string }) {
  return (
    <DataReadyGate>
      <JobDetailContent jobId={jobId} />
    </DataReadyGate>
  );
} 
