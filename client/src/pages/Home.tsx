/*
 * Measured Field Notes: CipherLab’s interface reads like a precise research notebook.
 * This page keeps evidence visible, contrasts safe and weak implementations, and uses
 * restrained copper/green motion only when a packet or experiment state changes.
 */
import { useEffect, useMemo, useState } from "react";
import * as d3 from "d3";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  Beaker,
  BookOpenCheck,
  Bug,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  FlaskConical,
  Hash,
  KeyRound,
  Layers3,
  LockKeyhole,
  Menu,
  Network,
  Play,
  Radio,
  RefreshCcw,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  TriangleAlert,
  X,
  Zap,
} from "lucide-react";

const logoUrl = "/manus-storage/cipherlab-mark_767a7ab9.png";
const heroUrl = "/manus-storage/cipherlab-hero-desk-retry_2511df8c.png";

type Section = "overview" | "algorithms" | "attacks" | "notes" | "api";
type AlgorithmId = "aes" | "rsa" | "dh" | "sha" | "hmac" | "signatures";

type Algorithm = {
  id: AlgorithmId;
  family: string;
  name: string;
  summary: string;
  status: string;
  tone: "green" | "orange" | "blue";
  icon: typeof LockKeyhole;
  evidence: string;
};

const algorithms: Algorithm[] = [
  {
    id: "aes",
    family: "SYMMETRIC",
    name: "AES",
    summary: "One shared secret turns readable blocks into ciphertext.",
    status: "Ready",
    tone: "green",
    icon: LockKeyhole,
    evidence: "Observe substitution, diffusion, and why IV reuse leaks structure.",
  },
  {
    id: "rsa",
    family: "ASYMMETRIC",
    name: "RSA",
    summary: "A public key can lock a message that only a private key opens.",
    status: "Ready",
    tone: "blue",
    icon: KeyRound,
    evidence: "Trace modular exponentiation with deliberately tiny teaching primes.",
  },
  {
    id: "dh",
    family: "KEY EXCHANGE",
    name: "Diffie–Hellman",
    summary: "Two parties agree on a secret without sending the secret itself.",
    status: "Interactive",
    tone: "orange",
    icon: Network,
    evidence: "Change the public base and watch a shared secret emerge.",
  },
  {
    id: "sha",
    family: "HASHING",
    name: "SHA-256",
    summary: "A one-way digest turns any message into a fixed fingerprint.",
    status: "Ready",
    tone: "green",
    icon: Hash,
    evidence: "Flip one character and compare the avalanche across 256 bits.",
  },
  {
    id: "hmac",
    family: "AUTHENTICITY",
    name: "HMAC",
    summary: "A keyed digest tests whether a message arrived unchanged.",
    status: "Ready",
    tone: "blue",
    icon: ShieldCheck,
    evidence: "Separate integrity from secrecy and inspect the shared key boundary.",
  },
  {
    id: "signatures",
    family: "AUTHENTICITY",
    name: "Signatures",
    summary: "A private key proves who authored a message; a public key verifies it.",
    status: "Ready",
    tone: "green",
    icon: ScanSearch,
    evidence: "Alter the payload and see verification fail without revealing the key.",
  },
];

const attackCards = [
  {
    id: "password",
    title: "Weak password",
    label: "BRUTE FORCE",
    risk: "HIGH",
    description: "A four-character secret is not a security boundary when the search space is tiny.",
    metric: "1,296 candidates",
    accent: "orange",
    icon: Bug,
  },
  {
    id: "replay",
    title: "Replay attack",
    label: "STATE FAILURE",
    risk: "MEDIUM",
    description: "A valid packet becomes dangerous when a receiver cannot tell if it is old.",
    metric: "nonce missing",
    accent: "orange",
    icon: Radio,
  },
  {
    id: "mitm",
    title: "Man-in-the-middle",
    label: "KEY EXCHANGE",
    risk: "HIGH",
    description: "Without authentication, a network intermediary can negotiate two secrets.",
    metric: "2 false keys",
    accent: "orange",
    icon: Network,
  },
  {
    id: "collision",
    title: "Collision concept",
    label: "HASHING",
    risk: "LOW",
    description: "Toy hashes make two different messages share an output so the birthday bound is tangible.",
    metric: "toy space: 16 bits",
    accent: "blue",
    icon: Layers3,
  },
];

