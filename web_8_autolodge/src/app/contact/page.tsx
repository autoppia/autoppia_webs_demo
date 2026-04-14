"use client";

import { Suspense, useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { useDynamicSystem } from "@/dynamic/shared";

type ContactField = "name" | "email" | "subject" | "message";
type ContactForm = Record<ContactField, string>;
type ContactErrors = Partial<Record<ContactField, string>>;

const INITIAL_FORM: ContactForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const CONTACT_CHANNELS = [
  {
    title: "Email support",
    value: "support@autolodge.demo",
    detail: "Best for reservation changes, billing questions, and host communication.",
  },
  {
    title: "Guest care line",
    value: "+1 (555) 987-6543",
    detail: "Available for urgent booking issues, check-in problems, and accessibility requests.",
  },
  {
    title: "Live support hours",
    value: "Monday to Friday, 9:00 AM to 5:00 PM EST",
    detail: "Typical response time is under 24 hours for general questions.",
  },
];

const SUPPORT_TOPICS = [
  "Reservation changes",
  "Payment and refund questions",
  "Host communication issues",
  "Special stay requests",
];

function validateForm(form: ContactForm) {
  const nextErrors: ContactErrors = {};

  if (!form.name.trim()) {
    nextErrors.name = "Name is required.";
  }

  if (!form.email.trim()) {
    nextErrors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    nextErrors.email = "Enter a valid email address.";
  }

  if (!form.subject.trim()) {
    nextErrors.subject = "Subject is required.";
  }

  if (!form.message.trim()) {
    nextErrors.message = "Message is required.";
  } else if (form.message.trim().length < 20) {
    nextErrors.message = "Please add a few more details so we can help faster.";
  }

  return nextErrors;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p id={id} className="text-xs font-medium text-rose-600">
      {message}
    </p>
  );
}

