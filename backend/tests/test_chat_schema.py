import pytest

from schemas.chat import ChatRequest, last_user_text


def make_request(parts):
    return ChatRequest.model_validate({
        "id": "chat-1",
        "messages": [
            {"id": "m1", "role": "assistant", "parts": [{"type": "text", "text": "earlier answer"}]},
            {"id": "m2", "role": "user", "parts": parts},
        ],
    })


def test_extracts_last_user_text():
    req = make_request([{"type": "text", "text": "What does auth.py do?"}])
    assert last_user_text(req.messages) == "What does auth.py do?"


def test_joins_multiple_text_parts():
    req = make_request([
        {"type": "text", "text": "part one"},
        {"type": "step-start"},
        {"type": "text", "text": "part two"},
    ])
    assert last_user_text(req.messages) == "part one part two"


def test_no_user_message_raises():
    req = ChatRequest.model_validate({
        "messages": [{"id": "m1", "role": "assistant", "parts": [{"type": "text", "text": "hi"}]}]
    })
    with pytest.raises(ValueError):
        last_user_text(req.messages)
