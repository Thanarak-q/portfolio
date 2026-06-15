import { useMemo, useState, useEffect } from "react";
import {
  PLANS,
  type PlanId,
  type Bucket,
  type Course,
  COURSES,
} from "../lib/curriculum-data";
import {
  audit,
  groupByTerm,
  parseTranscript,
  parseTerm,
  compareTermLabels,
  getRecommendedTerm,
  getCoursePlanSlot,
  type AuditResult,
  type ParsedCourse,
  type Status,
  type Confidence,
  type PrereqWarning,
  type StudyPlanComparison,
} from "../lib/curriculum-logic";

const PLAN_ORDER: PlanId[] = ["coop", "regular", "honors"];

const STATUS_META: Record<Status, { label: string; cls: string }> = {
  passed: { label: "ผ่าน", cls: "ok" },
  inprogress: { label: "กำลังเรียน / แผน", cls: "wip" },
  failed: { label: "ไม่ผ่าน", cls: "bad" },
  withdrawn: { label: "ถอน", cls: "bad" },
};

const BUCKET_ABBR: Record<string, string> = {
  ge_req: "GE บังคับ",
  ge_elec: "GE เลือก",
  core: "แกน",
  major_req: "เอกบังคับ",
  capstone_coop: "สหกิจ",
  capstone_is: "IS",
  major_elec: "เอกเลือก",
  minor: "วิชาโท",
  free: "เสรี",
  unknown: "ทั่วไป",
};

function pct(earned: number, required: number) {
  if (required <= 0) return 100;
  return Math.min(100, Math.round((earned / required) * 100));
}

function makePlannedCourse(course: Course, term: string): ParsedCourse {
  return {
    code: course.code,
    cr: course.cr,
    grade: "",
    status: "inprogress",
    term,
    course,
    customName: course.th,
    isPredicted: true,
  };
}

function getNextTermLabel(term: string) {
  const parsedTerm = parseTerm(term);
  if (!parsedTerm) return "1/2568";
  if (parsedTerm.semester === 1) return `2/${parsedTerm.year}`;
  if (parsedTerm.semester === 2) return `1/${parsedTerm.year + 1}`;
  return `1/${parsedTerm.year + 1}`;
}

type TermGroup = ReturnType<typeof groupByTerm>[number];

function buildSemesterYears(terms: TermGroup[]) {
  const parsedTerms = terms
    .map((term) => ({ ...term, parsed: parseTerm(term.term) }))
    .filter((term): term is TermGroup & {
      parsed: { semester: number; year: number };
    } => term.parsed !== null)
    .sort((a, b) => compareTermLabels(a.term, b.term));

  const firstYear = parsedTerms[0]?.parsed.year ?? 2568;
  const years = new Map<number, TermGroup[]>();

  for (const term of parsedTerms) {
    const yearNo = Math.max(1, term.parsed.year - firstYear + 1);
    years.set(yearNo, [...(years.get(yearNo) ?? []), term]);
  }

  const output = Array.from(years.entries()).map(([yearNo, yearTerms]) => ({
    yearNo,
    terms: yearTerms,
  }));

  const customTerms = terms.filter((term) => !parseTerm(term.term));
  if (customTerms.length > 0) {
    output.push({ yearNo: 0, terms: customTerms });
  }

  return output;
}

function Ring({ value, total }: { value: number; total: number }) {
  const p = total > 0 ? Math.min(1, value / total) : 0;
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <svg className="cc-ring" viewBox="0 0 120 120" width="132" height="132">
      <circle cx="60" cy="60" r={r} className="cc-ring-bg" />
      <circle
        cx="60"
        cy="60"
        r={r}
        className="cc-ring-fg"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - p)}
        transform="rotate(-90 60 60)"
      />
      <text x="60" y="56" className="cc-ring-num">
        {value}
      </text>
      <text x="60" y="76" className="cc-ring-den">
        / {total}
      </text>
    </svg>
  );
}

function CourseChip({
  c,
  onEdit,
  onDelete,
  onQuickBucketChange,
}: {
  c: ParsedCourse;
  onEdit: () => void;
  onDelete?: () => void;
  onQuickBucketChange: (b: Bucket | "auto") => void;
}) {
  const meta = STATUS_META[c.status];
  const name = c.customName || c.course?.th || "วิชานอกหลักสูตร / โท / เสรี";
  
  return (
    <li className={`cc-chip ${c.isPredicted ? "predicted" : ""} ${c.bucketOverride ? "overridden" : ""}`}>
      <span className="cc-chip-code mono" onClick={onEdit} style={{ cursor: "pointer" }} title="คลิกเพื่อแก้ไขรายละเอียดวิชา">
        {c.code}
        {c.isPredicted && <span className="cc-chip-badge predicted-badge">แผน</span>}
        {c.bucketOverride && <span className="cc-chip-badge override-badge" title="ปรับเปลี่ยนหมวดหมู่แล้ว">ปรับ</span>}
      </span>
      <span className="cc-chip-name" title={name} onClick={onEdit} style={{ cursor: "pointer" }}>{name}</span>
      <span className="cc-chip-cr mono">{c.cr} นก.</span>
      
      <span className="cc-chip-cat-select-wrapper">
        <select
          className="cc-chip-cat-select"
          value={c.bucketOverride || "auto"}
          onChange={(e) => onQuickBucketChange(e.target.value as Bucket | "auto")}
        >
          <option value="auto">อัตโนมัติ ({BUCKET_ABBR[c.course?.bucket || "unknown"] || "ทั่วไป"})</option>
          <option value="ge_req">GE บังคับ</option>
          <option value="ge_elec">GE เลือก</option>
          <option value="core">วิชาแกน</option>
          <option value="major_req">เอกบังคับ</option>
          <option value="major_elec">เอกเลือก</option>
          <option value="capstone_coop">หมวดสหกิจศึกษา (Co-op)</option>
          <option value="capstone_is">หมวดค้นคว้าอิสระ (IS)</option>
          <option value="minor">วิชาโท</option>
          <option value="free">วิชาเลือกเสรี</option>
        </select>
      </span>

      <span className={`cc-chip-grade ${meta.cls}`} onClick={onEdit} style={{ cursor: "pointer" }} title="คลิกเพื่อแก้ไขเกรด">
        {c.grade || meta.label}
      </span>
      
      {onDelete && c.isPredicted && (
        <button
          type="button"
          className="cc-chip-del"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="ลบวิชานี้ออกจากแผน"
        >
          ✕
        </button>
      )}
    </li>
  );
}

