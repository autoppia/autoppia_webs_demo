"use client";
import { useEffect, useState } from "react";
import { User, Mail } from "lucide-react";
import { logEvent } from "@/library/events";
import Cookies from "js-cookie";
import { DynamicButton } from "@/components/DynamicButton";
import { DynamicContainer, DynamicItem } from "@/components/DynamicContainer";
import { DynamicElement } from "@/components/DynamicElement";
import { useDynamicStructure } from "@/context/DynamicStructureContext";
import { useDynamicSystem } from "@/dynamic/shared";
import { CLASS_VARIANTS_MAP } from "@/dynamic/v3";

export default function SettingsPage() {
  const { getText, getId } = useDynamicStructure();
  const dyn = useDynamicSystem();
  const inputBase = "rounded-xl border px-4 py-3 font-medium bg-white";
  const saveButtonBase =
    "ml-auto rounded-2xl text-accent-forest bg-accent-forest/10 border border-accent-forest px-4 py-2 font-medium hover:bg-accent-forest/20 transition";
  const [name, setName] = useState("Jennifer Doe");

  useEffect(() => {
    const saved = Cookies.get("user_name");
    if (saved) setName(saved);
  }, []);

  const saveName = () => {
    Cookies.set("user_name", name, { expires: 7 });
    logEvent("CHANGE_USER_NAME", { name });
    // Dispatch custom event to update UserNameBadge without page reload
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("userNameChanged", { detail: { name } }));
    }
  };

  return (
    <DynamicContainer index={0} className="max-w-2xl mx-auto flex flex-col gap-10">
      <DynamicElement elementType="header" index={0}>
        <h1 className="text-3xl font-extrabold mb-10 tracking-tight">{getText("settings_title", "Settings")}</h1>
      </DynamicElement>

      <DynamicItem index={0} className="bg-white rounded-2xl shadow-card border border-zinc-100 p-7 flex flex-col gap-7">
        <DynamicElement elementType="section" index={1}>
          <h2 className="font-semibold text-lg mb-4">{getText("user_profile", "User Profile")}</h2>
          <div className="flex flex-col gap-5">
            {(() => {
              const profileFields = [
                <div key="full-name" className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                    <User className="w-4 h-4 inline" /> {getText("full_name", "Full Name")}
                  </label>
                  <input
                    id={getId("user_name_input")}
                    data-testid="user-name-input"
                    className={dyn.v3.getVariant("input", CLASS_VARIANTS_MAP, inputBase)}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={saveName}
                    aria-label={getText("full_name", "Full Name")}
                  />
                </div>,
                <div key="email" className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                    <Mail className="w-4 h-4 inline" /> {getText("client_email", "Client Email")}
                  </label>
                  <input
                    id={getId("user_email_input")}
                    className="rounded-xl border px-4 py-3 font-medium bg-zinc-50"
                    value="j.doe@firmly.com"
                    disabled
                    aria-label={getText("client_email", "Client Email")}
                  />
                </div>
              ];
              const order = dyn.v1.changeOrderElements("settings-profile-fields", profileFields.length);
              return order.map((idx) => profileFields[idx]);
            })()}
            <div className="flex items-center gap-3">
              <DynamicButton
                eventType="CHANGE_USER_NAME"
                index={0}
                onClick={saveName}
                className={dyn.v3.getVariant(
                  "button-secondary",
                  CLASS_VARIANTS_MAP,
                  saveButtonBase
                )}
                id={getId("save_name_button")}
                aria-label={getText("save_profile", "Save Profile")}
              >
                {getText("save_profile", "Save Profile")}
              </DynamicButton>
            </div>
          </div>
        </DynamicElement>
        <hr className="border-zinc-100 my-1" />
      </DynamicItem>

      <DynamicElement elementType="section" index={2} className="text-xs text-zinc-400 text-center pt-6">
        {getText("settings_note", "Settings Note")}
      </DynamicElement>
    </DynamicContainer>
  );
}
