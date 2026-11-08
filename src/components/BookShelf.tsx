import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsomorphicLayoutEffect } from "../lib/useIsomorphicLayoutEffect";
import { useSceneFade } from "../lib/useSceneFade";
import { bookSlug, type BookNote } from "../lib/portfolioContent";

gsap.registerPlugin(ScrollTrigger);

interface Props {
  books: BookNote[];
}

const pad = (n: number) => String(n).padStart(2, "0");
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// Cabinet geometry in px, centred on the cabinet's middle (y grows downward).
const W = 440;
const H = 620;
const D = 230;
const T = 18; // panel thickness
const INNER_TOP = -H / 2 + T;
const ROW_H = 230;
const SHELF = 14;
const FLOORS = [INNER_TOP + ROW_H, INNER_TOP + ROW_H * 2 + SHELF]; // y of each row's floor
const PLINTH = 40;
const DRAWER_Y = (FLOORS[1] + SHELF + H / 2 - PLINTH) / 2;
const DRAWER_H = H / 2 - PLINTH - (FLOORS[1] + SHELF) - 8;

const bookWidth: Record<BookNote["spineWidth"], number> = { sm: 34, md: 45, lg: 58 };
const bookHeights = [1, 0.93, 0.87, 0.97, 0.91, 1, 0.95];
const BOOK_D = 160;
const BOOK_MAX_H = 210;

interface BoxProps {
  w: number;
  h: number;
  d: number;
  x?: number;
  y?: number;
  z?: number;
  className?: string;
  front?: ReactNode;
  back?: ReactNode;
  href?: string;
  label?: string;
  onEnter?: () => void;
  onLeave?: () => void;
}

// A CSS 3D cuboid: six faces around a centre point. Rendered as a link when
// `href` is set so books and the drawer stay keyboard reachable.
function Box({ w, h, d, x = 0, y = 0, z = 0, className = "", front, back, href, label, onEnter, onLeave }: BoxProps) {
  const style = {
    width: w,
    height: h,
    transform: `translate3d(${x - w / 2}px, ${y - h / 2}px, ${z}px)`,
    "--w": `${w}px`,
    "--h": `${h}px`,
    "--d": `${d}px`,
  } as CSSProperties;
  const faces = (
    <>
      <span className="bx-face bx-front">{front}</span>
      <span className="bx-face bx-back">{back}</span>
      <span className="bx-face bx-left" />
      <span className="bx-face bx-right" />
      <span className="bx-face bx-top" />
      <span className="bx-face bx-bottom" />
    </>
  );
  return href ? (
    <a
      className={`bx ${className}`}
      style={style}
      href={href}
      target="_blank"
      rel="noopener"
      aria-label={label}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
    >
      {faces}
    </a>
  ) : (
    <div className={`bx ${className}`} style={style} aria-hidden="true">
      {faces}
    </div>
  );
}

