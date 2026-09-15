# SupplyShield AI
**Proactive Supply Chain Disruption Management Platform**

- **Track:** AI Track
- **Team Name:** 4bit
- **Team Members:**
  - Prince Desai (Lead) — 23DCE024 (23DCE024@charusat.edu.in)
  - Rishi Sheladiya — 23CE132 (23CE132@charusat.edu.in)
  - Deep Ardeshna — 23DCE004 (23DCE004@charusat.edu.in)
  - Pujan Desai — 23DCE026 (23DCE026@charusat.edu.in)

---

## 1. Problem — Who, What, Why It Hurts

### Who Experiences It?
- Global logistics operators, fleet controllers, pharmaceutical distributors, and supply chain commanders.

### What is the Problem?
- Global supply chains face frequent unforeseen disruptions: port closures (e.g., Suez Canal), geopolitical strikes, and severe weather events.
- Disruption intelligence is fragmented across maritime alerts, weather radar, sensor telemetry, and legacy ERPs.

### Why Does It Hurt?
- **Financial Losses:** Billions of dollars in delayed freight and SLA breach penalties.
- **Cold-Chain Spoilage:** Sensitive biological cargo and vaccines suffer irreversible temperature excursions.
- **Alert Fatigue & Delayed MTTR:** Incident commanders spend 4+ hours manually correlating spreadsheets and phone trees before enacting mitigation plans.

---

## 2. Solution — What We Built & How It Works

### SupplyShield AI Command Center
A unified operational intelligence platform that transitions supply chain management from reactive firefighting to automated, proactive mitigation.

### Core Mechanisms:
1. **Real-Time Disruption Aggregator:** Tracks global maritime, weather, and labor incidents with severity categorization.
2. **Dynamic Risk Scoring Engine:** Evaluates active shipments on a 0–100 scale using cargo priority, disruption severity, SLA deadlines, and live temperature logs.
3. **Automated Recovery Workspace:** Automatically identifies impacted routes and generates ranked recovery plans with simulated cost and time trade-offs.
4. **Natural Language AI Copilot:** Conversational assistant for operational staff to query database state, assess risk levels, and dispatch recovery orders.

---

## 3. Architecture & Technical Highlights

### Full-Stack Architecture
- **Frontend:** React 19, Vite, TailwindCSS v4, Recharts, Lucide Icons, Axios.
- **Backend:** Node.js, Express 5 REST API with modular controllers and services.
- **Data Engine:** In-memory relational data store with referential integrity linking disruptions, routes, shipments, fleet, and sensor logs.

### Key Technical Innovations
- **Multi-Factor Risk Calculation:** Deterministic scoring weighting cargo priority (+20), disruption proximity (+40), deadline compression (+30), and thermal excursion (+40).
- **Automated Fleet Redeployment:** Matches delayed cargo with available fleet capacity, factoring in temperature-control requirements.
- **Sub-Second Simulation:** Compares original vs. alternative routes instantly with projected cost and arrival variance.

---

## 4. IBM Technology Integration

### How IBM Bob Was Used in the SDLC
- **Architecture Planning:** Utilized IBM Bob's Plan Mode to architect the end-to-end data contracts and route-disruption graph models.
- **Implementation & Acceleration:** Leveraged IBM Bob's Agent Mode to generate backend REST controllers, frontend dashboard widgets, and complex Recharts visualizations.
- **Code Review & Quality:** Executed code review routines to optimize state management, enforce input validation, and verify zero-configuration local execution.

### IBM watsonx.ai Granite 3.0 Architecture
- **Foundation Model:** IBM watsonx.ai Granite 3.0 provides conversational intelligence for the SupplyShield AI Copilot.
- **Domain Adaptation:** Formats raw incident telemetry and shipment manifests into structured prompt contexts for root-cause summaries and step-by-step dispatch recommendations.
- **Resilient Fallback Design:** In environments without active Watson credentials, the engine gracefully transitions to an in-memory rule-based NLP provider.

---

## 5. Impact & Beyond the Hackathon

### Measurable Value
- **65% Reduction in Incident MTTR:** Cuts manual rerouting planning from hours to seconds.
- **Zero Spoilage Target:** Automated cold-chain excursion detection triggers instant refrigerated fleet redeployment.
- **Transparent Operational Visibility:** Live ₹6.5M+ cargo value at risk surfaced directly to decision-makers.

### Roadmap Beyond the Hackathon
1. **Real-World IoT Telemetry:** Direct MQTT ingestion from real-time container sensors and GPS beacons.
2. **Distributed Cloud Architecture:** Migration of in-memory store to IBM Cloud Databases for MongoDB and Red Hat OpenShift.
3. **Autonomous Execution:** Integration with carrier APIs for automated rebooking and dispatch execution upon operator approval.
