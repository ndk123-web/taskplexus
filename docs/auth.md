# Authentication

- JWT for API auth (HS256)
- bcrypt password hashing
- Firebase Admin SDK verifies Google ID tokens server-side
- Middleware stack: `auth` (JWT), `cors`, `logging`, recovery

Endpoints:
- `/users/signup`, `/users/signin`
- `/users/forgot-password`, `/users/reset-password`
