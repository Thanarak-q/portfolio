export interface NavLink {
  href: string;
  label: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface FocusArticle {
  title: string;
  href: string;
  date?: string;
}

export interface FocusItem {
  name: string;
  src: string;
  alt: string;
  tags?: string[];
  // Label for write-ups without an article yet; defaults to "In progress".
  status?: string;
  article?: FocusArticle;
}

export interface BookNote {
  title: string;
  shortTitle: string;
  subtitle: string;
  author?: string;
  status: "read" | "reading";
  tag: string;
  note: string;
  palette: "ink" | "leak" | "cream" | "soft" | "rose";
  spineWidth: "sm" | "md" | "lg";
}

export interface UiWorkShot {
  src: string;
  alt: string;
}

export interface UiWork {
  number: string;
  title: string;
  kind: string;
  description: string;
  tags: string[];
  shot: UiWorkShot;
  /** Other pages of the same project, shown as a grid under the main shot. */
  pages: (UiWorkShot & { label: string })[];
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
  { href: "#focus", label: "Writing" },
  { href: "#work", label: "Work" },
];

export const aboutLines: string[] = [];

export const aboutStats: StatItem[] = [];

export const focusItems: FocusItem[] = [
  {
    name: "API Keys",
    src: "/assets/chair-card.webp",
    alt: "Empty chair, low light",
    tags: ["System design", "Threat modeling"],
    article: {
      title:
        "[WRITE-UP] การออกแบบ API Key Feature ด้วย System Design และ Threat Modeling",
      href: "https://www.linkedin.com/pulse/write-up-%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%AD%E0%B8%AD%E0%B8%81%E0%B9%81%E0%B8%9A%E0%B8%9A-api-key-feature-%E0%B8%94%E0%B8%A7%E0%B8%A2-system-design-%E0%B9%81%E0%B8%A5%E0%B8%B0-kanyaprasit-5folc",
      date: "Sep 2026",
    },
  },
  {
    name: "Built with AI",
    src: "/assets/flower-card.webp",
    alt: "Single flower, close crop",
    tags: ["AI", "Build log"],
    article: {
      title: "How I Used AI to Build My Portfolio",
      href: "https://www.linkedin.com/pulse/how-i-used-ai-build-my-portfolio-thanarak-kanyaprasit-zf9ac",
    },
  },
  {
    name: "AI Red Team",
    status: "Writing",
    src: "/assets/moutainandbird-card.webp",
    alt: "Mountain ridge with bird",
  },
  {
    name: "Field Notes",
    src: "/assets/bird-card.webp",
    alt: "Bird in flight",
  },
  {
    name: "Custom Tooling",
    src: "/assets/flowerandbird-card.webp",
    alt: "Flower with bird",
  },
];

export const booksRead: BookNote[] = [
  {
    title: "Bug Bounty Bootcamp by Vickie Li",
    shortTitle: "Bug Bounty Bootcamp",
    subtitle: "The Guide to Finding and Reporting Web Vulnerabilities",
    author: "Vickie Li",
    status: "read",
    tag: "Web hacking · methodology",
    note: "A clear starting point for web penetration testing, with a structured path through the core techniques.",
    palette: "leak",
    spineWidth: "md",
  },
  {
    title: "The Web Application Hacker's Handbook 2ed",
    shortTitle: "WAHH",
    subtitle: "Finding and Exploiting Security Flaws",
    author: "Dafydd Stuttard & Marcus Pinto",
    status: "read",
    tag: "Web hacking · canonical",
    note: "Where you go for the technique. Detailed, slow, methodical — the kind of book you keep open next to a target and read alongside the actual work.",
    palette: "cream",
    spineWidth: "lg",
  },
  {
    title: "Web Hacking 101 by Peter Yaworski",
    shortTitle: "Web Hacking 101",
    subtitle: "Real-world bug reports, dissected",
    author: "Peter Yaworski",
    status: "read",
    tag: "Case studies · bug bounty",
    note: "Reading other people's disclosed reports beats any course. You start seeing the same patterns — IDOR, SSRF, race conditions — show up in your own targets within a week.",
    palette: "soft",
    spineWidth: "sm",
  },
  {
    title: "AI Red Teaming",
    shortTitle: "AI Red Teaming",
    subtitle: "Data, training, output — the full kill chain",
    status: "reading",
    tag: "AI security · in progress",
    note: "Still reading. It frames prompt injection as one part of a wider attack surface across data, training, and agent workflows.",
    palette: "rose",
    spineWidth: "md",
  },
  {
    title: "Practical AI Security by Harriet Farlow",
    shortTitle: "Practical AI Security",
    subtitle: "A Hands-on Guide to Attacking, Defending, and Securing Modern AI Systems",
    author: "Harriet Farlow",
    status: "reading",
    tag: "AI security · hands-on",
    note: "Currently reading. A hands-on companion to AI red teaming — working through how modern AI systems are attacked, and how to defend and secure them in practice.",
    palette: "ink",
    spineWidth: "md",
  },
  {
    title: "Threat Modeling: Designing for Security by Adam Shostack",
    shortTitle: "Threat Modeling",
    subtitle: "Designing for Security",
    author: "Adam Shostack",
    status: "read",
    tag: "Secure design · methodology",
    note: "This book teaches threat modeling as a step-by-step process, including how to get started, which methods and techniques to use, how to document and report the findings, and how to discuss security concerns with development teams so everyone shares the same understanding and can use the results to build a more secure system.",
    palette: "leak",
    spineWidth: "lg",
  },
  {
    title: "The Hacker Playbook 3: Practical Guide to Penetration Testing",
    shortTitle: "Hacker Playbook 3",
    subtitle: "Practical Guide to Penetration Testing",
    author: "Peter Kim",
    status: "read",
    tag: "Red team · field manual",
    note: "Clarifies the distinction between penetration testing and red teaming: a pentest finds vulnerabilities within scope, while a red-team exercise pursues an objective and tests detection and response.",
    palette: "ink",
    spineWidth: "lg",
  },
];

export const workLines = ["Experience across", "<em>building and securing software.</em>"];

export const uiWorkIntro =
  "Projects I designed and built end to end, from the first screen to the last page. Building the whole interface is how I learn where an application's trust boundaries really sit.";

export const uiWorks: UiWork[] = [
  {
    number: "01",
    title: "SmartMath",
    kind: "AI learning platform",
    description:
      "A Thai math-learning platform for CMU students. I designed it as a set of services with separate student and admin interfaces, authenticated API orchestration, streamed RAG tutoring through Kapi the AI helper, and durable background quiz generation. The whole UI is documented as a design system, with every route drawn as a screen.",
    tags: ["Product UI", "Design system", "AI / RAG"],
    shot: {
      src: "/assets/work-smartmath-landing.webp",
      alt: "SmartMath landing page with a live collage of the Kapi chat, a practice question and the league card",
    },
    pages: [
      { label: "Home", src: "/assets/work-sm-home.webp", alt: "SmartMath home with the continue card, MathPro scores and weekly quests" },
      { label: "Lesson + AI chat", src: "/assets/work-sm-chat.webp", alt: "A lesson with the Kapi chat open beside it, showing math answers and a source citation" },
      { label: "Practice", src: "/assets/work-sm-practice.webp", alt: "A practice question with an area model, answer choices and a hint" },
      { label: "Lessons", src: "/assets/work-sm-lessons.webp", alt: "The lessons page with colour-coded module cards and progress" },
      { label: "League", src: "/assets/work-sm-league.webp", alt: "The weekly league leaderboard with promotion and demotion zones" },
      { label: "Points shop", src: "/assets/work-sm-shop.webp", alt: "The points shop with profile frames, backdrops and a live preview" },
      { label: "Profile", src: "/assets/work-sm-profile.webp", alt: "A learner profile with stats, weekly study time and mastery per course" },
      { label: "Hall of Fame", src: "/assets/work-sm-hall.webp", alt: "The Hall of Fame word wall with a composer for new words" },
    ],
  },
  {
    number: "02",
    title: "ALLCATFISH",
    kind: "Fashion e-commerce store",
    description:
      "An online store for the Allenaissance collection. A pinned cinematic hero floats Renaissance props around the model in 3D, then hands off to the shop, product pages with size selection, a bag, a journal and the brand story.",
    tags: ["E-commerce", "Scroll motion", "3D parallax"],
    shot: {
      src: "/assets/work-allcatfish.webp",
      alt: "ALLCATFISH hero: a model standing in a pearl shell surrounded by floating props over the sea",
    },
    pages: [
      { label: "Shop", src: "/assets/work-ac-shop.webp", alt: "The shop grid with category filters and sorting" },
      { label: "Product", src: "/assets/work-ac-product.webp", alt: "A product page with a photo gallery, sizes and add to bag" },
      { label: "Bag", src: "/assets/work-ac-bag.webp", alt: "The shopping bag with quantity controls and an order summary" },
      { label: "Journal", src: "/assets/work-ac-journal.webp", alt: "The journal with a featured story" },
      { label: "About", src: "/assets/work-ac-about.webp", alt: "The brand story page over a coastal ruins banner" },
    ],
  },
  {
    number: "03",
    title: "Nimbus",
    kind: "Self-learning platform",
    description:
      "A learning platform where a small 3D island is the course map: every building is a lesson with a short quiz inside, and the island fills up as you learn. Twelve painted skies are generated and animated live on canvas.",
    tags: ["3D world", "Canvas", "Learning"],
    shot: {
      src: "/assets/work-nimbus.webp",
      alt: "Nimbus landing page titled Learn at your own pace, above a row of painted sky cards",
    },
    pages: [
      { label: "Island world", src: "/assets/work-nimbus-world.webp", alt: "The 3D island world where each building is a lesson" },
      { label: "Painted skies", src: "/assets/work-nimbus-skies.webp", alt: "The grid of animated painted skies to start from" },
    ],
  },
];

export const caseLines =["Systems I built,", "<em>and the decisions behind them.</em>"];

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

// URL-safe id for a book, used by the homepage shelf and /reading#<slug>.
export const bookSlug = (book: BookNote) =>
  book.shortTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
