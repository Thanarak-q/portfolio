/* global React */
// Scroll-driven motion primitives.
const { useEffect: __mUE, useRef: __mUR, useState: __mUS, useMemo: __mUM } = React;

// progress 0..1 as section enters viewport
function useEnterProgress(ref, opts) {
  const startAt = (opts && opts.startAt) ?? 0.05;
  const endAt = (opts && opts.endAt) ?? 0.4;
  const [p, setP] = __mUS(0);
  __mUE(() => {
    const onScroll = () => {
      const el = ref.current; if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * (1 - startAt);
      const end = vh * endAt;
      const t = (start - r.top) / (start - end);
      setP(Math.max(0, Math.min(1, t)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ref, startAt, endAt]);
  return p;
}

// progress 0..1 driven by sticky pin (section taller than viewport)
function useSectionProgress(ref) {
  const [p, setP] = __mUS(0);
  __mUE(() => {
    const onScroll = () => {
      const el = ref.current; if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      setP(total > 0 ? scrolled / total : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ref]);
  return p;
}

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
const easeOutQuint = (t) => 1 - Math.pow(1 - t, 5);
const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const withDelay = (p, delay) => Math.max(0, Math.min(1, (p - delay) / (1 - delay)));

// Simple rise + fade
function RiseIn({ children, distance = 60, delay = 0, className = "", style = {} }) {
  const ref = __mUR(null);
  const p = useEnterProgress(ref);
  const e = easeOutCubic(withDelay(p, delay));
  return React.createElement("div", {
    ref, className,
    style: {
      transform: `translate3d(0, ${(1 - e) * distance}px, 0)`,
      opacity: e,
      willChange: "transform, opacity",
      ...style,
    },
  }, children);
}

// Horizontal slide-in
function SlideIn({ children, dir = "left", distance = 100, delay = 0, className = "", style = {} }) {
  const ref = __mUR(null);
  const p = useEnterProgress(ref);
  const e = easeOutQuint(withDelay(p, delay));
  const sign = dir === "left" ? -1 : dir === "right" ? 1 : 0;
  return React.createElement("div", {
    ref, className,
    style: {
      transform: `translate3d(${(1 - e) * sign * distance}px, 0, 0)`,
      opacity: e,
      willChange: "transform, opacity",
      ...style,
    },
  }, children);
}

// Mask reveal — clip-path sweeps from left to right
function MaskReveal({ children, dir = "right", delay = 0, className = "", style = {} }) {
  const ref = __mUR(null);
  const p = useEnterProgress(ref);
  const e = easeOutCubic(withDelay(p, delay));
  const clip = dir === "right"
    ? `inset(0 ${(1 - e) * 100}% 0 0)`
    : dir === "left"
    ? `inset(0 0 0 ${(1 - e) * 100}%)`
    : dir === "up"
    ? `inset(${(1 - e) * 100}% 0 0 0)`
    : `inset(0 0 ${(1 - e) * 100}% 0)`; // down
  return React.createElement("div", {
    ref, className,
    style: { clipPath: clip, WebkitClipPath: clip, willChange: "clip-path", ...style },
  }, children);
}

// Line-by-line reveal — splits a text string into lines, masks each with stagger.
// Lines move up + clip-path from bottom — feels like text "rising up from beneath a line"
function LineReveal({ lines, stagger = 0.10, className = "", lineStyle = {}, style = {} }) {
  const ref = __mUR(null);
  const p = useEnterProgress(ref, { startAt: 0.05, endAt: 0.55 });
  return React.createElement(
    "div",
    { ref, className, style },
    lines.map((line, i) => {
      const local = easeOutCubic(withDelay(p, i * stagger));
      return React.createElement(
        "div",
        {
          key: i,
          style: {
            overflow: "hidden",
            paddingBottom: "0.08em",
            marginBottom: "-0.08em",
            ...lineStyle,
          },
        },
        React.createElement(
          "div",
          {
            style: {
              display: "block",
              transform: `translate3d(0, ${(1 - local) * 110}%, 0)`,
              opacity: 0.0 + local,
              willChange: "transform, opacity",
            },
            dangerouslySetInnerHTML: { __html: line },
          },
        ),
      );
    }),
  );
}

// Scale + blur (kept for Contact)
function ScaleIn({ children, from = 0.94, blur = 14, className = "", style = {} }) {
  const ref = __mUR(null);
  const p = useEnterProgress(ref);
  const e = easeOutExpo(p);
  return React.createElement("div", {
    ref, className,
    style: {
      transform: `scale(${from + (1 - from) * e})`,
      opacity: e,
      filter: `blur(${(1 - e) * blur}px)`,
      willChange: "transform, opacity, filter",
      ...style,
    },
  }, children);
}

// ===== HorizontalPanel — gsap.com style pin + horizontal translate =====
// Section is sectionHeightVH tall. Inside, a sticky 100vh container; inside that,
// a flex row that translates X from 0 to -(trackWidth - viewport).
function HorizontalPanel({ children, sectionHeightVH = 400, title, eyebrow }) {
  const sectionRef = __mUR(null);
  const trackRef = __mUR(null);
  const [trackW, setTrackW] = __mUS(0);
  const p = useSectionProgress(sectionRef);

  __mUE(() => {
    const measure = () => {
      if (trackRef.current) setTrackW(trackRef.current.scrollWidth);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // First 12% of section reserved for entrance fade-in, last 12% for fade-out hold
  const ENTER = 0.10, EXIT = 0.95;
  const scrubP = p < ENTER ? 0 : p > EXIT ? 1 : (p - ENTER) / (EXIT - ENTER);
  const eased = easeInOutCubic(scrubP);

  const viewport = typeof window !== "undefined" ? window.innerWidth : 1200;
  const maxX = Math.max(0, trackW - viewport + 48);
  const x = -maxX * eased;

  // Title eyebrow fades out as we begin horizontal travel
  const titleAlpha = p < ENTER ? 1 : Math.max(0, 1 - (p - ENTER) / 0.06);

  return React.createElement(
    "section",
    {
      ref: sectionRef,
      className: "h-panel-section",
      style: { height: `${sectionHeightVH}vh`, position: "relative" },
    },
    React.createElement(
      "div",
      { className: "h-panel-sticky" },
      React.createElement(
        "div",
        { className: "h-panel-title", style: { opacity: titleAlpha } },
        eyebrow && React.createElement("div", { className: "eyebrow" }, eyebrow),
        title,
      ),
      React.createElement(
        "div",
        {
          className: "h-panel-viewport",
        },
        React.createElement(
          "div",
          {
            ref: trackRef,
            className: "h-panel-track",
            style: { transform: `translate3d(${x}px, 0, 0)`, willChange: "transform" },
          },
          children,
        ),
      ),
      React.createElement(
        "div",
        { className: "h-panel-progress" },
        React.createElement("div", {
          className: "fill",
          style: { width: `${eased * 100}%` },
        }),
      ),
    ),
  );
}

Object.assign(window, {
  useEnterProgress,
  useSectionProgress,
  easeOutCubic,
  easeOutExpo,
  easeOutQuint,
  easeInOutCubic,
  withDelay,
  RiseIn,
  SlideIn,
  MaskReveal,
  LineReveal,
  ScaleIn,
  HorizontalPanel,
});
