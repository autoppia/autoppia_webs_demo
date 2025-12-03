"use client";
import { useMemo, useState } from "react";
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
import { useSeedLayout } from "@/dynamic/v3-dynamic";
import { useTeams } from "@/context/TeamsContext";
import { useProjects } from "@/context/ProjectsContext";
import { CreateProjectModal } from "./components/CreateProjectModal";
import CreateTeamModal from "./components/CreateTeamModal";

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
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [chatsOpen, setChatsOpen] = useState(true);
  const { reorderElements, getElementAttributes, getElementXPath, isDynamicEnabled } = useSeedLayout();
  const { teams, addTeam } = useTeams();
  const { projects, addProject } = useProjects();

  // Define all sidebar navigation items
  const navItems: SidebarItem[] = useMemo(() => [
    {
      id: "tasks-header",
      label: "Tasks",
      icon: null,
      className: "flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wide px-2.5 py-2"
    },
    {
      id: "backlog",
      label: "Backlog",
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
      className: "flex items-center gap-2 text-[15px] px-2.5 py-2 rounded-lg text-gray-600 mt-1 cursor-default",
    },
  ], [selected, inboxCount, todayCount, completedCount, onSelect]);

  // Define project items
  const projectItems: SidebarItem[] = useMemo(() => {
    if (!projects || projects.length === 0) return [];
    return projects.map((project) => ({
      id: project.id,
      label: project.name,
      icon: <NumberOutlined className="text-lg mr-2" />,
      count: project.badge ? Number(project.badge) : undefined,
      onClick: () => onSelect?.("getting-started"),
      className: "flex items-center gap-2 py-2 text-[15px] text-gray-800 cursor-pointer hover:bg-gray-100 rounded-lg",
    }));
  }, [projects, onSelect]);

  const teamItems: SidebarItem[] = useMemo(() => {
    return teams.map((team) => ({
      id: team.id,
      label: team.name,
      icon: <TeamOutlined className="text-lg mr-2" />,
      onClick: () => onSelect?.(`team-${team.id}`),
      className: "flex items-center gap-2 py-2 text-[15px] text-gray-800 cursor-pointer hover:bg-gray-100 rounded-lg",
    }));
  }, [teams, onSelect]);

  const chatUsers = useMemo(
    () => [
      { id: "u1", name: "Alex Carter", role: "Product Designer", status: "online", avatar: "https://randomuser.me/api/portraits/men/12.jpg" },
      { id: "u2", name: "Jamie Lee", role: "Engineer", status: "away", avatar: "https://randomuser.me/api/portraits/women/18.jpg" },
      { id: "u3", name: "Taylor Brown", role: "PM", status: "online", avatar: "https://randomuser.me/api/portraits/men/25.jpg" },
      { id: "u4", name: "Riley Chen", role: "QA", status: "offline", avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
    ],
    []
  );
  const handleChatSelect = (userId: string) => {
    onSelect?.(`chat-${userId}`);
  };

  // Define bottom section items
  const bottomItems: SidebarItem[] = useMemo(() => [], []);

  // Shuffle items based on seed when v1 is enabled
  const shuffledNavItems = isDynamicEnabled ? reorderElements(navItems) : navItems;
  const shuffledProjectItems = isDynamicEnabled ? reorderElements(projectItems) : projectItems;
  const shuffledTeamItems = isDynamicEnabled ? reorderElements(teamItems) : teamItems;
  const shuffledBottomItems = isDynamicEnabled ? reorderElements(bottomItems) : bottomItems;

  const sidebarAttributes = getElementAttributes("sidebar", 0);
  const sidebarXPath = getElementXPath("sidebar");

  return (
    <aside 
      {...sidebarAttributes}
      data-xpath={sidebarXPath}
      className={className || "w-[280px] bg-[#f8f6f2] border-r border-gray-200 min-h-screen flex flex-col justify-start items-start gap-3 fixed top-0 left-0 h-full px-4 pb-4 pt-2 z-30"}
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
          <div className="bg-[#d1453b] px-6 py-4 rounded-lg flex items-center justify-center h-14 w-full shadow-sm">
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
        <div className="flex items-center justify-between mb-2 mt-5">
          <div 
            {...getElementAttributes("sidebar_projects_header", 0)}
            data-xpath={getElementXPath("sidebar_projects_header")}
            className="flex items-center text-md font-bold text-gray-700 cursor-pointer select-none"
          >
            <DownOutlined className="mr-2 text-xs" style={{ fontSize: 15 }} />{" "}
            My Projects
          </div>
        </div>
        <ul 
          {...getElementAttributes("sidebar_project_list", 0)}
          data-xpath={getElementXPath("sidebar_project_list")}
          className="ml-2"
          >
            {shuffledProjectItems.length === 0 ? (
              <li className="text-sm text-gray-500 py-1 px-1">No projects yet</li>
            ) : (
              shuffledProjectItems.map((item, index) => {
                const attributes = getElementAttributes("sidebar_project_item", index);
                const xpath = getElementXPath("sidebar_project_item");
                return (
                  <li
                    key={item.id}
                    {...attributes}
                    data-xpath={xpath}
                    className={item.className}
                    onClick={item.onClick}
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
              })
            )}
          </ul>
          <div className="mt-2">
            <Button
              size="small"
              className="w-full text-left text-[#d1453b]"
              type="text"
              icon={<PlusOutlined />}
              onClick={() => setProjectModalOpen(true)}
            >
              Add project
            </Button>
          </div>

          <div 
            {...getElementAttributes("sidebar_teams_header", 0)}
            data-xpath={getElementXPath("sidebar_teams_header")}
            className="flex items-center mb-2 mt-6 text-md font-bold text-gray-700 cursor-pointer select-none"
          >
            <TeamOutlined className="mr-2 text-sm" /> My Teams
          </div>
          <ul
            {...getElementAttributes("sidebar_team_list", 0)}
            data-xpath={getElementXPath("sidebar_team_list")}
            className="ml-2"
          >
            {shuffledTeamItems.length === 0 ? (
              <li className="text-sm text-gray-500 py-1 px-1 flex items-center gap-2">
                <TeamOutlined className="text-sm" /> No teams yet
              </li>
            ) : (
              shuffledTeamItems.map((item, index) => {
                const attributes = getElementAttributes("sidebar_team_item", index);
                const xpath = getElementXPath("sidebar_team_item");
                return (
                  <li
                    key={item.id}
                    {...attributes}
                    data-xpath={xpath}
                    className={item.className}
                  >
                    {item.icon}
                    <span className="flex-1">{item.label}</span>
                  </li>
                );
              })
            )}
          </ul>
          <div className="mt-2">
            <Button
              size="small"
              className="w-full text-left text-[#d1453b]"
              type="text"
              icon={<PlusOutlined />}
              onClick={() => setTeamModalOpen(true)}
            >
              Add a team
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-3 px-1">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center font-bold text-gray-700 text-md">
            <DownOutlined className="mr-2 text-xs" /> Chats
          </div>
          <Button
            size="small"
            type="link"
            className="p-0 h-auto text-[#d1453b]"
            onClick={() => setChatsOpen((v) => !v)}
          >
            {chatsOpen ? "Hide" : "Show"}
          </Button>
        </div>
        {chatsOpen && (
          <div className="space-y-2">
            {chatUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 bg-white shadow-sm cursor-pointer hover:bg-gray-50"
                onClick={() => handleChatSelect(user.id)}
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover border"
                />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-800">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.role}</div>
                </div>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    user.status === "online"
                      ? "bg-green-500"
                      : user.status === "away"
                      ? "bg-yellow-400"
                      : "bg-gray-400"
                  }`}
                  title={user.status}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-4 px-1">
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white shadow-sm p-3">
          <img
            src="https://randomuser.me/api/portraits/men/1.jpg"
            alt="John Wick"
            className="w-10 h-10 rounded-full object-cover border"
          />
          <div>
            <div className="font-semibold text-gray-900">John Wick</div>
            <div className="text-xs text-gray-500">Tech Lead</div>
          </div>
        </div>
      </div>
      <CreateProjectModal open={projectModalOpen} onClose={() => setProjectModalOpen(false)} />
      <CreateTeamModal
        open={teamModalOpen}
        onCancel={() => setTeamModalOpen(false)}
        onOk={(values) => {
          addTeam({
            name: values.name,
            description: values.description,
            members: values.members ?? [],
          });
          setTeamModalOpen(false);
        }}
      />
    </aside>
  );
}
