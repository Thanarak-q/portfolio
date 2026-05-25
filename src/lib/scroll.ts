import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;

export function initScroll() {
  if (typeof window === "undefined") return null;
  if (lenis) return lenis;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    ScrollTrigger.refresh();
    return null;
  }

  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1.0,
    touchMultiplier: 1.4,
  });

  // Wire Lenis into GSAP ticker so ScrollTrigger positions are always in sync
  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis!.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  // Force a refresh once layout has fully settled. Without this, triggers
  // created during hydration (especially with tall sticky sections like
  // FocusFlow) measure positions before the final document height is known,
  // and reveal animations below those sections can stay stuck at opacity 0.
  const forceRefresh = () => ScrollTrigger.refresh();
  requestAnimationFrame(() => requestAnimationFrame(forceRefresh));
  window.addEventListener("load", forceRefresh, { once: true });
  setTimeout(forceRefresh, 600);

  return lenis;
}

export function getLenis() {
  return lenis;
}

// Math helpers
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeOutExpo = (t: number) =>
  t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
export const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);
export const withDelay = (p: number, d: number) =>
  Math.max(0, Math.min(1, (p - d) / (1 - d)));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
