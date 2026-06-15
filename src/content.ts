// ---------------------------------------------------------------------------
// content.ts
// Single source of truth for all portfolio copy, extracted from
// "Jason Resume June 2026.pdf" and github.com/Jason-Joseph.
// Presentation-agnostic: every section component reads from here.
// ---------------------------------------------------------------------------

export interface Profile {
  name: string;
  firstName: string;
  title: string;
  tagline: string;
  photoPath: string;
}

export interface ExperienceItem {
  company: string;
  shortName: string;
  role: string;
  location: string;
  dates: string;
  highlights: string[];
  /** Path under /public to the institution's logo (high-res / vector). */
  logo: string;
}

export interface EducationItem {
  institution: string;
  degree: string;
  dates: string;
  details: string;
  /** Path under /public to the institution's logo (high-res / vector). */
  logo: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface SkillCategory {
  category: string;
  items: string[];
}

export interface ProjectItem {
  index: string;
  title: string;
  description: string;
  tags: string[];
  /** Source/live link (GitHub repo, notebook, or deployed site). */
  link: string;
}

export interface Contact {
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  location: string;
  availability: string;
}

/** How many projects get the full editorial row; the rest live in "More". */
export const FEATURED_PROJECTS = 3;

export const content = {
  profile: {
    name: "Jason Joseph Tjiadi",
    firstName: "Jason",
    title: "Data Enthusiast",
    tagline:
      "Fintech and banking analytics across Singapore and Indonesia — turning transaction data and business signals into clarity that actually changes decisions.",
    photoPath: "/portrait.jpg",
  } satisfies Profile,

  about: {
    lead: "I turn messy, real-world data into insight people can act on.",
    body:
      "I'm a final-year NUS Master's candidate specialising in Data and Communication, and a First Class LSE graduate in Data Science & Business Analytics. " +
      "My work sits at the intersection of analytics and partnerships across fintech and banking — building dashboards, automating reporting, and digging into transaction data. " +
      "Day to day, that means Python, SQL, and BI tools — and staying curious about what the numbers are actually trying to say.",
  },

  stats: [
    { value: "10,000+", label: "merchants analysed at KPay" },
    { value: "~21%", label: "average GPV growth supported" },
    { value: "20+", label: "merchant partners at BCA" },
    { value: "First Class", label: "honours, LSE" },
  ] satisfies StatItem[],

  experience: [
    {
      company: "KPay Merchant Service (Singapore) Pte. Ltd.",
      shortName: "KPay",
      role: "Data Analyst Intern",
      location: "Singapore",
      dates: "Sep 2025 — Mar 2026",
      logo: "/logos/kpay.svg",
      highlights: [
        "Built dashboards analysing payment data for 10,000+ merchants, giving stakeholders visibility into product usage, revenue performance, and growth trends.",
        "Conducted merchant profitability and acquirer-level analysis to support routing and pricing decisions, contributing to ~21% average GPV growth across merchant segments and improved net take rate.",
        "Automated recurring reports and data workflows, and supported the platform data migration that improved data accuracy and reliability.",
        "Cleaned and validated payment and merchant data in Python using fuzzy matching to ensure integrity across business reviews and reporting.",
      ],
    },
    {
      company: "PT Bank Central Asia Tbk (BCA)",
      shortName: "BCA",
      role: "Analyst, Partnership & Benefits",
      location: "Indonesia",
      dates: "Dec 2023 — Jul 2025",
      logo: "/logos/bca.svg",
      highlights: [
        "Analysed transaction data across 20+ merchant partners, identifying ~10% average YoY sales uplift through BCA's internal transaction system.",
        "Examined benefits-usage data from data warehouse (DWH) extracts to identify high-value usage patterns, which informed the design of new premium benefit offerings.",
        "Enhanced an internal benefit-tracking web app (OutSystems), enabling service teams to log and manage premier banking benefits and improving reporting visibility.",
        "Planned and ran exclusive events (expos, forums) for high-net-worth clients to strengthen relationships and engagement.",
      ],
    },
  ] satisfies ExperienceItem[],

  education: [
    {
      institution: "National University of Singapore",
      degree: "Master of Communication, Data and Communication Specialisation",
      dates: "Aug 2025 — Jul 2026",
      details: "GPA 4.4 / 5.0",
      logo: "/logos/nus.png",
    },
    {
      institution: "London School of Economics",
      degree: "BSc Data Science & Business Analytics",
      dates: "Oct 2020 — Aug 2023",
      details:
        "First Class Honours · Achiever's Award (2021) · Distinction, CHESS programme",
      logo: "/logos/lse.svg",
    },
  ] satisfies EducationItem[],

  skills: [
    { category: "Languages & Querying", items: ["Python", "SQL", "R", "SPSS"] },
    {
      category: "BI & Visualization",
      items: ["Tableau", "Power BI", "Google Sheets", "Lark"],
    },
    {
      category: "Data Work",
      items: [
        "Dashboarding",
        "Data cleaning & validation",
        "Automated reporting",
        "Data migration",
      ],
    },
    { category: "Spoken", items: ["English", "Bahasa Indonesia"] },
  ] satisfies SkillCategory[],

  marquee: [
    "Python",
    "SQL",
    "R",
    "Tableau",
    "Power BI",
    "pandas",
    "Data Visualization",
    "Dashboarding",
    "Automated Reporting",
    "SPSS",
    "Data Migration",
  ],

  // Pulled from GitHub (github.com/Jason-Joseph) — the substantive,
  // self-authored data projects, with verified source links.
  projects: [
    {
      index: "01",
      title: "Airline Flight Delay Analysis",
      description:
        "Two years of U.S. flight on-time data, merged and cleaned in Python — pinpointing the best time of day, day of week, and season to fly to minimise delays, and testing whether older aircraft suffer more.",
      tags: ["Python", "pandas", "EDA"],
      link: "https://github.com/Jason-Joseph/Projects/blob/main/Data%20Expo%202002-2003%20Airline%20Time%20Data.ipynb",
    },
    {
      index: "02",
      title: "Superstore Sales & Profit Analysis",
      description:
        "The Kaggle Superstore dataset, cleaned and explored in Python — breaking down sales and profit by category, region, and segment to surface where to double down and where to cut back.",
      tags: ["Python", "pandas", "Retail Analytics"],
      link: "https://github.com/Jason-Joseph/Projects/blob/main/Kaggle%20Superstore%20Data.ipynb",
    },
    {
      index: "03",
      title: "Business Intelligence Capstone",
      description:
        "End-to-end BI capstone from the Dibimbing.id bootcamp — built on Python, SQL, Tableau, and Power BI, from raw data to boardroom-ready dashboards.",
      tags: ["Business Intelligence", "Tableau", "Power BI"],
      link: "https://github.com/Jason-Joseph/Projects/blob/main/Dibimbing%20B14%20Final%20Project.pdf",
    },
    {
      index: "04",
      title: "Statistical Modelling in R",
      description:
        "University coursework in R spanning regression, classification, and unsupervised learning on real datasets.",
      tags: ["R", "Regression", "Clustering"],
      link: "https://github.com/Jason-Joseph/Projects",
    },
    {
      index: "05",
      title: "Personal Portfolio Site",
      description:
        "An earlier personal portfolio — designed, built, and shipped to production on Vercel.",
      tags: ["HTML", "CSS", "Web"],
      link: "https://github.com/Jason-Joseph/website-portfolio",
    },
  ] satisfies ProjectItem[],

  contact: {
    email: "jjtjiadi02@gmail.com",
    phone: "+65 8351 0343",
    linkedin: "https://linkedin.com/in/jasontjiadi",
    github: "https://github.com/Jason-Joseph",
    location: "Singapore",
    availability:
      "Based in Singapore — always glad to talk data, ideas, and interesting problems.",
  } satisfies Contact,
};

export default content;
