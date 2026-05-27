import { useEffect, useRef, useState } from "react";
import type { BookNote } from "../lib/portfolioContent";

interface Props {
  books: BookNote[];
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function BookShelf({ books }: Props) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (paused || !inView) return;
    const id = window.setInterval(() => {
      setActive((a) => (a + 1) % books.length);
    }, 5200);
    return () => window.clearInterval(id);
  }, [paused, inView, books.length]);

  const total = books.length;
  const book  = books[active];

  return (
    <section ref={sectionRef} id="reading" className="shelf">
      <header className="shelf-head">
        <span className="eyebrow">02 — Reading list</span>
        <span className="shelf-counter">
          <span className="shelf-counter-now">{pad(active + 1)}</span>
          <span className="shelf-counter-sep">/</span>
          <span className="shelf-counter-total">{pad(total)}</span>
        </span>
      </header>

      <div className="shelf-stage">
        <article
          key={active}
          className={`shelf-cover shelf-cover--${book.palette}`}
          aria-live="polite"
        >
          <div className="cover-frame">
            <div className="cover-top">
              <span className="cover-num">No. {pad(active + 1)}</span>
              <span className="cover-tag">{book.tag}</span>
            </div>

            <div className="cover-title-block">
              <h3 className="cover-title">{book.shortTitle}</h3>
              <div className="cover-rule" aria-hidden="true" />
              <p className="cover-subtitle">{book.subtitle}</p>
            </div>

            <div className="cover-foot">
              <span className="cover-stamp">— Field library —</span>
              <span className="cover-pages">256 — 612 pp.</span>
            </div>

            <div className="cover-seal" aria-hidden="true">✺</div>
          </div>
        </article>

        <aside className="shelf-quote" key={`q-${active}`}>
          <p className="quote-mark" aria-hidden="true">“</p>
          <p className="quote-text">{book.note}</p>
          <p className="quote-attribution">
            <span className="quote-bullet" aria-hidden="true">→</span>
            <span>{book.title}</span>
          </p>
        </aside>
      </div>

      <div
        className="shelf-rail"
        onMouseLeave={() => setPaused(false)}
      >
        <div className="shelf-rail-inner">
          {books.map((b, i) => {
            const isActive = i === active;
            return (
              <button
                key={i}
                type="button"
                className={[
                  "spine",
                  `spine--${b.spineWidth}`,
                  `spine--${b.palette}`,
                  isActive ? "is-active" : "",
                ].join(" ")}
                onMouseEnter={() => {
                  setPaused(true);
                  setActive(i);
                }}
                onFocus={() => {
                  setPaused(true);
                  setActive(i);
                }}
                onClick={() => setActive(i)}
                aria-label={`Open ${b.title}`}
                aria-pressed={isActive}
              >
                <span className="spine-num">{pad(i + 1)}</span>
                <span className="spine-title">{b.shortTitle}</span>
                <span className="spine-foot">field lib.</span>
              </button>
            );
          })}
        </div>
        <div className="shelf-base" aria-hidden="true">
          <div className="shelf-base-line" />
          <div className="shelf-base-shadow" />
        </div>
      </div>
    </section>
  );
}
