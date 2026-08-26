# CipherLab Design Brainstorm

## Three possible directions

### Theme Name: Measured Field Notes
Very Brief Intro: A warm, editorial laboratory interface inspired by annotated research notebooks, instrument labels, and printed schematics. It makes complex cryptography feel tactile, legible, and learnable rather than intimidating.
Probability: 0.07

### Theme Name: Signal Observatory
Very Brief Intro: A high-contrast observatory console that treats each experiment as a live signal moving through a monitored system. Deep ink surfaces, precise grids, and restrained spectral accents create an analytical atmosphere.
Probability: 0.03

### Theme Name: Proof in Motion
Very Brief Intro: A kinetic, diagram-first interface where cryptographic transformations unfold as visible paths, packets, and proofs. The visual language is quiet and technical, but small motion cues make cause and effect unmistakable.
Probability: 0.09

## Chosen Direction: Measured Field Notes

### Design Movement
Contemporary editorial modernism blended with scientific field documentation: generous paper-like surfaces, sharp typographic hierarchy, instrument-panel labels, and diagrammatic marks that reward close reading.

### Core Principles
1. **Make the invisible observable.** Every key, digest, packet, and attack should have a visible representation or a plain-language explanation.
2. **Teach through contrast.** Pair the safe implementation with its deliberately weak counterpart so the consequence is concrete.
3. **Use editorial hierarchy.** Let the page read like a well-edited lab manual: a clear question, a visible experiment, then the evidence.
4. **Prefer precision over spectacle.** Motion and color should clarify state changes, not decorate them.

### Color Philosophy
CipherLab uses a chalk-white base and graphite ink to feel like a printed research notebook brought to life. Oxide orange marks intervention, warnings, and attacker activity; deep botanical green marks trusted flow, verified signatures, and safe outcomes. A cool slate-blue is reserved for structure and metadata. The palette is intentionally non-neon so the product feels credible in a classroom or security workshop.

### Layout Paradigm
A persistent left rail acts as the lab bench: experiment navigation, progress, and system status stay anchored while the workspace changes. The main canvas uses offset editorial columns rather than a centered dashboard grid. Diagrams can bleed into margins, and result cards align to a baseline like instrument readouts.

### Signature Elements
- A small **specimen tag** with a numbered experiment label, severity, and protocol family.
- **Copper trace lines** that connect cards and animate only when data moves between actors.
- A **field-note margin** with mono annotations such as `OBS-04`, `ATTACK SURFACE`, and `VERIFIED`.

### Interaction Philosophy
Every control should answer “what changes if I touch this?” Sliders expose parameter sensitivity, run buttons reveal a staged sequence, and toggles clearly separate the unsafe demonstration from the recommended practice. Hover states reveal definitions; focus states keep the lab keyboard navigable.

### Animation
Use short, physical transitions: packet traces travel from Alice to Network to Bob; a hash digest types in with a subtle caret; attack steps appear as a measured sequence, not a burst. Keep transitions between 140–260ms, use ease-out for entries, and respect reduced-motion preferences by replacing travel with state changes.

### Typography System
Use **Space Grotesk** for display text and section labels, with **IBM Plex Mono** for hashes, keys, packet metadata, code-like values, and status markers. Headlines are compact and slightly tight; body copy stays at a readable 1.5 line-height. Mono annotations are uppercase, letter-spaced, and used sparingly as evidence markers.

### Brand Essence
CipherLab is a hands-on cryptography lab for students, engineers, and curious builders who want to see why security primitives work—and fail—through guided experiments instead of black-box demos. Personality: **curious, exacting, generous**.

### Brand Voice
Headlines are direct questions or claims; CTAs sound like lab instructions, not marketing. Microcopy names the evidence and the risk in plain language.

Example lines:
- “What does the attacker learn from one bad assumption?”
- “Run the weak version. Then repair the protocol.”

### Wordmark & Logo
The mark is a compact interlocking `C` and `L` built from two broken copper traces, forming a small open hexagonal aperture. It reads as a cipher boundary and a laboratory sample window without relying on a text wordmark.

### Signature Brand Color
**Oxide Orange — `#C65A2E`**. It is ownable, physical, and legible against chalk-white and graphite; it signals intervention without resorting to neon warning colors.

## Implementation Reminder
Before making a design decision, ask: “Does this choice reinforce or dilute the Measured Field Notes philosophy?”
