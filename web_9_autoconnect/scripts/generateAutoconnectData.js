#!/usr/bin/env node

/**
 * Generate additional data entries for web9 autoconnect (users, posts, jobs)
 * Usage:
 *   node scripts/generateAutoconnectData.js --type=users --count=50
 *   node scripts/generateAutoconnectData.js --type=posts --count=50
 *   node scripts/generateAutoconnectData.js --type=jobs --count=50
 *
 * The script reads the existing JSON files, generates the requested
 * number of new entries, skips any duplicates, and appends the new entries
 * to the JSON files.
 */

const fs = require("fs");
const path = require("path");

const DEFAULT_COUNT = 50;
const PROJECT_ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.resolve(PROJECT_ROOT, "src/data");

const args = process.argv.slice(2);
const typeArg = args.find((arg) => arg.startsWith("--type"));
const countArg = args.find((arg) => arg.startsWith("--count"));

let dataType = "users";
if (typeArg) {
  const [, value] = typeArg.split("=");
  if (value && ["users", "posts", "jobs"].includes(value)) {
    dataType = value;
  }
}

let count = DEFAULT_COUNT;
if (countArg) {
  const [, value] = countArg.split("=");
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isNaN(parsed) && parsed > 0) {
    count = parsed;
  }
}

// Data pools
const firstNames = [
  "John", "Jane", "Michael", "Sarah", "David", "Emily", "James", "Jessica", "Robert", "Amanda",
  "William", "Ashley", "Richard", "Melissa", "Joseph", "Deborah", "Thomas", "Michelle", "Charles", "Laura",
  "Christopher", "Lisa", "Daniel", "Nancy", "Matthew", "Karen", "Anthony", "Betty", "Mark", "Helen",
  "Donald", "Sandra", "Steven", "Donna", "Paul", "Carol", "Andrew", "Ruth", "Joshua", "Sharon",
  "Kenneth", "Michelle", "Kevin", "Cynthia", "Brian", "Kathleen", "George", "Amy", "Edward", "Angela"
];

const lastNames = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
  "Hernandez", "Lopez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee",
  "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young"
];

const titles = [
  "Software Engineer", "Product Manager", "Designer", "Marketing Manager", "Data Scientist",
  "Sales Manager", "HR Manager", "Business Analyst", "Project Manager", "UX Designer",
  "Frontend Developer", "Backend Developer", "Full Stack Developer", "DevOps Engineer", "QA Engineer",
  "Content Manager", "Social Media Manager", "Accountant", "Financial Analyst", "Operations Manager",
  "CEO", "CTO", "CFO", "VP of Engineering", "VP of Product", "Director of Marketing", "Senior Engineer",
  "Lead Designer", "Technical Lead", "Engineering Manager"
];

const companies = [
  "Google", "Microsoft", "Apple", "Amazon", "Meta", "Netflix", "Tesla", "Uber", "Airbnb", "Stripe",
  "Shopify", "Salesforce", "Oracle", "IBM", "Intel", "Adobe", "Nvidia", "PayPal", "LinkedIn", "Twitter",
  "Spotify", "Snapchat", "Pinterest", "Reddit", "Discord", "Zoom", "Slack", "Dropbox", "Evernote", "Notion"
];

const locations = [
  "San Francisco, CA", "New York, NY", "Seattle, WA", "Austin, TX", "Boston, MA",
  "Los Angeles, CA", "Chicago, IL", "Denver, CO", "Portland, OR", "Remote",
  "Mountain View, CA", "Palo Alto, CA", "Cambridge, MA", "Atlanta, GA", "Miami, FL",
  "Dallas, TX", "Phoenix, AZ", "Philadelphia, PA", "San Diego, CA", "San Jose, CA"
];

const jobTitles = [
  "Senior Frontend Developer", "Backend Engineer", "Full Stack Developer", "DevOps Engineer",
  "Product Manager", "UX Designer", "Data Scientist", "Machine Learning Engineer",
  "Software Architect", "Technical Lead", "Engineering Manager", "QA Engineer",
  "Mobile Developer", "Security Engineer", "Cloud Engineer", "Site Reliability Engineer",
  "Business Analyst", "Marketing Manager", "Sales Manager", "HR Manager"
];

const industries = [
  "Technology", "Finance", "Healthcare", "Education", "Retail", "Manufacturing",
  "Consulting", "Media", "Entertainment", "Real Estate", "Transportation", "Energy"
];

