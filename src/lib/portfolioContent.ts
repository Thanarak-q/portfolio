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

export const navLinks: NavLink[] = [
  { href: "#about", label: "About" },
  { href: "#focus", label: "Focus" },
  { href: "#work", label: "Work" },
];

export const aboutLines = [
  "I break systems",
  "<em>before they break you.</em>",
  "Then I turn the findings",
  "into clearer defenses.",
];

export const aboutStats: StatItem[] = [
  { value: "04", label: "Years in adversary simulation" },
  { value: "37", label: "CVEs and disclosures" },
  { value: "AI", label: "Agent and LLM security focus" },
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
    type: "Writeups & research notes",
    year: "Ongoing",
    duration: "06 – 10′",
    src: "/assets/bird.png",
    alt: "Bird in flight",
  },
  {
    name: "Custom Tooling",
    type: "Harnesses & internal tools",
    year: "2024",
    duration: "14 – 22′",
    src: "/assets/flowerandbird.png",
    alt: "Flower with bird",
  },
  {
    name: "Threat Intel",
    type: "TTP mapping",
    year: "2024",
    duration: "09 – 15′",
    src: "/assets/moutainandbird.png",
    alt: "Mountain ridge with bird",
  },
  {
    name: "Visual Archive",
    type: "Photography & field memory",
    year: "Ongoing",
    duration: "—",
    src: "/assets/moutainandocean.png",
    alt: "Mountain meeting the ocean at dawn",
  },
];

export const booksRead: BookNote[] = [
  {
    title: "The Art of Memory — Frances Yates",
    note: "Memory is infrastructure. I use it to connect signals.",
  },
  {
    title: "Ways of Seeing — John Berger",
    note: "The frame changes what you notice, and what you miss.",
  },
  {
    title: "Thinking in Systems — Donella Meadows",
    note: "Good security work starts with the system, not the symptom.",
  },
  {
    title: "The Cuckoo's Egg — Clifford Stoll",
    note: "A reminder that patient notes still beat noisy dashboards.",
  },
  {
    title: "In Praise of Shadows — Jun'ichirō Tanizaki",
    note: "Some details only show up when the room gets quieter.",
  },
  {
    title: "The Phoenix Project — Gene Kim",
    note: "Security work lands better when it respects how teams ship.",
  },
];

export const workLines = ["Selected work from", "<em>offensive security.</em>"];

export const workItems: WorkItem[] = [
  {
    number: "001",
    title: "Shadow",
    titleItalic: "Operator",
    description:
      "Multi-stage red-team engagement for a regional fintech, moving from phishing to AD privilege escalation and domain admin.",
    meta: "2025 · CONFIDENTIAL",
  },
  {
    number: "002",
    title: "Glasshouse",
    description:
      "LLM agent harness research showing how a vendor PDF could trigger indirect prompt injection and expose tool-call data.",
    meta: "2025 · RESEARCH",
  },
  {
    number: "003",
    title: "Pale",
    titleItalic: "Cumulus",
    description:
      "Cloud privilege-escalation chain across IAM, SSM, and a misconfigured KMS grant, with coordinated disclosures filed.",
    meta: "2024 · DISCLOSED",
  },
  {
    number: "004",
    title: "Quiet",
    titleItalic: "Hours",
    description:
      "Internal CTF and adversary-simulation training program for a 600-person engineering organization.",
    meta: "2024 · ONGOING",
  },
  {
    number: "005",
    title: "Field",
    titleItalic: "Notes",
    description:
      "Public writeups on jailbreak taxonomy, RAG red-team evaluation, and small Python security tooling.",
    meta: "ONGOING · OPEN-SOURCE",
  },
];

export const contactLines = ["Bring me in before", "<em>the real attack.</em>"];

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
