"""K-Drama prediction feature engineering and inference."""

from __future__ import annotations

import logging

import numpy as np
import pandas as pd

from app.core.config import settings
from app.core.ml import ModelArtifacts, clean_tags
from app.schemas import MovieInput, PredictionResponse


logger = logging.getLogger(__name__)

AGE_RATING_MAP = {
    "G": 1,
    "13+": 2,
    "15+": 3,
    "18+": 4,
    "Unknown": 0,
    "Not Yet Rated": 0,
}

NUMERIC_FEATURES = [
    "episodes",
    "duration_mins",
    "start_year",
    "movie_age",
    "age_rating_val",
    "main_lead1_score",
    "main_lead2_score",
    "directors_score",
    "screenwriters_score",
    "start_month_sin",
    "start_month_cos",
]


class PredictionService:
    def __init__(self, artifacts: ModelArtifacts) -> None:
        self.artifacts = artifacts

    def predict(self, data: MovieInput) -> PredictionResponse:
        feature_frame = self._build_feature_frame(data)

        rating_features = self._select_features(feature_frame, "features_rating")
        watchers_features = self._select_features(feature_frame, "features_watchers")
        popularity_features = self._select_features(feature_frame, "features_pop")

        rating = self.artifacts.models["Rating"].predict(rating_features)[0]
        log_watchers = self.artifacts.models["Watchers (Log)"].predict(
            watchers_features
        )[0]
        log_popularity = self.artifacts.models["Popularity (Log)"].predict(
            popularity_features
        )[0]

        watchers = max(0, int(np.expm1(log_watchers)))
        popularity_rank = max(1, int(np.expm1(log_popularity)))

        return PredictionResponse(
            predicted_rating=round(float(rating), 2),
            predicted_watchers=watchers,
            popularity_rank=popularity_rank,
            popularity_level=self._popularity_level(popularity_rank),
        )

    def _build_feature_frame(self, data: MovieInput) -> pd.DataFrame:
        input_df = pd.DataFrame([data.model_dump()])
        input_df["movie_age"] = 2026 - data.start_year
        input_df["start_month_sin"] = np.sin(2 * np.pi * data.start_month / 12)
        input_df["start_month_cos"] = np.cos(2 * np.pi * data.start_month / 12)
        input_df["age_rating_val"] = AGE_RATING_MAP.get(data.age_rating, 0)

        input_df["main_lead1_score"] = self._get_score(data.main_lead1, "lead1")
        input_df["main_lead2_score"] = self._get_score(data.main_lead2, "lead2")
        input_df["directors_score"] = self._get_score(data.directors, "director")
        input_df["screenwriters_score"] = self._get_score(
            data.screenwriters,
            "screenwriter",
        )

        genres_encoded = self.artifacts.genre_binarizer.transform(
            [self._split_csv(data.genres)]
        )
        tags_encoded = self.artifacts.tag_vectorizer.transform(
            [clean_tags(data.tags)]
        )
        content_encoded = self.artifacts.content_vectorizer.transform(
            [data.content or ""]
        )

        genres_df = pd.DataFrame(
            genres_encoded,
            columns=[
                f"genre_{genre}"
                for genre in self.artifacts.genre_binarizer.classes_
            ],
        )
        tags_df = pd.DataFrame(
            tags_encoded.toarray(),
            columns=[
                f"tag_{feature}"
                for feature in self.artifacts.tag_vectorizer.get_feature_names_out()
            ],
        )
        content_df = pd.DataFrame(
            content_encoded.toarray(),
            columns=[
                f"txt_{feature}"
                for feature in self.artifacts.content_vectorizer.get_feature_names_out()
            ],
        )
        numeric_df = input_df[NUMERIC_FEATURES].reset_index(drop=True)

        return pd.concat([numeric_df, genres_df, tags_df, content_df], axis=1)

    def _get_score(self, value: str, map_type: str) -> float:
        encoding_maps = self.artifacts.encoding_maps
        global_mean = float(encoding_maps["global_mean"])
        return float(encoding_maps[map_type].get(value, global_mean))

    def _select_features(self, frame: pd.DataFrame, feature_key: str) -> pd.DataFrame:
        features = self.artifacts.feature_lists[feature_key]
        missing_features = [feature for feature in features if feature not in frame]

        if missing_features:
            logger.warning(
                "Feature frame is missing %s columns for %s. Filling with zero.",
                len(missing_features),
                feature_key,
            )

        return frame.reindex(columns=features, fill_value=0.0)

    @staticmethod
    def _split_csv(value: str) -> list[str]:
        return [item.strip() for item in value.split(",") if item.strip()]

    @staticmethod
    def _popularity_level(rank: int) -> str:
        if rank <= settings.threshold_hot:
            return "HOT (highly popular)"
        if rank <= settings.threshold_medium:
            return "Medium"
        return "Low"
