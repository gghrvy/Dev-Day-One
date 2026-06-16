import asyncio

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routers import admin as admin_router
from routers import adrs as adrs_router
from routers import api_intel as api_intel_router
from routers import architecture as architecture_router
from routers import impact as impact_router
from routers import indexing as indexing_router
from routers import knowledge as knowledge_router
from routers import patterns as patterns_router
from routers import rag as rag_router
from routers import repos as repos_router
from utils.logger import get_logger

log = get_logger(__name__)

app = FastAPI(title="Day One API")


@app.on_event("startup")
async def _warmup_embedder():
    """Download/load the embedding model at startup so the first index call isn't blocked."""
    try:
        from services.embeddings import get_embedder
        await asyncio.to_thread(get_embedder)
        log.info("embedder_ready")
    except Exception as e:
        log.warning("embedder_warmup_failed", error=str(e))

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin_router.router)
app.include_router(repos_router.router)
app.include_router(indexing_router.router)
app.include_router(rag_router.router)
app.include_router(adrs_router.router)
app.include_router(patterns_router.router)
app.include_router(knowledge_router.router)
app.include_router(architecture_router.router)
app.include_router(impact_router.router)
app.include_router(api_intel_router.router)


@app.get("/health")
def health():
    return {"status": "ok"}
