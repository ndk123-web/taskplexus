# Backend

Stack:
- Go 1.25.x
- net/http custom router
- PostgreSQL (payments, subscriptions)
- MongoDB (workspaces, todos, goals, activities, AI planner cache)
- Redis (plan cache, analytics cache)
- Firebase Admin SDK (Google OAuth verification)
- Brevo (email delivery)
- Gemini AI (planner + chat)

Structure:
- `internal/handler`: HTTP handlers (payment, user, workspace, todo, goals, activity, ai)
- `internal/service`: Business logic
- `internal/repository`: DB access (pgx for Postgres, mongo driver)
- `internal/middleware`: `auth`, `cors`, `logging`
- `internal/config`: `postgres.go`, `redis.go`, `firebase.go`, `razorpay.go`, `email.go`, `aigemini.go`

Security:
- JWT (HS256) for auth
- bcrypt for password hashing
- CORS restricted to client origin
- HMAC-SHA256 verification for Razorpay webhook
