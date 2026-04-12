"use client";

import { useEffect, useState } from "react";
import { useDynamicSystem } from "@/dynamic/shared";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const initialForm: ContactForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export default function ContactPage() {
  const dyn = useDynamicSystem();
  const [form, setForm] = useState<ContactForm>(initialForm);
  const [errors, setErrors] = useState<Partial<ContactForm>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    logEvent(EVENT_TYPES.CONTACT_PAGE_VIEWED, {});
  }, []);

  const validate = (): Partial<ContactForm> => {
    const errs: Partial<ContactForm> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Please enter a valid email address";
    }
    if (!form.subject.trim()) errs.subject = "Subject is required";
    if (!form.message.trim()) {
      errs.message = "Message is required";
    } else if (form.message.trim().length < 10) {
      errs.message = "Message must be at least 10 characters";
    }
    return errs;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ContactForm]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    logEvent(EVENT_TYPES.CONTACT_FORM_SUBMITTED, {
      name: form.name,
      email: form.email,
      subject: form.subject,
      messageLength: form.message.length,
    });

    // Simulate submission
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setForm(initialForm);
    }, 600);
  };

  if (submitted) {
    return dyn.v1.addWrapDecoy(
      "contact-page",
      <main className="px-10 mt-12 pb-16">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-100 flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Message Sent!
            </h2>
            <p className="text-gray-500 text-center max-w-md">
              Thank you for reaching out. Our support team will get back to you
              shortly.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className={`mt-6 px-6 py-3 bg-gradient-to-r from-[#17A2B8] to-[#08b4ce] hover:from-[#138a9c] hover:to-[#07a0b8] text-white font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md ${dyn.v3.getVariant("contact-send-another-class", CLASS_VARIANTS_MAP, "")}`}
            >
              {dyn.v3.getVariant(
                "contact-send-another-text",
                TEXT_VARIANTS_MAP,
                "Send another message"
              )}
            </button>
          </div>
        </div>
      </main>,
      "contact-page-wrap-success"
    );
  }

  return dyn.v1.addWrapDecoy(
    "contact-page",
    <main className="px-10 mt-12 pb-16">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {dyn.v3.getVariant(
              "contact-title-text",
              TEXT_VARIANTS_MAP,
              "Contact Us"
            )}
          </h1>
          <p className="text-gray-600">
            {dyn.v3.getVariant(
              "contact-subtitle-text",
              TEXT_VARIANTS_MAP,
              "Have a question or need help? Send us a message and we'll get back to you as soon as possible."
            )}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
          noValidate
        >
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {dyn.v3.getVariant(
                  "contact-name-label",
                  TEXT_VARIANTS_MAP,
                  "Name"
                )}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#08b4ce] focus:border-[#08b4ce] outline-none transition-colors ${errors.name ? "border-red-400" : "border-gray-300"} ${dyn.v3.getVariant("contact-name-input-class", CLASS_VARIANTS_MAP, "")}`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {dyn.v3.getVariant(
                  "contact-email-label",
                  TEXT_VARIANTS_MAP,
                  "Email"
                )}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#08b4ce] focus:border-[#08b4ce] outline-none transition-colors ${errors.email ? "border-red-400" : "border-gray-300"} ${dyn.v3.getVariant("contact-email-input-class", CLASS_VARIANTS_MAP, "")}`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Subject */}
            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {dyn.v3.getVariant(
                  "contact-subject-label",
                  TEXT_VARIANTS_MAP,
                  "Subject"
                )}
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                value={form.subject}
                onChange={handleChange}
                placeholder="What is this about?"
                className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#08b4ce] focus:border-[#08b4ce] outline-none transition-colors ${errors.subject ? "border-red-400" : "border-gray-300"} ${dyn.v3.getVariant("contact-subject-input-class", CLASS_VARIANTS_MAP, "")}`}
              />
              {errors.subject && (
                <p className="mt-1 text-xs text-red-500">{errors.subject}</p>
              )}
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {dyn.v3.getVariant(
                  "contact-message-label",
                  TEXT_VARIANTS_MAP,
                  "Message"
                )}
              </label>
              <textarea
                id="message"
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Describe your question or issue..."
                rows={5}
                className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#08b4ce] focus:border-[#08b4ce] outline-none transition-colors resize-vertical ${errors.message ? "border-red-400" : "border-gray-300"} ${dyn.v3.getVariant("contact-message-input-class", CLASS_VARIANTS_MAP, "")}`}
              />
              {errors.message && (
                <p className="mt-1 text-xs text-red-500">{errors.message}</p>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="mt-8">
            {dyn.v1.addWrapDecoy(
              "contact-submit-button",
              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-3 px-6 bg-gradient-to-r from-[#17A2B8] to-[#08b4ce] hover:from-[#138a9c] hover:to-[#07a0b8] text-white font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed ${dyn.v3.getVariant("contact-submit-class", CLASS_VARIANTS_MAP, "")}`}
              >
                {submitting
                  ? "Sending..."
                  : dyn.v3.getVariant(
                      "contact-submit-text",
                      TEXT_VARIANTS_MAP,
                      "Send Message"
                    )}
              </button>,
              "contact-submit-button-wrap"
            )}
          </div>
        </form>
      </div>
    </main>,
    "contact-page-wrap"
  );
}