const postContents = [
  "Just shipped a new feature! Excited to see how users respond.",
  "Great team meeting today. Love working with such talented people.",
  "Learning new technologies is always exciting. Currently diving into {tech}.",
  "Had an amazing experience at {event}. Highly recommend!",
  "Sharing some insights from my recent project. Hope it helps others.",
  "Thankful for the opportunity to work on challenging problems.",
  "Just completed a certification in {topic}. Always learning!",
  "Excited to announce that I'm joining {company}!",
  "Reflecting on the past year. Grateful for all the growth.",
  "Looking forward to {event} next week. Who else is going?"
];

const commentTexts = [
  "Great post! Thanks for sharing.",
  "Congratulations! Well deserved.",
  "This is really insightful. Thanks!",
  "I completely agree with this.",
  "Looking forward to hearing more about this.",
  "Amazing work! Keep it up.",
  "This resonates with me. Thanks for posting.",
  "Great insights! Would love to learn more.",
  "Congratulations on this achievement!",
  "This is exactly what I needed to hear today."
];

const techTerms = ["React", "TypeScript", "Node.js", "Python", "AWS", "Docker", "Kubernetes", "GraphQL"];
const events = ["Tech Conference 2025", "Developer Meetup", "Product Summit", "Design Week", "Hackathon"];

function loadExistingData(dataType) {
  const filePath = path.resolve(DATA_DIR, `${dataType}.json`);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
    return [];
  }
}

function randomFrom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const timeDiff = endDate.getTime() - startDate.getTime();
  const randomTime = Math.random() * timeDiff;
  return new Date(startDate.getTime() + randomTime);
}

function formatDate(date) {
  return date.toISOString();
}

function formatDateOnly(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function generateUsername(firstName, lastName) {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
}

function generateCompanyDomain(company) {
  return company.toLowerCase().replace(/\s+/g, "") + ".com";
}

function generateDuration(startDate, isCurrent = true) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const startMonth = months[startDate.getMonth()];
  const startYear = startDate.getFullYear();
  
  if (isCurrent) {
    const now = new Date();
    const years = now.getFullYear() - startYear;
    const monthsDiff = now.getMonth() - startDate.getMonth();
    const totalMonths = years * 12 + monthsDiff;
    const yearsPart = Math.floor(totalMonths / 12);
    const monthsPart = totalMonths % 12;
    return `${startMonth} ${startYear} - Present • ${yearsPart} yrs ${monthsPart} mos`;
  } else {
    const endDate = randomDate(startDate, new Date());
    const endMonth = months[endDate.getMonth()];
    const endYear = endDate.getFullYear();
    const years = endYear - startYear;
    const monthsDiff = endDate.getMonth() - startDate.getMonth();
    const totalMonths = years * 12 + monthsDiff;
    const yearsPart = Math.floor(totalMonths / 12);
    const monthsPart = totalMonths % 12;
    return `${startMonth} ${startYear} - ${endMonth} ${endYear} • ${yearsPart} yrs ${monthsPart} mos`;
  }
}

