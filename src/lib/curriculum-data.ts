// CMU Computer Science Curriculum 2564 ("g64plus") — requirement data.
// Source: https://www.cs.science.cmu.ac.th/Curriculum/g64plus/doku.php
// Buckets are the degree "หมวด" every course counts toward.

export type Bucket =
  | "ge_req"
  | "ge_elec"
  | "core"
  | "major_req"
  | "capstone_coop"
  | "capstone_is"
  | "major_elec"
  | "minor"
  | "free"
  | "unknown";

export interface Course {
  code: string;
  th: string;
  en: string;
  cr: number;
  bucket: Bucket;
  level?: number; // 300 / 400 / 700 — only meaningful for major_elec
}

type Row = [code: string, th: string, en: string];

const list: Course[] = [];
const add = (bucket: Bucket, cr: number, rows: Row[], level?: number) =>
  rows.forEach(([code, th, en]) =>
    list.push({ code, th, en, cr, bucket, level }),
  );

// ── หมวดวิชาศึกษาทั่วไป — General Education (30) ───────────────────────────
// วิชาบังคับ (24)
add("ge_req", 3, [
  ["001101", "ภาษาอังกฤษพื้นฐาน 1", "Fundamental English 1"],
  ["001102", "ภาษาอังกฤษพื้นฐาน 2", "Fundamental English 2"],
  ["001201", "การอ่านเชิงวิเคราะห์และการเขียนอย่างมีประสิทธิผล", "Critical Reading and Effective Writing"],
  ["001225", "ภาษาอังกฤษในบริบทวิทยาศาสตร์และเทคโนโลยี", "English in Science and Technology Context"],
  ["204100", "เทคโนโลยีสารสนเทศและชีวิตสมัยใหม่", "Information Technology and Modern Life"],
  ["201190", "การคิดเชิงวิพากษ์ การแก้ปัญหาและการสื่อสารทางวิทยาศาสตร์", "Critical Thinking, Problem Solving and Science Communication"],
  ["140104", "การเป็นพลเมือง", "Citizenship"],
  ["201111", "โลกแห่งวิทยาศาสตร์", "The World of Science"],
]);
// วิชาเลือก GE (เลือก 6) — รายการที่เลือกได้ (ชื่อจริงจาก curriculum page)
// ต้องเลือกจาก 3 กลุ่มวิชา: มนุษยศาสตร์, สังคมศาสตร์, วิทยาศาสตร์
add("ge_elec", 3, [
  ["050100", "การใช้ภาษาไทย", "Usage of the Thai Language"],
  ["074100", "โภชนาการเพื่อการส่งเสริมสุขภาพ", "Nutrition for Promotion of Health"],
  ["701181", "การบัญชีสำหรับผู้ที่ไม่ใช่นักบัญชี", "Accounting for Non-Accountants"],
  ["702101", "การเงินในชีวิตประจำวัน", "Finance for Daily Life"],
  ["013110", "จิตวิทยากับชีวิตประจำวัน", "Psychology and Daily Life"],
  ["176100", "กฎหมายและโลกสมัยใหม่", "Law and Modern World"],
  ["201114", "วิทยาศาสตร์สิ่งแวดล้อมในโลกปัจจุบัน", "Environmental Science in Today's World"],
  ["703103", "การเป็นผู้ประกอบการและธุรกิจเบื้องต้น", "Introduction to Entrepreneurship and Business"],
  ["751100", "เศรษฐศาสตร์เบื้องต้น", "Introduction to Economics"],
  ["851103", "สุนทรียภาพแห่งชีวิต", "Aesthetics of Life"],
  ["801100", "การออกแบบและเทคโนโลยี", "Design and Technology"],
  ["951100", "ภาษาและวัฒนธรรม", "Language and Culture"],
]);

// ── วิชาแกน — Core (24) ────────────────────────────────────────────────────
add("core", 3, [
  ["202101", "ชีววิทยาพื้นฐาน 1", "Basic Biology 1"],
  ["203103", "เคมีทั่วไป 1", "General Chemistry 1"],
  ["204111", "การเขียนโปรแกรมเบื้องต้น", "Fundamentals of Programming"],
  ["206111", "แคลคูลัส 1", "Calculus 1"],
  ["206112", "แคลคูลัส 2", "Calculus 2"],
  ["206183", "โครงสร้างวิยุต", "Discrete Structure"],
  ["207187", "ฟิสิกส์ 1", "Physics 1"],
  ["208269", "สถิติสำหรับวิทยาการคอมพิวเตอร์", "Statistics for Computer Science"],
]);

