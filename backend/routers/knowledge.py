import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user, get_owned_repo
from database import get_db
from models import KnowledgeEntry, User
from schemas.knowledge import KnowledgeCreate, KnowledgeResponse, KnowledgeUpdate

router = APIRouter(prefix="/repos/{repo_id}/knowledge", tags=["knowledge"])


@router.get("", response_model=list[KnowledgeResponse])
async def list_knowledge(
    repo_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await get_owned_repo(repo_id, user, db)
    result = await db.execute(
        select(KnowledgeEntry)
        .where(KnowledgeEntry.repo_id == uuid.UUID(repo_id))
        .order_by(KnowledgeEntry.created_at.desc())
    )
    return result.scalars().all()


@router.post("", response_model=KnowledgeResponse, status_code=201)
async def create_knowledge(
    repo_id: str,
    body: KnowledgeCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await get_owned_repo(repo_id, user, db)
    entry = KnowledgeEntry(
        repo_id=uuid.UUID(repo_id),
        author_id=user.id,
        **body.model_dump(),
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return entry


@router.patch("/{entry_id}", response_model=KnowledgeResponse)
async def update_knowledge(
    repo_id: str,
    entry_id: str,
    body: KnowledgeUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await get_owned_repo(repo_id, user, db)
    entry = await db.get(KnowledgeEntry, uuid.UUID(entry_id))
    if not entry or entry.repo_id != uuid.UUID(repo_id):
        raise HTTPException(404, "Entry not found")
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(entry, k, v)
    await db.commit()
    await db.refresh(entry)
    return entry


@router.delete("/{entry_id}", status_code=204)
async def delete_knowledge(
    repo_id: str,
    entry_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await get_owned_repo(repo_id, user, db)
    entry = await db.get(KnowledgeEntry, uuid.UUID(entry_id))
    if not entry or entry.repo_id != uuid.UUID(repo_id):
        raise HTTPException(404, "Entry not found")
    await db.delete(entry)
    await db.commit()
