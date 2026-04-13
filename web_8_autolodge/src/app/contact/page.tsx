"use client";

import { useEffect, useState } from "react";
import { Suspense } from "react";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { useDynamicSystem } from "@/dynamic/shared";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

function validateForm(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.name.trim()) errors.name = "Name is required";
  if (!data.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Please enter a valid email address";
  }
  if (!data.subject.trim()) errors.subject = "Subject is required";
  if (!data.message.trim()) {
    errors.message = "Message is required";
  } else if (data.message.trim().length < 10) {
    errors.message = "Message must be at least 10 characters";
  }
  return errors;
}

function ContactContent() {
  const dyn = useDynamicSystem();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    logEvent(EVENT_TYPES.CONTACT_FORM_SUBMITTED, { action: "page_viewed" });
  }, []);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    logEvent(EVENT_TYPES.CONTACT_FORM_SUBMITTED, {
      subject: formData.subject,
    });
    setSubmitted(true);
  };

  if (submitted) {
    return dyn.v1.addWrapDecoy(
      "contact-page",
      <div className="mt-6 max-w-3xl">
        <div className="border rounded-xl bg-white shadow-sm p-8 text-center">
          <div className="text-4xl mb-4">✓</div>
          <h2 className="text-2xl font-semibold mb-2">Message Sent</h2>
          <p className="text-neutral-600 mb-6">
            Thank you for reaching out. We will get back to you within 24 hours.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setFormData({ name: "", email: "", subject: "", message: "" });
            }}
            className="px-6 py-2 bg-neutral-900 text-white rounded-full font-medium hover:bg-neutral-800 transition"
          >
            Send another message
          </button>
        </div>
      </div>,
      "contact-page-wrap"
    );
  }

  return dyn.v1.addWrapDecoy(
    "contact-page",
    <div className="mt-6 max-w-3xl">
      <h1 className="text-2xl font-semibold mb-2">Contact Us</h1>
      <p className="text-neutral-600 mb-6">
        Have a question or need assistance? Fill out the form below and our team
        will get back to you shortly.
      </p>

      <form
        onSubmit={handleSubmit}
        className="border rounded-xl bg-white shadow-sm p-6 flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="contact-name" className="text-sm font-medium text-neutral-700">
            Name
          </label>
          <input
            id="contact-name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Your full name"
            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-neutral-400 ${
              errors.name ? "border-red-400" : "border-neutral-300"
            }`}
          />
          {errors.name && (
            <span className="text-xs text-red-500">{errors.name}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="contact-email" className="text-sm font-medium text-neutral-700">
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="you@example.com"
            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-neutral-400 ${
              errors.email ? "border-red-400" : "border-neutral-300"
            }`}
          />
          {errors.email && (
            <span className="text-xs text-red-500">{errors.email}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="contact-subject" className="text-sm font-medium text-neutral-700">
            Subject
          </label>
          <input
            id="contact-subject"
            type="text"
            value={formData.subject}
            onChange={(e) => handleChange("subject", e.target.value)}
            placeholder="What is this about?"
            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-neutral-400 ${
              errors.subject ? "border-red-400" : "border-neutral-300"
            }`}
          />
          {errors.subject && (
            <span className="text-xs text-red-500">{errors.subject}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="contact-message" className="text-sm font-medium text-neutral-700">
            Message
          </label>
          <textarea
            id="contact-message"
            rows={5}
            value={formData.message}
            onChange={(e) => handleChange("message", e.target.value)}
            placeholder="Tell us how we can help..."
            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition resize-none focus:ring-2 focus:ring-neutral-400 ${
              errors.message ? "border-red-400" : "border-neutral-300"
            }`}
          />
          {errors.message && (
            <span className="text-xs text-red-500">{errors.message}</span>
          )}
        </div>

        <button
          type="submit"
          className="mt-2 w-full py-2.5 bg-neutral-900 text-white rounded-full font-medium hover:bg-neutral-800 transition"
        >
          Send Message
        </button>
      </form>
    </div>,
    "contact-page-wrap"
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div>Loading contact form...</div>}>
      <ContactContent />
    </Suspense>
  );
}
