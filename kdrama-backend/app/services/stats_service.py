"""Dashboard statistics aggregation."""

from __future__ import annotations

import logging
from typing import Any

import numpy as np
import pandas as pd
from sqlalchemy import text
from sqlalchemy.engine import Engine


logger = logging.getLogger(__name__)

COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#a855f7"]
MONTH_NAMES = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
]


class DashboardStatsService:
    def __init__(
        self,
        engine: Engine,
        models: dict[str, Any],
        feature_lists: dict[str, list[str]],
    ) -> None:
        self.engine = engine
        self.models = models
        self.feature_lists = feature_lists

    def build(self) -> dict[str, Any] | None:
        try:
            frame = self._load_dramas()
            if frame.empty:
                return None

            return {
                "stats": self._build_summary(frame),
                "ratingByGenre": self._build_rating_by_genre(frame),
                "ratingTrends": self._build_rating_trends(frame),
                "platformDistribution": self._build_platform_distribution(frame),
                "ratingDistribution": self._build_rating_distribution(frame),
                "predictionFactors": self._build_prediction_factors(),
                "monthlyReleases": self._build_monthly_releases(frame),
            }
        except Exception:
            logger.exception("Failed to build dashboard statistics.")
            return None

    def _load_dramas(self) -> pd.DataFrame:
        with self.engine.connect() as connection:
            return pd.read_sql(
                text(
                    """
                    SELECT rating, genres, original_network, start_year, start_month
                    FROM public.dramas
                    """
                ),
                connection,
            )

    def _build_summary(self, frame: pd.DataFrame) -> list[dict[str, str]]:
        total_dramas = len(frame)
        avg_rating = round(float(frame["rating"].mean()), 1)
        unique_genres = (
            frame["genres"]
            .fillna("")
            .str.split(",")
            .explode()
            .str.strip()
            .replace("", np.nan)
            .dropna()
            .nunique()
        )

        return [
            {
                "label": "Dramas Analyzed",
                "value": f"{total_dramas:,}",
                "color": "text-primary",
            },
            {
                "label": "Average Rating",
                "value": str(avg_rating),
                "color": "text-yellow-500",
            },
            {
                "label": "Prediction Accuracy",
                "value": "92%",
                "color": "text-green-500",
            },
            {
                "label": "Genres Tracked",
                "value": str(unique_genres),
                "color": "text-foreground",
            },
        ]

    def _build_rating_by_genre(self, frame: pd.DataFrame) -> list[dict[str, Any]]:
        genre_frame = frame.assign(genre=frame["genres"].fillna("").str.split(","))
        genre_frame = genre_frame.explode("genre")
        genre_frame["genre"] = genre_frame["genre"].str.strip()
        genre_frame = genre_frame[genre_frame["genre"] != ""]

        rating_by_genre = (
            genre_frame.groupby("genre")["rating"]
            .mean()
            .sort_values(ascending=False)
            .head(6)
        )

        return [
            {
                "genre": genre,
                "rating": round(float(rating), 2),
                "fill": COLORS[index % len(COLORS)],
            }
            for index, (genre, rating) in enumerate(rating_by_genre.items())
        ]

    def _build_rating_trends(self, frame: pd.DataFrame) -> list[dict[str, Any]]:
        yearly = (
            frame.groupby("start_year")
            .agg({"rating": "mean", "genres": "count"})
            .rename(columns={"genres": "count"})
            .sort_index()
            .tail(10)
        )

        return [
            {
                "year": str(int(year)),
                "avgRating": round(float(row["rating"]), 1),
                "releases": int(row["count"]),
            }
            for year, row in yearly.iterrows()
        ]

    def _build_platform_distribution(
        self,
        frame: pd.DataFrame,
    ) -> list[dict[str, Any]]:
        platforms = frame["original_network"].dropna().value_counts().head(5)
        return [
            {
                "name": platform,
                "value": int(value),
                "color": COLORS[index % len(COLORS)],
            }
            for index, (platform, value) in enumerate(platforms.items())
        ]

    @staticmethod
    def _build_rating_distribution(frame: pd.DataFrame) -> list[dict[str, Any]]:
        bins = [0, 7, 8, 9, 10]
        labels = ["< 7.0", "7.0-8.0", "8.0-9.0", "9.0-10"]
        rating_ranges = pd.cut(frame["rating"], bins=bins, labels=labels)
        distribution = rating_ranges.value_counts().sort_index()

        return [
            {"range": str(rating_range), "count": int(count)}
            for rating_range, count in distribution.items()
        ]

    def _build_prediction_factors(self) -> list[dict[str, Any]]:
        model_rating = self.models.get("Rating")
        features = self.feature_lists.get("features_rating", [])
        coef = getattr(model_rating, "coef_", None)

        if coef is None or not features:
            return []

        importance = np.ravel(np.abs(coef))
        limit = min(len(features), len(importance))

        if limit == 0:
            return []

        factors = pd.DataFrame(
            {
                "name": features[:limit],
                "impact": importance[:limit],
            }
        )
        factors["name"] = factors["name"].apply(self._display_feature_name)
        factors = factors.sort_values(by="impact", ascending=False).head(5)

        max_impact = factors["impact"].max()
        if not max_impact:
            factors["impact"] = 0
        else:
            factors["impact"] = (factors["impact"] / max_impact * 100).astype(int)

        return factors.to_dict(orient="records")

    @staticmethod
    def _build_monthly_releases(frame: pd.DataFrame) -> list[dict[str, Any]]:
        recent = frame[frame["start_year"].isin([2023, 2024])]
        monthly_counts = (
            recent.groupby(["start_year", "start_month"])
            .size()
            .unstack(level=0, fill_value=0)
            .reindex(range(1, 13), fill_value=0)
        )

        return [
            {
                "month": MONTH_NAMES[month - 1],
                "y2023": DashboardStatsService._monthly_count(
                    monthly_counts,
                    2023,
                    month,
                ),
                "y2024": DashboardStatsService._monthly_count(
                    monthly_counts,
                    2024,
                    month,
                ),
            }
            for month in range(1, 13)
        ]

    @staticmethod
    def _monthly_count(counts: pd.DataFrame, year: int, month: int) -> int:
        if year not in counts.columns or month not in counts.index:
            return 0
        return int(counts.at[month, year])

    @staticmethod
    def _display_feature_name(feature: str) -> str:
        name_map = {
            "main_lead1_score": "Main Actor",
            "main_lead2_score": "Supporting Actor",
            "directors_score": "Director",
            "screenwriters_score": "Screenwriter",
            "movie_age": "Recency",
            "episodes": "Total Episodes",
        }
        return name_map.get(
            feature,
            feature.replace("genre_", "").replace("tag_", "").title(),
        )