// Homepage reading list: a bookcase that starts with its back to the viewer.
// Scrolling orbits the camera round to the front, where each book (and the
// drawer) opens its review on /reading in a new tab.
export default function BookShelf({ books }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  useSceneFade(sectionRef, stickyRef);
  const camRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [front, setFront] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const cam = camRef.current;
    const backdrop = backdropRef.current;
    if (!section || !cam) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let fit = 1;
    let isFront = false;

    const measure = () => {
      const mobile = window.matchMedia("(max-width: 720px)").matches;
      fit = mobile
        ? Math.min(0.62, window.innerWidth / 640)
        : Math.min(1, window.innerHeight / 900, window.innerWidth / 1300);
    };

    // The viewer walks round a static room: the world is moved inversely to
    // the camera (yaw round the case, pitch from high to eye level, dolly in,
    // a little walking sway). The backdrop pans the other way as parallax.
    const apply = (p: number) => {
      // Approach from far away while orbiting round to the front.
      const near = reduced ? 1 : easeOutCubic(clamp01(p / 0.64));
      const o = reduced ? 1 : easeInOutCubic(clamp01((p - 0.06) / 0.6));
      const yaw = 180 - o * 202;
      const pitch = -24 + o * 15;
      const dolly = -2400 * (1 - near);
      const walk = Math.sin(o * Math.PI);
      const bob = Math.sin(o * Math.PI * 6) * 5 * walk;
      const roll = Math.sin(o * Math.PI * 3) * 0.8 * walk;
      cam.style.transform =
        `scale(${fit}) translate3d(0, ${bob}px, ${dolly}px) rotateZ(${roll}deg) ` +
        `rotateX(${pitch}deg) rotateY(${yaw}deg)`;
      if (backdrop) backdrop.style.transform = `translate3d(${(yaw / 360) * -900}px, 0, 0)`;

      const next = o > 0.97 && near > 0.97;
      if (next !== isFront) {
        isFront = next;
        setFront(next);
      }
    };

    measure();
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
  }, []);

  // Books 1–4 on the top shelf, the rest on the middle one.
  const rows = [books.slice(0, 4), books.slice(4)];
  const reading = books.filter((b) => b.status === "reading").length;
  const hoveredBook = hovered === null ? null : books[hovered];

  return (
    <section ref={sectionRef} id="reading" className={`bc${front ? " is-front" : ""}`}>
      <div ref={stickyRef} className="bc-sticky">
        <div className="bc-copy">
          <span className="eyebrow">02 — Reading list</span>
          <h2 className="bc-title">
            The <em>shelf.</em>
          </h2>
          <p className="bc-caption">
            {front
              ? "Pick a book — each one opens its review in a new tab."
              : "Keep scrolling to walk round to the front."}
          </p>
          <p className="bc-now" aria-live="polite">
            {hoveredBook ? (
              <>
                <span className="bc-now-title">{hoveredBook.shortTitle}</span>
                <span className="bc-now-meta">
                  {hoveredBook.author ?? "—"} ·{" "}
                  {hoveredBook.status === "reading" ? "Reading now" : "Finished"}
                </span>
              </>
            ) : (
              <span className="bc-now-meta">
                {pad(books.length)} books · {pad(reading)} reading now
              </span>
            )}
          </p>
          <a className="link-pill bc-cta" href="/reading" target="_blank" rel="noopener">
            <span>Open the library</span>
            <span className="arrow">↗</span>
          </a>
        </div>

        <div className="bc-stage">
          <div ref={backdropRef} className="bc-backdrop" aria-hidden="true">
            <span className="bc-window bc-window--a" />
            <span className="bc-window bc-window--b" />
            <span className="bc-window bc-window--c" />
          </div>
          <div ref={camRef} className="bc-cam">
            {/* Room: floor, rug, lamp and plant give the walk-around parallax.
                Floorboards, rug, lamp light and contact shadow share one plane. */}
            <div className="bc-ground" aria-hidden="true" />

            <Box className="bc-metal" w={92} h={10} d={92} x={300} y={H / 2 - 5} z={-180} />
            <Box className="bc-metal" w={8} h={500} d={8} x={300} y={H / 2 - 260} z={-180} />
            <Box className="bc-shade" w={124} h={96} d={124} x={300} y={H / 2 - 548} z={-180} />

            <Box className="bc-pot" w={96} h={104} d={96} x={300} y={H / 2 - 52} z={100} />
            <div className="bc-leaves" aria-hidden="true">
              <span className="bc-leaf-plane" />
              <span className="bc-leaf-plane bc-leaf-plane--cross" />
            </div>

            {/* Shell */}
            <Box
              className="bx--wood bc-backpanel"
              w={W}
              h={H}
              d={T}
              z={-D / 2 + T / 2}
              back={
                <span className="bc-stamp">
                  <span className="bc-stamp-mark">✺</span>
                  <span className="bc-stamp-name">Thanarak</span>
                  <span className="bc-stamp-sub">Field library · Est. 2026</span>
                  <span className="bc-stamp-hint">↓ scroll to walk around</span>
                </span>
              }
            />
            <Box className="bx--wood" w={T} h={H} d={D} x={-W / 2 + T / 2} />
            <Box className="bx--wood" w={T} h={H} d={D} x={W / 2 - T / 2} />
            <Box className="bx--wood" w={W} h={T} d={D} y={-H / 2 + T / 2} />
            <Box className="bx--wood" w={W} h={PLINTH} d={D} y={H / 2 - PLINTH / 2} />
            {FLOORS.map((fy) => (
              <Box
                key={fy}
                className="bx--wood"
                w={W - T * 2}
                h={SHELF}
                d={D - T}
                y={fy + SHELF / 2}
                z={T / 2}
              />
            ))}

            {/* Books */}
            {rows.map((row, r) => {
              let x = -W / 2 + T + 18;
              const offset = r === 0 ? 0 : rows[0].length;
              return row.map((b, j) => {
                const i = offset + j;
                const w = bookWidth[b.spineWidth];
                const h = BOOK_MAX_H * bookHeights[i % bookHeights.length];
                const cx = x + w / 2;
                x += w + 4;
                return (
                  <Box
                    key={b.title}
                    className={`bc-book bk--${b.palette}`}
                    w={w}
                    h={h}
                    d={BOOK_D}
                    x={cx}
                    y={FLOORS[r] - h / 2}
                    z={D / 2 - 12 - BOOK_D / 2}
                    href={`/reading#${bookSlug(b)}`}
                    label={`Read the review of ${b.title} (opens in a new tab)`}
                    onEnter={() => setHovered(i)}
                    onLeave={() => setHovered(null)}
                    front={
                      <span className="bc-spine">
                        <span className="bc-spine-num">{pad(i + 1)}</span>
                        <span className="bc-spine-title">{b.shortTitle}</span>
                        <span className="bc-spine-mark">✺</span>
                      </span>
                    }
                  />
                );
              });
            })}

            {/* Decorative flat stacks fill the empty end of each shelf. */}
            {[3, 2].map((count, r) =>
              Array.from({ length: count }, (_, k) => (
                <Box
                  key={`stack-${r}-${k}`}
                  className={`bc-flat bc-flat--${(r + k) % 3}`}
                  w={118 - k * 8}
                  h={22}
                  d={150 - k * 6}
                  x={W / 2 - T - 78 + (k % 2) * 6}
                  y={FLOORS[r] - 11 - k * 22}
                  z={D / 2 - 12 - 75}
                />
              ))
            )}

            {/* Drawer = the "open" button */}
            <Box
              className="bx--wood bc-drawer"
              w={W - T * 2 - 10}
              h={DRAWER_H}
              d={24}
              y={DRAWER_Y}
              z={D / 2 - 14}
              href="/reading"
              label="Open the library (opens in a new tab)"
              front={
                <span className="bc-drawer-face">
                  <span className="bc-drawer-handle" aria-hidden="true" />
                  <span className="bc-drawer-label">Open the library ↗</span>
                </span>
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}
