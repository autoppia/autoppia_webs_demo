"use client";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { User, Mail, CheckCircle, FileText, Briefcase, Calendar, ChevronRight, Phone } from 'lucide-react';
import { EVENT_TYPES, logEvent } from "@/library/events";
import { initializeClients } from "@/data/crm-enhanced";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { useSeed } from "@/context/SeedContext";
import { useProjectData } from "@/shared/universal-loader";
import { useDynamicSystem } from "@/dynamic/shared";
import { CLASS_VARIANTS_MAP, ID_VARIANTS_MAP } from "@/dynamic/v3";
import { getClientById, dynamicDataProvider } from "@/dynamic/v2";

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
  const [message, setMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const dyn = useDynamicSystem();
  const params = useParams();
  const clientId = params?.id as string;
  const seedRouter = useSeedRouter();
  const searchParams = useSearchParams();
  const { seed, isSeedReady } = useSeed();
  const v2Seed = seed;
  const storageKey = useMemo(
    () => `${STORAGE_KEY_PREFIX}_${v2Seed ?? "default"}`,
    [v2Seed]
  );

  const { data } = useProjectData<any>({
    projectKey: "web_5_autocrm",
    entityType: "clients",
    generateCount: 60,
    version: "v1",
    seedValue: isSeedReady ? v2Seed : undefined,
  });
  const [fallbackClients, setFallbackClients] = useState<any[]>([]);
  useEffect(() => {
    initializeClients(v2Seed ?? undefined).then(setFallbackClients);
  }, [v2Seed]);

  const baseClients = useMemo(() => {
    const normalizedApi = (data || []).map((c: any, idx: number) =>
      normalizeClient(c, idx)
    );
    if (normalizedApi.length > 0) return normalizedApi;
    return fallbackClients.map((c, idx) => normalizeClient(c, idx));
  }, [data, fallbackClients]);

  // Load client data using V2 system
  useEffect(() => {
    if (!clientId) return;

    let mounted = true;
    const run = async () => {
      setIsResolving(true);
      try {
        // Wait for data to be ready
        await dynamicDataProvider.whenReady();

        // Reload if seed changed
        await dynamicDataProvider.reload(seed ?? undefined);

        // Wait again to ensure reload is complete
        await dynamicDataProvider.whenReady();

        if (!mounted) return;

        // Get client directly using getClientById
        const allClients = dynamicDataProvider.getClients();
        console.log(`[clients/[id]/page] Searching for client ${clientId} in ${allClients.length} clients`);

        const found = getClientById(clientId);
        console.log(`[clients/[id]/page] Client ${clientId} found:`, found ? found.name : "NOT FOUND");

        if (found) {
          const normalized = normalizeClient(found, 0);
          setClient(normalized);
          logEvent(EVENT_TYPES.VIEW_CLIENT_DETAILS, normalized);
        } else {
          // Log available clients for debugging
          console.warn(`[clients/[id]/page] Client ${clientId} not found. Available clients (${allClients.length}):`,
            allClients.slice(0, 5).map(c => ({ id: c.id, name: c.name }))
          );
          setClient(null);
        }
      } catch (error) {
        console.error("[clients/[id]/page] Failed to load client", error);
        if (!mounted) return;
        setClient(null);
      } finally {
        if (!mounted) return;
        setIsResolving(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [clientId, v2Seed, seed]);

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
      {dyn.v1.addWrapDecoy("client-profile-card", (
        <div
          id={dyn.v3.getVariant("client_profile_card", ID_VARIANTS_MAP, "client-profile-card")}
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
      ))}

      {/* Timeline + Related matters row */}
      <div id={dyn.v3.getVariant("client_content_sections", ID_VARIANTS_MAP, "client-content-sections")} className="flex flex-col lg:flex-row gap-10">
        {/* Timeline */}
        {dyn.v1.addWrapDecoy("activity-timeline-section", (
          <section
            id={dyn.v3.getVariant("activity_timeline_section", ID_VARIANTS_MAP, "activity-timeline-section")}
            className="flex-1 min-w-0 rounded-2xl bg-white shadow-card p-6 md:p-8 border border-zinc-100"
          >
            <h2
              id={dyn.v3.getVariant("activity_timeline_heading", ID_VARIANTS_MAP, "activity-timeline-heading")}
              className="font-semibold text-lg mb-5"
            >
              {dyn.v3.getVariant("activity_timeline", undefined, "Activity Timeline")}
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
            <div className="mt-8 border-t border-zinc-100 pt-5">
              <h3 className="font-semibold text-zinc-800 mb-3">{dyn.v3.getVariant("send_message_label", undefined, "Send a message")}</h3>
              <textarea
                id={dyn.v3.getVariant("client_message_input", ID_VARIANTS_MAP, `client-message-${client.id}`)}
                className={dyn.v3.getVariant(
                  "input",
                  CLASS_VARIANTS_MAP,
                  "w-full border border-zinc-200 rounded-xl p-3 text-sm focus:outline-accent-forest"
                )}
                rows={3}
                placeholder={dyn.v3.getVariant("client_message_placeholder", undefined, "Type a quick note to this client...")}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button
                id={dyn.v3.getVariant("send_message_button", ID_VARIANTS_MAP, "send-message-button")}
                className={dyn.v3.getVariant(
                  "button-primary",
                  CLASS_VARIANTS_MAP,
                  "mt-3 px-4 py-2 rounded-xl bg-accent-forest text-white font-semibold disabled:opacity-50"
                )}
                disabled={!message.trim()}
                onClick={() => {
                  logEvent(EVENT_TYPES.NEW_LOG_ADDED, {
                    clientId: client.id,
                    message: message.trim(),
                    to: client.email,
                  });
                  setMessage("");
                }}
              >
                {dyn.v3.getVariant("send_message_button_text", undefined, "Send message")}
              </button>
            </div>
          </section>
        ))}

        {/* Related matters */}
        {dyn.v1.addWrapDecoy("related-matters-section", (
          <section
            id={dyn.v3.getVariant("related_matters_section", ID_VARIANTS_MAP, "related-matters-section")}
            className="w-full lg:w-80 flex-shrink-0"
          >
            <h2
              id={dyn.v3.getVariant("related_matters_heading", ID_VARIANTS_MAP, "related-matters-heading")}
              className="font-semibold text-lg mb-5"
            >
              {dyn.v3.getVariant("related_matters", undefined, "Related Matters")}
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
        ))}
      </div>
      <div className="flex items-center justify-between">
          <button
            id={dyn.v3.getVariant("back_to_clients_button", ID_VARIANTS_MAP, "back-to-clients-button")}
            className={dyn.v3.getVariant(
              "button-secondary",
              CLASS_VARIANTS_MAP,
              "text-sm text-zinc-500 underline"
            )}
            onClick={() => seedRouter.push("/clients")}
          >
            {dyn.v3.getVariant("back_to_clients", undefined, "Back to clients")}
          </button>
          <button
            id={dyn.v3.getVariant("delete_client_button", ID_VARIANTS_MAP, "delete-client-button")}
            className={dyn.v3.getVariant(
              "button-secondary",
              CLASS_VARIANTS_MAP,
              "px-4 py-2 rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition"
            )}
            onClick={() => {
            if (isDeleting) return;
            setIsDeleting(true);
            logEvent(EVENT_TYPES.DELETE_CLIENT, client);
            const cached = typeof window !== "undefined" ? window.localStorage.getItem(storageKey) : null;
            if (cached) {
              try {
                const parsed = JSON.parse(cached);
                const next = Array.isArray(parsed)
                  ? parsed.filter((c: any) => c.id !== client.id)
                  : [];
                window.localStorage.setItem(storageKey, JSON.stringify(next));
              } catch (error) {
                console.warn("Failed to update cached clients", error);
              }
            }
            logEvent(EVENT_TYPES.LOG_DELETE, { clientId: client.id, name: client.name, reason: "deleted_from_profile" });
            seedRouter.push("/clients");
          }}
        >
          {dyn.v3.getVariant("delete_client_button_text", undefined, "Delete client")}
        </button>
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