// ── วิชาเอกบังคับ — Major Required (41) ─────────────────────────────────────
add("major_req", 3, [
  ["204114", "การเขียนโปรแกรมเชิงวัตถุเบื้องต้น", "Intro to Object-oriented Programming"],
  ["204203", "เทคโนโลยีด้านวิทยาการคอมพิวเตอร์", "Computer Science Technology"],
  ["204212", "การพัฒนาแอปพลิเคชันสมัยใหม่", "Modern Application Development"],
  ["204231", "การจัดระบบและสถาปัตยกรรมคอมพิวเตอร์", "Computer Organization and Architecture"],
  ["204232", "เครือข่ายคอมพิวเตอร์และเกณฑ์วิธี", "Computer Networks and Protocols"],
  ["204252", "โครงสร้างข้อมูลและการวิเคราะห์", "Data Structures and Analysis"],
  ["204271", "ปัญญาประดิษฐ์เบื้องต้น", "Introduction to Artificial Intelligence"],
  ["204315", "การจัดระเบียบของภาษาโปรแกรม", "Organization of Programming Languages"],
  ["204321", "ระบบฐานข้อมูล", "Database Systems"],
  ["204341", "ระบบปฏิบัติการ", "Operating Systems"],
  ["204361", "วิศวกรรมซอฟต์แวร์", "Software Engineering"],
  ["204451", "การออกแบบและการวิเคราะห์อัลกอริทึม", "Algorithm Design and Analysis"],
  ["204490", "การวิจัยทางวิทยาการคอมพิวเตอร์", "Research in Computer Science"],
]);
add("major_req", 1, [
  ["204306", "จริยธรรมสำหรับผู้ประกอบวิชาชีพคอมพิวเตอร์", "Ethics for Computer Professionals"],
  ["204390", "การฝึกงานคอมพิวเตอร์", "Computer Job Training"],
]);

// ── Capstone — แตกต่างตามแผน ────────────────────────────────────────────────
add("capstone_coop", 6, [["204496", "สหกิจศึกษา", "Cooperative Education"]]);
add("capstone_coop", 1, [["204497", "สัมมนาทางวิทยาการคอมพิวเตอร์", "Seminar in Computer Science"]]);
add("capstone_is", 1, [["204491", "การค้นคว้าอิสระ 1", "Independent Study 1"]]);
add("capstone_is", 2, [["204499", "การค้นคว้าอิสระ 2", "Independent Study 2"]]);

// ── วิชาเอกเลือก — Major Electives (eligible list) ──────────────────────────
const namedElec: Record<string, string> = {
  "204311": "Mobile App Development Frameworks",
  "204423": "Data Mining",
  "204432": "Computer Network Design and Management",
  "204442": "Compiler Construction",
  "204443": "Computer System Security",
  "204452": "Theory of Computation",
  "204456": "Machine Learning",
  "204471": "Artificial Intelligence",
  "204472": "Natural Language Processing",
  "204483": "Computer Vision",
};
const elec = (codes: string[], level: number, cr = 3) =>
  codes.forEach((code) =>
    list.push({
      code,
      th: "วิชาเอกเลือก",
      en: namedElec[code] ?? "Major Elective",
      cr,
      bucket: "major_elec",
      level,
    }),
  );

// Level 300
elec(
  ["204311","204312","204322","204325","204333","204335","204355","204362","204363","204364","204365","204371","204381","204382","204383","206324","206325","206336","206370"],
  300,
);
// Level 400
elec(
  ["204422","204423","204424","204425","204426","204432","204435","204441","204442","204443","204452","204453","204454","204456","204471","204472","204481","204482","204483","204494","204495","206428","206463","206476","206481"],
  400,
);
// Level 700 (Honors only)
elec(
  ["204712","204713","204715","204721","204725","204728","204732","204735","204736","204737","204789"],
  700,
);
elec(["204779"], 700, 2);

