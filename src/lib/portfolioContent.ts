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
  type: string;
  year: string;
  duration: string;
  src: string;
  alt: string;
}

export interface BookNote {
  title: string;
  note: string;
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

const marqueeBaseItems = [
  "SELECTED WORK",
  "★",
  "2024 — 2026",
  "CONFIDENTIAL",
  "OPEN-SOURCE",
  "RESEARCH",
];

export const navLinks: NavLink[] = [
  { href: "#about", label: "About" },
  { href: "#focus", label: "Focus" },
  { href: "#work", label: "Work" },
];

export const aboutLines = [
  "I look for the cracks",
  "<em>in quiet systems.</em>",
  "Then I write down",
  "what I learned.",
];

export const aboutStats: StatItem[] = [
  { value: "04", label: "Years adversary simulation" },
  { value: "37", label: "CVEs & disclosures shipped" },
  { value: "∞", label: "Cumulus clouds collected" },
];

export const focusItems: FocusItem[] = [
  {
    name: "Red Team",
    type: "Adversary emulation",
    year: "2025",
    duration: "17 – 25′",
    src: "/assets/chair.png",
    alt: "Empty chair, low light",
  },
  {
    name: "AI Security",
    type: "Prompt & agent research",
    year: "2025",
    duration: "12 – 18′",
    src: "/assets/flower.png",
    alt: "Single flower, close crop",
  },
  {
    name: "Field Notes",
    type: "Public writeups",
    year: "Ongoing",
    duration: "06 – 10′",
    src: "/assets/bird.png",
    alt: "Bird in flight",
  },
  {
    name: "Custom Tooling",
    type: "Implants & harnesses",
    year: "2024",
    duration: "14 – 22′",
    src: "/assets/flowerandbird.png",
    alt: "Flower with bird",
  },
  {
    name: "Threat Intel",
    type: "TTP tracking",
    year: "2024",
    duration: "09 – 15′",
    src: "/assets/moutainandbird.png",
    alt: "Mountain ridge with bird",
  },
  {
    name: "Cinema Off-hours",
    type: "16mm · slow shutter",
    year: "Ongoing",
    duration: "—",
    src: "/assets/moutainandocean.png",
    alt: "Mountain meeting the ocean at dawn",
  },
];

export const booksRead: BookNote[] = [
  {
    title: "The Art of Memory — Frances Yates",
    note: "Why method actors and red-teamers both keep palaces.",
  },
  {
    title: "Ways of Seeing — John Berger",
    note: "The frame is half the exploit.",
  },
  {
    title: "Thinking in Systems — Donella Meadows",
    note: "Find the leverage point. Push.",
  },
  {
    title: "The Cuckoo's Egg — Clifford Stoll",
    note: "The original blue-team logbook, still the best.",
  },
  {
    title: "In Praise of Shadows — Jun'ichirō Tanizaki",
    note: "Dim the room. Watch what surfaces.",
  },
  {
    title: "The Phoenix Project — Gene Kim",
    note: "Read it for the empathy, not the playbook.",
  },
];

export const marqueeItems = Array.from({ length: 4 }, () => marqueeBaseItems).flat();

export const workLines = ["Things I've taken apart,", "<em>on purpose.</em>"];

export const workItems: WorkItem[] = [
  {
    number: "001",
    title: "Shadow",
    titleItalic: "Operator",
    description:
      "Multi-stage red-team engagement against a regional fintech: phishing → AD → ESC1 → DA in 11 days.",
    meta: "2025 · CONFIDENTIAL",
  },
  {
    number: "002",
    title: "Glasshouse",
    description:
      "LLM agent harness exploit: indirect prompt injection via a vendor PDF, exfiltrating tool calls.",
    meta: "2025 · RESEARCH",
  },
  {
    number: "003",
    title: "Pale",
    titleItalic: "Cumulus",
    description:
      "Cloud privilege-escalation chain across IAM, SSM, and a misconfigured KMS grant. Five CVEs filed.",
    meta: "2024 · DISCLOSED",
  },
  {
    number: "004",
    title: "Quiet",
    titleItalic: "Hours",
    description:
      "Internal CTF and training program for a 600-person engineering org. Adversary simulation, by belt rank.",
    meta: "2024 · ONGOING",
  },
  {
    number: "005",
    title: "Field",
    titleItalic: "Notes",
    description:
      "Public writeups on jailbreak taxonomy and a small Python harness for RAG red-evals.",
    meta: "ONGOING · OPEN-SOURCE",
  },
];

export const contactLines = ["Let's talk about", "<em>what could break.</em>"];

export const contactLinks: ContactLink[] = [
  {
    href: "mailto:thanarak.work@gmail.com",
    label: "thanarak.work@gmail.com",
  },
  {
    href: "https://github.com/Thanarak-q",
    label: "github / Thanarak-q",
    external: true,
  },
];
