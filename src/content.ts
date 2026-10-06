// ---------------------------------------------------------------------------
// content.ts
// Single source of truth for all portfolio copy, extracted from
// "Jason Resume 2026-09.pdf" and github.com/Jason-Joseph.
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
  /** Source/live link (GitHub repo, notebook, deployed site, or mailto). */
  link: string;
  /** Cover chart under /public/projects — one strong image per project. */
  image?: string;
  imageAlt?: string;
  /** Small live-pill overlaid on the cover (e.g. "You're on it"). */
  badge?: string;
  /** Which Work band the project renders in. */
  kind: "data" | "ai";
  /** Told in full by the <Signal> featured story, so it renders no row. */
  story?: boolean;
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
    title: "Data Analyst",
    tagline:
      "Two years of fintech and banking analytics across Singapore and Indonesia — KPI dashboards and alerts that inform pricing, product, and partnership decisions.",
    photoPath: "/jason-2026-08.jpg",
  } satisfies Profile,

  about: {
    lead: "I turn messy, real-world data into insight people can act on.",
    body:
      "I'm a data analyst with a First Class BSc in Data Science and Business Analytics from the University of London, under LSE academic direction, and a Master of Communication (Data and Communication) from NUS. " +
      "I've spent two years in fintech and banking, analysing data on 10,000+ merchants and 200,000 high-net-worth customers, and building the KPI dashboards and alerts that inform pricing, product, and partnership decisions. " +
      "Day to day, that means SQL, Python, and BI tools. I work in English and Bahasa Indonesia.",
  },

  stats: [
    { value: "10,000+", label: "merchants analysed at KPay" },
    { value: "~21%", label: "average GPV growth supported" },
    { value: "200,000", label: "high-net-worth customers profiled at BCA" },
    { value: "First Class", label: "honours, University of London (LSE)" },
  ] satisfies StatItem[],

  // ---------------------------------------------------------------------
  // "The Signal" — the scroll-driven data story. Every figure below is
  // traceable to the public notebook; see
  // docs/superpowers/specs/2026-07-09-the-signal-design.md for provenance.
  // Minutes = mean(ArrDelay) + mean(DepDelay) per DayOfWeek over 11.76M rows.
  // Mon–Fri exact from the notebook; Sat/Sun read off q1_delay_by_day.png
  // (that notebook cell used .head() and truncated those rows).
  // Do NOT reshape these into a more dramatic story: the ~6 minute spread
  // between best and worst IS the finding.
  // ---------------------------------------------------------------------
  signal: {
    totalFlights: 11759899,
    days: [
      { day: "Mon", minutes: 44.4 },
      { day: "Tue", minutes: 42.3 },
      { day: "Wed", minutes: 41.1 },
      { day: "Thu", minutes: 44.4 },
      { day: "Fri", minutes: 44.9 },
      { day: "Sat", minutes: 39.0 },
      { day: "Sun", minutes: 43.7 },
    ],
    /** Indices into `days` for the two highlighted beats. */
    worstIndex: 4,
    bestIndex: 5,
    /** Y-axis ceiling. Baseline is always zero — never truncate it. */
    axisMax: 50,
    method:
      "Python, pandas, scikit-learn. 11.7M rows cleaned and grouped. Four models benchmarked, Random Forest best at R² 0.975.",
    notebook:
      "https://github.com/Jason-Joseph/Projects/blob/main/Data%20Expo%202002-2003%20Airline%20Time%20Data.ipynb",
  },

  experience: [
    {
      company: "KPay Merchant Service (Singapore) Pte. Ltd.",
      shortName: "KPay",
      role: "Data Analyst Intern",
      location: "Singapore",
      dates: "Sep 2025 — Mar 2026",
      logo: "/logos/kpay.svg",
      highlights: [
        "Shaped merchant programme strategy for the Director of Revenue Operations and project managers by evaluating programme performance across 10,000+ merchants with SQL and Python.",
        "Contributed to ~21% average GPV growth and a higher net take rate across merchant segments by analysing merchant profitability and acquirer-level performance to guide routing and pricing.",
        "Improved visibility of merchant performance, product adoption, and the lead-to-signing pipeline for sales and management by building a suite of Lark dashboards fed by Zapier from WATI.",
        "Eliminated a manual weekly review by automating GPV monitoring for 500+ target merchants in Google Apps Script and Google Sheets, with threshold alerts flagging at-risk accounts.",
        "Kept merchant records consistent through a platform data migration by standardising naming across source systems with Python fuzzy matching.",
      ],
    },
    {
      company: "PT Bank Central Asia Tbk (BCA)",
      shortName: "BCA",
      role: "Partnership & Benefits Analyst · Individual Customer Business Division",
      location: "Jakarta, Indonesia",
      dates: "Dec 2023 — Jul 2025",
      logo: "/logos/bca.svg",
      highlights: [
        "Shaped the proposition for a new ultra-high-net-worth tier by profiling 200,000 high-net-worth customers' demographics, spending, and behaviour from data warehouse extracts in Power BI and Excel.",
        "Identified a ~10% average YoY sales uplift across 20+ merchant partners by analysing transaction data in Excel and Power BI and delivering partner performance insights.",
        "Established the first centralised record of premier banking benefit usage by implementing an OutSystems tracking application that replaced manual logs across the customer service team.",
        "Strengthened relationships with high-net-worth customers by organising exclusive client events, including an economic forum for 300+ guests alongside BCA's senior leadership.",
      ],
    },
  ] satisfies ExperienceItem[],

  education: [
    {
      institution: "National University of Singapore",
      degree: "Master of Communication, Data and Communication Specialisation",
      dates: "Aug 2025 — Jun 2026",
      details: "GPA 4.6 / 5.0",
      logo: "/logos/nus.png",
    },
    {
      institution: "University of London, academic direction from the London School of Economics (LSE)",
      degree: "BSc Data Science and Business Analytics",
      dates: "Oct 2020 — Aug 2023",
      details:
        "First Class Honours · Studied at SIM, Singapore · Achiever's Award (2021) · Distinction, CHESS programme",
      logo: "/logos/lse.svg",
    },
  ] satisfies EducationItem[],

  skills: [
    {
      category: "Querying & Programming",
      items: ["SQL (PostgreSQL, MySQL, BigQuery)", "Python (pandas, scikit-learn)", "R", "SPSS", "Git/GitHub"],
    },
    {
      category: "BI & Visualisation",
      items: ["Tableau", "Power BI", "Looker Studio", "Google Sheets", "Lark dashboards"],
    },
    {
      category: "Excel & Office",
      items: ["Advanced Excel (Power Query, XLOOKUP, dynamic arrays, Pivot Tables)", "PowerPoint", "Word"],
    },
    {
      category: "Analytics",
      items: [
        "Data cleaning",
        "KPI reporting",
        "Funnel and cohort analysis",
        "RFM segmentation",
        "ETL automation",
        "Data migration",
      ],
    },
    { category: "Languages", items: ["English (fluent)", "Bahasa Indonesia (native)"] },
  ] satisfies SkillCategory[],

  marquee: [
    "SQL",
    "Python",
    "R",
    "Tableau",
    "Power BI",
    "Looker Studio",
    "pandas",
    "scikit-learn",
    "KPI Reporting",
    "Cohort Analysis",
    "RFM Segmentation",
    "ETL Automation",
  ],

  // Pulled from GitHub (github.com/Jason-Joseph) — the substantive,
  // self-authored data projects, with verified source links.
  projects: [
    {
      index: "01",
      title: "Flight Delay Analysis & Prediction",
      description:
        "Predicted flight delays with R² 0.975 using Random Forest, the best of four benchmarked models, after cleaning 11.7M US flight records to find the lowest-delay travel windows.",
      tags: ["Python", "scikit-learn", "pandas"],
      link: "https://github.com/Jason-Joseph/Projects/blob/main/Data%20Expo%202002-2003%20Airline%20Time%20Data.ipynb",
      image: "/projects/q1_delay_by_day.png",
      imageAlt: "Bar chart of average U.S. flight delay by day of week",
      kind: "data",
      story: true,
    },
    {
      index: "02",
      title: "Superstore Sales & Profit Analysis",
      description:
        "The Kaggle Superstore dataset, cleaned and explored in Python — breaking down sales and profit by category, region, and segment to surface where to double down and where to cut back.",
      tags: ["Python", "pandas", "Retail Analytics"],
      link: "https://github.com/Jason-Joseph/Projects/blob/main/Kaggle%20Superstore%20Data.ipynb",
      image: "/projects/superstore_correlation.png",
      imageAlt: "Correlation heatmap of Superstore sales, quantity, discount, and profit",
      kind: "data",
    },
    {
      index: "03",
      title: "Customer Retention Analytics",
      description:
        "Surfaced a 6 to 10 month churn window across 1.07M transactions using RFM segmentation in PostgreSQL (CTEs, window functions) and cohort analysis in Tableau.",
      tags: ["SQL", "Python", "Tableau"],
      link: "https://github.com/Jason-Joseph/Projects/blob/main/Online%20Retail%20Customer%20Analytics%20Dashboard.pdf",
      image: "/projects/cohort_analysis.jpg",
      imageAlt: "Customer retention cohort analysis heatmap",
      kind: "data",
    },
    {
      index: "04",
      title: "This Portfolio Site",
      description:
        "The site you're on: a procedural three.js city that turns from golden hour to night as you scroll, with GSAP scroll choreography and a live data story, designed and shipped end-to-end in partnership with Claude Code.",
      tags: ["Claude Code", "three.js", "GSAP"],
      link: "#top",
      image: "/projects/portfolio-cover.jpg",
      imageAlt: "Hero of this portfolio: numbers made legible, decisions made easier",
      badge: "You're on it",
      kind: "ai",
    },
    {
      index: "05",
      title: "Unfold — A Conversation Card Game",
      description:
        "One card at a time, everyone unfolds a little. A conversation card game with live sessions you can host or join — vibe-coded with Claude Code and installable on your phone as a web app.",
      tags: ["Claude Code", "PWA", "Game"],
      link: "https://unfold-cardgame.vercel.app",
      image: "/projects/unfold-cover.jpg",
      imageAlt: "Unfold card game landing screen",
      kind: "ai",
    },
    {
      index: "06",
      title: "Kaching — Telegram Budget Tracker",
      description:
        "A Telegram-first expense tracker: message the bot in plain language, AI parses the spend, and a live web dashboard keeps the running picture. Built for Singapore daily spending. Ask me for a demo.",
      tags: ["Claude Code", "Next.js", "Telegram"],
      link: "mailto:jjtjiadi02@gmail.com?subject=Kaching%20demo",
      image: "/projects/kaching-cover.jpg",
      imageAlt: "Kaching — Telegram-first expense tracking",
      kind: "ai",
    },
    {
      index: "07",
      title: "Agentic OS — Usage Observatory",
      description:
        "The black box for my daily AI workflow. Hooks log every Claude Code session as I work, collectors distill the logs into patterns, and a live HUD surfaces skill rankings, a knowledge graph, and morning reports that tell me what to sharpen next. Tracking costs zero tokens.",
      tags: ["Claude Code", "Analytics", "Tooling"],
      link: "mailto:jjtjiadi02@gmail.com?subject=Agentic%20OS",
      image: "/projects/agentic-os-cover.jpg",
      imageAlt: "Agentic OS HUD with knowledge-graph globe and skill rankings",
      kind: "ai",
    },
    {
      index: "08",
      title: "Customer Churn Clustering & Classification",
      description:
        "A two-part telco churn study in R — K-means and hierarchical clustering to find the segments, then logistic regression, decision trees, and random forests to predict who leaves.",
      tags: ["R", "Clustering", "Classification"],
      link: "https://github.com/Jason-Joseph/Projects/blob/main/Customer%20Churn%20Clustering%20and%20Classification.R",
      kind: "data",
    },
    {
      index: "09",
      title: "Vehicle Price Regression Analysis",
      description:
        "Car-price prediction in R — multiple linear regression, CART, and random forests with cost-complexity pruning, benchmarked head-to-head.",
      tags: ["R", "Regression", "Random Forest"],
      link: "https://github.com/Jason-Joseph/Projects/blob/main/Vehicle%20Price%20Regression%20Analysis.R",
      kind: "data",
    },
  ] satisfies ProjectItem[],

  contact: {
    email: "jjtjiadi02@gmail.com",
    phone: "+65 8351 0343",
    linkedin: "https://linkedin.com/in/jasontjiadi",
    github: "https://github.com/Jason-Joseph",
    location: "Singapore",
    availability:
      "Based in Singapore, always glad to talk data, ideas, and interesting problems.",
  } satisfies Contact,
};

export default content;