const fieldNotes = [
  { id: "OBS-01", tag: "FOUNDATION", title: "Security is a system property.", body: "A primitive can be mathematically sound and still fail when its key, nonce, random source, or verification boundary is handled carelessly.", evidence: "Pair every primitive with the assumption it needs.", tone: "green" },
  { id: "OBS-02", tag: "HASHING", title: "A digest is not encryption.", body: "A hash gives you a compact fingerprint, not a reversible message. Its useful question is whether input changed—not whether the input is secret.", evidence: "Same input, same digest. Tiny input change, unrelated-looking output.", tone: "blue" },
  { id: "OBS-03", tag: "KEY EXCHANGE", title: "Public does not mean trusted.", body: "Diffie–Hellman can establish a shared secret, but authentication is what binds that secret to the intended peer.", evidence: "An unverified public key can be replaced in transit.", tone: "orange" },
  { id: "OBS-04", tag: "OPERATIONS", title: "Randomness is part of the protocol.", body: "A predictable key or nonce collapses the search space. Secure primitives cannot compensate for values that an attacker can guess.", evidence: "Entropy is not a detail; it is material in the construction.", tone: "orange" },
];

const apiEndpoints = [
  { method: "POST", path: "/api/v1/experiments/run", purpose: "Run a deterministic teaching experiment", status: "ready" },
  { method: "GET", path: "/api/v1/algorithms", purpose: "List supported primitives and metadata", status: "ready" },
  { method: "POST", path: "/api/v1/attacks/simulate", purpose: "Reveal one deliberately weak assumption", status: "ready" },
  { method: "GET", path: "/api/v1/runs/:id", purpose: "Retrieve an experiment trace", status: "planned" },
];

const traceSteps = [
  { actor: "Alice", detail: "encrypt(payload, key)", state: "trusted" },
  { actor: "Network", detail: "ciphertext + nonce", state: "observed" },
  { actor: "Attacker", detail: "replay(packet)", state: "danger" },
  { actor: "Bob", detail: "accept? verify?", state: "pending" },
];

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function StatusPill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "green" | "orange" | "blue" | "neutral" }) {
  return <span className={classNames("status-pill", `status-pill--${tone}`)}>{children}</span>;
}

function NetworkDiagram({ attackRan }: { attackRan: boolean }) {
  return (
    <div className="network-diagram" aria-label="Alice sends an encrypted message through a network to Bob while an attacker observes it">
      <svg viewBox="0 0 900 270" role="img" aria-hidden="true">
        <defs>
          <marker id="trace-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="currentColor" />
          </marker>
          <filter id="soft-paper-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#1f2421" floodOpacity="0.16" />
          </filter>
        </defs>
        <path className="trace-guide" d="M116 92 C240 92 240 92 332 92 S510 92 590 92 S748 92 814 92" />
        <path className={classNames("trace-flow", attackRan && "trace-flow--active")} d="M116 92 C240 92 240 92 332 92 S510 92 590 92 S748 92 814 92" markerEnd="url(#trace-arrow)" />
        <path className={classNames("trace-intercept", attackRan && "trace-intercept--active")} d="M590 92 C590 92 590 187 590 187" markerEnd="url(#trace-arrow)" />
        <circle className="trace-node trace-node--alice" cx="116" cy="92" r="28" />
        <circle className="trace-node trace-node--network" cx="332" cy="92" r="28" />
        <circle className="trace-node trace-node--network" cx="814" cy="92" r="28" />
        <circle className={classNames("trace-node trace-node--attacker", attackRan && "trace-node--active")} cx="590" cy="187" r="28" />
        <g className="trace-label" transform="translate(74 136)"><text>Alice</text><text y="20" className="trace-label__mono">encrypt</text></g>
        <g className="trace-label" transform="translate(283 136)"><text>Network</text><text y="20" className="trace-label__mono">ciphertext</text></g>
        <g className="trace-label" transform="translate(548 231)"><text>Attacker</text><text y="20" className="trace-label__mono">{attackRan ? "replayed" : "watching"}</text></g>
        <g className="trace-label" transform="translate(770 136)"><text>Bob</text><text y="20" className="trace-label__mono">verify</text></g>
        <text x="432" y="67" className="trace-packet">encrypted message</text>
        <text x="609" y="151" className="trace-packet trace-packet--orange">intercepted</text>
      </svg>
    </div>
  );
}

