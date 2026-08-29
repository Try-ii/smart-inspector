# Smart Inspector Project Spec

## 1. Product Goal

Smart Inspector is a hackathon prototype that helps regulatory authorities prioritize field inspections and support inspectors during and after inspections.

The goal is to demonstrate a simple, convincing workflow:

1. Rank establishments by risk before inspection.
2. Help an inspector classify evidence during inspection.
3. Detect repeated violations and generate a concise post-inspection summary.

The prototype should optimize for demo clarity, speed of implementation, and believable decision support rather than production-grade accuracy.

## 2. Problem Statement

Regulatory inspection teams often have limited time, limited inspectors, and many establishments to monitor. Without a simple prioritization tool, inspectors may spend effort on low-risk establishments while higher-risk locations with repeated violations receive delayed attention.

Inspectors also need support during field visits when documenting violations, classifying severity, and summarizing findings. Manual review of historical violations can be slow, inconsistent, or unavailable in the field.

Smart Inspector addresses this by combining synthetic establishment records, violation history, simple risk scoring, and lightweight AI assistance into one inspection-support workflow.

## 3. Target Users

- Inspection supervisors who decide which establishments should be visited first.
- Field inspectors who conduct inspections and document observed violations.
- Regulatory analysts or administrators who review inspection outcomes and risk trends.

For the hackathon MVP, the primary demo user is an inspection supervisor or field inspector using a single web app.

## 4. Core User Journey

1. User opens the dashboard.
2. User sees establishments sorted by risk level.
3. User selects a high-risk establishment.
4. User reviews establishment details and previous violations.
5. User starts a new inspection.
6. User uploads or selects demo evidence for an observed violation.
7. AI suggests violation category, severity, and description.
8. User accepts or edits the suggestion.
9. System compares the new violation with historical violations.
10. System flags repeated or similar issues.
11. System updates the establishment risk score.
12. System generates a concise inspection summary.

## 5. MVP Features

- Dashboard showing establishments sorted by risk score.
- Establishment detail page with profile data and violation history.
- Simple risk score calculation using synthetic data.
- Start inspection flow.
- Evidence upload or demo image selection.
- AI-assisted violation suggestion:
  - Category.
  - Severity.
  - Short description.
- Manual review/edit of AI suggestion.
- Similar or repeated violation detection using simple text/category matching.
- Risk score update after inspection.
- Concise inspection summary/report.
- Synthetic demo data seeded locally or stored in a simple database.

## 6. Features Explicitly Excluded From MVP

- Real government integrations.
- Real licensing or permit databases.
- Real inspector authentication and role-based access control.
- Production-grade machine learning risk prediction.
- Training a custom AI model.
- Geospatial route optimization.
- Offline mobile app support.
- Legal enforcement workflow.
- Fine payment processing.
- Complex case management.
- Multi-agency workflows.
- Real-time notifications.
- Advanced analytics dashboards.
- Audit-grade document retention.
- Multilingual support unless needed for the demo.

## 7. Proposed Screens/Pages

### Dashboard

- High-level counts:
  - Total establishments.
  - High-risk establishments.
  - Inspections completed today.
  - Repeat violations detected.
- Prioritized establishment table.
- Filters for risk level, establishment type, and district.

### Establishment Detail

- Establishment profile.
- Current risk score and risk level.
- Previous violations timeline or table.
- Button to start a new inspection.

### Inspection Workspace

- Establishment context.
- Evidence upload or demo evidence selector.
- AI suggestion panel.
- Editable violation fields:
  - Category.
  - Severity.
  - Description.
  - Inspector notes.
- Submit inspection button.

### Inspection Result / Summary

- New violation details.
- Similar previous violations.
- Updated risk score.
- Generated inspection summary.
- Simple button to return to dashboard.

## 8. Synthetic Data Model

### Establishment

- `id`
- `name`
- `licenseNumber`
- `type`
- `district`
- `address`
- `ownerName`
- `lastInspectionDate`
- `baselineRisk`
- `currentRiskScore`
- `riskLevel`
- `status`

Example establishment types:

