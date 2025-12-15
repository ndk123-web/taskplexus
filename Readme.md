# TaskPlexus - Technical Documentation

A full-stack task and goal management system with AI-powered planning, real-time synchronization, and professional payment processing. Built with Go backend and React frontend.

## Overview

TaskPlexus is an enterprise-grade task management platform that combines intelligent task decomposition via AI, offline-first architecture, and seamless payment integration. The system handles 2 workspaces for free users, unlimited for paid subscribers, with complete isolation per workspace.

## Core Architecture

The application follows a layered architecture pattern:

Frontend: React Component → Zustand Store → IndexedDB Cache → API Client
Backend: HTTP Handler → Service Layer → Repository → Database

## Technologies & Implementation

### Frontend Stack

#### React 19 with TypeScript
- Component-based UI with TSX syntax
- Type-safe props and state management
- Strict null checks enabled

#### SEO Optimization (Helmet-async)
- Meta tag management for dynamic content
- Open Graph and Twitter card support
- Structured data for search engines
- Server-side rendering compatibility preparation

#### Firebase Google Authentication
- OAuth 2.0 integration with Firebase
- Google Sign-In button integration
- ID token validation on client
- Session persistence with localStorage
- Automatic token refresh mechanism

#### State Management (Zustand with Persistence)
- useUserInfo store: Manages authentication state, user profile, current plan
- useWorkspaceStore: Handles workspace context, todos, goals, flowchart nodes
- Persist middleware: Auto-saves state to localStorage
- subscribe() method for reactive updates

#### IndexedDB Offline Persistence
- Local database for all workspace data
- Automatic sync when reconnected
- Pending operations queue stored locally
- No data loss during network failures
- Full-text search capability on cached data

#### Offline Background Synchronization Engine
- Custom useRunBackgroundOps hook
- Queues failed operations in IndexedDB
- Polls every 30 seconds for reconnection
- Batch sync of pending operations
- Exponential backoff on API failures
- User notification on sync completion

#### React Flow Visualization
- Interactive drag-and-drop node editor
- Custom node types for tasks/goals
- Minimap and viewport controls
- Auto-layout with Dagre algorithm
- Node connection visualization
- Persistent canvas state per workspace

#### Razorpay Payment Integration
- Checkout.js dynamic script loading
- Order creation via API
- Payment verification with signature validation
- Webhook polling for status updates
- Processing state management
- Auto-upgrade on successful capture

### Backend Stack

#### Go 1.25.3
- Clean Architecture pattern implementation
- net/http multiplexer for routing
- Context-based request handling
- Error wrapping with fmt.Errorf

#### Authentication & Security
- JWT token generation using custom njwt package
- bcrypt password hashing (nbcrypt package)
- Token expiration and refresh mechanism
- Middleware-based route protection
- CORS configuration for frontend origin

#### Google Firebase Admin SDK
- Service account authentication
- ID token verification for OAuth users
- User profile retrieval from Firebase
- Session validation on every protected route

#### PostgreSQL Database (Payment Operations)
- pgx driver for connection pooling
- Transactions for payment processing
- UUID for record identification
- Foreign key constraints (orders ← users)
- Prepared statements for SQL injection prevention
- Migrations with up/down scripts

Database Schema:
- users table: id, email, password_hash, created_at
- orders table: id, razorpay_order_id, amount, currency, plan_name, user_id
- payments table: id, razorpay_payment_id, razorpay_order_id, razorpay_signature, amount, currency, status, order_id
- subscriptions table: id, user_id, plan_name, started_at, expires_at, is_active

#### MongoDB (Task & Activity Data)
- Go MongoDB driver with context management
- Connection pooling with maxPoolSize=50
- Aggregation pipelines for analytics
- Indexes on frequently queried fields (user_id, workspace_id)
- Document validation schemas
- Automatic ObjectID generation

Collections:
- workspaces: Multi-tenant document storage
- todos: Priority-based task storage with completion tracking
- goals: Long-term objective tracking
- activities: Audit trail and user activity log
- aiplanners: AI-generated task decompositions cache

