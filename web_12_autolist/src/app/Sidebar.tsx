"use client";

import { useMemo, useState, type ReactNode } from "react";
import { EVENT_TYPES, logEvent } from "@/library/events";
import {
  UserOutlined,
  PlusOutlined,
  InboxOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  MenuOutlined,
  TeamOutlined,
  DownOutlined,
  NumberOutlined,
} from "@ant-design/icons";
import { Button } from "antd";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { useTeams } from "@/context/TeamsContext";
import { useProjects } from "@/context/ProjectsContext";
import { CreateProjectModal } from "@/components/CreateProjectModal";
import CreateTeamModal from "@/components/CreateTeamModal";

type SidebarItem = {
  id: string;
  label: string;
  icon: ReactNode;
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
  const dyn = useDynamicSystem();
  const wrap = (_key: string, node: ReactNode) => node;
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [chatsOpen, setChatsOpen] = useState(true);
  const { teams, addTeam } = useTeams();
  const { projects } = useProjects();

  const sidebarText = {
    workspace: dyn.v3.getVariant("sidebar_heading", TEXT_VARIANTS_MAP, "Workspace"),
    projects: dyn.v3.getVariant("projects_heading", TEXT_VARIANTS_MAP, "Projects"),
    teams: dyn.v3.getVariant("teams_heading", TEXT_VARIANTS_MAP, "Teams"),
    quick: dyn.v3.getVariant("quick_actions_title", TEXT_VARIANTS_MAP, "Quick actions"),
  };

  const sidebarIds = {
    sidebar: dyn.v3.getVariant("sidebar", ID_VARIANTS_MAP, "sidebar"),
    navList: dyn.v3.getVariant("sidebar-nav-item", ID_VARIANTS_MAP, "sidebar-nav-list"),
    projects: dyn.v3.getVariant("sidebar-projects", ID_VARIANTS_MAP, "sidebar-projects"),
    projectItem: dyn.v3.getVariant("sidebar-projects", ID_VARIANTS_MAP, "sidebar-project-item"),
    teams: dyn.v3.getVariant("sidebar-teams", ID_VARIANTS_MAP, "sidebar-teams"),
    teamItem: dyn.v3.getVariant("sidebar-teams", ID_VARIANTS_MAP, "sidebar-team-item"),
    chats: dyn.v3.getVariant("chat-thread", ID_VARIANTS_MAP, "chat-thread"),
  };

  const sidebarClasses = {
    navLink: dyn.v3.getVariant("nav-link", CLASS_VARIANTS_MAP, "flex items-center gap-2 px-2.5 py-2 rounded-lg text-gray-800 hover:bg-gray-100"),
    buttonPrimary: dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, "bg-[#d1453b] text-white hover:bg-[#b53b34]"),
    card: dyn.v3.getVariant("card-surface", CLASS_VARIANTS_MAP, "rounded-xl border border-gray-200 bg-white shadow-sm"),
    badge: dyn.v3.getVariant("badge-priority", CLASS_VARIANTS_MAP, "text-xs px-2 py-1 rounded-full bg-red-100 text-red-700"),
  };

  const navItems: SidebarItem[] = useMemo(
    () => [
      {
        id: "tasks-header",
        label: dyn.v3.getVariant("sidebar_heading", TEXT_VARIANTS_MAP, "Tasks"),
        icon: null,
        className: "flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wide px-2.5 py-2",
      },
      {
        id: "backlog",
        label: dyn.v3.getVariant("inbox_heading", TEXT_VARIANTS_MAP, "Backlog"),
        icon: <InboxOutlined />,
        count: inboxCount,
        onClick: () => onSelect?.("inbox"),
        className: `flex items-center gap-2 text-[16px] px-2.5 py-2 cursor-pointer rounded-lg ${
          selected === "inbox"
            ? "bg-[#faece5] text-[#d1453b] font-bold"
            : sidebarClasses.navLink
        }`,
      },
      {
        id: "today",
        label: dyn.v3.getVariant("today_heading", TEXT_VARIANTS_MAP, "Today"),
        icon: <CalendarOutlined />,
        count: todayCount,
        onClick: () => onSelect?.("today"),
        className: `flex items-center gap-2 text-[16px] px-2.5 py-2 cursor-pointer rounded-lg ${
          selected === "today"
            ? "bg-[#faece5] text-[#d1453b] font-bold"
            : sidebarClasses.navLink
        }`,
      },
      {
        id: "completed",
        label: dyn.v3.getVariant("completed_heading", TEXT_VARIANTS_MAP, "Completed"),
        icon: <CheckCircleOutlined />,
        count: completedCount,
        onClick: () => onSelect?.("completed"),
        className: `flex items-center gap-2 text-[16px] px-2.5 py-2 cursor-pointer rounded-lg ${
          selected === "completed"
            ? "bg-[#faece5] text-[#d1453b] font-bold"
            : sidebarClasses.navLink
        }`,
      },
      {
        id: "more",
        label: dyn.v3.getVariant("quick_actions_title", TEXT_VARIANTS_MAP, "More"),
        icon: <MenuOutlined />,
        className: "flex items-center gap-2 text-[15px] px-2.5 py-2 rounded-lg text-gray-600 mt-1 cursor-default",
      },
    ],
    [completedCount, inboxCount, onSelect, selected, sidebarClasses.navLink, todayCount, dyn.v3]
  );

  const projectItems: SidebarItem[] = useMemo(() => {
    return projects.map((project) => ({
      id: project.id,
      label: project.name,
      icon: <NumberOutlined className="text-lg mr-2" />,
      count: project.badge ? Number(project.badge) : undefined,
      onClick: () => onSelect?.("getting-started"),
      className: `${sidebarClasses.navLink} text-[15px]`,
    }));
  }, [projects, onSelect, sidebarClasses.navLink]);

  const teamItems: SidebarItem[] = useMemo(() => {
    return teams.map((team) => ({
      id: team.id,
      label: team.name,
      icon: <TeamOutlined className="text-lg mr-2" />,
      onClick: () => onSelect?.(`team-${team.id}`),
      className: `${sidebarClasses.navLink} text-[15px]`,
    }));
  }, [teams, onSelect, sidebarClasses.navLink]);

  const chatUsers = useMemo(
    () => [
      { id: "u1", name: "Alex Carter", role: "Product Designer", status: "online", avatar: "https://randomuser.me/api/portraits/men/12.jpg" },
      { id: "u2", name: "Jamie Lee", role: "Engineer", status: "away", avatar: "https://randomuser.me/api/portraits/women/18.jpg" },
      { id: "u3", name: "Taylor Brown", role: "PM", status: "online", avatar: "https://randomuser.me/api/portraits/men/25.jpg" },
      { id: "u4", name: "Riley Chen", role: "QA", status: "offline", avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
    ],
    []
  );

  const orderedNavItems = dyn.v1.changeOrderElements("sidebar-nav-items", navItems.length).map((idx) => navItems[idx]);
  const orderedProjectItems = dyn.v1.changeOrderElements("sidebar-project-items", projectItems.length || 1).map((idx) => projectItems[idx]);
  const orderedTeamItems = dyn.v1.changeOrderElements("sidebar-team-items", teamItems.length || 1).map((idx) => teamItems[idx]);
  const orderedChatUsers = dyn.v1.changeOrderElements("sidebar-chats", chatUsers.length).map((idx) => chatUsers[idx]);

  const handleChatSelect = (userId: string) => {
    logEvent(EVENT_TYPES.CHAT_OPEN, { userId, seed: dyn.seed });
    onSelect?.(`chat-${userId}`);
  };

  return wrap(
    "sidebar-panel",
    <aside
      id={sidebarIds.sidebar}
      data-dyn-key="sidebar-panel"
      className={
        className ||
        "w-[280px] bg-[#f8f6f2] border-r border-gray-200 min-h-screen flex flex-col justify-start items-start gap-3 fixed top-0 left-0 h-full px-4 pb-4 pt-2 z-30"
      }
    >
      {wrap(
        "sidebar-top-section",
        <div className="w-full">
          <div className="flex items-center mb-6 px-1 gap-2">
            <div className="flex items-center justify-center h-16 w-full rounded-2xl bg-gradient-to-r from-[#d1453b] via-[#e85d4e] to-[#f59f8b] text-white shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/15 flex items-center justify-center font-semibold text-lg shadow-inner">
                  A
                </div>
                <div className="flex flex-col leading-tight text-left">
                  <span
                    id={dyn.v3.getVariant("hero-title", ID_VARIANTS_MAP, "autolist-title")}
                    className="font-bold text-xl tracking-tight"
                  >
                    AutoList
                  </span>
                  {/*<span className="text-xs text-white/80">Workspace</span>*/}
                </div>
              </div>
            </div>
          </div>
          {wrap(
            "sidebar-nav-block",
            <ul id={sidebarIds.navList} className="mb-4">
              {orderedNavItems.map((item, index) =>
                wrap(
                  `sidebar-nav-item-${item.id}`,
                  <li
                    key={item.id}
                    id={dyn.v3.getVariant("sidebar-nav-item", ID_VARIANTS_MAP, `nav-${item.id}`)}
                    data-dyn-key="sidebar-nav-item"
                    className={item.className}
                    onClick={item.onClick}
                  >
                    {item.icon}
                    <span className="flex-1">{item.label}</span>
                    {item.count !== undefined && (
                      <span className={sidebarClasses.badge}>{item.count}</span>
                    )}
                  </li>
                )
              )}
            </ul>
          )}
          {wrap(
            "sidebar-projects",
            <div id={sidebarIds.projects}>
              <div className="flex items-center justify-between mb-2 mt-5">
                <div
                  id={dyn.v3.getVariant("sidebar-projects", ID_VARIANTS_MAP, "sidebar-projects-header")}
                  className="flex items-center text-md font-bold text-gray-700 cursor-pointer select-none"
                >
                  <DownOutlined className="mr-2 text-xs" style={{ fontSize: 15 }} /> {sidebarText.projects}
                </div>
                <Button
                  size="small"
                  className="text-[#d1453b]"
                  type="text"
                  icon={<PlusOutlined />}
                  onClick={() => setProjectModalOpen(true)}
                >
                  {dyn.v3.getVariant("cta_add_task", TEXT_VARIANTS_MAP, "Add")}
                </Button>
              </div>
              <ul className="ml-2">
                {orderedProjectItems.length === 0 ? (
                  <li className="text-sm text-gray-500 py-1 px-1">
                    {dyn.v3.getVariant("empty_state_title", TEXT_VARIANTS_MAP, "No projects yet")}
                  </li>
                ) : (
                  orderedProjectItems.map((item, index) =>
                    wrap(
                      `sidebar-project-item-${index}`,
                      <li
                        key={item.id}
                        id={dyn.v3.getVariant("sidebar-projects", ID_VARIANTS_MAP, `project-${index}`)}
                        className={item.className}
                        onClick={item.onClick}
                      >
                        {item.icon}
                        <span className="flex-1">
                          {item.label} {item.id === "getting-started" && <span className="ml-1 text-base">👋</span>}
                        </span>
                        {item.count !== undefined && (
                          <span className="bg-gray-200 text-xs py-0.5 px-2 rounded-full">{item.count}</span>
                        )}
                      </li>
                    )
                  )
                )}
              </ul>
            </div>
          )}
          {wrap(
            "sidebar-teams",
            <div id={sidebarIds.teams}>
              <div className="flex items-center justify-between mb-2 mt-6">
                <div className="flex items-center text-md font-bold text-gray-700 cursor-pointer select-none">
                  <TeamOutlined className="mr-2 text-sm" /> {sidebarText.teams}
                </div>
                <Button
                  size="small"
                  className="text-[#d1453b]"
                  type="text"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    logEvent(EVENT_TYPES.ADD_TEAM_CLICKED, { timestamp: Date.now() });
                    setTeamModalOpen(true);
                  }}
                >
                  {dyn.v3.getVariant("save_task", TEXT_VARIANTS_MAP, "Add")}
                </Button>
              </div>
              <ul className="ml-2">
                {orderedTeamItems.length === 0 ? (
                  <li className="text-sm text-gray-500 py-1 px-1 flex items-center gap-2">
                    <TeamOutlined className="text-sm" /> {dyn.v3.getVariant("empty_state_description", TEXT_VARIANTS_MAP, "No teams yet")}
                  </li>
                ) : (
                  orderedTeamItems.map((item, index) =>
                    wrap(
                      `sidebar-team-item-${index}`,
                      <li
                        key={item.id}
                        id={dyn.v3.getVariant("sidebar-teams", ID_VARIANTS_MAP, `team-${index}`)}
                        className={item.className}
                        onClick={item.onClick}
                      >
                        {item.icon}
                        <span className="flex-1">{item.label}</span>
                      </li>
                    )
                  )
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {wrap(
        "sidebar-chats",
        <div className="mt-3 px-1 w-full" id={sidebarIds.chats}>
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
              {chatsOpen ? dyn.v3.getVariant("cancel_action", TEXT_VARIANTS_MAP, "Hide") : dyn.v3.getVariant("save_task", TEXT_VARIANTS_MAP, "Show")}
            </Button>
          </div>
          {chatsOpen && (
            <div className="space-y-2">
              {orderedChatUsers.map((user, index) =>
                wrap(
                  `chat-user-${index}`,
                  <div
                    key={user.id}
                    className={`${sidebarClasses.card} flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-50`}
                    onClick={() => handleChatSelect(user.id)}
                    data-dyn-key="chat-user-row"
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
                )
              )}
            </div>
          )}
        </div>
      )}

      {wrap(
        "sidebar-profile",
        <div className="mt-4 px-1 w-full">
          <div className={`${sidebarClasses.card} flex items-center gap-3 p-3`}>
            <UserOutlined className="text-xl" />
            <div>
              <div className="font-semibold text-gray-900">Autoppia PM</div>
              <div className="text-xs text-gray-500">Tech Lead</div>
            </div>
          </div>
        </div>
      )}

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
