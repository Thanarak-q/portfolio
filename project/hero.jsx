/* global React, useSectionProgress, easeOutCubic */
const { useEffect, useRef, useState } = React;

function useSmoothed(target, stiffness = 0.25) {
  const [v, setV] = useState(target);
  const raf = useRef(null);
  const cur = useRef(target);
  const tgt = useRef(target);
  useEffect(() => {
    tgt.current = target;
    if (raf.current) return;
    const loop = () => {
      cur.current += (tgt.current - cur.current) * stiffness;
      if (Math.abs(tgt.current - cur.current) < 0.0005) {
        cur.current = tgt.current;
        setV(cur.current);
        raf.current = null;
        return;
      }
      setV(cur.current);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
  }, [target, stiffness]);
  return v;
}

const clamp01 = (x) => Math.max(0, Math.min(1, x));

// ============================================================
// HERO CLIP — scrubs video, fades title, ends with a portal
// expansion: a small colored square that grows to fullscreen
// to cover the video before About begins.
// ============================================================
function HeroClip({
  src,
  title,
  titleItalic,
  role,
  showHint = false,
  chipLabel = "CLIP",
  runwayVH = 500,
  portalEyebrow = "CHAPTER 02",
  portalLabel = "Field Notes",
}) {
  const ref = useRef(null);
  const videoRef = useRef(null);
  const p = useSectionProgress(ref);
  const sp = useSmoothed(p, 0.28);
  const [duration, setDuration] = useState(6);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const fn = () => setDuration(v.duration || 6);
    v.addEventListener("loadedmetadata", fn);
    return () => v.removeEventListener("loadedmetadata", fn);
  }, []);

  // Phases: scrub 0..0.65, portal 0.65..1.0
  const SCRUB_END = 0.65;
  const PORTAL_START = 0.62; // slight overlap for hint

  // Video scrub maps 0..SCRUB_END to full clip
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !duration) return;
    const t = sp <= 0 ? 0 :
              sp >= SCRUB_END ? duration - 0.05 :
              (sp / SCRUB_END) * (duration - 0.05);
    if (Math.abs(v.currentTime - t) > 0.03) {
      try { v.currentTime = t; } catch {}
    }
  }, [sp, duration]);

  // Title fades within first 12% of scroll
  const titleOpacity = sp < 0.06 ? 1 : sp < 0.16 ? 1 - (sp - 0.06) / 0.10 : 0;

  // Portal grows during sp 0.62..1.0
  const portalT = clamp01((sp - PORTAL_START) / (1 - PORTAL_START));
  const ePortal = easeOutCubic(portalT);
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const portalW = 280 + (vw - 280) * ePortal;
  const portalH = 180 + (vh - 180) * ePortal;
  const portalR = 32 * (1 - ePortal * 0.92);
  // Subtle fade-in for the portal itself in first 8% of its phase
  const portalAlpha = clamp01(portalT / 0.06);
  // Content scale inside portal — content stays centered, grows in absolute size
  const contentScale = 0.45 + 0.55 * ePortal;

  // Timecode
  const t = sp * duration;
  const mm = Math.floor(t / 60).toString().padStart(2, "0");
  const ss = Math.floor(t % 60).toString().padStart(2, "0");
  const ff = Math.floor((t % 1) * 24).toString().padStart(2, "0");

  return (
    <section id="hero" ref={ref} className="scroll-clip" style={{ height: `${runwayVH}vh` }}>
      <div className="clip-sticky">
        <div className="clip-stage">
          <video ref={videoRef} src={src} muted playsInline preload="auto" />
          <div className="film-tint" />
          <div
            className="leak-anim"
            style={{
              left: `${-15 + sp * 130}%`,
              opacity: 0.3 + Math.sin(Math.min(sp, SCRUB_END) / SCRUB_END * Math.PI) * 0.4,
              transform: `scaleX(${0.6 + Math.sin(Math.min(sp, SCRUB_END) / SCRUB_END * Math.PI) * 0.9})`,
            }}
          />
        </div>

        {/* Hero title — visible at top of scroll, fades out */}
        <div className="hero-overlay" style={{ opacity: titleOpacity, pointerEvents: titleOpacity > 0.1 ? "auto" : "none" }}>
          <div>
            <h1 className="hero-title">
              {title}<br />
              <span className="it">{titleItalic}</span>
            </h1>
            <div className="hero-meta">
              <div className="role">{role}</div>
              {showHint && (
                <div className="hero-scroll-hint">
                  <span>Scroll&nbsp;to&nbsp;play</span>
                  <span className="bar" aria-hidden="true" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PORTAL — small square that grows to fullscreen, covers video before About */}
        {/* PORTAL TEXT — only the words grow, no colored background.
            We do tint the video at the same time so the words read. */}
        {portalT > 0 && (
          <>
            <div
              className="portal-tint"
              style={{ opacity: ePortal * 0.55 }}
              aria-hidden="true"
            />
            <div
              className="portal-text"
              style={{
                opacity: portalAlpha,
                transform: `translate(-50%, -50%) scale(${0.42 + 1.05 * ePortal})`,
              }}
            >
              <div className="portal-eyebrow">{portalEyebrow}</div>
              <div className="portal-title">{portalLabel}</div>
              <div className="portal-rule" />
            </div>
          </>
        )}
      </div>
    </section>
  );
}

