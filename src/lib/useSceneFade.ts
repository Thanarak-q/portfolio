import type { RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

gsap.registerPlugin(ScrollTrigger);

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (t: number) => t * t * (3 - 2 * t);

// Crossfades a pinned (sticky) scene with its neighbours. While the section is
// still scrolling in, or scrolling out after its pin releases, the sticky
// inner is held at the top of the viewport and faded, so consecutive scenes
// dissolve into each other instead of sliding past as hard-edged blocks.
export function useSceneFade(
  sectionRef: RefObject<HTMLElement | null>,
  innerRef: RefObject<HTMLElement | null>,
  // `span` is how much of the viewport the fade takes: shorter spans give a
  // quick dissolve instead of a long double exposure.
  { fadeIn = true, fadeOut = true, span = 0.6 } = {}
) {
  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const inner = innerRef.current;
    if (!section || !inner) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let vh = window.innerHeight;
    let height = section.offsetHeight;

    const apply = (progress: number) => {
      // Section top/bottom in viewport px, derived from progress so no layout
      // reads happen during scroll.
      const top = vh - progress * (height + vh);
      const bottom = top + height;

      let y = 0;
      let opacity = 1;
      const range = vh * span;
      if (fadeIn && top > 0) {
        y = -top;
        opacity = smooth(clamp01((range - top) / range));
      } else if (fadeOut && bottom < vh) {
        y = vh - bottom;
        opacity = smooth(clamp01((bottom - (vh - range)) / range));
      }
      inner.style.transform = y ? `translate3d(0, ${y}px, 0)` : "";
      inner.style.opacity = opacity < 1 ? String(opacity) : "";
      inner.style.visibility = opacity <= 0.001 ? "hidden" : "";
    };

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => apply(self.progress),
      onRefresh: (self) => {
        vh = window.innerHeight;
        height = section.offsetHeight;
        apply(self.progress);
      },
    });

    return () => {
      st.kill();
      inner.style.transform = "";
      inner.style.opacity = "";
      inner.style.visibility = "";
    };
  }, [fadeIn, fadeOut, span]);
}
