import uuid

from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user, get_owned_repo
from database import SessionLocal, get_db
from models import PatternDetection, User
from schemas.pattern import PatternDetectionResponse
from services.pattern_detector import detect_patterns

router = APIRouter(prefix="/repos/{repo_id}/patterns", tags=["patterns"])


async def _run_detection(repo_id: str) -> None:
    async with SessionLocal() as db:
        result = await detect_patterns(db, repo_id)
        existing = await db.execute(
            select(PatternDetection).where(PatternDetection.repo_id == uuid.UUID(repo_id))
        )
        detection = existing.scalar_one_or_none()
        if detection:
            detection.patterns = result.get("patterns", [])
            detection.raw_analysis = result.get("raw_analysis")
        else:
            detection = PatternDetection(
                repo_id=uuid.UUID(repo_id),
                patterns=result.get("patterns", []),
                raw_analysis=result.get("raw_analysis"),
            )
            db.add(detection)
        await db.commit()


@router.get("", response_model=PatternDetectionResponse | None)
async def get_patterns(
    repo_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await get_owned_repo(repo_id, user, db)
    result = await db.execute(
        select(PatternDetection).where(PatternDetection.repo_id == uuid.UUID(repo_id))
    )
    return result.scalar_one_or_none()


@router.post("/detect", status_code=202)
async def trigger_detection(
    repo_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await get_owned_repo(repo_id, user, db)
    background_tasks.add_task(_run_detection, repo_id)
    return {"status": "detecting"}
