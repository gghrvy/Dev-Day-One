from typing import AsyncIterator

from groq import AsyncGroq
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from services.embeddings import embed_texts
from services.retriever import retrieve_chunks

groq = AsyncGroq(api_key=settings.GROQ_API_KEY)

ASK_SYSTEM_PROMPT = """You are Day One, a senior developer who knows this repository inside out.
Answer questions about the codebase using ONLY the provided context chunks.
Cite file paths when referencing code. If the context doesn't contain the answer,
say so plainly — never invent code that isn't shown."""

ONBOARD_SYSTEM_PROMPT = """You are Day One, a friendly senior developer onboarding a new teammate
to this repository. Using ONLY the provided context chunks, explain concepts step by step,
assume the reader is skilled but new to THIS codebase, suggest what to read next,
and cite file paths. If the context doesn't contain the answer, say so plainly."""


async def answer_question(
    db: AsyncSession, repo_id: str, question: str, system_prompt: str
) -> AsyncIterator[dict]:
    """Yields {'sources': [...]} once, then {'delta': str} events."""
    [query_embedding] = embed_texts([question])
    chunks = await retrieve_chunks(db, repo_id, query_embedding)

    yield {
        "sources": [
            {
                "file_path": c["file_path"],
                "start_line": (c["metadata"] or {}).get("start_line"),
                "end_line": (c["metadata"] or {}).get("end_line"),
            }
            for c in chunks
        ]
    }

    context = "\n\n".join(
        f"### {c['file_path']}\n```\n{c['content']}\n```" for c in chunks
    )
    stream = await groq.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"{context}\n\nQuestion: {question}"},
        ],
        stream=True,
    )
    async for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield {"delta": delta}