- Restaurant.
- Grocery store.
- Pharmacy.
- Warehouse.
- Beauty salon.

### Violation

- `id`
- `establishmentId`
- `inspectionId`
- `date`
- `category`
- `severity`
- `description`
- `evidenceUrl`
- `isRepeat`
- `matchedPreviousViolationId`

Example categories:

- Food storage.
- Hygiene.
- Expired product.
- Fire safety.
- Pest control.
- Waste disposal.
- Licensing/documentation.

Example severities:

- Low.
- Medium.
- High.
- Critical.

### Inspection

- `id`
- `establishmentId`
- `inspectorName`
- `startedAt`
- `completedAt`
- `status`
- `violations`
- `summary`
- `riskScoreBefore`
- `riskScoreAfter`

## 9. Risk Scoring Logic

Use a transparent rules-based score from 0 to 100.

Suggested formula:

- Start with `baselineRisk`.
- Add points for recent violations:
  - Low: +5.
  - Medium: +10.
  - High: +20.
  - Critical: +30.
- Add +15 for each repeated or similar violation.
- Add +10 if the last inspection was more than 180 days ago.
- Cap final score at 100.

Suggested risk levels:

- 0-29: Low.
- 30-59: Medium.
- 60-79: High.
- 80-100: Critical.

This should be implemented as deterministic business logic, not machine learning.

## 10. AI Responsibilities

AI should be used only where it makes the demo more compelling and saves inspector effort.

### During Inspection

Given evidence image and optional inspector note, AI suggests:

- Violation category.
- Severity.
- Short factual description.
- Confidence level, if easy to include.

### After Inspection

Given new violation and historical violations, AI or simple logic helps:

- Identify whether the issue appears repeated or similar.
- Generate a concise inspection summary.

### Recommended Simplification

For the hackathon, use AI for classification and summary generation, but use deterministic logic for final risk scoring. If image analysis is difficult under time pressure, use preloaded demo evidence images with predictable AI outputs or fallback mock responses.

## 11. Main User Flow For The Demo

1. Presenter opens dashboard.
2. Dashboard shows several establishments sorted by risk.
3. Presenter selects "Al Noor Restaurant", marked High Risk.
4. Detail page shows previous violations:
   - Improper food storage.
   - Hygiene issue.
   - Expired product found.
5. Presenter starts a new inspection.
6. Presenter uploads or selects a demo image showing poor food storage.
7. AI suggests:
   - Category: Food storage.
   - Severity: High.
   - Description: Food items appear stored improperly and exposed to contamination risk.
8. Presenter accepts the suggestion.
9. System detects similarity to a previous food storage violation.
10. Risk score increases from 72 to 87.
11. Result page shows "Critical Risk" and a concise generated report.

## 12. Suggested Technical Architecture

Use a simple web application with a lightweight frontend, backend API, synthetic database, and optional AI service call.

Recommended architecture:

- Frontend web app for dashboard, detail pages, inspection workflow, and report display.
- Backend API for establishments, inspections, violations, risk scoring, and AI orchestration.
- Database for synthetic establishments, inspections, and violations.
- AI service wrapper for evidence classification and summary generation.

Keep business rules on the backend so the demo logic is consistent and easy to explain.

## 13. Recommended Technology Stack

Recommended practical stack:

- Frontend: React with Vite.
- Styling: Tailwind CSS or simple CSS modules.
- Backend: Node.js with Express.
- Database: SQLite for local demo simplicity.
- ORM/query layer: Prisma or direct SQLite queries.
- AI: OpenAI API for image classification and summary generation.
- File uploads: Local uploads folder or base64/image URL handling for demo only.

Even simpler alternative:

- Single Next.js app with API routes.
- SQLite or JSON file seed data.
- OpenAI API calls from server routes.

Recommended hackathon choice:

- Next.js full-stack app.
- SQLite or JSON seed data.
- Server-side risk scoring.
- One AI helper module.

Reason: fewer moving parts, easier local demo, and faster path from idea to working prototype.

## 14. API Endpoints We Will Probably Need

- `GET /api/establishments`
  - Returns establishments sorted by risk score.