function generateUsers(existingUsers, count) {
  const existingUsernames = new Set(existingUsers.map((u) => (u.username || "").toLowerCase()));

  const newUsers = [];
  let attempts = 0;
  let usernameVariation = 1;

  while (newUsers.length < count && attempts < count * 20) {
    const firstName = randomFrom(firstNames);
    const lastName = randomFrom(lastNames);
    let username = generateUsername(firstName, lastName);
    
    // If username exists, add numerical variation
    let nameAttempt = 0;
    while (existingUsernames.has(username.toLowerCase()) && nameAttempt < 10) {
      username = `${generateUsername(firstName, lastName)}${usernameVariation}`;
      nameAttempt += 1;
    }
    
    if (existingUsernames.has(username.toLowerCase())) {
      username = `${generateUsername(firstName, lastName)}${randomInt(100, 9999)}`;
      usernameVariation += 1;
    }

    if (existingUsernames.has(username.toLowerCase())) {
      attempts += 1;
      continue;
    }

    const name = `${firstName} ${lastName}`;
    const title = randomFrom(titles);
    const gender = Math.random() > 0.5 ? "men" : "women";
    const avatar = `https://randomuser.me/api/portraits/${gender}/${randomInt(1, 99)}.jpg`;
    
    const bioTemplates = [
      `${title} passionate about building products.`,
      `${title} & startup enthusiast.`,
      `Experienced ${title} with a passion for innovation.`,
      `${title} focused on creating great user experiences.`,
      `Senior ${title} with expertise in modern technologies.`
    ];
    const bio = randomFrom(bioTemplates);

    const aboutParagraphs = [
      `Hello, I'm ${firstName}! I specialize in ${title.toLowerCase()} and building delightful experiences. I love working with modern technologies and solving interesting problems. Always looking for new challenges to tackle!`,
      `Experienced professional with a passion for innovation and continuous learning. I've worked on various projects and love collaborating with talented teams.`,
      `I'm dedicated to creating impactful solutions and helping teams succeed. With years of experience in the field, I bring a unique perspective to every project.`
    ];
    const about = aboutParagraphs.slice(0, randomInt(2, 3)).join("\n\n");

    const experienceCount = randomInt(1, 3);
    const experiences = [];
    let currentDate = new Date(2020, 0, 1);
    
    for (let i = 0; i < experienceCount; i++) {
      const company = randomFrom(companies);
      const expTitle = randomFrom(titles);
      const location = randomFrom(locations);
      const startDate = randomDate(new Date(2015, 0, 1), currentDate);
      const isCurrent = i === 0 && Math.random() > 0.3;
      
      if (!isCurrent) {
        currentDate = randomDate(startDate, currentDate);
      }
      
      const duration = generateDuration(startDate, isCurrent);
      const description = `Working on ${expTitle.toLowerCase()} projects. Building innovative solutions and collaborating with cross-functional teams to deliver high-quality products.`;

      experiences.push({
        title: expTitle,
        company,
        logo: `https://logo.clearbit.com/${generateCompanyDomain(company)}`,
        duration,
        location,
        description
      });
    }

    const user = {
      username,
      name,
      avatar,
      bio,
      title,
      about,
      experience: experiences
    };

    existingUsernames.add(username.toLowerCase());
    newUsers.push(user);
    attempts += 1;
  }

  return newUsers;
}

function generatePosts(existingPosts, existingUsers, count) {
  const existingIds = new Set(existingPosts.map((p) => (p.id || "").toLowerCase()));
  let nextId = existingPosts.length > 0
    ? Math.max(...existingPosts.map(p => {
        const match = (p.id || "").match(/p(\d+)/);
        return match ? Number.parseInt(match[1], 10) : 0;
      })) + 1
    : 1;

  const newPosts = [];
  let attempts = 0;

  while (newPosts.length < count && attempts < count * 20) {
    const id = `p${nextId}`;
    
    if (existingIds.has(id.toLowerCase())) {
      nextId += 1;
      attempts += 1;
      continue;
    }

    const allUsers = existingUsers.length > 0 ? existingUsers : [
      {
        username: "johndoe",
        name: "John Doe",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        bio: "Software Engineer passionate about building products.",
        title: "Software Engineer"
      }
    ];
    const user = randomFrom(allUsers);

    let content = randomFrom(postContents);
    content = content.replace(/{tech}/g, randomFrom(techTerms));
    content = content.replace(/{event}/g, randomFrom(events));
    content = content.replace(/{company}/g, randomFrom(companies));

    const timestamp = randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date());
    const likes = randomInt(0, 100);
    const liked = Math.random() > 0.7;

    const hasImage = Math.random() > 0.7;
    const image = hasImage
      ? `https://images.unsplash.com/photo-${randomInt(1000000000000, 9999999999999)}?w=720&h=420&fit=crop&crop=entropy&auto=format&q=80`
      : undefined;

    const commentCount = randomInt(0, 3);
    const comments = [];
    let commentId = 1;
    
    for (let i = 0; i < commentCount; i++) {
      const commentUser = randomFrom(allUsers);
      if (commentUser.username === user.username) continue;
      
      const commentTimestamp = randomDate(timestamp, new Date());
      comments.push({
        id: `c${commentId}`,
        user: commentUser,
        text: randomFrom(commentTexts),
        timestamp: formatDate(commentTimestamp)
      });
      commentId += 1;
    }

    const post = {
      id,
      user,
      content,
      timestamp: formatDate(timestamp),
      likes,
      liked,
      comments,
      ...(image && { image })
    };

    existingIds.add(id.toLowerCase());
    newPosts.push(post);
    nextId += 1;
    attempts += 1;
  }

  return newPosts;
}

