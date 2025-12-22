"use client";

import ProfileClient from "./ProfileClient";

export default function ProfilePage({ params }: { params: { username: string } }) {
  return <ProfileClient username={params.username} />;
}