- `GET /api/establishments/:id`
  - Returns establishment details and violation history.

- `POST /api/inspections`
  - Starts a new inspection for an establishment.

- `POST /api/inspections/:id/evidence`
  - Uploads evidence and requests AI violation suggestion.

- `POST /api/inspections/:id/violations`
  - Saves accepted or edited violation.

- `POST /api/inspections/:id/complete`
  - Detects repeated violations, updates risk score, and generates summary.

- `GET /api/inspections/:id`
  - Returns inspection result and summary.

For the fastest MVP, some endpoints can be combined if the implementation is simpler.

## 15. Database Collections/Tables We Will Probably Need

### `establishments`

- Stores establishment profile and current risk values.

### `violations`

- Stores historical and newly submitted violations.

### `inspections`

- Stores inspection sessions and generated summaries.

### Optional: `evidence`

- Stores uploaded evidence metadata if uploads are separated from violations.

For an MVP, evidence can be represented directly on the violation record.

## 16. Demo Scenario

### Establishments

Create 8-12 synthetic establishments across different types and districts.

Example:

- Al Noor Restaurant: High risk, repeated food storage issues.
- Green Basket Grocery: Medium risk, expired product history.
- CityCare Pharmacy: Low risk, clean record.
- Fresh Bite Cafe: Critical risk, recent hygiene and pest control issues.
- Gulf Warehouse: Medium risk, fire safety issue.

### Demo Story

The inspection authority has limited inspection capacity today. Smart Inspector identifies Al Noor Restaurant as a high-priority establishment because it has recent and repeated food storage violations.

During the inspection, the inspector uploads evidence of another food storage issue. The AI suggests the violation category and severity. The system compares the finding with historical violations, detects a repeated issue, increases the risk score, and generates a concise report that the supervisor can review.

## 17. Future Expansion Ideas

- Real data integrations with licensing and inspection systems.
- Inspector mobile app.
- Offline-first inspection workflow.
- Route optimization by district and urgency.
- Advanced risk prediction using historical inspection outcomes.
- Geospatial heat maps.
- Supervisor assignment workflows.
- Notification and escalation rules.
- Multilingual reports.
- Voice notes and transcription.
- Document generation as PDF.
- Audit logs and evidence chain-of-custody.
- Configurable violation taxonomies by authority.

## 18. Technical Risks And How To Simplify Them

### AI Image Classification May Be Unpredictable

Simplification: use curated demo images and allow manual editing. Keep fallback mock suggestions for demo reliability.

### Risk Scoring Could Become Overcomplicated

Simplification: use transparent rule-based scoring. Explain the score formula directly in the UI or presenter script.

### Upload Handling Can Consume Time

Simplification: support both file upload and preloaded demo evidence selection. If upload takes too long, demo with preloaded images only.

### Similarity Detection Can Become Too Advanced

Simplification: match by category first. Optionally add keyword matching on descriptions. Avoid embeddings unless there is extra time.

### Database Setup Can Slow The Team

Simplification: start with seeded JSON or SQLite. Avoid complex migrations for the prototype.

### Report Generation Could Produce Overlong Output

Simplification: constrain the summary format to 3-5 short bullet points or one short paragraph.

### Demo Reliability Depends On External AI Calls

Simplification: include deterministic fallback responses for known demo evidence.

## 19. Questions / Decisions That Must Be Resolved Before Coding

The following MVP decisions have been approved:

1. Framework: Next.js full-stack.
2. Data storage: local JSON files.
3. Authentication: none for the prototype.
4. Risk scoring: deterministic, explainable rule-based scoring.
5. Evidence: support preloaded demo evidence and real image upload.
6. AI: live classification and summarization with deterministic fallback.
7. Violation categories: intentionally small set for demo clarity.
8. Data: synthetic/demo data only.
9. Delivery priority: polished, convincing prototype over production complexity.

Remaining decisions before coding:

1. Should inspection summaries be stored in JSON, downloadable, or only displayed on screen?
2. What exact demo evidence images should be used for the main presentation path?
3. What API key and environment configuration will be available during the hackathon?
