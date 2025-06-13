"use client";
import ProfileClient from "./ProfileClient";

export default function ProfileClientWrapper({
  username,
}: {
  username: string;
}) {
  return <ProfileClient username={username} />;
}
