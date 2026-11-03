"""Read-only routes for the public demo. Same paths and response shapes as the real API,
served from fixtures. The only live feature is the pre-recorded Ask/Onboard chat."""
import asyncio
import json
from typing import AsyncIterator

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import ValidationError

from demo import answers, fixtures
from demo.limits import visitor_key
from schemas.adr import AdrResponse
from schemas.api_intel import ApiItemResponse
from schemas.architecture import ArchitectureGraphResponse
from schemas.chat import ChatMessageResponse, ChatRequest, last_user_text
from schemas.impact import ImpactAnalysisResponse
from schemas.job import JobResponse
from schemas.knowledge import KnowledgeResponse
from schemas.pattern import PatternDetectionResponse
from schemas.repo import RepoResponse
from services.ai_stream import to_ai_sdk_sse

MAX_QUESTION_CHARS = 500
MAX_MESSAGES = 100  # above 2 x the hourly question limit, so the rate limit is what visitors hit
MAX_BODY_BYTES = 64 * 1024
CHAT_MODES = ("ask", "onboard")
SAVE_FLAGS = ("save", "persist", "store")

router = APIRouter(tags=["demo"])
REPO = f"/repos/{fixtures.SAMPLE_REPO_ID}"


@router.get("/demo/questions")
def demo_questions():
    return answers.questions()


@router.get("/repos", response_model=list[RepoResponse])
def list_repos():
    return [fixtures.repo()]


@router.get(REPO, response_model=RepoResponse)
def get_repo():
    return fixtures.repo()


@router.get(f"{REPO}/jobs", response_model=list[JobResponse])
def list_jobs():
    return fixtures.jobs()


@router.get(f"{REPO}/messages", response_model=list[ChatMessageResponse])
def get_messages(mode: str = "ask"):
    if mode not in CHAT_MODES:
        raise HTTPException(400, "Unknown chat mode. Use ask or onboard.")
    return fixtures.messages(mode)


@router.get(f"{REPO}/architecture", response_model=ArchitectureGraphResponse)
def get_architecture():
    return fixtures.architecture()


@router.get(f"{REPO}/patterns", response_model=PatternDetectionResponse)
def get_patterns():
    return fixtures.patterns()


@router.get(f"{REPO}/apis", response_model=list[ApiItemResponse])
def list_apis():
    return fixtures.apis()


@router.get(f"{REPO}/impact", response_model=list[ImpactAnalysisResponse])
def list_impact():
    return fixtures.impact()


@router.get(f"{REPO}/adrs", response_model=list[AdrResponse])
def list_adrs():
    return fixtures.adrs()


@router.get(f"{REPO}/adrs/{{adr_id}}", response_model=AdrResponse)
def get_adr(adr_id: str):
    for adr in fixtures.adrs():
        if adr["id"] == adr_id:
            return adr
    raise HTTPException(404, "Decision record not found.")


@router.get(f"{REPO}/knowledge", response_model=list[KnowledgeResponse])
def list_knowledge():
    return fixtures.knowledge()


async def _read_capped_body(request: Request) -> bytes:
    """Read at most MAX_BODY_BYTES, whether or not the client sent Content-Length (chunked uploads don't)."""
    declared = request.headers.get("content-length", "")
    if declared.isdigit() and int(declared) > MAX_BODY_BYTES:
        raise HTTPException(413, "That request is too large.")
    body = bytearray()
    async for chunk in request.stream():
        body += chunk
        if len(body) > MAX_BODY_BYTES:
            raise HTTPException(413, "That request is too large.")
    return bytes(body)


async def _validated_question(request: Request) -> str:
    try:
        raw = json.loads(await _read_capped_body(request))
    except (ValueError, RecursionError):  # RecursionError: deeply nested JSON is not a ValueError
        raise HTTPException(400, "Send the question as JSON.")
    if not isinstance(raw, dict):
        raise HTTPException(400, "Send the question as JSON.")
    if any(raw.get(flag) for flag in SAVE_FLAGS):
        raise HTTPException(403, "Saving is turned off in the public demo.")
    try:
        body = ChatRequest.model_validate(raw)
    except ValidationError:
        raise HTTPException(400, "That request isn't a chat message.")
    if len(body.messages) > MAX_MESSAGES:
        raise HTTPException(400, "This conversation is too long. Reload the page to start a new one.")
    try:
        question = last_user_text(body.messages).strip()
    except ValueError:
        raise HTTPException(400, "Type a question first.")
    if not question:
        raise HTTPException(400, "Type a question first.")
    if len(question) > MAX_QUESTION_CHARS:
        raise HTTPException(400, f"Questions can be up to {MAX_QUESTION_CHARS} characters.")
    return question


async def _events(result: dict, delay: float) -> AsyncIterator[dict]:
    yield {"sources": result["sources"]}
    words = result["answer"].split(" ")
    for i in range(0, len(words), 3):
        yield {"delta": " ".join(words[i : i + 3]) + (" " if i + 3 < len(words) else "")}
        if delay:
            await asyncio.sleep(delay)


def _chat(mode: str):
    async def endpoint(request: Request):
        question = await _validated_question(request)
        allowed, retry_after, reason = request.app.state.demo_limiter.check(visitor_key(request))
        if not allowed:
            message = (
                "The demo has answered a lot of questions this hour. Try again later."
                if reason == "global"
                else "You've asked a lot of questions this hour. Try again later."
            )
            raise HTTPException(429, message, headers={"Retry-After": str(retry_after)})
        result = request.app.state.demo_answers.get_or_match(mode, question)
        return StreamingResponse(
            to_ai_sdk_sse(_events(result, request.app.state.demo_stream_delay)),
            media_type="text/event-stream",
            headers={"x-vercel-ai-ui-message-stream": "v1"},
        )

    return endpoint


router.post(f"{REPO}/ask")(_chat("ask"))
router.post(f"{REPO}/onboard")(_chat("onboard"))