function generateJobs(existingJobs, count) {
  const existingIds = new Set(existingJobs.map((j) => (j.id || "").toLowerCase()));
  let nextId = existingJobs.length > 0
    ? Math.max(...existingJobs.map(j => {
        const match = (j.id || "").match(/j(\d+)/);
        return match ? Number.parseInt(match[1], 10) : 0;
      })) + 1
    : 1;

  const newJobs = [];
  let attempts = 0;

  while (newJobs.length < count && attempts < count * 20) {
    const id = `j${nextId}`;
    
    if (existingIds.has(id.toLowerCase())) {
      nextId += 1;
      attempts += 1;
      continue;
    }

    const title = randomFrom(jobTitles);
    const company = randomFrom(companies);
    const location = randomFrom(locations);
    const remote = Math.random() > 0.5;
    const finalLocation = remote ? "Remote" : location;
    
    const salaryRanges = [
      "$80,000 - $120,000",
      "$100,000 - $150,000",
      "$120,000 - $180,000",
      "$150,000 - $200,000",
      "$180,000 - $250,000"
    ];
    const salary = randomFrom(salaryRanges);
    
    const jobTypes = ["Full-time", "Part-time", "Contract", "Internship"];
    const type = randomFrom(jobTypes);
    
    const experienceLevels = ["Entry level", "2+ years", "3+ years", "5+ years", "7+ years", "10+ years"];
    const experience = randomFrom(experienceLevels);

    const description = `We're looking for a ${title} to join our growing team. You'll be responsible for building scalable solutions and working with modern technologies. This is an exciting opportunity to make a significant impact.`;

    const requirementTemplates = [
      `${experience} of experience with modern technologies`,
      "Strong problem-solving and analytical skills",
      "Excellent communication and collaboration abilities",
      "Experience with agile development methodologies",
      "Bachelor's degree in Computer Science or related field",
      "Proven track record of delivering high-quality solutions",
      "Ability to work in a fast-paced environment"
    ];
    const requirementCount = randomInt(4, 7);
    const requirements = [];
    for (let i = 0; i < requirementCount; i++) {
      requirements.push(randomFrom(requirementTemplates));
    }

    const benefitTemplates = [
      "Competitive salary and equity package",
      "Flexible remote work policy",
      "Comprehensive health insurance",
      "401(k) matching program",
      "Unlimited paid time off",
      "Professional development opportunities",
      "Stock options",
      "Gym membership",
      "Catered meals",
      "Team building events"
    ];
    const benefitCount = randomInt(3, 6);
    const benefits = [];
    for (let i = 0; i < benefitCount; i++) {
      const benefit = randomFrom(benefitTemplates);
      if (!benefits.includes(benefit)) {
        benefits.push(benefit);
      }
    }

    const postedDate = formatDateOnly(randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()));
    const applicationCount = randomInt(10, 300);
    const companySize = randomFrom(["10-50 employees", "50-100 employees", "100-500 employees", "500-1000 employees", "1000+ employees"]);
    const industry = randomFrom(industries);

    const job = {
      id,
      title,
      company,
      location: finalLocation,
      logo: `https://logo.clearbit.com/${generateCompanyDomain(company)}`,
      salary,
      type,
      experience,
      description,
      requirements,
      benefits,
      postedDate,
      applicationCount,
      companySize,
      industry,
      remote
    };

    existingIds.add(id.toLowerCase());
    newJobs.push(job);
    nextId += 1;
    attempts += 1;
  }

  return newJobs;
}

function main() {
  let existingData = loadExistingData(dataType);
  let newEntries = [];

  if (dataType === "users") {
    newEntries = generateUsers(existingData, count);
  } else if (dataType === "posts") {
    const existingUsers = loadExistingData("users");
    newEntries = generatePosts(existingData, existingUsers, count);
  } else if (dataType === "jobs") {
    newEntries = generateJobs(existingData, count);
  }

  if (newEntries.length === 0) {
    console.warn(`No new ${dataType} were generated. Try increasing the vocabulary or count.`);
    return;
  }

  const updated = [...existingData, ...newEntries];
  const filePath = path.resolve(DATA_DIR, `${dataType}.json`);
  fs.writeFileSync(filePath, `${JSON.stringify(updated, null, 2)}\n`, "utf-8");
  console.log(`Added ${newEntries.length} new ${dataType} to ${filePath}`);
}

main();

