"use client";

import { CURRENT_USER } from "@/constants/mock";
import { EVENT_TYPES, logEvent } from "@/library/events";
import type { Channel, Member } from "@/types/discord";
import { Mic, MicOff, PhoneOff } from "lucide-react";

interface VoiceChannelPanelProps {
  channel: Channel;
  membersInChannel: Member[];
  currentUserMuted: boolean;
  onMuteToggle: () => void;
  onLeave: () => void;
}

export function VoiceChannelPanel({
  channel,
  membersInChannel,
  currentUserMuted,
  onMuteToggle,
  onLeave,
}: VoiceChannelPanelProps) {
  const handleMute = () => {
    logEvent(EVENT_TYPES.VOICE_MUTE_TOGGLE, {
      channel_id: channel.id,
      channel_name: channel.name,
      muted: !currentUserMuted,
    });
    onMuteToggle();
  };

  const handleLeave = () => {
    logEvent(EVENT_TYPES.LEAVE_VOICE_CHANNEL, {
      channel_id: channel.id,
      channel_name: channel.name,
    });
    onLeave();
  };

  return (
    <section
      className="flex-1 flex flex-col bg-discord-channel min-w-0"
      aria-label={`Voice channel ${channel.name}`}
      data-testid="voice-channel-panel"
    >
      <header className="h-12 px-4 flex items-center border-b border-black/20 gap-2">
        <Mic className="w-5 h-5 text-gray-400" aria-hidden />
        <span className="font-semibold text-white">{channel.name}</span>
      </header>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center gap-6">
        <p
          className="text-gray-400 text-sm"
          data-testid="voice-channel-joined-label"
        >
          You have joined the voice channel.
        </p>

        <div
          className="flex flex-wrap justify-center gap-4"
          data-testid="voice-channel-members"
        >
          {membersInChannel.map((m) => (
            <div
              key={m.id}
              className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white/5 min-w-[80px]"
              data-testid={`voice-member-${m.id}`}
            >
              <div className="w-12 h-12 rounded-full bg-discord-darker flex items-center justify-center text-lg font-medium text-gray-300">
                {m.displayName.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-sm text-gray-200 truncate max-w-full">
                {m.displayName}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 mt-4">
          <button
            type="button"
            onClick={handleMute}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
              currentUserMuted
                ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                : "bg-white/10 text-gray-200 hover:bg-white/15"
            }`}
            aria-pressed={currentUserMuted}
            data-testid="voice-mute-toggle"
            title={currentUserMuted ? "Unmute" : "Mute"}
          >
            {currentUserMuted ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
            {currentUserMuted ? "Unmute" : "Mute"}
          </button>
          <button
            type="button"
            onClick={handleLeave}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
            data-testid="voice-leave"
            title="Leave voice channel"
          >
            <PhoneOff className="w-5 h-5" />
            Leave
          </button>
        </div>
      </div>
    </section>
  );
}
