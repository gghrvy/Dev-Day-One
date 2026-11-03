from fastapi import APIRouter, Depends, Header, HTTPException
from github import Github, UnknownObjectException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user, get_owned_repo
from config import settings
from database import get_db
from models import Repository, User
from schemas.repo import ConnectRepoRequest, RepoResponse

router = APIRouter(prefix="/repos", tags=["repos"])


@router.get("", response_model=list[RepoResponse])
async def list_repos(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Repository)
        .where(Repository.org_id == user.org_id)
        .order_by(Repository.created_at.desc())
    )
    return result.scalars().all()


@router.post("", response_model=RepoResponse, status_code=201)
async def connect_repo(
    body: ConnectRepoRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    x_github_token: str | None = Header(default=None),
):
    token = x_github_token or settings.GITHUB_TOKEN or None
    gh = Github(token)
    try:
        gh_repo = gh.get_repo(body.full_name)
    except UnknownObjectException:
        raise HTTPException(404, "Repository not found on GitHub")

    result = await db.execute(
        select(Repository).where(
            Repository.org_id == user.org_id,
            Repository.github_id == gh_repo.id,
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        return existing

    repo = Repository(
        org_id=user.org_id,
        name=gh_repo.name,
        full_name=gh_repo.full_name,
        github_url=gh_repo.html_url,
        github_id=gh_repo.id,
        description=gh_repo.description,
        is_private=gh_repo.private,
    )
    db.add(repo)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        # Race condition or cross-org conflict — return existing if we own it
        result = await db.execute(
            select(Repository).where(
                Repository.org_id == user.org_id,
                Repository.github_id == gh_repo.id,
            )
        )
        existing = result.scalar_one_or_none()
        if existing:
            return existing
        raise HTTPException(409, "This repository is already connected by another account")
    await db.refresh(repo)
    return repo


@router.get("/{repo_id}", response_model=RepoResponse)
async def get_repo(
    repo_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return await get_owned_repo(repo_id, user, db)


@router.delete("/{repo_id}", status_code=204)
async def delete_repo(
    repo_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    repo = await get_owned_repo(repo_id, user, db)
    await db.delete(repo)
    await db.commit()
