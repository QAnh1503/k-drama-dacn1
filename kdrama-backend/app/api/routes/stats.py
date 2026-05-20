"""Dashboard statistics endpoints."""

from fastapi import APIRouter, Depends

from app.api.dependencies import get_model_artifacts
from app.core.database import get_engine
from app.core.ml import ModelArtifacts
from app.schemas import DashboardPayload
from app.services.stats_service import DashboardStatsService


router = APIRouter(tags=["stats"])


@router.get("/api/stats")
async def get_stats_api(
    artifacts: ModelArtifacts = Depends(get_model_artifacts),
) -> DashboardPayload:
    data = DashboardStatsService(
        engine=get_engine(),
        models=artifacts.models,
        feature_lists=artifacts.feature_lists,
    ).build()

    if data is None:
        return {"error": "Could not fetch stats", "stats": []}

    return data
