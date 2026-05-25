/* global React, RiseIn, SlideIn, MaskReveal, LineReveal, ScaleIn, HorizontalPanel */

// ===== Marquee — Victor Furuya-style infinite text strip, section divider =====
function Marquee({ items, speed = 50, italic = false }) {
  const content = items.map((t, i) => (
    <span key={i} className="marquee-item">
      {italic ? <em>{t}</em> : t}
      <span className="marquee-sep">✦</span>
    </span>
  ));
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track" style={{ animationDuration: `${speed}s` }}>
        {content}{content}{content}{content}
      </div>
    </div>
  );
}

// ===== About — lyrical, line-by-line mask reveal =====
function About() {
  return (
    <section id="about" className="content">
      <div className="wrap">
        <RiseIn distance={30}>
          <div className="eyebrow">01 — Who</div>
        </RiseIn>
        <LineReveal
          className="big-statement"
          lines={[
            "I look for the cracks",
            "<em>in quiet systems.</em>",
            "Then I write down",
            "what I learned.",
          ]}
        />
        <div className="grid" style={{ marginTop: 96 }}>
          <RiseIn distance={60} delay={0.05}>
            <div className="glass-liquid about-card">
              <p className="lead" style={{ margin: "0 0 22px" }}>
                By day I find the seams where things weren't meant to give way.
                In between, I keep the camera rolling on a slower hour.
              </p>
              <p className="body" style={{ margin: 0 }}>
                I'm an offensive security researcher focused on red-team operations and
                the new attack surface that arrives with large language models &mdash;
                prompt-level exploits, agent chain abuse, model supply chain. I like the
                part of the job that feels like film: long stretches of patient watching,
                then one decisive frame.
              </p>
            </div>
          </RiseIn>
          <div className="about-side">
            {[
              { k: "04", l: "Years adversary simulation" },
              { k: "37", l: "CVEs & disclosures shipped" },
              { k: "∞",  l: "Cumulus clouds collected" },
            ].map((s, i) => (
              <RiseIn key={s.k} distance={60} delay={0.10 + i * 0.08}>
                <div className="glass-liquid stat">
                  <span className="k">{s.k}</span>
                  <span className="l">{s.l}</span>
                </div>
              </RiseIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ===== Focus — gsap-style horizontal pinned panels =====
function Focus() {
  const cards = [
    {
      n: "02 / 01", title: "Red Team", em: "Operations",
      body: "Adversary emulation, assumed breach, internal pivots, and physical/social blends. Build playbooks that survive contact with reality.",
      tags: ["MITRE ATT&CK", "C2", "AD", "Phishing", "EDR Bypass"],
    },
    {
      n: "02 / 02", title: "AI", em: "Security",
      body: "Prompt injection, indirect injection, agent tool abuse, model supply chain, jailbreak research, eval harnesses for safety regressions.",
      tags: ["LLM Pentest", "RAG", "Guardrails", "MCP", "Red Eval"],
    },
    {
      n: "02 / 03", title: "Cloud &", em: "App",
      body: "Web app pentest, cloud config audits, identity attack paths, container escape. The boring layer between the model and the metal.",
      tags: ["AWS", "K8s", "OWASP", "IAM", "Burp"],
    },
    {
      n: "02 / 04", title: "Field", em: "Notes",
      body: "Public writeups, open-source harnesses, a small Substack on jailbreak taxonomy. The part of the work that doesn't sit in a vault.",
      tags: ["Writeups", "OSS", "Talks", "Workshops"],
    },
  ];
  return (
    <HorizontalPanel
      sectionHeightVH={420}
      eyebrow="02 — Focus"
      title={
        <h2 className="section-title" style={{ maxWidth: "20ch" }}>
          Three rooms <span className="it">I keep returning to,</span> and a fourth I share aloud.
        </h2>
      }
    >
      {cards.map((c) => (
        <div key={c.n} className="glass-liquid focus-card h-card">
          <div className="num">{c.n}</div>
          <h3>
            {c.title}<br />
            <span className="it">{c.em}</span>
          </h3>
          <p>{c.body}</p>
          <div className="tags">
            {c.tags.map((tg) => <span key={tg} className="tag">{tg}</span>)}
          </div>
        </div>
      ))}
    </HorizontalPanel>
  );
}

// ===== Work — list, each row slides in from right =====
function Work() {
  const rows = [
    { n: "001", title: "Shadow", em: "Operator", desc: "Multi-stage red-team engagement against a regional fintech: phishing → AD → ESC1 → DA in 11 days.", meta: "2025 · CONFIDENTIAL" },
    { n: "002", title: "Glasshouse", em: "", desc: "LLM agent harness exploit: indirect prompt injection via a vendor PDF, exfiltrating tool calls.", meta: "2025 · RESEARCH" },
    { n: "003", title: "Pale", em: "Cumulus", desc: "Cloud privilege-escalation chain across IAM, SSM, and a misconfigured KMS grant. Five CVEs filed.", meta: "2024 · DISCLOSED" },
    { n: "004", title: "Quiet", em: "Hours", desc: "Internal CTF and training program for a 600-person engineering org. Adversary simulation, by belt rank.", meta: "2024 · ONGOING" },
    { n: "005", title: "Field", em: "Notes", desc: "Public writeups on jailbreak taxonomy and a small Python harness for RAG red-evals.", meta: "ONGOING · OPEN-SOURCE" },
  ];
  return (
    <section id="work" className="content">
      <div className="wrap">
        <RiseIn distance={40}>
          <div className="eyebrow">03 — Selected work</div>
        </RiseIn>
        <LineReveal
          className="big-statement"
          lines={[
            "Things I've taken apart,",
            "<em>on purpose.</em>",
          ]}
        />
        <div className="list glass-liquid" style={{ marginTop: 56, borderRadius: 28, padding: 0 }}>
          {rows.map((r, i) => (
            <SlideIn key={r.n} dir="right" distance={120} delay={0.04 + i * 0.05}>
              <div className="row" style={{ borderTop: i === 0 ? "none" : "1px solid rgba(20,10,5,0.06)" }}>
                <div className="num">{r.n}</div>
                <div className="title">
                  {r.title} {r.em ? <span className="it">{r.em}</span> : null}
                </div>
                <div className="desc">{r.desc}</div>
                <div className="meta">{r.meta}</div>
              </div>
            </SlideIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ===== Contact — big closing statement + glass card =====
function Contact() {
  return (
    <section id="contact" className="content">
      <div className="wrap">
        <RiseIn distance={30}>
          <div className="eyebrow">04 — Contact</div>
        </RiseIn>
        <LineReveal
          className="big-statement"
          lines={[
            "Let's talk about",
            "<em>what could break.</em>",
          ]}
        />
        <ScaleIn from={0.96} blur={10} style={{ marginTop: 56 }}>
          <div className="glass-liquid contact-card">
            <p className="body" style={{ margin: 0, maxWidth: 540 }}>
              Open to red-team engagements, AI-security research collaborations,
              and the occasional long walk by a lake.
            </p>
            <div className="contact-actions">
              <a className="link-pill" href="mailto:hello@thanarak.dev">
                <span>hello@thanarak.dev</span><span className="arrow">↗</span>
              </a>
              <a className="link-pill" href="#">
                <span>github / thanarak</span><span className="arrow">↗</span>
              </a>
              <a className="link-pill" href="#">
                <span>linkedin / thanarak</span><span className="arrow">↗</span>
              </a>
              <a className="link-pill" href="#">
                <span>signal / on request</span><span className="arrow">↗</span>
              </a>
            </div>
          </div>
        </ScaleIn>
        <footer className="foot">
          © 2026 Thanarak Kanyaprasit · Shot on memory · Built with care
        </footer>
      </div>
    </section>
  );
}

Object.assign(window, { About, Focus, Work, Contact, Marquee });
