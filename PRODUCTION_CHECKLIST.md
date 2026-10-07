# MotoAssist Production & Live Deployment Checklist

Complete production readiness checklist for deploying **MotoAssist: Highway & Hills Emergency Motorcycle Roadside Assistance Network** to production infrastructure (Vercel + Render + MongoDB Atlas).

---

## 1. Infrastructure & Repository
- [x] **GitHub Repository**: Monorepo configured with clean branch structure (`main` branch protected, auto-commit & push enabled).
- [ ] **Production Environment Variables**: Secrets configured on Render and Vercel dashboards using `.env.example` template.
- [ ] **MongoDB Atlas**: Production cluster provisioned (M0/M10+), network IP whitelist configured (0.0.0.0/0 for serverless or Render static outbound IPs).
- [x] **Database Indexes**:
  - `AssistanceRequest`: 2dsphere index on `location`, status index.
  - `ProviderLocation`: 2dsphere index on `location`, `isOnline` index.
  - `RoadHazard`: 2dsphere index on `location`, `status` index.
  - `User`: unique index on `email`.
  - `ProviderProfile`: unique index on `userId`.
  - `SOSIncident`: unique index on `incidentId`, `status` index.
  - `MaintenanceRecord`: compound index on `{ bikeId: 1, serviceDate: -1 }`.
  - `Notification`: compound index on `{ userId: 1, createdAt: -1 }`.

---

## 2. Deployment Architecture
- [x] **Backend Deployment (Render)**:
  - Build command: `npm run build --workspace=@motoassist/server`
  - Start command: `node server/dist/server.js`
  - Health check path: `GET /health` (returns `{ status: "ok", service: "motoassist-api" }`).
- [x] **Frontend Deployment (Vercel)**:
  - Framework Preset: Vite
  - Build command: `npm run build --workspace=@motoassist/client`
  - Output directory: `client/dist`
  - SPA Rewrites: Configured in `client/vercel.json` (`/(.*) -> /index.html`).
- [x] **CORS Policy**: Backend restricts origins to `process.env.CLIENT_URL` in production; wildcard origins prohibited on authenticated routes.
- [ ] **HTTPS Enforced**: Automatic SSL certificates issued via Let's Encrypt / Vercel Edge / Render.
- [ ] **Custom Domain Configuration**:
  - Frontend: `https://motoassist.in` (CNAME record pointing to `cname.vercel-dns.com`).
  - Backend API: `https://api.motoassist.in` (CNAME record pointing to Render service URL).

---

## 3. Location, Maps & Geolocation
- [ ] **Google Maps Production Key**: Restrict key in Google Cloud Console via HTTP Referrers (`https://motoassist.in/*`).
- [ ] **API Restrictions**: Enable Maps JavaScript API, Places API, Geocoding API on Cloud Console.
- [x] **Safe Geolocation Behavior**:
  - Browser GPS permission requested.
  - If denied or signal unavailable: Displays *"Your location is unavailable"* with `[Enable Location / Retry]` and `[Enter Location Manually]`.
  - No silent fake coordinate substitution.

---

## 4. Authentication, Security & RBAC
- [x] **Password Hashing**: BCrypt with salt factor 10.
- [x] **JWT Security**: Signed with strong server secret, 7-day expiration.
- [x] **RBAC Enforcement**:
  - `RIDER`: Only accesses own assistance requests, bikes, contacts, and profile.
  - `HELPER`: Dedicated provider dashboard, receives nearby requests, updates job status.
  - `ADMIN`: Protected administrative dashboard and endpoints (`/api/admin/*`).
- [x] **API Security Middleware**:
  - `helmet`: Secure HTTP headers (HSTS, XSS protection, MIME sniff prevention).
  - `express-rate-limit`: Rate limiting on global API (300 req/15m) and authentication endpoints (50 req/15m).
  - Body payload limit: Restricted to `1mb`.
  - Safe error handling: Internal stack traces stripped in production (`NODE_ENV === 'production'`).

---

## 5. Emergency SOS & Real Safety
- [x] **Explicit SOS Status Pipeline**:
  - `1. SOS Incident`: Created with unique incident ID.
  - `2. GPS Acquisition`: Coordinates locked or flagged as unavailable.
  - `3. Backend Dispatch`: Server confirmed or locally stored on device.
  - `4. Emergency Contacts`: SMS gateway delivery status transparently reported.
- [x] **Direct Emergency Dial Links**:
  - National Emergency: `tel:112`
  - Ambulance: `tel:108`
  - Police: `tel:100`
- [x] **No Fabricated Confirmations**: Emergency contact notification claims are never shown unless the server confirms gateway transmission.

---

## 6. Helper/Provider Workflow & Socket.IO
- [x] **Rider → Helper Dispatch**: Real lifecycle state transitions (`REQUESTED` -> `ACCEPTED` -> `EN_ROUTE` -> `ARRIVED` -> `IN_PROGRESS` -> `COMPLETED`).
- [x] **Demo Mode Labeling**: Client testing controls explicitly badged as `[DEMO MODE: Advance Dispatch Status]`.
- [x] **Real-time Socket.IO**: Clean room isolation and typed assistance events (`assistance:updated:${id}`).

---

## 7. Progressive Web App (PWA) & Offline
- [x] **Web App Manifest**: Standalone display mode, theme colors `#090909`, app metadata.
- [x] **App Icons**: Crisp PNG and maskable assets (`pwa-192x192.png`, `pwa-512x512.png`, `maskable-icon-512x512.png`, `apple-touch-icon.png`).
- [x] **Service Worker**: Precaching app shell assets via `vite-plugin-pwa` Workbox.
- [x] **Safe Offline Mode**:
  - Global `OfflineNotice` sticky alert banner activates when `!navigator.onLine`.
  - Clearly alerts rider that live tracking is paused.
  - Provides instant `tel:112` and `tel:108` calling capabilities.

---

## 8. Quality Assurance & Monitoring
- [x] **Automated Tests**:
  - Backend integration test suite: 26/26 tests passing.
  - Frontend test suite: 11/11 tests passing.
  - Total automated tests: 37/37 passing (100%).
- [x] **Type Checking**: Clean `tsc -b` on both client and server packages.
- [x] **Linting**: 0 ESLint errors and warnings across workspace.
- [x] **Health Check Endpoints**: `GET /health` and `GET /api/health` available.
- [ ] **Database Backups**: Enable MongoDB Atlas daily automated snapshots.
- [ ] **Production Monitoring**: Sentry / LogDNA / Render metrics integration.
- [x] **Responsive QA**: Tested and verified across 320px, 375px, 390px, 768px, 1024px, 1440px viewport profiles.