export const COURSES: Record<string, Course> = Object.fromEntries(
  list.map((c) => [c.code, c]),
);

// ── Prerequisite chains (standard CMU CS g64+) ────────────────────────────
// key: course code, value: list of course codes required before taking it
// Based on standard CS curriculum dependency chain
export const PREREQS: Record<string, string[]> = {
  // Year 1 → Year 2 dependencies
  "204114": ["204111"],                             // OOP ← Fundamentals of Programming
  "206112": ["206111"],                             // Calculus 2 ← Calculus 1
  
  // Year 2 → Year 3 dependencies  
  "204252": ["204114"],                             // Data Structures ← OOP
  "204232": ["204114"],                             // Networks ← OOP
  "204271": ["204114", "206183"],                   // Intro AI ← OOP + Discrete
  "204231": ["204111"],                             // Comp Org ← Fundamentals
  
  // Year 3 dependencies
  "204321": ["204252"],                             // Database ← Data Structures
  "204341": ["204231", "204252"],                   // OS ← Comp Org + Data Structures
  "204361": ["204252"],                             // SE ← Data Structures
  "204451": ["204252", "206183"],                   // Algorithm ← Data Structures + Discrete
  "204315": ["204252"],                             // Prog Languages ← Data Structures
  "204306": [],                                     // Ethics (no prereq — 1 credit)
  "204490": ["204361"],                             // Research ← SE
  "204390": ["204361"],                             // Training ← SE
  
  // Capstone
  "204491": ["204361"],                             // IS 1 ← SE
  "204499": ["204491"],                             // IS 2 ← IS 1
  "204496": ["204361"],                             // Co-op ← SE
  "204497": [],                                     // Seminar (no hard prereq)
};

// ── Recommended study plan (semester-by-semester for each plan) ───────────
// Year: [Semester 1 courses, Semester 2 courses]
export interface StudyPlanTerm {
  label: string;   // "1/2564"
  year: number;    // 1-4
  semester: number; // 1, 2, or 3
  courses: string[]; // course codes (****** for elective slots)
  totalCredits: number;
}

