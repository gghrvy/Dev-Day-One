import json

from services.ai_stream import to_ai_sdk_sse


async def collect(gen):
    return [item async for item in gen]


def parse(sse_line: str) -> dict:
    assert sse_line.startswith("data: ") and sse_line.endswith("\n\n")
    return json.loads(sse_line[len("data: "):])


async def fake_events():
    yield {"sources": [{"file_path": "a.py"}]}
    yield {"delta": "Hello"}
    yield {"delta": " world"}


async def test_full_event_sequence():
    out = await collect(to_ai_sdk_sse(fake_events()))
    types = [parse(line)["type"] for line in out[:-1]]
    assert types == ["start", "data-sources", "text-start", "text-delta", "text-delta", "text-end", "finish"]
    assert out[-1] == "data: [DONE]\n\n"


async def test_deltas_carry_text_and_shared_id():
    out = await collect(to_ai_sdk_sse(fake_events()))
    events = [parse(line) for line in out[:-1]]
    deltas = [e for e in events if e["type"] == "text-delta"]
    assert [d["delta"] for d in deltas] == ["Hello", " world"]
    text_ids = {e["id"] for e in events if e["type"].startswith("text-")}
    assert len(text_ids) == 1


async def test_sources_become_data_part():
    out = await collect(to_ai_sdk_sse(fake_events()))
    events = [parse(line) for line in out[:-1]]
    src = next(e for e in events if e["type"] == "data-sources")
    assert src["data"] == [{"file_path": "a.py"}]


async def empty_events():
    return
    yield  # pragma: no cover


async def test_no_deltas_still_valid_stream():
    out = await collect(to_ai_sdk_sse(empty_events()))
    types = [parse(line)["type"] for line in out[:-1]]
    assert types == ["start", "finish"]  # no text-start/end without text
