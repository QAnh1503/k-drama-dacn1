"""Health check endpoints."""

from fastapi import APIRouter

from app.core.config import settings
from app.schemas import HealthResponse


router = APIRouter(tags=["health"])


@router.get("/", response_model=HealthResponse)
def root() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service=settings.app_name,
        version=settings.app_version,
    )


@router.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    return root()
