"use client";
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

export default function Sidebar({
  onSelect,
  selected,
  inboxCount = 0,
  todayCount = 0,
  completedCount = 0,
}: {
  onSelect?: (v: string) => void;
  selected?: string;
  inboxCount?: number;
  todayCount?: number;
  completedCount?: number;
}) {
  return (
    <aside className="w-[280px] bg-[#f8f6f2] border-r border-gray-200 min-h-screen flex flex-col justify-between fixed top-0 left-0 h-full px-4 pb-4 pt-2 z-30">
      <div>
        {/* Profile */}
        <div className="flex items-center mb-6 px-1 gap-2">
          <div className="bg-[#d1453b] px-3 py-1 rounded flex items-center h-9 w-full">
            <span className="font-bold text-white text-lg w-full text-center">
              AutoList
            </span>
          </div>
        </div>
        {/* Navigation */}
        <ul className="mb-4">
          <li
            onClick={() => {
              logEvent(EVENT_TYPES.CHECK_SIDEBAR_INBOX_CLICKED, {
                label: "Inbox",
                count: inboxCount,
              });
           if (onSelect) onSelect("inbox");
            }}
            className={`flex items-center gap-2 text-[16px] px-2.5 py-2 cursor-pointer rounded-lg ${
              selected === "inbox"
                ? "bg-[#faece5] text-[#d1453b] font-bold"
                : "text-black hover:bg-gray-100"
            }`}
          >
            {" "}
            <InboxOutlined />
            <span className="flex-1">Inbox</span>{" "}
            <span className="text-xs bg-gray-200 rounded-full px-2 py-0.5 font-medium">
              {inboxCount}
            </span>
          </li>
          <li
            className={
              "flex items-center gap-2 text-[16px] px-2.5 py-2 cursor-pointer rounded-lg " +
              (selected === "today"
                ? "bg-[#faece5] text-[#d1453b] font-bold"
                : "text-black hover:bg-gray-100")
            }
            onClick={() => {
              logEvent(EVENT_TYPES.CHECK_SIDEBAR_TODAY_CLICKED, {
                label: "Today",
                count: todayCount,
              });
            if (onSelect) onSelect("today");
            }}
          >
            {" "}
            <CalendarOutlined /> <span className="flex-1">Today</span>{" "}
            <span className="text-xs bg-gray-200 rounded-full px-2 py-0.5 font-medium">
              {todayCount}
            </span>
          </li>
          <li
            onClick={() => {
              logEvent(EVENT_TYPES.CHECK_SIDEBAR_COMPLETE_CLICKED, {
                label: "Completed",
                count: completedCount,
              });
               if (onSelect) onSelect("completed");
            }}
            className={`flex items-center gap-2 text-[16px] px-2.5 py-2 cursor-pointer rounded-lg ${
              selected === "completed"
                ? "bg-[#faece5] text-[#d1453b] font-bold"
                : "text-black hover:bg-gray-100"
            }`}
          >
            {" "}
            <CheckCircleOutlined /> <span className="flex-1">
              Completed
            </span>{" "}
            <span className="text-xs bg-gray-200 rounded-full px-2 py-0.5 font-medium">
              {completedCount}
            </span>
          </li>
          <li className="flex items-center gap-2 text-[15px] px-2.5 py-2 cursor-pointer rounded-lg text-black bg-gray-100 mt-2">
            {" "}
            <MenuOutlined /> <span className="flex-1">More</span>
          </li>
        </ul>
        {/* Projects */}
        <div>
          <div className="flex items-center mb-2 mt-7 text-md font-bold text-gray-700 cursor-pointer select-none">
            <DownOutlined className="mr-2 text-xs" style={{ fontSize: 15 }} />{" "}
            My Projects
          </div>
          <ul className="ml-2">
            <li className="flex items-center gap-2 py-2 text-[15px] text-gray-800 cursor-pointer hover:bg-gray-100 rounded-lg">
              <NumberOutlined className="text-lg mr-2" />
              <span className="flex-1">
                Getting Started <span className="ml-1 text-base">👋</span>
              </span>
              <span className="bg-gray-200 text-xs py-0.5 px-2 rounded-full">
                13
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div className="px-1">
        <Button
          icon={<TeamOutlined />}
          type="text"
          className="text-gray-700 mt-1 flex items-center pl-0"
        >
          <span className="ml-2">Add a team</span>
        </Button>
        <div className="flex items-center mt-3 mb-2 text-gray-700 gap-2">
          <QuestionCircleOutlined className="text-lg" />{" "}
          <span className="text-sm">Help & resources</span>
        </div>
      </div>
    </aside>
  );
}
