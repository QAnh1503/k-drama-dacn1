"""Database connection helpers."""

from __future__ import annotations

import psycopg2
from psycopg2.extensions import connection as PsycopgConnection
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine

from app.core.config import settings


engine: Engine = create_engine(
    settings.sqlalchemy_database_url,
    future=True,
    pool_pre_ping=True,
)


def get_engine() -> Engine:
    return engine


def get_psycopg_connection() -> PsycopgConnection:
    return psycopg2.connect(**settings.psycopg_connect_kwargs)
