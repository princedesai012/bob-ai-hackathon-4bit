# Setup Guide

This guide provides the exact steps to install and run the SupplyShield AI prototype locally.

## Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**

*(No external database is required as the prototype uses an in-memory store).*

## Installation & Running

Follow these steps exactly in a fresh terminal.

### 1. Clone the Repository

```bash
git clone https://github.com/drijesh-ppatel/bob-ai-hackathon-4bit.git
cd bob-ai-hackathon-4bit
```

### 2. Setup Environment Variables

```bash
# Backend
cd src/backend
cp .env.example .env

# Frontend
cd ../frontend
cp .env.example .env
```
*(The default values in `.env.example` are pre-configured to work locally out-of-the-box).*

### 3. Start the Backend Server

Open a terminal and run:

```bash
cd src/backend
npm install
npm run dev
```
*Expected Output:*
```
🚀 SupplyShield AI backend running on http://localhost:5000
📦 Using in-memory data store (no MongoDB required)
```

### 4. Start the Frontend Server

Open a second, separate terminal and run:

```bash
cd src/frontend
npm install
npm run dev
```
*Expected Output:*
```
  VITE v6.1.1  ready in 1500 ms
  ➜  Local:   http://localhost:5173/
```

## How to Verify It's Working

1. Open your browser and navigate to `http://localhost:5173`.
2. You should see the login screen.
3. Login using the default credentials:
   - **Email:** `ops@supplyshield.ai`
   - **Password:** `password123`
4. You should be redirected to the Dashboard showing active disruptions and KPI metrics.

## Troubleshooting

| Error | Cause | Solution |
|---|---|---|
| `Cannot read properties of undefined` in Frontend | Backend is not running | Ensure the backend terminal is running on port 5000. |
| `EADDRINUSE: address already in use :::5000` | Port 5000 is blocked | Kill the existing process on port 5000 or change `PORT` in `src/backend/.env` |
| `npm install` fails | Incompatible Node version | Ensure you are using Node.js v18 or higher. |
