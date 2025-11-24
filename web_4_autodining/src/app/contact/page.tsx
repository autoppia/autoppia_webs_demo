"use client";

import { useSeed } from "@/context/SeedContext";
import { useSeedVariation } from "@/dynamic/v1-layouts";
import { useV3Attributes } from "@/dynamic/v3-dynamic";
import Navbar from "@/components/Navbar";
import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const { seed, resolvedSeeds } = useSeed();
  const { getText, getId } = useV3Attributes();
  const searchParams = useSearchParams();
  const hasSeedParam = Boolean(searchParams?.get("seed"));
  const layoutSeed = hasSeedParam ? (resolvedSeeds.v1 ?? seed) : 8;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  // Use seed-based layout variations
  const pageLayoutVariation = useSeedVariation("pageLayout", undefined, layoutSeed);
  const formVariation = useSeedVariation("form", undefined, layoutSeed);
  const sectionLayoutVariation = useSeedVariation("sectionLayout", undefined, layoutSeed);

  // Calculate layout variation for styling
  const layoutMode = useMemo(() => (layoutSeed % 3 + 3) % 3, [layoutSeed]);
  const layoutVariation = useMemo(() => {
    return {
      textAlign: ["text-left md:text-left", "text-center", "text-left md:text-right"][layoutMode],
      gridCols: ["grid-cols-1 md:grid-cols-2", "grid-cols-1 md:grid-cols-3", "grid-cols-1 md:grid-cols-2"][layoutMode],
    };
  }, [layoutMode]);

  const sectionOrder = useMemo(() => {
    const sequences: Record<number, ("info" | "form" | "faq")[]> = {
      0: ["info", "form", "faq"],
      1: ["form", "info", "faq"],
      2: ["faq", "info", "form"],
    };
    return sequences[layoutMode];
  }, [layoutMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: "", email: "", subject: "", message: "" });
      setSubmitted(false);
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  return (
    <main>
      <Navbar />
      <div className={`${pageLayoutVariation.className || "max-w-6xl mx-auto px-4 py-8"}`} 
           data-testid={pageLayoutVariation.dataTestId}>
        {/* Hero Section */}
        <div className={`mb-12 ${hasSeedParam ? layoutVariation.textAlign : "text-center"}`}>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions or feedback? We'd love to hear from you! 
            Reach out to us and we'll get back to you as soon as possible.
          </p>
        </div>

        {sectionOrder.map((sectionKey) => {
          if (sectionKey === "info") {
            return (
              <section
                key="info"
                className={`${sectionLayoutVariation.className || "mb-12"}`}
                data-testid={sectionLayoutVariation.dataTestId}
              >
                <div className={`grid ${layoutVariation.gridCols} gap-6`}>
                  {contactInfo.map((info, index) => (
                    <a
                      key={index}
                      href={info.link}
                      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300 hover:border-[#46a758]"
                    >
                      <div className="text-[#46a758] mb-4">{info.icon}</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{info.title}</h3>
                      <p className="text-gray-600">{info.content}</p>
                    </a>
                  ))}
                </div>
              </section>
            );
          }

          if (sectionKey === "form") {
            return (
              <section key="form" className={`${sectionLayoutVariation.className || "mb-12"}`}>
                <div
                  className={`bg-white border border-gray-200 rounded-2xl p-8 md:p-12 ${
                    layoutMode === 2 ? "md:flex md:flex-row md:gap-10" : ""
                  }`}
                >
                  <div className={layoutMode === 2 ? "md:w-1/3 space-y-4" : ""}>
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Send us a Message</h2>
                    <p className="text-gray-600">
                      Prefer the personal touch? Drop us a note and our concierge team will respond promptly.
                    </p>
                  </div>
                  <div className={layoutMode === 2 ? "md:w-2/3" : ""}>
                    {submitted && (
                      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                        Thank you for your message! We'll get back to you soon.
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className={formVariation.className || "space-y-6"}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                            Name *
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#46a758] focus:border-[#46a758] outline-none"
                            placeholder="Your name"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email *
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#46a758] focus:border-[#46a758] outline-none"
                            placeholder="your.email@example.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                          Subject *
                        </label>
                        <input
                          type="text"
                          id="subject"
                          name="subject"
                          required
                          value={formData.subject}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#46a758] focus:border-[#46a758] outline-none"
                          placeholder="What's this about?"
                        />
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                          Message *
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          required
                          value={formData.message}
                          onChange={handleChange}
                          rows={6}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#46a758] focus:border-[#46a758] outline-none resize-none"
                          placeholder="Tell us more about your inquiry..."
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full md:w-auto bg-[#46a758] hover:bg-[#3d8f4e] text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2"
                      >
                        <Send className="w-5 h-5" />
                        Send Message
                      </Button>
                    </form>
                  </div>
                </div>
              </section>
            );
          }

          return (
            <section key="faq" className={`${sectionLayoutVariation.className || "mb-12"}`}>
              <div className="bg-gray-50 rounded-2xl p-8 md:p-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h2>
                <div className={`${layoutMode === 0 ? "space-y-4" : "grid gap-4 md:grid-cols-3"}`}>
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
                      description: "No, our service is free. You only pay the restaurant when you dine.",
                    },
                  ].map((item) => (
                    <div key={item.title} className="bg-white rounded-lg p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}