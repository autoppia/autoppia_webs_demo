CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    web_agent_id VARCHAR(255) NOT NULL,
    web_url TEXT NOT NULL,
    validator_id VARCHAR(255) NOT NULL,
    event_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_web_url ON events(web_url);
CREATE INDEX IF NOT EXISTS idx_events_web_agent_id ON events(web_agent_id);
CREATE INDEX IF NOT EXISTS idx_events_validator_id ON events(validator_id);
