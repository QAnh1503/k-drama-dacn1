"""Model artifact loading and shared preprocessing helpers."""

from __future__ import annotations

import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import joblib


def my_tokenizer(text: str) -> list[str]:
    return str(text).split()


def clean_tags(text: str | None) -> str:
    return str(text or "").replace("(Vote tags)", "").replace(",", " ")


@dataclass(frozen=True)
class ModelArtifacts:
    models: dict[str, Any]
    genre_binarizer: Any
    tag_vectorizer: Any
    content_vectorizer: Any
    encoding_maps: dict[str, Any]
    feature_lists: dict[str, list[str]]


def load_model_artifacts(models_dir: Path) -> ModelArtifacts:
    if not models_dir.exists():
        raise FileNotFoundError(f"Model directory not found: {models_dir}")

    # Pickle saved the notebook tokenizer as __main__.my_tokenizer.
    sys.modules["__main__"].my_tokenizer = my_tokenizer

    return ModelArtifacts(
        models=joblib.load(models_dir / "models_ridge.pkl"),
        genre_binarizer=joblib.load(models_dir / "mlb_genres.pkl"),
        tag_vectorizer=joblib.load(models_dir / "tfidf_tag.pkl"),
        content_vectorizer=joblib.load(models_dir / "tfidf_content.pkl"),
        encoding_maps=joblib.load(models_dir / "encoding_maps.pkl"),
        feature_lists=joblib.load(models_dir / "feature_lists.pkl"),
    )
