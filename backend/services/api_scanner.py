import asyncio
import json

from groq import AsyncGroq
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from services.embeddings import embed_texts
from services.retriever import retrieve_chunks

SCAN_SYSTEM = """You are analyzing a codebase to inventory all APIs.

Return a JSON object with this structure:
{
  "apis": [
    {
      "name": "Stripe API",
      "api_type": "external",
      "version": "v1",
      "endpoint": "https://api.stripe.com/v1",
      "file_path": "src/services/payment.ts",
      "status": "active"
    }
  ]
}

api_type:
- "internal": an API route defined in this codebase
- "external": a third-party API being called

status:
- "active": in current use
- "deprecated": appears deprecated or unused
- "unknown": cannot determine

Extract every distinct API endpoint, SDK client, and HTTP call you can identify. Include version if visible in imports or config. Do not duplicate entries."""


async def scan_apis(db: AsyncSession, repo_id: str) -> list[dict]:
    query = "API endpoint fetch axios http request client SDK import version URL"
    [embedding] = await asyncio.to_thread(embed_texts, [query])
    chunks = await retrieve_chunks(db, repo_id, embedding, k=20)

    if not chunks:
        return []

    context = "\n\n---\n\n".join(
        f"File: {c['file_path']}\n{c['content']}" for c in chunks
    )

    client = AsyncGroq(api_key=settings.GROQ_API_KEY)
    response = await client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {"role": "system", "content": SCAN_SYSTEM},
            {"role": "user", "content": f"Scan for APIs:\n\n{context[:14000]}"},
        ],
        response_format={"type": "json_object"},
        temperature=0.1,
    )

    data = json.loads(response.choices[0].message.content)
    return data.get("apis", [])
