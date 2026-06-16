from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy import delete as sql_delete
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user, get_owned_repo
from database import get_db
from models import ChatMessage, User
from schemas.chat import ChatRequest, last_user_text
from services.ai_stream import to_ai_sdk_sse
from services.rag import ASK_SYSTEM_PROMPT, ONBOARD_SYSTEM_PROMPT, answer_question

router = APIRouter(prefix="/repos", tags=["ai"])


class ChatMessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    role: str
    content: str
    sources: list
    mode: str
    created_at: datetime


@router.get("/{repo_id}/messages", response_model=list[ChatMessageResponse])
async def get_messages(
    repo_id: str,
    mode: str = "ask",
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await get_owned_repo(repo_id, user, db)
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.repo_id == UUID(repo_id), ChatMessage.mode == mode)
        .order_by(ChatMessage.created_at.asc())
        .limit(100)
    )
    return result.scalars().all()


@router.delete("/{repo_id}/messages", status_code=204)
async def clear_messages(
    repo_id: str,
    mode: str = "ask",
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await get_owned_repo(repo_id, user, db)
    await db.execute(
        sql_delete(ChatMessage).where(
            ChatMessage.repo_id == UUID(repo_id),
            ChatMessage.mode == mode,
        )
    )
    await db.commit()


def _chat_endpoint(mode: str, system_prompt: str):
    async def endpoint(
        repo_id: str,
        body: ChatRequest,
        db: AsyncSession = Depends(get_db),
        user: User = Depends(get_current_user),
    ):
        repo = await get_owned_repo(repo_id, user, db)
        question = last_user_text(body.messages)

        async def events_with_persistence():
            answer_parts: list[str] = []
            sources: list = []
            async for event in answer_question(db, str(repo.id), question, system_prompt):
                if "sources" in event:
                    sources = event["sources"]
                elif "delta" in event:
                    answer_parts.append(event["delta"])
                yield event
            db.add(ChatMessage(repo_id=repo.id, user_id=user.id, mode=mode,
                               role="user", content=question))
            db.add(ChatMessage(repo_id=repo.id, user_id=user.id, mode=mode,
                               role="assistant", content="".join(answer_parts), sources=sources))
            await db.commit()

        return StreamingResponse(
            to_ai_sdk_sse(events_with_persistence()),
            media_type="text/event-stream",
            headers={"x-vercel-ai-ui-message-stream": "v1"},
        )

    return endpoint


router.post("/{repo_id}/ask")(_chat_endpoint("ask", ASK_SYSTEM_PROMPT))
router.post("/{repo_id}/onboard")(_chat_endpoint("onboard", ONBOARD_SYSTEM_PROMPT))
