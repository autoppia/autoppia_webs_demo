"use client";

import { useSeed } from "@/context/SeedContext";
import Navbar from "@/components/Navbar";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { SeedLink } from "@/components/ui/SeedLink";

interface FAQItem { question: string; answer: string; }

export default function FaqsPage() {
  const { seed } = useSeed();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const faqs: FAQItem[] = [
    { question: "How do I make a reservation?", answer: "Browse our restaurant listings, select a restaurant, choose your preferred date and time, specify the number of guests, and complete the booking. You'll receive a confirmation email with all the details." },
    { question: "Can I cancel my reservation?", answer: "Yes, you can cancel your reservation up to 24 hours before your booking time. Check your confirmation email for details on how to cancel, or visit 'My Reservations' in your account." },
    { question: "Is there a booking fee?", answer: "No, our service is completely free. We don't charge any booking fees to our customers. The only charges you'll see are from the restaurant itself for your meal." },
    { question: "Do I pay through AutoDining?", answer: "No, payment is handled directly by the restaurant. You'll pay for your meal at the restaurant when you dine. We simply facilitate the reservation process." },
    { question: "How do I modify my reservation?", answer: "You can modify your reservation by accessing your booking history. Click on 'My Reservations' in your account, select the booking you want to modify, and make the necessary changes. Note that modifications depend on restaurant availability." },
    { question: "What happens if I'm running late?", answer: "We recommend calling the restaurant directly if you're running late. Most restaurants will hold your table for 15-20 minutes. If you're significantly delayed, contact the restaurant to see if they can still accommodate you." },
    { question: "Can I make a reservation for a large group?", answer: "Yes! When making a reservation, you can specify the number of guests. For large groups (typically 8+ people), we recommend calling the restaurant directly to ensure they can accommodate your party." },
    { question: "How do I leave a review?", answer: "After dining at a restaurant, you can leave a review and rating. Visit the restaurant's page and click on 'Write a Review'. Your feedback helps other diners make informed decisions." },
    { question: "I didn't receive a confirmation email", answer: "Check your spam or junk folder. If you still don't see it, verify that the email address in your account is correct. You can also view your reservations directly in your account dashboard." },
    { question: "How are restaurants selected?", answer: "We carefully curate our restaurant listings based on quality, customer reviews, and dining experience. All restaurants go through a vetting process to ensure they meet our standards." },
  ];
  const toggleFAQ = (index: number) => { setOpenIndex(openIndex === index ? null : index); };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="relative overflow-hidden py-24 px-6">
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-amber-500/5 rounded-full blur-[100px]" />
        <div className="max-w-3xl mx-auto relative z-10">
          <p className="uppercase tracking-[0.5em] text-[11px] font-semibold text-amber-500 mb-4">Support</p>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-5 tracking-tight">Frequently Asked Questions</h1>
          <p className="text-lg text-white/40 leading-relaxed">Find quick answers to the most common questions about AutoDining. Can't find what you're looking for? <SeedLink href="/help" className="text-amber-500 hover:text-amber-400 underline underline-offset-4 decoration-amber-500/30">Visit our Help Center</SeedLink> or <SeedLink href="/contact" className="text-amber-500 hover:text-amber-400 underline underline-offset-4 decoration-amber-500/30">contact our support team</SeedLink>.</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-6 pb-20">
        <div className="mb-14 space-y-3">
          {faqs.map((faq, index) => (
            <div key={faq.question} className="glass rounded-2xl overflow-hidden transition-all duration-300 hover:bg-white/[0.06] opacity-0 animate-fade-in-up" style={{ animationDelay: `${index * 50}ms`, animationFillMode: "forwards" }}>
              <button onClick={() => toggleFAQ(index)} className="w-full px-6 py-5 flex items-center justify-between text-left transition-colors">
                <span className="text-sm font-semibold text-white pr-8">{faq.question}</span>
                {openIndex === index ? <ChevronUp className="w-4 h-4 text-amber-500 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-white/30 flex-shrink-0" />}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5 pt-0">
                  <div className="border-l-2 border-amber-500/50 pl-4">
                    <p className="text-white/40 text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="relative overflow-hidden rounded-3xl p-10 md:p-12 text-center">
          <div className="absolute inset-0 animated-gradient" />
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10" />
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">Still have questions?</h2>
            <p className="text-white/40 mb-6">Our support team is here to help! Get in touch and we'll respond as soon as possible.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <SeedLink href="/help" className="inline-block bg-amber-500 text-black px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-amber-400 transition-all hover:shadow-lg hover:shadow-amber-500/20">Visit Help Center</SeedLink>
              <SeedLink href="/contact" className="inline-block bg-white/10 border border-white/10 text-white px-6 py-2.5 rounded-full font-medium text-sm hover:bg-white/15 transition-all">Contact Support</SeedLink>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
