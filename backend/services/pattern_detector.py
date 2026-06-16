import asyncio
import json

from groq import AsyncGroq
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from services.embeddings import embed_texts
from services.retriever import retrieve_chunks

PATTERN_SYSTEM = """You are an expert software architect. Analyze the provided code samples and identify architectural patterns.

Return a JSON object with this exact structure:
{
  "patterns": [
    {
      "name": "Pattern Name",
      "confidence": "high|medium|low",
      "description": "One sentence explaining how this pattern is used in this specific codebase",
      "evidence": ["file/path.ext: explains what you see", "another/file.ext: what you see"]
    }
  ],
  "raw_analysis": "A 2-3 paragraph narrative about the overall architecture"
}

Common patterns to look for: MVC, Repository Pattern, Service Layer, Domain-Driven Design, CQRS, Event-Driven, Hexagonal Architecture, Microservices, Monolith, Factory Pattern, Observer Pattern, Middleware Chain.

Only report patterns you see clear evidence of. Do not hallucinate patterns."""


async def detect_patterns(db: AsyncSession, repo_id: str) -> dict:
    query = "architecture service layer repository pattern controller model"
    [embedding] = await asyncio.to_thread(embed_texts, [query])
    chunks = await retrieve_chunks(db, repo_id, embedding, k=20)

    if not chunks:
        return {"patterns": [], "raw_analysis": "No indexed content found for this repository."}

    context = "\n\n---\n\n".join(
        f"File: {c['file_path']}\n{c['content']}" for c in chunks
    )

    client = AsyncGroq(api_key=settings.GROQ_API_KEY)
    response = await client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {"role": "system", "content": PATTERN_SYSTEM},
            {"role": "user", "content": f"Analyze these code samples:\n\n{context[:12000]}"},
        ],
        response_format={"type": "json_object"},
        temperature=0.2,
    )

    return json.loads(response.choices[0].message.content)