function HashGrid({ salt }: { salt: number }) {
  const cells = useMemo(() => {
    const color = d3.scaleLinear<string>().domain([0, 1]).range(["#e9e1d2", "#c65a2e"]);
    return Array.from({ length: 64 }, (_, index) => {
      const wave = Math.sin(index * 1.91 + salt * 0.7) * 0.35 + 0.5;
      const spike = index % 11 === salt % 11 ? 0.25 : 0;
      return { value: Math.min(1, Math.max(0, wave + spike)), color: color(Math.min(1, Math.max(0, wave + spike))) };
    });
  }, [salt]);

  return (
    <div className="hash-grid" aria-label="Hash avalanche visualization">
      {cells.map((cell, index) => <span key={index} style={{ backgroundColor: cell.color }} aria-hidden="true" />)}
    </div>
  );
}

function Sidebar({ activeSection, setActiveSection, onClose }: { activeSection: Section; setActiveSection: (section: Section) => void; onClose?: () => void }) {
  const navItems: Array<{ id: Section; label: string; icon: typeof FlaskConical; meta: string }> = [
    { id: "overview", label: "Overview", icon: Activity, meta: "00" },
    { id: "algorithms", label: "Algorithms", icon: FlaskConical, meta: "06" },
    { id: "attacks", label: "Attack simulations", icon: Bug, meta: "04" },
  ];
  return (
    <aside className="sidebar">
      <div className="sidebar__topline"><span>CL / LABORATORY</span><span className="sidebar__dot" /></div>
      <div className="brand-lockup">
        <img className="brand-lockup__mark" src={logoUrl} alt="" />
        <div><div className="brand-lockup__name">CipherLab</div><div className="brand-lockup__descriptor">Applied cryptography</div></div>
        {onClose && <button className="icon-button sidebar__close" onClick={onClose} aria-label="Close navigation"><X size={18} /></button>}
      </div>
      <div className="sidebar__section-label">LAB BENCH</div>
      <nav className="sidebar__nav" aria-label="Main navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          return <button key={item.id} className={classNames("sidebar__nav-item", activeSection === item.id && "sidebar__nav-item--active")} onClick={() => { setActiveSection(item.id); onClose?.(); }}>
            <Icon size={17} strokeWidth={1.8} /><span>{item.label}</span><span className="sidebar__nav-meta">{item.meta}</span>
          </button>;
        })}
      </nav>
      <div className="sidebar__section-label sidebar__section-label--spaced">REFERENCE</div>
      <nav className="sidebar__nav" aria-label="Reference navigation">
        <button className={classNames("sidebar__nav-item", "sidebar__nav-item--muted", activeSection === "notes" && "sidebar__nav-item--active")} onClick={() => { setActiveSection("notes"); onClose?.(); }}><BookOpenCheck size={17} strokeWidth={1.8} /><span>Field notes</span><ChevronRight size={14} className="sidebar__nav-arrow" /></button>
        <button className={classNames("sidebar__nav-item", "sidebar__nav-item--muted", activeSection === "api" && "sidebar__nav-item--active")} onClick={() => { setActiveSection("api"); onClose?.(); }}><TerminalSquare size={17} strokeWidth={1.8} /><span>API contract</span><ChevronRight size={14} className="sidebar__nav-arrow" /></button>
      </nav>
      <div className="sidebar__footer">
        <div className="sidebar__footer-status"><span className="live-dot" /> simulator online</div>
        <div className="sidebar__footer-copy">A visual lab for the assumptions<br />behind secure systems.</div>
        <div className="sidebar__version"><span>BUILD 0.4.2</span><span>RUST / REACT</span></div>
      </div>
    </aside>
  );
}

