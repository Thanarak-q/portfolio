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
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export default function FocusFlow({
  items,
  sectionHeightVH = 520,
}: FocusFlowProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const stripViewportRef = useRef<HTMLDivElement>(null);
  const stripTrackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const intro = introRef.current;
    const detail = detailRef.current;
    const veil = veilRef.current;
    const stripViewport = stripViewportRef.current;
    const stripTrack = stripTrackRef.current;
    const fill = fillRef.current;
    const counter = counterRef.current;

    if (!section || !intro || !detail || !veil || !stripViewport || !stripTrack || !fill || !counter) return;

    const measure = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const mobile = vw <= 720;
      return {
        centeredX: vw * (mobile ? 0.06 : 0.26),
        centeredY: vh * (mobile ? 0.22 : 0.26),
        anchoredX: mobile ? 16 : 18,
        anchoredY: mobile ? 86 : 92,
        endScale: mobile ? 0.34 : 0.31,
        trackTravel: Math.max(0, stripTrack.scrollWidth - stripViewport.clientWidth),
      };
    };

    let m = measure();

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate(self) {
        // intro shrink-anchor
        const ip = easeOutCubic(clamp01((self.progress - 0.06) / 0.34));
        intro.style.transform = `translate3d(${mix(m.centeredX, m.anchoredX, ip)}px,${mix(m.centeredY, m.anchoredY, ip)}px,0) scale(${mix(1, m.endScale, ip)})`;
        intro.style.opacity = String(mix(1, 0.86, ip));

        // detail slide-in
        const dp = easeOutCubic(clamp01((self.progress - 0.26) / 0.26));
        detail.style.transform = `translate3d(${mix(100, 0, dp)}%,0,0) scale(${mix(0.985, 1, dp)})`;
        detail.style.opacity = String(clamp01((self.progress - 0.22) / 0.18));
        detail.style.filter = `blur(${mix(18, 0, dp)}px)`;

        // horizontal strip pan
        const sp = easeOutCubic(clamp01((self.progress - 0.46) / 0.34));
        stripTrack.style.transform = `translate3d(${-m.trackTravel * sp}px,0,0)`;

        // progress bar + counter
        fill.style.transform = `scaleX(${sp})`;
        counter.textContent = String(Math.min(items.length, Math.floor(sp * items.length) + 1)).padStart(2, "0");

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

        {/* anchored intro */}
        <div ref={introRef} className="focus-flow-intro">
          <div className="eyebrow">Up next</div>
          <h2 className="focus-flow-title">
            Focus —<br />
            <em>three rooms,</em>
            <br />
            <em>and a fourth.</em>
          </h2>
          <p className="focus-flow-caption">
            Red Team. AI Security. Cloud &amp; App. Field Notes.
          </p>
        </div>

        {/* detail panel */}
        <div ref={detailRef} className="focus-flow-detail-shell">
          <div className="focus-flow-detail">

            {/* header */}
            <div className="focus-flow-detail-head">
              <div className="eyebrow">02 — Focus</div>
              <h3 className="focus-flow-detail-title">
                Three rooms I keep returning to,
                <span> and a fourth I share aloud.</span>
              </h3>
            </div>

            {/* card strip */}
            <div ref={stripViewportRef} className="focus-flow-strip-viewport">
              <div ref={stripTrackRef} className="focus-flow-strip-track">
                {items.map((item, i) => (
                  <article key={item.number} className="focus-flow-card glass-liquid">
                    {/* large ghost index */}
                    <div className="ffc-ghost" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </div>

                    {/* top meta */}
                    <div className="ffc-meta">
                      <span className="ffc-num">{item.number}</span>
                      <span className="ffc-sep" aria-hidden="true" />
                      <span className="ffc-room">Room {String(i + 1).padStart(2, "0")}</span>
                    </div>

                    {/* title block */}
                    <div className="ffc-title-block">
                      <h4 className="ffc-title">{item.title}</h4>
                      <h4 className="ffc-title ffc-title-italic">{item.titleItalic}</h4>
                    </div>

                    {/* body */}
                    <p className="ffc-desc">{item.description}</p>

                    {/* tags */}
                    <div className="ffc-tags">
                      {item.tags.map((tag) => (
                        <span key={tag} className="ffc-tag">{tag}</span>
                      ))}
                    </div>

                    {/* foot */}
                    <div className="ffc-foot">
                      <span className="ffc-foot-rule" aria-hidden="true" />
                      <a className="ffc-foot-cta" href="#focus" tabIndex={-1}>
                        Open room <span aria-hidden="true">↗</span>
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* progress row */}
            <div className="focus-flow-rail">
              <span className="focus-flow-counter">
                <span ref={counterRef}>01</span>
                <span className="ffc-sep-slash">/</span>
                <span className="focus-flow-counter-total">{String(items.length).padStart(2, "0")}</span>
              </span>
              <div className="focus-flow-track">
                <div ref={fillRef} className="focus-flow-fill" />
              </div>
              <span className="focus-flow-hint">Scroll · Linger</span>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
