# 🚀 SupplyShield AI

---

## 👥 Team

| Field | Value |
|---|---|
| **Team Name** | 4bit |
| **Track** | AI |
| **Team Lead** | Prince Desai — 23DCE024@example.com |
| **Members** | Rishi Sheladiya (23CE132), Deep Ardeshna (23DCE004), Pujan Desai (23DCE026) |

---

## 🎯 Problem Statement

Supply chain managers and logistics companies face severe financial and operational losses due to unforeseen disruptions like port closures, extreme weather, and strikes. Existing tools lack real-time risk assessment and automated recovery planning, causing delayed responses.

---

## 💡 Solution

SupplyShield AI is a comprehensive platform that aggregates real-time disruption data, calculates risk scores for active shipments, and uses an AI Copilot to generate actionable recovery plans. It helps operators proactively reroute fleets and mitigate delays.

---

## ✨ Key Features

- **Dynamic Risk Scoring:** Real-time shipment risk scoring based on active disruptions and delivery deadlines.
- **Cold Chain Monitoring:** Real-time temperature monitoring and excursion alerts.
- **Automated Recovery Plans:** Generate, simulate, and apply alternative routes and carrier options.
- **AI Copilot:** Conversational interface for querying supply chain status.
- **Interactive Dashboard:** KPI aggregations and disruption severity mapping.

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Languages** | JavaScript, HTML, CSS |
| **Frameworks** | React 19, Vite, TailwindCSS v4, Express 5 |
| **IBM Technologies** | watsonx.ai (Stubbed) |
| **Databases** | In-Memory Data Store (NoSQL structured) |
| **Other** | Node.js, React Router, Recharts |

---

## 📁 Repository Structure

```
├── src/                  # All source code (frontend and backend)
├── docs/                 # Written documentation
│   ├── problem-statement.md
│   ├── solution-overview.md
│   ├── architecture.md
│   └── setup-guide.md
├── demo/                 # Demo artifacts
│   ├── screenshots/      # App screenshots
│   └── demo-video-link.txt  # Link to demo video
├── presentation/         # Slide deck
└── submission.yaml       # Structured submission metadata
```

---

## ⚡ How to Run

> **Copy these exact steps from your [`docs/setup-guide.md`](docs/setup-guide.md)**

```bash
# 1. Clone the repo
git clone https://github.com/drijesh-ppatel/bob-ai-hackathon-4bit.git
cd bob-ai-hackathon-4bit

# 2. Run the Backend
cd src/backend
npm install
npm run dev

# 3. Run the Frontend (in a new terminal)
cd ../frontend
npm install
npm run dev
```

---

## 🖥️ Demo

| Artifact | Link |
|---|---|
| 📹 Demo Video | [See demo/demo-video-link.txt](demo/demo-video-link.txt) |
| 🌐 Live Demo | [See demo/live-demo-url.txt](demo/live-demo-url.txt) |
| 🖼️ Screenshots | [See demo/screenshots/](demo/screenshots/) |
| 📊 Presentation | [See presentation/slides.pdf](presentation/slides.pdf) |

---

## ⚠️ Known Limitations

> Be honest — judges appreciate transparency over overclaiming.

- The IBM watsonx.ai integration is currently a stub due to missing API keys. The AI Copilot uses keyword matching on the backend rather than a real LLM.
- The database is completely in-memory and will reset upon server restart.
- Authentication is currently mocked in the data store.

---

## 🏅 What We're Most Proud Of

We built a completely functional, zero-configuration backend utilizing an in-memory data store with complex relationships (disruptions linked to routes linked to shipments) and an automated risk calculation engine that dynamically updates based on real-time factors. The UI is highly polished and interactive, providing a realistic supply chain management experience out-of-the-box.

---
