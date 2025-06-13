import { use } from "react";
import ProfileClient from "@/components/ProfileClient";

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params); // 👈 unwrap Promise using React `use()`
  return <ProfileClient username={username} />;
}
