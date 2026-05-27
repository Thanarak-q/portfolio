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
    title: "The Hacker Playbook 3: Practical Guide to Penetration Testing",
    shortTitle: "Hacker Playbook 3",
    subtitle: "Practical Guide to Penetration Testing",
    tag: "Red team · field manual",
    note: "Made the difference between pentest and red team click. Pentest hunts as many bugs as possible inside a scope; red team picks an objective and chains everything — phishing, evasion, lateral movement, persistence — and you're also testing whether the defenders ever notice. The goal isn't a bug list, it's the story of an attack.",
    palette: "ink",
    spineWidth: "lg",
  },
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
