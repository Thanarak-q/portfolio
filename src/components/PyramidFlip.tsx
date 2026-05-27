import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsomorphicLayoutEffect } from "../lib/useIsomorphicLayoutEffect";

gsap.registerPlugin(ScrollTrigger);

const RUNWAY = 350;

const absBack: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  textAlign: "center",
  display: "block",
};

export default function PyramidFlip() {
  const sectionRef = useRef<HTMLElement>(null);

  const f0 = useRef<HTMLSpanElement>(null);
  const b0 = useRef<HTMLSpanElement>(null);
  const f1 = useRef<HTMLSpanElement>(null);
  const b1 = useRef<HTMLSpanElement>(null);
  const f2 = useRef<HTMLSpanElement>(null);
  const b2 = useRef<HTMLSpanElement>(null);

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const fronts = [f0.current, f1.current, f2.current];
    const backs  = [b0.current, b1.current, b2.current];

    // Backs start above the cell — clipped by overflow:hidden on parent
    gsap.set(backs,  { yPercent: -100 });
    gsap.set(fronts, { yPercent: 0 });

    const tl = gsap.timeline({ paused: true });

    const starts = [0.05, 0.38, 0.68];
    starts.forEach((start, i) => {
      tl.to(fronts[i], {
        yPercent: 100,
        ease: "power2.inOut",
        duration: 0.22,
      }, start)
      .to(backs[i], {
        yPercent: 0,
        ease: "power2.inOut",
        duration: 0.22,
      }, start);
    });

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: 1.5,
      onUpdate(self) {
        tl.progress(self.progress);
      },
    });

    return () => {
      tl.kill();
      st.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      style={{ height: `${RUNWAY}vh`, position: "relative" }}
    >
      <div className="about-pin">
        <div className="wrap">
          <div className="eyebrow">01 — Who</div>

          <div className="pyramid-statement">

            {/* Line 1: TRAINED AT → WORK AT */}
            <div className="flip-cell" style={{ marginBottom: "0.6em" }}>
              <span ref={f0} className="pyramid-line pyramid-line--top" style={{ display: "block" }}>
                TRAINED AT
              </span>
              <span ref={b0} className="pyramid-line pyramid-line--top" style={absBack}>
                WORK AT
              </span>
            </div>

            {/* Line 2: CHIANG MAI → ITSC */}
            <div className="flip-cell">
              <span ref={f1} className="pyramid-line pyramid-line--mid" style={{ display: "block" }}>
                CHIANG MAI
              </span>
              <span ref={b1} className="pyramid-line pyramid-line--mid" style={absBack}>
                ITSC
              </span>
            </div>

            {/* Line 3: UNIVERSITY → CMU */}
            <div className="flip-cell">
              <span ref={f2} className="pyramid-line pyramid-line--bot" style={{ display: "block" }}>
                UNIVERSITY
              </span>
              <span ref={b2} className="pyramid-line pyramid-line--bot" style={absBack}>
                CMU
              </span>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
