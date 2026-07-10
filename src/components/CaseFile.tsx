import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsomorphicLayoutEffect } from "../lib/useIsomorphicLayoutEffect";
import type { CaseStudy } from "../lib/portfolioContent";

gsap.registerPlugin(ScrollTrigger);

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const norm = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

// Phase map (fractions of the pinned scroll runway)
const PH = {
  meta: [0.0, 0.14] as const,
  frame: [0.03, 0.16] as const,
  blocks: [0.13, 0.34] as const,
  scan: [0.38, 0.78] as const,
  stamp: 0.82,
};

interface CaseFileProps {
  study: CaseStudy;
  runwayVH?: number;
}

/** Stylized dashboard wireframe (Village Security). */
function DashboardWire() {
  return (
    <div className="wire wire-dash" aria-hidden="true">
      <div className="wd-side">
        <div className="wd-logo" data-wire="0" />
        <div className="wd-nav is-active" data-wire="1" />
        <div className="wd-nav" data-wire="2" />
        <div className="wd-nav" data-wire="3" />
        <div className="wd-nav" data-wire="4" />
      </div>
      <div className="wd-main">
        <div className="wd-head" data-wire="5">
          <span className="wd-head-title" />
          <span className="wd-badge">pending · 3</span>
        </div>
        <div className="wd-stats">
          <div className="wd-stat" data-wire="6" />
          <div className="wd-stat" data-wire="7" />
          <div className="wd-stat" data-wire="8" />
        </div>
        <div className="wd-table">
          <div className="wd-thead" data-wire="9" />
          {[10, 11, 12, 13].map((order, i) => (
            <div className="wd-row" data-wire={order} key={order}>
              <span className="wd-cell wd-cell--name" />
              <span className="wd-cell wd-cell--house" />
              <span className="wd-cell wd-cell--time" />
              <span
                className={`wd-pill ${i % 2 === 0 ? "wd-pill--in" : "wd-pill--out"}`}
              >
                {i % 2 === 0 ? "in" : "out"}
              </span>
            </div>
          ))}
        </div>
        <div className="wd-toast" data-wire="14">
          <span className="wd-toast-dot" />
          <span className="wd-toast-text">visitor checked in — house 42</span>
        </div>
      </div>
    </div>
  );
}

interface ArchNode {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  order: number;
  dashed?: boolean;
}

const ARCH_NODES: ArchNode[] = [
  { x: 4, y: 24, w: 13, h: 14, label: "client", order: 0 },
  { x: 24, y: 24, w: 14, h: 14, label: "caddy · tls", order: 2 },
  { x: 45, y: 24, w: 14, h: 14, label: "api", order: 4 },
  { x: 45, y: 56, w: 14, h: 14, label: "rabbitmq", order: 6 },
  { x: 66, y: 56, w: 15, h: 14, label: "ai worker", order: 8 },
  { x: 66, y: 8, w: 15, h: 13, label: "openai", order: 10 },
  { x: 86, y: 42, w: 12, h: 14, label: "pinecone", order: 12 },
  { x: 24, y: 56, w: 14, h: 14, label: "postgres", order: 14 },
  { x: 4, y: 56, w: 13, h: 14, label: "redis", order: 16 },
  { x: 45, y: 84, w: 36, h: 10, label: "prom · grafana · loki", order: 18, dashed: true },
];

const ARCH_EDGES: { d: string; order: number; dashed?: boolean }[] = [
  { d: "M17,31 L24,31", order: 1 },
  { d: "M38,31 L45,31", order: 3 },
  { d: "M52,38 L52,56", order: 5 },
  { d: "M59,63 L66,63", order: 7 },
  { d: "M73.5,56 L73.5,21", order: 9 },
  { d: "M81,60 L86,52", order: 11 },
  { d: "M46,38 L31,56", order: 13 },
  { d: "M24,63 L17,63", order: 15 },
  { d: "M63,84 L63,70", order: 17, dashed: true },
];

