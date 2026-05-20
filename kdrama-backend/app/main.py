"""FastAPI application factory."""

from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import health, metadata, prediction, stats
from app.core.config import settings
from app.core.ml import load_model_artifacts


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    app.state.model_artifacts = load_model_artifacts(settings.models_dir)
    yield


def create_app() -> FastAPI:
    application = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="K-Drama analytics and prediction API.",
        lifespan=lifespan,
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    application.include_router(health.router)
    application.include_router(metadata.router)
    application.include_router(prediction.router)
    application.include_router(stats.router)

    return application


app = create_app()
