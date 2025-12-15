# Payments

Provider: Razorpay

Flow:
1. Create order (backend → Razorpay API)
2. Open Checkout.js on client
3. On success, verify signature (backend)
4. Webhook `payment.captured` updates DB (PostgreSQL)
5. Insert subscription; invalidate Redis `user:plan:{userId}`
6. Client polls `check-payment-status` until `payment.captured`
7. Auto-upgrade plan to `PRO_MONTHLY`

DB (PostgreSQL):
- `orders`: id, amount, currency, user_id, razorpay_order_id, plan_name
- `payments`: id, razorpay_payment_id (UNIQUE), razorpay_order_id, signature, amount, currency, status
- `subscriptions`: id, user_id, plan_name, started_at, expires_at, is_active

Race handling:
- Webhook may arrive before verify insert → upsert payment by `razorpay_payment_id`
