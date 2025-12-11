CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,                        -- internal UUID (your system)
    razorpay_order_id TEXT UNIQUE NOT NULL,      -- Razorpay order_id
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    amount BIGINT NOT NULL,                      -- paise me: 199 -> 19900
    currency VARCHAR(10) DEFAULT 'INR',

    status VARCHAR(50) DEFAULT 'created',        -- created / paid / failed
    plan_name TEXT NOT NULL,                     -- PRO_MONTHLY, PRO_YEARLY etc.

    notes JSONB,                                 -- optional extra info

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
