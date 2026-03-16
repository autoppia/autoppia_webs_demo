"use client";

import { useDynamicSystem } from "@/dynamic";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP } from "@/dynamic/v3";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Theme = "dark" | "light";

export default function SettingsPage() {
  const dyn = useDynamicSystem();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearch = useMemo(
    () => (searchParams.toString() ? `?${searchParams.toString()}` : ""),
    [searchParams]
  );

  const [theme, setTheme] = useState<Theme>("dark");
  const [notifications, setNotifications] = useState(true);
  const [displayName, setDisplayName] = useState("You");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("autodiscord-theme") as Theme | null;
    if (stored === "light" || stored === "dark") setTheme(stored);
    logEvent(EVENT_TYPES.OPEN_SETTINGS, {});
  }, []);

  const handleThemeChange = (value: Theme) => {
    setTheme(value);
    document.documentElement.setAttribute("data-theme", value);
    localStorage.setItem("autodiscord-theme", value);
    logEvent(EVENT_TYPES.SETTINGS_APPEARANCE, { theme: value });
  };

  const handleNotificationsChange = (checked: boolean) => {
    setNotifications(checked);
    logEvent(EVENT_TYPES.SETTINGS_NOTIFICATIONS, { enabled: checked });
  };

  const handleAccountSave = () => {
    logEvent(EVENT_TYPES.SETTINGS_ACCOUNT, { name: displayName });
    setSaving(true);
    router.push("/" + currentSearch);
  };

  return (
    <div className="min-h-screen bg-discord-darkest">
      <header className="h-14 px-4 border-b border-black/20 flex items-center gap-4">
        <Link
          href={"/" + currentSearch}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
          aria-label="Back"
          data-testid={dyn.v3.getVariant("settings-back", ID_VARIANTS_MAP, "settings-back")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-semibold text-white">
          {dyn.v3.getVariant("settings_title", undefined, "Settings")}
        </h1>
      </header>

      <main className="max-w-xl mx-auto py-8 px-4 space-y-8">
        {dyn.v1.addWrapDecoy("settings-appearance-section", (
          <section>
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
              {dyn.v3.getVariant("settings_appearance", undefined, "Appearance")}
            </h2>
            <div className="rounded-lg bg-discord-sidebar p-4 space-y-2">
              {dyn.v1.changeOrderElements("settings-theme-options", 2).map((index) => {
                const isDark = index === 0;
                const key = isDark ? "dark" : "light";
                const checked = isDark ? theme === "dark" : theme === "light";
                const onChange = () => handleThemeChange(isDark ? "dark" : "light");
                const testId = isDark ? "settings-theme-dark" : "settings-theme-light";
                const label = isDark
                  ? dyn.v3.getVariant("settings_theme_dark", undefined, "Dark")
                  : dyn.v3.getVariant("settings_theme_light", undefined, "Light");

                return dyn.v1.addWrapDecoy(`settings-theme-option-${key}`, (
                  <label
                    key={key}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="theme"
                      checked={checked}
                      onChange={onChange}
                      className={`rounded-full border-gray-500 text-discord-accent focus:ring-discord-accent ${dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "")}`}
                      data-testid={testId}
                    />
                    <span className="text-gray-200">
                      {label}
                    </span>
                  </label>
                ), key);
              })}
            </div>
          </section>
        ))}

        {dyn.v1.addWrapDecoy("settings-notifications-section", (
          <section>
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
              {dyn.v3.getVariant("settings_notifications", undefined, "Notifications")}
            </h2>
            <div className="rounded-lg bg-discord-sidebar p-4 flex items-center justify-between">
              <span className="text-gray-200">
                {dyn.v3.getVariant("settings_notifications_label", undefined, "Enable notifications")}
              </span>
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => handleNotificationsChange(e.target.checked)}
                className={`rounded border-gray-500 text-discord-accent focus:ring-discord-accent ${dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "")}`}
                data-testid={dyn.v3.getVariant("settings-notifications", ID_VARIANTS_MAP, "settings-notifications")}
              />
            </div>
          </section>
        ))}

        {dyn.v1.addWrapDecoy("settings-account-section", (
          <section>
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
              {dyn.v3.getVariant("settings_account", undefined, "Account")}
            </h2>
            <div className="rounded-lg bg-discord-sidebar p-4 space-y-3">
              <label
                htmlFor={dyn.v3.getVariant("settings-display-name", ID_VARIANTS_MAP, "settings-display-name")}
                className="block text-sm text-gray-400"
              >
                {dyn.v3.getVariant("settings_display_name_label", undefined, "Display name")}
              </label>
              {dyn.v1.addWrapDecoy("settings-display-name-input", (
                <input
                  id={dyn.v3.getVariant("settings-display-name", ID_VARIANTS_MAP, "settings-display-name")}
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className={`w-full rounded-md bg-discord-input px-4 py-2.5 text-gray-200 focus:outline-none focus:ring-1 focus:ring-discord-accent ${dyn.v3.getVariant("input-text", CLASS_VARIANTS_MAP, "")}`}
                  maxLength={32}
                  data-testid={dyn.v3.getVariant("settings-display-name", ID_VARIANTS_MAP, "settings-display-name")}
                />
              ))}
              {dyn.v1.addWrapDecoy("settings-account-save-button", (
                <button
                  type="button"
                  onClick={handleAccountSave}
                  disabled={saving}
                  className={`px-4 py-2 rounded-md bg-discord-accent text-white hover:bg-discord-accent/90 disabled:opacity-70 disabled:cursor-wait ${dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, "")}`}
                  data-testid={dyn.v3.getVariant("settings-account-save", ID_VARIANTS_MAP, "settings-account-save")}
                >
                  {saving
                    ? dyn.v3.getVariant("settings_saving", undefined, "Saving…")
                    : dyn.v3.getVariant("settings_save", undefined, "Save")}
                </button>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