function Topbar({ activeSection, onMenu }: { activeSection: Section; onMenu: () => void }) {
  const sectionLabel = activeSection === "overview" ? "OVERVIEW" : activeSection === "algorithms" ? "ALGORITHMS" : activeSection === "attacks" ? "ATTACK SIMULATIONS" : activeSection === "notes" ? "FIELD NOTES" : "API CONTRACT";
  return <header className="topbar">
    <button className="icon-button topbar__menu" onClick={onMenu} aria-label="Open navigation"><Menu size={20} /></button>
    <div className="topbar__crumb"><span>WORKSPACE</span><ChevronRight size={14} /><strong>{sectionLabel}</strong></div>
    <div className="topbar__actions"><span className="topbar__status"><span className="live-dot" /> local simulator</span><div className="avatar" aria-label="Current user">CL</div></div>
  </header>;
}

function Overview({ setActiveSection, setSelectedAlgorithm, setSelectedAttack }: { setActiveSection: (section: Section) => void; setSelectedAlgorithm: (id: AlgorithmId) => void; setSelectedAttack: (id: string) => void }) {
  return <>
    <section className="hero-panel">
      <div className="hero-panel__copy">
        <div className="eyebrow"><span className="eyebrow__line" /> EXPERIMENT 00 <span className="eyebrow__slash">/</span> ORIENT</div>
        <h1>See the<br /><em>assumptions.</em></h1>
        <p className="hero-panel__lede">A working laboratory for understanding what encryption, hashing, and signatures actually protect—and where weak implementations leave a door open.</p>
        <div className="hero-panel__actions"><button className="button button--primary" onClick={() => setActiveSection("algorithms")}><Play size={15} fill="currentColor" /> open the lab</button><button className="text-button" onClick={() => setActiveSection("attacks")}>scan attack surfaces <ArrowRight size={15} /></button></div>
        <div className="hero-panel__notation"><span>FIELD NOTE</span> Security is not a single algorithm. It is the set of assumptions around one.</div>
      </div>
      <div className="hero-panel__art" style={{ backgroundImage: `url(${heroUrl})` }} aria-label="Abstract cryptography field notes" role="img"><div className="hero-panel__art-tag">VISUAL INDEX / 01</div><div className="hero-panel__art-caption">protocols as<br />observable systems</div></div>
    </section>
    <section className="metric-strip" aria-label="Laboratory summary">
      <div className="metric"><span className="metric__label">EXPERIMENTS</span><strong>08</strong><span className="metric__note">guided benches</span></div>
      <div className="metric"><span className="metric__label">PRIMITIVES</span><strong>06</strong><span className="metric__note">implemented in Rust</span></div>
      <div className="metric"><span className="metric__label">ATTACK PATHS</span><strong>04</strong><span className="metric__note">safe, toy-scale demos</span></div>
      <div className="metric metric--accent"><span className="metric__label">LAST RUN</span><strong>02:14</strong><span className="metric__note">minutes ago <ArrowDownRight size={13} /></span></div>
    </section>
    <section className="section-heading"><div><div className="eyebrow"><span className="eyebrow__line" /> CURRENT BENCH</div><h2>From plaintext to proof.</h2></div><p>Start with a primitive. Then change one assumption and watch the evidence move.</p></section>
    <section className="bench-grid">
      <article className="bench-card bench-card--trace">
        <div className="card-head"><div><span className="card-kicker"><CircleDot size={13} /> LIVE TRACE / 01</span><h3>Message in transit</h3></div><StatusPill tone="green"><span className="live-dot live-dot--small" /> ready to run</StatusPill></div>
        <NetworkDiagram attackRan={false} />
        <div className="trace-footer"><span><span className="trace-footer__key trace-footer__key--green" /> trusted flow</span><span><span className="trace-footer__key trace-footer__key--orange" /> interception point</span><button className="icon-text-button" onClick={() => { setSelectedAttack("mitm"); setActiveSection("attacks"); }}>open scenario <ArrowRight size={14} /></button></div>
      </article>
      <article className="bench-card bench-card--brief">
        <div className="card-head"><div><span className="card-kicker"><Zap size={13} /> BENCH BRIEF / 02</span><h3>One message, six lenses.</h3></div><Sparkles size={18} className="card-head__spark" /></div>
        <p className="bench-card__description">The same payload can be encrypted, hashed, authenticated, exchanged, or signed. Each primitive answers a different question.</p>
        <div className="lens-list">{algorithms.slice(0, 4).map((item, index) => { const Icon = item.icon; return <button className="lens-row" key={item.id} onClick={() => { setSelectedAlgorithm(item.id); setActiveSection("algorithms"); }}><span className={classNames("lens-row__index", `lens-row__index--${item.tone}`)}>0{index + 1}</span><Icon size={16} /><span className="lens-row__name">{item.name}</span><span className="lens-row__hint">{item.family.toLowerCase()}</span><ChevronRight size={15} /></button>; })}</div>
        <button className="button button--subtle" onClick={() => setActiveSection("algorithms")}>view all primitives <ArrowRight size={15} /></button>
      </article>
    </section>
    <section className="section-heading section-heading--compact"><div><div className="eyebrow"><span className="eyebrow__line" /> FIELD NOTES</div><h2>Weaknesses worth seeing.</h2></div><button className="text-button" onClick={() => setActiveSection("attacks")}>all attack simulations <ArrowRight size={15} /></button></section>
    <section className="attack-grid">{attackCards.slice(0, 3).map((attack) => { const Icon = attack.icon; return <button key={attack.id} className="attack-card" onClick={() => { setSelectedAttack(attack.id); setActiveSection("attacks"); }}><div className="attack-card__top"><span className={classNames("attack-card__icon", `attack-card__icon--${attack.accent}`)}><Icon size={18} /></span><span className={classNames("risk-label", attack.risk === "HIGH" ? "risk-label--high" : "risk-label--low")}>{attack.risk} RISK</span></div><span className="attack-card__label">{attack.label}</span><h3>{attack.title}</h3><p>{attack.description}</p><div className="attack-card__footer"><span>{attack.metric}</span><ChevronRight size={16} /></div></button>; })}</section>
  </>;
}

