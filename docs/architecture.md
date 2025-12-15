# Architecture

TaskPlexus uses a layered, decoupled design.

- Frontend: React (TypeScript) → Zustand → IndexedDB → API Client
- Backend: net/http Handlers → Services → Repositories → Databases (PostgreSQL + MongoDB) → Redis cache

Key patterns:
- Clean architecture boundaries in Go (`internal/handler`, `service`, `repository`)
- Optimistic UI updates with background sync
- Payment pipeline built with transactional integrity (PostgreSQL + Razorpay webhook)