/** Stylized service-topology wireframe (SmartMath). */
function ArchitectureWire() {
  return (
    <div className="wire wire-arch" aria-hidden="true">
      <svg
        className="wa-edges"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {ARCH_EDGES.map((e) => (
          <path
            key={e.order}
            d={e.d}
            data-wire={e.order}
            data-edge="true"
            className={`wa-edge ${e.dashed ? "wa-edge--dashed" : ""}`}
            pathLength={1}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      {ARCH_NODES.map((n) => (
        <div
          key={n.order}
          className={`wa-node ${n.dashed ? "wa-node--dashed" : ""}`}
          data-wire={n.order}
          style={{
            left: `${n.x}%`,
            top: `${n.y}%`,
            width: `${n.w}%`,
            height: `${n.h}%`,
          }}
        >
          <span className="wa-label">{n.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function CaseFile({ study, runwayVH = 380 }: CaseFileProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const scanlineRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const stampRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const frame = frameRef.current;
    const body = bodyRef.current;
    if (!section || !frame || !body) return;

    const metaItems = Array.from(
      section.querySelectorAll<HTMLElement>("[data-cf-meta]"),
    );
    const wires = Array.from(
      section.querySelectorAll<SVGPathElement | HTMLElement>("[data-wire]"),
    ).sort(
      (a, b) => Number(a.dataset.wire ?? 0) - Number(b.dataset.wire ?? 0),
    );
    const pins = Array.from(
      section.querySelectorAll<HTMLElement>("[data-cf-pin]"),
    );
    const notes = Array.from(
      section.querySelectorAll<HTMLElement>("[data-cf-note]"),
    );

    let lastPct = -1;

    const apply = (p: number) => {
      // ── Meta column: staggered rise
      const metaT = norm(p, PH.meta[0], PH.meta[1]);
      metaItems.forEach((el, i) => {
        const local = easeOutCubic(
          clamp01((metaT - i * 0.09) / (1 - i * 0.09 * 0.6)),
        );
        el.style.opacity = String(local);
        el.style.transform = `translate3d(0, ${(1 - local) * 26}px, 0)`;
      });

      // ── Frame wipes open downward
      const frameT = easeOutCubic(norm(p, PH.frame[0], PH.frame[1]));
      frame.style.clipPath = `inset(0 0 ${(1 - frameT) * 100}% 0 round 16px)`;
      frame.style.transform = `translate3d(0, ${(1 - frameT) * 34}px, 0)`;
      frame.style.opacity = String(Math.min(1, frameT * 1.6));

      // ── Wireframe assembles block by block
      const blocksT = norm(p, PH.blocks[0], PH.blocks[1]);
      const n = wires.length;
      const dur = 0.38;
      wires.forEach((el, i) => {
        const start = n > 1 ? (i / (n - 1)) * (1 - dur) : 0;
        const local = easeOutCubic(clamp01((blocksT - start) / dur));
        if (el instanceof SVGPathElement) {
          if (el.classList.contains("wa-edge--dashed")) {
            // Dashed edges keep their dash pattern; fade them in instead.
            el.style.opacity = String(local);
          } else {
            el.style.strokeDasharray = "1";
            el.style.strokeDashoffset = String(1 - local);
            el.style.opacity = local > 0 ? "1" : "0";
          }
        } else {
          el.style.opacity = String(local);
          el.style.transform = `translate3d(0, ${(1 - local) * 12}px, 0) scale(${0.94 + local * 0.06})`;
        }
      });

      // ── Scan sweep
      const scanT = norm(p, PH.scan[0], PH.scan[1]);
      const bodyH = body.clientHeight;
      if (scanlineRef.current) {
        scanlineRef.current.style.transform = `translate3d(0, ${scanT * bodyH}px, 0)`;
        scanlineRef.current.style.opacity =
          scanT > 0 && scanT < 1 ? "1" : "0";
      }
      if (veilRef.current) {
        veilRef.current.style.transform = `scaleY(${scanT})`;
      }
      const pct = Math.round(scanT * 100);
      if (readoutRef.current && pct !== lastPct) {
        lastPct = pct;
        readoutRef.current.textContent = `scan ▸ ${String(pct).padStart(3, "0")}%`;
        readoutRef.current.classList.toggle("is-done", pct >= 100);
      }

      // ── Pins pop as the scanline passes their y; notes follow
      const scanY = scanT * 100;
      let lastOn = -1;
      pins.forEach((pin, i) => {
        const on = scanT > 0 && scanY >= Number(pin.dataset.cfPin);
        pin.classList.toggle("is-on", on);
        notes[i]?.classList.toggle("is-on", on);
        if (on) lastOn = i;
      });
      // Mobile accordion: only the newest note expands its body text
      notes.forEach((note, i) => {
        note.classList.toggle("is-open", i === lastOn);
      });

      // ── Verdict stamp
      stampRef.current?.classList.toggle("is-on", p >= PH.stamp);
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      section.classList.add("cf-static");
      apply(1);
      if (scanlineRef.current) scanlineRef.current.style.opacity = "0";
      return;
    }

    apply(0);

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.45,
      onUpdate(self) {
        apply(self.progress);
      },
    });

    return () => st.kill();
  }, [study.id]);

  return (
    <section
      ref={sectionRef}
      className="case-file"
      style={{ height: `${runwayVH}vh` }}
      aria-label={`Case file — ${study.title}`}
    >
      <div className="cf-pin">
        <div className="cf-grid wrap">
          <div className="cf-stage">
            <div ref={frameRef} className="cf-frame">
              <div className="cf-chrome">
                <span className="cf-dots" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="cf-addr">
                  <svg
                    viewBox="0 0 10 12"
                    className="cf-lock"
                    aria-hidden="true"
                  >
                    <rect x="1" y="5" width="8" height="6" rx="1.2" />
                    <path
                      d="M3 5V3.5a2 2 0 1 1 4 0V5"
                      fill="none"
                      strokeWidth="1.4"
                    />
                  </svg>
                  {study.frameLabel}
                </span>
                <span ref={readoutRef} className="cf-readout">
                  scan ▸ 000%
                </span>
              </div>

              <div ref={bodyRef} className="cf-body">
                {study.visual === "dashboard" ? (
                  <DashboardWire />
                ) : (
                  <ArchitectureWire />
                )}

                <div
                  ref={veilRef}
                  className="cf-scan-veil"
                  aria-hidden="true"
                />
                <div
                  ref={scanlineRef}
                  className="cf-scanline"
                  aria-hidden="true"
                />

                {study.pins.map((pin, i) => (
                  <div
                    key={pin.chip}
                    className={`cf-pin-dot cf-pin-dot--${pin.kind} cf-pin-dot--${pin.side}`}
                    data-cf-pin={pin.y}
                    style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                    aria-hidden="true"
                  >
                    <span className="cf-pin-core">
                      <b>{i + 1}</b>
                    </span>
                    <span className="cf-pin-chip">{pin.chip}</span>
                  </div>
                ))}
              </div>

              <div ref={stampRef} className="cf-stamp" aria-hidden="true">
                <span>{study.stamp}</span>
              </div>
            </div>
          </div>

          <div className="cf-side">
            <header className="cf-meta">
              <div className="cf-eyebrow mono" data-cf-meta>
                Case file {study.number} — {study.year}
              </div>
              <h3 className="cf-title" data-cf-meta>
                {study.title}
              </h3>
              <p className="cf-role" data-cf-meta>
                {study.role}
                <span className="cf-context"> · {study.context}</span>
              </p>
              <div className="cf-stack" data-cf-meta>
                {study.stack.map((item) => (
                  <span className="cf-chip" key={item}>
                    {item}
                  </span>
                ))}
              </div>
              <p className="cf-summary" data-cf-meta>
                {study.summary}
              </p>
            </header>

            <ol className="cf-notes">
              {study.pins.map((pin, i) => (
                <li
                  key={pin.chip}
                  className={`cf-note cf-note--${pin.kind}`}
                  data-cf-note
                >
                  <span className="cf-note-num mono">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="cf-note-body">
                    <span className="cf-note-label">
                      {pin.label}
                      <em className="cf-note-kind mono">
                        {pin.kind === "threat" ? "attack surface" : "defense"}
                      </em>
                    </span>
                    <p className="cf-note-text">{pin.note}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
