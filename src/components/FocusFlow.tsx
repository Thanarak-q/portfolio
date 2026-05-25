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

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const mix = (from: number, to: number, progress: number) =>
  from + (to - from) * progress;

const accentGlyphs = ["RT", "AI", "C&A", "FN", "TI", "CT", "PB", "CN"];

export default function FocusFlow({
  items,
  sectionHeightVH = 350,
}: FocusFlowProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const stripViewportRef = useRef<HTMLDivElement>(null);
  const stripTrackRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const intro = introRef.current;
    const detail = detailRef.current;
    const veil = veilRef.current;
    const stripViewport = stripViewportRef.current;
    const stripTrack = stripTrackRef.current;
    const counter = counterRef.current;
    const progress = progressRef.current;

    if (!section || !intro || !detail || !veil || !stripViewport || !stripTrack || !counter || !progress) return;

    const measure = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const isMobile = viewportWidth <= 720;
      const centeredX = viewportWidth * (isMobile ? 0.06 : 0.26);
      const centeredY = viewportHeight * (isMobile ? 0.22 : 0.26);
      const anchoredX = isMobile ? 16 : 18;
      const anchoredY = isMobile ? 86 : 92;
      const endScale = isMobile ? 0.34 : 0.31;

      return {
        centeredX,
        centeredY,
        anchoredX,
        anchoredY,
        endScale,
        trackTravel: Math.max(0, stripTrack.scrollWidth - stripViewport.clientWidth),
      };
    };

    let metrics = measure();

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate(self) {
        const introPhase = easeOutCubic(clamp01((self.progress - 0.06) / 0.34));
        const detailPhase = easeOutCubic(clamp01((self.progress - 0.26) / 0.26));
        const veilPhase = clamp01((self.progress - 0.18) / 0.26);

        const introX = mix(metrics.centeredX, metrics.anchoredX, introPhase);
        const introY = mix(metrics.centeredY, metrics.anchoredY, introPhase);
        const introScale = mix(1, metrics.endScale, introPhase);
        const introOpacity = mix(1, 0.86, introPhase);

        intro.style.transform = `translate3d(${introX}px, ${introY}px, 0) scale(${introScale})`;
        intro.style.opacity = String(introOpacity);

        const detailTranslate = mix(100, 0, detailPhase);
        const detailOpacity = clamp01((self.progress - 0.22) / 0.18);
        const detailBlur = mix(18, 0, detailPhase);
        const detailScale = mix(0.985, 1, detailPhase);

        detail.style.transform = `translate3d(${detailTranslate}%, 0, 0) scale(${detailScale})`;
        detail.style.opacity = String(detailOpacity);
        detail.style.filter = `blur(${detailBlur}px)`;

        const stripPhase = easeOutCubic(clamp01((self.progress - 0.46) / 0.34));
        const trackX = -metrics.trackTravel * stripPhase;
        stripTrack.style.transform = `translate3d(${trackX}px, 0, 0)`;

        progress.style.transform = `scaleX(${stripPhase})`;
        const active = Math.min(items.length, Math.floor(stripPhase * items.length) + 1);
        counter.textContent = String(active).padStart(2, "0");

        veil.style.opacity = String(mix(0, 1, veilPhase));
      },
      onRefresh() {
        metrics = measure();
      },
    });

    const handleResize = () => trigger.refresh();
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      trigger.kill();
      window.removeEventListener("resize", handleResize);
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
        <div ref={veilRef} className="focus-flow-veil" aria-hidden="true" />

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

        <div ref={detailRef} className="focus-flow-detail-shell">
          <div className="focus-flow-detail">
            <div className="focus-flow-detail-head">
              <div className="eyebrow">02 — Focus</div>
              <h3 className="focus-flow-detail-title">
                Three rooms I keep returning to,
                <span> and a fourth I share aloud.</span>
              </h3>
            </div>

            <div ref={stripViewportRef} className="focus-flow-strip-viewport">
              <div ref={stripTrackRef} className="focus-flow-strip-track">
                {items.map((item, index) => (
                  <article
                    key={item.number}
                    className="focus-flow-item"
                    style={{ "--card-i": index } as React.CSSProperties}
                  >
                    <div className="focus-flow-item-frame" aria-hidden="true">
                      <span className="corner tl" />
                      <span className="corner tr" />
                      <span className="corner bl" />
                      <span className="corner br" />
                    </div>

                    <div className="focus-flow-item-glyph" aria-hidden="true">
                      <span className="glyph-ring" />
                      <span className="glyph-orbit" />
                      <span className="glyph-text">
                        {accentGlyphs[index % accentGlyphs.length]}
                      </span>
                    </div>

                    <div className="focus-flow-item-meta">
                      <span className="focus-flow-item-num">{item.number}</span>
                      <span className="focus-flow-item-room">
                        Room {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="focus-flow-item-body">
                      <h4>
                        {item.title}
                        <span>{item.titleItalic}</span>
                      </h4>
                      <p>{item.description}</p>
                      <div className="focus-flow-tags">
                        {item.tags.map((tag) => (
                          <span key={tag} className="tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="focus-flow-item-foot">
                      <span className="foot-line" />
                      <span className="foot-label">Open room ↗</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="focus-flow-rail">
              <div className="focus-flow-counter">
                <span ref={counterRef}>01</span>
                <span className="sep">/</span>
                <span className="total">{String(items.length).padStart(2, "0")}</span>
              </div>
              <div className="focus-flow-progress">
                <div ref={progressRef} className="focus-flow-progress-fill" />
              </div>
              <div className="focus-flow-hint">Scroll · Linger</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
