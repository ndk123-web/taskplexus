CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,                  -- Firebase UID or UUID
    name VARCHAR(100) NOT NULL,
    email TEXT UNIQUE NOT NULL,
    image_link TEXT,
    plan_limit BIGINT DEFAULT 10,        -- your custom limit
    is_premium BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
