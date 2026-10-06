# RiderHub

Motorcycle roadside-assistance coordination for Siliguri and nearby Himalayan routes. RiderHub is not an emergency service; for immediate danger, accidents, serious injuries, or unsafe conditions, contact local emergency services first.

## Status

Phase 1 project setup is complete. Authentication, database schema, and product flows are intentionally scheduled for subsequent phases.

## Prerequisites

- Node.js 22+
- PostgreSQL 15+ (required from Phase 2)

## Start development

```bash
cp .env.example .env
npm install
npm run dev
```

The web app runs at `http://localhost:5173` and the API health check is at `http://localhost:5000/api/health`.
