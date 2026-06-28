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

export const navLinks: NavLink[] = [
  { href: "#about", label: "About" },
  { href: "#focus", label: "Focus" },
  { href: "#work", label: "Work" },
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
    note: "If you're new to pentest, start here. The clearest field guide I've come across — gives you a structured path instead of dropping you straight into the chaos.",
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
    note: "Still reading. Already changing how I think about prompt injection — it's just the visible end of a much bigger surface that runs through data, training, and the agent loop.",
    palette: "rose",
    spineWidth: "md",
  },
  {
    title: "The Hacker Playbook 3: Practical Guide to Penetration Testing",
    shortTitle: "Hacker Playbook 3",
    subtitle: "Practical Guide to Penetration Testing",
    tag: "Red team · field manual",
    note: "Made the difference between pentest and red team click. Pentest hunts as many bugs as possible inside a scope; red team picks an objective and chains everything — phishing, evasion, lateral movement, persistence — and you're also testing whether the defenders ever notice. The goal isn't a bug list, it's the story of an attack.",
    palette: "ink",
    spineWidth: "lg",
  },
];

export const workLines = ["Experience built through", "<em>real security work.</em>"];

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

export const contactLines = ["Open to", "<em>security work and collaboration.</em>"];

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
