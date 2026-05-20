"""Application settings loaded from environment variables."""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[2]


def _env(name: str, default: str) -> str:
    return os.getenv(name, default).strip()


def _env_int(name: str, default: int) -> int:
    raw_value = _env(name, str(default))
    try:
        return int(raw_value)
    except ValueError:
        return default


def _env_csv(name: str, default: str) -> list[str]:
    raw_value = _env(name, default)
    return [item.strip() for item in raw_value.split(",") if item.strip()]


@dataclass(frozen=True)
class Settings:
    app_name: str = _env("APP_NAME", "K-Drama Analytics API")
    app_version: str = _env("APP_VERSION", "1.0.0")

    backend_dir: Path = BACKEND_DIR
    models_dir: Path = BACKEND_DIR / "models"

    db_host: str = _env("DB_HOST", "localhost")
    db_port: int = _env_int("DB_PORT", 5432)
    db_name: str = _env("DB_NAME", "kdrama")
    db_user: str = _env("DB_USER", "postgres")
    db_password: str = _env("DB_PASSWORD", "123456")

    cors_origins: list[str] = field(
        default_factory=lambda: _env_csv(
            "CORS_ORIGINS",
            "http://localhost:3000",
        )
    )

    threshold_hot: int = _env_int("THRESHOLD_HOT", 500)
    threshold_medium: int = _env_int("THRESHOLD_MEDIUM", 1500)

    @property
    def sqlalchemy_database_url(self) -> str:
        return (
            f"postgresql+psycopg2://{self.db_user}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )

    @property
    def psycopg_connect_kwargs(self) -> dict[str, str | int]:
        return {
            "host": self.db_host,
            "port": self.db_port,
            "database": self.db_name,
            "user": self.db_user,
            "password": self.db_password,
        }


settings = Settings()
