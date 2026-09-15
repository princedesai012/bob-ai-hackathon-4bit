# SupplyShield AI — Presentation Slide Deck
**Autonomous Incident Command Center for Proactive Supply Chain Disruption Management**

- **Competition:** BOB AI Hackathon 2026
- **Track:** AI Track
- **Team Name:** Team 4bit
- **Team Members:**
  - **Prince Desai (Team Lead)** — ID: 23DCE024 (`23DCE024@charusat.edu.in`)
  - **Rishi Sheladiya (Core Engineer)** — ID: 23CE132 (`23CE132@charusat.edu.in`)
  - **Deep Ardeshna (Core Engineer)** — ID: 23DCE004 (`23DCE004@charusat.edu.in`)
  - **Pujan Desai (Core Engineer)** — ID: 23DCE026 (`23DCE026@charusat.edu.in`)

---

## Slide 1: Title & Overview
- **Project:** SupplyShield AI
- **Subtitle:** Proactive Supply Chain Disruption Management, Real-Time Risk Scoring, and Automated Recovery Planning.
- **Track:** AI Track
- **Presented by:** Team 4bit (Prince Desai, Rishi Sheladiya, Deep Ardeshna, Pujan Desai)

---

## Slide 2: Problem Statement — Global Supply Chains in Fragile Reality
- **Target Audience:** Global Logistics Directors, Fleet Incident Commanders, Port Operations Managers, Cold-Chain Carriers.
- **The Core Breakdown:** Fragmented visibility across 12+ siloed tools (marine AIS, weather radar, legacy ERPs) and slow manual correlation.
- **Why It Hurts (Quantified):**
  - **$10B+** lost annually in delay penalties and contractual SLA breach fines.
  - **3–5 Hours** average manual MTTR per incident while cargo sits stranded.
  - **$35B** lost annually in pharmaceutical cold-chain spoilage.

---

## Slide 3: Solution Architecture — Autonomous Incident Command
- **01 / Real-Time Ingestion:** Continuous aggregation of live port disruptions, strikes, and weather alerts mapped against global transit corridors.
- **02 / 0–100 Risk Engine:** Deterministic algorithm scoring shipments on priority, disruption severity, deadline proximity, and sensor data.
- **03 / Automated Recovery:** Simulates multi-modal corridors, calculates cost vs. time trade-offs, and redeploys idle fleet capacity in under 30s.
- **04 / AI Copilot:** Conversational operator assistant powered by IBM watsonx.ai Granite 3.0 for instant database querying and mitigation guidance.

---

## Slide 4: Live Demonstration — Executive Command Center in Action
- **Live Screenshot:** `01-home-dashboard.png`
- **Key Operational Highlights:**
  - **₹6.5M Cargo Value At Risk:** Financial exposure aggregated across active shipments on disrupted routes.
  - **Active Incidents Triage:** Tracks Critical events (Suez Canal Blockage with +7d delay) and High severity snowstorms.
  - **Fleet Utilization:** Surfaces 4 available transport units (including refrigerated vehicles) ready for redeployment.
  - **React 19 & TailwindCSS v4:** High-speed client with Recharts dynamic data visualizers.

---

## Slide 5: Deep Dive — Active Shipments & IoT Cold-Chain Safeguards
- **Live Screenshots:** `04-shipments-tracking.png` & `05-cold-chain-monitoring.png`
- **Algorithmic Risk Index (0–100):**
  - Cargo Priority (+20), Disruption Severity (+40), Deadline Proximity (+30), Thermal Excursion (+40).
- **Cold Chain Protection:**
  - Real excursion detected on `SHP-1024` (+9.1°C against required 2°C–8°C limits).
  - Automated alert triggers immediate redeployment of Reefer Truck `TRK-001`.

---

## Slide 6: Conversational AI — Natural Language AI Copilot
- **Live Screenshots:** `02-query-input.png` & `03-result-output.png`
- **Operator Prompt:** *"Which shipments are most at risk right now?"*
- **Copilot Output:**
  - Isolates 2 Critical items (`SHP-1024`, `SHP-4112`).
  - Explains root-cause risk score (100/100 due to Cargo Priority, Active Disruption, Cold Chain Excursion).
  - Recommends alternative Mediterranean corridor rerouting.
- **Dual-Mode Resiliency:** IBM watsonx.ai Granite 3.0 with zero-fail in-memory rule fallback.

---

## Slide 7: System Architecture & End-to-End Pipeline
- **Client Tier:** React 19 + Vite, TailwindCSS v4 design tokens, Recharts visualizers, Axios client with JWT headers.
- **Backend Tier:** Express 5 REST API, modular controllers, deterministic risk calculation service, recovery trade-off simulator.
- **Data & AI Tier:** Zero-config relational in-memory store (Disruptions ➔ Routes ➔ Shipments ➔ Fleet ➔ IoT Logs) + IBM watsonx.ai.

---

## Slide 8: IBM Technology Integration (Bob & watsonx)
- **IBM Bob (AI SDLC Partner):**
  - **Plan Mode:** Structured normalized data contracts and route-disruption graph models.
  - **Agent Mode:** Generated modular Express 5 API controllers, seed datasets, and Recharts dashboard components.
  - **Automated Code Review:** Diagnosed and fixed PostCSS import ordering and verified local reproducibility.
  - **Bob Shell:** Managed background server daemons and automated test scripts.
- **IBM watsonx.ai Granite 3.0:**
  - Summarizes multi-modal disruption telemetry into executive incident briefs.
  - Formats raw shipment manifests and temperature logs into prompt contexts.
  - Offline fallback provider ensures 100% demo reproducibility without cloud keys.

---

## Slide 9: Market Differentiation & Competitive Edge
- **Multi-Factor Correlation:** Continuous real-time corridor monitoring vs. manual entry in legacy ERPs (SAP/Oracle).
- **Dynamic 0–100 Risk Scoring:** Algorithmic calculation vs. static rule flags or basic server metrics.
- **1-Click Recovery Simulation:** Automated multi-modal rerouting vs. manual phone calls and spreadsheets.
- **Live Cold-Chain Telematics:** Real-time excursion alerts and fleet reassignment vs. post-delivery reviews.
- **Natural Language Copilot:** Watson-powered operational assistant vs. complex form queries.

---

## Slide 10: Measurable Impact & Production Roadmap
- **Quantified ROI:**
  - **65% Faster Incident MTTR:** Response time reduced from 4.5 hours to < 30 minutes.
  - **Zero Spoilage Target:** Immediate reefer redeployment preserves sensitive vaccines and biologicals.
  - **₹6.5M Cargo Protected:** Immediate visibility into high-value vulnerable shipments.
- **Enterprise Roadmap:**
  - **Phase 1:** Live MQTT ingestion from container GPS beacons and digital loggers.
  - **Phase 2:** Cloud deployment on Red Hat OpenShift with IBM Cloud Databases for MongoDB.
  - **Phase 3:** Automated booking execution via direct carrier APIs (Maersk, DHL, FedEx).

---

## Slide 11: Submission Verification & Links
- **Demo Video (Google Drive):** `https://drive.google.com/file/d/1gOxGQjESeODyhaQfzfeJyQW-iqaVKFsZ/view?usp=sharing`
- **GitHub Repository:** `https://github.com/princedesai012/bob-ai-hackathon-4bit.git`
- **Local Application:** Frontend on `http://localhost:5173`, Backend on `http://localhost:5000`
- **Team Lead Contact:** Prince Desai (`23DCE024@charusat.edu.in`)
