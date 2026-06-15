// Transcript parsing + graduation-audit logic for the CMU CS g64plus tool.
import { COURSES, PLANS, PREREQS, STUDY_PLANS } from "./curriculum-data";
import type { Bucket, Course, PlanId, PlanReq } from "./curriculum-data";

export type Status = "passed" | "failed" | "inprogress" | "withdrawn";

export interface ParsedCourse {
  code: string;
  cr: number;
  grade: string;
  status: Status;
  term: string;
  course?: Course; // matched curriculum entry, if known
  bucketOverride?: Bucket; // manual override of course category/tag
  isPredicted?: boolean; // whether this course was manually added as a plan/prediction
  customName?: string; // custom name if the course code is not in COURSES
}

// Grade → grade-point. S/P pass without points; F=0.
const GRADE_POINTS: Record<string, number> = {
  A: 4, "B+": 3.5, B: 3, "C+": 2.5, C: 2, "D+": 1.5, D: 1, F: 0,
};
const PASS_NO_POINT = new Set(["S", "P", "V", "CS"]); // satisfactory / pass / audit-pass
const KNOWN_GRADES = new Set([
  ...Object.keys(GRADE_POINTS),
  ...PASS_NO_POINT,
  "U", "W", "I", "IP", "P", "T",
]);

const CODE_RE = /\b(\d{6})\b/;
const TERM_RE = /([1-3])\s*[\/]\s*(25\d{2}|20\d{2})/; // 1/2564 or 1/2021
const TERM_WORD_RE = /(ภาคการศึกษา|ภาคเรียน|semester|summer|ฤดูร้อน)/i;

function gradeStatus(grade: string, hasGrade: boolean): Status {
  if (!hasGrade) return "inprogress";
  if (grade === "W") return "withdrawn";
  if (grade === "F" || grade === "U") return "failed";
  if (grade === "I" || grade === "IP" || grade === "T") return "inprogress";
  return "passed";
}

// Pull a credit value out of a course line when the curriculum doesn't know it.
function parseCredits(line: string, code: string): number {
  const after = line.slice(line.indexOf(code) + 6);
  // "3", "3.0", "(3)", "3(3-0-6)" style — take the first standalone 1-digit 1..7
  const m = after.match(/(?<![\d.])([1-7])(?:\.0)?\b/);
  return m ? Number(m[1]) : 3;
}

function findGrade(line: string): { grade: string; hasGrade: boolean } {
  // Scan tokens; the grade is a standalone token from the known set.
  const tokens = line.toUpperCase().split(/[\s|,]+/).filter(Boolean);
  for (let i = tokens.length - 1; i >= 0; i--) {
    const t = tokens[i].replace(/[()]/g, "");
    if (KNOWN_GRADES.has(t)) return { grade: t, hasGrade: true };
  }
  return { grade: "", hasGrade: false };
}

export function parseTranscript(raw: string): ParsedCourse[] {
  const lines = raw.split(/\r?\n/);
  const out: ParsedCourse[] = [];
  let term = "ไม่ระบุเทอม";
  const seen = new Set<string>();

  for (const line of lines) {
    const tMatch = line.match(TERM_RE);
    if (tMatch) {
      term = `${tMatch[1]}/${tMatch[2]}`;
      // a term header line rarely also holds a course; keep scanning anyway
    } else if (TERM_WORD_RE.test(line) && !CODE_RE.test(line)) {
      term = line.trim();
      continue;
    }

    const cMatch = line.match(CODE_RE);
    if (!cMatch) continue;
    const code = cMatch[1];

    const known = COURSES[code];
    const cr = known ? known.cr : parseCredits(line, code);
    const { grade, hasGrade } = findGrade(line);
    const status = gradeStatus(grade, hasGrade);

    // de-dup: keep the best attempt (passed beats failed/withdrawn)
    const key = code;
    const prevIdx = out.findIndex((c) => c.code === key);
    const rec: ParsedCourse = { code, cr, grade, status, term, course: known };
    if (prevIdx >= 0) {
      const prev = out[prevIdx];
      if (prev.status !== "passed" && status === "passed") out[prevIdx] = rec;
      continue;
    }
    seen.add(key);
    out.push(rec);
  }
  return out;
}

// ── Audit ───────────────────────────────────────────────────────────────────
export type Confidence = "high" | "medium" | "low";

export interface PrereqWarning {
  code: string;
  name: string;
  missingCodes: string[];
  missingNames: string[];
}

