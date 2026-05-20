"""FastAPI dependency helpers."""

from fastapi import HTTPException, Request, status

from app.core.ml import ModelArtifacts


def get_model_artifacts(request: Request) -> ModelArtifacts:
    artifacts = getattr(request.app.state, "model_artifacts", None)
    if artifacts is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model artifacts are not loaded yet.",
        )
    return artifacts
