"use client";
import { useMemo } from "react";
import { EVENT_TYPES, logEvent } from "@/library/events";
import {
  UserOutlined,
  PlusOutlined,
  SearchOutlined,
  InboxOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  MenuOutlined,
  ProjectOutlined,
  TeamOutlined,
  QuestionCircleOutlined,
  DownOutlined,
  NumberOutlined,
} from "@ant-design/icons";
import { Button } from "antd";
import Image from "next/image";
import { useSeedLayout } from "@/dynamic/v3-dynamic";

type SidebarItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  count?: number;
  onClick?: () => void;
  className?: string;
};

export default function Sidebar({
  onSelect,
  selected,
  inboxCount = 0,
  todayCount = 0,
  completedCount = 0,
  className,
}: {
  onSelect?: (v: string) => void;
  selected?: string;
  inboxCount?: number;
  todayCount?: number;
  completedCount?: number;
  className?: string;
}) {
  const { reorderElements, getElementAttributes, getElementXPath, isDynamicEnabled } = useSeedLayout();

  // Define all sidebar navigation items
  const navItems: SidebarItem[] = useMemo(() => [
    {
      id: "inbox",
      label: "Inbox",
      icon: <InboxOutlined />,
      count: inboxCount,
      onClick: () => onSelect?.("inbox"),
      className: `flex items-center gap-2 text-[16px] px-2.5 py-2 cursor-pointer rounded-lg ${
        selected === "inbox"
          ? "bg-[#faece5] text-[#d1453b] font-bold"
          : "text-black hover:bg-gray-100"
      }`,
    },
    {
      id: "today",
      label: "Today",
      icon: <CalendarOutlined />,
      count: todayCount,
      onClick: () => onSelect?.("today"),
      className: `flex items-center gap-2 text-[16px] px-2.5 py-2 cursor-pointer rounded-lg ${
        selected === "today"
          ? "bg-[#faece5] text-[#d1453b] font-bold"
          : "text-black hover:bg-gray-100"
      }`,
    },
    {
      id: "completed",
      label: "Completed",
      icon: <CheckCircleOutlined />,
      count: completedCount,
      onClick: () => onSelect?.("completed"),
      className: `flex items-center gap-2 text-[16px] px-2.5 py-2 cursor-pointer rounded-lg ${
        selected === "completed"
          ? "bg-[#faece5] text-[#d1453b] font-bold"
          : "text-black hover:bg-gray-100"
      }`,
    },
    {
      id: "more",
      label: "More",
      icon: <MenuOutlined />,
      className: "flex items-center gap-2 text-[15px] px-2.5 py-2 cursor-pointer rounded-lg text-black bg-gray-100 mt-2",
    },
  ], [selected, inboxCount, todayCount, completedCount, onSelect]);

  // Define project items
  const projectItems: SidebarItem[] = useMemo(() => [
    {
      id: "getting-started",
      label: "Getting Started",
      icon: <NumberOutlined className="text-lg mr-2" />,
      count: 13,
      className: "flex items-center gap-2 py-2 text-[15px] text-gray-800 cursor-pointer hover:bg-gray-100 rounded-lg",
    },
  ], []);

  // Define bottom section items
  const bottomItems: SidebarItem[] = useMemo(() => [
    {
      id: "add-team",
      label: "Add a team",
      icon: <TeamOutlined />,
      className: "text-gray-700 mt-1 flex items-center pl-0",
    },
    {
      id: "help",
      label: "Help & resources",
      icon: <QuestionCircleOutlined className="text-lg" />,
      className: "flex items-center mt-3 mb-2 text-gray-700 gap-2",
    },
  ], []);

  // Shuffle items based on seed when v1 is enabled
  const shuffledNavItems = isDynamicEnabled ? reorderElements(navItems) : navItems;
  const shuffledProjectItems = isDynamicEnabled ? reorderElements(projectItems) : projectItems;
  const shuffledBottomItems = isDynamicEnabled ? reorderElements(bottomItems) : bottomItems;

  const sidebarAttributes = getElementAttributes("sidebar", 0);
  const sidebarXPath = getElementXPath("sidebar");

  return (
    <aside 
      {...sidebarAttributes}
      data-xpath={sidebarXPath}
      className={className || "w-[280px] bg-[#f8f6f2] border-r border-gray-200 min-h-screen flex flex-col justify-between fixed top-0 left-0 h-full px-4 pb-4 pt-2 z-30"}
    >
      <div
        {...getElementAttributes("sidebar_top_section", 0)}
        data-xpath={getElementXPath("sidebar_top_section")}
      >
        {/* Profile */}
        <div 
          {...getElementAttributes("sidebar_profile", 0)}
          data-xpath={getElementXPath("sidebar_profile")}
          className="flex items-center mb-6 px-1 gap-2"
        >
          <div className="bg-[#d1453b] px-3 py-1 rounded flex items-center h-9 w-full">
            <span className="font-bold text-white text-lg w-full text-center">
              AutoList
            </span>
          </div>
        </div>
        {/* Navigation */}
        <ul 
          {...getElementAttributes("sidebar_nav_list", 0)}
          data-xpath={getElementXPath("sidebar_nav_list")}
          className="mb-4"
        >
          {shuffledNavItems.map((item, index) => {
            const attributes = getElementAttributes("sidebar_nav_item", index);
            const xpath = getElementXPath("sidebar_nav_item");
            return (
              <li
                key={item.id}
                {...attributes}
                data-xpath={xpath}
                onClick={item.onClick}
                className={item.className}
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {item.count !== undefined && (
                  <span className="text-xs bg-gray-200 rounded-full px-2 py-0.5 font-medium">
                    {item.count}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
        {/* Projects */}
        <div
          {...getElementAttributes("sidebar_projects", 0)}
          data-xpath={getElementXPath("sidebar_projects")}
        >
          <div 
            {...getElementAttributes("sidebar_projects_header", 0)}
            data-xpath={getElementXPath("sidebar_projects_header")}
            className="flex items-center mb-2 mt-7 text-md font-bold text-gray-700 cursor-pointer select-none"
          >
            <DownOutlined className="mr-2 text-xs" style={{ fontSize: 15 }} />{" "}
            My Projects
          </div>
          <ul 
            {...getElementAttributes("sidebar_project_list", 0)}
            data-xpath={getElementXPath("sidebar_project_list")}
            className="ml-2"
          >
            {shuffledProjectItems.map((item, index) => {
              const attributes = getElementAttributes("sidebar_project_item", index);
              const xpath = getElementXPath("sidebar_project_item");
              return (
                <li
                  key={item.id}
                  {...attributes}
                  data-xpath={xpath}
                  className={item.className}
                >
                  {item.icon}
                  <span className="flex-1">
                    {item.label} {item.id === "getting-started" && <span className="ml-1 text-base">👋</span>}
                  </span>
                  {item.count !== undefined && (
                    <span className="bg-gray-200 text-xs py-0.5 px-2 rounded-full">
                      {item.count}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div 
        {...getElementAttributes("sidebar_bottom_section", 0)}
        data-xpath={getElementXPath("sidebar_bottom_section")}
        className="px-1"
      >
        {shuffledBottomItems.map((item, index) => {
          const attributes = getElementAttributes("sidebar_bottom_item", index);
          const xpath = getElementXPath("sidebar_bottom_item");
          
          if (item.id === "add-team") {
            return (
              <Button
                key={item.id}
                {...attributes}
                data-xpath={xpath}
                icon={item.icon}
                type="text"
                className={item.className}
              >
                <span className="ml-2">{item.label}</span>
              </Button>
            );
          }
          
          return (
            <div
              key={item.id}
              {...attributes}
              data-xpath={xpath}
              className={item.className}
            >
              {item.icon}
              <span className="text-sm">{item.label}</span>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
