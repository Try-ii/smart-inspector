# Smart Inspector

Smart Inspector is a hackathon prototype for helping regulatory authorities prioritize field inspections, support violation classification, and summarize inspection outcomes using synthetic data.

This repository is currently in the foundation phase only. It contains the initial Next.js-oriented structure, demo JSON data, and shared TypeScript entity types. The dashboard, APIs, AI integration, upload flow, and inspection workflow have not been implemented yet.

## Project Structure

```text
.
├── data/
│   ├── establishments.json
│   └── violations.json
├── public/
│   └── demo-evidence/
│       └── README.md
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── lib/
│   │   └── README.md
│   └── types/
│       └── entities.ts
├── PROJECT_SPEC.md
├── next.config.mjs
├── package.json
└── tsconfig.json
```

## Folder Responsibilities

- `data/`: Local synthetic JSON data for the prototype.
- `public/demo-evidence/`: Place preloaded demo evidence images here in a later phase.
- `src/app/`: Next.js App Router entry point and global styles.
- `src/types/`: Shared TypeScript interfaces and enums for the main domain entities.
- `src/lib/`: Future home for data loading, risk scoring, AI fallback, and summary helpers.

## Approved MVP Decisions

- Framework: Next.js full-stack.
- Data storage: local JSON files.
- Authentication: none for the prototype.
- Risk scoring: deterministic, explainable rule-based scoring.
- Evidence: support preloaded demo evidence and real image upload.
- AI: live classification and summarization with deterministic fallback.
- Data: synthetic/demo data only.
- Scope: polished, convincing prototype over production complexity.

## Next Phase Candidates

- Add data loading helpers.
- Add deterministic risk scoring utilities.
- Build the dashboard UI.
- Add API routes after the data and scoring helpers are stable.
- Add AI helper with deterministic fallback after the inspection flow exists.

## Local Setup

Dependencies have not been installed yet. When implementation begins, install dependencies with the package manager chosen by the team, then run the normal Next.js scripts from `package.json`.
