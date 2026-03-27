"use client";

import { useSeed } from "@/context/SeedContext";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { cn } from "@/library/utils";
import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp, Search, BookOpen, HelpCircle, MessageCircle, Calendar } from "lucide-react";
import { EVENT_TYPES, logEvent } from "@/library/events";

interface FAQItem { question: string; answer: string; category: string; }

export default function HelpPage() {
  const { seed } = useSeed();
  const dyn = useDynamicSystem();
  const searchParams = useSearchParams();
  const hasSeedParam = Boolean(searchParams?.get("seed"));
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const faqs: FAQItem[] = [
    { category: "Getting Started", question: "How do I create an account?", answer: "Creating an account is easy! Click on the 'Sign Up' button in the top right corner, enter your email and password, and you're all set. You can also sign up using your Google or Facebook account for faster access." },
    { category: "Getting Started", question: "How do I search for restaurants?", answer: "Use the search bar on the homepage to search by restaurant name, cuisine type, or location. You can also filter results by price range, ratings, and availability." },
    { category: "Bookings", question: "How do I make a reservation?", answer: "Browse our restaurant listings, select a restaurant, choose your preferred date and time, specify the number of guests, and complete the booking. You'll receive a confirmation email with all the details." },
    { category: "Bookings", question: "Can I modify my reservation?", answer: "Yes! You can modify your reservation by accessing your booking history. Click on 'My Reservations' in your account, select the booking you want to modify, and make the necessary changes. Note that modifications depend on restaurant availability." },
    { category: "Bookings", question: "What is your cancellation policy?", answer: "You can cancel your reservation free of charge up to 24 hours before your booking time. Cancellations made less than 24 hours in advance may be subject to the restaurant's cancellation policy." },
    { category: "Payments", question: "Is there a booking fee?", answer: "No, our service is completely free for customers. We don't charge any booking fees. The only charges you'll see are from the restaurant itself for your meal." },
    { category: "Payments", question: "Do I pay through AutoDining?", answer: "No, payment is handled directly by the restaurant. You'll pay for your meal at the restaurant when you dine. We simply facilitate the reservation process." },
    { category: "Account", question: "How do I update my profile information?", answer: "Go to 'My Account' in the top menu, then click on 'Profile Settings'. From there, you can update your personal information, contact details, and preferences." },
    { category: "Account", question: "How do I view my reservation history?", answer: "Click on 'My Reservations' in your account dashboard. You'll see a list of all your past, current, and upcoming reservations with details about each booking." },
    { category: "Restaurants", question: "How are restaurants selected?", answer: "We carefully curate our restaurant listings based on quality, customer reviews, and dining experience. All restaurants go through a vetting process to ensure they meet our standards." },
    { category: "Restaurants", question: "Can I leave a review?", answer: "Yes! After dining at a restaurant, you can leave a review and rating. Reviews help other diners make informed decisions and help restaurants improve their service." },
    { category: "Technical", question: "The website is not loading properly", answer: "Try clearing your browser cache and cookies, or try using a different browser. If the issue persists, please contact our support team with details about your browser and device." },
    { category: "Technical", question: "I didn't receive a confirmation email", answer: "Check your spam or junk folder. If you still don't see it, verify that the email address in your account is correct. You can also view your reservations directly in your account dashboard." },
  ];
  const categories = ["all", ...Array.from(new Set(faqs.map((faq) => faq.category)))];
  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  const toggleFAQ = (index: number, faq: FAQItem) => {
    const nextIndex = openIndex === index ? null : index;
    setOpenIndex(nextIndex);
    logEvent(EVENT_TYPES.HELP_FAQ_TOGGLED, { question: faq.question, category: faq.category, opened: nextIndex === index });
  };
  const helpSections = [
    { icon: <BookOpen className="w-5 h-5" />, title: "Guides & Tutorials", description: "Step-by-step guides to get the most out of AutoDining.", link: "#" },
    { icon: <MessageCircle className="w-5 h-5" />, title: "Live Chat", description: "Chat with our support team in real-time.", link: "#" },
    { icon: <HelpCircle className="w-5 h-5" />, title: "Community Forum", description: "Connect with other users and share tips.", link: "#" },
    { icon: <Calendar className="w-5 h-5" />, title: "Video Tutorials", description: "Watch video guides for all features.", link: "#" },
  ];
  useEffect(() => {
    logEvent(EVENT_TYPES.HELP_PAGE_VIEW, { seed, fromSeedParam: hasSeedParam });
  }, [seed, hasSeedParam]);
  return (
    dyn.v1.addWrapDecoy("help-page", (
      <main className="min-h-screen bg-background" id={dyn.v3.getVariant("help-page", ID_VARIANTS_MAP, "help-page")}>
        <Navbar />
        {dyn.v1.addWrapDecoy("help-content", (
          <div id={dyn.v3.getVariant("help-content", ID_VARIANTS_MAP, "help-content")}>
        {/* Hero */}
        {dyn.v1.addWrapDecoy("help-hero", (
          <div className="relative overflow-hidden py-24 px-6" id={dyn.v3.getVariant("help-hero", ID_VARIANTS_MAP, "help-hero")}>
            <div className="absolute top-10 left-1/3 w-72 h-72 bg-amber-500/5 rounded-full blur-[100px]" />
            <div className="max-w-4xl mx-auto text-center relative z-10">
              <p className="uppercase tracking-[0.5em] text-[11px] font-semibold text-amber-500 mb-4">Support center</p>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-5 tracking-tight" id={dyn.v3.getVariant("help-title", ID_VARIANTS_MAP, "help-title")}>
                {dyn.v3.getVariant("help_center", TEXT_VARIANTS_MAP, "How can we help you?")}
              </h1>
              <p className="text-lg text-white/40 max-w-2xl mx-auto leading-relaxed" id={dyn.v3.getVariant("help-subtitle", ID_VARIANTS_MAP, "help-subtitle")}>
                {dyn.v3.getVariant("help_description", TEXT_VARIANTS_MAP, "Find answers to common questions or get in touch with our support team. We're here to help make your dining experience seamless.")}
              </p>
            </div>
          </div>
        ), "help-hero-wrap")}
        <div className="max-w-5xl mx-auto px-6 pb-20">
          {/* Search */}
          {dyn.v1.addWrapDecoy("help-search-section", (
            <section className="mb-12" id={dyn.v3.getVariant("help-search-section", ID_VARIANTS_MAP, "help-search-section")}>
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/30 w-4 h-4" />
                <input
                  type="text"
                  id={dyn.v3.getVariant("search-input-help", ID_VARIANTS_MAP, "search-input-help")}
                  placeholder={dyn.v3.getVariant("search_help_placeholder", TEXT_VARIANTS_MAP, "Search for help...")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                  dyn.v3.getVariant("input-text", CLASS_VARIANTS_MAP, "input-text"),
                  "w-full pl-11 pr-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-2xl text-white placeholder-white/25 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 outline-none text-sm"
                )}
                />
              </div>
            </section>
          ), "help-search-section-wrap")}
          {/* Help Sections Grid */}
          {dyn.v1.addWrapDecoy("help-sections-grid", (
            <section className="mb-12" id={dyn.v3.getVariant("help-sections-grid", ID_VARIANTS_MAP, "help-sections-grid")}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {helpSections.map((section, index) => (
                  dyn.v1.addWrapDecoy(`help-section-${index}`, (
                    <a
                      key={section.link}
                      href={section.link}
                      id={dyn.v3.getVariant(`help-section-${index === 0 ? "guides" : index === 1 ? "chat" : index === 2 ? "forum" : "videos"}`, ID_VARIANTS_MAP, `help-section-${index}`)}
                      className={cn(dyn.v3.getVariant("card", CLASS_VARIANTS_MAP, "card"), "glass rounded-2xl p-5 card-lift text-center cursor-default")}
                    >
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-3">
                        {section.icon}
                      </div>
                      <h3 className={cn(dyn.v3.getVariant("card-title", CLASS_VARIANTS_MAP, "card-title"), "text-sm font-semibold text-white mb-1")}>
                        {section.title}
                      </h3>
                      <p className="text-white/35 text-xs leading-relaxed">{section.description}</p>
                    </a>
                  ), `help-section-wrap-${index}`)
                ))}
              </div>
            </section>
          ), "help-sections-grid-wrap")}
          {/* Category Filters */}
          {dyn.v1.addWrapDecoy("help-category-filters", (
            <section className="mb-8" id={dyn.v3.getVariant("help-category-filters", ID_VARIANTS_MAP, "help-category-filters")}>
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map((category) => {
                  const categoryKey = category.toLowerCase().replace(/\s+/g, "-");
                  const categoryTextKey = category.toLowerCase().replace(/\s+/g, "_");
                  return dyn.v1.addWrapDecoy(`help-category-${category}`, (
                    <button
                      key={category}
                      onClick={() => { setSelectedCategory(category); logEvent(EVENT_TYPES.HELP_CATEGORY_SELECTED, { category, seed }); }}
                      id={dyn.v3.getVariant(`help-category-${categoryKey}`, ID_VARIANTS_MAP, `help-category-${categoryKey}`)}
                      className={cn(
                        dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "button-secondary"),
                        "px-4 py-1.5 rounded-full text-[12px] font-medium transition-all",
                        selectedCategory === category
                          ? "bg-amber-500 text-black"
                          : "bg-white/[0.04] text-white/50 border border-white/[0.08] hover:bg-white/[0.08] hover:text-white/70"
                      )}
                    >
                      {category === "all"
                        ? dyn.v3.getVariant("all", TEXT_VARIANTS_MAP, "All")
                        : dyn.v3.getVariant(`help_category_${categoryTextKey}`, TEXT_VARIANTS_MAP, category.charAt(0).toUpperCase() + category.slice(1))}
                    </button>
                  ), `help-category-wrap-${category}`);
                })}
              </div>
            </section>
          ), "help-category-filters-wrap")}
          {/* FAQ Section */}
          {dyn.v1.addWrapDecoy("help-faq-section", (
            <section className="mb-14" id={dyn.v3.getVariant("help-faq-section", ID_VARIANTS_MAP, "help-faq-section")}>
              <h2 className="text-2xl font-bold text-white mb-6 text-center tracking-tight" id={dyn.v3.getVariant("faq-section-title", ID_VARIANTS_MAP, "faq-section-title")}>
                {dyn.v3.getVariant("frequently_asked_questions", TEXT_VARIANTS_MAP, "Frequently Asked Questions")}
              </h2>
              <div className="space-y-3 max-w-3xl mx-auto">
                {filteredFAQs.map((faq, index) => (
                  dyn.v1.addWrapDecoy(`faq-item-${index}`, (
                    <div
                      key={faq.question}
                      id={dyn.v3.getVariant(`faq-item-${index}`, ID_VARIANTS_MAP, `faq-item-${index}`)}
                      className="glass rounded-2xl overflow-hidden transition-all duration-300 hover:bg-white/[0.06]"
                    >
                      <button
                        onClick={() => toggleFAQ(index, faq)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left transition-colors"
                      >
                        <div className="flex-1">
                          <span className="text-[10px] font-semibold text-amber-500 uppercase tracking-wider mr-2">{faq.category}</span>
                          <span className="text-sm font-semibold text-white" id={dyn.v3.getVariant(`faq-question-${index}`, ID_VARIANTS_MAP, `faq-question-${index}`)}>{faq.question}</span>
                        </div>
                        {openIndex === index
                          ? <ChevronUp className="w-4 h-4 text-amber-500 flex-shrink-0 ml-4" />
                          : <ChevronDown className="w-4 h-4 text-white/30 flex-shrink-0 ml-4" />}
                      </button>
                      {openIndex === index && (
                        <div className="px-6 pb-5 pt-0">
                          <div className="border-l-2 border-amber-500/50 pl-4">
                            <p className="text-white/40 text-sm leading-relaxed" id={dyn.v3.getVariant(`faq-answer-${index}`, ID_VARIANTS_MAP, `faq-answer-${index}`)}>{faq.answer}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ), `faq-item-wrap-${index}`)
                ))}
              </div>
              {filteredFAQs.length === 0 && (
                <div className="text-center py-12"><p className="text-white/30 text-sm">No results found. Try adjusting your search or category filter.</p></div>
              )}
            </section>
          ), "help-faq-section-wrap")}
          {/* CTA */}
          {dyn.v1.addWrapDecoy("help-cta-section", (
            <section id={dyn.v3.getVariant("help-cta-section", ID_VARIANTS_MAP, "help-cta-section")}>
              <div className="relative overflow-hidden rounded-3xl p-10 md:p-12 text-center">
                <div className="absolute inset-0 animated-gradient" />
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10" />
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold text-white mb-3 tracking-tight" id={dyn.v3.getVariant("still-need-help-title", ID_VARIANTS_MAP, "still-need-help-title")}>
                    {dyn.v3.getVariant("still_need_help", TEXT_VARIANTS_MAP, "Still need help?")}
                  </h2>
                  <p className="text-white/40 mb-6" id={dyn.v3.getVariant("still-need-help-description", ID_VARIANTS_MAP, "still-need-help-description")}>
                    {dyn.v3.getVariant("still_need_help_description", TEXT_VARIANTS_MAP, "Can't find what you're looking for? Our support team is ready to assist you.")}
                  </p>
                  {dyn.v1.addWrapDecoy("contact-support-button", (
                    <a
                      href="/contact"
                      className={cn(dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, "button-primary"), "inline-block bg-amber-500 text-black px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-amber-400 transition-all hover:shadow-lg hover:shadow-amber-500/20")}
                      id={dyn.v3.getVariant("contact-support-button", ID_VARIANTS_MAP, "contact-support-button")}
                    >
                      {dyn.v3.getVariant("contact_support", TEXT_VARIANTS_MAP, "Contact Support")}
                    </a>
                  ), "contact-support-button-wrap")}
                </div>
              </div>
            </section>
          ), "help-cta-section-wrap")}
        </div>
        </div>
        ), "help-content-wrap")}
      </main>
    ), "help-page-wrap")
  );
}