export interface StudyPlanComparison {
  year: number;
  expectedInPlan: string[];     // course codes expected by recommended plan
  completed: string[];           // codes completed by student
  behind: string[];              // expected but not yet taken
  ahead: string[];               // taken but ahead of schedule
  status: "on_track" | "behind" | "ahead";
}

export interface BucketResult {
  key: Bucket | "minor" | "free";
  label: string;
  earned: number;
  required: number;
  doneCourses: ParsedCourse[];
  missingCourses: Course[]; // only for fixed buckets
  inProgress: ParsedCourse[];
  note?: string;
  confidence: Confidence;
  confidenceNote?: string;
  validationWarnings: string[];
}

export interface AuditResult {
  plan: PlanReq;
  hasMinor: boolean;
  totalEarned: number;
  totalRequired: number;
  totalInProgress: number;
  gpa: number | null;
  gpaCredits: number;
  buckets: BucketResult[];
  unmatched: ParsedCourse[]; // codes not in curriculum (minor / free / unknown)
  remainingCredits: number;
  remainingCourses: number; // estimated # of courses still to take
  elec400Earned: number;
  elec700Earned: number;
  failed: ParsedCourse[];
  overallConfidence: Confidence;
  prereqWarnings: PrereqWarning[];
  studyPlanComparison: StudyPlanComparison[];
}

const FIXED_LABELS: Record<string, string> = {
  ge_req: "ศึกษาทั่วไป — บังคับ (GE Required)",
  ge_elec: "ศึกษาทั่วไป — เลือก (GE Elective)",
  core: "วิชาแกน (Core)",
  major_req: "วิชาเอกบังคับ (Major Required)",
  capstone: "สหกิจ / ค้นคว้าอิสระ (Capstone)",
  major_elec: "วิชาเอกเลือก (Major Elective)",
  minor: "วิชาโท (Minor)",
  free: "วิชาเลือกเสรี (Free Elective)",
};

function fixedBucket(
  key: Bucket,
  label: string,
  required: number,
  passed: ParsedCourse[],
): BucketResult {
  const done = passed.filter((c) => (c.bucketOverride || c.course?.bucket) === key);
  const earned = done.reduce((s, c) => s + c.cr, 0);
  const doneCodes = new Set(done.map((c) => c.code));
  const missing = Object.values(COURSES).filter(
    (c) => c.bucket === key && !doneCodes.has(c.code),
  );
  
  // Confidence: high if all done courses are known in curriculum, medium if some unknown
  const unknownCount = done.filter((c) => !COURSES[c.code]).length;
  const missingCount = missing.length;
  let confidence: Confidence = "high";
  let confidenceNote: string | undefined;
  const validationWarnings: string[] = [];
  
  if (missingCount > 0) {
    confidence = "medium";
    confidenceNote = `ยังขาดอีก ${missingCount} วิชาจากหลักสูตร`;
  }
  if (unknownCount > 0) {
    confidence = confidence === "high" ? "medium" : confidence;
    confidenceNote = (confidenceNote ? confidenceNote + " · " : "") + `มี ${unknownCount} วิชาที่ไม่พบในฐานข้อมูลหลักสูตร`;
    validationWarnings.push(`${unknownCount} วิชาไม่ตรงกับรหัสในหลักสูตร`);
  }
  if (earned >= required) confidence = "high";
  
  return {
    key,
    label,
    earned,
    required,
    doneCourses: done,
    missingCourses: missing,
    inProgress: [],
    confidence,
    confidenceNote,
    validationWarnings,
    note: undefined,
  };
}

