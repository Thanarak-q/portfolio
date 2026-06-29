import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsomorphicLayoutEffect } from "../lib/useIsomorphicLayoutEffect";

gsap.registerPlugin(ScrollTrigger);

const RUNWAY = 380;

type AnimType =
  | "fadeUp"
  | "fadeDown"
  | "slideLeft"
  | "slideRight"
  | "scaleIn"
  | "rotateIn"
  | "blurIn"
  | "swing"
  | "popBounce";

const ANIM_FOR_INDEX: AnimType[] = [
  "fadeUp",     // 0  Currently
  "popBounce",  // 1  Cybersecurity
  "rotateIn",   // 2  —
  "slideLeft",  // 3  running
  "blurIn",     // 4  Web Pentest
  "fadeDown",   // 5  engagements
  "scaleIn",    // 6  ·
  "swing",      // 7  and building custom
  "fadeUp",     // 8  Threat Intel
  "rotateIn",   // 9  tooling
  "popBounce",  // 10 ✺
];

function applyAnim(el: HTMLElement, type: AnimType, t: number) {
  const inv = 1 - t;
  switch (type) {
    case "fadeUp":
      gsap.set(el, { y: 80 * inv, x: 0, scale: 1, rotate: 0, filter: "none", opacity: t });
      return;
    case "fadeDown":
      gsap.set(el, { y: -70 * inv, x: 0, scale: 1, rotate: 0, filter: "none", opacity: t });
      return;
    case "slideLeft":
      gsap.set(el, { x: 140 * inv, y: 0, scale: 1, rotate: 0, filter: "none", opacity: t });
      return;
    case "slideRight":
      gsap.set(el, { x: -140 * inv, y: 0, scale: 1, rotate: 0, filter: "none", opacity: t });
      return;
    case "scaleIn":
      gsap.set(el, { scale: 0.25 + 0.75 * t, x: 0, y: 0, rotate: 0, filter: "none", opacity: t });
      return;
    case "rotateIn":
      gsap.set(el, { rotate: -28 * inv, scale: 0.7 + 0.3 * t, y: 20 * inv, x: 0, filter: "none", opacity: t });
      return;
    case "blurIn":
      gsap.set(el, { filter: `blur(${18 * inv}px)`, x: 0, y: 0, scale: 1, rotate: 0, opacity: t });
      return;
    case "swing":
      // pendulum drop-in from above with rotation
      gsap.set(el, {
        y: -60 * inv,
        rotate: 18 * inv,
        x: 0,
        scale: 1,
        filter: "none",
        opacity: t,
        transformOrigin: "top center",
      });
      return;
    case "popBounce": {
      // overshoot scale (back.out style done manually)
      const s = t < 1 ? 0.4 + 0.7 * t + 0.2 * Math.sin(t * Math.PI) : 1;
      gsap.set(el, { scale: s, x: 0, y: 0, rotate: 0, filter: "none", opacity: t });
      return;
    }
  }
}

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
    let vw     = 0;

    // Per-element scroll-progress windows derived from on-screen position.
    type Reveal = { el: HTMLElement; type: AnimType; pStart: number; pEnd: number };
    let reveals: Reveal[] = [];

    // Squiggle draw window
    let flairWindow: { start: number; end: number } | null = null;

    const flairLine = line.querySelector<SVGPathElement>("[data-flair-line] path");
    const FLAIR_LEN = 100;
    if (flairLine) {
      flairLine.style.strokeDasharray  = `${FLAIR_LEN}`;
      flairLine.style.strokeDashoffset = `${FLAIR_LEN}`;
    }

    const measure = () => {
      // Reset transforms so layout reads true offsets
      gsap.set(line, { x: 0 });
      const reveAll = line.querySelectorAll<HTMLElement>("[data-anim]");
      reveAll.forEach((el) => gsap.set(el, { clearProps: "transform,filter,opacity" }));

      vw = window.innerWidth;
      const lineW = line.scrollWidth;
      startX = vw + vw * 0.04;
      endX   = -(lineW + vw * 0.08);

      // Re-hide everything immediately, then push the line off-right
      reveAll.forEach((el) => {
        const idx = Number(el.dataset.anim);
        const type = ANIM_FOR_INDEX[idx] ?? "fadeUp";
        applyAnim(el, type, 0);
      });
      gsap.set(line, { x: startX });

      // Compute per-element windows based on screen position.
      // Element enters from right edge when screenX(p) = vw.
      // We complete reveal when element passes ~70% across screen (still on right side).
      const totalTravel = endX - startX;
      const progressForScreenX = (elOffset: number, targetScreenX: number) => {
        // screenX = lineX + elOffset = startX + totalTravel*p + elOffset
        return (targetScreenX - elOffset - startX) / totalTravel;
      };

      reveals = Array.from(reveAll).map((el) => {
        const idx = Number(el.dataset.anim);
        const type = ANIM_FOR_INDEX[idx] ?? "fadeUp";
        const offset = el.offsetLeft + el.offsetWidth / 2;
        // Start when element's center enters from right edge (screenX = vw + 5%)
        // End when it reaches ~65% across screen (screenX = vw * 0.65)
        const pStart = gsap.utils.clamp(0, 1, progressForScreenX(offset, vw * 1.02));
        const pEnd   = gsap.utils.clamp(0, 1, progressForScreenX(offset, vw * 0.60));
        return { el, type, pStart, pEnd };
      });

      // Squiggle: draw while "managing" travels across most of the visible screen.
      const flairEl = line.querySelector<HTMLElement>(".rs-flair");
      if (flairEl && flairLine) {
        const lineRect  = line.getBoundingClientRect();
        const flairRect = flairEl.getBoundingClientRect();
        const offset    = (flairRect.left - lineRect.left) + flairRect.width / 2;
        const start = gsap.utils.clamp(0, 1, progressForScreenX(offset, vw * 1.05));
        const end   = gsap.utils.clamp(0, 1, progressForScreenX(offset, vw * 0.35));
        flairWindow = { start, end };
        flairLine.style.strokeDashoffset = `${FLAIR_LEN}`;
      }
    };

    measure();

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: 1.4,
      invalidateOnRefresh: true,
      onRefresh() {
        measure();
      },
      onUpdate(self) {
        const p = self.progress;
        gsap.set(line, { x: gsap.utils.interpolate(startX, endX, p) });

        reveals.forEach(({ el, type, pStart, pEnd }) => {
          if (pEnd <= pStart) {
            applyAnim(el, type, p >= pStart ? 1 : 0);
            return;
          }
          const t = gsap.utils.clamp(0, 1, (p - pStart) / (pEnd - pStart));
          const eased = 1 - Math.pow(1 - t, 3);
          applyAnim(el, type, eased);
        });

        if (flairLine && flairWindow) {
          const { start, end } = flairWindow;
          const dt = gsap.utils.clamp(0, 1, (p - start) / Math.max(0.001, end - start));
          const eased = 1 - Math.pow(1 - dt, 2.4);
          flairLine.style.strokeDashoffset = `${FLAIR_LEN * (1 - eased)}`;
        }
      },
    });

    const float = (
      el: SVGSVGElement | null,
      opts: { y: number; r: number; d: number },
    ) => {
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

    if (document.fonts && (document.fonts as any).ready) {
      (document.fonts as any).ready.then(() => ScrollTrigger.refresh());
    }

    return () => {
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
        <svg ref={iconA} className="role-slide-icon role-slide-icon--a" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z" />
        </svg>

        <svg ref={iconB} className="role-slide-icon role-slide-icon--b" viewBox="0 0 40 40" aria-hidden="true">
          <circle cx="6"  cy="32" r="2.5" />
          <circle cx="34" cy="8"  r="2.5" />
          <path d="M6 32 C 6 18, 34 22, 34 8" fill="none" strokeWidth="1.2" />
          <rect x="3.5"  y="29.5" width="5" height="5" fill="none" strokeWidth="1" />
          <rect x="31.5" y="5.5"  width="5" height="5" fill="none" strokeWidth="1" />
        </svg>

        <svg ref={iconC} className="role-slide-icon role-slide-icon--c" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3 V21 M5 6 L19 18 M3 12 H21 M5 18 L19 6" strokeWidth="1.5" />
        </svg>

        <div ref={lineRef} className="role-slide-line">
          <span className="rs-word"  data-anim="0">Currently</span>
          <span data-badge data-anim="1" className="rs-badge rs-badge--accent">Cybersecurity</span>

          <span className="rs-sep"   data-anim="2">—</span>

          <span className="rs-word"  data-anim="3">running</span>
          <span data-badge data-anim="4" className="rs-badge rs-badge--mute">Web&nbsp;Pentest</span>
          <span className="rs-word"  data-anim="5">engagements</span>

          <span className="rs-sep"   data-anim="6">·</span>

          <span className="rs-word"  data-anim="7">
            and&nbsp;<span className="rs-flair">
              building
              <svg
                className="rs-flair-line"
                data-flair-line
                viewBox="0 0 200 18"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M2 11 Q 25 3, 50 9 T 100 8 T 150 10 T 198 7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  pathLength={100}
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </span>&nbsp;custom
          </span>
          <span data-badge data-anim="8" className="rs-badge rs-badge--outline">Threat&nbsp;Intel</span>
          <span className="rs-word"  data-anim="9">tooling</span>
          <span className="rs-star"  data-anim="10" aria-hidden="true">✺</span>
        </div>
      </div>
    </section>
  );
}
