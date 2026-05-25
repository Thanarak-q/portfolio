import { useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsomorphicLayoutEffect } from "../lib/useIsomorphicLayoutEffect";

gsap.registerPlugin(ScrollTrigger);

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

interface HorizontalPanelProps {
  children: ReactNode;
  sectionHeightVH?: number;
  title?: string;
  eyebrow?: string;
}

export default function HorizontalPanel({
  children,
  sectionHeightVH = 420,
  title,
  eyebrow,
}: HorizontalPanelProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    let trackW = track.scrollWidth;
    let viewport = window.innerWidth;

    const measure = () => {
      trackW = track.scrollWidth;
      viewport = window.innerWidth;
    };

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate(self) {
        const e = easeInOutCubic(self.progress);
        const maxX = -(trackW - viewport + 96);
        track.style.transform = `translate3d(${maxX * e}px, 0, 0)`;

        if (fillRef.current) {
          fillRef.current.style.transform = `scaleX(${self.progress})`;
        }

        if (titleRef.current) {
          titleRef.current.style.opacity = String(
            1 - Math.min(1, self.progress * 4)
          );
        }
      },
      onRefresh: measure,
    });

    window.addEventListener("resize", measure, { passive: true });

    return () => {
      st.kill();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      className="h-panel-section"
      style={{ height: `${sectionHeightVH}vh` }}
    >
      <div className="h-panel-sticky">
        {(eyebrow || title) && (
          <div ref={titleRef} className="h-panel-title">
            {eyebrow && <div className="eyebrow">{eyebrow}</div>}
            {title && (
              <h2
                className="section-title"
                dangerouslySetInnerHTML={{ __html: title }}
              />
            )}
          </div>
        )}

        <div className="h-panel-viewport">
          <div ref={trackRef} className="h-panel-track">
            {children}
          </div>

          <div className="h-panel-progress" aria-hidden="true">
            <div ref={fillRef} className="fill" />
          </div>
        </div>
      </div>
    </div>
  );
}
