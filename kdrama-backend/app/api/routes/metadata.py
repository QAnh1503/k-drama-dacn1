"""Metadata endpoints for autocomplete data."""

from fastapi import APIRouter

from app.core.database import get_engine
from app.schemas import MetadataResponse
from app.services.metadata_service import MetadataService


router = APIRouter(tags=["metadata"])


@router.get("/metadata", response_model=MetadataResponse)
def get_metadata() -> MetadataResponse:
    return MetadataService(get_engine()).get_metadata()
