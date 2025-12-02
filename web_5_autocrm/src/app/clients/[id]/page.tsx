"use client";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { User, Mail, CheckCircle, FileText, Briefcase, Calendar, ChevronRight, Phone } from 'lucide-react';
import { EVENT_TYPES, logEvent } from "@/library/events";
import { clients as STATIC_CLIENTS } from '@/library/dataset';
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { useSeed } from "@/context/SeedContext";
import { useProjectData } from "@/shared/universal-loader";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}
type Client = {
  id: string;
  name: string;
  email: string;
  matters: number;
  avatar: string;
  status: string;
  last: string;
  phone?: string;
};

const STORAGE_KEY_PREFIX = "clients";

const normalizeClient = (client: any, index: number): Client => ({
  id: client?.id ?? `CL-${1000 + index}`,
  name: client?.name ?? client?.title ?? `Client ${index + 1}`,
  email: client?.email ?? `client${index + 1}@example.com`,
  matters:
    typeof client?.matters === "number"
      ? client.matters
      : Math.floor(Math.random() * 5) + 1,
  avatar: client?.avatar ?? "",
  status: client?.status ?? "Active",
  last: client?.last ?? "Today",
  phone: client?.phone,
});

function ClientProfilePageContent() {
  const [client, setClient] = useState<Client | null>(null);
  const [isResolving, setIsResolving] = useState(true);
  const params = useParams();
  const clientId = params?.id as string;
  const seedRouter = useSeedRouter();
  const searchParams = useSearchParams();
  const { resolvedSeeds } = useSeed();
  const v2Seed = resolvedSeeds.v2 ?? resolvedSeeds.base;
  const storageKey = useMemo(
    () => `${STORAGE_KEY_PREFIX}_${v2Seed ?? "default"}`,
    [v2Seed]
  );

  const { data } = useProjectData<any>({
    projectKey: "web_5_autocrm",
    entityType: "clients",
    generateCount: 60,
    version: "v1",
    fallback: () => STATIC_CLIENTS,
    seedValue: v2Seed ?? undefined,
  });

  const baseClients = useMemo(() => {
    const normalizedApi = (data || []).map((c: any, idx: number) =>
      normalizeClient(c, idx)
    );
    if (normalizedApi.length > 0) return normalizedApi;
    return STATIC_CLIENTS.map((c, idx) => normalizeClient(c, idx));
  }, [data]);

  useEffect(() => {
    if (!clientId) return;
    if (baseClients.length === 0) return;

    setIsResolving(true);
    let source = baseClients;

    if (typeof window !== "undefined") {
      const cached = window.localStorage.getItem(storageKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            source = parsed;
          }
        } catch (error) {
          console.warn("[ClientDetail] Failed to parse cached clients", error);
        }
      } else {
        window.localStorage.setItem(storageKey, JSON.stringify(baseClients));
      }
    }

    const found =
      source.find((c) => c.id === clientId) ??
      baseClients.find((c) => c.id === clientId) ??
      null;

    if (found) {
      setClient(found);
      logEvent(EVENT_TYPES.VIEW_CLIENT_DETAILS, found);
    } else {
      console.warn(`Client with ID ${clientId} not found.`);
      setClient(null);
    }
    setIsResolving(false);
  }, [clientId, baseClients, storageKey]);

  const matters = [
    { id: 'MAT-113', name: 'Estate Plan Review', status: 'Active' },
    { id: 'MAT-099', name: 'Business Agreement', status: 'Closed' },
    { id: 'MAT-105', name: 'Patent Application', status: 'Active' },
  ];
  const activity = [
    { label: 'Matter updated', date: 'Today, 10:12am', icon: <Briefcase className="w-4 h-4" /> },
    { label: 'Emailed document', date: 'Yesterday', icon: <Mail className="w-4 h-4" /> },
    { label: 'Signed contract', date: 'Last week', icon: <CheckCircle className="w-4 h-4 text-accent-forest" /> },
    { label: 'Client meeting', date: '2 weeks ago', icon: <Calendar className="w-4 h-4" /> },
  ];

  if (isResolving) {
    return (
      <section className="flex justify-center items-center h-screen">
        <p className="text-zinc-500">Loading client details...</p>
      </section>
    );
  }

  if (!client) {
    return (
      <section className="flex justify-center items-center h-screen">
        <p className="text-zinc-500">
          Client {clientId ? `(${clientId}) ` : ""}not found
        </p>
      </section>
    );
  }

  return (
    <section className="max-w-4xl mx-auto flex flex-col gap-10 px-4 md:px-0"> {/* Added padding for responsiveness */}
      {/* Profile Card */}
      <div
        id="client-profile-card"
        className="rounded-2xl bg-white shadow-card p-8 flex flex-col md:flex-row items-center md:items-start gap-7 border border-zinc-100"
      >
        {client.avatar ? (
          <img
            id={`client-avatar-${client.id}`}
            src={client.avatar}
            alt={`${client.name} avatar`}
            className="w-20 h-20 rounded-full object-cover border border-zinc-200"
          />
        ) : (
          <div
            id={`client-avatar-${client.id}`}
            className="w-20 h-20 rounded-full bg-accent-forest/10 flex items-center justify-center text-accent-forest text-4xl font-bold"
          >
            <span className="hidden md:block">{getInitials(client.name)}</span>
            <User className="w-9 h-9 md:hidden" />
          </div>
        )}
        <div className="flex flex-col gap-2 flex-1 min-w-0 text-center md:text-left">
          <span
            id={`client-name-${client.id}`}
            className="font-bold text-xl text-[#1A1A1A] truncate"
          >
            {client.name}
          </span>
          <span
            id={`client-email-${client.id}`}
            className="text-zinc-500 flex items-center justify-center md:justify-start gap-2 text-sm"
          >
            <Mail className="w-4 h-4" />{client.email}
          </span>
          {client.phone && (
            <span
              id={`client-phone-${client.id}`}
              className="text-zinc-500 flex items-center justify-center md:justify-start gap-2 text-sm"
            >
              <Phone className="w-4 h-4" />{client.phone}
            </span>
          )}
          <div className="flex flex-wrap gap-3 mt-2 items-center justify-center md:justify-start">
            <span
              id={`client-status-${client.id}`}
              className={`px-3 py-1 rounded-2xl text-xs font-semibold ${
                client.status === "Active"
                  ? "bg-accent-forest/10 text-accent-forest"
                  : "bg-zinc-200 text-zinc-500"
              }`}
            >
              {client.status}
            </span>
            <span
              id={`client-id-display-${client.id}`}
              className="text-xs text-zinc-400 font-mono"
            >
              {client.id}
            </span>
          </div>
        </div>
      </div>

      {/* Timeline + Related matters row */}
      <div id="client-content-sections" className="flex flex-col lg:flex-row gap-10">
        {/* Timeline */}
        <section
          id="activity-timeline-section"
          className="flex-1 min-w-0 rounded-2xl bg-white shadow-card p-6 md:p-8 border border-zinc-100"
        >
          <h2
            id="activity-timeline-heading"
            className="font-semibold text-lg mb-5"
          >
            Activity Timeline
          </h2>
          <ul id="activity-timeline-list" className="flex flex-col gap-6">
            {activity.map((item, i) => (
              <li
                key={i}
                id={`activity-item-${i}`}
                data-testid={`activity-item-${i}`}
                className="flex items-center gap-4"
              >
                <div
                  id={`activity-icon-${i}`}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-100 text-accent-forest text-lg"
                >
                  {item.icon}
                </div>
                <div className="flex flex-col">
                  <span
                    id={`activity-label-${i}`}
                    className="font-medium text-zinc-700"
                  >
                    {item.label}
                  </span>
                  <span
                    id={`activity-date-${i}`}
                    className="text-xs text-zinc-400"
                  >
                    {item.date}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Related matters */}
        <section
          id="related-matters-section"
          className="w-full lg:w-80 flex-shrink-0"
        >
          <h2
            id="related-matters-heading"
            className="font-semibold text-lg mb-5"
          >
            Related Matters
          </h2>
          <div id="related-matters-list" className="flex flex-col gap-4">
            {matters.length === 0 ? (
              <div
                id="no-matters-message"
                data-testid="no-matters-message"
                className="rounded-2xl bg-white border border-zinc-100 shadow p-4 text-center text-zinc-400"
              >
                No related matters found.
              </div>
            ) : (
              matters.map(m => (
                <div
                  key={m.id}
                  id={`related-matter-${m.id}`}
                  data-testid={`related-matter-${m.id}`}
                  onClick={() => seedRouter.push(`/matters/${m.id}`)}
                  className="rounded-2xl bg-white border border-zinc-100 shadow p-4 flex items-center gap-4 hover:shadow-lg transition cursor-pointer"
                >
                  <FileText className="w-7 h-7 text-accent-forest/60"/>
                  <div className="flex-1 min-w-0">
                    <div
                      id={`matter-name-${m.id}`}
                      className="font-semibold text-zinc-800 truncate"
                    >
                      {m.name}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        id={`matter-status-${m.id}`}
                        className={`inline-flex px-3 py-0.5 rounded-2xl text-xs font-semibold ${
                          m.status==='Active'
                            ? 'bg-accent-forest/10 text-accent-forest'
                            : 'bg-zinc-200 text-zinc-500'
                        }`}
                      >
                        {m.status}
                      </span>
                      <span
                        id={`matter-id-${m.id}`}
                        className="text-xs text-zinc-400 font-mono"
                      >
                        {m.id}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-zinc-300"/>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </section>
  );
}

export default function ClientProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral flex items-center justify-center">Loading...</div>}>
      <ClientProfilePageContent />
    </Suspense>
  );
}
