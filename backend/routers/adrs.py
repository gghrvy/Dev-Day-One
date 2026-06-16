import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user, get_owned_repo
from database import get_db
from models import Adr, User
from schemas.adr import AdrCreate, AdrResponse, AdrUpdate

router = APIRouter(prefix="/repos/{repo_id}/adrs", tags=["adrs"])


@router.get("", response_model=list[AdrResponse])
async def list_adrs(
    repo_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await get_owned_repo(repo_id, user, db)
    result = await db.execute(
        select(Adr).where(Adr.repo_id == uuid.UUID(repo_id)).order_by(Adr.created_at.desc())
    )
    return result.scalars().all()


@router.post("", response_model=AdrResponse, status_code=201)
async def create_adr(
    repo_id: str,
    body: AdrCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await get_owned_repo(repo_id, user, db)
    adr = Adr(repo_id=uuid.UUID(repo_id), **body.model_dump())
    db.add(adr)
    await db.commit()
    await db.refresh(adr)
    return adr


@router.get("/{adr_id}", response_model=AdrResponse)
async def get_adr(
    repo_id: str,
    adr_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await get_owned_repo(repo_id, user, db)
    adr = await db.get(Adr, uuid.UUID(adr_id))
    if not adr or adr.repo_id != uuid.UUID(repo_id):
        raise HTTPException(404, "ADR not found")
    return adr


@router.patch("/{adr_id}", response_model=AdrResponse)
async def update_adr(
    repo_id: str,
    adr_id: str,
    body: AdrUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await get_owned_repo(repo_id, user, db)
    adr = await db.get(Adr, uuid.UUID(adr_id))
    if not adr or adr.repo_id != uuid.UUID(repo_id):
        raise HTTPException(404, "ADR not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(adr, field, value)
    await db.commit()
    await db.refresh(adr)
    return adr


@router.delete("/{adr_id}", status_code=204)
async def delete_adr(
    repo_id: str,
    adr_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await get_owned_repo(repo_id, user, db)
    adr = await db.get(Adr, uuid.UUID(adr_id))
    if not adr or adr.repo_id != uuid.UUID(repo_id):
        raise HTTPException(404, "ADR not found")
    await db.delete(adr)
    await db.commit()
