import asyncio
import json
from datetime import datetime, timezone

from sqlalchemy import text, update

from database import SessionLocal
from models import IndexingJob, Repository
from services.code_chunker import chunk_file
from services.embeddings import embed_texts
from services.github_parser import fetch_repo_files
from utils.logger import get_logger

log = get_logger(__name__)

EMBED_BATCH = 64


async def _set_job(db, job_id, **values):
    await db.execute(update(IndexingJob).where(IndexingJob.id == job_id).values(**values))
    await db.commit()


async def run_indexing(job_id: str, repo_id: str, full_name: str, github_token: str | None = None) -> None:
    """Background task: fetch → chunk → embed → insert. Owns its DB session."""
    async with SessionLocal() as db:
        try:
            await _set_job(db, job_id, status="running", progress=5)

            files = await fetch_repo_files(full_name, github_token=github_token)
            await _set_job(db, job_id, progress=20)

            chunks = [c for path, content in files for c in chunk_file(path, content)]
            if not chunks:
                raise ValueError("No indexable files found in repository")
            await _set_job(db, job_id, progress=30)

            # Re-index safety: clear previous chunks
            await db.execute(text("DELETE FROM repo_chunks WHERE repo_id = :rid"), {"rid": repo_id})
            await db.commit()

            for i in range(0, len(chunks), EMBED_BATCH):
                batch = chunks[i : i + EMBED_BATCH]
                vectors = await asyncio.to_thread(embed_texts, [c["content"] for c in batch])
                await db.execute(
                    text("""
                        INSERT INTO repo_chunks (repo_id, file_path, content, embedding, metadata)
                        VALUES (:repo_id, :file_path, :content, CAST(:embedding AS vector), CAST(:metadata AS jsonb))
                    """),
                    [
                        {
                            "repo_id": repo_id,
                            "file_path": c["file_path"],
                            "content": c["content"],
                            "embedding": json.dumps(v),
                            "metadata": json.dumps(c["metadata"]),
                        }
                        for c, v in zip(batch, vectors)
                    ],
                )
                await db.commit()
                progress = 30 + int(60 * min(1.0, (i + EMBED_BATCH) / len(chunks)))
                await _set_job(db, job_id, progress=progress)

            await db.execute(
                update(Repository)
                .where(Repository.id == repo_id)
                .values(indexed=True, indexed_at=datetime.now(timezone.utc))
            )
            await _set_job(
                db, job_id, status="done", progress=100,
                finished_at=datetime.now(timezone.utc),
            )
            log.info("indexing_done", repo=full_name, chunks=len(chunks))
        except Exception as exc:
            log.error("indexing_failed", repo=full_name, error=str(exc))
            await _set_job(
                db, job_id, status="failed", error=str(exc)[:500],
                finished_at=datetime.now(timezone.utc),
            )
