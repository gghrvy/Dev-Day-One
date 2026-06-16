from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def retrieve_chunks(
    db: AsyncSession, repo_id: str, query_embedding: list[float], k: int = 5
) -> list[dict]:
    result = await db.execute(
        text("""
            SELECT file_path, content, metadata,
                   1 - (embedding <=> CAST(:emb AS vector)) AS similarity
            FROM repo_chunks
            WHERE repo_id = :repo_id
            ORDER BY embedding <=> CAST(:emb AS vector)
            LIMIT :k
        """),
        {"emb": str(query_embedding), "repo_id": repo_id, "k": k},
    )
    return [dict(row) for row in result.mappings().all()]
