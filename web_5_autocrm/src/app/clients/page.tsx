"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Filter, ChevronRight, Search } from "lucide-react";
import { EVENT_TYPES, logEvent } from "@/library/events";

const clients = [
  { id: "CL-101", name: "Smith & Co.", email: "team@smithco.com", matters: 3, avatar: "", status: "Active", last: "3d ago" },
  { id: "CL-098", name: "Jessica Brown", email: "jbrown@samplemail.com", matters: 1, avatar: "", status: "Active", last: "5d ago" },
  { id: "CL-092", name: "Acme Biotech", email: "legal@acmebio.com", matters: 2, avatar: "", status: "On Hold", last: "2w ago" },
  { id: "CL-086", name: "Peak Ventures", email: "peak@ventures.com", matters: 4, avatar: "", status: "Active", last: "1mo ago" },
  { id: "CL-102", name: "Henderson LLP", email: "contact@hendersonllp.com", matters: 2, avatar: "", status: "Active", last: "2d ago" },
  { id: "CL-103", name: "Kumar & Associates", email: "info@kumarassoc.in", matters: 5, avatar: "", status: "Active", last: "1w ago" },
  { id: "CL-104", name: "Olivia Martinez", email: "omartinez@clientmail.com", matters: 1, avatar: "", status: "Active", last: "6d ago" },
  { id: "CL-105", name: "TechNova Inc.", email: "contact@technova.io", matters: 3, avatar: "", status: "On Hold", last: "3w ago" },
  { id: "CL-106", name: "Liam O'Reilly", email: "liam.oreilly@mail.com", matters: 2, avatar: "", status: "Active", last: "1d ago" },
  { id: "CL-107", name: "Chen Legal Group", email: "support@chenlegal.cn", matters: 4, avatar: "", status: "Active", last: "4d ago" },
  { id: "CL-108", name: "BrightMind Ltd.", email: "hello@brightmind.org", matters: 3, avatar: "", status: "On Hold", last: "5d ago" },
  { id: "CL-109", name: "Zara Sheikh", email: "zsheikh@clients.com", matters: 1, avatar: "", status: "Active", last: "1w ago" },
  { id: "CL-110", name: "Al-Madina Textiles", email: "legal@almadina.pk", matters: 6, avatar: "", status: "Active", last: "2mo ago" },
  { id: "CL-111", name: "Nova Enterprises", email: "legal@novaent.biz", matters: 2, avatar: "", status: "On Hold", last: "3w ago" },
  { id: "CL-112", name: "Grace Consulting", email: "contact@graceconsult.com", matters: 1, avatar: "", status: "Active", last: "1w ago" },
  { id: "CL-113", name: "Mohammed Anwar", email: "manwar@outlook.com", matters: 1, avatar: "", status: "Active", last: "2d ago" },
  { id: "CL-114", name: "Sunrise Partners", email: "team@sunrisepartners.org", matters: 3, avatar: "", status: "On Hold", last: "4w ago" },
  { id: "CL-115", name: "GreenLeaf Holdings", email: "greenleaf@corp.com", matters: 4, avatar: "", status: "Active", last: "3d ago" },
  { id: "CL-116", name: "David Thompson", email: "david.thompson@gmail.com", matters: 2, avatar: "", status: "Active", last: "5d ago" },
  { id: "CL-117", name: "Yuki Tanaka", email: "yuki@tanakalegal.jp", matters: 2, avatar: "", status: "Active", last: "1mo ago" },
  { id: "CL-118", name: "Skyline Architects", email: "support@skyarch.com", matters: 3, avatar: "", status: "On Hold", last: "2w ago" },
  { id: "CL-119", name: "Fatima Noor", email: "fnoor@clients.org", matters: 1, avatar: "", status: "Active", last: "6d ago" },
  { id: "CL-120", name: "Visionary Lab", email: "info@visionarylab.net", matters: 5, avatar: "", status: "Active", last: "4d ago" },
  { id: "CL-121", name: "Eleanor White", email: "e.white@mail.com", matters: 2, avatar: "", status: "Active", last: "3w ago" },
  { id: "CL-122", name: "EcoBuild Solutions", email: "contact@ecobuild.com", matters: 1, avatar: "", status: "On Hold", last: "1mo ago" },
  { id: "CL-123", name: "Carlos Rivera", email: "crivera@legal.com", matters: 1, avatar: "", status: "Active", last: "2d ago" },
  { id: "CL-124", name: "Global Reach Inc.", email: "hello@globalreach.co", matters: 4, avatar: "", status: "Active", last: "1w ago" },
  { id: "CL-125", name: "Jin Park", email: "jinp@clients.kr", matters: 2, avatar: "", status: "On Hold", last: "3w ago" },
  { id: "CL-126", name: "Aurora Media", email: "contact@auroramedia.tv", matters: 3, avatar: "", status: "Active", last: "5d ago" },
  { id: "CL-127", name: "Trinity Pharma", email: "legal@trinitypharma.com", matters: 4, avatar: "", status: "Active", last: "2w ago" },
  { id: "CL-128", name: "George Maxwell", email: "gmaxwell@corpmail.com", matters: 1, avatar: "", status: "Active", last: "4d ago" },
  { id: "CL-129", name: "NextGen Realty", email: "nextgen@realty.org", matters: 3, avatar: "", status: "On Hold", last: "1mo ago" },
  { id: "CL-130", name: "Rebecca Clark", email: "rebecca.c@clients.com", matters: 1, avatar: "", status: "Active", last: "6d ago" },
  { id: "CL-131", name: "Gulf Horizons", email: "legal@gulfhorizons.com", matters: 2, avatar: "", status: "Active", last: "1w ago" },
  { id: "CL-132", name: "Starlight Finance", email: "support@starlightfinance.org", matters: 3, avatar: "", status: "Active", last: "2d ago" },
  { id: "CL-133", name: "Anastasia Romanov", email: "aromanov@legalmail.ru", matters: 1, avatar: "", status: "Active", last: "2w ago" },
  { id: "CL-134", name: "Quantum Engineering", email: "legal@quantumeng.tech", matters: 4, avatar: "", status: "On Hold", last: "3w ago" },
  { id: "CL-135", name: "Nina Patel", email: "npatel@clients.org", matters: 2, avatar: "", status: "Active", last: "1mo ago" },
  { id: "CL-136", name: "Bravo Security", email: "contact@bravosec.com", matters: 2, avatar: "", status: "Active", last: "5d ago" },
  { id: "CL-137", name: "Jade Harper", email: "jade.harper@mail.com", matters: 1, avatar: "", status: "Active", last: "4d ago" },
  { id: "CL-138", name: "Arctic Tech", email: "team@arctictech.com", matters: 3, avatar: "", status: "On Hold", last: "2w ago" },
  { id: "CL-139", name: "Theodore Lee", email: "tlee@clientmail.com", matters: 2, avatar: "", status: "Active", last: "3d ago" },
  { id: "CL-140", name: "Ravi Gupta", email: "rgupta@clients.com", matters: 1, avatar: "", status: "Active", last: "6d ago" },
  { id: "CL-141", name: "Meera Shah", email: "meera@shahlegal.in", matters: 2, avatar: "", status: "Active", last: "1w ago" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export default function ClientsDirectory() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (query.trim()) {
      logEvent(EVENT_TYPES.SEARCH_CLIENT, { query });
    }
  }, [query]);

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.email.toLowerCase().includes(query.toLowerCase())
  );

  const handleClientClick = (client: (typeof clients)[number]) => {
    logEvent(EVENT_TYPES.VIEW_CLIENT_DETAILS, client);
    router.push(`/clients/${client.id}`);
  };

  return (
    <section>
      <h1 className="text-3xl md:text-[2.25rem] font-extrabold mb-10 tracking-tight">
        Clients Directory
      </h1>
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-0 mb-10">
        <div className="w-full md:w-96 relative">
          <span className="absolute left-4 top-3.5 text-zinc-400 pointer-events-none">
            <Search className="w-5 h-5" />
          </span>
          <input
            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-neutral-bg-dark border border-zinc-200 text-md focus:outline-accent-forest focus:border-accent-forest placeholder-zinc-400 font-medium"
            placeholder="Search clients..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search clients"
          />
        </div>
        <button className="flex-shrink-0 flex items-center gap-2 px-5 h-12 ml-0 md:ml-4 font-medium rounded-2xl bg-white border border-zinc-200 text-zinc-700 shadow-sm hover:bg-zinc-50 transition">
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>
      <div className="rounded-2xl bg-white shadow-card border border-zinc-100">
        <div
          className="hidden md:grid grid-cols-7 px-10 pt-6 pb-2 text-zinc-500 text-xs uppercase tracking-wide select-none"
          style={{ letterSpacing: "0.08em" }}
        >
          <span className="col-span-3">Client</span>
          <span className="">Matters</span>
          <span className="">Status</span>
          <span className="">Last Updated</span>
          <span className=""></span>
        </div>
        <div className="flex flex-col divide-y divide-zinc-100">
          {filtered.length === 0 && (
            <div className="py-12 px-6 text-zinc-400 text-base text-center">
              No clients found.
            </div>
          )}
          {filtered.map((c) => (
            <div
              key={c.id}
              onClick={() => handleClientClick(c)}
              className="group flex flex-col md:grid md:grid-cols-7 items-center px-5 py-3 md:px-10 md:py-4 gap-3 md:gap-0 hover:bg-accent-forest/5 transition cursor-pointer"
            >
              <div className="col-span-3 flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 bg-accent-forest/10 flex items-center justify-center rounded-full text-accent-forest font-bold text-xl">
                  <User className="w-5 h-5 md:hidden text-accent-forest" />
                  <span className="hidden md:block">{getInitials(c.name)}</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-zinc-800 truncate leading-tight">
                    {c.name}
                  </span>
                  <span className="text-xs text-zinc-400 truncate">
                    {c.email}
                  </span>
                </div>
              </div>
              <div className="text-zinc-700 font-medium">{c.matters}</div>
              <div>
                <span
                  className={`inline-flex px-3 py-1 rounded-2xl text-xs font-semibold ${
                    c.status === "Active"
                      ? "bg-accent-forest/10 text-accent-forest"
                      : "bg-zinc-200 text-zinc-500"
                  }`}
                >
                  {c.status}
                </span>
              </div>
              <div className="text-zinc-500">{c.last}</div>
              <div className="ml-auto">
                <ChevronRight className="w-6 h-6 text-zinc-300 group-hover:text-accent-forest transition" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