export function audit(
  planId: PlanId,
  hasMinor: boolean,
  parsed: ParsedCourse[],
  includeWip: boolean = false,
): AuditResult {
  const plan = PLANS[planId];
  
  // If includeWip is true, we treat inprogress/predicted courses as passed for audit buckets
  const passedForAudit = parsed.filter(
    (c) => c.status === "passed" || (includeWip && c.status === "inprogress")
  );
  const inProgress = parsed.filter((c) => c.status === "inprogress");
  const failed = parsed.filter(
    (c) => c.status === "failed" || c.status === "withdrawn",
  );

  // GPA (always calculated from actual grades only)
  let pts = 0;
  let gpaCr = 0;
  for (const c of parsed) {
    const gp = GRADE_POINTS[c.grade];
    if (gp !== undefined) {
      pts += gp * c.cr;
      gpaCr += c.cr;
    }
  }
  const gpa = gpaCr > 0 ? pts / gpaCr : null;

  // Fixed buckets using passedForAudit
  const ge_req = fixedBucket("ge_req", FIXED_LABELS.ge_req, plan.ge_req, passedForAudit);
  const core = fixedBucket("core", FIXED_LABELS.core, plan.core, passedForAudit);
  const major_req = fixedBucket("major_req", FIXED_LABELS.major_req, plan.major_req, passedForAudit);

  // GE elective — list-bounded, count up to requirement
  const geElecDone = passedForAudit.filter((c) => (c.bucketOverride || c.course?.bucket) === "ge_elec");
  const geElecRaw = geElecDone.reduce((s, c) => s + c.cr, 0);
  const geElecUnknown = geElecDone.filter((c) => !COURSES[c.code]).length;
  const ge_elec: BucketResult = {
    key: "ge_elec",
    label: FIXED_LABELS.ge_elec,
    earned: Math.min(plan.ge_elec, geElecRaw),
    required: plan.ge_elec,
    doneCourses: geElecDone,
    missingCourses: [],
    inProgress: [],
    confidence: geElecRaw >= plan.ge_elec ? "high" : geElecRaw > 0 ? "medium" : "low",
    confidenceNote: geElecRaw < plan.ge_elec ? `ยังขาดอีก ${plan.ge_elec - geElecRaw} นก.` : undefined,
    validationWarnings: geElecUnknown > 0 ? [`${geElecUnknown} วิชา GE เลือกไม่พบในฐานข้อมูล`] : [],
    note: "เลือกจากรายการวิชาศึกษาทั่วไป (3 กลุ่ม: มนุษยศาสตร์, สังคมศาสตร์, วิทยาศาสตร์)",
  };

  // Capstone — accept whichever capstone courses appear, against plan requirement
  const capDone = passedForAudit.filter((c) => {
    const b = c.bucketOverride || c.course?.bucket;
    return b === "capstone_coop" || b === "capstone_is";
  });
  const capWanted = plan.capstoneBucket;
  const capMismatch = capDone.some((c) => {
    const b = c.bucketOverride || c.course?.bucket;
    return b !== capWanted;
  });
  const capEarned = capDone.reduce((s, c) => s + c.cr, 0);
  const capMissing = Object.values(COURSES).filter(
    (c) => c.bucket === capWanted && !capDone.some((d) => d.code === c.code),
  );
  const capWarnings: string[] = [];
  if (capMismatch) capWarnings.push("พบวิชา capstone ที่ไม่ตรงกับแผนที่เลือก");
  const capstone: BucketResult = {
    key: capWanted,
    label: FIXED_LABELS.capstone,
    earned: capEarned,
    required: plan.capstone,
    doneCourses: capDone,
    missingCourses: capMissing,
    inProgress: [],
    confidence: capEarned >= plan.capstone ? "high" : capEarned > 0 ? "medium" : "low",
    confidenceNote: capEarned < plan.capstone ? `ยังขาดอีก ${plan.capstone - capEarned} นก.` : undefined,
    validationWarnings: capWarnings,
    note: capMismatch
      ? "⚠ พบวิชา capstone ที่ไม่ตรงกับแผนที่เลือก"
      : undefined,
  };

  // Major elective — if no minor, absorbs the 15 minor credits
  const effMajorElecReq = plan.major_elec + (hasMinor ? 0 : plan.minor);
  const elecDone = passedForAudit.filter((c) => (c.bucketOverride || c.course?.bucket) === "major_elec");
  const elecEarned = elecDone.reduce((s, c) => s + c.cr, 0);
  const elec400Earned = elecDone
    .filter((c) => (c.course?.level ?? 0) >= 400)
    .reduce((s, c) => s + c.cr, 0);
  const elec700Earned = elecDone
    .filter((c) => (c.course?.level ?? 0) >= 700)
    .reduce((s, c) => s + c.cr, 0);
  const elecUnknown = elecDone.filter((c) => !COURSES[c.code]).length;
  const elecNotes: string[] = [];
  const elecWarnings: string[] = [];
  if (plan.elec400min) {
    const label400 = `ต้องเป็นระดับ 400 อย่างน้อย ${plan.elec400min} นก. (มี ${elec400Earned})`;
    elecNotes.push(label400);
    if (elec400Earned < plan.elec400min) {
      elecWarnings.push(`ขาดวิชาเอกเลือกระดับ 400 อีก ${plan.elec400min - elec400Earned} นก.`);
    }
  }
  if (plan.elec700min) {
    const label700 = `ระดับ 700 อย่างน้อย ${plan.elec700min} นก. (มี ${elec700Earned})`;
    elecNotes.push(label700);
    if (elec700Earned < plan.elec700min) {
      elecWarnings.push(`ขาดวิชาเอกเลือกระดับ 700 อีก ${plan.elec700min - elec700Earned} นก.`);
    }
  }
  if (!hasMinor)
    elecNotes.push("ไม่เรียนโท → รวมหน่วยกิตวิชาโท 15 นก. มาเป็นวิชาเอกเลือก");
  if (elecUnknown > 0)
    elecWarnings.push(`${elecUnknown} วิชาเอกเลือกไม่พบในฐานข้อมูล (อาจนับระดับไม่ถูกต้อง)`);
  const elecGap = Math.max(0, effMajorElecReq - elecEarned);
  const major_elec: BucketResult = {
    key: "major_elec",
    label: FIXED_LABELS.major_elec,
    earned: elecEarned,
    required: effMajorElecReq,
    doneCourses: elecDone,
    missingCourses: [],
    inProgress: [],
    confidence: elecEarned >= effMajorElecReq ? "high" : elecEarned > 0 ? "medium" : "low",
    confidenceNote: elecGap > 0 ? `ยังขาดอีก ${elecGap} นก.${elecWarnings.length ? " (ตรวจสอบระดับด้วย)" : ""}` : undefined,
    validationWarnings: elecWarnings,
    note: elecNotes.join(" · "),
  };

  // Flexible pool: courses not recognised by curriculum → minor / free electives
  const matchedBuckets = new Set<Bucket>([
    "ge_req", "ge_elec", "core", "major_req",
    "capstone_coop", "capstone_is", "major_elec",
  ]);
  const flex = passedForAudit.filter((c) => {
    const b = c.bucketOverride || c.course?.bucket;
    return !b || !matchedBuckets.has(b);
  });
  // overflow GE electives beyond 6 also become free credits
  const geOverflow = Math.max(
    0,
    geElecDone.reduce((s, c) => s + c.cr, 0) - plan.ge_elec,
  );

  // Partition flex courses: fill minor first (by credits), remainder → free.
  const minorReq = hasMinor ? plan.minor : 0;
  const minorCourses: ParsedCourse[] = [];
  const freeCourses: ParsedCourse[] = [];
  
  // First, place courses with explicit overrides
  const flexWithNoOverride: ParsedCourse[] = [];
  let minorAcc = 0;
  for (const c of flex) {
    if (c.bucketOverride === "minor") {
      minorCourses.push(c);
      minorAcc += c.cr;
    } else if (c.bucketOverride === "free") {
      freeCourses.push(c);
    } else {
      flexWithNoOverride.push(c);
    }
  }

  // Then, fill remaining minor requirement with non-overridden flex courses
  for (const c of flexWithNoOverride) {
    if (minorAcc < minorReq) {
      minorCourses.push(c);
      minorAcc += c.cr;
    } else {
      freeCourses.push(c);
    }
  }

  const minorEarned = Math.min(minorReq, minorAcc);
  const freeRaw = freeCourses.reduce((s, c) => s + c.cr, 0) + geOverflow;
  const freeEarned = Math.min(plan.free, freeRaw);

  const minor: BucketResult = {
    key: "minor",
    label: FIXED_LABELS.minor,
    earned: minorEarned,
    required: minorReq,
    doneCourses: minorCourses,
    missingCourses: [],
    inProgress: [],
    confidence: minorEarned >= minorReq ? "high" : minorEarned > 0 ? "medium" : "low",
    confidenceNote: minorReq > 0 && minorEarned < minorReq ? `ยังขาดอีก ${minorReq - minorEarned} นก.` : undefined,
    validationWarnings: [],
    note: hasMinor
      ? plan.minorRestricted
        ? "แผนก้าวหน้า: โทได้เฉพาะ คณิตศาสตร์ / สถิติ / วิทยาการข้อมูล"
        : "เลือกสาขาโทใดก็ได้"
      : "ไม่เรียนโท (ย้ายไปวิชาเอกเลือกแล้ว)",
  };
  const free: BucketResult = {
    key: "free",
    label: FIXED_LABELS.free,
    earned: freeEarned,
    required: plan.free,
    doneCourses: freeCourses,
    missingCourses: [],
    inProgress: [],
    confidence: freeEarned >= plan.free ? "high" : freeEarned > 0 ? "medium" : "low",
    confidenceNote: freeEarned < plan.free ? `ยังขาดอีก ${plan.free - freeEarned} นก.` : undefined,
    validationWarnings: [],
    note: "วิชาใดก็ได้ในมหาวิทยาลัย",
  };

  const buckets: BucketResult[] = [
    ge_req, ge_elec, core, major_req, capstone, major_elec,
    ...(hasMinor ? [minor] : []),
    free,
  ];

  // ── Prerequisite checks ──────────────────────────────────────────────
  const completedCodes = new Set(passedForAudit.map((c) => c.code));
  const prereqWarnings: PrereqWarning[] = [];
  
  // Check taken/planned courses against prereqs
  for (const c of parsed) {
    if (c.status === "failed" || c.status === "withdrawn") continue;
    const reqs = PREREQS[c.code];
    if (!reqs || reqs.length === 0) continue;
    const missingReqs = reqs.filter((r) => !completedCodes.has(r));
    if (missingReqs.length > 0) {
      prereqWarnings.push({
        code: c.code,
        name: c.customName || c.course?.th || c.code,
        missingCodes: missingReqs,
        missingNames: missingReqs.map((r) => COURSES[r]?.th || r),
      });
    }
  }
  
  // Also check failed courses — if a required prereq was failed, warn
  const failedCodes = new Set(failed.map((c) => c.code));
  for (const [code, reqs] of Object.entries(PREREQS)) {
    const alreadyWarned = prereqWarnings.some((w) => w.code === code);
    if (alreadyWarned) continue;
    const failedReqs = reqs.filter((r) => failedCodes.has(r) && !completedCodes.has(r));
    if (failedReqs.length > 0 && completedCodes.has(code)) {
      prereqWarnings.push({
        code,
        name: COURSES[code]?.th || code,
        missingCodes: failedReqs,
        missingNames: failedReqs.map((r) => COURSES[r]?.th || r),
      });
    }
  }

  // ── Study plan comparison ────────────────────────────────────────────
  const studyPlan = STUDY_PLANS[planId];
  const studyPlanComparison: StudyPlanComparison[] = [];
  
  // Group completed courses by year-level indicator
  // A course taken in term "1/2564" → year 1, term "1/2565" → year 2, etc.
  // We map to recommended years by order of terms
  const sortedTerms = [...new Set(parsed
    .filter((c) => c.status !== "failed" && c.status !== "withdrawn")
    .map((c) => c.term))]
    .filter((t) => parseTerm(t))
    .sort(compareTermLabels);
  
  // Map student's terms to recommended years (first term = year 1, etc.)
  const termToYear = new Map<string, number>();
  let yearIdx = 1;
  for (const t of sortedTerms) {
    termToYear.set(t, yearIdx);
    if (yearIdx < 4) yearIdx++;
  }
  
  for (const planTerm of studyPlan) {
    const expectedCodes = planTerm.courses.filter((c) => c !== "MINOR" && c !== "GE_ELEC" && c !== "MAJOR_ELEC" && c !== "MAJOR_ELEC_700" && c !== "FREE");
    const completed = expectedCodes.filter((c) => completedCodes.has(c));
    const behind = expectedCodes.filter((c) => !completedCodes.has(c));
    
    // Find courses taken ahead of this plan year
    const allPastExpected = new Set<string>();
    for (const pt of studyPlan) {
      if (pt.year < planTerm.year || (pt.year === planTerm.year && pt.semester <= planTerm.semester)) {
        pt.courses.filter((c) => c !== "MINOR" && c !== "GE_ELEC" && c !== "MAJOR_ELEC" && c !== "MAJOR_ELEC_700" && c !== "FREE").forEach((c) => allPastExpected.add(c));
      }
    }
    const ahead = [...completedCodes].filter((c) => !allPastExpected.has(c) && COURSES[c]);
    
    const allDone = behind.length === 0;
    const status: "on_track" | "behind" | "ahead" = allDone ? "on_track" : behind.length > 2 ? "behind" : "ahead";
    
    studyPlanComparison.push({
      year: planTerm.year,
      expectedInPlan: expectedCodes,
      completed,
      behind,
      ahead: ahead.slice(0, 6), // limit ahead entries
      status,
    });
  }

  // ── Overall confidence ───────────────────────────────────────────────
  const confidences = buckets.map((b) => b.confidence);
  let overallConfidence: Confidence = "high";
  if (confidences.some((c) => c === "low")) overallConfidence = "low";
  else if (confidences.some((c) => c === "medium")) overallConfidence = "medium";
  // Lower confidence if there are prereq warnings
  if (prereqWarnings.length > 0 && overallConfidence === "high") overallConfidence = "medium";
  // Lower confidence if plan is behind
  if (studyPlanComparison.some((s) => s.status === "behind") && overallConfidence === "high") overallConfidence = "medium";

  // Totals — cap each bucket at its requirement so overflow doesn't inflate.
  const totalEarned = buckets.reduce(
    (s, b) => s + Math.min(b.earned, b.required || b.earned),
    0,
  );
  const totalRequired = plan.total;
  const totalInProgress = inProgress.reduce((s, c) => s + c.cr, 0);

  // Remaining course estimate: exact missing for fixed buckets + ceil(credits/3)
  let remCourses = 0;
  for (const b of [ge_req, core, major_req, capstone]) {
    remCourses += b.missingCourses.length;
  }
  const remainingCredits = Math.max(0, totalRequired - totalEarned);

  const unmatched = flex;

  return {
    plan,
    hasMinor,
    totalEarned,
    totalRequired,
    totalInProgress,
    gpa,
    gpaCredits: gpaCr,
    buckets,
    unmatched,
    remainingCredits,
    remainingCourses: remCourses,
    elec400Earned,
    elec700Earned,
    failed,
    overallConfidence,
    prereqWarnings,
    studyPlanComparison,
  };
}

