"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { cn } from "@/library/utils";
import { logEvent, EVENT_TYPES } from "@/library/events";

export default function ContactPage() {
  const dyn = useDynamicSystem();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const orderedSections = useMemo(() => {
    const sections = ["header", "form", "info"];
    const order = dyn.v1.changeOrderElements("contact-sections", sections.length);
    return order.map((idx) => sections[idx]);
  }, [dyn]);

  const orderedFields = useMemo(() => {
    const fields = ["name", "email", "subject", "message"];
    const order = dyn.v1.changeOrderElements("contact-fields", fields.length);
    return order.map((idx) => fields[idx]);
  }, [dyn]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logEvent(EVENT_TYPES.CONTACT_FORM_SUBMITTED, {
      name,
      email,
      subject,
      message,
    });
    setSubmitted(true);
  };

  const fieldMap: Record<string, React.ReactNode> = {
    name: (
      <div className="space-y-2">
        <Label htmlFor="contact-name">
          {dyn.v3.getVariant("contact_name_label", TEXT_VARIANTS_MAP, "Name")}
        </Label>
        <Input
          id="contact-name"
          placeholder="Your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="h-10"
        />
      </div>
    ),
    email: (
      <div className="space-y-2">
        <Label htmlFor="contact-email">
          {dyn.v3.getVariant("contact_email_label", TEXT_VARIANTS_MAP, "Email")}
        </Label>
        <Input
          id="contact-email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-10"
        />
      </div>
    ),
    subject: (
      <div className="space-y-2">
        <Label htmlFor="contact-subject">
          {dyn.v3.getVariant("contact_subject_label", TEXT_VARIANTS_MAP, "Subject")}
        </Label>
        <Input
          id="contact-subject"
          placeholder="What is this about?"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          className="h-10"
        />
      </div>
    ),
    message: (
      <div className="space-y-2">
        <Label htmlFor="contact-message">
          {dyn.v3.getVariant("contact_message_label", TEXT_VARIANTS_MAP, "Message")}
        </Label>
        <textarea
          id="contact-message"
          placeholder="How can we help you?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={5}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>
    ),
  };

  return (
    <div className="container py-10">
      {orderedSections.map((section, si) =>
        dyn.v1.addWrapDecoy(`contact-section-${si}`, (
          <div key={section}>
            {section === "header" && (
              dyn.v1.addWrapDecoy("contact-header", (
                <div className="mb-8">
                  <h1
                    id={dyn.v3.getVariant("contact-title", ID_VARIANTS_MAP, "contact-title")}
                    className={cn("text-2xl font-semibold", dyn.v3.getVariant("contact-title", CLASS_VARIANTS_MAP, ""))}
                  >
                    {dyn.v3.getVariant("contact_title", TEXT_VARIANTS_MAP, "Contact Us")}
                  </h1>
                  <p className="mt-2 text-muted-foreground">
                    {dyn.v3.getVariant("contact_subtitle", TEXT_VARIANTS_MAP, "Have a question or need assistance? Fill out the form below and our team will get back to you.")}
                  </p>
                </div>
              ))
            )}

            {section === "form" && (
              dyn.v1.addWrapDecoy("contact-form", (
                <div className="max-w-2xl">
                  {submitted ? (
                    dyn.v1.addWrapDecoy("contact-success", (
                      <div className="rounded-lg border bg-emerald-50 p-6 text-center">
                        <h2 className="text-xl font-semibold text-emerald-800">
                          {dyn.v3.getVariant("contact_success_title", TEXT_VARIANTS_MAP, "Message Sent!")}
                        </h2>
                        <p className="mt-2 text-sm text-emerald-700">
                          {dyn.v3.getVariant("contact_success_text", TEXT_VARIANTS_MAP, "Thank you for reaching out. We'll get back to you within 24 hours.")}
                        </p>
                        <Button
                          onClick={() => {
                            setSubmitted(false);
                            setName("");
                            setEmail("");
                            setSubject("");
                            setMessage("");
                          }}
                          className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                        >
                          {dyn.v3.getVariant("contact_send_another", TEXT_VARIANTS_MAP, "Send Another Message")}
                        </Button>
                      </div>
                    ))
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-6">
                      {orderedFields.map((field, fi) =>
                        dyn.v1.addWrapDecoy(`contact-field-${fi}`, (
                          <div key={field}>{fieldMap[field]}</div>
                        ), `contact-field-${fi}`)
                      )}
                      {dyn.v1.addWrapDecoy("contact-submit", (
                        <Button
                          type="submit"
                          id={dyn.v3.getVariant("contact-submit", ID_VARIANTS_MAP, "contact-submit")}
                          className={cn("w-full bg-emerald-600 hover:bg-emerald-700", dyn.v3.getVariant("contact-submit", CLASS_VARIANTS_MAP, ""))}
                        >
                          {dyn.v3.getVariant("contact_submit", TEXT_VARIANTS_MAP, "Send Message")}
                        </Button>
                      ))}
                    </form>
                  )}
                </div>
              ))
            )}

            {section === "info" && (
              dyn.v1.addWrapDecoy("contact-info", (
                <div className="mt-8 max-w-2xl rounded-lg border bg-card p-6">
                  <h2
                    id={dyn.v3.getVariant("contact-info-heading", ID_VARIANTS_MAP, "contact-info-heading")}
                    className={cn("text-xl font-semibold", dyn.v3.getVariant("contact-info-heading", CLASS_VARIANTS_MAP, ""))}
                  >
                    {dyn.v3.getVariant("contact_info_heading", TEXT_VARIANTS_MAP, "Other Ways to Reach Us")}
                  </h2>
                  <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium text-foreground">Email: </span>
                      support@autohealth.demo
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Phone: </span>
                      +1 (555) 123-4567
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Hours: </span>
                      Monday - Friday, 9:00 AM - 5:00 PM EST
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ), `contact-section-${si}`)
      )}
    </div>
  );
}
