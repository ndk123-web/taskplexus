CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,                         -- internal UUID
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

    razorpay_payment_id TEXT UNIQUE NOT NULL,
    razorpay_order_id TEXT NOT NULL,             -- matches Razorpay order_id
    razorpay_signature TEXT NOT NULL,

    amount BIGINT NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',

    status VARCHAR(50) NOT NULL,                 -- captured / failed / refunded
    method VARCHAR(50),                          -- card / upi / netbanking
    email TEXT,
    contact TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