function AlgorithmExplorer({ selectedAlgorithm, setSelectedAlgorithm }: { selectedAlgorithm: AlgorithmId; setSelectedAlgorithm: (id: AlgorithmId) => void }) {
  const selected = algorithms.find((algorithm) => algorithm.id === selectedAlgorithm) ?? algorithms[0];
  const Icon = selected.icon;
  const [runCount, setRunCount] = useState(0);
  const [input, setInput] = useState("meet me at the lab");
  const isHash = selected.id === "sha";
  return <>
    <section className="section-heading section-heading--algorithms"><div><div className="eyebrow"><span className="eyebrow__line" /> EXPERIMENT 01 <span className="eyebrow__slash">/</span> PRIMITIVES</div><h1>Choose a lens.<br /><em>Change a variable.</em></h1></div><p>Educational implementations keep the moving parts visible. Switch primitives without leaving the bench.</p></section>
    <section className="algorithm-layout">
      <div className="algorithm-index"><div className="index-title"><span>PRIMITIVE INDEX</span><span>06 TOTAL</span></div>{algorithms.map((algorithm, index) => { const AlgorithmIcon = algorithm.icon; return <button className={classNames("algorithm-index__item", selected.id === algorithm.id && "algorithm-index__item--active")} key={algorithm.id} onClick={() => setSelectedAlgorithm(algorithm.id)}><span className="algorithm-index__number">0{index + 1}</span><AlgorithmIcon size={17} /><span className="algorithm-index__name">{algorithm.name}</span><StatusPill tone={algorithm.tone}>{algorithm.status}</StatusPill><ChevronRight size={15} /></button>; })}<div className="index-footnote"><span className="index-footnote__mark">i</span><span>These are teaching implementations. Do not use them to protect production data.</span></div></div>
      <article className="algorithm-detail">
        <div className="algorithm-detail__top"><div className="algorithm-detail__title"><span className={classNames("algorithm-detail__icon", `algorithm-detail__icon--${selected.tone}`)}><Icon size={22} /></span><div><span className="card-kicker">{selected.family} / 0{algorithms.findIndex((item) => item.id === selected.id) + 1}</span><h2>{selected.name}</h2></div></div><StatusPill tone={selected.tone}><Check size={13} /> {selected.status.toLowerCase()}</StatusPill></div>
        <p className="algorithm-detail__summary">{selected.summary}</p>
        <div className="algorithm-detail__workspace">
          <div className="input-panel"><label htmlFor="payload">PAYLOAD</label><textarea id="payload" value={input} onChange={(event) => setInput(event.target.value)} /><div className="input-panel__meta"><span>UTF-8 / {input.length} chars</span><span className="mono">toy-mode</span></div><button className="button button--primary button--wide" onClick={() => setRunCount((value) => value + 1)}><Play size={15} fill="currentColor" /> run {selected.name.toLowerCase()}</button></div>
          <div className={classNames("evidence-panel", isHash && "evidence-panel--hash")}>{isHash ? <><div className="evidence-panel__head"><span className="card-kicker"><Hash size={13} /> AVALANCHE MAP</span><span className="evidence-panel__run">RUN {String(runCount).padStart(2, "0")}</span></div><HashGrid salt={runCount + input.length} /><div className="digest-line"><span className="digest-line__label">DIGEST</span><code>{runCount % 2 === 0 ? "8d6f…c1a9" : "42bc…7e3d"}</code><span className="digest-line__status">256 BITS</span></div></> : <><div className="evidence-panel__head"><span className="card-kicker"><Activity size={13} /> TRANSFORMATION</span><span className="evidence-panel__run">RUN {String(runCount).padStart(2, "0")}</span></div><div className="transform-stack"><div className="transform-block transform-block--input"><span>PLAINTEXT</span><code>{input || "empty payload"}</code></div><ArrowDownRight size={17} className="transform-arrow" /><div className={classNames("transform-block", selected.tone === "orange" ? "transform-block--orange" : "transform-block--output")}><span>{selected.id === "rsa" ? "PUBLIC-KEY OP" : selected.id === "dh" ? "SHARED STATE" : selected.id === "hmac" ? "AUTH TAG" : selected.id === "signatures" ? "SIGNATURE" : "CIPHERTEXT"}</span><code>{selected.id === "dh" ? "gˣʸ mod p = 08" : selected.id === "signatures" ? "sig: 4f8a…90d2" : selected.id === "hmac" ? "tag: 5d2c…e81b" : "9c 2e 4a 7f …"}</code></div></div></>}
            <div className="evidence-note"><span className="evidence-note__mark">OBS</span><span>{selected.evidence}</span></div>
          </div>
        </div>
        <div className="algorithm-detail__footer"><span><span className="live-dot live-dot--small" /> simulation state: deterministic</span><span>implementation target <strong>Rust</strong></span></div>
      </article>
    </section>
  </>;
}

