import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsomorphicLayoutEffect } from "../lib/useIsomorphicLayoutEffect";

gsap.registerPlugin(ScrollTrigger);

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

interface HeroClipProps {
  src: string;
  title: string;
  titleItalic: string;
  role: string;
  showHint?: boolean;
  runwayVH?: number;
  portalEyebrow?: string;
  portalLabel?: string;
}

export default function HeroClip({
  src,
  title,
  titleItalic,
  role,
  showHint = false,
  runwayVH = 500,
  portalEyebrow,
  portalLabel,
}: HeroClipProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const leakRef = useRef<HTMLDivElement>(null);
  const portalTintRef = useRef<HTMLDivElement>(null);
  const portalTextRef = useRef<HTMLDivElement>(null);

  // iOS/Safari: kick play→pause so currentTime is writable
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const kick = () => {
      v.play()
        .then(() => v.pause())
        .catch(() => {});
    };
    v.addEventListener("loadedmetadata", kick, { once: true });
    if (v.readyState >= 1) kick();
  }, []);

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    // Scroll range: when section top hits viewport top → when section bottom hits viewport bottom
    // = (runwayVH - 100)vh of actual scroll, matching the sticky pin range exactly.
    // SCRUB_END: video plays over first 65% of scroll; last 35% is portal expansion.
    const SCRUB_END = 0.65;
    const PORTAL_START = 0.62;

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      // 0.5s catch-up — with all-keyframe MP4 the seek is instant,
      // so we can use a tighter scrub for responsive feel.
      scrub: 0.5,
      onUpdate(self) {
        const sp = self.progress;
        const dur = video.duration;

        // Video scrub — direct from progress, no additional lerp
        if (dur && !Number.isNaN(dur)) {
          const t =
            sp >= SCRUB_END
              ? dur - 0.05
              : (sp / SCRUB_END) * (dur - 0.05);
          if (Math.abs(video.currentTime - t) > 0.02) {
            try { video.currentTime = t; } catch {}
          }
        }

        // Title overlay fades out early in scroll
        const titleOp =
          sp < 0.06 ? 1 : sp < 0.16 ? 1 - (sp - 0.06) / 0.1 : 0;
        if (overlayRef.current) {
          overlayRef.current.style.opacity = String(titleOp);
          overlayRef.current.style.pointerEvents = titleOp > 0.1 ? "auto" : "none";
        }

        // Leak light streak
        if (leakRef.current) {
          const wave = Math.sin((Math.min(sp, SCRUB_END) / SCRUB_END) * Math.PI);
          leakRef.current.style.transform = `translate3d(${-15 + sp * 130}vw, 0, 0) scaleX(${0.6 + wave * 0.9})`;
          leakRef.current.style.opacity = String(0.3 + wave * 0.4);
        }

        // Portal expansion (last 35% of scroll)
        const portalT = clamp01((sp - PORTAL_START) / (1 - PORTAL_START));
        const ePortal = easeOutCubic(portalT);
        if (portalTintRef.current) {
          portalTintRef.current.style.opacity = String(ePortal * 0.55);
        }
        if (portalTextRef.current) {
          const alpha = clamp01(portalT / 0.06);
          const scale = 0.42 + 1.05 * ePortal;
          portalTextRef.current.style.opacity = String(alpha);
          portalTextRef.current.style.transform = `translate(-50%, -50%) scale(${scale})`;
        }
      },
    });

    return () => st.kill();
  }, []);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="scroll-clip"
      style={{ height: `${runwayVH}vh` }}
    >
      <div className="clip-sticky">
        <div className="clip-stage">
          <video ref={videoRef} src={src} muted playsInline preload="auto" />
          <div className="film-tint" />
          <div ref={leakRef} className="leak-anim" style={{ left: 0 }} />
        </div>

        <div ref={overlayRef} className="hero-overlay">
          <div>
            <h1 className="hero-title">
              {title}
              <br />
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

        <div ref={portalTintRef} className="portal-tint" aria-hidden="true" />
        <div ref={portalTextRef} className="portal-text">
          <div className="portal-eyebrow">{portalEyebrow}</div>
          <div className="portal-title">{portalLabel}</div>
          <div className="portal-rule" />
        </div>
      </div>
    </section>
  );
}
