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
  { href: "#cases", label: "Cases" },
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
      "Designed a microservices architecture for an AI-powered math learning platform — RAG question answering with hybrid retrieval, vector search, and reranking (LangChain, Pinecone, OpenAI), async AI workflows over RabbitMQ workers, and a full observability stack (PostgreSQL, Redis, MinIO, Docker Compose, Caddy, Prometheus, Grafana, Loki).",
    meta: "2025 · SmartMath",
  },
];

export const caseLines = ["Built and", "<em>reviewed.</em>"];

export const caseIntro =
  "Selected builds documented with their purpose, security decisions, and remaining risks.";

const villageCaseStudy: CaseStudy = {
    id: "village",
    number: "02",
    title: "Village Security Platform",
    role: "Scrum Master · Full-Stack Developer",
    context: "University course project · team delivery",
    year: "2025",
    stack: ["Next.js", "Bun · Elysia", "WebSocket", "RBAC"],
    summary:
      "A gated-community platform: admins approve residents and manage houses, guards log visitors in and out at the gate, and everyone gets real-time notifications. I ran the sprints and built the access-control core.",
    visual: "dashboard",
    frameLabel: "village-security.app/dashboard",
    stamp: "Security reviewed",
    pins: [
      {
        x: 76,
        y: 14,
        side: "left",
        chip: "APPROVAL",
        label: "No self-activated accounts",
        note: "New residents stay pending with no data access until an admin approves them; signing up alone does not grant access.",
        kind: "defense",
      },
      {
        x: 12,
        y: 38,
        side: "right",
        chip: "RBAC",
        label: "Role checks live server-side",
        note: "Admin, resident, and guard see different dashboards — but the UI is just a mirror. Every backend route re-checks the caller's role, so hiding a button never counts as security.",
        kind: "defense",
      },
      {
        x: 58,
        y: 62,
        side: "right",
        chip: "IDOR",
        label: "Records bound to the session",
        note: "House and visitor records are looked up through the caller's own identity, not a raw ID from the request — guessing another house number gets you a 403, not a neighbor's visitor log.",
        kind: "threat",
      },
      {
        x: 52,
        y: 82,
        side: "left",
        chip: "WS AUTH",
        label: "Sockets join by verified identity",
        note: "Real-time notifications are room-scoped to the authenticated user. A guard's gate events push to that village only — the socket layer trusts the session, never the client's claim.",
        kind: "threat",
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
    stack: ["LangChain · Pinecone", "RabbitMQ", "PostgreSQL · Redis", "Docker · Grafana"],
    summary:
      "A microservices platform where students ask math questions and a RAG pipeline answers using hybrid retrieval, vector search, reranking, async RabbitMQ workers, and observability tooling. I designed the architecture.",
    visual: "architecture",
    frameLabel: "smartmath · service topology",
    stamp: "Architecture reviewed",
    pins: [
      {
        x: 73.5,
        y: 32,
        side: "right",
        chip: "PROMPT INJ",
        label: "Retrieved text is data, not orders",
        note: "RAG means the model reads documents an attacker might influence. The pipeline treats corpus text as untrusted input — instructions live in the system prompt, never in what retrieval returns.",
        kind: "threat",
      },
      {
        x: 31,
        y: 42,
        side: "right",
        chip: "INGRESS",
        label: "One validated way in",
        note: "Everything enters through the reverse proxy and API gateway — input is validated once, at the boundary, before any question is allowed to travel deeper into the system.",
        kind: "defense",
      },
      {
        x: 52,
        y: 50,
        side: "right",
        chip: "QUEUE",
        label: "Workers behind a broker",
        note: "AI workers are not internet-facing; they only consume RabbitMQ jobs that have passed API validation. The queue also serves as a trust boundary.",
        kind: "defense",
      },
      {
        x: 90,
        y: 60,
        side: "left",
        chip: "BLAST R.",
        label: "Per-service credentials",
        note: "Each container gets only the secrets it needs, injected from environment config. A compromised worker can reach the vector index — it cannot read the user database.",
        kind: "threat",
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
