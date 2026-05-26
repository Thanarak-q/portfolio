import { useRef, type CSSProperties, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsomorphicLayoutEffect } from "../lib/useIsomorphicLayoutEffect";

gsap.registerPlugin(ScrollTrigger);

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);
const easeOutExpo = (t: number) =>
  t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
const withDelay = (p: number, d: number) =>
  Math.max(0, Math.min(1, (p - d) / (1 - d)));

// Accepts both `class` (Astro) and `className` (React)
type ClassProps = { class?: string; className?: string };
const cx = ({ class: c, className }: ClassProps) => c ?? className ?? "";

function useReveal(
  ref: React.RefObject<HTMLElement | null>,
  compute: (el: HTMLElement, t: number) => void
) {
  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If element is already above the trigger start on mount (e.g. page loaded
    // scrolled past this section), reveal it immediately — otherwise it stays
    // stuck at opacity 0 because onEnter only fires on a downward crossing.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.95) {
      compute(el, 1);
    }

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 95%",
      end: "top 40%",
      scrub: false,
      onUpdate(self) {
        compute(el, self.progress);
      },
      onEnter() {
        compute(el, 1);
      },
    });

    return () => st.kill();
  }, []);
}

interface RiseInProps extends ClassProps {
  children: ReactNode;
  distance?: number;
  delay?: number;
  style?: CSSProperties;
}

export function RiseIn({
  children,
  distance = 60,
  delay = 0,
  style = {},
  ...classProps
}: RiseInProps) {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref, (el, t) => {
    const e = easeOutCubic(withDelay(t, delay));
    el.style.transform = `translate3d(0, ${(1 - e) * distance}px, 0)`;
    el.style.opacity = String(e);
  });
  return (
    <div ref={ref} className={`reveal-rise ${cx(classProps)}`} style={style}>
      {children}
    </div>
  );
}

interface SlideInProps extends ClassProps {
  children: ReactNode;
  dir?: "left" | "right";
  distance?: number;
  delay?: number;
  style?: CSSProperties;
}

export function SlideIn({
  children,
  dir = "right",
  distance = 120,
  delay = 0,
  style = {},
  ...classProps
}: SlideInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const sign = dir === "left" ? -1 : 1;
  useReveal(ref, (el, t) => {
    const e = easeOutQuint(withDelay(t, delay));
    el.style.transform = `translate3d(${(1 - e) * sign * distance}px, 0, 0)`;
    el.style.opacity = String(e);
  });
  return (
    <div
      ref={ref}
      className={`${dir === "left" ? "reveal-slide-l" : "reveal-slide-r"} ${cx(classProps)}`}
      style={style}
    >
      {children}
    </div>
  );
}

interface ScaleInProps extends ClassProps {
  children: ReactNode;
  from?: number;
  blur?: number;
  style?: CSSProperties;
}

export function ScaleIn({
  children,
  from = 0.96,
  blur = 10,
  style = {},
  ...classProps
}: ScaleInProps) {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref, (el, t) => {
    const e = easeOutExpo(t);
    el.style.transform = `scale(${from + (1 - from) * e})`;
    el.style.opacity = String(e);
    el.style.filter = `blur(${(1 - e) * blur}px)`;
  });
  return (
    <div ref={ref} className={`reveal-scale ${cx(classProps)}`} style={style}>
      {children}
    </div>
  );
}

interface LineRevealProps extends ClassProps {
  lines: string[];
  stagger?: number;
  style?: CSSProperties;
}

export function LineReveal({
  lines,
  stagger = 0.1,
  style = {},
  ...classProps
}: LineRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const rows = el.querySelectorAll<HTMLElement>(".line-reveal-row > span");

    const revealAll = () => {
      rows.forEach((span, i) => {
        const local = easeOutCubic(withDelay(1, i * stagger));
        span.style.transform = `translate3d(0, ${(1 - local) * 110}%, 0)`;
        span.style.opacity = String(local);
      });
    };

    // Already in/past viewport on mount → reveal immediately.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.95) {
      revealAll();
    }

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 95%",
      end: "top 45%",
      scrub: false,
      onUpdate(self) {
        rows.forEach((span, i) => {
          const local = easeOutCubic(withDelay(self.progress, i * stagger));
          span.style.transform = `translate3d(0, ${(1 - local) * 110}%, 0)`;
          span.style.opacity = String(local);
        });
      },
      onEnter() {
        rows.forEach((span, i) => {
          const local = easeOutCubic(withDelay(1, i * stagger));
          span.style.transform = `translate3d(0, ${(1 - local) * 110}%, 0)`;
          span.style.opacity = String(local);
        });
      },
    });

    return () => st.kill();
  }, [lines, stagger]);

  return (
    <div ref={ref} className={`line-reveal ${cx(classProps)}`} style={style}>
      {lines.map((line, i) => (
        <div key={i} className="line-reveal-row">
          <span dangerouslySetInnerHTML={{ __html: line }} />
        </div>
      ))}
    </div>
  );
}
