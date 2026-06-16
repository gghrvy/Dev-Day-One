from pydantic import BaseModel, ConfigDict


class UIMessagePart(BaseModel):
    model_config = ConfigDict(extra="allow")
    type: str
    text: str | None = None


class UIMessage(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: str
    role: str
    parts: list[UIMessagePart]


class ChatRequest(BaseModel):
    """Body sent by AI SDK v5 useChat/DefaultChatTransport."""
    model_config = ConfigDict(extra="allow")
    id: str | None = None
    messages: list[UIMessage]


def last_user_text(messages: list[UIMessage]) -> str:
    for message in reversed(messages):
        if message.role == "user":
            text = " ".join(p.text for p in message.parts if p.type == "text" and p.text)
            if text:
                return text
    raise ValueError("No user message with text parts found")
