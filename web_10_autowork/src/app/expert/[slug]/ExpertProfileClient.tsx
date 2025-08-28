"use client";

import { useSeedLayout } from "@/library/useSeedLayout";
import { experts } from "@/library/dataset";

interface Expert {
  name: string;
  slug: string;
  role: string;
  country: string;
  avatar: string;
  about: string;
  stats: {
    earnings: string;
    jobs: number;
    hours: number;
  };
  lastReview: {
    title: string;
    dates: string;
    text: string;
    price: string;
    rate: string;
    time: string;
  };
  hoursPerWeek: string;
  languages: string[];
}

export default function ExpertProfileClient({ expert }: { expert: Expert }) {
  const { layout } = useSeedLayout();

  // Create section components
  const ProfileSection = () => (
    <div className="flex items-center gap-4 mb-6">
      <img
        src={expert.avatar}
        alt={expert.name}
        className="w-20 h-20 rounded-full object-cover border border-[#cad2d0] shadow"
      />
      <div>
        <h1 className="text-3xl font-bold text-[#253037]">{expert.name}</h1>
        <div className="text-[#4a545b] flex items-center gap-2 text-[16px] font-medium mt-2">
          <svg
            className="inline-block mr-1"
            width={20}
            height={20}
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="#08b4ce"
              strokeWidth="2"
            />
            <circle
              cx="12"
              cy="10"
              r="3"
              stroke="#08b4ce"
              strokeWidth="2"
            />
            <path
              d="M12 13c-3.314 0-6 1.567-6 3v.5A2.5 2.5 0 0 0 8.5 19h7a2.5 2.5 0 0 0 2.5-2.5V16c0-1.433-2.686-3-6-3Z"
              stroke="#08b4ce"
              strokeWidth="2"
            />
          </svg>
          {expert.country}{" "}
          <span className="text-gray-400">– 1:24 pm local time</span>
        </div>
      </div>
      <div className="ml-auto flex gap-2">
        <button className="w-12 h-12 rounded-full bg-white border border-[#08b4ce] flex items-center justify-center text-2xl text-[#08b4ce] hover:bg-[#e6f9fb]">
          …
        </button>
        <button className="px-8 py-2 rounded-full bg-[#1fc12c] text-white text-lg font-semibold shadow-sm ml-1 text-center flex items-center justify-center">
          Hire
        </button>
        <button className="px-7 py-2 rounded-full border-2 border-[#08b4ce] text-[#08b4ce] bg-white text-lg ml-1 font-semibold hover:bg-[#e6f9fb]">
          Message
        </button>
        <button className="w-12 h-12 rounded-full border border-green-700 flex items-center justify-center text-2xl text-green-700 ml-1">
          ♡
        </button>
      </div>
    </div>
  );

  const StatsSection = () => (
    <div className="grid grid-cols-3 md:gap-8 bg-[#fafcff] rounded-xl border border-gray-100 py-3 px-2 text-center mb-5">
      <div>
        <div className="text-lg font-bold text-[#253037]">
          {expert.stats.earnings}
        </div>
        <div className="text-xs text-gray-500 mt-1">Total earnings</div>
      </div>
      <div>
        <div className="text-lg font-bold text-[#253037]">
          {expert.stats.jobs}
        </div>
        <div className="text-xs text-gray-500 mt-1">Total jobs</div>
      </div>
      <div>
        <div className="text-lg font-bold text-[#253037]">
          {expert.stats.hours}
        </div>
        <div className="text-xs text-gray-500 mt-1">Total hours</div>
      </div>
    </div>
  );

  const AboutSection = () => (
    <div className="mb-4">
      <h2 className="font-bold text-xl text-[#253037] mb-1">
        {expert.role}
      </h2>
      <p className="text-gray-700 text-base mb-2">{expert.about}</p>
    </div>
  );

  const ReviewsSection = () => (
    <div className="bg-[#f6fff7] border border-[#dbf6e6] rounded-xl py-5 px-6 flex flex-col gap-2">
      <div className="text-[#27ab43] font-bold text-lg mb-1">
        {expert.lastReview.title}
      </div>
      <div className="flex items-center gap-3 mb-1">
        <span className="flex text-[#ebcf95] text-lg">{"★★★★★"}</span>
        <span className="text-[#199225] ml-2 font-semibold">5</span>
        <span className="text-gray-500 ml-2 text-sm">
          {expert.lastReview.dates}
        </span>
      </div>
      <div className="mb-2 text-base text-[#253037]">
        {expert.lastReview.text}
      </div>
      <div className="flex gap-6 text-[#555] text-sm mt-2">
        <div>
          <span className="font-semibold">
            {expert.lastReview.price}
          </span>
        </div>
        <div>
          <span className="font-semibold">
            {expert.lastReview.rate}
          </span>
        </div>
        <div>
          <span className="font-semibold">
            {expert.lastReview.time}
          </span>
        </div>
      </div>
    </div>
  );

  const SidebarSection = () => (
    <div className="md:w-60 flex flex-col gap-7">
      <div className="bg-[#fafcff] border border-gray-100 rounded-xl p-4">
        <div className="font-semibold text-md mb-2 text-[#253037]">
          Hours per week
        </div>
        <div className="text-gray-600">{expert.hoursPerWeek}</div>
      </div>
      <div className="bg-[#fafcff] border border-gray-100 rounded-xl p-4">
        <div className="font-semibold text-md mb-2 text-[#253037]">
          Languages
        </div>
        {expert.languages.map((lng) => (
          <div key={lng} className="text-gray-600">
            {lng}
          </div>
        ))}
      </div>
      <div className="bg-[#fafcff] border border-gray-100 rounded-xl p-4">
        <div className="font-semibold text-md mb-2 text-[#253037]">
          Verifications
        </div>
        <div className="text-gray-600">
          Verified as full-stack developer
        </div>
      </div>
    </div>
  );

  // Create section map for dynamic ordering
  const sectionMap = {
    profile: <ProfileSection key="profile" />,
    stats: <StatsSection key="stats" />,
    about: <AboutSection key="about" />,
    reviews: <ReviewsSection key="reviews" />,
    sidebar: <SidebarSection key="sidebar" />,
  };

  // Render sections in the order specified by layout
  const renderSections = () => {
    return layout.expertSections.map((sectionKey) => {
      return sectionMap[sectionKey as keyof typeof sectionMap];
    });
  };

  return (
    <main className="max-w-6xl mx-auto px-5 py-5">
      <div className="bg-white rounded-2xl shadow border border-gray-100 p-8 flex flex-col gap-5">
        {renderSections()}
      </div>
    </main>
  );
} 