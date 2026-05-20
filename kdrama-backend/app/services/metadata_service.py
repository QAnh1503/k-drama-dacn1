"""Read metadata used by the prediction form."""

from __future__ import annotations

import logging

import pandas as pd
from sqlalchemy import text
from sqlalchemy.engine import Engine

from app.schemas import MetadataResponse


logger = logging.getLogger(__name__)


class MetadataService:
    def __init__(self, engine: Engine) -> None:
        self.engine = engine

    def get_metadata(self) -> MetadataResponse:
        try:
            with self.engine.connect() as connection:
                actors_df = pd.read_sql_query(
                    text("SELECT DISTINCT actor FROM scoring_data.actor_scores"),
                    connection,
                )
                directors_df = pd.read_sql_query(
                    text("SELECT DISTINCT directors FROM scoring_data.director_scores"),
                    connection,
                )
                writers_df = pd.read_sql_query(
                    text(
                        "SELECT DISTINCT screenwriters "
                        "FROM scoring_data.writer_scores"
                    ),
                    connection,
                )

            return MetadataResponse(
                actors=self._to_sorted_list(actors_df, "actor"),
                directors=self._to_sorted_list(directors_df, "directors"),
                screenwriters=self._to_sorted_list(writers_df, "screenwriters"),
            )
        except Exception as exc:
            logger.exception("Failed to load metadata from PostgreSQL.")
            return MetadataResponse(error=str(exc))

    @staticmethod
    def _to_sorted_list(frame: pd.DataFrame, column: str) -> list[str]:
        if column not in frame:
            return []
        return sorted(frame[column].dropna().astype(str).unique().tolist())
