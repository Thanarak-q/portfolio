import { useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsomorphicLayoutEffect } from "../lib/useIsomorphicLayoutEffect";
import { useSceneFade } from "../lib/useSceneFade";
import { getLenis } from "../lib/scroll";
import type { FocusItem } from "../lib/portfolioContent";

gsap.registerPlugin(ScrollTrigger);

interface WriteupGalleryProps {
  items: FocusItem[];
  // Scroll distance spent per card, in vh. Runway grows with the item count.
  vhPerItem?: number;
}

const pad = (n: number) => String(n).padStart(2, "0");
const clamp = (min: number, max: number, v: number) => Math.max(min, Math.min(max, v));

export default function WriteupGallery({ items, vhPerItem = 55 }: WriteupGalleryProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  useSceneFade(sectionRef, stickyRef);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const fillRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);

  const steps = Math.max(1, items.length - 1);
  const runwayVH = 100 + steps * vhPerItem;

  // Coverflow: every card is placed from its distance to the scroll "focus".
  // offset 0 = centred and flat; further out = rotated away, pushed back, dimmed.
  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let current = 0;

    // Per-card nodes and last-written z-index, looked up once instead of per frame.
    const cards = cardRefs.current.map((card) => ({
      card,
      shine: card?.querySelector<HTMLElement>(".wg-shine") ?? null,
      z: "",
    }));

    // Layout metrics only change on resize, so measure them on refresh.
    let isMobile = false;
    let cardW = 0;
    let spacing = 0;
    const measure = () => {
      isMobile = window.matchMedia("(max-width: 720px)").matches;
      cardW = isMobile ? window.innerWidth * 0.7 : Math.min(window.innerWidth * 0.27, 420);
      spacing = cardW * (isMobile ? 0.82 : 0.78);
    };
    measure();

    const apply = (progress: number) => {
      const focus = progress * steps;

      cards.forEach((entry, i) => {
        const { card, shine } = entry;
        if (!card) return;
        const offset = i - focus;
        const dist = Math.abs(offset);
        const rot = reduced ? 0 : clamp(-55, 55, -offset * (isMobile ? 32 : 38));
        const x = offset * spacing + Math.sign(offset) * Math.min(dist, 1) * cardW * 0.18;
        const z = -Math.min(dist, 4) * (isMobile ? 160 : 240);
        card.style.transform = `translate3d(${x}px, 0, ${z}px) rotateY(${rot}deg)`;
        card.style.opacity = String(clamp(0, 1, 1.35 - dist * 0.32));
        const zIndex = String(100 - Math.round(dist * 10));
        if (zIndex !== entry.z) {
          entry.z = zIndex;
          card.style.zIndex = zIndex;
        }
        if (shine) shine.style.opacity = String(clamp(0, 1, 1 - dist) * 0.6);
        card.classList.toggle("is-active", dist < 0.5);
      });

      if (fillRef.current) fillRef.current.style.transform = `scaleX(${progress})`;

      const next = Math.round(focus);
      if (next !== current) {
        current = next;
        activeRef.current = next;
        setActive(next);
      }
    };

    apply(0);

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => apply(self.progress),
      onRefresh: (self) => {
        measure();
        apply(self.progress);
      },
    });

    return () => st.kill();
  }, [steps]);

  // Clicking a side card scrolls it to the centre instead of opening it.
  const goTo = (i: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    const y = top + (section.offsetHeight - window.innerHeight) * (i / steps);
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y, { duration: 1.2 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  // Memoised so changing the active index only re-renders the HUD and backdrop.
  const cardNodes = useMemo(
    () =>
      items.map((item, i) => {
        const isLink = !!item.article;
        const inner = (
          <>
            <span className="wg-media">
              <img src={item.src} alt={item.alt} loading="lazy" decoding="async" />
            </span>
            <span className="wg-shade" aria-hidden="true" />
            <span className="wg-shine" aria-hidden="true" />
            <span className="wg-top">
              <span className="wg-num">{pad(i + 1)}</span>
              <span className="wg-status">
                {isLink ? item.article!.date ?? "LinkedIn" : item.status ?? "In progress"}
              </span>
            </span>
            <span className="wg-body">
              {item.tags && (
                <span className="wg-tags">
                  {item.tags.map((tag) => (
                    <span key={tag} className="wg-tag">
                      {tag}
                    </span>
                  ))}
                </span>
              )}
              <span className="wg-name">{item.name}</span>
              {item.article && <span className="wg-title">{item.article.title}</span>}
              {isLink && (
                <span className="wg-read">
                  Read on LinkedIn <span aria-hidden="true">↗</span>
                </span>
              )}
            </span>
          </>
        );

        const className = `wg-card${isLink ? "" : " wg-card--draft"}`;
        const ref = (el: HTMLElement | null) => {
          cardRefs.current[i] = el;
        };

        return isLink ? (
          <a
            key={item.name}
            ref={ref}
            className={className}
            href={item.article!.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (i !== activeRef.current) {
                e.preventDefault();
                goTo(i);
              }
            }}
          >
            {inner}
          </a>
        ) : (
          <div key={item.name} ref={ref} className={className} onClick={() => goTo(i)}>
            {inner}
          </div>
        );
      }),
    [items]
  );

  const activeItem = items[active];

  return (
    <div ref={sectionRef} className="wg" style={{ height: `${runwayVH}vh` }}>
      <div ref={stickyRef} className="wg-sticky">
        <div className="wg-backdrop" aria-hidden="true">
          <span key={activeItem.name} className="wg-backdrop-word">
            {activeItem.name}
          </span>
        </div>

        <div className="wg-hud wrap">
          <span>Write-ups</span>
          <span className="wg-counter">
            <span key={active} className="wg-counter-now">
              {pad(active + 1)}
            </span>
            <span className="wg-counter-total"> / {pad(items.length)}</span>
          </span>
        </div>

        <div className="wg-stage">{cardNodes}</div>

        <div className="wg-foot wrap">
          <div className="wg-progress" aria-hidden="true">
            <div ref={fillRef} className="wg-progress-fill" />
          </div>
          <span className="wg-hint">Scroll to browse</span>
        </div>
      </div>
    </div>
  );
}
