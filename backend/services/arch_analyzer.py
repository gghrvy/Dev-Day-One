import asyncio
import json

from groq import AsyncGroq
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from services.embeddings import embed_texts
from services.retriever import retrieve_chunks

ARCH_SYSTEM = """You are an expert software architect. Analyze the provided code samples and produce an architecture graph.

Return a JSON object with this exact structure:
{
  "nodes": [
    {
      "id": "unique-id",
      "label": "Node Name",
      "type": "service|module|database|external|layer",
      "description": "What this node does",
      "files": ["path/to/file.ext"]
    }
  ],
  "edges": [
    {
      "id": "edge-id",
      "source": "node-id",
      "target": "node-id",
      "label": "calls|reads|writes|extends|uses"
    }
  ]
}

Types:
- service: a distinct service or microservice
- module: a code module or package
- database: a database or data store
- external: an external API or third-party service
- layer: an architectural layer (controllers, services, repositories)

Keep it focused — 6 to 16 nodes maximum. Only include nodes with clear evidence."""


async def analyze_architecture(db: AsyncSession, repo_id: str) -> dict:
    query = "import export module service controller repository database API client"
    [embedding] = await asyncio.to_thread(embed_texts, [query])
    chunks = await retrieve_chunks(db, repo_id, embedding, k=25)

    if not chunks:
        return {"nodes": [], "edges": []}

    context = "\n\n---\n\n".join(
        f"File: {c['file_path']}\n{c['content']}" for c in chunks
    )

    client = AsyncGroq(api_key=settings.GROQ_API_KEY)
    response = await client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {"role": "system", "content": ARCH_SYSTEM},
            {"role": "user", "content": f"Analyze this codebase and produce an architecture graph:\n\n{context[:14000]}"},
        ],
        response_format={"type": "json_object"},
        temperature=0.1,
    )

    return json.loads(response.choices[0].message.content)