export const STUDY_PLANS: Record<PlanId, StudyPlanTerm[]> = {
  regular: [
    // Year 1
    { label: "1/ปี1", year: 1, semester: 1, courses: ["001101","140104","203103","204111","206111","206183"], totalCredits: 18 },
    { label: "2/ปี1", year: 1, semester: 2, courses: ["001102","202101","204100","204114","206112","207187"], totalCredits: 18 },
    // Year 2
    { label: "1/ปี2", year: 2, semester: 1, courses: ["001201","201190","204203","204231","204252","208269"], totalCredits: 18 },
    { label: "2/ปี2", year: 2, semester: 2, courses: ["001225","201111","204212","204232","204271","MINOR"], totalCredits: 18 },
    // Year 3
    { label: "1/ปี3", year: 3, semester: 1, courses: ["204321","204341","204361","204451","GE_ELEC","MINOR"], totalCredits: 18 },
    { label: "2/ปี3", year: 3, semester: 2, courses: ["204306","204315","204490","MAJOR_ELEC","MAJOR_ELEC","MINOR","FREE"], totalCredits: 19 },
    // Year 4
    { label: "1/ปี4", year: 4, semester: 1, courses: ["204390","204491","GE_ELEC","MAJOR_ELEC","MAJOR_ELEC","MINOR"], totalCredits: 14 },
    { label: "2/ปี4", year: 4, semester: 2, courses: ["204499","MAJOR_ELEC","MINOR","FREE"], totalCredits: 11 },
  ],
  coop: [
    // Year 1
    { label: "1/ปี1", year: 1, semester: 1, courses: ["001101","140104","203103","204111","206111","206183"], totalCredits: 18 },
    { label: "2/ปี1", year: 1, semester: 2, courses: ["001102","202101","204100","204114","206112","207187"], totalCredits: 18 },
    // Year 2
    { label: "1/ปี2", year: 2, semester: 1, courses: ["001201","201190","204203","204231","204252","208269"], totalCredits: 18 },
    { label: "2/ปี2", year: 2, semester: 2, courses: ["001225","201111","204212","204232","204271","MINOR"], totalCredits: 18 },
    // Year 3
    { label: "1/ปี3", year: 3, semester: 1, courses: ["204321","204341","204361","204451","GE_ELEC","MINOR"], totalCredits: 18 },
    { label: "2/ปี3", year: 3, semester: 2, courses: ["204306","204315","204490","MAJOR_ELEC","MINOR","MINOR","FREE"], totalCredits: 19 },
    // Year 4
    { label: "1/ปี4", year: 4, semester: 1, courses: ["204390","204496"], totalCredits: 7 },
    { label: "2/ปี4", year: 4, semester: 2, courses: ["204497","GE_ELEC","MAJOR_ELEC","MAJOR_ELEC","MAJOR_ELEC","MINOR","FREE"], totalCredits: 19 },
  ],
  honors: [
    // Year 1
    { label: "1/ปี1", year: 1, semester: 1, courses: ["001101","140104","203103","204111","206111","206183"], totalCredits: 18 },
    { label: "2/ปี1", year: 1, semester: 2, courses: ["001102","202101","204100","204114","206112","207187"], totalCredits: 18 },
    // Year 2
    { label: "1/ปี2", year: 2, semester: 1, courses: ["001201","201190","204203","204231","204252","208269"], totalCredits: 18 },
    { label: "2/ปี2", year: 2, semester: 2, courses: ["001225","201111","204212","204232","204271","MINOR"], totalCredits: 18 },
    // Year 3
    { label: "1/ปี3", year: 3, semester: 1, courses: ["204321","204341","204361","204451","GE_ELEC","MINOR"], totalCredits: 18 },
    { label: "2/ปี3", year: 3, semester: 2, courses: ["204306","204315","204490","MAJOR_ELEC","MAJOR_ELEC","MINOR","FREE"], totalCredits: 19 },
    // Year 4
    { label: "1/ปี4", year: 4, semester: 1, courses: ["204390","204491","GE_ELEC","MAJOR_ELEC","MAJOR_ELEC","MAJOR_ELEC_700","MAJOR_ELEC_700","MINOR"], totalCredits: 20 },
    { label: "2/ปี4", year: 4, semester: 2, courses: ["204499","MAJOR_ELEC","MAJOR_ELEC_700","MAJOR_ELEC_700","MINOR","FREE"], totalCredits: 17 },
  ],
};

// ── Plan definitions ────────────────────────────────────────────────────────
export interface PlanReq {
  id: PlanId;
  label: string;
  labelEn: string;
  total: number;
  ge_req: number;
  ge_elec: number;
  core: number;
  major_req: number;
  capstone: number;
  capstoneBucket: "capstone_coop" | "capstone_is";
  major_elec: number;
  minor: number;
  free: number;
  elec400min: number;
  elec700min?: number;
  minorRestricted?: boolean;
}

export type PlanId = "coop" | "regular" | "honors";

export const PLANS: Record<PlanId, PlanReq> = {
  coop: {
    id: "coop",
    label: "แผนสหกิจศึกษา",
    labelEn: "Cooperative Education",
    total: 135,
    ge_req: 24,
    ge_elec: 6,
    core: 24,
    major_req: 41,
    capstone: 7,
    capstoneBucket: "capstone_coop",
    major_elec: 12,
    minor: 15,
    free: 6,
    elec400min: 6,
  },
  regular: {
    id: "regular",
    label: "แผนปกติ",
    labelEn: "Regular",
    total: 134,
    ge_req: 24,
    ge_elec: 6,
    core: 24,
    major_req: 41,
    capstone: 3,
    capstoneBucket: "capstone_is",
    major_elec: 15,
    minor: 15,
    free: 6,
    elec400min: 9,
  },
  honors: {
    id: "honors",
    label: "แผนก้าวหน้า",
    labelEn: "Honors / Advanced",
    total: 146,
    ge_req: 24,
    ge_elec: 6,
    core: 24,
    major_req: 41,
    capstone: 3,
    capstoneBucket: "capstone_is",
    major_elec: 27,
    minor: 15,
    free: 6,
    elec400min: 9,
    elec700min: 12,
    minorRestricted: true,
  },
};
