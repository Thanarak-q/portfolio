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
const easeOut4 = (t: number) => 1 - Math.pow(1 - t, 4);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

const visualTypes = ["target", "stack", "scope", "lens"];
const isWide = (i: number) => i % 2 === 0;

export default function FocusFlow({ items, sectionHeightVH = 500 }: FocusFlowProps) {
  const sectionRef     = useRef<HTMLElement>(null);
  const introRef       = useRef<HTMLDivElement>(null);
  const eyebrowARef    = useRef<HTMLSpanElement>(null);
  const eyebrowBRef    = useRef<HTMLSpanElement>(null);
  const headRef        = useRef<HTMLDivElement>(null);
  const headLine1Ref   = useRef<HTMLSpanElement>(null);
  const headLine2Ref   = useRef<HTMLSpanElement>(null);
  const detailRef      = useRef<HTMLDivElement>(null);
  const viewportRef    = useRef<HTMLDivElement>(null);
  const trackRef       = useRef<HTMLDivElement>(null);
  const fillRef        = useRef<HTMLDivElement>(null);
  const counterRef     = useRef<HTMLSpanElement>(null);

  useIsomorphicLayoutEffect(() => {
    const section  = sectionRef.current;
    const intro    = introRef.current;
    const eyeA     = eyebrowARef.current;
    const eyeB     = eyebrowBRef.current;
    const head     = headRef.current;
    const line1    = headLine1Ref.current;
    const line2    = headLine2Ref.current;
    const detail   = detailRef.current;
    const viewport = viewportRef.current;
    const track    = trackRef.current;
    const fill     = fillRef.current;
    const counter  = counterRef.current;

    if (!section || !intro || !eyeA || !eyeB || !head || !line1 || !line2 || !detail || !viewport || !track || !fill || !counter) return;

    const measure = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const mob = vw <= 720;
      return {
        cx: vw * (mob ? 0.06 : 0.26),
        cy: vh * (mob ? 0.22 : 0.26),
        ax: mob ? 16 : 280,
        ay: mob ? 24 : 32,
        es: mob ? 0.46 : 0.22,
        travel: Math.max(0, track.scrollWidth - viewport.clientWidth),
      };
    };

    let m = measure();

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.5,
      onUpdate(self) {
        const p = self.progress;

        // intro anchor (shrinks and travels to head eyebrow slot)
        const ip = easeOut3(clamp01((p - 0.04) / 0.32));
        intro.style.transform = `translate3d(${mix(m.cx, m.ax, ip)}px,${mix(m.cy, m.ay, ip)}px,0) scale(${mix(1, m.es, ip)})`;
        intro.style.opacity = "1";

        // eyebrow morph: UP NEXT → 02 — FOCUS
        const morph = clamp01((p - 0.16) / 0.10);
        eyeA.style.opacity = String(1 - morph);
        eyeB.style.opacity = String(morph);

        // detail panel slide-in
        const dp = easeOut3(clamp01((p - 0.24) / 0.18));
        detail.style.transform = `translate3d(${mix(100, 0, dp)}%, 0, 0)`;
        detail.style.opacity   = String(clamp01((p - 0.22) / 0.14));
        detail.style.filter    = `blur(${mix(14, 0, dp)}px)`;

        // head title reveal — clip-path wipe per line (no separate eyebrow now)
        head.style.opacity = String(clamp01((p - 0.18) / 0.06));

        const wipe1 = easeOut4(clamp01((p - 0.20) / 0.10));
        const wipe2 = easeOut4(clamp01((p - 0.26) / 0.10));
        line1.style.clipPath = `inset(0 ${mix(100, 0, wipe1)}% 0 0)`;
        line2.style.clipPath = `inset(0 ${mix(100, 0, wipe2)}% 0 0)`;

        // horizontal pan (extended range)
        const sp = easeOut3(clamp01((p - 0.42) / 0.54));
        track.style.transform = `translate3d(${-m.travel * sp}px, 0, 0)`;

        // counter + progress
        fill.style.transform = `scaleX(${sp})`;
        const active = Math.min(items.length, Math.max(1, Math.ceil(sp * items.length)));
        counter.textContent = String(active).padStart(2, "0");
      },
      onRefresh() { m = measure(); },
    });

    // refresh after layout settles (handles hydration timing)
    let rafId1 = 0, rafId2 = 0;
    rafId1 = requestAnimationFrame(() => {
      rafId2 = requestAnimationFrame(() => {
        m = measure();
        trigger.refresh();
      });
    });

    const onResize = () => trigger.refresh();
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      cancelAnimationFrame(rafId1);
      cancelAnimationFrame(rafId2);
      trigger.kill();
      window.removeEventListener("resize", onResize);
    };
  }, [items.length]);

  return (
    <section
      id="focus"
      ref={sectionRef}
      className="focus-flow"
      style={{ height: `${sectionHeightVH}vh` }}
    >
      <div className="focus-flow-sticky">

        {/* INTRO — morphing eyebrow (UP NEXT → 02 — FOCUS) */}
        <div ref={introRef} className="focus-flow-intro">
          <div className="eyebrow focus-flow-eyebrow">
            <span className="ffe-stack">
              <span ref={eyebrowARef} className="ffe-text ffe-a">Up next</span>
              <span ref={eyebrowBRef} className="ffe-text ffe-b">02 — Focus</span>
            </span>
          </div>
        </div>

        {/* HEAD — title only (eyebrow lives in intro now) */}
        <div ref={headRef} className="focus-flow-head-abs">
          <h3 className="focus-flow-head-title">
            <span ref={headLine1Ref} className="ffh-line">
              Three rooms I keep returning to,
            </span>
            {" "}
            <span ref={headLine2Ref} className="ffh-line ffh-line-italic">
              and a fourth I share aloud.
            </span>
          </h3>
        </div>

        {/* DETAIL — cards strip + bottom rail (no sidebar) */}
        <div ref={detailRef} className="focus-flow-detail-shell">
          <div className="focus-flow-detail">

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
                      {vtype && (
                        <div className={`ffc-visual ffc-visual--${vtype}`} aria-hidden="true">
                          <VisualArt type={vtype} />
                        </div>
                      )}

                      <div className="ffc-ghost" aria-hidden="true">
                        {String(i + 1).padStart(2, "0")}
                      </div>

                      <div className="ffc-inner">
                        <div className="ffc-meta">
                          <span className="ffc-num">{item.number}</span>
                          <span className="ffc-dash" aria-hidden="true" />
                          <span className="ffc-room">Room {String(i + 1).padStart(2, "0")}</span>
                        </div>

                        <div className="ffc-titles">
                          <h4 className="ffc-title">{item.title}</h4>
                          <h4 className="ffc-title ffc-italic">{item.titleItalic}</h4>
                        </div>

                        <p className="ffc-desc">{item.description}</p>

                        <div className="ffc-tags">
                          {item.tags.map((tag) => (
                            <span key={tag} className="ffc-tag">{tag}</span>
                          ))}
                        </div>

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
    </section>
  );
}

/* Pure-CSS visual arts (unchanged) */
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
