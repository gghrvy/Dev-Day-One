from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    DATABASE_URL: str
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str
    SUPABASE_JWT_SECRET: str
    GROQ_API_KEY: str
    GROQ_MODEL: str
    GITHUB_TOKEN: str = ""
    FRONTEND_URL: str = "http://localhost:3000"


settings = Settings()
