# MotoAssist (RiderHub)

24x7 Motorcycle Roadside Assistance & Himalayan Rider Network coordination platform for Siliguri and nearby mountain routes (Darjeeling, Kalimpong, Sikkim, Dooars).

> **Safety Notice**: MotoAssist coordinates breakdown assistance and peer rider rescue. For immediate life danger, severe road accidents, or medical emergencies, contact official emergency services (112 / 108) first.

---

## Current Status & Readiness

The full-stack application is **fully built, integrated, tested, and ready**:
- **Frontend & Backend Builds**: Production TypeScript compile & bundle with **0 errors**.
- **Automated Test Suite**: 37 tests across client & server with **100% pass rate** (`npm test`).
- **ESLint & Code Standards**: Clean across both workspaces with **0 warnings / 0 errors** (`npm run lint`).
- **Dual-Mode Backend**: Runs with MongoDB/Mongoose or falls back automatically to an in-memory mock store for zero-config local development and demonstrations.

---

## Key Features

1. **Rider Portal**:
   - One-tap SOS emergency trigger with coordinate broadcast and emergency contact alerts.
   - Roadside assistance wizard (breakdowns, punctures, fuel outages, towing, electrical faults).
   - Live interactive map tracking with real-time ETA and status progression.
   - My Garage (bike profiles, fuel type, registration).
   - Emergency contacts directory with rapid dial links.
2. **Helper / Mechanic Portal**:
   - Real-time inbound emergency queue.
   - Claim requests, update dispatch milestones, view rider location.
   - Helper profile, skills, verified status, and service areas.
3. **Admin Operations**:
   - Provider verification & approval workflow.
   - Platform user management with role filtering.
   - Global assistance incident log and safety reporting.
4. **Real-time Synchronization**:
   - Socket.IO live coordination for emergency notifications and incident state updates.

---

## Quick Start

### 1. Environment Configuration
```bash
cp .env.example .env
```
*(Default `.env` is pre-configured for local offline development; no database setup required to test immediately.)*

### 2. Install Dependencies & Launch
```bash
npm install
npm run dev
```
- **Web App**: [http://localhost:5173](http://localhost:5173)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### 3. Demo Credentials (1-Click Login available on `/login`)
- **Rider**: `rider@motoassist.in` / `password123`
- **Helper / Mechanic**: `helper@motoassist.in` / `password123`
- **Admin**: `admin@motoassist.in` / `password123`

---

## Quality & Testing Commands

```bash
# Run all automated tests (37 tests across client and server)
npm run test

# Run ESLint validation across workspaces
npm run lint

# Production bundle build test
npm run build
```