// Group parsed courses by term, preserving first-seen order.
export function groupByTerm(parsed: ParsedCourse[]): {
  term: string;
  courses: ParsedCourse[];
  credits: number;
}[] {
  const order: string[] = [];
  const map = new Map<string, ParsedCourse[]>();
  for (const c of parsed) {
    if (!map.has(c.term)) {
      map.set(c.term, []);
      order.push(c.term);
    }
    map.get(c.term)!.push(c);
  }
  return order.map((term) => {
    const courses = map.get(term)!;
    const credits = courses
      .filter((c) => c.status === "passed" || c.status === "inprogress")
      .reduce((s, c) => s + c.cr, 0);
    return { term, courses, credits };
  });
}

// ── Recommended term lookup ─────────────────────────────────────────────
// Maps each course code → which plan year & semester it belongs in
// Built from STUDY_PLANS data

interface PlanSlot {
  year: number;
  semester: number;
}

const COURSE_PLAN_SLOT: Record<string, PlanSlot> = {};

// Build the lookup from STUDY_PLANS
for (const [_planId, terms] of Object.entries(STUDY_PLANS)) {
  for (const term of terms) {
    for (const code of term.courses) {
      if (code === "MINOR" || code === "GE_ELEC" || code === "MAJOR_ELEC" ||
          code === "MAJOR_ELEC_700" || code === "FREE") continue;
      if (!COURSE_PLAN_SLOT[code]) {
        COURSE_PLAN_SLOT[code] = { year: term.year, semester: term.semester };
      }
    }
  }
}

