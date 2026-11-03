import os

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_REAL_MODE_REQUIRED = (
    "DATABASE_URL",
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_JWT_SECRET",
    "GROQ_API_KEY",
    "GROQ_MODEL",
)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Public demo: read-only fixtures, no database, no AI, no GitHub.
    # Unset → on when running on Render (production), off locally.
    DEMO_MODE: bool | None = None

    DATABASE_URL: str = ""
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = ""
    GITHUB_TOKEN: str = ""
    FRONTEND_URL: str = "http://localhost:3000"

    # Demo Ask limits
    DEMO_ASK_PER_VISITOR_PER_HOUR: int = 20
    DEMO_ASK_GLOBAL_PER_HOUR: int = 1000
    DEMO_STREAM_DELAY: float = 0.012

    @field_validator("DEMO_MODE", mode="before")
    @classmethod
    def _blank_means_default(cls, v):
        return None if isinstance(v, str) and not v.strip() else v

    @field_validator("FRONTEND_URL")
    @classmethod
    def _no_trailing_slash(cls, v: str) -> str:
        return v.strip().rstrip("/")  # CORS compares origins exactly

    @model_validator(mode="after")
    def _resolve_mode(self):
        if self.DEMO_MODE is None:
            self.DEMO_MODE = bool(os.environ.get("RENDER"))
        if not self.DEMO_MODE:
            missing = [k for k in _REAL_MODE_REQUIRED if not getattr(self, k)]
            if missing:
                raise ValueError(f"Missing settings for non-demo mode: {', '.join(missing)}")
        return self


settings = Settings()
