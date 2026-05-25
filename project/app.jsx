/* global React, ReactDOM, HeroClip, SlideUpClip, About, Focus, Work, Contact, Marquee, useTweaks, TweaksPanel, TweakSection, TweakSlider, TweakColor */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "glassBlur": 18,
  "glassTint": 22,
  "grain": 16,
  "vignette": 24,
  "leakHue": "#f6a86b",
  "accent": "#d65a3a",
  "heroRunway": 5,
  "interludeRunway": 4,
  "marqueeSpeed": 55
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty("--glass-blur", `${t.glassBlur}px`);
    r.style.setProperty("--glass-tint-alpha", `${t.glassTint / 100}`);
    r.style.setProperty("--leak", t.leakHue);
    r.style.setProperty("--leak-deep", t.accent);
    r.style.setProperty("--grain-opacity", `${t.grain / 100}`);
    r.style.setProperty("--vignette-alpha", `${t.vignette / 100}`);
  }, [t]);

  return (
    <>
      <HeroClip
        src="assets/clip-1.mp4"
        title="Thanarak"
        titleItalic="Kanyaprasit"
        role={<span>Red Team <span style={{opacity:0.5,margin:"0 8px"}}>/</span> Offensive Security <span style={{opacity:0.5,margin:"0 8px"}}>/</span> AI Security</span>}
        runwayVH={t.heroRunway * 100}
        showHint={true}
        chipLabel="CLIP 1 / 3"
        portalEyebrow="CHAPTER 02"
        portalLabel="who, quietly"
      />

      <About />

      <SlideUpClip
        src="assets/clip-2.mp4"
        eyebrow="Interlude — 00:06 / 00:18"
        title="Some attacks"
        titleItalic="look like running."
        caption="Forward momentum, low to the grass. The fastest path between two systems is rarely the obvious one."
        runwayVH={t.interludeRunway * 100}
        chipLabel="CLIP 2 / 3"
        exitDirection="left"
        incoming={
          <section className="up-next">
            <div className="up-next-inner">
              <div className="eyebrow">Up next</div>
              <h2 className="up-next-title">
                Focus &mdash;<br />
                <em>three rooms, and a fourth.</em>
              </h2>
              <p className="up-next-caption">
                Red Team. AI Security. Cloud &amp; App. Field Notes.
              </p>
            </div>
          </section>
        }
      />

      {/* Static "Up next" intro page — visually identical to the incoming swipe panel,
          so when the swipe completes the user lands here and just scrolls down normally. */}
      <section className="up-next">
        <div className="up-next-inner">
          <div className="eyebrow">Up next</div>
          <h2 className="up-next-title">
            Focus &mdash;<br />
            <em>three rooms, and a fourth.</em>
          </h2>
          <p className="up-next-caption">
            Red Team. AI Security. Cloud &amp; App. Field Notes.
          </p>
        </div>
      </section>

      <Focus />

      <SlideUpClip
        src="assets/clip-3.mp4"
        eyebrow="Interlude — 00:12 / 00:18"
        title="The best ones"
        titleItalic="look like standing still."
        caption="Patient watching, listening for the soft click. A camera rolling while nothing seems to happen."
        runwayVH={t.interludeRunway * 100}
        chipLabel="CLIP 3 / 3"
      />

      <Marquee items={["SELECTED WORK", "★", "2024 — 2026", "CONFIDENTIAL", "OPEN-SOURCE", "RESEARCH"]} speed={t.marqueeSpeed} />

      <Work />
      <Contact />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Liquid glass" />
        <TweakSlider label="Blur" value={t.glassBlur} min={6} max={36} step={1} unit="px" onChange={(v) => setTweak("glassBlur", v)} />
        <TweakSlider label="Tint opacity" value={t.glassTint} min={4} max={45} step={1} unit="%" onChange={(v) => setTweak("glassTint", v)} />

        <TweakSection label="Film atmosphere" />
        <TweakSlider label="Grain" value={t.grain} min={0} max={40} step={1} unit="%" onChange={(v) => setTweak("grain", v)} />
        <TweakSlider label="Vignette" value={t.vignette} min={0} max={60} step={1} unit="%" onChange={(v) => setTweak("vignette", v)} />

        <TweakSection label="Color" />
        <TweakColor label="Light leak" value={t.leakHue} options={["#f6a86b", "#ffd9b6", "#e7a5b7", "#b08cd8"]} onChange={(v) => setTweak("leakHue", v)} />
        <TweakColor label="Accent" value={t.accent} options={["#d65a3a", "#b04a6f", "#5a6fae", "#3a8c6b"]} onChange={(v) => setTweak("accent", v)} />

        <TweakSection label="Scroll" />
        <TweakSlider label="Hero runway" value={t.heroRunway} min={3} max={8} step={1} unit="×vh" onChange={(v) => setTweak("heroRunway", v)} />
        <TweakSlider label="Interludes" value={t.interludeRunway} min={3} max={7} step={1} unit="×vh" onChange={(v) => setTweak("interludeRunway", v)} />
        <TweakSlider label="Marquee speed" value={t.marqueeSpeed} min={20} max={120} step={5} unit="s" onChange={(v) => setTweak("marqueeSpeed", v)} />
      </TweaksPanel>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
document.querySelector(".loading")?.remove();