#### Redis Caching Layer
- User plan status caching (key: user:plan:{userId})
- Analytics aggregation results cache
- Session token blacklist
- Workspace access patterns
- TTL: 24 hours for plan cache
- Automatic invalidation on payment capture

#### Gemini AI API
- Text generation for task decomposition
- Context-aware suggestions
- Streaming responses for real-time display
- Token count validation before API calls
- Error handling for quota exceeded scenarios
- Free tier token limits: 5 requests/minute

Integration points:
- POST /api/v1/ai-planner: Break down complex goals
- POST /api/v1/ai-chat: Conversational task assistance
- Response streaming to frontend via Server-Sent Events

#### Brevo (SendGrid Alternative) Email API
- SMTP relay for transactional emails
- Password reset emails with secure tokens
- Subscription confirmation emails
- Organization invite emails (future)
- Bounce and complaint handling
- Template-based email generation

Email types:
- Welcome email on signup
- Password reset with 1-hour expiration link
- Plan upgrade confirmation
- Payment receipt

#### Razorpay Payment Processing
- Order creation with amount in paise
- Webhook signature verification via HMAC SHA256
- Payment status tracking (pending, captured, failed)
- Order ID storage for reconciliation
- Subscription creation on successful capture

Webhook flow:
- payment.captured: Updates payment status → Creates subscription → Invalidates Redis cache
- payment.failed: Updates payment status → Logs failure
- Idempotent processing with unique payment IDs

#### MongoDB Aggregation Pipelines
- Analytics dashboard: Task completion rates over time
- Workspace statistics: Total tasks, completed, by priority
- Goal progress tracking: Completion percentage
- Activity analytics: User action heatmaps
- Advanced filtering: Multi-stage aggregations

Example pipeline:
$match (filter by date range) → $group (by status) → $sort → $project

#### Middleware Layer
- Authentication middleware: JWT validation on protected routes
- CORS middleware: Accept requests from frontend origin only
- Logging middleware: Request/response logging with timestamps
- Recovery middleware: Panic recovery with error responses

### Database Synchronization Strategy

PostgreSQL (Payments):
- Transactional consistency for financial data
- Webhook validation before insert
- Unique constraint on razorpay_payment_id
- Upsert logic when webhook arrives before verify endpoint

MongoDB (Application Data):
- Eventual consistency model
- Background sync from IndexedDB on reconnect
- Conflict resolution: Server timestamp wins
- Automatic retry with exponential backoff

Redis (Cache):
- Invalidate on: Payment capture, user plan update
- Refresh on: First user login, plan check
- TTL-based expiration: 24 hours

## API Endpoints

### Authentication
POST /api/v1/users/signup
- Body: email, password, fullName
- Response: userId, accessToken, refreshToken

POST /api/v1/users/signin
- Body: email, password
- Response: userId, accessToken, refreshToken, plan

POST /api/v1/users/forgot-password
- Body: email
- Response: success, message

POST /api/v1/users/reset-password
- Body: token, newPassword
- Response: success

### Payments
POST /api/v1/payment/create-order
- Body: amount (in paise), currency, userId
- Response: orderId, razorpayOrderId

POST /api/v1/payment/verify-payment
- Body: razorpayOrderId, razorpayPaymentId, razorpaySignature
- Response: success, message

GET /api/v1/payment/check-payment-status/{paymentId}
- Response: status (payment.pending, payment.captured, payment.failed), amount, currency

POST /api/v1/payment/webhook
- Headers: X-Razorpay-Signature
- Body: Razorpay webhook payload
- Response: 200 OK

### Workspaces
GET /api/v1/workspaces
- Headers: Authorization: Bearer {token}
- Response: Array of workspace objects

POST /api/v1/workspaces
- Headers: Authorization: Bearer {token}
- Body: name
- Response: workspaceId, name

PUT /api/v1/workspaces/{id}
- Headers: Authorization: Bearer {token}
- Body: name, layout
- Response: updated workspace

DELETE /api/v1/workspaces/{id}
- Headers: Authorization: Bearer {token}
- Response: success

# Fast Todo

