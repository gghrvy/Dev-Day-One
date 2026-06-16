import uuid

from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user, get_owned_repo
from database import SessionLocal, get_db
from models import ArchitectureGraph, User
from schemas.architecture import ArchitectureGraphResponse
from services.arch_analyzer import analyze_architecture

router = APIRouter(prefix="/repos/{repo_id}/architecture", tags=["architecture"])


async def _run_analysis(repo_id: str) -> None:
    async with SessionLocal() as db:
        graph_data = await analyze_architecture(db, repo_id)
        existing = await db.execute(
            select(ArchitectureGraph).where(ArchitectureGraph.repo_id == uuid.UUID(repo_id))
        )
        graph = existing.scalar_one_or_none()
        if graph:
            graph.graph_data = graph_data
        else:
            graph = ArchitectureGraph(repo_id=uuid.UUID(repo_id), graph_data=graph_data)
            db.add(graph)
        await db.commit()


@router.get("", response_model=ArchitectureGraphResponse | None)
async def get_architecture(
    repo_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await get_owned_repo(repo_id, user, db)
    result = await db.execute(
        select(ArchitectureGraph).where(ArchitectureGraph.repo_id == uuid.UUID(repo_id))
    )
    return result.scalar_one_or_none()


@router.post("/analyze", status_code=202)
async def trigger_analysis(
    repo_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await get_owned_repo(repo_id, user, db)
    background_tasks.add_task(_run_analysis, repo_id)
    return {"status": "analyzing"}
