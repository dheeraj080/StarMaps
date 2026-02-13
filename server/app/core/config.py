from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env.docker", extra="ignore")

    database_url: str
    horizons_timeout_sec: int = 60
    ephemeris_default_step_min: int = 60
    ephemeris_cache_days: int = 2


settings = Settings()
