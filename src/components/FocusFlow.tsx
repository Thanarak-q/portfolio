import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsomorphicLayoutEffect } from "../lib/useIsomorphicLayoutEffect";
import type { FocusItem } from "../lib/portfolioContent";

gsap.registerPlugin(ScrollTrigger);

interface FocusFlowProps {
  items: FocusItem[];
  sectionHeightVH?: number;
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const easeOut3 = (t: number) => 1 - Math.pow(1 - t, 3);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// Visual art type per card slot (wide cards only, evens)
const visualTypes = ["target", "stack", "scope", "lens"];

// Wide on even indices, narrow on odd
const isWide = (i: number) => i % 2 === 0;

export default function FocusFlow({ items, sectionHeightVH = 520 }: FocusFlowProps) {
  const sectionRef   = useRef<HTMLElement>(null);
  const introRef     = useRef<HTMLDivElement>(null);
  const detailRef    = useRef<HTMLDivElement>(null);
  const veilRef      = useRef<HTMLDivElement>(null);
  const viewportRef  = useRef<HTMLDivElement>(null);
  const trackRef     = useRef<HTMLDivElement>(null);
  const fillRef      = useRef<HTMLDivElement>(null);
  const counterRef   = useRef<HTMLSpanElement>(null);
  const navDotsRef   = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const section  = sectionRef.current;
    const intro    = introRef.current;
    const detail   = detailRef.current;
    const veil     = veilRef.current;
    const viewport = viewportRef.current;
    const track    = trackRef.current;
    const fill     = fillRef.current;
    const counter  = counterRef.current;
    const navDots  = navDotsRef.current;

    if (!section || !intro || !detail || !veil || !viewport || !track || !fill || !counter) return;

    const measure = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const mob = vw <= 720;
      return {
        cx: vw * (mob ? 0.06 : 0.26),
        cy: vh * (mob ? 0.22 : 0.26),
        ax: mob ? 16 : 18,
        ay: mob ? 86 : 92,
        es: mob ? 0.34 : 0.31,
        travel: Math.max(0, track.scrollWidth - viewport.clientWidth),
      };
    };