/**
 * Given a student's first term (e.g. "1/2564") and a target plan year/semester,
 * compute the actual term label. Year 1 = first academic year, etc.
 */
export function getRecommendedTerm(
  firstTermLabel: string,
  planYear: number,
  planSemester: number,
): string {
  const ft = parseTerm(firstTermLabel);
  if (!ft) return `${planSemester}/2568`;
  // Year 1 = firstTerm year, Year 2 = firstTerm year + 1, etc.
  const actualYear = ft.year + planYear - 1;
  return `${planSemester}/${actualYear}`;
}

/**
 * Look up which recommended year/semester a course belongs to.
 */
export function getCoursePlanSlot(code: string): PlanSlot | null {
  return COURSE_PLAN_SLOT[code] ?? null;
}

export function parseTerm(term: string) {
  const match = term.match(/^([1-3])\/(25\d{2}|20\d{2})$/);
  if (!match) return null;
  return {
    semester: Number(match[1]),
    year: Number(match[2]),
  };
}

export function compareTermLabels(a: string, b: string) {
  const aTerm = parseTerm(a);
  const bTerm = parseTerm(b);
  if (aTerm && bTerm) {
    if (aTerm.year !== bTerm.year) return aTerm.year - bTerm.year;
    return aTerm.semester - bTerm.semester;
  }
  if (aTerm) return -1;
  if (bTerm) return 1;
  return a.localeCompare(b, "th");
}
