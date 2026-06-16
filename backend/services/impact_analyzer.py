import asyncio
import json

from groq import AsyncGroq
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from services.embeddings import embed_texts
from services.retriever import retrieve_chunks

IMPACT_SYSTEM = """You are an expert software engineer performing impact analysis.

Given a change description, analyze the provided code samples and identify what could break.

Return a JSON object with this exact structure:
{
  "summary": "A 2-3 sentence summary of the impact",
  "affected_files": [
    {
      "path": "src/path/to/file.ts",
      "reason": "Why this file is affected",
      "risk": "high|medium|low"
    }
  ],
  "risk_level": "high|medium|low"
}

risk_level rules:
- high: core functionality, auth, payments, data integrity
- medium: multiple dependent components affected
- low: isolated change, well-contained"""


async def analyze_impact(db: AsyncSession, repo_id: str, query: str) -> dict:
    [embedding] = await asyncio.to_thread(embed_texts, [query])
    chunks = await retrieve_chunks(db, repo_id, embedding, k=15)

    if not chunks:
        return {
            "summary": "No indexed content found.",
            "affected_files": [],
            "risk_level": "low",
        }

    context = "\n\n---\n\n".join(
        f"File: {c['file_path']}\n{c['content']}" for c in chunks
    )

    client = AsyncGroq(api_key=settings.GROQ_API_KEY)
    response = await client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {"role": "system", "content": IMPACT_SYSTEM},
            {"role": "user", "content": f"Change: {query}\n\nRelevant code:\n\n{context[:12000]}"},
        ],
        response_format={"type": "json_object"},
        temperature=0.2,
    )

    return json.loads(response.choices[0].message.content)
