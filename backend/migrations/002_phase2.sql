-- Dev Day One Phase 2 Tables

CREATE TABLE IF NOT EXISTS adrs (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repo_id      UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    title        TEXT NOT NULL,
    status       TEXT NOT NULL DEFAULT 'proposed',
    context      TEXT NOT NULL DEFAULT '',
    decision     TEXT NOT NULL DEFAULT '',
    consequences TEXT NOT NULL DEFAULT '',
    linked_files JSONB NOT NULL DEFAULT '[]',
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pattern_detections (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repo_id      UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    patterns     JSONB NOT NULL DEFAULT '[]',
    raw_analysis TEXT,
    detected_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(repo_id)
);

CREATE TABLE IF NOT EXISTS knowledge_entries (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repo_id    UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    author_id  UUID NOT NULL REFERENCES users(id),
    title      TEXT NOT NULL,
    body       TEXT NOT NULL DEFAULT '',
    file_path  TEXT,
    tags       JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS architecture_graphs (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repo_id      UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    graph_data   JSONB NOT NULL DEFAULT '{}',
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(repo_id)
);

CREATE TABLE IF NOT EXISTS impact_analyses (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repo_id    UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    query      TEXT NOT NULL,
    result     JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api_inventory (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repo_id      UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    name         TEXT NOT NULL,
    api_type     TEXT NOT NULL DEFAULT 'internal',
    version      TEXT,
    endpoint     TEXT,
    file_path    TEXT,
    status       TEXT NOT NULL DEFAULT 'active',
    detected_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(repo_id, name, api_type)
);
