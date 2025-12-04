"use client";

import { DynamicText } from "@/components/ui/DynamicText";
import { DynamicSection } from "@/components/ui/DynamicBlock";
import { ContactSection } from "@/components/contact/ContactSection";

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl space-y-6 px-6 py-10 text-white">
      <DynamicSection className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-6" variantKey="about-intro">
        <DynamicText as="h1" className="text-3xl font-semibold" variantKey="about-title">
          About Autocinema
        </DynamicText>
        <DynamicText className="text-sm text-white/70" variantKey="about-copy">
          Autocinema is a seed-driven movie sandbox. Data comes from the datasets service and all UI variations are deterministic from the seed, so every miner sees the same structure for the same seed.
        </DynamicText>
        <DynamicText className="text-sm text-white/70" variantKey="about-copy">
          The site runs without a traditional backend—actions are forwarded to the API endpoint configured via `NEXT_PUBLIC_API_URL`.
        </DynamicText>
      </DynamicSection>
      <ContactSection />
    </main>
  );
}
