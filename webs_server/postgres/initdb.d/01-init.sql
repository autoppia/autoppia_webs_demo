CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    web_agent_id VARCHAR(255) NOT NULL,
    web_url TEXT NOT NULL,
    event_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_web_url ON events(web_url);
CREATE INDEX IF NOT EXISTS idx_events_web_agent_id ON events(web_agent_id);

-- Table for storing master data pools (one per project/entity)
CREATE TABLE IF NOT EXISTS master_datasets (
    id SERIAL PRIMARY KEY,
    project_key VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    data_pool JSONB NOT NULL,
    pool_size INTEGER NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_key, entity_type)
);

CREATE INDEX IF NOT EXISTS idx_master_datasets_project ON master_datasets(project_key, entity_type);
CREATE INDEX IF NOT EXISTS idx_master_datasets_updated ON master_datasets(updated_at DESC);

-- Table for tracking seed usage (optional, for analytics)
CREATE TABLE IF NOT EXISTS seed_usage_log (
    id SERIAL PRIMARY KEY,
    project_key VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    seed_value INTEGER NOT NULL,
    requested_count INTEGER NOT NULL,
    selection_method VARCHAR(50),
    accessed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seed_log_project_seed ON seed_usage_log(project_key, entity_type, seed_value);
CREATE INDEX IF NOT EXISTS idx_seed_log_accessed ON seed_usage_log(accessed_at DESC);