function AttackSimulator({ selectedAttack, setSelectedAttack }: { selectedAttack: string; setSelectedAttack: (id: string) => void }) {
  const [attackRan, setAttackRan] = useState(false);
  const selected = attackCards.find((attack) => attack.id === selectedAttack) ?? attackCards[0];
  const Icon = selected.icon;
  return <>
    <section className="section-heading section-heading--algorithms"><div><div className="eyebrow"><span className="eyebrow__line" /> EXPERIMENT 02 <span className="eyebrow__slash">/</span> ADVERSARIAL LAB</div><h1>Where the protocol<br /><em>gives something away.</em></h1></div><p>These are toy-scale attacks for learning. The point is not to break real systems—it is to see the assumption that made the break possible.</p></section>
    <section className="attack-lab-layout">
      <div className="attack-selector"><div className="index-title"><span>SCENARIO INDEX</span><span>04 TOTAL</span></div>{attackCards.map((attack, index) => { const AttackIcon = attack.icon; return <button className={classNames("scenario-item", selected.id === attack.id && "scenario-item--active")} key={attack.id} onClick={() => { setSelectedAttack(attack.id); setAttackRan(false); }}><span className="algorithm-index__number">0{index + 1}</span><span className={classNames("scenario-item__icon", `scenario-item__icon--${attack.accent}`)}><AttackIcon size={16} /></span><span className="scenario-item__copy"><strong>{attack.title}</strong><small>{attack.label}</small></span><span className={classNames("risk-label", attack.risk === "HIGH" ? "risk-label--high" : "risk-label--low")}>{attack.risk}</span></button>; })}</div>
      <article className="attack-lab-card"><div className="attack-lab-card__header"><div className="algorithm-detail__title"><span className="algorithm-detail__icon algorithm-detail__icon--orange"><Icon size={21} /></span><div><span className="card-kicker">{selected.label} / ADVERSARIAL NOTE</span><h2>{selected.title}</h2></div></div><StatusPill tone="orange"><TriangleAlert size={13} /> deliberately weak</StatusPill></div><p className="attack-lab-card__description">{selected.description}</p><div className="attack-lab-card__metric"><span>OBSERVED WEAKNESS</span><strong>{selected.metric}</strong><span className="attack-lab-card__metric-note">reduced teaching space</span></div><div className="attack-lab-card__visual"><NetworkDiagram attackRan={attackRan} /><div className="visual-stamp">ATTACK SURFACE<br /><strong>{attackRan ? "EXPOSED" : "MAPPED"}</strong></div></div><div className="attack-lab-card__controls"><div className="step-status"><span className="step-status__label">RUN STATE</span><strong>{attackRan ? "evidence captured" : "awaiting input"}</strong><span>{attackRan ? "The weak assumption is now visible in the trace." : "Run the scenario to reveal the break."}</span></div><div className="control-actions"><button className="button button--primary" onClick={() => setAttackRan(true)}><Play size={15} fill="currentColor" /> run attack</button><button className="button button--ghost" onClick={() => setAttackRan(false)}><RefreshCcw size={15} /> reset</button></div></div><div className={classNames("repair-note", attackRan && "repair-note--visible")}><span className="repair-note__icon"><ShieldCheck size={16} /></span><div><span className="repair-note__label">REPAIR THE PROTOCOL</span><p>{selected.id === "replay" ? "Include a unique nonce or monotonic counter, and reject messages that have already been seen." : selected.id === "mitm" ? "Authenticate the key exchange so Alice and Bob can verify who they are speaking with." : selected.id === "password" ? "Use a slow password hash with a unique salt, then enforce a strong password policy." : "Use a modern hash with an output space large enough that accidental matches are infeasible."}</p></div></div></article>
    </section>
  </>;
}

