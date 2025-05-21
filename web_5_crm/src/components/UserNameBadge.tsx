// components/UserNameBadge.tsx
"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";

export default function UserNameBadge() {
  const [name, setName] = useState<string | undefined>();

  useEffect(() => {
    const user = Cookies.get("user_name");
    setName(user);
  }, []);

  return (
    <div className="rounded-4xl bg-neutral-bg-dark px-4 py-2 text-sm font-medium text-accent-forest">
      <h1 className="text-lg">{name ?? "Guest"}</h1>
    </div>
  );
}
