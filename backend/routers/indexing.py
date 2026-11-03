import uuid

from fastapi import APIRouter, BackgroundTasks, Depends, Header
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user, get_owned_repo
from config import settings
from database import get_db
from models import IndexingJob, User
from schemas.job import JobResponse
from services.indexing import run_indexing

router = APIRouter(prefix="/repos", tags=["indexing"])


@router.get("/{repo_id}/jobs", response_model=list[JobResponse])
async def list_jobs(
    repo_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await get_owned_repo(repo_id, user, db)
    result = await db.execute(
        select(IndexingJob)
        .where(IndexingJob.repo_id == uuid.UUID(repo_id))
        .order_by(IndexingJob.started_at.desc())
        .limit(20)
    )
    return result.scalars().all()


@router.post("/{repo_id}/index", status_code=202)
async def trigger_indexing(
    repo_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    x_github_token: str | None = Header(default=None),
):
    repo = await get_owned_repo(repo_id, user, db)
    job = IndexingJob(id=uuid.uuid4(), repo_id=repo.id)
    db.add(job)
    await db.commit()
    github_token = x_github_token or settings.GITHUB_TOKEN or None
    background_tasks.add_task(run_indexing, str(job.id), str(repo.id), repo.full_name, github_token)
    return {"job_id": str(job.id)}
