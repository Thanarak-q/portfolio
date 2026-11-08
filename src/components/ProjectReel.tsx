import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsomorphicLayoutEffect } from "../lib/useIsomorphicLayoutEffect";
import type { UiWork } from "../lib/portfolioContent";

gsap.registerPlugin(ScrollTrigger);

const pad = (n: number) => String(n).padStart(2, "0");

// Vertical scroll per pixel of horizontal travel.
const SPEED = 0.55;

interface ProjectReelProps {
  works: UiWork[];
}

// A pinned horizontal reel: the section holds the viewport while vertical
// scroll drives one long track sideways — each project's main screen and
// copy first, then its pages — so every project gets a full-screen moment.
export default function ProjectReel({ works }: ProjectReelProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const groupRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [isStatic, setIsStatic] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    // Reduced motion: no pin, the track becomes a native horizontal scroller.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsStatic(true);
      return;
    }

    let travel = 0;
    let groupStarts: number[] = [];
    let current = 0;

    // Layout is read only here (before ScrollTrigger measures, and on resize),
    // never during scroll.
    const measure = () => {
      travel = Math.max(0, track.scrollWidth - window.innerWidth);
      // The track moves faster than the page scrolls, so the reel stays a
      // few screens long instead of one screen of scroll per screen of track.
      section.style.height = `${travel * SPEED + window.innerHeight}px`;
      groupStarts = groupRefs.current.map((g) => (g ? g.offsetLeft : 0));
    };

    const apply = (progress: number) => {
      const x = progress * travel;
      track.style.transform = `translate3d(${-x}px, 0, 0)`;
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${progress})`;

      // The project whose group has crossed the middle of the screen is active.
      const probe = x + window.innerWidth * 0.5;
      let next = 0;
      groupStarts.forEach((start, i) => {
        if (probe >= start) next = i;
      });
      if (next !== current) {
        current = next;
        setActive(next);
      }
    };

    ScrollTrigger.addEventListener("refreshInit", measure);
    measure();

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => apply(self.progress),
      onRefresh: (self) => apply(self.progress),
    });
    apply(st.progress);

    return () => {
      ScrollTrigger.removeEventListener("refreshInit", measure);
      st.kill();
      section.style.height = "";
      track.style.transform = "";
    };
  }, [works]);

  const activeWork = works[active];

  return (
    <section
      ref={sectionRef}
      className={`pr${isStatic ? " is-static" : ""}`}
      aria-label="Projects"
      data-ui-work
    >
      <div className="pr-sticky">
        <div className="pr-hud">
          <div className="pr-hud-now" aria-live="polite">
            <span className="pr-hud-num">{activeWork.number}</span>
            <span key={activeWork.title} className="pr-hud-title">
              {activeWork.title}
            </span>
          </div>
          <div className="pr-dots" aria-hidden="true">
            {works.map((w, i) => (
              <span key={w.title} className={i === active ? "is-on" : undefined} />
            ))}
          </div>
          <span className="pr-hud-count">
            {pad(active + 1)} / {pad(works.length)}
          </span>
        </div>

        <div ref={trackRef} className="pr-track">
          {works.map((work, i) => (
            <div
              key={work.title}
              ref={(el) => {
                groupRefs.current[i] = el;
              }}
              className="pr-group"
              data-ui-work-card
            >
              <article className="pr-intro">
                <div className="pr-frame pr-frame--main">
                  <div className="pr-bar" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </div>
                  <img
                    src={work.shot.src}
                    alt={work.shot.alt}
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                  />
                </div>
                <div className="pr-copy">
                  <span className="pr-num">{work.number}</span>
                  <h3 className="pr-title">
                    {work.title} <em>{work.kind}</em>
                  </h3>
                  <p className="pr-desc">{work.description}</p>
                  <ul className="pr-tags">
                    {work.tags.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                  <span className="pr-pagecount">
                    {pad(work.pages.length)} pages <span aria-hidden="true">→</span>
                  </span>
                </div>
              </article>

              {work.pages.map((page, p) => (
                <figure key={page.src} className="pr-page">
                  <div className="pr-frame">
                    <img src={page.src} alt={page.alt} loading="lazy" decoding="async" />
                  </div>
                  <figcaption>
                    <span>{pad(p + 1)}</span>
                    {page.label}
                  </figcaption>
                </figure>
              ))}
            </div>
          ))}
        </div>

        <div className="pr-foot" aria-hidden="true">
          <div className="pr-progress">
            <div ref={fillRef} className="pr-progress-fill" />
          </div>
          <span className="pr-hint">Scroll to browse</span>
        </div>
      </div>
    </section>
  );
}