Modern task and goal management with AI planning, offline-first UX, visual workflows, and integrated payments.

Overview:
- Frontend: React + TypeScript, Zustand (persist), IndexedDB, React Flow, Helmet-async, Firebase Google Auth, Razorpay Checkout.js
- Backend: Go (net/http), PostgreSQL (payments), MongoDB (tasks/goals/activity), Redis (plan/analytics cache), Firebase Admin, Brevo email, Gemini AI, JWT + bcrypt

Quick start:
- Backend: go run cmd/fast-todo/main.go
- Frontend: npm install && npm run dev

Documentation:
- See docs/ for architecture, backend, frontend, auth, payments, offline-sync, caching, AI, deployment, and API reference.

License:
- MIT (see LICENSE)

✨ Built for speed, reliability, and clarity.

### Goals
GET /api/v1/goals
- Headers: Authorization: Bearer {token}
- Query: workspaceId
- Response: Array of goal objects

POST /api/v1/goals
- Headers: Authorization: Bearer {token}
- Body: title, targetDays, category, workspaceId
- Response: goalId, title, targetDays

PUT /api/v1/goals/{id}
- Headers: Authorization: Bearer {token}
- Body: title, targetDays, status
- Response: updated goal

DELETE /api/v1/goals/{id}
- Headers: Authorization: Bearer {token}
- Response: success

### AI Features
POST /api/v1/ai-planner
- Headers: Authorization: Bearer {token}
- Body: goal (string), context (optional)
- Response: tasks (array), suggestions (array)

POST /api/v1/ai-chat
- Headers: Authorization: Bearer {token}
- Body: message, conversationId
- Response: Stream of text responses (Server-Sent Events)

### Analytics
GET /api/v1/analytics/dashboard
- Headers: Authorization: Bearer {token}
- Query: workspaceId, timeRange (7d/30d/90d)
- Response: totalTasks, completed, pending, byPriority, trend

## Data Flow

### Task Creation
1. Frontend: User types task → Optimistic update to Zustand store
2. IndexedDB: Task saved locally with pending flag
3. Backend: API POST /tasks → Service validates → Repository inserts to MongoDB
4. Cache: No invalidation (append-only operation)
5. Frontend: API response confirms → Remove pending flag

### Payment Flow
1. Frontend: User clicks "Upgrade Now" → Navigate to Settings
2. Razorpay: openCheckout() → Modal opens
3. Backend: POST /payment/create-order → Razorpay API → Return orderId
4. Razorpay: Payment modal → User completes payment
5. Frontend: Handler receives payment details → verifyPaymentApi()
6. Backend: POST /payment/verify-payment → HMAC verify → Insert payment (status: pending) → Trigger webhook
7. Razorpay: Webhook fire → payment.captured event
8. Backend: POST /payment/webhook → Verify signature → Check payment status update → Insert subscription → Invalidate Redis cache
9. Frontend: Poll GET /payment/check-payment-status every 5s
10. Frontend: Detect status: payment.captured → Update store plan to PRO → Redirect to dashboard

### Offline Sync
1. User creates task while offline → Stored in IndexedDB
2. Network reconnects → useRunBackgroundOps detects
3. Batch all pending operations → POST to backend
4. Backend processes each operation with timestamps
5. Conflict resolution: Server timestamp wins
6. Frontend updates store with server response
7. IndexedDB cleared of pending flag

## Performance Optimizations

- Optimistic UI updates: 0ms perceived latency for user actions
- IndexedDB caching: Offline capability and faster local reads
- Redis plan cache: 10x faster user plan checks vs database query
- MongoDB indexes: Fast lookups by user_id, workspace_id
- Connection pooling: PostgreSQL and MongoDB reuse connections
- Lazy loading: React components load on demand
- Batch operations: Multiple tasks synced in single request
- Request deduplication: Cancel in-flight requests on page navigation

## Deployment

### Environment Variables Required

