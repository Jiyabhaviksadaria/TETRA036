"""
Rakshak AI Backend — FastAPI application entry point.

Start with:
    uvicorn backend.app:app --reload
"""
from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api import router, timeline_store


@asynccontextmanager
async def lifespan(application: FastAPI):
    """Load the timeline from disk before the app starts accepting requests."""
    timeline_store.load()
    yield


app = FastAPI(title="Rakshak AI Backend", lifespan=lifespan)

# ---------------------------------------------------------------------------
# CORS — allow all origins for local dev (Next.js on a different port)
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
app.include_router(router)
