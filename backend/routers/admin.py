from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user
from database import get_db
from models import ChatMessage, IndexingJob, Organization, Repository, User

router = APIRouter(prefix="/admin", tags=["admin"])


def _require_admin(user: User = Depends(get_current_user)) -> User:
    if not user.is_admin:
        raise HTTPException(403, "Admin access required")
    return user


class OrgRow(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: object
    name: str
    created_at: object


class UserRow(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: object
    email: str | None
    is_admin: bool
    created_at: object


class StatsResponse(BaseModel):
    total_users: int
    total_orgs: int
    total_repos: int
    indexed_repos: int
    total_chats: int
    total_index_jobs: int


@router.get("/stats", response_model=StatsResponse)
async def get_stats(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(_require_admin),
):
    total_users    = (await db.execute(select(func.count()).select_from(User))).scalar() or 0
    total_orgs     = (await db.execute(select(func.count()).select_from(Organization))).scalar() or 0
    total_repos    = (await db.execute(select(func.count()).select_from(Repository))).scalar() or 0
    indexed_repos  = (await db.execute(select(func.count()).select_from(Repository).where(Repository.indexed == True))).scalar() or 0  # noqa: E712
    total_chats    = (await db.execute(select(func.count()).select_from(ChatMessage).where(ChatMessage.role == "user"))).scalar() or 0
    total_index_jobs = (await db.execute(select(func.count()).select_from(IndexingJob))).scalar() or 0
    return StatsResponse(
        total_users=total_users,
        total_orgs=total_orgs,
        total_repos=total_repos,
        indexed_repos=indexed_repos,
        total_chats=total_chats,
        total_index_jobs=total_index_jobs,
    )


@router.get("/users")
async def list_users(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(_require_admin),
):
    result = await db.execute(select(User).order_by(User.created_at.desc()).limit(200))
    users = result.scalars().all()
    return [
        {
            "id": str(u.id),
            "email": u.email,
            "is_admin": u.is_admin,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        }
        for u in users
    ]


@router.post("/users/{user_id}/toggle-admin", status_code=200)
async def toggle_admin(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(_require_admin),
):
    from uuid import UUID
    target = await db.get(User, UUID(user_id))
    if not target:
        raise HTTPException(404, "User not found")
    if str(target.id) == str(current_user.id):
        raise HTTPException(400, "Cannot modify your own admin status")
    target.is_admin = not target.is_admin
    await db.commit()
    return {"id": str(target.id), "is_admin": target.is_admin}


@router.get("/repos")
async def list_all_repos(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(_require_admin),
):
    result = await db.execute(select(Repository).order_by(Repository.created_at.desc()).limit(200))
    repos = result.scalars().all()
    return [
        {
            "id": str(r.id),
            "full_name": r.full_name,
            "indexed": r.indexed,
            "is_private": r.is_private,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in repos
    ]
