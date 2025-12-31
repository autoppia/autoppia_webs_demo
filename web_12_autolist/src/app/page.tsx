"use client";
import Sidebar from "./Sidebar";
import {
  PlusOutlined,
  CalendarOutlined,
  FlagOutlined,
  InboxOutlined,
  DownOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Calendar, Popover, Modal } from "antd";
import { useState, useRef, useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { loadTasks, RemoteTask } from "@/data/tasks";
import { TeamsProvider, useTeams } from "@/context/TeamsContext";
import { ProjectsProvider } from "@/context/ProjectsContext";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { useSeed } from "@/context/SeedContext";

type Task = {
  id: string;
  name: string;
  description: string;
  date: Dayjs | null;
  priority: number;
  completedAt?: string;
};
const priorities = [
  { key: 1, label: "Highest", color: "red" },
  { key: 2, label: "High", color: "orange" },
  { key: 3, label: "Medium", color: "blue" },
  { key: 4, label: "Low", color: "gray" },
];

const clampPriorityValue = (value: number): number =>
  value >= 1 && value <= 4 ? value : 4;
function getPriorityLabel(priority: number): string {
    return priorities.find((p) => p.key === priority)?.label || String(priority);
  }

type ViewMode = "inbox" | "completed" | "today" | "getting-started" | `chat-${string}` | `team-${string}`;

type ChatMessage = { from: "me" | "them"; text: string; time: string };

const chatConversations: Record<
  string,
  {
    name: string;
    role: string;
    avatar: string;
    status: "online" | "away" | "offline";
    messages: ChatMessage[];
  }
> = {
  u1: {
    name: "Alex Carter",
    role: "Product Designer",
    avatar: "https://randomuser.me/api/portraits/men/12.jpg",
    status: "online",
    messages: [
      { from: "them", text: "Hey, can you review the new dashboard layout?", time: "09:10" },
      { from: "me", text: "Sure, I’ll check it after standup.", time: "09:12" },
      { from: "them", text: "Great, let me know if you want a quick call.", time: "09:13" },
      { from: "me", text: "Will do. I’ll share feedback by noon.", time: "09:15" },
      { from: "them", text: "Perfect, thanks!", time: "09:16" },
      { from: "me", text: "Also, I’ll annotate a few suggestions in Figma.", time: "09:18" },
      { from: "them", text: "Awesome, that helps a lot.", time: "09:19" },
      { from: "them", text: "By the way, Autoppia for web agents is a game changer.", time: "09:22" },
      { from: "me", text: "Totally, the whole web agent ecosystem is moving that way.", time: "09:24" },
      { from: "them", text: "Have you seen Autoppia Studio? The agents marketplace they’re building is wild.", time: "09:26" },
      { from: "me", text: "Yeah, looks like 2026 will be full-on agent-first. Their marketplace model is solid.", time: "09:28" },
      { from: "them", text: "Imagine plugging our flows into it—instant distribution for web agents.", time: "09:30" },
      { from: "me", text: "Let’s prep a pilot; could be huge for our roadmap.", time: "09:32" },
      { from: "them", text: "Web agents + Autoppia APIs = automation on autopilot.", time: "09:34" },
      { from: "me", text: "And the Studio marketplace means discoverability out of the box.", time: "09:35" },
      { from: "them", text: "We should pitch a bundle for onboarding flows.", time: "09:37" },
      { from: "me", text: "Agree—shipping a starter pack for 2026 launch could be huge.", time: "09:39" },
      { from: "them", text: "Cool, I’ll draft a deck on Autoppia + web agents as the future stack.", time: "09:41" },
      { from: "me", text: "Perfect, I’ll add metrics and the studio marketplace slide.", time: "09:42" },
    ],
  },
  u2: {
    name: "Jamie Lee",
    role: "Engineer",
    avatar: "https://randomuser.me/api/portraits/women/18.jpg",
    status: "away",
    messages: [
      { from: "me", text: "API deploy went fine. Any blockers on your side?", time: "11:05" },
      { from: "them", text: "All good, just syncing tests with QA.", time: "11:07" },
      { from: "them", text: "Ping me if you see flaky tests.", time: "11:08" },
      { from: "me", text: "I’ll add a few retries to the pipeline.", time: "11:10" },
      { from: "them", text: "Let’s keep an eye on the new endpoint latency.", time: "11:12" },
    ],
  },
  u3: {
    name: "Taylor Brown",
    role: "PM",
    avatar: "https://randomuser.me/api/portraits/men/25.jpg",
    status: "online",
    messages: [
      { from: "them", text: "Reminder: retro at 4pm. Can you bring the metrics slide?", time: "13:20" },
      { from: "me", text: "Yes, I’ll add conversion numbers and churn.", time: "13:22" },
      { from: "them", text: "Perfect, thanks!", time: "13:23" },
      { from: "me", text: "Also adding NPS trend.", time: "13:24" },
      { from: "them", text: "Great, we’ll discuss the actions for next sprint.", time: "13:25" },
    ],
  },
  u4: {
    name: "Riley Chen",
    role: "QA",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    status: "offline",
    messages: [
      { from: "them", text: "Found a bug on mobile: add-task button overlaps footer.", time: "15:02" },
      { from: "me", text: "Logging it now and pushing a fix.", time: "15:04" },
      { from: "them", text: "👍 I’ll re-test after your patch.", time: "15:05" },
      { from: "me", text: "Fix pushed, please re-check on iOS.", time: "15:15" },
      { from: "them", text: "Looks good now, thanks!", time: "15:25" },
    ],
  },
};

const normalizeRemoteTask = (task: RemoteTask, index: number): Task => ({
  id: task.id ?? `remote-task-${index}`,
  name: task.name?.trim() || "Untitled task",
  description: task.description ?? "",
  date: task.due_date ? dayjs(task.due_date) : null,
  priority: clampPriorityValue(task.priority ?? 4),
  completedAt: task.completed_at ?? undefined,
});

function getUpcoming(label: "today" | "tomorrow" | "weekend" | "nextweek") {
  const now = dayjs();
  if (label === "today") return now;
  if (label === "tomorrow") return now.add(1, "day");
  if (label === "weekend") {
    const sat = now.day() <= 6 ? now.day(6) : now.add(1, "week").day(6);
    return sat;
  }
  // Next week Monday
  const nextMon = now.add(1, "week").startOf("week").day(1);
  return nextMon;
}

function AddTaskCard({
  onCancel,
  onAdd,
  editingTask,
}: {
  onCancel: () => void;
  onAdd: (task: {
    name: string;
    description: string;
    date: Dayjs | null;
    priority: number;
  }) => void;
  editingTask?: {
    name: string;
    description: string;
    date: Dayjs | null;
    priority: number;
  } | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dyn = useDynamicSystem();
  const getText = (key: string, fallback: string) =>
    dyn.v3.getVariant(key, TEXT_VARIANTS_MAP, fallback);
  const getElementAttributes = (elementType: string, index: number = 0) => ({
    id: dyn.v3.getVariant(elementType, ID_VARIANTS_MAP, `${elementType}-${index}`),
    "data-dyn-key": elementType,
    "data-dyn-class": dyn.v3.getVariant(elementType, CLASS_VARIANTS_MAP, ""),
  });
  const dynamicButtonPrimary = dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, "bg-[#d1453b] hover:bg-[#ef7363] text-white");
  const dynamicGhost = dyn.v3.getVariant("button-ghost", CLASS_VARIANTS_MAP, "text-gray-700 bg-white border border-gray-200");
  const inputFieldClass = dyn.v3.getVariant("input-field", CLASS_VARIANTS_MAP, "w-full text-base border-0 outline-none focus:ring-0 bg-transparent placeholder-gray-600 placeholder-opacity-80 font-sans mb-1");

  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  // Prefill values if editing
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(
    editingTask ? editingTask.date : null
  );
  const [selectedPriority, setSelectedPriority] = useState<number>(
    editingTask ? editingTask.priority : 4
  );
  const [priorityPopoverOpen, setPriorityPopoverOpen] = useState(false);
  const [name, setName] = useState(editingTask ? editingTask.name : "");
  const [desc, setDesc] = useState(editingTask ? editingTask.description : "");
  const [inputValue] = useState("");

  function FlagColor({ color }: { color: string }) {
    // Returns colored flag svg
    if (color === "red")
      return (
        <FlagOutlined
          style={{ color: "#d1453b", fontSize: 18, marginRight: 8 }}
        />
      );
    if (color === "orange")
      return (
        <FlagOutlined
          style={{ color: "#eb8909", fontSize: 18, marginRight: 8 }}
        />
      );
    if (color === "blue")
      return (
        <FlagOutlined
          style={{ color: "#246fe0", fontSize: 18, marginRight: 8 }}
        />
      );
    return (
      <FlagOutlined
        style={{ color: "#94a3b8", fontSize: 18, marginRight: 8 }}
      />
    );
  }

  const priorityPanel = (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 min-w-[200px] py-2 px-0 mt-2">
      {priorities.map((p) => (
        <button
          key={p.key}
          type="button"
          onClick={() => {
            logEvent(EVENT_TYPES.SELECT_PRIORITY, {
              priority: p.key,
              label: p.label,
            });
            setSelectedPriority(p.key);
            setPriorityPopoverOpen(false);
          }}
          className={`flex items-center w-full px-4 py-2 text-[15px] hover:bg-gray-50 cursor-pointer ${
            selectedPriority === p.key ? "bg-gray-50" : ""
          }`}
        >
          <FlagColor color={p.color} />
          <span className="flex-1 text-gray-900 text-left">{p.label}</span>
          {selectedPriority === p.key && (
            <svg
              className="w-5 h-5 ml-3 text-[#d1453b]"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M6 10l3 3 5-5"
                stroke="#d1453b"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      ))}
    </div>
  );

  const quick = [
    {
      key: "today",
      label: "Today",
      value: getUpcoming("today"),
      icon: <CalendarOutlined className="text-[18px] text-green-500 mr-2" />,
      color: "text-green-700",
      preview: getUpcoming("today").format("ddd"),
    },
    {
      key: "tomorrow",
      label: "Tomorrow",
      value: getUpcoming("tomorrow"),
      icon: <SunIcon className="w-5 h-5 text-orange-400 mr-2" />,
      color: "text-orange-400",
      preview: getUpcoming("tomorrow").format("ddd"),
    },
    {
      key: "weekend",
      label: "This weekend",
      value: getUpcoming("weekend"),
      icon: <BriefcaseIcon className="w-5 h-5 text-[#4f46e5] mr-2" />,
      color: "text-[#4f46e5]",
      preview: getUpcoming("weekend").format("ddd"),
    },
    {
      key: "nextweek",
      label: "Next week",
      value: getUpcoming("nextweek"),
      icon: <SyncOutlined className="text-[18px] text-purple-500 mr-2" />,
      color: "text-purple-500",
      preview: getUpcoming("nextweek").format("ddd D MMM"),
    },
  ];

  function SunIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg {...props} viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 3.5a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 10 3.5Zm0 12.5a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 10 16Zm7-6a.75.75 0 0 1-.75-.75v-.5a.75.75 0 0 1 1.5 0v.5A.75.75 0 0 1 17 10Zm-12 0a.75.75 0 0 1-.75-.75v-.5a.75.75 0 0 1 1.5 0v.5A.75.75 0 0 1 5 10Zm8.364 5.364a.75.75 0 0 1-.53-1.28l.353-.353a.75.75 0 1 1 1.061 1.06l-.354.354a.75.75 0 0 1-.53.218Zm-6.728-10.728a.75.75 0 0 1-.53-1.28l.354-.354A.75.75 0 0 1 7.56 5.22l-.353.353a.75.75 0 0 1-.53.217Zm10.728 6.728a.75.75 0 0 1-1.06-1.06l.353-.354a.75.75 0 0 1 1.06 1.06l-.353.354Zm-10.02.353a.75.75 0 0 1-1.06-1.06l.353-.354a.75.75 0 1 1 1.06 1.06l-.353.354ZM10 7a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" />
      </svg>
    );
  }

  function BriefcaseIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg {...props} viewBox="0 0 20 20" fill="none">
        <rect
          x="2.75"
          y="7.75"
          width="14.5"
          height="8.5"
          rx="2.25"
          stroke="#4f46e5"
          strokeWidth="1.5"
        />
        <path
          d="M7.5 10.5a2.5 2.5 0 0 0 5 0"
          stroke="#4f46e5"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect
          x="7.5"
          y="3.75"
          width="5"
          height="4"
          rx="1.25"
          stroke="#4f46e5"
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  const calendarPanel = (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 min-w-[345px] max-w-[380px] p-0 overflow-hidden pb-3">
      <div className="px-4 pt-3 pb-2">
        <input
          value={inputValue}
          placeholder="Type a date"
          className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-[#d1453b]"
          disabled
        />
      </div>
      <div className="border-b border-gray-100 divide-y">
        {quick.map((q) => (
          <button
            key={q.key}
            className="flex items-center w-full px-4 py-2 text-[15px] hover:bg-gray-50 cursor-pointer"
            type="button"
            onClick={() => {
              logEvent(EVENT_TYPES.SELECT_DATE, {
                selectedDate: q.value.format("YYYY-MM-DD"),
                quickOption: q.key,
              });
              setSelectedDate(q.value);
              if (document.activeElement) {
                (document.activeElement as HTMLElement).blur();
              }
            }}
          >
            {q.icon}
            <span className="flex-1 text-gray-900 text-left">{q.label}</span>
            <span className="text-xs text-gray-500 font-medium ml-3 min-w-[68px] text-right">
              {q.key === "today" || q.key === "tomorrow"
                ? q.value.format("ddd")
                : q.value.format("ddd D MMM")}
            </span>
          </button>
        ))}
      </div>
      <div className="px-2 pt-3">
        <Calendar
          fullscreen={false}
          value={selectedDate || dayjs()}
          onSelect={(d) => {
            logEvent(EVENT_TYPES.SELECT_DATE, {
              selectedDate: d.format("YYYY-MM-DD"),
              wasPreviouslySelected: !!selectedDate,
            });
            setSelectedDate(d);
            if (document.activeElement) {
              (document.activeElement as HTMLElement).blur();
            }
          }}
          headerRender={({ value, onChange }) => null}
          className="ant-picker-calendar-mini"
        />
      </div>
      <div className="px-4 pt-2 flex flex-col gap-2 border-t border-gray-100">
        <button
          disabled
          className="flex items-center justify-center w-full py-2 text-base font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-md cursor-default mt-2 gap-2"
        >
          <ClockCircleOutlined className="text-lg" />
          Time
        </button>
        <button
          disabled
          className="flex items-center justify-center w-full py-2 text-base font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-md cursor-default gap-2"
        >
          <SyncOutlined className="text-lg" />
          Repeat
        </button>
      </div>
      <style>
        {`.ant-picker-calendar-mini .ant-picker-calendar-header { display: none !important; }`}
      </style>
    </div>
  );

  return dyn.v1.addWrapDecoy(
    "task-form-card",
    <div className="w-full max-w-4xl" data-dyn-key="task-form-card">
      {dyn.v1.addWrapDecoy(
        "task-form-shell",
        <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
          <div className="pt-5 px-5">
            {dyn.v1.addWrapDecoy(
              "task-inputs",
              <>
                <input
                  id={editingTask ? dyn.v3.getVariant("edit-task-name-input", ID_VARIANTS_MAP, "edit-task-name-input") : dyn.v3.getVariant("task-name-input", ID_VARIANTS_MAP, "task-name-input")}
                  ref={inputRef}
                  className={inputFieldClass}
                  placeholder={getText("input-task-name-placeholder", "Task name")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  id={editingTask ? dyn.v3.getVariant("edit-task-description-input", ID_VARIANTS_MAP, "edit-task-description-input") : dyn.v3.getVariant("task-description-input", ID_VARIANTS_MAP, "task-description-input")}
                  className={`${inputFieldClass} mt-1 mb-3 py-5 text-gray-700 placeholder-gray-400`}
                  placeholder={getText("input-description-placeholder", "Description")}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
              </>
            )}
            <div className="flex gap-2 mb-4">
              {dyn.v1.addWrapDecoy(
                "date-picker-button",
                <Popover placement="bottomLeft" trigger="click" content={calendarPanel} overlayClassName="!p-0">
                  <button
                    {...getElementAttributes("date-picker-button", 0)}
                    type="button"
                    className={`group flex items-center gap-2 border transition focus:outline-none px-4 py-[10px] rounded-lg text-base font-semibold border-gray-200 ${
                      selectedDate ? "text-[#d1453b]" : "text-gray-700"
                    } bg-white hover:border-[#d1453b] hover:bg-orange-50 ${dyn.v3.getVariant("button-ghost", CLASS_VARIANTS_MAP, "")}`}
                    style={{ minWidth: 105 }}
                  >
                    <CalendarOutlined className="mr-2 text-xl" />
                    <span className="font-bold">
                      {selectedDate ? selectedDate.format("D MMM") : getText("picker-date-label", "Date")}
                    </span>
                  </button>
                </Popover>
              )}
              {dyn.v1.addWrapDecoy(
                "priority-picker-button",
                <Popover
                  placement="bottomLeft"
                  trigger="click"
                  open={priorityPopoverOpen}
                  onOpenChange={setPriorityPopoverOpen}
                  content={priorityPanel}
                  overlayClassName="!p-0"
                >
                  <button
                    {...getElementAttributes("priority-picker-button", 0)}
                    className={`text-gray-600 hover:bg-gray-50 transition px-2 py-1 text-md font-medium rounded border border-gray-200 flex items-center ${dyn.v3.getVariant("pill", CLASS_VARIANTS_MAP, "")}`}
                    type="button"
                  >
                    <FlagOutlined
                      className="mr-1"
                      style={{
                        fontSize: 16,
                        color:
                          selectedPriority === 1
                            ? "#d1453b"
                            : selectedPriority === 2
                            ? "#eb8909"
                            : selectedPriority === 3
                            ? "#246fe0"
                            : "#94a3b8",
                      }}
                    />
                    {getText("picker-priority-label", "Priority")}
                  </button>
                </Popover>
              )}
            </div>
          </div>
          {dyn.v1.addWrapDecoy(
            "task-form-footer",
            <div className="flex items-center justify-between px-4 py-3 bg-[#fbfaf9] border-t border-gray-100">
              <div className="flex items-center gap-2 text-md font-medium text-gray-700" {...getElementAttributes("label-inbox", 0)}>
                <InboxOutlined style={{ fontSize: 16 }} /> {getText("label-inbox", "Inbox")}{" "}
                <DownOutlined style={{ fontSize: 11 }} className="ml-0.5" />
              </div>
              <div className="flex gap-2">
                {dyn.v1.addWrapDecoy(
                  "cancel-button",
                  <button
                    id={editingTask ? dyn.v3.getVariant("cancel-edit-button", ID_VARIANTS_MAP, "cancel-edit-button") : dyn.v3.getVariant("cancel-button", ID_VARIANTS_MAP, "cancel-button")}
                    onClick={() => {
                      logEvent(EVENT_TYPES.CANCEL_TASK, {
                        currentName: name,
                        currentDescription: desc,
                        selectedDate: selectedDate ? selectedDate.format("YYYY-MM-DD") : null,
                        priority: getPriorityLabel(selectedPriority),
                        isEditing: !!editingTask,
                      });
                      onCancel();
                    }}
                    className={`${dynamicGhost} px-5 py-1.5 rounded font-semibold hover:bg-gray-50`}
                  >
                    {getText("button-cancel", "Cancel")}
                  </button>
                )}
                {dyn.v1.addWrapDecoy(
                  "submit-button",
                  <button
                    id={editingTask ? dyn.v3.getVariant("save-changes-button", ID_VARIANTS_MAP, "save-changes-button") : dyn.v3.getVariant("submit-button", ID_VARIANTS_MAP, "submit-button")}
                    className={`${editingTask ? dynamicButtonPrimary.replace(/text-white/g, "text-black") : dynamicButtonPrimary} px-6 py-1.5 rounded font-semibold`}
                    onClick={() => {
                      if (!name.trim()) return;
                      logEvent(EVENT_TYPES.ADD, {
                        action: editingTask ? "Save changes" : "Add",
                        name: name.trim(),
                        description: desc.trim(),
                        date: selectedDate ? selectedDate.format("YYYY-MM-DD") : null,
                        priority: getPriorityLabel(selectedPriority),
                      });
                      onAdd({
                        name: name.trim(),
                        description: desc.trim(),
                        date: selectedDate,
                        priority: selectedPriority,
                      });
                      setName("");
                      setDesc("");
                      setSelectedDate(null);
                      setSelectedPriority(4);
                      setPriorityPopoverOpen(false);
                    }}
                    disabled={!name.trim()}
                  >
                    {editingTask ? getText("button-save", "Save changes") : getText("button-add", "Add")}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const dyn = useDynamicSystem();
  const { resolvedSeeds } = useSeed();
  const v2Seed = resolvedSeeds.v2 ?? resolvedSeeds.base ?? 1;
  const dynIds = {
    appShell: "app-shell",
    heroTitle: dyn.v3.getVariant("hero-title", ID_VARIANTS_MAP, "hero-title"),
    quickActions: dyn.v3.getVariant("quick-actions", ID_VARIANTS_MAP, "quick-actions"),
    todaySection: dyn.v3.getVariant("today-section", ID_VARIANTS_MAP, "today-section"),
    completedSection: dyn.v3.getVariant("completed-section", ID_VARIANTS_MAP, "completed-section"),
    inboxSection: dyn.v3.getVariant("inbox-section", ID_VARIANTS_MAP, "inbox-section"),
    emptyState: dyn.v3.getVariant("empty-state", ID_VARIANTS_MAP, "empty-state"),
    taskList: dyn.v3.getVariant("task-list", ID_VARIANTS_MAP, "task-list"),
    taskCard: dyn.v3.getVariant("task-card", ID_VARIANTS_MAP, "task-card"),
    taskActions: dyn.v3.getVariant("task-actions", ID_VARIANTS_MAP, "task-actions"),
    chatThread: dyn.v3.getVariant("chat-thread", ID_VARIANTS_MAP, "chat-thread"),
    chatMessage: dyn.v3.getVariant("chat-message", ID_VARIANTS_MAP, "chat-message"),
    calendarWidget: dyn.v3.getVariant("calendar-widget", ID_VARIANTS_MAP, "calendar-widget"),
    toolbarActions: dyn.v3.getVariant("toolbar-actions", ID_VARIANTS_MAP, "toolbar-actions"),
    statsCard: dyn.v3.getVariant("stats-card", ID_VARIANTS_MAP, "stats-card"),
    filterDropdown: dyn.v3.getVariant("filter-dropdown", ID_VARIANTS_MAP, "filter-dropdown"),
    quickAdd: dyn.v3.getVariant("submit-button", ID_VARIANTS_MAP, "quick-add"),
    chatInput: dyn.v3.getVariant("task-description-input", ID_VARIANTS_MAP, "chat-input"),
    badgeId: dyn.v3.getVariant("task-actions", ID_VARIANTS_MAP, "badge-id"),
    panelId: dyn.v3.getVariant("task-form", ID_VARIANTS_MAP, "panel-id"),
  };
  const dynClasses = {
    primary: dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, "bg-[#d1453b] text-white hover:bg-[#b53b34]"),
    ghost: dyn.v3.getVariant("button-ghost", CLASS_VARIANTS_MAP, "border border-gray-200 hover:border-gray-300"),
    card: dyn.v3.getVariant("card-surface", CLASS_VARIANTS_MAP, "rounded-xl border border-gray-200 bg-white shadow-sm"),
    badge: dyn.v3.getVariant("badge-priority", CLASS_VARIANTS_MAP, "text-xs px-2 py-1 rounded-full bg-red-100 text-red-700"),
    panel: dyn.v3.getVariant("panel", CLASS_VARIANTS_MAP, "bg-white border border-gray-200 rounded-xl shadow-sm"),
    gridLayout: dyn.v3.getVariant("grid-layout", CLASS_VARIANTS_MAP, "grid grid-cols-1 md:grid-cols-2 gap-4"),
    listRow: dyn.v3.getVariant("list-row", CLASS_VARIANTS_MAP, "flex items-center justify-between py-3 px-3 rounded-lg hover:bg-gray-50"),
    pill: dyn.v3.getVariant("pill", CLASS_VARIANTS_MAP, "rounded-full bg-gray-100 text-gray-700 px-3 py-1 text-xs"),
    navLink: dyn.v3.getVariant("nav-link", CLASS_VARIANTS_MAP, "flex items-center gap-2 px-2.5 py-2 rounded-lg text-gray-800 hover:bg-gray-100"),
  };
  const dynText = {
    addTask: dyn.v3.getVariant("add_task", TEXT_VARIANTS_MAP, "Add task"),
    saveTask: dyn.v3.getVariant("save_task", TEXT_VARIANTS_MAP, "Save task"),
    cancel: dyn.v3.getVariant("cancel_action", TEXT_VARIANTS_MAP, "Cancel"),
    priorityLabel: dyn.v3.getVariant("priority_label", TEXT_VARIANTS_MAP, "Priority"),
    dueDate: dyn.v3.getVariant("due_date_label", TEXT_VARIANTS_MAP, "Due date"),
    emptyTitle: dyn.v3.getVariant("empty_state_title", TEXT_VARIANTS_MAP, "You're all set"),
    emptyDesc: dyn.v3.getVariant("empty_state_description", TEXT_VARIANTS_MAP, "Add your first task to get started."),
    todayHeading: dyn.v3.getVariant("today_heading", TEXT_VARIANTS_MAP, "Today"),
    completedHeading: dyn.v3.getVariant("completed_heading", TEXT_VARIANTS_MAP, "Completed"),
    inboxHeading: dyn.v3.getVariant("inbox_heading", TEXT_VARIANTS_MAP, "Inbox"),
    chatPlaceholder: dyn.v3.getVariant("chat_placeholder", TEXT_VARIANTS_MAP, "Type a message..."),
    quickActions: dyn.v3.getVariant("quick_actions_title", TEXT_VARIANTS_MAP, "Quick actions"),
    searchPlaceholder: dyn.v3.getVariant("search_tasks_placeholder", TEXT_VARIANTS_MAP, "Search tasks..."),
    projectsHeading: dyn.v3.getVariant("projects_heading", TEXT_VARIANTS_MAP, "Projects"),
    teamsHeading: dyn.v3.getVariant("teams_heading", TEXT_VARIANTS_MAP, "Teams"),
    ctaAddTask: dyn.v3.getVariant("cta_add_task", TEXT_VARIANTS_MAP, "Add your first task"),
    overviewTitle: dyn.v3.getVariant("overview_title", TEXT_VARIANTS_MAP, "Your day at a glance"),
    sidebarHeading: dyn.v3.getVariant("sidebar_heading", TEXT_VARIANTS_MAP, "Workspace"),
    projectsHeading2: dyn.v3.getVariant("projects_heading", TEXT_VARIANTS_MAP, "Project list"),
    teamsHeading2: dyn.v3.getVariant("teams_heading", TEXT_VARIANTS_MAP, "Team list"),
    addTaskShort: dyn.v3.getVariant("add_task", TEXT_VARIANTS_MAP, "Add"),
    saveTaskShort: dyn.v3.getVariant("save_task", TEXT_VARIANTS_MAP, "Save"),
    cancelShort: dyn.v3.getVariant("cancel_action", TEXT_VARIANTS_MAP, "Cancel"),
  };
  const wrap = (key: string, node: React.ReactNode) => {
    if (key === "layout-sidebar" || key === "layout-main" || key.startsWith("task-card")) {
      return node;
    }
    return dyn.v1.addWrapDecoy(key, node);
  };
  const getText = (key: string, fallback: string) =>
    dyn.v3.getVariant(key, TEXT_VARIANTS_MAP, fallback);
  const getElementAttributes = (key: string, index: number = 0) => ({
    id: dyn.v3.getVariant(key, ID_VARIANTS_MAP, `${key}-${index}`),
    "data-dyn-key": key,
    "data-dyn-class": dyn.v3.getVariant(key, CLASS_VARIANTS_MAP, ""),
  });
  const reorderElements = <T,>(items: T[], key: string) => items;
  const [showForm, setShowForm] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [selectedView, setSelectedView] = useState<ViewMode>("inbox");
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  const [chatDrafts, setChatDrafts] = useState<Record<string, string>>({});
  const [snackbar, setSnackbar] = useState<{ message: string; visible: boolean }>({ message: "", visible: false });

  useEffect(() => {
    let cancelled = false;

    async function fetchTasks() {
      setTasksLoading(true);
      setTasksError(null);
      try {
        const result = await loadTasks(v2Seed ?? undefined);
        if (cancelled) return;
        
        if (result.error) {
          setTasksError(result.error);
        }
        
        const normalized = result.tasks.map((task, index) =>
          normalizeRemoteTask(task, index)
        );
        const initialActive = normalized.filter((task) => !task.completedAt);
        const initialCompleted = normalized.filter((task) => task.completedAt);
        setTasks(initialActive);
        setCompletedTasks(initialCompleted);
      } catch (error) {
        if (cancelled) return;
        console.error("[autolist] Failed to load tasks", error);
        setTasksError(
          error instanceof Error ? error.message : "Failed to load tasks"
        );
      } finally {
        if (!cancelled) {
          setTasksLoading(false);
        }
      }
    }

    fetchTasks();
    return () => {
      cancelled = true;
    };
  }, [v2Seed]);

  // Initialize chat messages when switching to a chat
  useEffect(() => {
    if (!selectedView.startsWith("chat-")) return;
    const chatId = selectedView.replace("chat-", "");
    setChatMessages((prev) => {
      if (prev[chatId]) return prev;
      return { ...prev, [chatId]: chatConversations[chatId]?.messages ?? [] };
    });
  }, [selectedView]);

  function handleAddTask(newTask: {
    name: string;
    description: string;
    date: Dayjs | null;
    priority: number;
  }) {
    if (editIndex !== null) {
      setTasks((tasks) =>
        tasks.map((t, i) => (i === editIndex ? { ...newTask, id: t.id } : t))
      );
      setEditIndex(null);
    } else {
      setTasks((tasks) => [
        ...tasks,
        { ...newTask, id: Date.now().toString() },
      ]);
    }
  }
  function handleEditTask(id: string) {
    setEditIndex(tasks.findIndex((t) => t.id === id));
  }
  function handleDeleteTask(id: string) {
    setTasks((tasks) => tasks.filter((t) => t.id !== id));
    if (editIndex !== null && tasks[editIndex]?.id === id) setEditIndex(null);
    // Show snackbar
    setSnackbar({ message: "Task deleted", visible: true });
    setTimeout(() => setSnackbar({ message: "", visible: false }), 3000);
  }
  function handleCompleteTask(id: string) {
    setTasks((tasks) => {
      const idx = tasks.findIndex((t) => t.id === id);
      if (idx === -1) return tasks;
      const t = tasks[idx];
      setCompletedTasks((prev) =>
        prev.some((task) => task.id === id)
          ? prev
          : [{ ...t, completedAt: new Date().toISOString() }, ...prev]
      );
      return tasks.filter((v, i) => i !== idx);
    });
    // Show snackbar
    setSnackbar({ message: "Task done successfully", visible: true });
    setTimeout(() => setSnackbar({ message: "", visible: false }), 3000);
  }

  // Compute counts at the top-level for Sidebar display
  const todayStr = dayjs().format("YYYY-MM-DD");
  const inboxCount = tasks.length;
  const todayCount = tasks.filter(
    (task) => task.date && dayjs(task.date).format("YYYY-MM-DD") === todayStr
  ).length;
  const completedCount = completedTasks.length;
  const orderedInboxTasks = tasks;

  function renderGettingStarted() {
    return (
      <div className="flex-1 flex flex-col items-center w-full text-center pt-28 pb-16 bg-gradient-to-b from-[#fdede7] via-[#f7fafc] to-white min-h-screen">
        <div className="bg-white shadow-lg rounded-2xl p-10 border border-gray-100 max-w-3xl w-full">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100 text-[#d1453b] mx-auto mb-4">
            <PlusOutlined style={{ fontSize: 24 }} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {getText('getting-started-title', 'Welcome to AutoList')}
          </h1>
          <p className="text-gray-600 text-base mb-8 max-w-2xl mx-auto leading-7">
            {getText('getting-started-desc', 'Create your first tasks, organize them by priority, and collaborate with your team.')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left mb-6">
            <div className="p-4 rounded-xl border border-gray-200 bg-[#fffaf7]">
              <div className="font-semibold text-gray-900 mb-1">1. Add tasks</div>
              <p className="text-sm text-gray-600">Capture ideas quickly, set priority and due date.</p>
            </div>
            <div className="p-4 rounded-xl border border-gray-200 bg-[#f8fbff]">
              <div className="font-semibold text-gray-900 mb-1">2. Plan your day</div>
              <p className="text-sm text-gray-600">Use Today to focus and Completed to review progress.</p>
            </div>
            <div className="p-4 rounded-xl border border-gray-200 bg-[#f7fdf8]">
              <div className="font-semibold text-gray-900 mb-1">3. Invite your team</div>
              <p className="text-sm text-gray-600">Create a team and assign roles to collaborate.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-6">
            <div className="p-4 rounded-xl border border-gray-200 bg-[#fef6e5]">
              <div className="font-semibold text-gray-900 mb-1">4. Organize projects</div>
              <p className="text-sm text-gray-600">Group work into projects and keep context together.</p>
            </div>
            <div className="p-4 rounded-xl border border-gray-200 bg-[#eef7ff]">
              <div className="font-semibold text-gray-900 mb-1">5. Track progress</div>
              <p className="text-sm text-gray-600">Use Completed to review what’s done and celebrate wins.</p>
            </div>
          </div>
          <div className="mt-6 flex justify-center gap-3">
            <button
              className="bg-[#d1453b] hover:bg-[#c0342f] text-white px-5 py-2 rounded font-semibold shadow"
              onClick={() => setShowForm(true)}
            >
              {getText('getting-started-cta', 'Add your first task')}
            </button>
            <button
              className="border border-gray-300 text-gray-700 px-5 py-2 rounded font-semibold"
              onClick={() => setSelectedView("inbox")}
            >
              {getText('getting-started-browse', 'Back to list')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderToday() {
    const todayTasks = tasks.filter(
      (task: (typeof tasks)[0]) =>
        task.date && dayjs(task.date).format("YYYY-MM-DD") === todayStr
    );
    const orderedToday = reorderElements(todayTasks, "today-tasks");
    return (
      <div className="flex-1 flex flex-col items-center w-full text-center pt-32 bg-gradient-to-b from-[#fdede7] via-[#f7fafc] to-white min-h-screen">
        <h1 className="text-3xl font-bold text-gray-900 mb-6" {...getElementAttributes('heading-today', 0)}>
          {getText('heading-today', 'Tasks Scheduled Today')}
        </h1>
        {todayTasks.length === 0 ? (
          <div className="mt-14 text-lg text-gray-400 text-center">
            No tasks for today.
          </div>
        ) : (
          <div className="w-full max-w-xl mt-8 space-y-3 text-left mx-auto">
            {orderedToday.map((task) => (
              <div
                key={task.id}
                className="border border-gray-200 rounded-xl bg-white shadow-sm p-5 flex gap-4 items-start"
              >
                <button
                  className="w-6 h-6 min-w-[24px] min-h-[24px] rounded-full border-2 border-gray-400 flex items-center justify-center hover:border-[#d1453b] mt-2"
                  aria-label="Mark complete"
                  onClick={() => handleCompleteTask(task.id)}
                >
                  <span className="w-4 h-4 block rounded-full"></span>
                </button>
                <span>
                  <FlagOutlined
                    style={{
                      fontSize: 20,
                      marginTop: 3,
                      color:
                        task.priority === 1
                          ? "#d1453b"
                          : task.priority === 2
                          ? "#eb8909"
                          : task.priority === 3
                          ? "#246fe0"
                          : "#94a3b8",
                    }}
                  />
                </span>
                <div className="flex-1">
                  <div className="font-semibold text-lg text-gray-900 mb-1">
                    {task.name}
                  </div>
                  {task.description && (
                    <div className="text-gray-600 mb-1 text-base">
                      {task.description}
                    </div>
                  )}
                  <div className="flex gap-3 text-sm mt-2 items-center">
                    {task.date && (
                      <span className="flex items-center gap-1 text-xs px-2 py-[2px] rounded bg-slate-50 text-[#d1453b] border border-gray-200">
                        <CalendarOutlined />
                        {dayjs(task.date).format("D MMM YYYY")}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs px-2 py-[2px] rounded bg-slate-50 text-gray-500 border border-gray-200">
                      <FlagOutlined
                        style={{
                          color:
                            task.priority === 1
                              ? "#d1453b"
                              : task.priority === 2
                              ? "#eb8909"
                              : task.priority === 3
                              ? "#246fe0"
                              : "#94a3b8",
                          fontSize: 14,
                        }}
                      />
                      {getText('label-priority-badge', 'Priority')} {task.priority}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 ml-2 mt-1">
                  <button
                    className="p-1 px-2 rounded border border-gray-200 hover:bg-orange-50"
                    onClick={() => handleEditTask(task.id)}
                    title="Edit"
                  >
                    <EditOutlined />
                  </button>
                  <button
                    className="p-1 px-2 rounded border border-gray-200 hover:bg-red-50"
                    onClick={() => handleDeleteTask(task.id)}
                    title="Delete"
                  >
                    <DeleteOutlined />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

function renderCompleted() {
  const orderedCompleted = reorderElements(completedTasks, "completed-tasks");
  return (
    <div className="flex-1 flex flex-col items-center w-full text-center pt-32 bg-gradient-to-b from-[#fdede7] via-[#f7fafc] to-white min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-6" {...getElementAttributes('heading-completed', 0)}>
        {getText('heading-completed', 'Activity: All projects')}
        </h1>
        {completedTasks.length === 0 ? (
          <div className="mt-14 text-lg text-gray-400">
            No completed tasks yet.
          </div>
        ) : (
          <div className="w-full max-w-2xl mx-auto space-y-6 text-left">
            {orderedCompleted.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-4 bg-white rounded-lg px-4 py-3 border border-gray-200 shadow-sm"
              >
                <span className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center">
                  <img
                    alt="avatar"
                    src="https://randomuser.me/api/portraits/men/1.jpg"
                    className="rounded-full w-9 h-9 bg-white border"
                  />
                </span>
                <span className="inline-flex items-center justify-center bg-white rounded-full border border-green-500 w-6 h-6 ml-[-2rem] mr-2">
                  <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
                    <circle
                      cx="10"
                      cy="10"
                      r="8"
                      stroke="#22c55e"
                      strokeWidth="2"
                    />
                    <path
                      d="M7 10.5l2 2 4-4"
                      stroke="#22c55e"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <div className="flex-1">
                  <div className="font-semibold text-base text-gray-700">
                    <b>You</b> completed a task: {""}
                    <span className="underline hover:text-[#d1453b]">
                      {task.name}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {task.completedAt
                      ? new Date(task.completedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

function renderChatPlaceholder(chatId: string) {
  const conv = chatConversations[chatId.replace("chat-", "")];
    const title = conv?.name ? `Chat with ${conv.name}` : "Chat";
    const role = conv?.role ?? "Conversation";
    const status = conv?.status ?? "offline";
    const messages = chatMessages[chatId.replace("chat-", "")] ?? conv?.messages ?? [];
    const draft = chatDrafts[chatId] ?? "";

    const formatTime = () => {
      const now = new Date();
      return `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
    };

    const handleSend = () => {
      const text = draft.trim();
      if (!text) return;
      const msg: ChatMessage = { from: "me", text, time: formatTime() };
      const key = chatId.replace("chat-", "");
      setChatMessages((prev) => ({
        ...prev,
        [key]: [...(prev[key] ?? conv?.messages ?? []), msg],
      }));
      setChatDrafts((prev) => ({ ...prev, [chatId]: "" }));
    };

    return (
      <div className="flex-1 flex flex-col items-center w-full pt-4 pb-12 bg-gradient-to-b from-[#fdede7] via-[#f7fafc] to-white min-h-screen">
        <div className="bg-white shadow-lg rounded-2xl p-8 border border-gray-100 max-w-6xl w-[95%] text-left min-h-[80vh]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {conv?.avatar && (
                <img
                  src={conv.avatar}
                  alt={conv.name}
                  className="w-12 h-12 rounded-full object-cover border"
                />
              )}
              <div>
                <div className="text-xl font-bold text-gray-900">{title}</div>
                <div className="text-sm text-gray-500">{role}</div>
                <div className="text-xs flex items-center gap-1 mt-1 text-gray-500">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      status === "online"
                        ? "bg-green-500"
                        : status === "away"
                        ? "bg-yellow-400"
                        : "bg-gray-400"
                    }`}
                  />
                  {status === "online"
                    ? "Online"
                    : status === "away"
                    ? "Away"
                    : "Offline"}
                </div>
              </div>
            </div>
            <span className="text-xs text-gray-500">Recent messages</span>
          </div>
          <div className="space-y-3 min-h-[420px] flex flex-col justify-start">
            {messages.length === 0 ? (
              <div className="h-48 rounded-lg border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
                Conversation view coming soon
              </div>
            ) : (
              messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`px-4 py-3 rounded-xl border text-sm max-w-[70%] ${
                      m.from === "me"
                        ? "bg-[#fef2f0] border-[#f1c5be] text-[#9b2b22]"
                        : "bg-white border-gray-200 text-gray-800"
                    }`}
                  >
                    <div className="font-medium">{m.text}</div>
                    <div className="text-[11px] text-gray-500 mt-1 text-right">{m.time}</div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-6 flex items-center gap-3">
            <textarea
              value={draft}
              onChange={(e) => setChatDrafts((prev) => ({ ...prev, [chatId]: e.target.value }))}
              placeholder="Write a message..."
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f6bcb3] focus:border-[#f6bcb3] resize-none min-h-[64px]"
            />
            <button
              onClick={handleSend}
              className="bg-[#d1453b] hover:bg-[#c0342f] text-white px-4 py-2 rounded-lg font-semibold text-sm shadow"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    );
  }

  function TeamDetails({ teamId }: { teamId: string }) {
    const { teams } = useTeams();
    const team = teams.find((t) => t.id === teamId);

    if (!team) {
      return (
        <div className="flex-1 flex flex-col items-center w-full text-center pt-28 pb-12 bg-gradient-to-b from-[#fdede7] via-[#f7fafc] to-white min-h-screen">
          <div className="bg-white shadow rounded-xl border border-gray-200 px-6 py-10 text-gray-600">
            Team not found.
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col w-full pt-8 pb-12 bg-gradient-to-b from-[#fdede7] via-[#f7fafc] to-white min-h-screen px-6">
        <div className="max-w-6xl mx-auto w-full">
          {/* Header */}
          <div className="bg-white shadow-lg rounded-2xl p-8 border border-gray-100 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{team.name}</h1>
                <p className="text-gray-600 mb-4">{team.description || "Team workspace"}</p>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <span className="flex items-center gap-2">
                    <TeamOutlined />
                    {team.members.length} {team.members.length === 1 ? 'member' : 'members'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Team Members Section */}
          <div className="bg-white shadow-lg rounded-2xl p-8 border border-gray-100 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Team Members</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {team.members.map((m, index) => {
                const avatarUrl = `https://i.pravatar.cc/150?img=${index + 1}`;
                return (
                  <div key={m.id} className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white hover:border-[#d1453b] hover:shadow-md transition-all">
                    <div className="relative flex-shrink-0">
                      <img
                        src={avatarUrl}
                        alt={m.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#f6d7d1] to-[#e8c4bc] flex items-center justify-center text-base font-bold text-[#9b2b22] hidden">
                        {m.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 text-base truncate">{m.name}</div>
                      <div className="text-sm text-gray-600 truncate">{m.role}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            {team.members.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <TeamOutlined className="text-4xl mb-3 opacity-50" />
                <p>No members in this team yet.</p>
              </div>
            )}
          </div>

          {/* Team Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
              <div className="text-sm text-gray-600 mb-1">Total Members</div>
              <div className="text-3xl font-bold text-gray-900">{team.members.length}</div>
            </div>
            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
              <div className="text-sm text-gray-600 mb-1">Active Projects</div>
              <div className="text-3xl font-bold text-gray-900">0</div>
            </div>
            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
              <div className="text-sm text-gray-600 mb-1">Completed Tasks</div>
              <div className="text-3xl font-bold text-gray-900">0</div>
            </div>
          </div>

          {/* Team Activity Chart */}
          <div className="bg-white shadow-lg rounded-2xl p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Team Activity</h2>
            <div className="relative h-64">
              <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                {/* Grid lines */}
                <defs>
                  <linearGradient id="activityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#d1453b" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#d1453b" stopOpacity="0.05" />
                  </linearGradient>
                </defs>
                {[0, 1, 2, 3, 4].map((i) => (
                  <line
                    key={`grid-${i}`}
                    x1="0"
                    y1={40 + i * 40}
                    x2="800"
                    y2={40 + i * 40}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                  />
                ))}
                {/* Data points and line */}
                <polyline
                  points="50,160 150,140 250,120 350,100 450,80 550,90 650,70 750,60"
                  fill="url(#activityGradient)"
                  stroke="#d1453b"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Data points */}
                {[
                  { x: 50, y: 160 },
                  { x: 150, y: 140 },
                  { x: 250, y: 120 },
                  { x: 350, y: 100 },
                  { x: 450, y: 80 },
                  { x: 550, y: 90 },
                  { x: 650, y: 70 },
                  { x: 750, y: 60 },
                ].map((point, i) => (
                  <g key={`point-${i}`}>
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="6"
                      fill="#fff"
                      stroke="#d1453b"
                      strokeWidth="2"
                    />
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="4"
                      fill="#d1453b"
                    />
                  </g>
                ))}
                {/* X-axis labels */}
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon'].map((label, i) => (
                  <text
                    key={`label-${i}`}
                    x={50 + i * 100}
                    y="195"
                    textAnchor="middle"
                    className="text-xs fill-gray-500"
                    fontSize="12"
                  >
                    {label}
                  </text>
                ))}
                {/* Y-axis labels */}
                {[0, 25, 50, 75, 100].map((value, i) => (
                  <text
                    key={`y-label-${i}`}
                    x="20"
                    y={200 - i * 40}
                    textAnchor="end"
                    className="text-xs fill-gray-500"
                    fontSize="12"
                  >
                    {value}
                  </text>
                ))}
              </svg>
            </div>
            <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#d1453b]"></div>
                <span>Tasks Completed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProjectsProvider>
      <TeamsProvider>
        <div id={dynIds.appShell} className="flex min-h-screen bg-gradient-to-b from-[#fdede7] via-[#f7fafc] to-white">
          {wrap(
            "layout-sidebar",
            <Sidebar
              onSelect={setSelectedView as (v: string) => void}
              selected={selectedView}
              inboxCount={inboxCount}
              todayCount={todayCount}
              completedCount={completedCount}
            />
          )}
          {wrap(
            "layout-main",
            <main className="flex-1 flex flex-col min-h-screen ml-[280px]">
              {dyn.v1.addWrapDecoy(
                "alignment-sentinel",
                <div className="hidden" data-dyn-key="alignment-sentinel" aria-hidden="true" />
              )}
              {wrap(
                "variant-sentinels",
                <div
                  className={`hidden ${dynClasses.gridLayout} ${dynClasses.navLink}`}
                  id={dynIds.heroTitle}
                  data-dyn-class={dynClasses.badge}
                >
                  <span id={dynIds.quickActions}>{dynText.quickActions}</span>
                  <span id={dynIds.todaySection}>{dynText.todayHeading}</span>
                  <span id={dynIds.completedSection}>{dynText.completedHeading}</span>
                  <span id={dynIds.emptyState}>{dynText.emptyTitle}</span>
                  <span id={dynIds.chatThread}>{dynText.chatPlaceholder}</span>
                  <span id={dynIds.chatMessage}>{dynText.cancel}</span>
                  <span id={dynIds.calendarWidget}>{dynText.dueDate}</span>
                  <span id={dynIds.toolbarActions}>{dynText.projectsHeading}</span>
                  <span id={dynIds.statsCard}>{dynText.overviewTitle}</span>
                  <span id={dynIds.filterDropdown}>{dynText.searchPlaceholder}</span>
                  <span id={dynIds.quickAdd}>{dynText.addTaskShort}</span>
                  <span id={dynIds.chatInput}>{dynText.chatPlaceholder}</span>
                  <span id={dynIds.badgeId}>{dynText.priorityLabel}</span>
                  <span id={dynIds.panelId}>{dynText.sidebarHeading}</span>
                  <span>{dynText.emptyDesc}</span>
                  <span>{dynText.inboxHeading}</span>
                  <span>{dynText.projectsHeading2}</span>
                  <span>{dynText.teamsHeading2}</span>
                  <span>{dynText.teamsHeading}</span>
                  <span>{dynText.ctaAddTask}</span>
                  <span>{dynText.saveTaskShort}</span>
                  <span>{dynText.cancelShort}</span>
                  <span>{dynText.addTask}</span>
                  <span>{dynText.saveTask}</span>
                  <span>{dynText.cancel}</span>
                </div>
              )}
              {selectedView === "today"
                ? wrap("today-view", renderToday())
                : selectedView === "completed"
                ? wrap("completed-view", renderCompleted())
                : selectedView === "getting-started"
                ? wrap("getting-started-view", renderGettingStarted())
                : selectedView.startsWith("chat-")
                ? wrap("chat-view", renderChatPlaceholder(selectedView))
                : selectedView.startsWith("team-")
                ? wrap("team-view", <TeamDetails teamId={selectedView.replace("team-", "")} />)
                : wrap(
                    "inbox-view",
                    <div
                      className="flex-1 flex flex-col items-center w-full text-center pt-36 min-h-screen"
                      id={dynIds.inboxSection}
                    >
                      <h1 className="text-3xl font-bold text-gray-900 mb-6" {...getElementAttributes("heading-inbox", 0)}>
                        {getText("heading-inbox", "Add Tasks To Your Todo List")}
                      </h1>
                      {tasksError && (
                        <div className={`${dynClasses.card} mb-6 px-6 py-4 text-blue-800 text-sm max-w-2xl`}>
                          <div className="font-semibold mb-1">ℹ️ Usando datos locales</div>
                          <div className="text-blue-700">{tasksError}</div>
                          <div className="mt-3 text-xs text-blue-600">
                            <p>Las tareas se están cargando desde el archivo JSON local. Si quieres usar el backend, asegúrate de que esté corriendo.</p>
                          </div>
                        </div>
                      )}
                      <Modal
                        open={editIndex !== null}
                        footer={null}
                        centered
                        onCancel={() => setEditIndex(null)}
                        title={getText("modal-edit-title", "Edit Task")}
                        destroyOnHidden
                        width={530}
                      >
                        {editIndex !== null && (
                          <AddTaskCard onCancel={() => setEditIndex(null)} onAdd={handleAddTask} editingTask={tasks[editIndex]} />
                        )}
                      </Modal>
                      {showForm && <AddTaskCard onCancel={() => setShowForm(false)} onAdd={handleAddTask} />}
                      {tasksLoading && (
                        <div className={`${dynClasses.panel} w-full max-w-md mx-auto mt-6 border-dashed px-6 py-4 text-sm text-gray-600`}>
                          Loading tasks...
                        </div>
                      )}
                      {tasksError && (
                        <div className="w-full max-w-md mx-auto mt-6 bg-white rounded-2xl border border-red-200 px-6 py-4 text-sm text-red-600">
                          {tasksError}
                        </div>
                      )}
                      {!showForm && !tasksLoading && tasks.length === 0 && (
                        <div className={`${dynClasses.card} w-full max-w-md mx-auto mt-6 px-8 py-10 flex flex-col items-center`}>
                          <div className="mb-6">
                            <svg width="56" height="56" fill="none" className="mx-auto mb-2">
                              <rect width="56" height="56" rx="18" fill="#f7cac3" />
                              <path d="M28 16v24M16 28h24" stroke="#d1453b" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                          <div className="font-semibold text-xl mb-1 text-gray-900" {...getElementAttributes("empty-inbox-title", 0)}>
                            {getText("empty-inbox-title", "Capture now, plan later")}
                          </div>
                          <div className="text-gray-500 mb-7 text-base leading-normal" {...getElementAttributes("empty-inbox-desc", 0)}>
                            {getText("empty-inbox-desc", "Inbox is your go-to spot for quick task entry.\nClear your mind now, organize when you're ready.")}
                          </div>
                          <button
                            {...getElementAttributes("cta-add-task", 0)}
                            className={`${dynClasses.primary} flex items-center gap-2 font-semibold px-6 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fdede7] focus:ring-offset-2 shadow transition`}
                            onClick={() => {
                              logEvent(EVENT_TYPES.ADD_TASK, {
                                source: "inbox_cta_button",
                              });
                              setShowForm(true);
                            }}
                          >
                            <PlusOutlined /> {getText("cta-add-task", "Add task")}
                          </button>
                        </div>
                      )}
                      {orderedInboxTasks.length > 0 && (
                        <div className="w-full max-w-4xl mt-12 space-y-3 text-left mx-auto" id={dynIds.taskList}>
                          {orderedInboxTasks.map((task, index) =>
                            dyn.v1.addWrapDecoy(
                              `task-card-${index}`,
                              <div key={task.id ?? index} className={`${dynClasses.card} p-5 flex gap-4 items-start`} data-dyn-key="task-card">
                              <button
                                className="w-6 h-6 min-w-[24px] min-h-[24px] rounded-full border-2 border-gray-400 flex items-center justify-center hover:border-[#d1453b] mt-2"
                                aria-label="Mark complete"
                                onClick={() => {
                                  logEvent(EVENT_TYPES.COMPLETE_TASK, {
                                    taskId: task.id,
                                    name: task.name,
                                    description: task.description,
                                    date: task.date ? task.date.format("YYYY-MM-DD") : null,
                                    priority: getPriorityLabel(task.priority),
                                    completedAt: new Date().toISOString(),
                                  });
                                  handleCompleteTask(task.id);
                                }}
                              >
                                <span className="w-4 h-4 block rounded-full"></span>
                              </button>
                              <span>
                                <FlagOutlined
                                  style={{
                                    fontSize: 20,
                                    marginTop: 3,
                                    color:
                                      task.priority === 1
                                        ? "#d1453b"
                                        : task.priority === 2
                                        ? "#eb8909"
                                        : task.priority === 3
                                        ? "#246fe0"
                                        : "#94a3b8",
                                  }}
                                />
                              </span>
                              <div className="flex-1">
                                <div className="font-semibold text-lg text-gray-900 mb-1" id={dynIds.taskCard}>
                                  {task.name}
                                </div>
                                {task.description && <div className="text-gray-600 mb-1 text-base">{task.description}</div>}
                                <div className="flex gap-3 text-sm mt-2 items-center">
                                  {task.date && (
                                    <span className={`${dynClasses.pill} flex items-center gap-1 text-xs px-2 py-[2px]`}>
                                      <CalendarOutlined />
                                      {task.date.format("D MMM YYYY")}
                                    </span>
                                  )}
                                  <span className={`${dynClasses.pill} flex items-center gap-1 text-xs`}>
                                    <FlagOutlined
                                      style={{
                                        color:
                                          task.priority === 1
                                            ? "#d1453b"
                                            : task.priority === 2
                                            ? "#eb8909"
                                            : task.priority === 3
                                            ? "#246fe0"
                                            : "#94a3b8",
                                        fontSize: 14,
                                      }}
                                    />
                                    {dynText.priorityLabel} {task.priority}
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-2 ml-2 mt-1" id={dynIds.taskActions}>
                                <button
                                  className={`${dynClasses.ghost} p-1 px-2 rounded hover:bg-orange-50`}
                                  onClick={() => {
                                    logEvent(EVENT_TYPES.EDIT_TASK_MODAL_OPENED, {
                                      taskId: task.id,
                                      name: task.name,
                                      description: task.description,
                                      date: task.date ? task.date.format("YYYY-MM-DD") : null,
                                      priority: getPriorityLabel(task.priority),
                                    });
                                    handleEditTask(task.id);
                                  }}
                                  title="Edit"
                                >
                                  <EditOutlined />
                                </button>
                                <button
                                  className={`${dynClasses.ghost} p-1 px-2 rounded hover:bg-red-50`}
                                  onClick={() => {
                                    logEvent(EVENT_TYPES.DELETE_TASK, {
                                      taskId: task.id,
                                      name: task.name,
                                      description: task.description,
                                      date: task.date ? task.date.format("YYYY-MM-DD") : null,
                                      priority: getPriorityLabel(task.priority),
                                      deletedAt: new Date().toISOString(),
                                    });
                                    handleDeleteTask(task.id);
                                  }}
                                  title="Delete"
                                >
                                  <DeleteOutlined />
                                </button>
                              </div>
                            </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  )}
            </main>
          )}
        </div>
        {snackbar.visible && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="bg-gray-900 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 min-w-[250px] max-w-md">
              <div className="flex-1 text-sm font-medium">{snackbar.message}</div>
              <button
                onClick={() => setSnackbar({ message: "", visible: false })}
                className="text-white/70 hover:text-white transition-colors"
                aria-label="Close"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </TeamsProvider>
    </ProjectsProvider>
  );
}
