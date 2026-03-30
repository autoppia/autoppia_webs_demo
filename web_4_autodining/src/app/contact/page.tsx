"use client";

import { useSeed } from "@/context/SeedContext";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, Phone, MapPin, Clock, Send, User, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { cn } from "@/library/utils";

export default function ContactPage() {
  const { seed } = useSeed();
  const dyn = useDynamicSystem();
  const searchParams = useSearchParams();
  const hasSeedParam = Boolean(searchParams?.get("seed"));

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: "", email: "", subject: "", message: "" });
      setSubmitted(false);
    }, 3000);

    logEvent(EVENT_TYPES.CONTACT_FORM_SUBMIT, {
      ...formData,
      seed,
    });
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Us",
      content: "support@autodining.com",
      link: "mailto:support@autodining.com",
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Call Us",
      content: "+1 (555) 123-4567",
      link: "tel:+15551234567",
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Visit Us",
      content: "123 Food Street, Dining City, DC 12345",
      link: "#",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Business Hours",
      content: "Mon - Fri: 9:00 AM - 6:00 PM",
      link: "#",
    },
  ];

  useEffect(() => {
    logEvent(EVENT_TYPES.CONTACT_PAGE_VIEW, {
      seed,
      fromSeedParam: hasSeedParam,
    });
  }, [seed, hasSeedParam]);

  return (
    dyn.v1.addWrapDecoy("contact-page", (
      <main id={dyn.v3.getVariant("contact-page", ID_VARIANTS_MAP, "contact-page")}>
        <Navbar showBack />
        {dyn.v1.addWrapDecoy("contact-content", (
          <div className="max-w-6xl mx-auto px-4 py-8" id={dyn.v3.getVariant("contact-content", ID_VARIANTS_MAP, "contact-content")}>
        {/* Hero Section */}
        {dyn.v1.addWrapDecoy("contact-hero", (
          <div className="mb-12 text-center" id={dyn.v3.getVariant("contact-hero", ID_VARIANTS_MAP, "contact-hero")}>
            <h1 className="text-5xl font-bold text-gray-900 mb-4" id={dyn.v3.getVariant("contact-title", ID_VARIANTS_MAP, "contact-title")}>
              {dyn.v3.getVariant("get_in_touch", TEXT_VARIANTS_MAP, "Get in Touch")}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto" id={dyn.v3.getVariant("contact-subtitle", ID_VARIANTS_MAP, "contact-subtitle")}>
              {dyn.v3.getVariant("contact_description", TEXT_VARIANTS_MAP, "Have questions or feedback? We'd love to hear from you! Reach out to us and we'll get back to you as soon as possible.")}
            </p>
          </div>
        ), "contact-hero-wrap")}

        {/* Main Content: Contact Info + Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Contact Information
            </h2>
            <p className="text-gray-600 mb-8">
              Feel free to reach out through any of these channels. We're here
              to help!
            </p>
            <div className="space-y-4">
              {contactInfo.map((info) => (
                <a
                  key={info.title}
                  href={info.link}
                  className="flex items-start gap-4 p-4 bg-white border border-gray-300 rounded-lg hover:shadow-md hover:border-[#dc2626] transition-all duration-300 group cursor-default"
                  onClick={() =>
                    logEvent(EVENT_TYPES.CONTACT_CARD_CLICK, {
                      type: info.title,
                      seed,
                    })
                  }
                >
                  <div className="text-[#dc2626] group-hover:scale-110 transition-transform">
                    {info.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {info.title}
                    </h3>
                    <p className="text-gray-600">{info.content}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 font-display">
              Send us a Message
            </h2>
            <div className="bg-zinc-950 border-2 border-zinc-900 rounded-2xl p-8 shadow-2xl transition-all duration-300 hover:border-[#dc2626] group/container">
              {submitted && (
                <div className="mb-6 p-4 bg-red-950/50 border border-red-900 rounded-lg text-red-500 text-sm italic">
                  Thank you for your message! We'll get back to you soon.
                </div>
              )}

              {dyn.v1.addWrapDecoy("contact-form", (
                <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div className="group">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-300 mb-2 transition-colors group-focus-within:text-white"
                  >
                    Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#dc2626] transition-colors" />
                    <input
                      type="text"
                      id={dyn.v3.getVariant("contact-name-input", ID_VARIANTS_MAP, "name")}
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className={cn(
                        "w-full pl-10 pr-4 py-3 bg-white border border-transparent rounded-lg focus:ring-2 focus:ring-[#dc2626] focus:border-[#dc2626] outline-none transition-all text-gray-900 font-medium placeholder:text-gray-400"
                      )}
                      placeholder={dyn.v3.getVariant("name_placeholder", TEXT_VARIANTS_MAP, "Your full name")}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="group">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-300 mb-2 transition-colors group-focus-within:text-white"
                  >
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#dc2626] transition-colors" />
                    <input
                      type="email"
                      id={dyn.v3.getVariant("contact-email-input", ID_VARIANTS_MAP, "email")}
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className={cn(
                        "w-full pl-10 pr-4 py-3 bg-white border border-transparent rounded-lg focus:ring-2 focus:ring-[#dc2626] focus:border-[#dc2626] outline-none transition-all text-gray-900 font-medium placeholder:text-gray-400"
                      )}
                      placeholder={dyn.v3.getVariant("email_placeholder", TEXT_VARIANTS_MAP, "your.email@example.com")}
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className="group">
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-300 mb-2 transition-colors group-focus-within:text-white"
                  >
                    Subject *
                  </label>
                  <div className="relative">
                    <Send className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#dc2626] transition-colors" />
                    <input
                      type="text"
                      id={dyn.v3.getVariant("contact-subject-input", ID_VARIANTS_MAP, "subject")}
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className={cn(
                        "w-full pl-10 pr-4 py-3 bg-white border border-transparent rounded-lg focus:ring-2 focus:ring-[#dc2626] focus:border-[#dc2626] outline-none transition-all text-gray-900 font-medium placeholder:text-gray-400"
                      )}
                      placeholder={dyn.v3.getVariant("subject_placeholder", TEXT_VARIANTS_MAP, "What's this about?")}
                    />
                  </div>
                </div>

                {/* Message */}
                <div className="group">
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-300 mb-2 transition-colors group-focus-within:text-white"
                  >
                    Message *
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-4 w-4 h-4 text-gray-500 group-focus-within:text-[#dc2626] transition-colors" />
                    <textarea
                      id={dyn.v3.getVariant("contact-message-textarea", ID_VARIANTS_MAP, "message")}
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      className={cn(
                        "w-full pl-10 pr-4 py-3 bg-white border border-transparent rounded-lg focus:ring-2 focus:ring-[#dc2626] focus:border-[#dc2626] outline-none resize-none transition-all text-gray-900 font-medium placeholder:text-gray-400"
                      )}
                      placeholder={dyn.v3.getVariant("message_placeholder", TEXT_VARIANTS_MAP, "Tell us more about your inquiry...")}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  {dyn.v1.addWrapDecoy("send-message-button", (
                    <Button
                      type="submit"
                      id={dyn.v3.getVariant("send-message-button", ID_VARIANTS_MAP, "send-message-button")}
                      className={cn(
                        "w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white px-6 py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
                      )}
                    >
                      <Send className="w-5 h-5" />
                      {dyn.v3.getVariant("send_message", TEXT_VARIANTS_MAP, "Send Message")}
                    </Button>
                  ), "send-message-button-wrap")}
                </div>
                </form>
              ), "contact-form-wrap")}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-gray-50 rounded-2xl p-8 md:p-12 border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "How do I make a reservation?",
                description:
                  "Search for a restaurant, pick a date and time, and complete the booking in seconds.",
              },
              {
                title: "Can I cancel my reservation?",
                description:
                  "Yes—up to 24 hours before your booking time. Details are in your confirmation email.",
              },
              {
                title: "Is there a booking fee?",
                description:
                  "No, our service is free. You only pay the restaurant when you dine.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
        </div>
        ), "contact-content-wrap")}
      </main>
    ), "contact-page-wrap")
  );
}