function FieldNotesPage({ setActiveSection }: { setActiveSection: (section: Section) => void }) {
  return <>
    <section className="section-heading section-heading--algorithms"><div><div className="eyebrow"><span className="eyebrow__line" /> REFERENCE 03 <span className="eyebrow__slash">/</span> FIELD NOTES</div><h1>Write down what<br /><em>the protocol assumed.</em></h1></div><p>Short observations from the bench. Read these beside an experiment, then return to the trace and test the claim.</p></section>
    <section className="notes-layout">
      <div className="notes-stack">{fieldNotes.map((note, index) => <article className="note-card" key={note.id}><div className="note-card__margin"><span>{note.id}</span><span className={classNames("note-card__dot", `note-card__dot--${note.tone}`)} /></div><div className="note-card__body"><div className="note-card__meta"><span className="card-kicker"><BookOpenCheck size={13} /> {note.tag}</span><span>0{index + 1} / 04</span></div><h2>{note.title}</h2><p>{note.body}</p><div className="note-card__evidence"><CheckCircle2 size={15} /><span>{note.evidence}</span></div></div></article>)}</div>
      <aside className="notes-aside"><div className="notes-aside__stamp"><Beaker size={18} /><span>LAB NOTE<br /><strong>CL—REF</strong></span></div><h2>Keep the boundary visible.</h2><p>When a primitive is introduced, name the thing it protects, the thing it does not protect, and the assumption that connects the two.</p><div className="notes-aside__rule" /><span className="card-kicker">NEXT READING</span><button className="notes-aside__link" onClick={() => setActiveSection("algorithms")}>open primitive index <ArrowRight size={15} /></button><button className="notes-aside__link" onClick={() => setActiveSection("attacks")}>inspect an attack <ArrowRight size={15} /></button></aside>
    </section>
  </>;
}

