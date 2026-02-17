export interface Server {
  id: string;
  name: string;
  icon: string | null;
}

export interface Channel {
  id: string;
  serverId: string;
  name: string;
  type: "text" | "voice";
  position: number;
}

export interface Message {
  id: string;
  channelId: string;
  authorUsername: string;
  content: string;
  timestamp: string;
}

export interface Member {
  id: string;
  serverId: string;
  username: string;
  displayName: string;
  avatar: string;
  role: string;
}
