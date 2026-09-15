# Source Code Directory Layout — SupplyShield AI

This directory contains the entire full-stack application source code for **SupplyShield AI**.

## Directory Architecture

```
src/
├── backend/                  # Node.js + Express REST API Server
│   ├── controllers/          # Request handlers (auth, dashboard, disruptions, shipments, fleet, cold-chain, copilot, recovery)
│   ├── data/                 # In-memory relational data store (pre-seeded with realistic disruptions & shipments)
│   ├── routes/               # API route definitions
│   ├── services/             # Business logic (risk scoring engine, AI fallback provider, impact graph)
│   ├── package.json          # Backend dependencies (Express 5, dotenv, cors, nodemon)
│   └── server.js             # API server entrypoint (port 5000)
│
├── frontend/                 # React 19 + Vite Modern Web Dashboard
│   ├── public/               # Static assets and icons
│   ├── src/
│   │   ├── components/       # Reusable UI components (Layout, Badges, Modals, Risk Indicators)
│   │   ├── context/          # State management (AuthContext)
│   │   ├── pages/            # View pages (Dashboard, Disruptions, Shipments, Fleet, ColdChain, Recovery, Copilot)
│   │   ├── routes/           # AppRouter and route definitions
│   │   ├── services/         # Axios API client bindings
│   │   ├── App.jsx           # Root application component
│   │   ├── main.jsx          # DOM mount entrypoint
│   │   └── index.css         # TailwindCSS v4 design tokens and styles
│   ├── package.json          # Frontend dependencies (React 19, Lucide icons, Recharts, TailwindCSS)
│   └── vite.config.js        # Vite build and proxy configuration
│
└── .env.example              # Environment variables template
```

## Running the Application

Follow the detailed instructions in [docs/setup-guide.md](../docs/setup-guide.md) to start both services.
- **Backend API**: Runs on `http://localhost:5000`
- **Frontend UI**: Runs on `http://localhost:5173`
