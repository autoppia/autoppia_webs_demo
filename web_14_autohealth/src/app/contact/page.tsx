"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { cn } from "@/library/utils";

export default function ContactPage() {
  const dyn = useDynamicSystem();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    logEvent(EVENT_TYPES.FORM_SUBMITTED, {
      formType: "contact",
      name,
      email,
      subject,
    });

    setSubmitted(true);
  };

  const handleReset = () => {
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setSubmitted(false);
  };

  return (
    <div className="container py-12 max-w-2xl mx-auto">
      <h1
        id={dyn.v3.getVariant("contact-heading", ID_VARIANTS_MAP, "contact-heading")}
        className="text-3xl font-bold text-center mb-2"
      >
        {dyn.v3.getVariant("contact_title", TEXT_VARIANTS_MAP, "Contact Us")}
      </h1>
      <p className="text-center text-muted-foreground mb-8">
        {dyn.v3.getVariant(
          "contact_subtitle",
          TEXT_VARIANTS_MAP,
          "Have a question or need assistance? Send us a message and we'll get back to you."
        )}
      </p>

      <Card>
        <CardHeader>
          <CardTitle>
            {dyn.v3.getVariant("contact_form_title", TEXT_VARIANTS_MAP, "Send a Message")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="text-center py-8">
              <div className="text-emerald-600 text-lg font-semibold mb-2">
                Thank you for your message!
              </div>
              <p className="text-muted-foreground mb-4">
                We have received your inquiry and will respond within 24 hours.
              </p>
              <Button
                onClick={handleReset}
                className={cn(
                  "bg-emerald-600 hover:bg-emerald-700",
                  dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, "")
                )}
              >
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contact-name">Name</Label>
                <Input
                  id="contact-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                  className={cn(dyn.v3.getVariant("input", CLASS_VARIANTS_MAP, ""))}
                  data-testid="contact-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-email">Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  className={cn(dyn.v3.getVariant("input", CLASS_VARIANTS_MAP, ""))}
                  data-testid="contact-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-subject">Subject</Label>
                <Input
                  id="contact-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="What is this regarding?"
                  required
                  className={cn(dyn.v3.getVariant("input", CLASS_VARIANTS_MAP, ""))}
                  data-testid="contact-subject"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-message">Message</Label>
                <textarea
                  id="contact-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us how we can help..."
                  required
                  rows={5}
                  className={cn(
                    "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    dyn.v3.getVariant("input", CLASS_VARIANTS_MAP, "")
                  )}
                  data-testid="contact-message"
                />
              </div>

              <Button
                type="submit"
                className={cn(
                  "w-full bg-emerald-600 hover:bg-emerald-700",
                  dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, "")
                )}
                data-testid="contact-submit"
              >
                {dyn.v3.getVariant("send_message", TEXT_VARIANTS_MAP, "Send Message")}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <div className="mt-8 grid gap-4 md:grid-cols-3 text-center">
        <div className="p-4">
          <div className="font-semibold text-emerald-700 mb-1">Email</div>
          <p className="text-sm text-muted-foreground">support@autohealth.demo</p>
        </div>
        <div className="p-4">
          <div className="font-semibold text-emerald-700 mb-1">Phone</div>
          <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
        </div>
        <div className="p-4">
          <div className="font-semibold text-emerald-700 mb-1">Hours</div>
          <p className="text-sm text-muted-foreground">Mon–Fri, 9AM–5PM</p>
        </div>
      </div>
    </div>
  );
}
