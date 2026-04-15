"use client";

import { MOCK_USERS, type MockUser } from "@/data/mock-users";
import { useDynamicSystem } from "@/dynamic";
import { CLASS_VARIANTS_MAP, ID_VARIANTS_MAP } from "@/dynamic/v3";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { Check, Search, UserPlus, X } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
  serverName: string;
  existingMemberIds: Set<string>;
  onInvite: (user: MockUser) => void;
}

const STATUS_COLORS: Record<string, string> = {
  online: "bg-green-500",
  idle: "bg-yellow-500",
  dnd: "bg-red-500",
  offline: "bg-gray-500",
};

export function InviteModal({
  open,
  onClose,
  serverName,
  existingMemberIds,
  onInvite,
}: InviteModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
  const dyn = useDynamicSystem();

  if (!open) return null;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.trim()) {
      logEvent(EVENT_TYPES.INVITE_SEARCH, {
        query: q.trim(),
        query_length: q.trim().length,
        server_name: serverName,
      });
    }
  };

  const handleInvite = (user: MockUser) => {
    onInvite(user);
    setInvitedIds((prev) => new Set([...prev, user.id]));
  };

  const filteredUsers = MOCK_USERS.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.username.toLowerCase().includes(q) ||
      u.displayName.toLowerCase().includes(q)
    );
  });

  const modal = (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60"
      aria-modal="true"
      aria-labelledby="invite-modal-title"
      data-testid={dyn.v3.getVariant("invite-modal", ID_VARIANTS_MAP, "invite-modal")}
    >
      <div className="w-full max-w-lg rounded-xl bg-discord-sidebar shadow-xl border border-white/10 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-black/20">
          <div>
            <h2
              id="invite-modal-title"
              className="text-lg font-semibold text-white"
            >
              {dyn.v3.getVariant("invite_modal_title", undefined, "Invite People")}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">to {serverName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
            aria-label="Close"
            data-testid={dyn.v3.getVariant("invite-modal-close", ID_VARIANTS_MAP, "invite-modal-close")}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-black/20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={dyn.v3.getVariant("invite_search_placeholder", undefined, "Search for users...")}
              className={`w-full rounded-md bg-discord-input pl-10 pr-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-discord-accent ${dyn.v3.getVariant("input-text", CLASS_VARIANTS_MAP, "")}`}
              data-testid={dyn.v3.getVariant("invite-search-input", ID_VARIANTS_MAP, "invite-search-input")}
            />
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
          {filteredUsers.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-gray-500">
              No users found matching &quot;{searchQuery}&quot;
            </p>
          ) : (
            filteredUsers.map((user) => {
              const isExisting = existingMemberIds.has(user.id);
              const isInvited = invitedIds.has(user.id);
              return (
                <div
                  key={user.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-white/5"
                  data-testid={dyn.v3.getVariant("invite-user-row", ID_VARIANTS_MAP, `invite-user-${user.id}`)}
                >
                  {/* Avatar with status */}
                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 rounded-full bg-discord-darker flex items-center justify-center text-sm font-medium text-white">
                      {user.displayName.slice(0, 2).toUpperCase()}
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-discord-sidebar ${STATUS_COLORS[user.status]}`}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user.displayName}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {user.username}
                    </p>
                  </div>

                  {/* Action */}
                  {isExisting || isInvited ? (
                    <span className="flex items-center gap-1.5 text-xs text-green-400 px-3 py-1.5">
                      <Check className="w-3.5 h-3.5" />
                      {isExisting ? "Member" : "Invited"}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleInvite(user)}
                      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-discord-accent text-white hover:bg-discord-accent/90 ${dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, "")}`}
                      data-testid={dyn.v3.getVariant("invite-button", ID_VARIANTS_MAP, `invite-${user.id}`)}
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      {dyn.v3.getVariant("invite_button_label", undefined, "Invite")}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}
