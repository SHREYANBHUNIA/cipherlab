# CipherLab — Applied Cryptography Experiment Platform

CipherLab is an educational laboratory for making cryptographic assumptions observable. The current repository contains the responsive React/D3 laboratory interface, toy-scale algorithm and attack visualizations, editable Alice–Network–Attacker–Bob traces, Field Notes, and an API Contract reference surface.

> **Safety boundary:** the visual experiments are deliberately simplified for teaching. Do not use the client-side demonstrations or their values to protect production data.

## Current build

The deployed frontend is a static React application using D3 for the hash avalanche map and network editing interactions. The API Contract window documents the intended Rust/Axum surface; the Axum service and SQLite persistence layer are the next implementation slice and are not included in this frontend checkpoint.

## Run locally

```bash
pnpm install
pnpm dev
```

The development server opens the app at `http://localhost:3000`. The main workspaces are available at `/`, `/algorithms`, `/attacks`, `/notes`, and `/api`.

To validate a production build:

```bash
pnpm check
pnpm build
pnpm preview
```

## GitHub Pages deployment

This repository includes `.github/workflows/deploy-pages.yml`. After pushing the repository to GitHub:

1. Open **Settings → Pages** in the repository.
2. Set the source to **GitHub Actions**.
3. Push to the `main` branch or run the workflow manually from the **Actions** tab.

The workflow builds with a repository-aware Vite base path, creates a `404.html` fallback for the client routes, and publishes `dist/public` to GitHub Pages.

## Interface map

| Workspace | Purpose |
| --- | --- |
| Overview | Orientation, primitive index preview, and the editable message-in-transit trace |
| Algorithms | AES, RSA, Diffie–Hellman, SHA-256, HMAC, and signature teaching benches |
| Attack Simulations | Weak-password, replay, man-in-the-middle, and collision concept scenarios |
| Field Notes | Short observations connecting primitives to their protocol assumptions |
| API Contract | Documented request/runner/evidence shape for the future Axum service |

## Project structure

```text
cipherlab/
├── client/
│   ├── public/assets/      # Small repository-local deployment assets
│   └── src/
│       ├── pages/Home.tsx  # Laboratory workspaces and D3 interactions
│       └── index.css       # Measured Field Notes design system
├── .github/workflows/     # GitHub Pages deployment
├── ideas.md               # Design direction and style decisions
├── package.json
└── vite.config.ts
```

## License

MIT
