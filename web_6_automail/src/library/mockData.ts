import { faker } from '@faker-js/faker';
import type { Email, Label, EmailCategory, EmailFolder } from '@/types/email';

// Predefined system labels
export const systemLabels: Label[] = [
  { id: 'inbox', name: 'Inbox', color: '#1a73e8', type: 'system' },
  { id: 'starred', name: 'Starred', color: '#f9ab00', type: 'system' },
  { id: 'snoozed', name: 'Snoozed', color: '#ea4335', type: 'system' },
  { id: 'sent', name: 'Sent', color: '#34a853', type: 'system' },
  { id: 'drafts', name: 'Drafts', color: '#9aa0a6', type: 'system' },
  { id: 'spam', name: 'Spam', color: '#ea4335', type: 'system' },
  { id: 'trash', name: 'Trash', color: '#5f6368', type: 'system' },
  { id: 'important', name: 'Important', color: '#fbbc04', type: 'system' },
];

// Custom user labels - only Work and Personal by default
export const userLabels: Label[] = [
  { id: 'work', name: 'Work', color: '#4285f4', type: 'user' },
  { id: 'personal', name: 'Personal', color: '#0f9d58', type: 'user' },
];

const categories: EmailCategory[] = [
  'primary',
  'social',
  'promotions',
  'updates',
  'forums',
  'support',
];

const emailDomains = [
  'gmail.com',
  'outlook.com',
  'yahoo.com',
  'company.com',
  'startup.io',
  'tech.org',
];

function generateEmailAddress(): { name: string; email: string; avatar?: string } {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const domain = faker.helpers.arrayElement(emailDomains);

  return {
    name: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
    avatar: faker.image.avatar(),
  };
}

function generateEmailSubject(category: EmailCategory): string {
  const subjects = {
    primary: [
      'Meeting scheduled for tomorrow',
      'Quick question about the project',
      'Follow up on our conversation',
      'Important update regarding your account',
      'Invoice for recent services',
      'Thank you for your business',
    ],
    social: [
      'John Doe tagged you in a photo',
      'Your friend is now on this platform',
      'New message from your network',
      'Someone viewed your profile',
      'Invitation to connect',
      'Weekly activity summary',
    ],
    promotions: [
      '50% OFF Everything - Limited Time Only!',
      'Exclusive deal just for you',
      'Flash Sale: 24 hours only',
      'Your cart is waiting for you',
      'New arrivals you might like',
      'Free shipping on orders over $50',
    ],
    updates: [
      'Your order has been shipped',
      'Security alert for your account',
      'New features available',
      'System maintenance scheduled',
      'Password change confirmation',
      'Account activity summary',
    ],
    forums: [
      'New reply to your post',
      'Weekly digest from the community',
      'Trending topics this week',
      'Someone mentioned you',
      'New discussion in your group',
      'Monthly forum newsletter',
    ],
    support: [
      'Your support ticket has been updated',
      'How was your experience with us?',
      'Solution to your recent inquiry',
      'Follow-up on your support case',
      'Knowledge base article you requested',
      'Customer service survey',
    ],
  };

  return faker.helpers.arrayElement(subjects[category]);
}

function generateEmailBody(subject: string): { body: string; snippet: string } {
  const paragraphs = faker.helpers.arrayElements([
    faker.lorem.paragraph(3),
    faker.lorem.paragraph(2),
    faker.lorem.paragraph(4),
    faker.lorem.paragraph(1),
  ], { min: 1, max: 3 });

  const body = `Dear ${faker.person.firstName()},\n\n${paragraphs.join('\n\n')}\n\nBest regards,\n${faker.person.fullName()}`;
  const snippet = `${paragraphs[0].substring(0, 120)}...`;

  return { body, snippet };
}

export function generateMockEmail(overrides?: Partial<Email>): Email {
  const category = faker.helpers.arrayElement(categories);
  const subject = generateEmailSubject(category);
  const { body, snippet } = generateEmailBody(subject);
  const from = generateEmailAddress();

  // Generate 1-3 recipients
  const toCount = faker.helpers.arrayElement([1, 1, 1, 2, 3]); // Most emails have 1 recipient
  const to = Array.from({ length: toCount }, () => generateEmailAddress());

  // Occasionally add CC recipients
  const cc = faker.datatype.boolean(0.2)
    ? Array.from({ length: faker.number.int({ min: 1, max: 2 }) }, () => generateEmailAddress())
    : undefined;

  // Assign some random labels to emails
  const emailLabels: Label[] = [];

  // 30% chance of having a Work label
  if (faker.datatype.boolean(0.3)) {
    emailLabels.push(userLabels[0]); // Work label
  }

  // 20% chance of having a Personal label
  if (faker.datatype.boolean(0.2)) {
    emailLabels.push(userLabels[1]); // Personal label
  }

  const timestamp = faker.date.between({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date(),
  });

  return {
    id: faker.string.uuid(),
    from,
    to,
    cc,
    subject,
    body,
    snippet,
    timestamp,
    isRead: faker.datatype.boolean(0.7), // 70% chance of being read
    isStarred: faker.datatype.boolean(0.15), // 15% chance of being starred
    isSnoozed: faker.datatype.boolean(0.05), // 5% chance of being snoozed
    isDraft: false,
    isImportant: faker.datatype.boolean(0.1), // 10% chance of being important
    labels: emailLabels,
    category,
    threadId: faker.string.uuid(),
    attachments: faker.datatype.boolean(0.2) // 20% chance of having attachments
      ? Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => ({
          id: faker.string.uuid(),
          name: faker.system.fileName(),
          size: faker.number.int({ min: 1024, max: 5242880 }), // 1KB to 5MB
          type: faker.helpers.arrayElement(['application/pdf', 'image/jpeg', 'image/png', 'application/docx']),
          url: faker.internet.url(),
        }))
      : undefined,
    ...overrides,
  };
}

export function generateMockEmails(count = 50): Email[] {
  return Array.from({ length: count }, () => generateMockEmail());
}

// Generate some draft emails
export function generateDraftEmails(count = 3): Email[] {
  return Array.from({ length: count }, () =>
    generateMockEmail({
      isDraft: true,
      isRead: false,
      from: {
        name: 'Me',
        email: 'me@gmail.com',
        avatar: faker.image.avatar(),
      },
      timestamp: faker.date.recent({ days: 7 }),
    })
  );
}
