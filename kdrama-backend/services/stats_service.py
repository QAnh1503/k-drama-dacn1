"""Compatibility wrapper for the refactored stats service."""

from app.services.stats_service import DashboardStatsService


def get_db_stats(engine, models_dict, feature_lists):
    return DashboardStatsService(engine, models_dict, feature_lists).build()
