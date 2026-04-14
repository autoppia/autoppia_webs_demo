"use client";

import { MOCK_USERS, type MockUser } from "@/data/mock-users";
import { useDynamicSystem } from "@/dynamic";
import { CLASS_VARIANTS_MAP, ID_VARIANTS_MAP } from "@/dynamic/v3";
import type { FriendStatus } from "@/context/LocalDiscordOverlayContext";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { Search, UserPlus, X, Check, Clock } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";

interface AddFriendModalProps {
  open: boolean;
  onClose: () => void;
  friends: Record<string, FriendStatus>;
  onSendRequest: (user: MockUser) => void;
  existingPeerIds: Set<string>;
}

const STATUS_COLORS: Record<string, string> = {
  online: "bg-green-500",
  idle: "bg-yellow-500",
  dnd: "bg-red-500",
  offline: "bg-gray-500",
};

export function AddFriendModal({
  open,
  onClose,
  friends,
  onSendRequest,
  existingPeerIds,
}: AddFriendModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const dyn = useDynamicSystem();

  if (!open) return null;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.trim()) {
      logEvent(EVENT_TYPES.SEARCH_FRIEND, {
        query: q.trim(),
        query_length: q.trim().length,
      });
    }
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
      aria-labelledby="add-friend-title"
      data-testid={dyn.v3.getVariant("add-friend-modal", ID_VARIANTS_MAP, "add-friend-modal")}
    >
      <div className="w-full max-w-lg rounded-xl bg-discord-sidebar shadow-xl border border-white/10 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-black/20">
          <h2
            id="add-friend-title"
            className="text-lg font-semibold text-white"
          >
            {dyn.v3.getVariant("add_friend_modal_title", undefined, "Add Friend")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
            aria-label="Close"
            data-testid={dyn.v3.getVariant("add-friend-modal-close", ID_VARIANTS_MAP, "add-friend-modal-close")}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-black/20">
          <p className="text-sm text-gray-400 mb-2">
            {dyn.v3.getVariant("add_friend_description", undefined, "You can add friends with their Discord username.")}
          </p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={dyn.v3.getVariant("add_friend_search_placeholder", undefined, "Enter a username...")}
              className={`w-full rounded-md bg-discord-input pl-10 pr-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-discord-accent ${dyn.v3.getVariant("input-text", CLASS_VARIANTS_MAP, "")}`}
              data-testid={dyn.v3.getVariant("add-friend-search-input", ID_VARIANTS_MAP, "add-friend-search-input")}
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
            filteredUsers.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                friendStatus={friends[user.id]}
                isExistingPeer={existingPeerIds.has(user.id)}
                onSendRequest={onSendRequest}
                dyn={dyn}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}

function UserRow({
  user,
  friendStatus,
  isExistingPeer,
  onSendRequest,
  dyn,
}: {
  user: MockUser;
  friendStatus: FriendStatus | undefined;
  isExistingPeer: boolean;
  onSendRequest: (user: MockUser) => void;
  dyn: ReturnType<typeof useDynamicSystem>;
}) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-white/5"
      data-testid={dyn.v3.getVariant("friend-user-row", ID_VARIANTS_MAP, `friend-user-${user.id}`)}
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
        <p className="text-xs text-gray-400 truncate">{user.username}</p>
      </div>

      {/* Action */}
      {friendStatus === "accepted" || isExistingPeer ? (
        <span className="flex items-center gap-1.5 text-xs text-green-400 px-3 py-1.5">
          <Check className="w-3.5 h-3.5" />
          Friends
        </span>
      ) : friendStatus === "pending" ? (
        <span
          className="flex items-center gap-1.5 text-xs text-yellow-400 px-3 py-1.5"
          data-testid={dyn.v3.getVariant("pending-friend-status", ID_VARIANTS_MAP, `pending-friend-${user.id}`)}
        >
          <Clock className="w-3.5 h-3.5" />
          Pending
        </span>
      ) : (
        <button
          type="button"
          onClick={() => onSendRequest(user)}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-discord-accent text-white hover:bg-discord-accent/90 ${dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, "")}`}
          data-testid={dyn.v3.getVariant("send-friend-request-button", ID_VARIANTS_MAP, `send-friend-request-${user.id}`)}
        >
          <UserPlus className="w-3.5 h-3.5" />
          {dyn.v3.getVariant("send_friend_request_label", undefined, "Send Request")}
        </button>
      )}
    </div>
  );
}
