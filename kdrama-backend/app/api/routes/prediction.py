"""Prediction endpoints."""

from fastapi import APIRouter, Depends

from app.api.dependencies import get_model_artifacts
from app.core.ml import ModelArtifacts
from app.schemas import MovieInput, PredictionResponse
from app.services.prediction_service import PredictionService


router = APIRouter(tags=["prediction"])


@router.post("/predict", response_model=PredictionResponse)
async def predict_kdrama(
    data: MovieInput,
    artifacts: ModelArtifacts = Depends(get_model_artifacts),
) -> PredictionResponse:
    return PredictionService(artifacts).predict(data)
