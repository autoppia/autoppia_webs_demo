import { UserOutlined, DownOutlined } from "@ant-design/icons";
import { Popover } from "antd";
import { useMemo, useState } from "react";
import { logEvent, EVENT_TYPES } from "@/library/events";
import CreateTeamModal from "./CreateTeamModal";
import { useSeedLayout } from "@/dynamic/v3-dynamic";

type NavItem = {
  id: string;
  label: string;
  onClick?: () => void;
};

export default function Navbar({ className }: { className?: string }) {
  const [profilePopoverOpen, setProfilePopoverOpen] = useState(false);
  const [createTeamModalOpen, setCreateTeamModalOpen] = useState(false);
  const { reorderElements, getElementAttributes, getElementXPath } =
    useSeedLayout();

  const baseNavItems: NavItem[] = useMemo(
    () => [
      { id: "upcoming", label: "Upcoming" },
      { id: "drafts", label: "Drafts" },
      { id: "more", label: "More" },
      {
        id: "add-team",
        label: "Add Team",
        onClick: () => {
          logEvent(EVENT_TYPES.ADD_TEAM_CLICKED, {
            timestamp: Date.now(),
          });
          setCreateTeamModalOpen(true);
        },
      },
    ],
    []
  );

  const shuffledNavItems = reorderElements(baseNavItems);
  const splitIndex = Math.ceil(shuffledNavItems.length / 2);
  const leftNavItems = shuffledNavItems.slice(0, splitIndex);
  const rightNavItems = shuffledNavItems.slice(splitIndex);

  const profilePanel = (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 min-w-[200px] py-2 px-0 mt-2">
      <button
        className="flex items-center w-full px-4 py-2 text-[15px] hover:bg-gray-50 cursor-pointer"
        onClick={() => {
          setProfilePopoverOpen(false);
        }}
      >
        <span className="flex-1 text-gray-900 text-left">Profile</span>
      </button>
      <button
        className="flex items-center w-full px-4 py-2 text-[15px] hover:bg-gray-50 cursor-pointer"
        onClick={() => {
          setProfilePopoverOpen(false);
        }}
      >
        <span className="flex-1 text-gray-900 text-left">Settings</span>
      </button>
      <button
        className="flex items-center w-full px-4 py-2 text-[15px] hover:bg-gray-50 cursor-pointer"
        onClick={() => {
          setProfilePopoverOpen(false);
        }}
      >
        <span className="flex-1 text-gray-900 text-left">Logout</span>
      </button>
    </div>
  );

  return (
    <nav className={className || "fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-10"}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex sm:space-x-4">
              {leftNavItems.map((item, index) => {
                const attributes = getElementAttributes(
                  "nav_left_button",
                  index
                );
                const xpath = getElementXPath("nav_left_button");
                return (
                  <button
                    key={item.id}
                    {...attributes}
                    data-xpath={xpath}
                    className={`border-b-2 border-transparent px-1 pt-1 pb-4 text-md font-medium text-gray-600 hover:text-gray-900 hover:border-[#d1453b] ${attributes?.className ?? ""}`}
                    onClick={item.onClick}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
            {rightNavItems.length > 0 && (
              <div className="hidden sm:flex sm:space-x-4">
                {rightNavItems.map((item, index) => {
                  const attributes = getElementAttributes(
                    "nav_right_button",
                    index
                  );
                  const xpath = getElementXPath("nav_right_button");
                  return (
                    <button
                      key={item.id}
                      {...attributes}
                      data-xpath={xpath}
                      className={`border-b-2 border-transparent px-1 pt-1 pb-4 text-md font-medium text-gray-600 hover:text-gray-900 hover:border-[#d1453b] ${attributes?.className ?? ""}`}
                      onClick={item.onClick}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <div className="flex items-center">
            <Popover
              placement="bottomRight"
              trigger="click"
              open={profilePopoverOpen}
              onOpenChange={setProfilePopoverOpen}
              content={profilePanel}
              overlayClassName="!p-0"
            >
              <button className="flex items-center gap-2 text-gray-600 hover:bg-gray-50 transition px-3 py-2 rounded-md text-md font-medium">
                <img
                  alt="avatar"
                  src="https://randomuser.me/api/portraits/men/1.jpg"
                  className="rounded-full w-8 h-8"
                />
                <span>John Wick</span>
                <DownOutlined style={{ fontSize: 11 }} />
              </button>
            </Popover>
          </div>
        </div>
      </div>
      <CreateTeamModal
        open={createTeamModalOpen}
        onCancel={() => setCreateTeamModalOpen(false)}
        onOk={(values) => {
          // Handle team creation here
          console.log('Team created:', values);
          setCreateTeamModalOpen(false);
        }}
      />
    </nav>
  );
}
