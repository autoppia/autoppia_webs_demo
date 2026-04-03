"use client";

import { useSeed } from "@/context/SeedContext";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { cn } from "@/library/utils";

export default function ContactPage() {
  const { seed } = useSeed();
  const dyn = useDynamicSystem();
  const searchParams = useSearchParams();
  const hasSeedParam = Boolean(searchParams?.get("seed"));

  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => { setFormData({ name: "", email: "", subject: "", message: "" }); setSubmitted(false); }, 3000);
    logEvent(EVENT_TYPES.CONTACT_FORM_SUBMIT, { ...formData, seed });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const contactInfo = [
    { icon: <Mail className="w-5 h-5" />, title: "Email Us", content: "support@autodining.com", link: "mailto:support@autodining.com" },
    { icon: <Phone className="w-5 h-5" />, title: "Call Us", content: "+1 (555) 123-4567", link: "tel:+15551234567" },
    { icon: <MapPin className="w-5 h-5" />, title: "Visit Us", content: "123 Food Street, Dining City, DC 12345", link: "#" },
    { icon: <Clock className="w-5 h-5" />, title: "Business Hours", content: "Mon - Fri: 9:00 AM - 6:00 PM", link: "#" },
  ];

  useEffect(() => {
    logEvent(EVENT_TYPES.CONTACT_PAGE_VIEW, { seed, fromSeedParam: hasSeedParam });
  }, [seed, hasSeedParam]);

  const inputClasses = "w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-white/25 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 outline-none transition-all text-sm";

  return (
    dyn.v1.addWrapDecoy("contact-page", (
      <main className="min-h-screen bg-background" id={dyn.v3.getVariant("contact-page", ID_VARIANTS_MAP, "contact-page")}>
        <Navbar showBack />
        {dyn.v1.addWrapDecoy("contact-content", (
          <div id={dyn.v3.getVariant("contact-content", ID_VARIANTS_MAP, "contact-content")}>

        {/* Hero */}
        {dyn.v1.addWrapDecoy("contact-hero", (
          <div className="relative overflow-hidden py-24 px-6" id={dyn.v3.getVariant("contact-hero", ID_VARIANTS_MAP, "contact-hero")}>
            <div className="absolute inset-0">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-25 scale-105"
                style={{ backgroundImage: "url('/images/help-about-banner.jpg')", filter: "blur(4px)" }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/55 to-background/95" />
            </div>
            <div className="absolute top-10 right-1/3 w-72 h-72 bg-amber-500/5 rounded-full blur-[100px]" />
            <div className="max-w-4xl mx-auto text-center relative z-10">
              <p className="uppercase tracking-[0.5em] text-[11px] font-semibold text-amber-500 mb-4">Reach out</p>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-5 tracking-tight" id={dyn.v3.getVariant("contact-title", ID_VARIANTS_MAP, "contact-title")}>{dyn.v3.getVariant("get_in_touch", TEXT_VARIANTS_MAP, "Get in Touch")}</h1>
              <p className="text-lg text-white/40 max-w-2xl mx-auto leading-relaxed" id={dyn.v3.getVariant("contact-subtitle", ID_VARIANTS_MAP, "contact-subtitle")}>{dyn.v3.getVariant("contact_description", TEXT_VARIANTS_MAP, "Have questions or feedback? We'd love to hear from you! Reach out to us and we'll get back to you as soon as possible.")}</p>
            </div>
          </div>
        ), "contact-hero-wrap")}
        <div className="max-w-5xl mx-auto px-6 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Contact Information</h2>
              <p className="text-white/30 text-sm mb-6">Feel free to reach out through any of these channels.</p>
              <div className="space-y-3">
                {contactInfo.map((info) => (
                  <a
                    key={info.title}
                    href={info.link}
                    className="flex items-start gap-4 p-4 glass rounded-2xl hover:bg-white/[0.06] transition-all duration-300 group cursor-default"
                    onClick={() => logEvent(EVENT_TYPES.CONTACT_CARD_CLICK, { type: info.title, seed })}
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/20 transition-colors">
                      {info.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-0.5">{info.title}</h3>
                      <p className="text-white/40 text-sm">{info.content}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-xl font-bold text-white mb-6">Send us a Message</h2>
              <div className="glass rounded-3xl p-8">
                {submitted && (
                  <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm">
                    Thank you for your message! We'll get back to you soon.
                  </div>
                )}
                {dyn.v1.addWrapDecoy("contact-form", (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label htmlFor="name" className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Name *</label>
                      <input type="text" id={dyn.v3.getVariant("contact-name-input", ID_VARIANTS_MAP, "name")} name="name" required value={formData.name} onChange={handleChange}
                        className={cn(dyn.v3.getVariant("input-text", CLASS_VARIANTS_MAP, "input-text"), inputClasses)}
                        placeholder={dyn.v3.getVariant("name_placeholder", TEXT_VARIANTS_MAP, "Your full name")} />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Email *</label>
                      <input type="email" id={dyn.v3.getVariant("contact-email-input", ID_VARIANTS_MAP, "email")} name="email" required value={formData.email} onChange={handleChange}
                        className={cn(dyn.v3.getVariant("input-text", CLASS_VARIANTS_MAP, "input-text"), inputClasses)}
                        placeholder={dyn.v3.getVariant("email_placeholder", TEXT_VARIANTS_MAP, "your.email@example.com")} />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Subject *</label>
                      <input type="text" id={dyn.v3.getVariant("contact-subject-input", ID_VARIANTS_MAP, "subject")} name="subject" required value={formData.subject} onChange={handleChange}
                        className={cn(dyn.v3.getVariant("input-text", CLASS_VARIANTS_MAP, "input-text"), inputClasses)}
                        placeholder={dyn.v3.getVariant("subject_placeholder", TEXT_VARIANTS_MAP, "What's this about?")} />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Message *</label>
                      <textarea id={dyn.v3.getVariant("contact-message-textarea", ID_VARIANTS_MAP, "message")} name="message" required value={formData.message} onChange={handleChange} rows={5}
                        className={cn(dyn.v3.getVariant("textarea-text", CLASS_VARIANTS_MAP, "textarea-text"), inputClasses, "resize-none")}
                        placeholder={dyn.v3.getVariant("message_placeholder", TEXT_VARIANTS_MAP, "Tell us more about your inquiry...")} />
                    </div>
                    <div className="pt-1">
                      {dyn.v1.addWrapDecoy("send-message-button", (
                        <Button type="submit" id={dyn.v3.getVariant("send-message-button", ID_VARIANTS_MAP, "send-message-button")}
                          className={cn(dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, "button-primary"), "w-full bg-amber-500 hover:bg-amber-400 text-black px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all text-sm hover:shadow-lg hover:shadow-amber-500/20")}>
                          <Send className="w-4 h-4" />
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
          <div className="glass rounded-3xl p-10 md:p-14">
            <div className="text-center mb-8">
              <p className="uppercase tracking-[0.3em] text-[10px] font-semibold text-amber-500 mb-3">Quick answers</p>
              <h2 className="text-2xl font-bold text-white tracking-tight">Frequently Asked Questions</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { title: "How do I make a reservation?", description: "Search for a restaurant, pick a date and time, and complete the booking in seconds." },
                { title: "Can I cancel my reservation?", description: "Yes - up to 24 hours before your booking time. Details are in your confirmation email." },
                { title: "Is there a booking fee?", description: "No, our service is free. You only pay the restaurant when you dine." },
              ].map((item) => (
                <div key={item.title} className="bg-white/[0.03] rounded-2xl p-6 border border-white/[0.05]">
                  <h3 className="text-sm font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-white/35 text-sm leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>
        ), "contact-content-wrap")}
      </main>
    ), "contact-page-wrap")
  );
}
