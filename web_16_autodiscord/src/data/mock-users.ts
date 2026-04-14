import type { MemberStatus } from "@/types/discord";

export interface MockUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  status: MemberStatus;
}

export const MOCK_USERS: MockUser[] = [
  {
    id: "mock-user-1",
    username: "pixel_knight",
    displayName: "Pixel Knight",
    avatar: "",
    status: "online",
  },
  {
    id: "mock-user-2",
    username: "nova.star",
    displayName: "Nova",
    avatar: "",
    status: "idle",
  },
  {
    id: "mock-user-3",
    username: "echo_wave",
    displayName: "Echo Wave",
    avatar: "",
    status: "online",
  },
  {
    id: "mock-user-4",
    username: "crimson.fox",
    displayName: "Crimson Fox",
    avatar: "",
    status: "dnd",
  },
  {
    id: "mock-user-5",
    username: "lunar_dev",
    displayName: "Lunar Dev",
    avatar: "",
    status: "online",
  },
  {
    id: "mock-user-6",
    username: "shadow.byte",
    displayName: "Shadow Byte",
    avatar: "",
    status: "offline",
  },
  {
    id: "mock-user-7",
    username: "arctic_bloom",
    displayName: "Arctic Bloom",
    avatar: "",
    status: "online",
  },
  {
    id: "mock-user-8",
    username: "drift.code",
    displayName: "Drift",
    avatar: "",
    status: "idle",
  },
  {
    id: "mock-user-9",
    username: "velvet_glitch",
    displayName: "Velvet Glitch",
    avatar: "",
    status: "online",
  },
  {
    id: "mock-user-10",
    username: "neon.pulse",
    displayName: "Neon Pulse",
    avatar: "",
    status: "dnd",
  },
];
