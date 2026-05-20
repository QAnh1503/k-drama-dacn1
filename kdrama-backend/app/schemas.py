"""Pydantic request and response schemas."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class MovieInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    title: str = Field(..., min_length=1)
    main_lead1: str = Field(..., min_length=1)
    main_lead2: str = Field(..., min_length=1)
    directors: str = Field(..., min_length=1)
    screenwriters: str = Field(..., min_length=1)
    genres: str = ""
    tags: str = ""
    content: str = Field(..., min_length=1)
    episodes: int = Field(..., ge=1)
    duration_mins: int = Field(..., ge=1)
    start_year: int = Field(..., ge=1900)
    start_month: int = Field(..., ge=1, le=12)
    age_rating: str = "Unknown"


class MetadataResponse(BaseModel):
    actors: list[str] = []
    directors: list[str] = []
    screenwriters: list[str] = []
    error: str | None = None


class PredictionResponse(BaseModel):
    predicted_rating: float
    predicted_watchers: int
    popularity_rank: int
    popularity_level: str


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str


DashboardPayload = dict[str, Any]
