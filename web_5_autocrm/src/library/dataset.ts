export const DEMO_MATTERS = [
  {
    id: "MAT-0012",
    name: "Estate Planning",
    status: "Active",
    client: "Smith & Co.",
    updated: "Today",
  },
  {
    id: "MAT-0011",
    name: "Contract Review",
    status: "Archived",
    client: "Jones Legal",
    updated: "2 days ago",
  },
  {
    id: "MAT-0009",
    name: "IP Filing",
    status: "Active",
    client: "Acme Biotech",
    updated: "Last week",
  },
  {
    id: "MAT-0005",
    name: "M&A Advice",
    status: "On Hold",
    client: "Peak Ventures",
    updated: "Yesterday",
  },
];

export const DEMO_MATTERSS = [
  {
    id: "MAT-0012",
    name: "Estate Planning",
    status: "Active",
    client: "Smith & Co.",
    updated: "Today",
    opened: "April 8, 2024",
    description:
      "Wills, trusts, powers of attorney. Review client docs and manage billables.",
  },
  {
    id: "MAT-0011",
    name: "Contract Review",
    status: "Archived",
    client: "Jones Legal",
    updated: "2 days ago",
    opened: "March 14, 2024",
    description: "Review and finalize commercial agreements.",
  },
  {
    id: "MAT-0009",
    name: "IP Filing",
    status: "Active",
    client: "Acme Biotech",
    updated: "Last week",
    opened: "Feb 2, 2024",
    description: "Manage patent filing and related IP documentation.",
  },
  {
    id: "MAT-0005",
    name: "M&A Advice",
    status: "On Hold",
    client: "Peak Ventures",
    updated: "Yesterday",
    opened: "Jan 20, 2024",
    description: "Strategic legal counsel for merger assessment.",
  },
];

export const DEMO_FILES = [
  {
    id: 1,
    name: "Retainer-Agreement.pdf",
    size: "234 KB",
    version: "v2",
    updated: "Today",
    status: "Signed",
  },
  {
    id: 2,
    name: "Client-Onboarding.docx",
    size: "82 KB",
    version: "v1",
    updated: "This week",
    status: "Draft",
  },
  {
    id: 3,
    name: "Patent-Application.pdf",
    size: "1.3 MB",
    version: "v4",
    updated: "Last month",
    status: "Submitted",
  },
];
export const clients = [
  {
    id: "CL-101",
    name: "Smith & Co.",
    email: "team@smithco.com",
    matters: 3,
    avatar: "",
    status: "Active",
    last: "3d ago",
  },
  {
    id: "CL-098",
    name: "Jessica Brown",
    email: "jbrown@samplemail.com",
    matters: 1,
    avatar: "",
    status: "Active",
    last: "5d ago",
  },
  {
    id: "CL-092",
    name: "Acme Biotech",
    email: "legal@acmebio.com",
    matters: 2,
    avatar: "",
    status: "On Hold",
    last: "2w ago",
  },
  {
    id: "CL-086",
    name: "Peak Ventures",
    email: "peak@ventures.com",
    matters: 4,
    avatar: "",
    status: "Active",
    last: "1mo ago",
  },
];

export type EventColor = keyof typeof COLORS;
export type CalendarEvent = {
  id: number;
  date: string;
  label: string;
  time: string;
  color: EventColor;
};
export const EVENTS: CalendarEvent[] = [
  {
    id: 1,
    date: "2025-05-06",
    label: "Smith Matter: Signing",
    time: "11:00am",
    color: "forest",
  },
  {
    id: 2,
    date: "2025-05-07",
    label: "Internal Review",
    time: "2:30pm",
    color: "indigo",
  },
  {
    id: 3,
    date: "2025-05-13",
    label: "Court Filing",
    time: "9:00am",
    color: "blue",
  },
  {
    id: 4,
    date: "2025-05-18",
    label: "Client Call – Jessica",
    time: "2:00pm",
    color: "forest",
  },
  {
    id: 5,
    date: "2025-05-18",
    label: "M&A: Docs Due",
    time: "5:00pm",
    color: "indigo",
  },
  {
    id: 6,
    date: "2025-05-22",
    label: "Staff Meeting",
    time: "1:30pm",
    color: "zinc",
  },
];
export const COLORS = {
  forest: "bg-accent-forest/20 text-accent-forest border-accent-forest/40",
  indigo: "bg-accent-indigo/20 text-accent-indigo border-accent-indigo/40",
  blue: "bg-blue-100 text-blue-700 border-blue-300",
  zinc: "bg-zinc-200 text-zinc-700 border-zinc-300",
};

export const DEMO_LOGS = [
  {
    id: 1,
    matter: "Estate Planning",
    client: "Smith & Co.",
    date: "2025-05-19",
    hours: 2,
    description: "Consultation",
    status: "Billable",
  },
  {
    id: 2,
    matter: "IP Filing",
    client: "Acme Biotech",
    date: "2025-05-18",
    hours: 1.5,
    description: "Draft application",
    status: "Billed",
  },
  {
    id: 3,
    matter: "M&A Advice",
    client: "Peak Ventures",
    date: "2025-05-16",
    hours: 3,
    description: "Negotiation call",
    status: "Billable",
  },
];
