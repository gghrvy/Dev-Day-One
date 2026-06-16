import uuid

from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user, get_owned_repo
from database import SessionLocal, get_db
from models import ApiInventoryItem, User
from schemas.api_intel import ApiItemResponse
from services.api_scanner import scan_apis

router = APIRouter(prefix="/repos/{repo_id}/apis", tags=["api-intel"])


async def _run_scan(repo_id: str) -> None:
    async with SessionLocal() as db:
        apis = await scan_apis(db, repo_id)
        await db.execute(
            delete(ApiInventoryItem).where(ApiInventoryItem.repo_id == uuid.UUID(repo_id))
        )
        for api in apis:
            item = ApiInventoryItem(repo_id=uuid.UUID(repo_id), **api)
            db.add(item)
        await db.commit()


@router.get("", response_model=list[ApiItemResponse])
async def list_apis(
    repo_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await get_owned_repo(repo_id, user, db)
    result = await db.execute(
        select(ApiInventoryItem)
        .where(ApiInventoryItem.repo_id == uuid.UUID(repo_id))
        .order_by(ApiInventoryItem.api_type, ApiInventoryItem.name)
    )
    return result.scalars().all()


@router.post("/scan", status_code=202)
async def trigger_scan(
    repo_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await get_owned_repo(repo_id, user, db)
    background_tasks.add_task(_run_scan, repo_id)
    return {"status": "scanning"}