    let m = measure();
    const dots = navDots ? Array.from(navDots.querySelectorAll<HTMLElement>(".ffd-dot")) : [];

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate(self) {
        // intro anchor
        const ip = easeOut3(clamp01((self.progress - 0.06) / 0.34));
        intro.style.transform = `translate3d(${mix(m.cx, m.ax, ip)}px,${mix(m.cy, m.ay, ip)}px,0) scale(${mix(1, m.es, ip)})`;
        intro.style.opacity = String(mix(1, 0.86, ip));

        // detail slide-in
        const dp = easeOut3(clamp01((self.progress - 0.26) / 0.26));
        detail.style.transform = `translate3d(${mix(100, 0, dp)}%,0,0) scale(${mix(0.985, 1, dp)})`;
        detail.style.opacity   = String(clamp01((self.progress - 0.22) / 0.18));
        detail.style.filter    = `blur(${mix(18, 0, dp)}px)`;

        // horizontal pan
        const sp = easeOut3(clamp01((self.progress - 0.46) / 0.34));
        track.style.transform = `translate3d(${-m.travel * sp}px,0,0)`;

        // progress + counter
        fill.style.transform = `scaleX(${sp})`;
        const active = Math.min(items.length, Math.floor(sp * items.length) + 1);
        counter.textContent = String(active).padStart(2, "0");

        // light up sidebar dots
        dots.forEach((dot, i) => {
          dot.classList.toggle("ffd-dot--on", i < active);
        });

        veil.style.opacity = String(mix(0, 1, clamp01((self.progress - 0.18) / 0.26)));
      },
      onRefresh() { m = measure(); },
    });

    const onResize = () => trigger.refresh();
    window.addEventListener("resize", onResize, { passive: true });
    return () => { trigger.kill(); window.removeEventListener("resize", onResize); };
  }, [items.length]);

  return (
    <section
      id="focus"
      ref={sectionRef}
      className="focus-flow"
      style={{ height: `${sectionHeightVH}vh` }}
    >
      <div className="focus-flow-sticky">
        <div ref={veilRef} className="focus-flow-veil" aria-hidden="true" />

        {/* anchored intro block */}
        <div ref={introRef} className="focus-flow-intro">
          <div className="eyebrow">Up next</div>
          <h2 className="focus-flow-title">
            Focus —<br />
            <em>three rooms,</em><br />
            <em>and a fourth.</em>
          </h2>
          <p className="focus-flow-caption">
            Red Team. AI Security. Cloud &amp; App. Field Notes.
          </p>
        </div>

        {/* full detail panel */}
        <div ref={detailRef} className="focus-flow-detail-shell">
          <div className="focus-flow-detail">

            {/* ── LEFT SIDEBAR ── */}
            <aside className="ffd-sidebar">
              <div className="ffd-sidebar-badge glass-liquid" aria-hidden="true">
                <span className="ffd-badge-label">FOCUS</span>
                <span className="ffd-badge-sub">02</span>
              </div>

              <div ref={navDotsRef} className="ffd-sidebar-nav" aria-hidden="true">
                {items.map((_, i) => (
                  <span key={i} className="ffd-dot" title={`Room ${i + 1}`} />
                ))}
              </div>

              <div className="ffd-sidebar-foot">
                <span className="ffd-sidebar-index">ROOMS</span>
              </div>
            </aside>

            {/* ── RIGHT CONTENT ── */}
            <div className="ffd-right">

              {/* header */}
              <div className="ffd-head">
                <div className="eyebrow">02 — Focus</div>
                <h3 className="ffd-title">
                  Three rooms I keep returning to,
                  <span> and a fourth I share aloud.</span>
                </h3>
              </div>

              {/* bento card strip */}
              <div ref={viewportRef} className="ffd-viewport">
                <div ref={trackRef} className="ffd-track">
                  {items.map((item, i) => {
                    const wide = isWide(i);
                    const vtype = wide ? visualTypes[Math.floor(i / 2) % visualTypes.length] : null;
                    return (
                      <article
                        key={item.number}
                        className={`ffc glass-liquid${wide ? " ffc--wide" : " ffc--narrow"}`}
                      >
                        {/* visual art zone — wide cards only */}
                        {vtype && (
                          <div className={`ffc-visual ffc-visual--${vtype}`} aria-hidden="true">
                            <VisualArt type={vtype} />
                          </div>
                        )}

                        {/* ghost number */}
                        <div className="ffc-ghost" aria-hidden="true">
                          {String(i + 1).padStart(2, "0")}
                        </div>

                        <div className="ffc-inner">
                          {/* meta */}
                          <div className="ffc-meta">
                            <span className="ffc-num">{item.number}</span>
                            <span className="ffc-dash" aria-hidden="true" />
                            <span className="ffc-room">Room {String(i + 1).padStart(2, "0")}</span>
                          </div>

                          {/* title */}
                          <div className="ffc-titles">
                            <h4 className="ffc-title">{item.title}</h4>
                            <h4 className="ffc-title ffc-italic">{item.titleItalic}</h4>
                          </div>

                          {/* desc */}
                          <p className="ffc-desc">{item.description}</p>

                          {/* tags */}
                          <div className="ffc-tags">
                            {item.tags.map((tag) => (
                              <span key={tag} className="ffc-tag">{tag}</span>
                            ))}
                          </div>

                          {/* foot */}
                          <div className="ffc-foot">
                            <span className="ffc-foot-line" aria-hidden="true" />
                            <span className="ffc-foot-cta">Open room ↗</span>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>

              {/* progress rail */}
              <div className="ffd-rail">
                <span className="ffd-counter">
                  <span ref={counterRef}>01</span>
                  <span className="ffd-slash">/</span>
                  <span className="ffd-total">{String(items.length).padStart(2, "0")}</span>
                </span>
                <div className="ffd-bar">
                  <div ref={fillRef} className="ffd-bar-fill" />
                </div>
                <span className="ffd-hint">Scroll · Linger</span>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Pure-CSS visual art components ── */
function VisualArt({ type }: { type: string }) {
  if (type === "target") return (
    <div className="va va-target">
      <div className="va-ring va-ring--lg" />
      <div className="va-ring va-ring--md" />
      <div className="va-ring va-ring--sm" />
      <div className="va-dot" />
      <div className="va-cross va-cross--h" />
      <div className="va-cross va-cross--v" />
    </div>
  );
  if (type === "stack") return (
    <div className="va va-stack">
      <div className="va-layer va-layer--3" />
      <div className="va-layer va-layer--2" />
      <div className="va-layer va-layer--1" />
    </div>
  );
  if (type === "scope") return (
    <div className="va va-scope">
      <div className="va-scope-ring" />
      <div className="va-scope-h" />
      <div className="va-scope-v" />
      <div className="va-scope-dot" />
      <div className="va-bracket va-bracket--tl" />
      <div className="va-bracket va-bracket--tr" />
      <div className="va-bracket va-bracket--bl" />
      <div className="va-bracket va-bracket--br" />
    </div>
  );
  if (type === "lens") return (
    <div className="va va-lens">
      <div className="va-lens-outer" />
      <div className="va-lens-inner" />
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <div key={deg} className="va-blade" style={{ "--deg": `${deg}deg` } as React.CSSProperties} />
      ))}
      <div className="va-lens-dot" />
    </div>
  );
  return null;
}