function ApiContractPage({ setActiveSection }: { setActiveSection: (section: Section) => void }) {
  return <>
    <section className="section-heading section-heading--algorithms"><div><div className="eyebrow"><span className="eyebrow__line" /> REFERENCE 04 <span className="eyebrow__slash">/</span> API CONTRACT</div><h1>Every experiment<br /><em>leaves evidence.</em></h1></div><p>A plain-language contract for the future Axum service: small payloads in, deterministic traces out, and no production secrets anywhere near the teaching surface.</p></section>
    <section className="api-layout">
      <article className="api-panel"><div className="api-panel__header"><div><span className="card-kicker"><TerminalSquare size={13} /> HTTP SURFACE / V1</span><h2>Experiment endpoints</h2></div><StatusPill tone="green"><span className="live-dot live-dot--small" /> contract mapped</StatusPill></div><div className="endpoint-list">{apiEndpoints.map((endpoint) => <div className="endpoint-row" key={endpoint.path}><span className={classNames("method-badge", `method-badge--${endpoint.method.toLowerCase()}`)}>{endpoint.method}</span><code>{endpoint.path}</code><span className="endpoint-row__purpose">{endpoint.purpose}</span><StatusPill tone={endpoint.status === "ready" ? "green" : "neutral"}>{endpoint.status}</StatusPill></div>)}</div><div className="api-panel__footer"><span>Content-Type: application/json</span><span>deterministic toy mode</span></div></article>
      <aside className="api-side"><div className="api-side__header"><span className="card-kicker"><Network size={13} /> TRACE SHAPE</span><span className="api-side__version">v1</span></div><div className="api-flow"><div><strong>request</strong><code>payload + primitive</code></div><ArrowRight size={16} /><div><strong>runner</strong><code>Rust / Axum</code></div><ArrowRight size={16} /><div><strong>evidence</strong><code>trace + result</code></div></div><div className="api-side__note"><span className="api-side__mark">!</span><p>API-facing values stay toy-scale by design. This surface teaches protocol shape; it is not a cryptographic service.</p></div><button className="button button--primary button--wide" onClick={() => setActiveSection("algorithms")}><Play size={15} fill="currentColor" /> open a test bench</button></aside>
    </section>
  </>;
}

export default function Home() {
  const sectionFromPath = (): Section => window.location.pathname === "/algorithms" ? "algorithms" : window.location.pathname === "/attacks" ? "attacks" : window.location.pathname === "/notes" ? "notes" : window.location.pathname === "/api" ? "api" : "overview";
  const [activeSection, setActiveSection] = useState<Section>(() => sectionFromPath());
  useEffect(() => {
    const handlePopState = () => setActiveSection(sectionFromPath());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);
  const navigateSection = (section: Section) => {
    setActiveSection(section);
    window.history.pushState({}, "", section === "overview" ? "/" : `/${section}`);
  };
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmId>("aes");
  const [selectedAttack, setSelectedAttack] = useState("mitm");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return <div className="app-shell">
    <div className={classNames("mobile-scrim", mobileNavOpen && "mobile-scrim--visible")} onClick={() => setMobileNavOpen(false)} />
    <div className={classNames("sidebar-wrap", mobileNavOpen && "sidebar-wrap--open")}><Sidebar activeSection={activeSection} setActiveSection={navigateSection} onClose={() => setMobileNavOpen(false)} /></div>
    <main className="main-canvas"><Topbar activeSection={activeSection} onMenu={() => setMobileNavOpen(true)} /><div className="content-wrap">{activeSection === "overview" && <Overview setActiveSection={navigateSection} setSelectedAlgorithm={setSelectedAlgorithm} setSelectedAttack={setSelectedAttack} />}{activeSection === "algorithms" && <AlgorithmExplorer selectedAlgorithm={selectedAlgorithm} setSelectedAlgorithm={setSelectedAlgorithm} />}{activeSection === "attacks" && <AttackSimulator selectedAttack={selectedAttack} setSelectedAttack={setSelectedAttack} />}{activeSection === "notes" && <FieldNotesPage setActiveSection={navigateSection} />}{activeSection === "api" && <ApiContractPage setActiveSection={navigateSection} />}</div><footer className="page-footer"><span>© 2026 CIPHERLAB / EDUCATIONAL USE</span><span><span className="live-dot live-dot--small" /> all simulations run locally in toy mode</span><span>FIELD NOTE 00—02</span></footer></main>
  </div>;
}
