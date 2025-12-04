"use client";

import { use } from "react";
import ProfileClient from "./ProfileClient";

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  return <ProfileClient username={username} />;
}

