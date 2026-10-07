# MotoAssist (Highway & Hills Emergency Motorcycle Roadside Assistance Network)

[![Build & Tests](https://img.shields.io/badge/tests-37%2F37%20passing-brightgreen)](https://github.com)
[![PWA](https://img.shields.io/badge/PWA-v2.0.0%20Ready-blue)](https://github.com)
[![License](https://img.shields.io/badge/license-MIT-yellow)](https://github.com)

**MotoAssist** is a 24x7 real-time motorcycle emergency roadside assistance and rider safety network designed specifically for challenging highway corridors and treacherous Himalayan mountain routes (Siliguri, NH-10, Darjeeling, Kalimpong, Sikkim, and Dooars).

> ⚠️ **Critical Safety Notice**: MotoAssist coordinates rapid mechanical breakdown assistance, emergency fuel, punctures, towing, and rider network help. For immediate life danger, severe road collisions, or critical medical emergencies, users are immediately provided with direct dial links to official emergency services (**112** National Emergency, **108** Ambulance, **100** Police).

---

## Architecture & Technology Stack

```
                              [ User Device (PWA) ]
                                      │
                         HTTPS (Cloudflare / Edge)
                                      ▼
                      [ Vercel Edge CDN: React 19 / Vite ]
                                      │
                         REST API & Socket.IO (WSS)
                                      ▼
                      [ Render: Node.js / Express / TypeScript ]
                                      │
                         Mongoose ODM (2dsphere GeoJSON)
                                      ▼
                           [ MongoDB Atlas Cluster ]
```

### Frontend (`client/`)
- **Framework**: React 19, TypeScript 5.8, Vite 6
- **PWA**: `vite-plugin-pwa` (Workbox offline precaching, web manifest, standalone display mode)
- **Styling**: Tailwind CSS with rich dark theme (`#090909`), high-contrast yellow accents (`#FFF174`), Framer Motion micro-animations, Lucide React icons
- **State & Realtime**: React Context API, Socket.IO Client 4.8
- **Testing**: Vitest 3.2, React Testing Library, JSDOM

### Backend (`server/`)
- **Runtime**: Node.js 22 LTS, Express 4.21, TypeScript
- **Database**: MongoDB Atlas with Mongoose ODM (Dual-mode: automated in-memory mock fallback when offline/local)
- **Realtime**: Socket.IO 4.8 (bidirectional incident room broadcasts)
- **Security**: Helmet, Express Rate Limiter, BCrypt, JWT Authentication, CORS policy
- **Testing**: Vitest 3.2, Supertest (26 integration tests passing)

---

## Key Features

1. **Rider Experience**:
   - **One-Tap Emergency SOS**: Multi-step transparent emergency broadcast (`SOS_CREATED` -> `GPS_ACQUIRED` -> `SERVER_RECEIVED` -> `CONTACTS_NOTIFIED`).
   - **Real GPS & Manual Location**: Accurately acquires browser GPS coordinates; provides manual landmark/coordinate fallback if GPS is denied or unavailable.
   - **Assistance Dispatch Wizard**: Puncture, mechanical breakdown, dead battery, fuel outage, towing, and accident rescue.
   - **Live Incident HUD & Tracking**: Real-time status progression (`REQUESTED` -> `ACCEPTED` -> `EN_ROUTE` -> `ARRIVED` -> `IN_PROGRESS` -> `COMPLETED`) via Socket.IO.
   - **My Garage & Maintenance**: Motorcycle profiles, registration details, mileage, and maintenance logs.
   - **Emergency Contacts**: Prioritized contact management with single-tap calling.

2. **Helper / Mechanic Portal**:
   - Inbound assistance queue with real-time audio-visual notifications.
   - Dispatch milestone updates and live GPS tracking of the dispatched helper.
   - Verification status, service specialty badges, and mechanic reviews.

3. **Admin Dashboard**:
   - Role-Based Access Control (`RIDER`, `HELPER`, `ADMIN`).
   - Provider profile approvals and verification badge management.
   - Platform incident monitoring and road hazard moderation.

4. **Progressive Web App (PWA)**:
   - Installable on Android, iOS, and Desktop (Standalone window).
   - Safe offline shell: Displays prominent `OfflineNotice` with instant emergency dial links (`112` / `108`).

---

## Monorepo Folder Structure

```
BIKER/
├── client/                     # Frontend Application (Vite + React PWA)
│   ├── public/                 # PWA icons, manifest, favicon
│   ├── src/
│   │   ├── components/         # Reusable UI & HUD components
│   │   ├── config/             # Dynamic API base URL & Socket config
│   │   ├── context/            # AuthContext & Session management
│   │   ├── layouts/            # PublicLayout & DashboardLayout
│   │   ├── pages/              # Landing, SOS, Assistance, Dashboards
│   │   ├── services/           # Socket.IO & API clients
│   │   └── utils/              # Storage & validation helpers
│   ├── vercel.json             # Vercel SPA rewrite & security headers
│   └── vite.config.ts          # Vite configuration with VitePWA
├── server/                     # Backend API (Node.js + Express)
│   ├── src/
│   │   ├── config/             # DB & environment config
│   │   ├── controllers/        # Request, SOS, Auth, Helper controllers
│   │   ├── middleware/         # Auth, RBAC, Rate limiter middleware
│   │   ├── models/             # Mongoose Schemas (GeoJSON 2dsphere)
│   │   ├── routes/             # Express API route endpoints
│   │   ├── services/           # Socket.IO dispatcher & mockStore
│   │   └── tests/              # Vitest API integration test suite
│   └── tsconfig.json
├── .env.example                # Safe environment variable template
├── PRODUCTION_CHECKLIST.md     # Production deployment checklist
└── package.json                # NPM workspaces configuration
```

---

## Environment Variables

Copy `.env.example` to create your local `.env`:

```bash
cp .env.example .env
```

### Backend (`server/.env` or Render Dashboard)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | API Server Port | `5000` |
| `MONGODB_URI` | MongoDB Atlas Connection String | `mongodb+srv://user:pass@cluster.mongodb.net/motoassist` |
| `JWT_SECRET` | Secret key for signing JWTs | `a_long_random_secure_secret_key_32_chars` |
| `CLIENT_URL` | Allowed frontend origin for CORS | `https://motoassist.in` |
| `SOCKET_CORS_ORIGIN`| Allowed origin for Socket.IO | `https://motoassist.in` |

### Frontend (`client/.env` or Vercel Dashboard)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL of deployed API | `https://api.motoassist.in` |
| `VITE_GOOGLE_MAPS_API_KEY` | Restricted Google Maps Key | `AIzaSy...` |

---

## Local Development Setup

1. **Clone & Install Dependencies**:
   ```bash
   git clone https://github.com/your-username/motoassist.git
   cd motoassist
   npm install
   ```

2. **Run in Development Mode**:
   ```bash
   npm run dev
   ```
   - Client dev server: `http://localhost:5173`
   - Server dev server: `http://localhost:5000`
   - Health check: `http://localhost:5000/health`

3. **Demo Accounts (Available via 1-Click Login on `/login`)**:
   - **Rider**: `rider@motoassist.in` / `password123`
   - **Helper**: `helper@motoassist.in` / `password123`
   - **Admin**: `admin@motoassist.in` / `password123`

---

## Automated Testing & Verification

```bash
# Run all automated tests (37 tests across workspaces)
npm run test --workspaces

# Run ESLint (0 errors, 0 warnings)
npm run lint --workspaces

# Build production bundles
npm run build --workspaces
```

---

## Deployment Guide

### 1. Backend on Render
1. Connect GitHub repository to Render.
2. Create a new **Web Service**:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/server.js`
   - **Health Check Path**: `/health`
3. Add Environment Variables from `.env.example`.

### 2. Frontend on Vercel
1. Import repository on Vercel.
2. Configure project settings:
   - **Root Directory**: `client`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add `VITE_API_URL` pointing to your Render backend URL.
4. Deep linking will automatically route through `client/vercel.json`.

---

## Security & Safety Architecture

- **No Hardcoded Secrets**: Zero API keys or database passwords committed to source.
- **Truthful Emergency State**: SOS notifications never falsely claim contacts were alerted unless confirmed by an active SMS gateway.
- **Location Integrity**: Unavailable GPS triggers explicit warnings and manual input options rather than silent coordinate substitution.
- **Rate Limiting**: Protects against automated brute-force attacks on authentication and emergency dispatch endpoints.
- **Safe Offline Mode**: Precaches UI shell while disallowing false claims of online dispatch when disconnected.
