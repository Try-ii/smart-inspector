# Smart Inspector 🔍

> An intelligent regulatory inspection management and decision-support web platform designed to prioritize field inspections, assist in violation classification, and automate post-inspection reporting for regulatory authorities.

---

## 📌 Project Overview

Regulatory inspection teams in municipal and governmental sectors often face resource constraints, monitoring hundreds of commercial establishments with limited field inspectors. Traditional inspection workflows frequently suffer from manual scheduling inefficiencies, delayed detection of repeated infractions, and inconsistent field documentation.

**Smart Inspector** was developed as a GovTech hackathon prototype to demonstrate an end-to-end, data-driven inspection workflow:
1. **Pre-Inspection**: Dynamically rank establishments by an explainable multi-factor risk score.
2. **During Inspection**: Assist inspectors with curated evidence classification and automated duplicate violation detection.
3. **Post-Inspection**: Instantly recalculate establishment risk and generate structured, natural Arabic executive summaries and regulatory recommendations.

---

## ✨ Key Features

- **📊 Dynamic Risk Scoring Engine**: Evaluates baseline establishment risk, violation severity weight, repeat violation penalties, and time decay factors in real time.
- **🔁 Duplicate Violation Detection**: Compares newly recorded infractions with historical violation logs to identify repeat or chronic compliance issues.
- **🤖 AI-Assisted Classification & Fallback**: Suggests violation category, severity rating, and descriptive findings with confidence scores, backed by a deterministic fallback engine for offline reliability.
- **📝 Arabic Executive Summary Generator**: Automatically synthesizes recorded violations into structured inspection reports with executive takeaways and regulatory action recommendations.
- **🗺️ Interactive Madinah GIS Risk Map**: Visualizes commercial establishments across Madinah districts categorized by real-time risk tiers (Critical, High, Medium, Low).
- **📋 Dispatch & Priority Queue Workflow**: Enables inspection supervisors to filter high-risk establishments and dispatch inspectors with one-click modal scheduling.
- **🏢 Establishment Profiles & History**: Comprehensive view of commercial records, historical inspection logs, and violation timelines.
- **📱 Field Inspection Workflow**: Mobile-friendly inspection interface with interactive evidence selection, multi-violation recording, and instant risk preview.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Components & Route Handlers)
- **Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript 5.7](https://www.typescriptlang.org/) (Strict Type Safety)
- **Styling**: Modern Vanilla CSS with CSS Custom Properties (`--sk-*`), Glassmorphism, and responsive design
- **Typography & Localization**: Arabic-first (RTL) with `@fontsource/alexandria` and `@fontsource/tajawal`
- **Icons & Graphics**: Pure SVG custom icons and national branding assets

---

## 🏗️ Architecture

```text
┌────────────────────────────────────────────────────────┐
│                   Next.js App Router                   │
│   Dashboard (/)  │  Profile (/establishments/[id])    │
│   Inspection Form (/inspect)  │  Report (/inspections) │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                  Component & UI Layer                  │
│   15+ modular dashboard components (Map, KPIs, Table)   │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                   Core Domain Engines                  │
│  • Risk Engine (Multi-Factor Scoring & Time Decay)     │
│  • Similarity Engine (Duplicate Violation Detection)   │
│  • AI Fallback Engine (Classification & Confidence)    │
│  • Summary Engine (Arabic Natural Language Generator)  │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│               Data & In-Memory State Layer             │
│         In-memory store initialized from JSON          │
└────────────────────────────────────────────────────────┘
```

---

## ⚙️ Core Engineering Highlights

### 1. Multi-Factor Risk Scoring Engine (`src/lib/risk-engine.ts`)
The scoring algorithm computes an explainable 0–100 risk score using:
- **Baseline Activity Weight**: Inherent risk of the facility type (e.g., restaurants vs. pharmacies).
- **Violation Severity Weight**: High-impact infractions (e.g., food safety, pest control) contribute higher point values.
- **Recidivism Multiplier**: Repeat infractions add compound penalty points.
- **Time Decay Factor**: Recent violations have a greater weight, decaying gracefully as compliance improves over time.

### 2. Duplicate Violation Detection (`src/lib/similarity.ts`)
Uses string normalization and category-matching heuristics to cross-reference newly added violations against the establishment's historical records, automatically flagging chronic infractions.

### 3. Rule-Based AI Classification Fallback (`src/lib/ai-fallback.ts`)
Provides structured violation suggestions (category, severity, description, confidence score) without relying on external API availability, ensuring zero-latency and dependable offline demonstration.

### 4. Arabic Natural Language Report Generator (`src/lib/summary.ts`)
Programmatically generates clear, professional Arabic executive summaries and actionable recommendations tailored to regulatory inspection standards.

---

## 📁 Project Structure

```text
Smart-Inspector/
├── data/                             # Synthetic mock dataset
│   ├── establishments.json           # Sample commercial establishments
│   ├── inspections.json              # Historical inspection records
│   └── violations.json               # Historical violation logs
├── public/                           # Public assets & SVG branding
│   ├── branding/                     # Regional & national emblems
│   └── demo-evidence/                # Evidence scenario placeholders
├── src/
│   ├── app/                          # Next.js App Router pages & API routes
│   │   ├── api/                      # REST API endpoints
│   │   ├── establishments/           # Establishment profiles & inspection flow
│   │   ├── inspections/              # Inspection summary reports
│   │   ├── dashboard.css             # Dashboard specific styles
│   │   ├── globals.css               # Global tokens & theme styles
│   │   ├── layout.tsx                # RTL root layout
│   │   └── page.tsx                  # Dashboard entry point
│   ├── components/dashboard/         # 15+ reusable dashboard UI widgets
│   ├── lib/                          # Domain engines (Risk, AI, Similarity, Store)
│   └── types/                        # TypeScript interfaces & domain entities
├── PROJECT_SPEC.md                   # Detailed technical specification
├── package.json                      # Project dependencies & scripts
└── tsconfig.json                     # TypeScript configuration
```

---

## 📸 Demo & Screenshots

<!-- Add interface screenshots here -->
> *Screenshots showing the interactive dashboard, risk map, inspection workflow, and AI reporting will be featured here.*

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.17.0` or higher
- **Package Manager**: `npm`, `yarn`, or `pnpm`

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Try-ii/smart-inspector.git
   cd smart-inspector
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000).

### Available Scripts
- `npm run dev`: Starts the Next.js development server.
- `npm run build`: Creates an optimized production build.
- `npm run start`: Runs the production server.
- `npm run typecheck`: Runs the TypeScript compiler check (`tsc --noEmit`).
- `npm run lint`: Runs Next.js ESLint checks.

---

## 🔒 Data & Privacy

All records included in `data/` (facility names, license numbers like `LIC-2026-1001`, owner names, and violation records) are **100% synthetic mock data** created strictly for demonstration and testing purposes. No real-world government records, proprietary data, or personal identifying information are contained in this repository.

---

## 📊 Project Status

This repository is a **functional prototype / hackathon MVP**. All core features described—including the dashboard, scoring engine, inspection forms, duplicate detection, and summary generation—are fully implemented in code and verified with strict TypeScript compilation.

---

## 👨‍💻 My Role

As the developer of this prototype, my contributions included:
- Architecting the full-stack Next.js 15 application structure and domain entity models in TypeScript.
- Designing and implementing the deterministic Multi-Factor Risk Scoring Engine and duplicate violation matching algorithms.
- Building the complete UI/UX interface from scratch using modern CSS, Glassmorphism, and responsive RTL layout.
- Implementing the interactive field inspection workflow, AI classification fallback, and dynamic report generation.