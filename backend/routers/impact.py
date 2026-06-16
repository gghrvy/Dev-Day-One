import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user, get_owned_repo
from database import get_db
from models import ImpactAnalysis, User
from schemas.impact import ImpactAnalysisResponse, ImpactRequest
from services.impact_analyzer import analyze_impact

router = APIRouter(prefix="/repos/{repo_id}/impact", tags=["impact"])


@router.get("", response_model=list[ImpactAnalysisResponse])
async def list_impact(
    repo_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await get_owned_repo(repo_id, user, db)
    result = await db.execute(
        select(ImpactAnalysis)
        .where(ImpactAnalysis.repo_id == uuid.UUID(repo_id))
        .order_by(ImpactAnalysis.created_at.desc())
        .limit(20)
    )
    return result.scalars().all()


@router.post("", response_model=ImpactAnalysisResponse, status_code=201)
async def run_impact(
    repo_id: str,
    body: ImpactRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await get_owned_repo(repo_id, user, db)
    result = await analyze_impact(db, repo_id, body.query)
    analysis = ImpactAnalysis(
        repo_id=uuid.UUID(repo_id),
        query=body.query,
        result=result,
    )
    db.add(analysis)
    await db.commit()
    await db.refresh(analysis)
    return analysis
