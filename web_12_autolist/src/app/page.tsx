"use client";
import Sidebar from "./Sidebar";
import {
  PlusOutlined,
  CalendarOutlined,
  FlagOutlined,
  BellOutlined,
  MoreOutlined,
  InboxOutlined,
  DownOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { Calendar, Popover, Modal } from "antd";
import { useState, useRef, useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";
import Navbar from "./components/Navbar";
import { EVENT_TYPES, logEvent } from "@/library/events";

type Task = {
  id: string;
  name: string;
  description: string;
  date: Dayjs | null;
  priority: number;
  completedAt?: string;
};

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

  const priorities = [
    { key: 1, label: "Highest", color: "red" },
    { key: 2, label: "High", color: "orange" },
    { key: 3, label: "Medium", color: "blue" },
    { key: 4, label: "Low", color: "gray" },
  ];

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

  return (
    <div className="w-full max-w-4xl">
      <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
        <div className="pt-5 px-5">
          <input
            ref={inputRef}
            className="w-full text-base font-normal border-0 outline-none focus:ring-0 bg-transparent placeholder-gray-600 placeholder-opacity-80 font-sans mb-1"
            placeholder="Task name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="w-full text-base border-0 outline-none focus:ring-0 bg-transparent text-gray-700 placeholder-gray-400 mt-1 mb-3 py-5"
            placeholder="Description"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <div className="flex gap-2 mb-4">
            <Popover
              placement="bottomLeft"
              trigger="click"
              content={calendarPanel}
              overlayClassName="!p-0"
            >
              <button
                type="button"
                className={`group flex items-center gap-2 border transition focus:outline-none px-4 py-[10px] rounded-lg text-base font-semibold border-gray-200 ${
                  selectedDate ? "text-[#d1453b]" : "text-gray-700"
                } bg-white hover:border-[#d1453b] hover:bg-orange-50`}
                style={{ minWidth: 105 }}
              >
                <CalendarOutlined className="mr-2 text-xl" />
                <span className="font-bold">
                  {selectedDate ? selectedDate.format("D MMM") : "Date"}
                </span>
              </button>
            </Popover>
            <Popover
              placement="bottomLeft"
              trigger="click"
              open={priorityPopoverOpen}
              onOpenChange={setPriorityPopoverOpen}
              content={priorityPanel}
              overlayClassName="!p-0"
            >
              <button
                className="text-gray-600 hover:bg-gray-50 transition px-2 py-1 text-md font-medium rounded border border-gray-200 flex items-center"
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
                Priority
              </button>
            </Popover>
          </div>
        </div>
        <div className="flex items-center justify-between px-4 py-3 bg-[#fbfaf9] border-t border-gray-100">
          <div className="flex items-center gap-2 text-md font-medium text-gray-700">
            <InboxOutlined style={{ fontSize: 16 }} /> Inbox{" "}
            <DownOutlined style={{ fontSize: 11 }} className="ml-0.5" />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                logEvent(EVENT_TYPES.CANCEL_TASK, {
                  currentName: name,
                  currentDescription: desc,
                  selectedDate: selectedDate?.toISOString() ?? null,
                  priority: selectedPriority,
                  isEditing: !!editingTask,
                });
                onCancel();
              }}
              className="text-gray-700 bg-white border border-gray-200 px-5 py-1.5 rounded font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              className="bg-[#d1453b] hover:bg-[#ef7363] text-white px-6 py-1.5 rounded font-semibold"
              onClick={() => {
                if (!name.trim()) return;
                logEvent(EVENT_TYPES.ADD, {
                  action: editingTask ? "Save changes" : "Add",
                  name: name.trim(),
                  description: desc.trim(),
                  date: selectedDate?.toISOString() ?? null,
                  priority: selectedPriority,
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
              {editingTask ? "Save changes" : "Add"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [selectedView, setSelectedView] = useState<
    "inbox" | "completed" | "today"
  >("inbox");

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
  }

  // Compute counts at the top-level for Sidebar display
  const todayStr = dayjs().format("YYYY-MM-DD");
  const inboxCount = tasks.length;
  const todayCount = tasks.filter(
    (task) => task.date && dayjs(task.date).format("YYYY-MM-DD") === todayStr
  ).length;
  const completedCount = completedTasks.length;

  function renderToday() {
    const todayTasks = tasks.filter(
      (task: (typeof tasks)[0]) =>
        task.date && dayjs(task.date).format("YYYY-MM-DD") === todayStr
    );
    return (
      <div className="flex-1 flex flex-col items-center w-full text-center pt-32 bg-gradient-to-b from-[#fdede7] via-[#f7fafc] to-white min-h-screen">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Tasks Scheduled Today
        </h1>
        {todayTasks.length === 0 ? (
          <div className="mt-14 text-lg text-gray-400 text-center">
            No tasks for today.
          </div>
        ) : (
          <div className="w-full max-w-xl mt-8 space-y-3 text-left mx-auto">
            {todayTasks.map((task) => (
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
                      Priority {task.priority}
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
    return (
      <div className="flex-1 flex flex-col items-center w-full text-center pt-32 bg-gradient-to-b from-[#fdede7] via-[#f7fafc] to-white min-h-screen">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Activity: All projects
        </h1>
        {completedTasks.length === 0 ? (
          <div className="mt-14 text-lg text-gray-400">
            No completed tasks yet.
          </div>
        ) : (
          <div className="w-full max-w-2xl mx-auto space-y-6 text-left">
            {completedTasks.map((task) => (
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
                    <b>You</b> completed a task:{" "}
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

  return (
    <div className="flex min-h-screen bg-white">
      <Navbar />
      <Sidebar
        onSelect={setSelectedView as (v: string) => void}
        selected={selectedView}
        inboxCount={inboxCount}
        todayCount={todayCount}
        completedCount={completedCount}
      />
      <main className="flex-1 ml-[280px] flex flex-col min-h-screen ">
        {selectedView === "today" ? (
          renderToday()
        ) : selectedView === "completed" ? (
          renderCompleted()
        ) : (
          <div className="flex-1 flex flex-col items-center w-full text-center pt-36 bg-gradient-to-b from-[#fdede7] via-[#f7fafc] to-white min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Add Tasks To Your Todo List
            </h1>
            <Modal
              open={editIndex !== null}
              footer={null}
              centered
              onCancel={() => setEditIndex(null)}
              title="Edit Task"
              destroyOnClose
              width={530}
            >
              {editIndex !== null && (
                <AddTaskCard
                  onCancel={() => setEditIndex(null)}
                  onAdd={handleAddTask}
                  editingTask={tasks[editIndex]}
                />
              )}
            </Modal>
            {showForm && (
              <AddTaskCard
                onCancel={() => setShowForm(false)}
                onAdd={handleAddTask}
              />
            )}
            {!showForm && tasks.length === 0 && (
              <div className="w-full max-w-md mx-auto mt-6 bg-white rounded-2xl shadow-md border border-gray-200 px-8 py-10 flex flex-col items-center">
                <div className="mb-6">
                  <svg
                    width="56"
                    height="56"
                    fill="none"
                    className="mx-auto mb-2"
                  >
                    <rect width="56" height="56" rx="18" fill="#f7cac3" />
                    <path
                      d="M28 16v24M16 28h24"
                      stroke="#d1453b"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="font-semibold text-xl mb-1 text-gray-900">
                  Capture now, plan later
                </div>
                <div className="text-gray-500 mb-7 text-base leading-normal">
                  Inbox is your go-to spot for quick task entry.
                  <br />
                  Clear your mind now, organize when you're ready.
                </div>
                <button
                  className="flex items-center gap-2 bg-[#d1453b] hover:bg-[#c0342f] text-white font-semibold px-6 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fdede7] focus:ring-offset-2 shadow transition"
                  onClick={() => {
                    logEvent(EVENT_TYPES.ADD_TASK, {
                      source: "inbox_cta_button",
                    });
                    setShowForm(true);
                  }}
                >
                  <PlusOutlined /> Add task
                </button>
              </div>
            )}
            {tasks.length > 0 && (
              <div className="w-full max-w-4xl mt-12 space-y-3 text-left mx-auto">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="border border-gray-200 rounded-xl bg-white shadow-sm p-5 flex gap-4 items-start"
                  >
                    <button
                      className="w-6 h-6 min-w-[24px] min-h-[24px] rounded-full border-2 border-gray-400 flex items-center justify-center hover:border-[#d1453b] mt-2"
                      aria-label="Mark complete"
                      onClick={() => {
                        logEvent(EVENT_TYPES.COMPLETE_TASK, {
                          taskId: task.id,
                          name: task.name,
                          description: task.description,
                          date: task.date?.toISOString() ?? null,
                          priority: task.priority,
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
                            {task.date.format("D MMM YYYY")}
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
                          Priority {task.priority}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-2 mt-1">
                      <button
                        className="p-1 px-2 rounded border border-gray-200 hover:bg-orange-50"
                        onClick={() => {
                          logEvent(EVENT_TYPES.EDIT_TASK_MODAL_OPENED, {
                            taskId: task.id,
                            name: task.name,
                            description: task.description,
                            date: task.date?.toISOString() ?? null,
                            priority: task.priority,
                          });
                          handleEditTask(task.id);
                        }}
                        title="Edit"
                      >
                        <EditOutlined />
                      </button>
                      <button
                        className="p-1 px-2 rounded border border-gray-200 hover:bg-red-50"
                        onClick={() => {
                          logEvent(EVENT_TYPES.DELETE_TASK, {
                            taskId: task.id,
                            name: task.name,
                            description: task.description,
                            date: task.date?.toISOString() ?? null,
                            priority: task.priority,
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
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
