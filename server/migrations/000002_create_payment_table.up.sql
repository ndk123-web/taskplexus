CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    amount BIGINT NOT NULL,               
    currency VARCHAR(10) NOT NULL,
    provider VARCHAR(50) NOT NULL,         
    provider_order_id TEXT,

    status VARCHAR(20) NOT NULL DEFAULT 'pending', 
    metadata JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- indexes
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments (user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments (status);
