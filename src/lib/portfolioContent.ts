export interface NavLink {
  href: string;
  label: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface FocusItem {
  name: string;
  src: string;
  alt: string;
}

export interface BookNote {
  title: string;
  shortTitle: string;
  subtitle: string;
  tag: string;
  note: string;
  palette: "ink" | "leak" | "cream" | "soft" | "rose";
  spineWidth: "sm" | "md" | "lg";
}

export interface WorkItem {
  number: string;
  title: string;
  titleItalic?: string;
  description: string;
  meta: string;
}

export interface ContactLink {
  href: string;
  label: string;
  external?: boolean;
}

export interface CasePin {
  /** Position over the frame, in percent of frame width/height. */
  x: number;
  y: number;
  /** Which side of the dot the short chip label sits on. */
  side: "left" | "right";
  /** Short mono chip shown next to the pin inside the frame. */
  chip: string;
  /** Margin-note heading. */
  label: string;
  /** Plain-language lens for a project decision. */
  category: string;
  /** Margin-note body — the actual security thinking. */
  note: string;
  kind: "threat" | "defense";
}

export interface CaseStudy {
  id: string;
  number: string;
  title: string;
  role: string;
  context: string;
  year: string;
  stack: string[];
  summary: string;
  mobileSummary: string;
  /** Which built-in wireframe visual to render inside the frame. */
  visual: "dashboard" | "architecture";
  /** Mono text in the frame's chrome bar. */
  frameLabel: string;
  /** Verdict stamp text at the end of the scan. */
  stamp: string;
  pins: CasePin[];
}

export const navLinks: NavLink[] = [
  { href: "#about", label: "About" },
  { href: "#focus", label: "Focus" },
  { href: "#work", label: "Work" },
  { href: "#cases", label: "Projects" },
];

export const aboutLines: string[] = [];

export const aboutStats: StatItem[] = [];

export const focusItems: FocusItem[] = [
  {
    name: "Web Pentest",
    src: "/assets/chair.png",
    alt: "Empty chair, low light",
  },
  {
    name: "AI Security",
    src: "/assets/flower.png",
    alt: "Single flower, close crop",
  },
  {
    name: "Threat Intel",
    src: "/assets/moutainandbird.png",
    alt: "Mountain ridge with bird",
  },
  {
    name: "Field Notes",
    src: "/assets/bird.png",
    alt: "Bird in flight",
  },
  {
    name: "Custom Tooling",
    src: "/assets/flowerandbird.png",
    alt: "Flower with bird",
  },
];

export const booksRead: BookNote[] = [
  {
    title: "Bug Bounty Bootcamp by Vickie Li",
    shortTitle: "Bug Bounty Bootcamp",
    subtitle: "The Guide to Finding and Reporting Web Vulnerabilities",
    tag: "Web hacking · methodology",
    note: "A clear starting point for web penetration testing, with a structured path through the core techniques.",
    palette: "leak",
    spineWidth: "md",
  },
  {
    title: "The Web Application Hacker's Handbook 2ed",
    shortTitle: "WAHH",
    subtitle: "Finding and Exploiting Security Flaws",
    tag: "Web hacking · canonical",
    note: "Where you go for the technique. Detailed, slow, methodical — the kind of book you keep open next to a target and read alongside the actual work.",
    palette: "cream",
    spineWidth: "lg",
  },
  {
    title: "Web Hacking 101 by Peter Yaworski",
    shortTitle: "Web Hacking 101",
    subtitle: "Real-world bug reports, dissected",
    tag: "Case studies · bug bounty",
    note: "Reading other people's disclosed reports beats any course. You start seeing the same patterns — IDOR, SSRF, race conditions — show up in your own targets within a week.",
    palette: "soft",
    spineWidth: "sm",
  },
  {
    title: "AI Red Teaming",
    shortTitle: "AI Red Teaming",
    subtitle: "Data, training, output — the full kill chain",
    tag: "AI security · in progress",
    note: "Still reading. It frames prompt injection as one part of a wider attack surface across data, training, and agent workflows.",
    palette: "rose",
    spineWidth: "md",
  },
  {
    title: "The Hacker Playbook 3: Practical Guide to Penetration Testing",
    shortTitle: "Hacker Playbook 3",
    subtitle: "Practical Guide to Penetration Testing",
    tag: "Red team · field manual",
    note: "Clarifies the distinction between penetration testing and red teaming: a pentest finds vulnerabilities within scope, while a red-team exercise pursues an objective and tests detection and response.",
    palette: "ink",
    spineWidth: "lg",
  },
];

export const workLines = ["Experience across", "<em>building and securing software.</em>"];

export const workItems: WorkItem[] = [
  {
    number: "001",
    title: "Cyber Security Engineer",
    titleItalic: "ITSC, Chiang Mai University",
    description:
      "Cooperative education at the IT Service Center: conduct web application penetration testing, build threat-intelligence software for security monitoring and analysis, and report vulnerabilities while supporting remediation with the security team.",
    meta: "2026 · ITSC / CMU",
  },
  {
    number: "002",
    title: "AI Engineer & System Architect",
    titleItalic: "SmartMath",
    description:
      "Designed a service-oriented AI learning platform with separate student and admin interfaces, authenticated API orchestration, streamed RAG tutoring, durable background quiz generation, and purpose-specific data stores.",
    meta: "2025 · SmartMath",
  },
];

export const caseLines = ["Systems I built,", "<em>and the decisions behind them.</em>"];

export const caseIntro =
  "Selected systems, explained through what I built and the technical decisions behind it.";

const villageCaseStudy: CaseStudy = {
    id: "village",
    number: "02",
    title: "Village Security Platform",
    role: "Scrum Master · Full-Stack Developer",
    context: "University course project · team delivery",
    year: "2025",
    stack: ["Next.js", "Bun · Elysia", "WebSocket", "RBAC"],
    summary:
      "Scrum Master on a team project for community operations. I planned sprints, coordinated delivery across the frontend, backend, and real-time notifications, and contributed to visitor and guard workflows.",
    mobileSummary: "Ran sprints and helped ship visitor, guard, and real-time notification flows.",
    visual: "dashboard",
    frameLabel: "village-security.app/dashboard",
    stamp: "Team delivery",
    pins: [
      {
        x: 76,
        y: 14,
        side: "left",
        chip: "SPRINTS",
        label: "Planned the delivery cadence",
        category: "Scrum Master",
        note: "Turned the course scope into smaller deliverable slices and kept the team focused on the next working increment.",
        kind: "defense",
      },
      {
        x: 12,
        y: 38,
        side: "right",
        chip: "BACKLOG",
        label: "Kept priorities visible",
        category: "product delivery",
        note: "Aligned work around resident approval, visitor check-in and check-out, and guard workflows for the first usable release.",
        kind: "defense",
      },
      {
        x: 58,
        y: 62,
        side: "right",
        chip: "HANDOFFS",
        label: "Coordinated cross-team handoffs",
        category: "team facilitation",
        note: "Connected frontend, backend, and real-time notification work so dependent features could be tested together.",
        kind: "defense",
      },
      {
        x: 52,
        y: 82,
        side: "left",
        chip: "DELIVERY",
        label: "Contributed to core flows",
        category: "implementation",
        note: "Built and refined visitor-facing screens and supported the notification and dashboard integration work.",
        kind: "defense",
      },
    ],
};

const smartMathCaseStudy: CaseStudy = {
    id: "smartmath",
    number: "01",
    title: "SmartMath",
    role: "AI Engineer · System Architect",
    context: "AI-powered math learning platform",
    year: "2025",
    stack: ["Web Apps · API", "Streamed RAG", "Durable Jobs", "Private Storage"],
    summary:
      "Built core learning flows for an AI-powered math platform: streamed RAG chat, document ingestion and indexing, and background quiz generation. I designed the API boundaries and data flow between the web apps, backend, and AI services.",
    mobileSummary: "Built RAG chat, ingestion, and async quiz generation.",
    visual: "architecture",
    frameLabel: "simplified system flow",
    stamp: "System design",
    pins: [
      {
        x: 89,
        y: 29,
        side: "left",
        chip: "RAG INPUT",
        label: "Built the retrieval path",
        category: "RAG design",
        note: "Implemented hybrid retrieval and reranking so chat and quiz generation use relevant course material.",
        kind: "threat",
      },
      {
        x: 45,
        y: 49,
        side: "right",
        chip: "AUTH PROXY",
        label: "Designed the API boundary",
        category: "access design",
        note: "Added session-aware access controls between the web apps, backend, and internal AI services.",
        kind: "defense",
      },
      {
        x: 75,
        y: 84,
        side: "right",
        chip: "DURABLE JOB",
        label: "Built durable quiz jobs",
        category: "async workflow",
        note: "Moved long-running quiz generation into an outbox-backed queue with worker processing and status updates.",
        kind: "defense",
      },
      {
        x: 34,
        y: 92,
        side: "right",
        chip: "UPLOAD",
        label: "Built the ingestion pipeline",
        category: "input boundary",
        note: "Added authenticated uploads, file validation, document processing, and retrieval indexing.",
        kind: "defense",
      },
    ],
};

export const caseStudies: CaseStudy[] = [smartMathCaseStudy, villageCaseStudy];

export const contactLines = ["Open to", "<em>product security work.</em>"];

export const contactLinks: ContactLink[] = [
  {
    href: "mailto:thanarak_ka@cmu.ac.th",
    label: "thanarak_ka@cmu.ac.th",
  },
  {
    href: "https://www.linkedin.com/in/thanarak-kanyaprasit-b2b02a306",
    label: "linkedin / thanarak-kanyaprasit",
    external: true,
  },
  {
    href: "https://github.com/Thanarak-q",
    label: "github / Thanarak-q",
    external: true,
  },
];
