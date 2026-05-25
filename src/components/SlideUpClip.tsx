import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsomorphicLayoutEffect } from "../lib/useIsomorphicLayoutEffect";

gsap.registerPlugin(ScrollTrigger);

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

interface SlideUpClipProps {
  src: string;
  eyebrow: string;
  title: string;
  titleItalic: string;
  caption?: string;
  runwayVH?: number;
  exitDirection?: "up" | "left";
  incoming?: ReactNode;
}

export default function SlideUpClip({
  src,
  eyebrow,
  title,
  titleItalic,
  caption,
  runwayVH = 400,
  exitDirection = "up",
  incoming,
}: SlideUpClipProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const leakRef = useRef<HTMLDivElement>(null);
  const progFillRef = useRef<HTMLDivElement>(null);
  const incomingRef = useRef<HTMLDivElement>(null);

  // iOS/Safari: kick play→pause so currentTime is writable
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const kick = () => {
      v.play().then(() => v.pause()).catch(() => {});
    };
    v.addEventListener("loadedmetadata", kick, { once: true });
    if (v.readyState >= 1) kick();
  }, []);

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const video = videoRef.current;
    if (!section || !stage || !video) return;

    // ── Sticky pin model ──────────────────────────────────────────────
    // Section is `runwayVH` tall. Inside: a `position: sticky` pin
    // (100vh) that holds during scroll. The trigger range is the
    // pinning range = (runwayVH - 100)vh of actual scroll.
    //
    // Phases (as fraction of trigger progress):
    //   0  →  SU_END   : slide-up (clip rises from below)        — 1vh of scroll
    //   SU_END → EXIT  : video scrub
    //   EXIT_START → 1 : exit (up or left)                       — 1vh of scroll
    const totalUnits = runwayVH / 100 - 1;           // e.g. 3 for runwayVH=400
    const SU_END = 1 / totalUnits;                   // 0.333
    const EXIT_START = 1 - 1 / totalUnits;           // 0.667
    const EXIT_END = 1;
    const SCRUB_START = SU_END;
    const SCRUB_END = EXIT_START;

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",       // pin starts when section reaches viewport top
      end: "bottom bottom",   // ends when section bottom hits viewport bottom
      scrub: 0.5,             // smooth catch-up
      onUpdate(self) {
        const rp = self.progress;

        // ── Slide-up: stage transforms from 100% (below) → 0% (covering)
        const slideT = clamp01(rp / SU_END);
        const ty = (1 - slideT) * 100;                // 100 → 0 (percent of own height)

        // ── Exit
        const exitT = clamp01((rp - EXIT_START) / (EXIT_END - EXIT_START));
        const eExit = easeOutCubic(exitT);
        const exitY = exitDirection === "up" ? eExit * -100 : 0;
        const exitX = exitDirection === "left" ? eExit * -100 : 0;

        stage.style.transform = `translate3d(${exitX}%, ${ty + exitY}%, 0)`;

        // ── Video scrub
        const dur = video.duration;
        if (dur && !Number.isNaN(dur)) {
          let t: number;
          if (rp <= SCRUB_START) t = 0;
          else if (rp >= SCRUB_END) t = dur - 0.05;
          else t = ((rp - SCRUB_START) / (SCRUB_END - SCRUB_START)) * (dur - 0.05);
          if (Math.abs(video.currentTime - t) > 0.02) {
            try { video.currentTime = t; } catch {}
          }
        }

        // ── Overlay text fades in after slide-up, out during exit
        const textIn = clamp01((rp - SU_END) / 0.08);
        const textOp =
          rp < SU_END
            ? 0
            : exitT > 0
              ? Math.max(0, 1 - exitT * 2.2)
              : textIn;
        if (overlayRef.current) overlayRef.current.style.opacity = String(textOp);

        // ── Leak streak
        if (leakRef.current && rp >= SU_END && rp <= EXIT_START) {
          const localP = (rp - SU_END) / (EXIT_START - SU_END);
          const wave = Math.sin(localP * Math.PI);
          leakRef.current.style.transform = `translate3d(${-15 + localP * 130}vw, 0, 0) scaleX(${0.6 + wave * 0.9})`;
          leakRef.current.style.opacity = String(0.3 + wave * 0.4);
        } else if (leakRef.current) {
          leakRef.current.style.opacity = "0";
        }

        // ── Progress bar
        if (progFillRef.current) {
          const scrubLocal = clamp01((rp - SU_END) / (EXIT_START - SU_END));
          progFillRef.current.style.transform = `scaleX(${scrubLocal})`;
        }

        // ── Incoming panel slides in from the right during left-exit
        if (incomingRef.current && exitDirection === "left") {
          const ix = (1 - eExit) * 100;
          incomingRef.current.style.transform = `translate3d(${ix}%, 0, 0)`;
        }
      },
    });

    return () => st.kill();
  }, [runwayVH, exitDirection]);

  return (
    <section
      ref={sectionRef}
      className="slide-up-section"
      style={{ height: `${runwayVH}vh` }}
    >
      <div className="slide-up-pin">
        <div ref={stageRef} className="slide-up-stage">
          <div className="clip-stage">
            <video ref={videoRef} src={src} muted playsInline preload="auto" />
            <div className="film-tint" />
            <div ref={leakRef} className="leak-anim" style={{ left: 0, opacity: 0 }} />
          </div>
          <div ref={overlayRef} className="interlude-overlay" style={{ opacity: 0 }}>
            <div className="interlude-eyebrow">{eyebrow}</div>
            <h2 className="interlude-title">
              {title} <span className="it">{titleItalic}</span>
            </h2>
            {caption && <p className="interlude-caption">{caption}</p>}
          </div>
          <div className="hero-progress" aria-hidden="true">
            <div ref={progFillRef} className="fill" />
          </div>
        </div>

        {exitDirection === "left" && incoming && (
          <div ref={incomingRef} className="slide-up-incoming">
            {incoming}
          </div>
        )}
      </div>
    </section>
  );
}