// ============================================================
// SLIDE UP CLIP — interlude that slides up from the bottom of
// the viewport, covering whatever section comes before, then
// scrubs the video, then holds. Uses position:fixed so it can
// overlap the previous section during slide-up.
// ============================================================
function SlideUpClip({
  src,
  eyebrow,
  title,
  titleItalic,
  caption,
  runwayVH = 400,
  chipLabel = "CLIP",
  exitDirection = "up",   // "up" | "left"
  incoming = null,        // React node shown sliding in from the right when exitDirection="left"
}) {
  const ref = useRef(null);
  const videoRef = useRef(null);
  const [duration, setDuration] = useState(6);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // total scroll range: from "section's top at viewport bottom" to "section's bottom at viewport top"
      // start: rect.top = vh → t = 0
      // end:   rect.top = -el.offsetHeight → t = 1
      const total = vh + el.offsetHeight;
      const scrolled = vh - rect.top;
      const t = Math.max(0, Math.min(1, scrolled / total));
      setProgress(t);
      setActive(rect.top < vh && rect.bottom > 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const sp = useSmoothed(progress, 0.28);
  // For position transforms we use the RAW scroll progress (not smoothed)
  // so the clip is glued 1:1 to the scroll position and never lags behind /
  // drifts away from the section above. Only the video timecode uses sp.
  const rp = progress;

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const fn = () => setDuration(v.duration || 6);
    v.addEventListener("loadedmetadata", fn);
    return () => v.removeEventListener("loadedmetadata", fn);
  }, []);

  // Slide-up consumes ~1 viewport of scroll out of (1 + runwayVH/100) viewports total.
  const runwayUnits = runwayVH / 100;
  const SU_END = 1 / (1 + runwayUnits);
  // Scrub from SU_END to SCRUB_END, hold from SCRUB_END to EXIT_START,
  // swipe-exit from EXIT_START to EXIT_END, buffer (incoming holds) from EXIT_END to 1.
  const span = 1 - SU_END;
  const SCRUB_END = SU_END + span * 0.55;   // ~0.64 for runway 4
  const EXIT_START = SU_END + span * 0.62;  // ~0.70
  const EXIT_END   = SU_END + span * 0.88;  // ~0.90
  const HOLD_START = SCRUB_END;

  const slideUpT = Math.min(1, rp / SU_END);
  // LINEAR easing here on purpose: makes clip rise at the same px-per-px speed
  // as the page scrolls, so its top edge stays glued to the bottom edge of the
  // section above it instead of racing ahead.
  const eSlide = slideUpT;
  const ty = (1 - eSlide) * 100;

  // exit progress 0..1
  const exitT = clamp01((rp - EXIT_START) / (EXIT_END - EXIT_START));
  const eExit = easeOutCubic(exitT);
  // "up" direction now FULLY clears the viewport (-100vh) so the next section
  // is properly exposed and doesn't peek through behind the clip.
  const exitY = exitDirection === "up" ? eExit * -100 : 0;
  const exitX = exitDirection === "left" ? eExit * -100 : 0;
  const exitOpacity = 1;
  const incomingX = exitDirection === "left" ? (1 - eExit) * 100 : 100;

  // Scrub video during pinned middle
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !duration) return;
    let t;
    if (sp <= SU_END) t = 0;
    else if (sp >= SCRUB_END) t = duration - 0.05;
    else t = ((sp - SU_END) / (SCRUB_END - SU_END)) * (duration - 0.05);
    if (Math.abs(v.currentTime - t) > 0.03) {
      try { v.currentTime = t; } catch {}
    }
  }, [sp, duration, SU_END, SCRUB_END]);

  // Text fade in after slide-up; fade out as exit progresses
  const textIn = clamp01((rp - SU_END) / 0.08);
  const textOpacity = rp < SU_END
    ? 0
    : exitT > 0
    ? Math.max(0, 1 - exitT * 2.2)
    : textIn;

  const t = sp * duration;
  const mm = Math.floor(t / 60).toString().padStart(2, "0");
  const ss = Math.floor(t % 60).toString().padStart(2, "0");
  const ff = Math.floor((t % 1) * 24).toString().padStart(2, "0");

  return (
    <section ref={ref} className="slide-up-section" style={{ height: `${runwayVH}vh` }}>
      <div
        className="slide-up-fixed"
        style={{
          transform: `translate3d(${exitX}vw, ${ty + exitY}vh, 0)`,
          opacity: active ? exitOpacity : 0,
          pointerEvents: active && exitT < 0.5 ? "auto" : "none",
          zIndex: active ? 6 : -1,
        }}
      >
        <div className="clip-stage">
          <video ref={videoRef} src={src} muted playsInline preload="auto" />
          <div className="film-tint" />
          <div
            className="leak-anim"
            style={{
              left: `${-15 + sp * 130}%`,
              opacity: 0.3 + Math.sin(sp * Math.PI) * 0.4,
              transform: `scaleX(${0.6 + Math.sin(sp * Math.PI) * 0.9})`,
            }}
          />
        </div>

        <div className="interlude-overlay" style={{ opacity: textOpacity }}>
          <div className="interlude-eyebrow">{eyebrow}</div>
          <h2 className="interlude-title">
            {title}{" "}<span className="it">{titleItalic}</span>
          </h2>
          {caption && <p className="interlude-caption">{caption}</p>}
        </div>

        <div className="hero-progress" aria-hidden="true">
          <div className="fill" style={{ width: `${sp * 100}%` }} />
        </div>
      </div>

      {/* Horizontal-swipe "incoming" panel — slides in from right while the clip slides left */}
      {exitDirection === "left" && incoming && active && exitT > 0 && (
        <div
          className="slide-up-incoming"
          style={{
            transform: `translate3d(${incomingX}vw, 0, 0)`,
          }}
        >
          {incoming}
        </div>
      )}
    </section>
  );
}

window.HeroClip = HeroClip;
window.SlideUpClip = SlideUpClip;
// Backward-compat alias
window.ScrollClip = HeroClip;
