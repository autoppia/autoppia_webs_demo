export type MailTemplate = {
  id: string;
  name: string;
  subject: string;
  body: string;
};

export const MAIL_TEMPLATES: MailTemplate[] = [
  {
    id: "intro",
    name: "Warm Introduction",
    subject: "Introduction & Next Steps",
    body: "Hi <name>,\n\nIt was great connecting with you. I’m sharing a quick summary of what we discussed and suggested next steps. Please let me know if you’d like me to adjust anything.\n\nThanks,\nMe",
  },
  {
    id: "follow-up",
    name: "Friendly Follow Up",
    subject: "Quick follow-up on our last conversation",
    body: "Hello <name>,\n\nI wanted to check in on the items we talked about last week. I’m happy to help keep things moving.\n\nBest,\nMe",
  },
  {
    id: "meeting-recap",
    name: "Meeting Recap",
    subject: "Recap: key notes from our meeting",
    body: "Hi <name>,\n\nHere’s a concise recap of today’s discussion and the action items we agreed on. Feel free to add or adjust anything I might have missed.\n\nRegards,\nMe",
  },
  {
    id: "thank-you",
    name: "Thank You",
    subject: "Thank you for your time",
    body: "Hi <name>,\n\nThank you for the thoughtful conversation. I appreciated your insights and look forward to collaborating soon.\n\nWarm regards,\nMe",
  },
  {
    id: "reminder",
    name: "Gentle Reminder",
    subject: "Friendly reminder",
    body: "Hello <name>,\n\nThis is a quick reminder about the pending items we discussed. Please let me know if there’s anything you need from my side.\n\nThanks,\nMe",
  },
];
