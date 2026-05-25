export interface NavLink {
  href: string;
  label: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface FocusItem {
  number: string;
  title: string;
  titleItalic: string;
  description: string;
  tags: string[];
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
    number: "02 / 01",
    title: "Red Team",
    titleItalic: "Operations",
    description:
      "Adversary emulation, assumed breach, internal pivots, and physical/social blends. Build playbooks that survive contact with reality.",
    tags: ["MITRE ATT&CK", "C2", "AD", "Phishing", "EDR Bypass"],
  },
  {
    number: "02 / 02",
    title: "AI",
    titleItalic: "Security",
    description:
      "Prompt injection, indirect injection, agent tool abuse, model supply chain, jailbreak research, eval harnesses for safety regressions.",
    tags: ["LLM Pentest", "RAG", "Guardrails", "MCP", "Red Eval"],
  },
  {
    number: "02 / 03",
    title: "Cloud &",
    titleItalic: "App",
    description:
      "Web app pentest, cloud config audits, identity attack paths, container escape. The boring layer between the model and the metal.",
    tags: ["AWS", "K8s", "OWASP", "IAM", "Burp"],
  },
  {
    number: "02 / 04",
    title: "Field",
    titleItalic: "Notes",
    description:
      "Public writeups, open-source harnesses, a small Substack on jailbreak taxonomy. The part of the work that doesn't sit in a vault.",
    tags: ["Writeups", "OSS", "Talks", "Workshops"],
  },
  {
    number: "02 / 05",
    title: "Threat",
    titleItalic: "Intel",
    description:
      "Tracking actor TTPs, mapping infrastructure, and turning raw telemetry into something a defender can actually act on at 3 a.m.",
    tags: ["TTPs", "STIX", "OSINT", "Pivoting", "YARA"],
  },
  {
    number: "02 / 06",
    title: "Custom",
    titleItalic: "Tooling",
    description:
      "Implants, loaders, eval harnesses, and tiny CLIs that I rewrite every other year. Built so the next engagement starts at the deep end.",
    tags: ["Rust", "Go", "Implants", "C2 Profiles", "Tradecraft"],
  },
  {
    number: "02 / 07",
    title: "Purple",
    titleItalic: "Bridge",
    description:
      "The handoff between offense and detection — replayable scenarios, ATT&CK coverage maps, and the boring meetings that ship signal.",
    tags: ["Detection", "Replay", "Coverage", "SIEM", "Sigma"],
  },
  {
    number: "02 / 08",
    title: "Cinema",
    titleItalic: "Off-hours",
    description:
      "16mm, slow shutter, lake at dawn. The hour I let go of the keyboard so the next exploit has somewhere to land.",
    tags: ["Film", "Process", "Slow", "Quiet", "Frame"],
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
  { href: "mailto:hello@thanarak.dev", label: "hello@thanarak.dev" },
  {
    href: "https://github.com/thanarak",
    label: "github / thanarak",
    external: true,
  },
  {
    href: "https://www.linkedin.com/in/thanarak",
    label: "linkedin / thanarak",
    external: true,
  },
  {
    href: "mailto:hello@thanarak.dev?subject=Signal%20request",
    label: "signal / on request",
  },
];