Backend (.env):
```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/taskplexus
POSTGRES_URI=postgresql://user:pass@host:5432/taskplexus
REDIS_URI=redis://host:6379
JWT_SECRET=your_secret_key
PORT=:8080
RAZORPAY_KEY=key_xxx
RAZORPAY_SECRET=secret_xxx
RAZORPAY_WEBHOOK_SECRET=webhook_secret_xxx
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
GEMINI_API_KEY=your_gemini_key
BREVO_API_KEY=your_brevo_key
```

Frontend (.env):
```
VITE_API_BASE_URL=http://localhost:8080
VITE_RAZORPAY_KEY=key_xxx
VITE_TASKPLEXUS_PREMIUM_MONEY=99900
VITE_FIREBASE_CONFIG=your_firebase_config_json
```

### Running Locally

Backend:
```bash
cd server
go mod download
go run cmd/fast-todo/main.go
```

Frontend:
```bash
cd client
npm install
npm run dev
```

## Testing

Backend unit tests:
```bash
cd server
go test ./internal/service -v
go test ./internal/repository -v
```

Frontend testing:
```bash
cd client
npm test
```

## Project Structure

```
fast-todo/
├── client/                           # React frontend
│   ├── src/
│   │   ├── pages/                   # Dashboard, Settings, Auth pages
│   │   ├── components/              # Reusable UI components
│   │   ├── store/                   # Zustand stores (user, workspace, etc)
│   │   ├── api/                     # API client functions
│   │   ├── hooks/                   # Custom hooks (useAuth, usePendingOps)
│   │   ├── utils/                   # Helpers (razorpay.ts, validation.ts)
│   │   └── styles/                  # CSS modules and globals
│   └── package.json
├── server/                          # Go backend
│   ├── cmd/fast-todo/main.go        # Entry point
│   ├── internal/
│   │   ├── handler/                 # HTTP handlers
│   │   ├── service/                 # Business logic
│   │   ├── repository/              # Database operations
│   │   ├── model/                   # Data structures
│   │   ├── middleware/              # CORS, Auth, Logging
│   │   └── config/                  # Configuration setup
│   ├── migrations/                  # Database schemas (SQL)
│   └── pkg/                         # Shared utilities (JWT, bcrypt)
└── docs/                            # Documentation
```

## Workflow Integration

### Creating a Task
1. User enters task text in Dashboard
2. Frontend creates local todo object
3. Zustand store updates (optimistic)
4. IndexedDB persists immediately
5. API call: POST /api/v1/tasks
6. Backend validates and inserts to MongoDB
7. Response confirms creation
8. Frontend removes pending flag

### Switching Workspaces
1. User clicks workspace in sidebar
2. Zustand context switches instantly
3. IndexedDB retrieves cached workspace todos
4. UI re-renders with new workspace data
5. Background API call refreshes from server
6. Conflicts resolved if data stale

### Upgrading Plan
1. Free user hits 2-workspace limit
2. "Unlock Pro Features" card appears
3. Click "Upgrade Now" → Settings page
4. Click "Upgrade to Premium" → Razorpay checkout
5. Complete payment in modal
6. Frontend verifies signature
7. Backend updates payment status → Creates subscription
8. Webhook invalidates Redis cache
9. Frontend polls and detects plan change
10. Store updates to PRO → Redirect to dashboard

## Error Handling

Frontend:
- API errors caught and displayed in toast notifications
- Failed operations queued in IndexedDB for retry
- Network disconnection detected and logged
- Automatic retry with backoff

Backend:
- Panic recovery middleware returns 500 status
- Validation errors return 400 with message
- Unauthorized requests return 401
- Not found resources return 404
- Database errors wrapped with context

## Security

- JWT tokens signed with HS256 algorithm
- Passwords hashed with bcrypt (cost: 12)
- CORS restricted to frontend origin
- SQL injection prevented with prepared statements
- Razorpay signatures verified with HMAC SHA256
- Firebase ID tokens validated on backend
- Environment variables never committed to git

## Monitoring

Logs include:
- [auth] - User login/logout events
- [payment] - Payment operation logs
- [webhook] - Razorpay webhook events
- [cache] - Redis invalidation events
- [database] - Query execution times
- [api] - Request/response cycles



