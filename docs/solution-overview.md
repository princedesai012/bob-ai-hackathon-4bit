# Solution Overview

**The core mechanism:**
SupplyShield AI is a comprehensive platform that continuously ingests disruption data (e.g., weather events, port strikes) and correlates it with active shipments, routes, and fleet availability. Its core mechanism is an automated risk scoring engine that evaluates each shipment's exposure to disruptions, its delivery deadline, cargo priority, and real-time cold chain sensor data to assign a dynamic risk level (Low, Medium, High, Critical).

**What makes it different from naive alternatives:**
Instead of just displaying alerts on a map, SupplyShield AI actively proposes **Recovery Plans**. The system simulates the impact of alternative routes and carriers, showing expected delay reductions. It also features a conversational AI Copilot that allows operators to query the system naturally (e.g., "Which shipments are most at risk?"), bypassing complex filtering UI.

**Key design decisions and why you made them:**
- **In-Memory Graph-like Data Store:** We opted for an in-memory data store for the prototype to ensure zero-friction setup for evaluators, while structuring the data relationally (disruptions -> routes -> shipments) to prove the viability of a real database backend.
- **React 19 & Tailwind CSS 4:** To ensure a highly responsive, modern, and polished user interface that can handle dense data visualization (using Recharts).
- **Separation of Risk Scoring and Recovery:** We built distinct services for risk calculation and recovery planning to allow for independent scaling and logic testing.

**What the user experience looks like:**
An operations manager logs in to a high-level dashboard highlighting critical KPIs and active disruptions. They can click into a specific disruption (e.g., "Suez Canal Blockage") to view its impact graph. From there, they can generate an automated recovery plan, review the simulated delay reduction, and apply it with one click. For ad-hoc questions, they use the AI Copilot chat interface.
