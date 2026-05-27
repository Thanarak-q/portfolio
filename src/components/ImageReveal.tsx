import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsomorphicLayoutEffect } from "../lib/useIsomorphicLayoutEffect";

gsap.registerPlugin(ScrollTrigger);

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

interface ImageRevealProps {
  index: number;
  total: number;
  name: string;
  eyebrow?: string;
  duration?: string;
  type?: string;
  year?: string;
  src: string;
  alt: string;
}

export default function ImageReveal({
  index,
  total,
  name,
  eyebrow = "Focus",
  src,
  alt,
}: ImageRevealProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  // Light scroll-driven scale on the image as it enters the viewport.
  // Starts at 0.88, lands at 1.0 when image is roughly centered.
  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const image = imageRef.current;
    if (!section || !image) return;

    // Bell-curve scale: small entering, full at center, small leaving.
    // p=0 → image just entering bottom; p=0.5 → centered; p=1 → fully exited top.
    const apply = (p: number) => {
      const isMobile = window.matchMedia("(max-width: 720px)").matches;
      const bell = Math.sin(clamp01(p) * Math.PI); // 0 → 1 → 0
      const scale = isMobile
        ? 0.86 + 0.14 * bell
        : 0.6 + 0.55 * bell; // desktop: 0.6 → 1.15 → 0.6
      image.style.transform = `scale(${scale})`;
    };

    apply(0.5); // initial render: assume mid-pass so no flash

    const st = ScrollTrigger.create({
      trigger: image,
      start: "top bottom",   // image top reaches viewport bottom
      end: "bottom top",     // image bottom reaches viewport top
      scrub: 0.4,
      onUpdate(self) {
        apply(self.progress);
      },
    });

    return () => st.kill();
  }, []);

  return (
    <section ref={sectionRef} className="image-reveal-static">
      <div className="ir-meta-top wrap">
        <span className="ir-eyebrow">{eyebrow}</span>
        <span className="ir-counter">
          {String(index).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>

      <h2 className="ir-title">
        <span className="ir-name">{name}</span>
      </h2>

      <div ref={imageRef} className="ir-image">
        <img src={src} alt={alt} loading="lazy" decoding="async" />
      </div>
    </section>
  );
}
