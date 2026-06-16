import json
import uuid
from typing import AsyncIterator


def _ev(obj: dict) -> str:
    return f"data: {json.dumps(obj)}\n\n"


async def to_ai_sdk_sse(events: AsyncIterator[dict]) -> AsyncIterator[str]:
    """Convert {'sources': [...]} / {'delta': str} events into the
    Vercel AI SDK v5 UI message stream protocol (SSE)."""
    message_id = uuid.uuid4().hex
    yield _ev({"type": "start"})
    text_started = False
    async for event in events:
        if "sources" in event:
            yield _ev({"type": "data-sources", "data": event["sources"]})
        elif "delta" in event:
            if not text_started:
                yield _ev({"type": "text-start", "id": message_id})
                text_started = True
            yield _ev({"type": "text-delta", "id": message_id, "delta": event["delta"]})
    if text_started:
        yield _ev({"type": "text-end", "id": message_id})
    yield _ev({"type": "finish"})
    yield "data: [DONE]\n\n"
