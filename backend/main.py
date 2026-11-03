import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import Settings, settings
from utils.logger import get_logger

log = get_logger(__name__)


@asynccontextmanager
async def _warmup_embedder(app: FastAPI):
    """Download/load the embedding model at startup so the first index call isn't blocked."""
    try:
        from services.embeddings import get_embedder
        await asyncio.to_thread(get_embedder)
        log.info("embedder_ready")
    except Exception as e:
        log.warning("embedder_warmup_failed", error=str(e))
    yield


def _mount_real_routers(app: FastAPI) -> None:
    # Imported here so demo mode never loads the database, Groq or the embedding model.
    from routers import admin, adrs, api_intel, architecture, impact, indexing, knowledge, patterns, rag, repos

    for module in (admin, repos, indexing, rag, adrs, patterns, knowledge, architecture, impact, api_intel):
        app.include_router(module.router)


def _mount_demo(app: FastAPI, s: Settings) -> None:
    from demo.answers import AnswerCache
    from demo.guard import DemoAllowListMiddleware
    from demo.limits import HourlyLimiter
    from demo.router import router as demo_router

    app.state.demo_limiter = HourlyLimiter(s.DEMO_ASK_PER_VISITOR_PER_HOUR, s.DEMO_ASK_GLOBAL_PER_HOUR)
    app.state.demo_answers = AnswerCache()
    app.state.demo_stream_delay = s.DEMO_STREAM_DELAY
    app.add_middleware(DemoAllowListMiddleware)
    app.include_router(demo_router)


def create_app(s: Settings = settings) -> FastAPI:
    demo = bool(s.DEMO_MODE)
    app = FastAPI(
        title="Day One API",
        lifespan=None if demo else _warmup_embedder,
        docs_url=None if demo else "/docs",
        redoc_url=None if demo else "/redoc",
        openapi_url=None if demo else "/openapi.json",
    )

    if demo:
        _mount_demo(app, s)
    else:
        _mount_real_routers(app)

    @app.api_route("/health", methods=["GET", "HEAD"])
    def health():
        return {"status": "ok"}

    # Added last so it is the outermost layer: preflights are answered and 403s still carry CORS headers.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[s.FRONTEND_URL],
        allow_credentials=not demo,
        allow_methods=["GET", "POST"] if demo else ["*"],
        allow_headers=["*"],
        expose_headers=["Retry-After"],
    )
    return app


app = create_app()
