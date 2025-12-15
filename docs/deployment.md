# Deployment

Environment variables:
- Backend: MongoDB, PostgreSQL, Redis, JWT, Razorpay keys, Firebase, Gemini, Brevo
- Frontend: API base URL, Razorpay key, Firebase config, premium amount

Local:
- Backend: `go run cmd/fast-todo/main.go`
- Frontend: `npm run dev`

Containers:
- `Dockerfile` present for both client and server
- `docker-compose.yml` orchestrates services (server, databases if configured)