export default function CurriculumChecker() {
  const [planId, setPlanId] = useState<PlanId>("coop");
  const [hasMinor, setHasMinor] = useState(true);
  const [raw, setRaw] = useState("");
  const [parsed, setParsed] = useState<ParsedCourse[]>([]);
  const [createdTerms, setCreatedTerms] = useState<string[]>([]);
  const [includeWip, setIncludeWip] = useState(true);
  const [step, setStep] = useState(1);
  const [editingSetup, setEditingSetup] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<ParsedCourse | null>(null);
  const [defaultTerm, setDefaultTerm] = useState("");

  const plan = PLANS[planId];

  // Dynamic audit calculation
  const result = useMemo(() => {
    if (parsed.length === 0) return null;
    return audit(planId, hasMinor, parsed, includeWip);
  }, [planId, hasMinor, parsed, includeWip]);

  const terms = useMemo(() => {
    const grouped = groupByTerm(parsed);
    const knownTerms = new Set(grouped.map((term) => term.term));
    const emptyTerms = createdTerms
      .filter((term) => !knownTerms.has(term))
      .map((term) => ({ term, courses: [], credits: 0 }));
    return [...grouped, ...emptyTerms].sort((a, b) =>
      compareTermLabels(a.term, b.term)
    );
  }, [parsed, createdTerms]);

  const termsList = useMemo(() => {
    const sorted = terms.map((term) => term.term);
    const nextTerms = ["1/2568", "2/2568", "1/2569", "2/2569"];
    const merged = [...sorted];
    for (const nt of nextTerms) {
      if (!merged.includes(nt)) {
        merged.push(nt);
      }
    }
    return merged;
  }, [terms]);

  const getNextLogicalTerm = () => {
    if (terms.length === 0) return "1/2568";
    const termsOnly = terms.map((term) => term.term).filter((t) => parseTerm(t));
    if (termsOnly.length === 0) return "1/2568";
    const sorted = [...termsOnly].sort(compareTermLabels);
    const latest = sorted[sorted.length - 1];
    return getNextTermLabel(latest);
  };

  const run = () => {
    const p = parseTranscript(raw);
    const prevPredicted = parsed.filter((c) => c.isPredicted);
    const merged = [...p];
    for (const pred of prevPredicted) {
      if (!merged.some((c) => c.code === pred.code)) {
        merged.push(pred);
      }
    }
    setParsed(merged);
  };

  const handleQuickBucketChange = (code: string, bucket: Bucket | "auto") => {
    setParsed((prev) =>
      prev.map((c) =>
        c.code === code
          ? { ...c, bucketOverride: bucket === "auto" ? undefined : bucket }
          : c
      )
    );
  };

  const handleSaveCourse = (course: ParsedCourse) => {
    setParsed((prev) => {
      const idx = prev.findIndex((c) => c.code === course.code);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = course;
        return next;
      }
      return [...prev, course];
    });
    setModalOpen(false);
    setEditingCourse(null);
  };

  const handlePlanMissingCourse = (course: Course, _fallbackTerm: string) => {
    setParsed((prev) => {
      if (prev.some((c) => c.code === course.code)) return prev;
      // Find the correct recommended semester for this course
      const slot = getCoursePlanSlot(course.code);
      let term = _fallbackTerm;
      if (slot) {
        // Find student's first term to calculate actual year
        const allTerms = prev
          .map((c) => c.term)
          .filter((t) => parseTerm(t))
          .sort(compareTermLabels);
        const firstTerm = allTerms[0] || "1/2568";
        term = getRecommendedTerm(firstTerm, slot.year, slot.semester);
      }
      return [...prev, makePlannedCourse(course, term)];
    });
  };

  const handleCreateSemester = (term: string) => {
    const cleanTerm = term.trim();
    if (!cleanTerm) return;
    setCreatedTerms((prev) => {
      if (prev.includes(cleanTerm) || parsed.some((c) => c.term === cleanTerm)) {
        return prev;
      }
      return [...prev, cleanTerm];
    });
  };

  const handleDeleteCourse = (code: string) => {
    setParsed((prev) => prev.filter((c) => c.code !== code));
    setModalOpen(false);
    setEditingCourse(null);
  };

  const handleMoveCourse = (code: string, newTerm: string) => {
    setParsed((prev) =>
      prev.map((c) =>
        c.code === code ? { ...c, term: newTerm } : c
      )
    );
  };

  const openAddModal = (term: string) => {
    setEditingCourse(null);
    setDefaultTerm(term);
    setModalOpen(true);
  };

  const openEditModal = (course: ParsedCourse) => {
    setEditingCourse(course);
    setModalOpen(true);
  };

  return (
    <div className="cc">
      {/* ── Wizard Setup ──────────────────────────── */}
      {(!result || editingSetup) && (
        <section className="cc-wizard glass-liquid">
          {/* Step indicator */}
          <nav className="cc-wizard-steps" aria-label="ขั้นตอน">
            {[1, 2, 3].map((s) => (
              <button
                key={s}
                type="button"
                className={`cc-wizard-dot ${s === step ? "active" : ""} ${s < step ? "done" : ""}`}
                onClick={() => { if (s < step) setStep(s); }}
                disabled={s > step}
              >
                <span className="cc-wizard-num">{s}</span>
                <span className="cc-wizard-label">
                  {s === 1 ? "เลือกแผน" : s === 2 ? "วิชาโท" : "ผลการเรียน"}
                </span>
              </button>
            ))}
          </nav>

          {/* Step 1 — Choose Plan */}
          {step === 1 && (
            <div className="cc-wizard-page">
              <h2 className="serif cc-wizard-title">คุณเรียนแผนไหน?</h2>
              <p className="cc-wizard-desc">
                แต่ละแผนมีจำนวนหน่วยกิตและเงื่อนไขต่างกัน — เลือกให้ตรงกับที่คุณเรียนอยู่
              </p>
              <div className="cc-plans cc-plans-wizard">
                {PLAN_ORDER.map((id) => {
                  const pl = PLANS[id];
                  const active = id === planId;
                  return (
                    <button
                      key={id}
                      className={`cc-plan ${active ? "active" : ""}`}
                      onClick={() => setPlanId(id)}
                      type="button"
                    >
                      <span className="cc-plan-th">{pl.label}</span>
                      <span className="cc-plan-en mono">{pl.labelEn}</span>
                      <span className="cc-plan-cr">
                        {pl.total} <span className="mono">นก.</span>
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="cc-wizard-actions">
                <span />
                <button
                  type="button"
                  className="cc-wizard-next"
                  onClick={() => setStep(2)}
                >
                  ถัดไป → เลือกวิชาโท
                </button>
              </div>
            </div>
          )}

          {/* Step 2 — Minor */}
          {step === 2 && (
            <div className="cc-wizard-page">
              <h2 className="serif cc-wizard-title">เรียนวิชาโทหรือเปล่า?</h2>
              <p className="cc-wizard-desc">
                ถ้าเรียนโทต้องเก็บ 15 หน่วยกิตจากสาขาที่เลือก — ถ้าไม่เรียน
                ระบบจะย้ายหน่วยกิตไปรวมกับวิชาเอกเลือกแทน
              </p>
              <div className="cc-toggle cc-toggle-wizard">
                <button
                  type="button"
                  className={hasMinor ? "active" : ""}
                  onClick={() => setHasMinor(true)}
                >
                  เรียนวิชาโท 15 หน่วยกิต
                </button>
                <button
                  type="button"
                  className={!hasMinor ? "active" : ""}
                  onClick={() => setHasMinor(false)}
                >
                  ไม่เรียนโท — ใช้เอกเลือก 15 หน่วยกิตแทน
                </button>
              </div>
              {plan.minorRestricted && hasMinor && (
                <p className="cc-hint" style={{ marginTop: "12px" }}>
                  ⚠ แผนก้าวหน้า: โทได้เฉพาะ คณิตศาสตร์ / สถิติ / วิทยาการข้อมูล เท่านั้น
                </p>
              )}
              <div className="cc-wizard-actions">
                <button
                  type="button"
                  className="cc-wizard-back"
                  onClick={() => setStep(1)}
                >
                  ← กลับ
                </button>
                <button
                  type="button"
                  className="cc-wizard-next"
                  onClick={() => setStep(3)}
                >
                  ถัดไป → วางผลการเรียน
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Transcript */}
          {step === 3 && (
            <div className="cc-wizard-page">
              <h2 className="serif cc-wizard-title">วางผลการเรียนของคุณ</h2>
              <p className="cc-wizard-desc">
                ไปที่ REG CMU → ผลการเรียน → คัดลอกตารางทั้งหมดมาวางด้านล่าง
                ระบบจะอ่านรหัสวิชา 6 หลัก หน่วยกิต และเกรดให้อัตโนมัติ
              </p>
              <textarea
                className="cc-textarea mono"
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                placeholder={
                  "1/2564\n" +
                  "204111  Fundamentals of Programming   3   A\n" +
                  "206111  Calculus 1                    3   B+\n" +
                  "001101  Fundamental English 1        3   A\n" +
                  "2/2564\n" +
                  "204114  Intro to OOP                  3   B"
                }
                spellCheck={false}
                rows={12}
              />
              <div className="cc-wizard-sample">
                <p className="cc-wizard-sample-title">ตัวอย่างรูปแบบที่ระบบอ่านได้</p>
                <pre className="cc-wizard-sample-pre mono">
{`1/2564
204111  Fundamentals of Programming   3   A
206111  Calculus 1                    3   B+

2/2564
204114  Intro to OOP                  3   B`}
                </pre>
              </div>
              <div className="cc-wizard-actions">
                <button
                  type="button"
                  className="cc-wizard-back"
                  onClick={() => setStep(2)}
                >
                  ← กลับ
                </button>
                <button
                  className="cc-analyze"
                  type="button"
                  onClick={() => { run(); }}
                  disabled={raw.trim().length === 0}
                >
                  วิเคราะห์ผลการเรียน →
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── Results ───────────────────────────────── */}
      {result && !editingSetup && (
        <Results
          result={result}
          terms={terms}
          includeWip={includeWip}
          setIncludeWip={setIncludeWip}
          openAddModal={openAddModal}
          openEditModal={openEditModal}
          handleDeleteCourse={handleDeleteCourse}
          handleMoveCourse={handleMoveCourse}
          handleQuickBucketChange={handleQuickBucketChange}
          handlePlanMissingCourse={handlePlanMissingCourse}
          handleCreateSemester={handleCreateSemester}
          getNextLogicalTerm={getNextLogicalTerm}
        />
      )}

      {/* ── Add/Edit Modal ────────────────────────── */}
      {modalOpen && (
        <CourseModal
          course={editingCourse}
          defaultTerm={defaultTerm}
          termsList={termsList}
          onSave={handleSaveCourse}
          onClose={() => setModalOpen(false)}
          onDelete={editingCourse ? () => handleDeleteCourse(editingCourse.code) : undefined}
        />
      )}
    </div>
  );
}

function Results({
  result,
  terms,
  includeWip,
  setIncludeWip,
  openAddModal,
  openEditModal,
  handleDeleteCourse,
  handleMoveCourse,
  handleQuickBucketChange,
  handlePlanMissingCourse,
  handleCreateSemester,
  getNextLogicalTerm,
}: {
  result: AuditResult;
  terms: ReturnType<typeof groupByTerm>;
  includeWip: boolean;
  setIncludeWip: (v: boolean) => void;
  openAddModal: (term: string) => void;
  openEditModal: (c: ParsedCourse) => void;
  handleDeleteCourse: (code: string) => void;
  handleMoveCourse: (code: string, newTerm: string) => void;
  handleQuickBucketChange: (code: string, b: Bucket | "auto") => void;
  handlePlanMissingCourse: (course: Course, term: string) => void;
  handleCreateSemester: (term: string) => void;
  getNextLogicalTerm: () => string;
}) {
  const done = result.remainingCredits === 0;
  const nextTerm = getNextLogicalTerm();
  const [semesterDraft, setSemesterDraft] = useState(nextTerm);
  const plannedCodeSet = new Set(
    terms.flatMap((t) => t.courses.map((c) => c.code))
  );
  const completedBuckets = result.buckets.filter(
    (b) => b.earned >= b.required
  ).length;
  const semesterYears = buildSemesterYears(terms);
  const [resultStep, setResultStep] = useState(1);
  const totalResultSteps = 5;

  const RESULT_STEPS = [
    { num: 1, label: "สรุป" },
    { num: 2, label: "ตรวจหมวด" },
    { num: 3, label: "เทียบแผน" },
    { num: 4, label: "ตารางเรียน" },
    { num: 5, label: "สรุปสุดท้าย" },
  ];

  useEffect(() => {
    setSemesterDraft(nextTerm);
  }, [nextTerm]);

  return (
    <>
      {/* ── Result step nav ──────────────────────── */}
      <nav className="cc-wizard-steps" aria-label="ผลลัพธ์">
        {RESULT_STEPS.map((s) => (
          <button
            key={s.num}
            type="button"
            className={`cc-wizard-dot ${s.num === resultStep ? "active" : ""} ${s.num < resultStep ? "done" : ""}`}
            onClick={() => { if (s.num <= resultStep) setResultStep(s.num); }}
            disabled={s.num > resultStep}
          >
            <span className="cc-wizard-num">{s.num}</span>
            <span className="cc-wizard-label">{s.label}</span>
          </button>
        ))}
      </nav>

      {/* Page 1 — Overview */}
      {resultStep === 1 && (
        <div className="cc-wizard-page">
          <section className="cc-summary glass-liquid">
            <div className="cc-summary-ring">
              <Ring value={result.totalEarned} total={result.totalRequired} />
            </div>
            <div className="cc-summary-body">
              <p className="cc-step-label mono">สรุปผล — {result.plan.label}</p>
              <h2 className="serif cc-h2">
                {done ? (
                  <>พื้นที่วางแผนจบพร้อมใช้</>
                ) : (
                  <>
                    พื้นที่วางแผนจบ <em>{result.remainingCredits}</em> นก.
                  </>
                )}
              </h2>
              <p className="cc-hint">
                ดูเครดิตที่เหลือ เลือกวิชาที่ขาดเข้าตารางเทอมถัดไป แล้วกลับมาแก้หมวด
                หรือเกรดในไทม์ไลน์ได้ทันที
              </p>

              <div className="cc-stats">
                <div>
                  <span className="cc-stat-num">{result.totalEarned}</span>
                  <span className="cc-stat-lab">
                    {includeWip ? "รวมเรียน+วางแผนแล้ว (นก.)" : "ผ่านจริงแล้ว (นก.)"}
                  </span>
                </div>
                <div>
                  <span className="cc-stat-num">
                    {result.remainingCredits}
                  </span>
                  <span className="cc-stat-lab">ต้องเรียนอีก (นก.)</span>
                </div>
                <div>
                  <span className="cc-stat-num">~{result.remainingCourses}</span>
                  <span className="cc-stat-lab">วิชาที่เหลือ (โดยประมาณ)</span>
                </div>
                <div>
                  <span className="cc-stat-num">
                    {completedBuckets}/{result.buckets.length}
                  </span>
                  <span className="cc-stat-lab">หมวดที่ครบแล้ว</span>
                </div>
                <div>
                  <span className="cc-stat-num">
                    {result.gpa !== null ? result.gpa.toFixed(2) : "—"}
                  </span>
                  <span className="cc-stat-lab">เกรดเฉลี่ย (GPA)</span>
                </div>
                {result.totalInProgress > 0 && (
                  <div>
                    <span className="cc-stat-num">{result.totalInProgress}</span>
                    <span className="cc-stat-lab">กำลังเรียน/วางแผน (นก.)</span>
                  </div>
                )}
                <div>
                  <span className={`cc-stat-num cc-conf-text-${result.overallConfidence}`}>
                    {result.overallConfidence === "high" ? "✓ สูง" : result.overallConfidence === "medium" ? "⚠ ปานกลาง" : "✗ ต่ำ"}
                  </span>
                  <span className="cc-stat-lab">ระดับความมั่นใจ</span>
                </div>
              </div>

              <div className="cc-summary-controls">
                <label className="cc-wip-toggle" htmlFor="include-wip">
                  <input
                    type="checkbox"
                    id="include-wip"
                    checked={includeWip}
                    onChange={(e) => setIncludeWip(e.target.checked)}
                  />
                  <span>นับรวมวิชาที่กำลังเรียนและแผนลงทะเบียนล่วงหน้า</span>
                </label>
              </div>

              {result.failed.length > 0 && (
                <p className="cc-hint cc-warn">
                  มี {result.failed.length} วิชาที่ไม่ผ่าน/ถอน —
                  ตรวจสอบว่าต้องลงซ้ำหรือไม่
                </p>
              )}
            </div>
          </section>
        </div>
      )}

      {/* Page 2 — Bucket breakdown */}
      {resultStep === 2 && (
        <div className="cc-wizard-page">
          <div className="cc-section-intro">
            <p className="cc-step-label mono">รายละเอียดตามหมวดหลักสูตร</p>
            <h2 className="serif cc-h2">ตรวจหลักฐานก่อนลงจริง</h2>
          </div>
          <section className="cc-buckets">
            {result.buckets.map((b) => (
              <article
                key={b.key + b.label}
                className={`cc-bucket glass-liquid ${
                  b.earned >= b.required ? "complete" : ""
                }`}
              >
                <header className="cc-bucket-head">
                  <h3 className="cc-bucket-title">{b.label}</h3>
                  <span className="cc-bucket-count mono">
                    {Math.min(b.earned, b.required || b.earned)}/{b.required}
                  </span>
                  <span className={`cc-confidence cc-conf-${b.confidence}`} title={b.confidenceNote || ""}>
                    {b.confidence === "high" ? "✓ มั่นใจ" : b.confidence === "medium" ? "⚠ ปานกลาง" : "✗ ต่ำ"}
                  </span>
                </header>
                <div className="cc-bar">
                  <span
                    className="cc-bar-fill"
                    style={{ width: `${pct(b.earned, b.required)}%` }}
                  />
                </div>
                {b.note && <p className="cc-bucket-note">{b.note}</p>}
                {b.validationWarnings.length > 0 && (
                  <div className="cc-bucket-warnings">
                    {b.validationWarnings.map((w, i) => (
                      <p key={i} className="cc-warn-inline">⚠ {w}</p>
                    ))}
                  </div>
                )}

                {b.missingCourses.length > 0 && (
                  <details className="cc-missing" open>
                    <summary>
                      ยังขาด {b.missingCourses.length} วิชา — ต้องลงเรียน
                    </summary>
                    <ul className="cc-list">
                      {b.missingCourses.map((m) => (
                        <li key={m.code} className="cc-chip missing">
                          <span className="cc-chip-code mono">{m.code}</span>
                          <span className="cc-chip-name">{m.th}</span>
                          <span className="cc-chip-cr mono">{m.cr} นก.</span>
                          <button
                            type="button"
                            className="cc-mini-plan-btn"
                            onClick={() => handlePlanMissingCourse(m, nextTerm)}
                            disabled={plannedCodeSet.has(m.code)}
                          >
                            วางแผน
                          </button>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}

                {b.doneCourses.length > 0 && (
                  <details className="cc-done" open>
                    <summary>เรียนแล้ว/วางแผนไว้ {b.doneCourses.length} วิชา</summary>
                    <ul className="cc-list">
                      {b.doneCourses.map((c) => (
                        <CourseChip
                          key={c.code}
                          c={c}
                          onEdit={() => openEditModal(c)}
                          onDelete={c.isPredicted ? () => handleDeleteCourse(c.code) : undefined}
                          onQuickBucketChange={(bucket) => handleQuickBucketChange(c.code, bucket)}
                        />
                      ))}
                    </ul>
                  </details>
                )}
              </article>
            ))}
          </section>

          {/* Prereq warnings — shown inside page 3 */}
          {result.prereqWarnings.length > 0 && (
            <section className="cc-prereq glass-liquid" style={{ marginTop: "16px" }}>
              <p className="cc-step-label mono">⚠ คำเตือน — วิชาบังคับก่อน (Prerequisite)</p>
              <h2 className="serif cc-h2" style={{ fontSize: "1.4rem" }}>มี {result.prereqWarnings.length} วิชาที่ยังขาด prerequisite</h2>
              <ul className="cc-prereq-list">
                {result.prereqWarnings.map((w) => (
                  <li key={w.code} className="cc-prereq-item">
                    <span className="cc-chip-code mono">{w.code}</span>
                    <span className="cc-chip-name">{w.name}</span>
                    <span className="cc-prereq-arrow">ต้องผ่านก่อน:</span>
                    {w.missingCodes.map((mc, i) => (
                      <span key={mc} className="cc-prereq-missing mono">
                        {mc} {w.missingNames[i] ? `(${w.missingNames[i]})` : ""}
                        {i < w.missingCodes.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      {/* Page 3 — Study plan comparison */}
      {resultStep === 3 && (
        <div className="cc-wizard-page">
          {result.studyPlanComparison.length > 0 && (
            <section className="cc-plan-compare glass-liquid">
              <p className="cc-step-label mono">เปรียบเทียบกับแผนการเรียนแนะนำ</p>
              <h2 className="serif cc-h2">ความคืบหน้าเทียบกับแผนแนะนำรายชั้นปี</h2>
              <div className="cc-plan-grid">
                {result.studyPlanComparison.map((year) => (
                  <article key={year.year} className={`cc-plan-year cc-plan-${year.status}`}>
                    <header className="cc-plan-year-head">
                      <h3>ชั้นปีที่ {year.year}</h3>
                      <span className={`cc-plan-status cc-plan-st-${year.status}`}>
                        {year.status === "on_track" ? "✓ ตามแผน" : year.status === "behind" ? "⚠ ล่าช้า" : "⚡ ล้ำหน้า"}
                      </span>
                    </header>
                    <div className="cc-plan-detail">
                      {year.behind.length > 0 && (
                        <div className="cc-plan-behind">
                          <p className="cc-plan-label">ยังขาด ({year.behind.length} วิชา):</p>
                          {year.behind.map((code) => {
                            const course = COURSES[code];
                            return (
                              <span key={code} className="cc-plan-chip missing mono">
                                {code}{course ? ` — ${course.th}` : ""}
                              </span>
                            );
                          })}
                        </div>
                      )}
                      {year.completed.length > 0 && (
                        <div className="cc-plan-done">
                          <p className="cc-plan-label">ผ่านแล้ว ({year.completed.length}/{year.expectedInPlan.length}):</p>
                          {year.completed.map((code) => {
                            const course = COURSES[code];
                            return (
                              <span key={code} className="cc-plan-chip done mono">
                                {code}{course ? ` — ${course.th}` : ""}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Page 4 — Semester planner */}
      {resultStep === 4 && (
        <div className="cc-wizard-page">
          <section className="cc-terms glass-liquid">
            <div className="cc-terms-head">
              <div>
                <p className="cc-step-label mono">semester planner</p>
                <h2 className="serif cc-h2">ตารางเรียนตามชั้นปี</h2>
              </div>
            </div>

            <div className="cc-year-stack">
              {semesterYears.map((year) => (
                <section key={year.yearNo} className="cc-year-block">
                  <h3 className="cc-year-title">
                    {year.yearNo === 0 ? "เทอมอื่น ๆ" : `ชั้นปีที่ ${year.yearNo}`}
                  </h3>
                  <div className="cc-semester-grid">
                    {year.terms.map((term) => (
                      <article
                        key={term.term}
                        className="cc-semester-card cc-term"
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.add("cc-drag-over");
                        }}
                        onDragLeave={(e) => {
                          e.currentTarget.classList.remove("cc-drag-over");
                        }}
                        onDrop={(e) => {
                          e.currentTarget.classList.remove("cc-drag-over");
                          const code = e.dataTransfer.getData("text/plain");
                          if (code) handleMoveCourse(code, term.term);
                        }}
                      >
                        <header className="cc-semester-head">
                          <div>
                            <span className="cc-semester-title">
                              ภาคการศึกษาที่ {parseTerm(term.term)?.semester ?? term.term}
                            </span>
                            <span className="cc-semester-term mono">{term.term}</span>
                          </div>
                          <span className="cc-semester-credits mono">{term.credits} หน่วย</span>
                        </header>

                        <div className="cc-semester-table">
                          {term.courses.length === 0 ? (
                            <div className="cc-semester-empty">ยังไม่มีวิชาในเทอมนี้</div>
                          ) : (
                            term.courses.map((course) => (
                              <SemesterCourseRow
                                key={course.code + course.term}
                                course={course}
                                onEdit={() => openEditModal(course)}
                                onDelete={course.isPredicted ? () => handleDeleteCourse(course.code) : undefined}
                              />
                            ))
                          )}
                        </div>

                        <button
                          type="button"
                          className="cc-add-inline-btn cc-semester-add"
                          onClick={() => openAddModal(term.term)}
                        >
                          + เพิ่มวิชา
                        </button>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="cc-create-term-wrap">
              <form
                className="cc-create-term"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCreateSemester(semesterDraft);
                }}
              >
                <label className="sr-only" htmlFor="cc-new-semester">ภาคการศึกษาใหม่</label>
                <input
                  id="cc-new-semester"
                  className="cc-term-input mono"
                  value={semesterDraft}
                  onChange={(e) => setSemesterDraft(e.target.value)}
                  placeholder="เช่น 3/2564"
                />
                <button type="submit" className="cc-add-inline-btn cc-add-next">
                  + สร้างเทอมใหม่
                </button>
              </form>
            </div>
          </section>
        </div>
      )}

      {/* Page 5 — Final Conclusion */}
      {resultStep === 5 && (
        <div className="cc-wizard-page">
          <section className="cc-conclusion glass-liquid">
            {done ? (
              <>
                <div className="cc-conclusion-verdict cc-verdict-pass">
                  <span className="cc-verdict-icon cc-verdict-icon-pass">✓</span>
                  <h2 className="serif cc-verdict-title">คุณเรียนครบทุกหน่วยกิตแล้ว!</h2>
                  <p className="cc-verdict-desc">
                    {result.totalEarned} / {result.totalRequired} หน่วยกิต — ผ่านทุกหมวดตามที่หลักสูตรกำหนด
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="cc-conclusion-verdict cc-verdict-incomplete">
                  <span className="cc-verdict-icon cc-verdict-icon-pending">—</span>
                  <h2 className="serif cc-verdict-title">
                    ยังขาดอีก <em>{result.remainingCredits}</em> หน่วยกิต
                  </h2>
                  <p className="cc-verdict-desc">
                    {result.totalEarned} / {result.totalRequired} หน่วยกิต —{" "}
                    ต้องเก็บให้ครบตามหมวดที่ยังไม่ผ่านด้านล่าง
                  </p>
                </div>
              </>
            )}

            <div className="cc-conclusion-grid">
              {result.buckets.map((b) => {
                const isDone = b.earned >= b.required;
                const gap = Math.max(0, b.required - b.earned);
                return (
                  <div
                    key={b.key}
                    className={`cc-conclusion-item ${isDone ? "cc-concl-done" : "cc-concl-pending"}`}
                  >
                    <span className={`cc-concl-check ${isDone ? "cc-concl-check-done" : "cc-concl-check-pending"}`}>
                      {isDone ? "✓" : "—"}
                    </span>
                    <div className="cc-concl-body">
                      <span className="cc-concl-label">{b.label}</span>
                      <span className="cc-concl-cr mono">
                        {Math.min(b.earned, b.required)}/{b.required} นก.
                        {!isDone && gap > 0 && (
                          <span className="cc-concl-gap"> — ขาด {gap} นก.</span>
                        )}
                      </span>
                    </div>
                    {!isDone && b.validationWarnings.length > 0 && (
                      <div className="cc-concl-warnings">
                        {b.validationWarnings.map((w, i) => (
                          <span key={i} className="cc-concl-warn">⚠ {w}</span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="cc-conclusion-footer">
              <div className="cc-concl-stat">
                <span className="cc-concl-stat-num">{completedBuckets}/{result.buckets.length}</span>
                <span className="cc-concl-stat-label">หมวดที่ผ่านแล้ว</span>
              </div>
              <div className="cc-concl-stat">
                <span className="cc-concl-stat-num">{result.gpa !== null ? result.gpa.toFixed(2) : "—"}</span>
                <span className="cc-concl-stat-label">GPA</span>
              </div>
              <div className="cc-concl-stat">
                <span className={`cc-concl-stat-num cc-conf-text-${result.overallConfidence}`}>
                  {result.overallConfidence === "high" ? "สูง" : result.overallConfidence === "medium" ? "ปานกลาง" : "ต่ำ"}
                </span>
                <span className="cc-concl-stat-label">ความมั่นใจ</span>
              </div>
            </div>

            {done && (
              <p className="cc-concl-note">
                ข้อมูลนี้ใช้ประเมินเบื้องต้น — โปรดยืนยันกับอาจารย์ที่ปรึกษาก่อนยื่นขอจบ
              </p>
            )}
            {!done && (
              <p className="cc-concl-note">
                กลับไปหน้า <strong>สิ่งที่ต้องทำ</strong> เพื่อวางแผนวิชาที่ขาดเข้าตารางเรียน
                หรือไปหน้า <strong>ตารางเรียน</strong> เพื่อลากวิชาลงเทอม
              </p>
            )}
          </section>
        </div>
      )}

      {/* ── Step navigation (bottom) ──────────────── */}
      <div className="cc-wizard-actions" style={{ marginTop: "16px" }}>
        <button
          type="button"
          className="cc-wizard-back"
          onClick={() => setResultStep(Math.max(1, resultStep - 1))}
          disabled={resultStep === 1}
          style={resultStep === 1 ? { opacity: 0.35, cursor: "default" } : {}}
        >
          ← กลับ
        </button>
        <span className="cc-step-label mono" style={{ margin: 0 }}>
          หน้า {resultStep} / {totalResultSteps}
        </span>
        <button
          type="button"
          className="cc-wizard-next"
          onClick={() => setResultStep(Math.min(totalResultSteps, resultStep + 1))}
          disabled={resultStep === totalResultSteps}
          style={resultStep === totalResultSteps ? { opacity: 0.35, cursor: "default" } : {}}
        >
          ถัดไป →
        </button>
      </div>
    </>
  );
}

function SemesterCourseRow({
  course,
  onEdit,
  onDelete,
}: {
  course: ParsedCourse;
  onEdit: () => void;
  onDelete?: () => void;
}) {
  const meta = STATUS_META[course.status];
  const primaryName = course.course?.en || course.customName || course.course?.th || "Course";
  const secondaryName = course.course?.th || course.customName || "วิชาเลือก / วิชาโท";

  return (
    <div
      className={`cc-semester-row ${course.isPredicted ? "predicted" : ""}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", course.code);
        e.dataTransfer.effectAllowed = "move";
        e.currentTarget.classList.add("cc-dragging");
      }}
      onDragEnd={(e) => {
        e.currentTarget.classList.remove("cc-dragging");
      }}
    >
      <button type="button" className="cc-course-code mono" onClick={onEdit}>
        {course.code}
      </button>
      <button type="button" className="cc-course-title" onClick={onEdit}>
        <span>{primaryName}</span>
        <small>{secondaryName}</small>
      </button>
      <span className="cc-course-credit mono">{course.cr}</span>
      <span className={`cc-course-status ${meta.cls}`}>
        {course.isPredicted ? "แผน" : course.grade || meta.label}
      </span>
      {onDelete && (
        <button
          type="button"
          className="cc-course-remove"
          onClick={onDelete}
          title="ลบวิชานี้ออกจากแผน"
        >
          ลบ
        </button>
      )}
    </div>
  );
}

function ToDoList({
  result,
  nextTerm,
  plannedCodeSet,
  onPlanCourse,
}: {
  result: AuditResult;
  nextTerm: string;
  plannedCodeSet: Set<string>;
  onPlanCourse: (course: Course, term: string) => void;
}) {
  const items: {
    label: string;
    detail: string;
    gap: number;
    missingCourses: Course[];
    note?: string;
  }[] = [];

  for (const b of result.buckets) {
    if (b.earned >= b.required) continue;
    const gap = b.required - b.earned;
    if (b.missingCourses.length > 0) {
      items.push({
        label: b.label,
        detail: `ลงอีก ${b.missingCourses.length} วิชา (${gap} นก.)`,
        gap,
        missingCourses: b.missingCourses,
        note: b.note,
      });
    } else {
      items.push({
        label: b.label,
        detail: `เลือกเรียนอีก ${gap} หน่วยกิต${b.note ? " — " + b.note : ""}`,
        gap,
        missingCourses: [],
        note: b.note,
      });
    }
  }

  return (
    <section className="cc-todo glass-liquid">
      <p className="cc-step-label mono">สิ่งที่ต้องลงเรียนเพิ่ม</p>
      <h3 className="serif cc-panel-title">
        {items.length === 0 ? "ไม่มีรายการค้าง" : "เลือกวิชาลงแผนได้ทันที"}
      </h3>
      <p className="cc-hint">
        ปุ่มวางแผนจะเพิ่มวิชาบังคับที่ขาดไปยังเทอม {nextTerm} และนับในเครดิตคาดการณ์
      </p>

      {items.length === 0 ? (
        <div className="cc-empty-state">
          <span className="cc-empty-mark mono">OK</span>
          <span>หลักสูตรครบตามเงื่อนไขที่เลือกแล้ว</span>
        </div>
      ) : (
        <ol className="cc-todo-list">
          {items.map((it) => (
            <li key={it.label}>
              <div className="cc-todo-main">
                <span className="cc-todo-bucket">{it.label}</span>
                <span className="cc-todo-detail">{it.detail}</span>
                {it.note && <span className="cc-todo-note">{it.note}</span>}
              </div>

              {it.missingCourses.length > 0 && (
                <div className="cc-todo-actions">
                  {it.missingCourses.slice(0, 8).map((course) => {
                    const planned = plannedCodeSet.has(course.code);
                    return (
                      <button
                        key={course.code}
                        type="button"
                        className="cc-plan-missing"
                        onClick={() => onPlanCourse(course, nextTerm)}
                        disabled={planned}
                        title={`${course.th} (${course.cr} นก.)`}
                      >
                        {planned ? "อยู่ในแผน" : `วางแผน ${course.code}`}
                      </button>
                    );
                  })}
                  {it.missingCourses.length > 8 && (
                    <span className="cc-more-missing mono">
                      +{it.missingCourses.length - 8}
                    </span>
                  )}
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function CourseModal({
  course,
  defaultTerm,
  termsList,
  onSave,
  onClose,
  onDelete,
}: {
  course: ParsedCourse | null;
  defaultTerm: string;
  termsList: string[];
  onSave: (course: ParsedCourse) => void;
  onClose: () => void;
  onDelete?: () => void;
}) {
  const isEdit = !!course;
  const [code, setCode] = useState(course?.code || "");
  const [name, setName] = useState(course?.customName || course?.course?.th || "");
  const [cr, setCr] = useState(course?.cr || 3);
  const [term, setTerm] = useState(course?.term || defaultTerm || "1/2568");
  const [status, setStatus] = useState<Status>(course?.status || "inprogress");
  const [grade, setGrade] = useState(course?.grade || "");
  const [bucket, setBucket] = useState<Bucket | "auto">(course?.bucketOverride || "auto");

  const [customTermMode, setCustomTermMode] = useState(false);
  const [customTerm, setCustomTerm] = useState("");

  const [foundInfo, setFoundInfo] = useState<string | null>(null);

  // Auto-complete course name & credits if code is 6 digits and matches COURSES
  useEffect(() => {
    if (code.length === 6) {
      const matched = COURSES[code];
      if (matched) {
        setName(matched.th);
        setCr(matched.cr);
        setFoundInfo(`พบข้อมูล: ${matched.th} (${BUCKET_ABBR[matched.bucket] || matched.bucket})`);
        if (bucket === "auto" && !course) {
          setBucket("auto");
        }
      } else {
        setFoundInfo("ไม่พบรหัสวิชานี้ในหลักสูตรแกนกลาง (คุณสามารถระบุข้อมูลวิชาเองได้)");
      }
    } else {
      setFoundInfo(null);
    }
  }, [code]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      alert("รหัสวิชาต้องเป็นตัวเลข 6 หลัก");
      return;
    }
    const matched = COURSES[code];
    const newCourse: ParsedCourse = {
      code,
      cr: Number(cr),
      grade: status === "passed" ? grade : "",
      status,
      term,
      course: matched,
      customName: name || (matched ? matched.th : "วิชาเลือกเสรี"),
      bucketOverride: bucket === "auto" ? undefined : bucket,
      isPredicted: course ? course.isPredicted : true,
    };
    onSave(newCourse);
  };

  return (
    <div className="cc-modal-backdrop" onClick={onClose}>
      <div className="cc-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="serif" style={{ fontSize: "1.3rem", margin: "0 0 4px", color: "var(--ink)" }}>
          {isEdit ? "แก้ไขข้อมูลรายวิชา" : "เพิ่มวิชาสำหรับวางแผน (ทำนาย)"}
        </h3>
        <p style={{ fontSize: "0.82rem", color: "var(--ink-mute)", margin: "0 0 10px" }}>
          {isEdit ? "แก้ไขเกรด, หมวดหมู่ หรือเทอมของรายวิชานี้" : "เพิ่มวิชาที่คาดว่าจะลงเรียนในอนาคตเพื่อวิเคราะห์หลักสูตรล่วงหน้า"}
        </p>
        
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Course Code */}
          <div className="cc-form-group">
            <label className="cc-form-label">รหัสวิชา (6 หลัก)</label>
            <input
              type="text"
              required
              maxLength={6}
              className="cc-form-input mono"
              placeholder="เช่น 204456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              disabled={isEdit && !course.isPredicted}
            />
            {foundInfo && (
              <span style={{ fontSize: "0.78rem", color: code.length === 6 && COURSES[code] ? "#2f7a4d" : "var(--ink-soft)", fontStyle: "italic", marginTop: "2px" }}>
                {foundInfo}
              </span>
            )}
          </div>

          {/* Course Name */}
          <div className="cc-form-group">
            <label className="cc-form-label">ชื่อวิชา (ภาษาไทย หรือ อังกฤษ)</label>
            <input
              type="text"
              className="cc-form-input"
              placeholder="ระบุชื่อวิชา"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isEdit && !course.isPredicted}
            />
          </div>

          {/* Credits */}
          <div className="cc-form-group">
            <label className="cc-form-label">หน่วยกิต</label>
            <input
              type="number"
              required
              min={1}
              max={15}
              className="cc-form-input mono"
              value={cr}
              onChange={(e) => setCr(Number(e.target.value))}
              disabled={isEdit && !course.isPredicted}
            />
          </div>

          {/* Term */}
          <div className="cc-form-group">
            <label className="cc-form-label">ภาคการศึกษา (Term)</label>
            {!customTermMode ? (
              <select
                className="cc-form-select"
                value={term}
                onChange={(e) => {
                  if (e.target.value === "__custom__") {
                    setCustomTermMode(true);
                  } else {
                    setTerm(e.target.value);
                  }
                }}
              >
                {termsList.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
                <option value="__custom__">+ เพิ่มเทอมใหม่...</option>
              </select>
            ) : (
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  className="cc-form-input"
                  style={{ flexGrow: 1 }}
                  placeholder="ระบุ เช่น 1/2569"
                  value={customTerm}
                  onChange={(e) => setCustomTerm(e.target.value)}
                  autoFocus
                />
                <button
                  type="button"
                  className="cc-btn cc-btn-sec"
                  style={{ padding: "8px 16px", fontSize: "0.85rem" }}
                  onClick={() => {
                    if (customTerm.trim()) {
                      setTerm(customTerm.trim());
                      setCustomTermMode(false);
                    } else {
                      setCustomTermMode(false);
                    }
                  }}
                >
                  ตกลง
                </button>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="cc-form-group">
            <label className="cc-form-label">สถานะการเรียน</label>
            <select
              className="cc-form-select"
              value={status}
              onChange={(e) => {
                const s = e.target.value as Status;
                setStatus(s);
                if (s === "inprogress") {
                  setGrade("");
                } else if (s === "passed" && !grade) {
                  setGrade("A");
                }
              }}
            >
              <option value="inprogress">วางแผนการเรียน / กำลังเรียน (In Progress)</option>
              <option value="passed">ผ่านแล้ว (Passed)</option>
              <option value="failed">ไม่ผ่าน (Failed - F/U)</option>
              <option value="withdrawn">ถอนวิชา (Withdrawn - W)</option>
            </select>
          </div>

          {/* Grade (only if passed) */}
          {status === "passed" && (
            <div className="cc-form-group">
              <label className="cc-form-label">ผลการเรียน (Grade)</label>
              <select
                className="cc-form-select"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              >
                <option value="A">A</option>
                <option value="B+">B+</option>
                <option value="B">B</option>
                <option value="C+">C+</option>
                <option value="C">C</option>
                <option value="D+">D+</option>
                <option value="D">D</option>
                <option value="S">S (Satisfactory)</option>
                <option value="P">P (Pass)</option>
              </select>
            </div>
          )}

          {/* Bucket Override */}
          <div className="cc-form-group">
            <label className="cc-form-label">หมวดหมู่ของวิชา (จัดกลุ่ม)</label>
            <select
              className="cc-form-select"
              value={bucket}
              onChange={(e) => setBucket(e.target.value as Bucket | "auto")}
            >
              <option value="auto">อัตโนมัติ (ตามหลักสูตร)</option>
              <option value="ge_req">ศึกษาทั่วไป - บังคับ (GE Req)</option>
              <option value="ge_elec">ศึกษาทั่วไป - เลือก (GE Elec)</option>
              <option value="core">วิชาแกน (Core Course)</option>
              <option value="major_req">วิชาเอกบังคับ (Major Req)</option>
              <option value="major_elec">วิชาเอกเลือก (Major Elec)</option>
              <option value="capstone_coop">หมวดสหกิจศึกษา (Co-op)</option>
              <option value="capstone_is">หมวดค้นคว้าอิสระ (IS)</option>
              <option value="minor">วิชาโท (Minor)</option>
              <option value="free">วิชาเลือกเสรี (Free Elective)</option>
            </select>
          </div>

          {/* Modal Actions */}
          <div className="cc-modal-actions" style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
            {onDelete && (
              <button
                type="button"
                className="cc-btn cc-btn-danger"
                style={{ marginRight: "auto" }}
                onClick={onDelete}
              >
                ลบวิชา
              </button>
            )}
            <button
              type="button"
              className="cc-btn cc-btn-sec"
              onClick={onClose}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="cc-btn cc-btn-prim"
            >
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
