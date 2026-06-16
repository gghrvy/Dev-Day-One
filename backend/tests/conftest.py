import os

# Set BEFORE any app import so config.Settings() never fails in CI/tests.
os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/postgres")
os.environ.setdefault("SUPABASE_URL", "http://localhost")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "test-service-key")
os.environ.setdefault("SUPABASE_JWT_SECRET", "test-secret")
os.environ.setdefault("GROQ_API_KEY", "test-key")
os.environ.setdefault("GROQ_MODEL", "test-model")
