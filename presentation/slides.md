---
marp: true
theme: default
class: lead
backgroundColor: #f8f9fa
---

# 🚀 SupplyShield AI
**Proactive Supply Chain Disruption Management**

Team: 4bit (AI Track)
Prince Desai, Rishi Sheladiya, Deep Ardeshna, Pujan Desai

---

## 🎯 The Problem

- Supply chain disruptions (port closures, extreme weather) cause severe delays and financial loss.
- Operators react to incidents manually rather than proactively mitigating them.
- Existing tools lack real-time correlation between live disruptions, fleet availability, and active shipments.

---

## 💡 Our Solution: SupplyShield AI

A platform that:
1. **Aggregates** live disruption data.
2. **Scores Risk** for every shipment dynamically.
3. **Automates Recovery** by simulating and generating alternative routes and carrier options.

---

## 🛠️ Architecture & Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS 4, Recharts
- **Backend:** Node.js, Express 5, In-Memory Object Store
- **AI Copilot:** watsonx.ai (Stubbed) / Custom NLP processing
- **Core Engine:** Custom Risk Scoring & Recovery Generation Services

---

## ✨ Key Features & Demo Highlights

1. **Dashboard:** High-level KPI aggregations and disruption severity mapping.
2. **Dynamic Risk Engine:** Cold chain excursion alerts and delivery SLA monitoring.
3. **Recovery Workspace:** One-click simulation and application of recovery plans.
4. **AI Copilot:** Conversational interface for instant supply chain insights.

---

## 🌍 Impact & Future Scope

- **Beyond the Hackathon:** Integrate real IoT sensors and GPS telemetry.
- **Scale:** Move in-memory store to a distributed NoSQL cluster (e.g., MongoDB).
- **Advanced AI:** Full integration with IBM watsonx.ai for predictive disruption forecasting rather than just reactive mitigation.
