# API

Base URL: `/api/v1`

Auth:
- `POST /users/signup`
- `POST /users/signin`
- `POST /users/forgot-password`
- `POST /users/reset-password`

Workspaces:
- `GET /workspaces`
- `POST /workspaces`
- `PUT /workspaces/:id`
- `DELETE /workspaces/:id`

Tasks:
- `GET /tasks`
- `POST /tasks`
- `PUT /tasks/:id`
- `DELETE /tasks/:id`
- `PATCH /tasks/:id/toggle`

Goals:
- `GET /goals`
- `POST /goals`
- `PUT /goals/:id`
- `DELETE /goals/:id`
- `PATCH /goals/:id/toggle`

AI:
- `POST /ai-planner`
- `POST /ai-chat`

Payments:
- `POST /payment/create-order`
- `POST /payment/verify-payment`
- `GET /payment/check-payment-status/:paymentId`
- `POST /payment/webhook`
