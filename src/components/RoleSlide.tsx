import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsomorphicLayoutEffect } from "../lib/useIsomorphicLayoutEffect";

gsap.registerPlugin(ScrollTrigger);

const RUNWAY = 320;

export default function RoleSlide() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef    = useRef<HTMLDivElement>(null);
  const iconA      = useRef<SVGSVGElement>(null);
  const iconB      = useRef<SVGSVGElement>(null);
  const iconC      = useRef<SVGSVGElement>(null);

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const line    = lineRef.current;
    if (!section || !line) return;

    let startX = 0;
    let endX   = 0;

    const measure = () => {
      // Reset transform so we read the natural width
      gsap.set(line, { x: 0 });
      const vw    = window.innerWidth;
      const lineW = line.scrollWidth;
      startX = vw + vw * 0.04;          // begin just off-right
      endX   = -(lineW + vw * 0.08);     // end fully off-left + buffer
      gsap.set(line, { x: startX });
    };

    measure();

    const badges = Array.from(
      line.querySelectorAll<HTMLSpanElement>("[data-badge]"),
    );

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: 1.2,
      invalidateOnRefresh: true,
      onRefresh() {
        measure();
      },
      onUpdate(self) {
        const p = self.progress;
        gsap.set(line, { x: gsap.utils.interpolate(startX, endX, p) });
        badges.forEach((b, i) => {
          const dir = i % 2 === 0 ? 1 : -1;
          gsap.set(b, { rotate: dir * 6 * p });
        });
      },
    });

    // Decorative icons: soft float loop, decoupled from scroll
    const float = (el: SVGSVGElement | null, opts: { y: number; r: number; d: number }) => {
      if (!el) return null;
      return gsap.to(el, {
        y: opts.y,
        rotate: opts.r,
        duration: opts.d,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    };

    const fa = float(iconA.current, { y: 14,  r: 8,   d: 4.2 });
    const fb = float(iconB.current, { y: -18, r: -12, d: 5.4 });
    const fc = float(iconC.current, { y: 10,  r: 14,  d: 3.6 });

    // Re-measure after fonts load (FOUT shifts width)
    if (document.fonts && (document.fonts as any).ready) {
      (document.fonts as any).ready.then(() => ScrollTrigger.refresh());
    }

    return () => {
      tl.kill();
      st.kill();
      fa?.kill();
      fb?.kill();
      fc?.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="role-slide"
      style={{ height: `${RUNWAY}vh`, position: "relative" }}
    >
      <div className="role-slide-pin">
        {/* Floating decorative glyphs */}
        <svg
          ref={iconA}
          className="role-slide-icon role-slide-icon--a"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z" />
        </svg>

        <svg
          ref={iconB}
          className="role-slide-icon role-slide-icon--b"
          viewBox="0 0 40 40"
          aria-hidden="true"
        >
          <circle cx="6"  cy="32" r="2.5" />
          <circle cx="34" cy="8"  r="2.5" />
          <path d="M6 32 C 6 18, 34 22, 34 8" fill="none" strokeWidth="1.2" />
          <line x1="6"  y1="32" x2="6"  y2="32" />
          <rect x="3.5" y="29.5" width="5" height="5" fill="none" strokeWidth="1" />
          <rect x="31.5" y="5.5" width="5" height="5" fill="none" strokeWidth="1" />
        </svg>

        <svg
          ref={iconC}
          className="role-slide-icon role-slide-icon--c"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 3 V21 M5 6 L19 18 M3 12 H21 M5 18 L19 6" strokeWidth="1.5" />
        </svg>

        <div ref={lineRef} className="role-slide-line">
          <span className="rs-word">Currently</span>
          <span data-badge className="rs-badge rs-badge--accent">Cybersecurity&nbsp;Engineer</span>
          <span className="rs-sep">—</span>
          <span className="rs-word">running</span>
          <span data-badge className="rs-badge rs-badge--mute">Web&nbsp;Pentest</span>
          <span className="rs-word">engagements</span>
          <span className="rs-sep">·</span>
          <span className="rs-word">and&nbsp;managing&nbsp;the</span>
          <span data-badge className="rs-badge rs-badge--outline">Microsoft&nbsp;Azure</span>
          <span className="rs-word">stack.</span>
        </div>
      </div>
    </section>
  );
}
