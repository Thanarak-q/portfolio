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
    name: "Red Team",
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

export const workLines = ["Experience built through", "<em>competition and labs.</em>"];

export const workItems: WorkItem[] = [
  {
    number: "001",
    title: "Certified in",
    titleItalic: "Cybersecurity",
    description:
      "Earned the CC certification, covering core security concepts across security operations, network defense, access control, and risk awareness.",
    meta: "CERTIFIED · CC",
  },
  {
    number: "002",
    title: "NCSA Thailand",
    titleItalic: "Cyber Top Talent 2025",
    description:
      "Competed in NCSA Thailand Cyber Top Talent 2025, building hands-on problem solving through timed cybersecurity challenges and team-based pressure.",
    meta: "2025 · COMPETITION",
  },
  {
    number: "003",
    title: "NCSA",
    titleItalic: "Boot Camp",
    description:
      "Completed intensive training focused on security fundamentals, offensive thinking, and disciplined hands-on practice across technical exercises.",
    meta: "BOOTCAMP · TRAINING",
  },
  {
    number: "004",
    title: "CTFTime",
    titleItalic: "Competitions",
    description:
      "Regularly compete in CTF events to strengthen web exploitation, enumeration, scripting, and structured attack-chain thinking under time pressure.",
    meta: "ONGOING · CTF",
  },
  {
    number: "005",
    title: "Hack The Box,",
    titleItalic: "TryHackMe, picoCTF, PortSwigger",
    description:
      "Use labs and practice platforms to sharpen web security fundamentals, exploitation workflow, and a repeatable testing methodology.",
    meta: "LABS · HANDS-ON",
  },
];

export const contactLines = ["Open to", "<em>security work and collaboration.</em>"];

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
