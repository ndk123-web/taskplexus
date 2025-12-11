CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,                         -- internal UUID
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    plan_name TEXT NOT NULL,                     -- PRO_MONTHLY, PRO_YEARLY
    started_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,

    is_active BOOLEAN DEFAULT TRUE,

    order_id TEXT REFERENCES orders(id),
    payment_id TEXT REFERENCES payments(id),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
