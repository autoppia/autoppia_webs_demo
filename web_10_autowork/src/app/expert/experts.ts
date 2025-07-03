export const experts = [
  {
    slug: "alexa-r",
    name: "Alexa R.",
    country: "Mosquera, Colombia",
    role: "Full-stack developer",
    avatar: "https://ext.same-assets.com/1836270417/271536834.png",
    stats: { earnings: "$2k+", jobs: 4, hours: 100 },
    about:
      "I'm a full-stack developer with 4 years of experience in web development. I have a passion for learning and sharing my knowledge with others as publicly as possible. I write articles, speak at conferences, and host workshops. I'm a big fan of JavaScript and love building scalable and maintainable web applications.",
    hoursPerWeek: "More than 30 hrs/week",
    languages: ["English: Conversational", "Spanish: Native or Bilingual"],
    lastReview: {
      title: "Squarespace Designer to create new company website",
      stars: 5,
      text: '"Great communication! Always takes the initiative on features to add that would improve the website quality."',
      price: "$500",
      rate: "$50/hr",
      time: "10 hours",
      dates: "Jun 16, 2024 – Jun 17, 2024",
    },
  },
  {
    slug: "ashley-c",
    name: "Ashley C.",
    country: "USA",
    role: "Backend Developer",
    avatar: "https://randomuser.me/api/portraits/women/32.jpg",
    stats: { earnings: "$1k+", jobs: 3, hours: 90 },
    about:
      "Backend specialist with a focus on scalable systems and great team communication.",
    hoursPerWeek: "30 hrs/week",
    languages: ["English: Fluent"],
    lastReview: {
      title: "Great collaborator!",
      stars: 5,
      text: '"Ashley was amazing to work with."',
      price: "$250",
      rate: "$35/hr",
      time: "8 hours",
      dates: "Jun 1, 2025 – Jun 5, 2025",
    },
  },
  {
    slug: "angela-w",
    name: "Angela W.",
    country: "Spain",
    role: "UI/UX Designer",
    avatar: "https://ext.same-assets.com/1836270417/3930451942.png",
    stats: { earnings: "$4k+", jobs: 95, hours: 300 },
    about:
      "Experienced UI/UX designer with a focus on crafting user-centered digital experiences. I help businesses create beautiful and usable interfaces. Passionate about accessibility, responsive design, and Figma prototyping.",
    hoursPerWeek: "20–30 hrs/week",
    languages: ["English: Fluent", "Spanish: Native"],
    lastReview: {
      title: "Figma design for mobile app",
      stars: 5,
      text: '"Angela delivered high-quality designs and quickly understood the product vision."',
      price: "$720",
      rate: "$40/hr",
      time: "18 hours",
      dates: "May 3, 2025 – May 10, 2025",
    },
  },
  {
    slug: "brandon-m",
    name: "Brandon M.",
    country: "Morocco",
    role: "Blockchain Expert",
    avatar: "https://ext.same-assets.com/1836270417/281053763.png",
    stats: { earnings: "$6k+", jobs: 80, hours: 200 },
    about:
      "Blockchain expert specializing in decentralized applications, smart contracts, and Ethereum. I work with startups and enterprises to build secure blockchain-based solutions.",
    hoursPerWeek: "30+ hrs/week",
    languages: ["English: Fluent", "Arabic: Native", "French: Conversational"],
    lastReview: {
      title: "Smart contract development for NFT project",
      stars: 5,
      text: '"Very professional, delivered everything ahead of schedule with clean Solidity code."',
      price: "$1,000",
      rate: "$70/hr",
      time: "15 hours",
      dates: "Apr 20, 2025 – Apr 25, 2025",
    },
  },
];

export function getExpert(slug: string) {
  return experts.find((e) => e.slug === slug);
}
