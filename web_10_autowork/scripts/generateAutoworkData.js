#!/usr/bin/env node

/**
 * Generate additional data entries for web10 autowork (jobs, hires, experts)
 * Usage:
 *   node scripts/generateAutoworkData.js --type=jobs --count=50
 *   node scripts/generateAutoworkData.js --type=hires --count=50
 *   node scripts/generateAutoworkData.js --type=experts --count=50
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

let dataType = "jobs";
if (typeArg) {
  const [, value] = typeArg.split("=");
  if (value && ["jobs", "hires", "experts"].includes(value)) {
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
const jobTitles = [
  "Build front-end of e-commerce website",
  "Develop mobile app for social networking",
  "Create backend API for payment processing",
  "Design UI/UX for a fintech application",
  "Implement authentication system",
  "Build responsive WordPress site",
  "Develop REST API with Node.js",
  "Create database schema and migrations",
  "Design and implement user dashboard",
  "Build real-time chat application",
  "Develop automated testing suite",
  "Create CI/CD pipeline",
  "Design mobile app UI/UX",
  "Build microservices architecture",
  "Implement payment gateway integration",
  "Develop admin panel",
  "Create data visualization dashboard",
  "Build recommendation engine",
  "Design landing pages",
  "Develop API documentation"
];

const jobStatuses = ["In progress", "Pending", "Completed", "In review", "On hold", "Cancelled"];

const firstNames = [
  "Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Avery", "Quinn",
  "Sage", "River", "Blake", "Cameron", "Dakota", "Emery", "Finley", "Harper",
  "Hayden", "Jamie", "Kai", "Logan", "Marley", "Noah", "Parker", "Reese",
  "Rowan", "Skylar", "Tatum", "Willow", "Zion", "Aaron", "Ben", "Chris",
  "Dan", "Emma", "Frank", "Grace", "Henry", "Iris", "Jack", "Kevin"
];

const lastNames = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Wilson", "Anderson", "Thomas", "Taylor",
  "Moore", "Jackson", "Martin", "Lee", "Thompson", "White", "Harris", "Sanchez"
];

const countries = [
  "United States", "Colombia", "Spain", "China", "Morocco", "Canada", "United Kingdom",
  "UAE", "Germany", "Australia", "Nigeria", "Brazil", "Singapore", "Poland", "Mexico",
  "Sweden", "Venezuela", "India", "France", "Italy", "Netherlands", "Japan", "South Korea",
  "Argentina", "Chile", "Peru", "Portugal", "Greece", "Turkey", "Egypt"
];

const roles = [
  "Full Stack Developer", "Backend Developer", "Frontend Developer", "UI/UX Designer",
  "Data Scientist", "DevOps Engineer", "Mobile Developer", "Cloud Architect",
  "Site Reliability Engineer", "QA Engineer", "Product Manager", "Project Manager",
  "Security Engineer", "Data Engineer", "Machine Learning Engineer", "AI Engineer",
  "Blockchain Expert", "Marketing Strategist", "Content Manager", "Technical Writer"
];

const languages = [
  "English: Native", "English: Fluent", "English: Conversational",
  "Spanish: Native", "Spanish: Fluent", "Spanish: Conversational",
  "French: Native", "French: Fluent", "French: Conversational",
  "German: Native", "German: Fluent", "German: Conversational",
  "Portuguese: Native", "Portuguese: Fluent",
  "Mandarin: Native", "Mandarin: Conversational",
  "Arabic: Native", "Arabic: Fluent",
  "Hindi: Native", "Hindi: Fluent"
];

const hoursPerWeekOptions = [
  "More than 30 hrs/week", "30 hrs/week", "20-30 hrs/week", "15-25 hrs/week",
  "10-20 hrs/week", "10-15 hrs/week", "Less than 10 hrs/week"
];

const reviewTitles = [
  "Great work on the project",
  "Excellent communication and delivery",
  "High-quality code and documentation",
  "Professional and reliable",
  "Exceeded expectations",
  "Quick turnaround time",
  "Very satisfied with the results",
  "Would definitely hire again",
  "Outstanding performance",
  "Highly recommended"
];

const reviewTexts = [
  "\"Great communication! Always takes the initiative on features to add that would improve the website quality.\"",
  "\"Delivered exactly what was promised on time and within budget.\"",
  "\"Very professional and easy to work with. Highly recommend!\"",
  "\"Excellent technical skills and attention to detail.\"",
  "\"Exceeded expectations. Will definitely work with again.\"",
  "\"Quick response time and great problem-solving skills.\"",
  "\"High-quality work and great collaboration throughout the project.\"",
  "\"Very satisfied with the results. Professional and reliable.\"",
  "\"Outstanding performance and communication. Highly recommended.\"",
  "\"Great experience working together. Would hire again.\""
];

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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

function randomFloat(min, max) {
  return Number((Math.random() * (max - min) + min).toFixed(1));
}

function formatDate(month, day) {
  return `${month} ${day}`;
}

function formatDateRange() {
  const startMonth = randomFrom(months);
  const startDay = randomInt(1, 28);
  const endMonth = randomFrom(months);
  const endDay = randomInt(1, 28);
  const year = 2024 + (Math.random() > 0.5 ? 1 : 0);
  return `${startMonth} ${startDay}, ${year} - ${endMonth} ${endDay}, ${year}`;
}

function generateSlug(name) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/\./g, "");
}

function generateJobs(existingJobs, count) {
  const newJobs = [];
  let attempts = 0;

  while (newJobs.length < count && attempts < count * 20) {
    const title = randomFrom(jobTitles);
    const status = randomFrom(jobStatuses);
    const month = randomFrom(months);
    const day = randomInt(1, 28);
    const start = formatDate(month, day);
    
    const hours = randomInt(0, 120);
    const rate = randomInt(15, 100);
    const total = hours * rate;
    
    let activity, time, timestr;
    if (status === "Completed") {
      timestr = "Total time logged:";
      time = `${hours}:00 hrs ($${total})`;
      activity = `last active ${randomInt(1, 7)} week${randomInt(1, 7) > 1 ? "s" : ""} ago on Deployed to production`;
    } else if (status === "In progress") {
      timestr = "Time logged this week:";
      time = `${hours}:00 hrs ($${total})`;
      activity = `last active ${randomInt(1, 2) === 1 ? "yesterday" : "today"} on Time logged this week: ${time}`;
    } else {
      timestr = "Time logged this week:";
      time = `${hours}:00 hrs ($${total})`;
      activity = `last active ${randomInt(1, 7)} day${randomInt(1, 7) > 1 ? "s" : ""} ago on ${randomFrom(["Initial project setup", "Project planning", "Requirements gathering", "Design phase"])}`;
    }
    
    const active = status === "In progress";

    const job = {
      title,
      status,
      start,
      activity,
      time,
      timestr,
      active
    };

    newJobs.push(job);
    attempts += 1;
  }

  return newJobs;
}

function generateHires(existingHires, count) {
  const existingNames = new Set(existingHires.map((h) => (h.name || "").toLowerCase()));

  const newHires = [];
  let attempts = 0;

  while (newHires.length < count && attempts < count * 20) {
    const firstName = randomFrom(firstNames);
    const lastName = randomFrom(lastNames);
    let name = `${firstName} ${lastName.charAt(0)}.`;
    
    // If name exists, add numerical variation
    let nameAttempt = 0;
    while (existingNames.has(name.toLowerCase()) && nameAttempt < 10) {
      const variation = randomInt(1, 999);
      name = `${firstName} ${lastName.charAt(0)}. ${variation}`;
      nameAttempt += 1;
    }
    
    if (existingNames.has(name.toLowerCase())) {
      name = `${firstName} ${lastName.charAt(0)}. ${randomInt(100, 9999)}`;
    }

    if (existingNames.has(name.toLowerCase())) {
      attempts += 1;
      continue;
    }

    const country = randomFrom(countries);
    const role = randomFrom(roles);
    const rate = randomInt(15, 100);
    const rating = randomFloat(4.0, 5.0);
    const jobs = randomInt(50, 200);
    const rehire = Math.random() > 0.3;
    const gender = Math.random() > 0.5 ? "men" : "women";
    const avatar = `https://randomuser.me/api/portraits/${gender}/${randomInt(1, 99)}.jpg`;

    const hire = {
      name,
      country,
      rate: `$${rate.toFixed(2)}/hr`,
      rating: Number(rating.toFixed(1)),
      jobs,
      role,
      avatar,
      rehire
    };

    existingNames.add(name.toLowerCase());
    newHires.push(hire);
    attempts += 1;
  }

  return newHires;
}

function generateExperts(existingExperts, count) {
  const existingSlugs = new Set(existingExperts.map((e) => (e.slug || "").toLowerCase()));

  const newExperts = [];
  let attempts = 0;

  while (newExperts.length < count && attempts < count * 20) {
    const firstName = randomFrom(firstNames);
    const lastName = randomFrom(lastNames);
    const name = `${firstName} ${lastName.charAt(0)}.`;
    let slug = generateSlug(name);

    if (existingSlugs.has(slug.toLowerCase())) {
      const variation = randomInt(1, 999);
      const newSlug = `${slug}-${variation}`;
      if (existingSlugs.has(newSlug.toLowerCase())) {
        attempts += 1;
        continue;
      }
      slug = newSlug;
    }

    const country = randomFrom(countries);
    const role = randomFrom(roles);
    const rate = randomInt(30, 120);
    const rating = randomFloat(4.0, 5.0);
    const jobs = randomInt(50, 250);
    const consultation = `$${randomInt(80, 200)} per hour`;
    const desc = `${role} available for ${randomFrom(["web development", "mobile development", "design projects", "consulting", "technical projects"])}`;
    
    const earnings = randomInt(1, 50);
    const hours = randomInt(50, 3000);
    const stats = {
      earnings: `$${earnings}k+`,
      jobs: randomInt(3, 10),
      hours: randomInt(50, 500)
    };

    const about = `${role} with ${randomInt(2, 10)}+ years of experience. ${randomFrom(["Passionate about", "Specializing in", "Focused on", "Expert in"])} ${randomFrom(["building scalable solutions", "creating great user experiences", "delivering high-quality code", "solving complex problems"])}.`;

    const hoursPerWeek = randomFrom(hoursPerWeekOptions);
    
    const languageCount = randomInt(1, 3);
    const selectedLanguages = [];
    for (let i = 0; i < languageCount; i++) {
      const lang = randomFrom(languages);
      if (!selectedLanguages.includes(lang)) {
        selectedLanguages.push(lang);
      }
    }

    const reviewHours = randomInt(10, 60);
    const reviewRate = rate;
    const reviewPrice = reviewHours * reviewRate;
    const lastReview = {
      title: randomFrom(reviewTitles),
      stars: 5,
      text: randomFrom(reviewTexts),
      price: `$${reviewPrice.toLocaleString()}`,
      rate: `$${reviewRate}/hr`,
      time: `${reviewHours} hours`,
      dates: formatDateRange()
    };

    const gender = Math.random() > 0.5 ? "men" : "women";
    const avatar = `https://randomuser.me/api/portraits/${gender}/${randomInt(1, 99)}.jpg`;

    const expert = {
      slug,
      name,
      country,
      role,
      avatar,
      rate: `$${rate.toFixed(2)}/hr`,
      rating: Number(rating.toFixed(1)),
      jobs,
      consultation,
      desc,
      stats,
      about,
      hoursPerWeek,
      languages: selectedLanguages,
      lastReview
    };

    existingSlugs.add(slug.toLowerCase());
    newExperts.push(expert);
    attempts += 1;
  }

  return newExperts;
}

function main() {
  let existingData = loadExistingData(dataType);
  let newEntries = [];

  if (dataType === "jobs") {
    newEntries = generateJobs(existingData, count);
  } else if (dataType === "hires") {
    newEntries = generateHires(existingData, count);
  } else if (dataType === "experts") {
    newEntries = generateExperts(existingData, count);
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