function ContactContent() {
  const dyn = useDynamicSystem();
  const [form, setForm] = useState<ContactForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    logEvent(EVENT_TYPES.CONTACT_PAGE_VIEWED, { page: "contact" });
  }, []);

  const handleFieldChange =
    (field: ContactField) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;

      setForm((current) => ({
        ...current,
        [field]: value,
      }));

      setErrors((current) => {
        if (!current[field]) {
          return current;
        }

        const next = validateForm({
          ...form,
          [field]: value,
        });

        return {
          ...current,
          [field]: next[field],
        };
      });
    };

  const resetForm = () => {
    setSubmitted(false);
    setForm(INITIAL_FORM);
    setErrors({});
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateForm(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    logEvent(EVENT_TYPES.CONTACT_FORM_SUBMITTED, {
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
    });

    setSubmitted(true);
    setErrors({});
  };

  if (submitted) {
    return dyn.v1.addWrapDecoy(
      "contact-page",
      (
        <section className="mt-4 md:mt-8">
          <div className="overflow-hidden rounded-[28px] border border-emerald-200 bg-[linear-gradient(135deg,#effcf6_0%,#ffffff_45%,#eef6ff_100%)] shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
            <div className="px-6 py-8 md:px-10 md:py-12">
              <span className="inline-flex rounded-full border border-emerald-300 bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                Message received
              </span>
              <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">
                Thanks, {form.name.trim().split(" ")[0] || "there"}. We&apos;ll review this and reply soon.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-600 md:text-base">
                Our support team typically responds within 24 hours. If your request is time-sensitive,
                call the guest care line so we can help you faster.
              </p>
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {CONTACT_CHANNELS.map((channel) => (
                  <div
                    key={channel.title}
                    className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-sm"
                  >
                    <p className="text-sm font-semibold text-neutral-900">{channel.title}</p>
                    <p className="mt-2 text-sm text-neutral-700">{channel.value}</p>
                    <p className="mt-2 text-xs leading-5 text-neutral-500">{channel.detail}</p>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={resetForm}
                className="mt-8 inline-flex rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                Send another message
              </button>
            </div>
          </div>
        </section>
      ),
      "contact-page-wrap"
    );
  }

  return dyn.v1.addWrapDecoy(
    "contact-page",
    (
      <section className="mt-4 md:mt-8">
        <div className="overflow-hidden rounded-[32px] border border-neutral-200 bg-[linear-gradient(135deg,#f5f1ea_0%,#f8fafc_35%,#ffffff_100%)] shadow-[0_24px_80px_rgba(15,23,42,0.09)]">
          <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="border-b border-neutral-200/80 px-6 py-8 lg:border-b-0 lg:border-r lg:px-10 lg:py-10">
              <span className="inline-flex rounded-full border border-neutral-300 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-neutral-700">
                Contact Autolodge
              </span>
              <h1 className="mt-4 max-w-md text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">
                Real help for booking questions, stay changes, and host issues.
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-6 text-neutral-600 md:text-base">
                Tell us what happened and include any reservation context. The more specific your
                message is, the faster the support team can route it to the right person.
              </p>

              <div className="mt-8 space-y-3">
                {CONTACT_CHANNELS.map((channel) => (
                  <div
                    key={channel.title}
                    className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur"
                  >
                    <p className="text-sm font-semibold text-neutral-900">{channel.title}</p>
                    <p className="mt-1 text-base font-medium text-[#616882]">{channel.value}</p>
                    <p className="mt-2 text-sm leading-6 text-neutral-600">{channel.detail}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl border border-dashed border-neutral-300 bg-white/70 p-5">
                <p className="text-sm font-semibold text-neutral-900">Most common support topics</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {SUPPORT_TOPICS.map((topic) => (
                    <span
                      key={topic}
                      className="rounded-full bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white/90 px-6 py-8 lg:px-10 lg:py-10">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">Send a message</h2>
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  Use the form for anything that does not need an immediate phone call.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="contact-name" className="text-sm font-medium text-neutral-800">
                      Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      placeholder="Your full name"
                      value={form.name}
                      onChange={handleFieldChange("name")}
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? "contact-name-error" : undefined}
                      className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-[#616882] focus:ring-4 focus:ring-[#616882]/15"
                    />
                    <FieldError id="contact-name-error" message={errors.name} />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="contact-email" className="text-sm font-medium text-neutral-800">
                      Email
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={handleFieldChange("email")}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? "contact-email-error" : undefined}
                      className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-[#616882] focus:ring-4 focus:ring-[#616882]/15"
                    />
                    <FieldError id="contact-email-error" message={errors.email} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="contact-subject" className="text-sm font-medium text-neutral-800">
                    Subject
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    placeholder="What can we help with?"
                    value={form.subject}
                    onChange={handleFieldChange("subject")}
                    aria-invalid={Boolean(errors.subject)}
                    aria-describedby={errors.subject ? "contact-subject-error" : undefined}
                    className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-[#616882] focus:ring-4 focus:ring-[#616882]/15"
                  />
                  <FieldError id="contact-subject-error" message={errors.subject} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <label htmlFor="contact-message" className="text-sm font-medium text-neutral-800">
                      Message
                    </label>
                    <span className="text-xs text-neutral-500">Minimum 20 characters</span>
                  </div>
                  <textarea
                    id="contact-message"
                    placeholder="Share your reservation details, dates, or the problem you ran into."
                    value={form.message}
                    onChange={handleFieldChange("message")}
                    rows={7}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? "contact-message-error" : undefined}
                    className="w-full rounded-[24px] border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-[#616882] focus:ring-4 focus:ring-[#616882]/15"
                  />
                  <FieldError id="contact-message-error" message={errors.message} />
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-xs leading-5 text-neutral-500">
                  Include your reservation ID if this is about an existing booking. That usually avoids
                  one extra back-and-forth with support.
                </div>

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#616882] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#555c73]"
                >
                  Send message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    ),
    "contact-page-wrap"
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div>Loading contact...</div>}>
      <ContactContent />
    </Suspense>
  );
}
