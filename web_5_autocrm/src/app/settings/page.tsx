"use client";
import { useEffect, useState } from "react";
import { User, Mail } from "lucide-react";
import { logEvent } from "@/library/events";
import Cookies from "js-cookie";

export default function SettingsPage() {
  const [name, setName] = useState("Jennifer Doe");

  useEffect(() => {
    const saved = Cookies.get("user_name");
    if (saved) setName(saved);
  }, []);

  const saveName = () => {
    Cookies.set("user_name", name, { expires: 7 });
    logEvent("CHANGE_USER_NAME", { name });
    window.location.reload();
  };

  return (
    <section className="max-w-2xl mx-auto flex flex-col gap-10">
      <h1 className="text-3xl font-extrabold mb-10 tracking-tight">Settings</h1>
      <div className="bg-white rounded-2xl shadow-card border border-zinc-100 p-7 flex flex-col gap-7">
        <section>
          <h2 className="font-semibold text-lg mb-4">Profile</h2>
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                <User className="w-4 h-4 inline" /> Full name
              </label>
              <input
                className="rounded-xl border px-4 py-3 font-medium bg-white"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={saveName}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                <Mail className="w-4 h-4 inline" /> Email
              </label>
              <input
                className="rounded-xl border px-4 py-3 font-medium bg-zinc-50"
                value="j.doe@firmly.com"
                disabled
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={saveName}
                className="ml-auto rounded-2xl text-accent-forest border border-accent-forest px-4 py-2 font-medium hover:bg-accent-forest/10 transition"
              >
                Save Name
              </button>
            </div>
          </div>
        </section>
        <hr className="border-zinc-100 my-1" />
      </div>
      <div className="text-xs text-zinc-400 text-center pt-6">
        Settings page · Name is now editable, persisted in cookies, and logged.
      </div>
    </section>
  );
}
