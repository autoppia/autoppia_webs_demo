"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EVENT_TYPES, logEvent } from "@/library/events";

type Theme = "dark" | "light";

export default function SettingsPage() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [notifications, setNotifications] = useState(true);
  const [displayName, setDisplayName] = useState("You");

  useEffect(() => {
    logEvent(EVENT_TYPES.OPEN_SETTINGS, {});
  }, []);

  const handleThemeChange = (value: Theme) => {
    setTheme(value);
    logEvent(EVENT_TYPES.SETTINGS_APPEARANCE, { theme: value });
  };

  const handleNotificationsChange = (checked: boolean) => {
    setNotifications(checked);
    logEvent(EVENT_TYPES.SETTINGS_NOTIFICATIONS, { enabled: checked });
  };

  const handleAccountSave = () => {
    logEvent(EVENT_TYPES.SETTINGS_ACCOUNT, { display_name: displayName });
  };

  return (
    <div className="min-h-screen bg-discord-darkest">
      <header className="h-14 px-4 border-b border-black/20 flex items-center gap-4">
        <Link
          href="/"
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
          aria-label="Back"
          data-testid="settings-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-semibold text-white">Settings</h1>
      </header>

      <main className="max-w-xl mx-auto py-8 px-4 space-y-8">
        <section>
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">Appearance</h2>
          <div className="rounded-lg bg-discord-sidebar p-4 space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="theme"
                checked={theme === "dark"}
                onChange={() => handleThemeChange("dark")}
                className="rounded-full border-gray-500 text-discord-accent focus:ring-discord-accent"
                data-testid="settings-theme-dark"
              />
              <span className="text-gray-200">Dark</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="theme"
                checked={theme === "light"}
                onChange={() => handleThemeChange("light")}
                className="rounded-full border-gray-500 text-discord-accent focus:ring-discord-accent"
                data-testid="settings-theme-light"
              />
              <span className="text-gray-200">Light</span>
            </label>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">Notifications</h2>
          <div className="rounded-lg bg-discord-sidebar p-4 flex items-center justify-between">
            <span className="text-gray-200">Enable notifications</span>
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => handleNotificationsChange(e.target.checked)}
              className="rounded border-gray-500 text-discord-accent focus:ring-discord-accent"
              data-testid="settings-notifications"
            />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">Account</h2>
          <div className="rounded-lg bg-discord-sidebar p-4 space-y-3">
            <label htmlFor="settings-display-name" className="block text-sm text-gray-400">Display name</label>
            <input
              id="settings-display-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-md bg-discord-input px-4 py-2.5 text-gray-200 focus:outline-none focus:ring-1 focus:ring-discord-accent"
              maxLength={32}
              data-testid="settings-display-name"
            />
            <button
              type="button"
              onClick={handleAccountSave}
              className="px-4 py-2 rounded-md bg-discord-accent text-white hover:bg-discord-accent/90"
              data-testid="settings-account-save"
            >
              Save
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
