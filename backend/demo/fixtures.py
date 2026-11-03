"""Read-only sample data for the public demo.

The sample repository is Dev Day One itself, so every file path and line range below
points at real code in this repo. Nothing here describes a real person or business.
Data is exposed through accessor functions that return deep copies, so a request can
never mutate what the next visitor sees.
"""
import copy
from datetime import datetime, timezone

SAMPLE_REPO_ID = "5a3b1e00-0000-4000-8000-00000000d001"  # must match frontend/lib/sample.ts
SAMPLE_AUTHOR_ID = "5a3b1e00-0000-4000-8000-0000000a0001"


def _t(day: int, hour: int = 10, minute: int = 0) -> datetime:
    return datetime(2026, 10, day, hour, minute, tzinfo=timezone.utc)


def _id(n: int) -> str:
    return f"5a3b1e00-0000-4000-8000-{n:012d}"


_REPO = {
    "id": SAMPLE_REPO_ID,
    "name": "devdayone",
    "full_name": "sample/devdayone",
    "github_url": None,
    "description": "Sample repository: Dev Day One reading its own source code.",
    "indexed": True,
    "indexed_at": _t(28, 9, 42),
    "created_at": _t(27, 16, 5),
}

_JOBS = [
    {"id": _id(301), "status": "done", "progress": 100, "error": None, "started_at": _t(28, 9, 40)},
    {"id": _id(302), "status": "failed", "progress": 20, "started_at": _t(27, 16, 20),
     "error": "No indexable files found in repository"},
    {"id": _id(303), "status": "done", "progress": 100, "error": None, "started_at": _t(27, 16, 6)},
]

_ARCHITECTURE = {
    "id": _id(401),
    "repo_id": SAMPLE_REPO_ID,
    "generated_at": _t(28, 9, 50),
    "graph_data": {
        "nodes": [
            {"id": "web", "label": "Next.js frontend", "type": "service",
             "description": "Dashboard, chat and landing pages. Talks to the API with a bearer token.",
             "files": ["frontend/lib/api/client.ts", "frontend/components/chat/chat-interface.tsx"]},
            {"id": "api", "label": "FastAPI app", "type": "service",
             "description": "Mounts the routers and CORS; in demo mode, the allow-list guard.",
             "files": ["backend/main.py"]},
            {"id": "routers", "label": "Route handlers", "type": "layer",
             "description": "One router per feature: repos, indexing, chat, ADRs, patterns, impact, APIs.",
             "files": ["backend/routers/repos.py", "backend/routers/rag.py", "backend/routers/adrs.py"]},
            {"id": "auth", "label": "Auth and ownership checks", "type": "module",
             "description": "Validates Supabase JWTs and checks the caller's organisation owns the repo.",
             "files": ["backend/auth.py"]},
            {"id": "indexing", "label": "Indexing pipeline", "type": "module",
             "description": "Downloads the repo tarball, splits files into chunks, embeds and stores them.",
             "files": ["backend/services/indexing.py", "backend/services/github_parser.py",
                       "backend/services/code_chunker.py"]},
            {"id": "embeddings", "label": "FastEmbed embeddings", "type": "module",
             "description": "Runs bge-small locally to turn text into 384-dimension vectors.",
             "files": ["backend/services/embeddings.py"]},
            {"id": "rag", "label": "Retrieval and answer streaming", "type": "module",
             "description": "Finds the closest chunks, asks the model, streams the answer with sources.",
             "files": ["backend/services/rag.py", "backend/services/retriever.py", "backend/services/ai_stream.py"]},
            {"id": "analyzers", "label": "AI analyzers", "type": "module",
             "description": "Architecture, pattern, impact and API scans built on the same retrieval step.",
             "files": ["backend/services/arch_analyzer.py", "backend/services/pattern_detector.py",
                       "backend/services/impact_analyzer.py", "backend/services/api_scanner.py"]},
            {"id": "db", "label": "Postgres with pgvector", "type": "database",
             "description": "Repos, jobs, chat history, ADRs, notes and the code chunk vectors.",
             "files": ["backend/migrations/001_initial.sql", "backend/models/core.py"]},
            {"id": "supabase_auth", "label": "Supabase Auth", "type": "external",
             "description": "Sign-in with GitHub, Google or email; issues the JWTs the API checks.",
             "files": ["frontend/lib/supabase/client.ts", "backend/auth.py"]},
            {"id": "groq", "label": "Groq LLM API", "type": "external",
             "description": "Llama 3.3 70B for chat answers and the analyzers.",
             "files": ["backend/services/rag.py"]},
            {"id": "github", "label": "GitHub API", "type": "external",
             "description": "Repository metadata and source tarballs.",
             "files": ["backend/services/github_parser.py", "backend/routers/repos.py"]},
        ],
        "edges": [
            {"id": "e1", "source": "web", "target": "api", "label": "calls"},
            {"id": "e2", "source": "web", "target": "supabase_auth", "label": "uses"},
            {"id": "e3", "source": "api", "target": "routers", "label": "uses"},
            {"id": "e4", "source": "routers", "target": "auth", "label": "uses"},
            {"id": "e5", "source": "auth", "target": "supabase_auth", "label": "reads"},
            {"id": "e6", "source": "routers", "target": "indexing", "label": "calls"},
            {"id": "e7", "source": "indexing", "target": "github", "label": "calls"},
            {"id": "e8", "source": "indexing", "target": "embeddings", "label": "uses"},
            {"id": "e9", "source": "indexing", "target": "db", "label": "writes"},
            {"id": "e10", "source": "routers", "target": "rag", "label": "calls"},
            {"id": "e11", "source": "rag", "target": "embeddings", "label": "uses"},
            {"id": "e12", "source": "rag", "target": "db", "label": "reads"},
            {"id": "e13", "source": "rag", "target": "groq", "label": "calls"},
            {"id": "e14", "source": "routers", "target": "analyzers", "label": "calls"},
            {"id": "e15", "source": "analyzers", "target": "groq", "label": "calls"},
            {"id": "e16", "source": "routers", "target": "db", "label": "reads"},
        ],
    },
}

_PATTERNS = {
    "id": _id(501),
    "repo_id": SAMPLE_REPO_ID,
    "detected_at": _t(28, 9, 55),
    "patterns": [
        {"name": "Retrieval-augmented generation", "confidence": "high",
         "description": "Every AI feature embeds a query, pulls the closest code chunks from pgvector, and sends only those to the model.",
         "evidence": ["backend/services/rag.py: answer_question embeds the question and calls retrieve_chunks",
                      "backend/services/retriever.py: ORDER BY embedding <=> query vector LIMIT k",
                      "backend/services/impact_analyzer.py: same retrieve-then-prompt shape with k=15"]},
        {"name": "Service layer", "confidence": "high",
         "description": "Routers stay thin and hand work to functions in services/, which own the AI and parsing logic.",
         "evidence": ["backend/routers/impact.py: run_impact delegates to analyze_impact",
                      "backend/routers/architecture.py: _run_analysis calls analyze_architecture"]},
        {"name": "Dependency injection", "confidence": "high",
         "description": "FastAPI Depends supplies the database session and the signed-in user to each handler.",
         "evidence": ["backend/auth.py: get_current_user depends on bearer and get_db",
                      "backend/routers/adrs.py: every handler takes db and user via Depends"]},
        {"name": "Background job with progress polling", "confidence": "high",
         "description": "Indexing runs as a background task that writes progress to indexing_jobs; the UI polls it.",
         "evidence": ["backend/routers/indexing.py: trigger_indexing adds run_indexing as a background task",
                      "backend/services/indexing.py: _set_job updates status and progress",
                      "frontend/hooks/use-indexing-progress.ts: polls the job until it finishes"]},
        {"name": "Factory function", "confidence": "medium",
         "description": "One factory builds the Ask and Onboard endpoints, differing only in mode and system prompt.",
         "evidence": ["backend/routers/rag.py: _chat_endpoint(mode, system_prompt) returns an endpoint"]},
        {"name": "Middleware chain", "confidence": "medium",
         "description": "Cross-cutting concerns sit in middleware: CORS for the browser, plus the demo allow-list guard.",
         "evidence": ["backend/main.py: add_middleware(CORSMiddleware, ...)",
                      "backend/demo/guard.py: blocks every route not on the allow-list"]},
    ],
    "raw_analysis": (
        "Dev Day One is a two-part monorepo: a Next.js App Router frontend and a FastAPI backend, "
        "with Supabase providing Postgres, pgvector and authentication.\n\n"
        "The backend is organised as thin routers over a service layer. The central idea is retrieval: "
        "repositories are downloaded, split into 60-line overlapping chunks, embedded locally with FastEmbed, "
        "and stored as vectors. Chat, impact analysis, pattern detection and the API scan all start the same way, "
        "by finding the closest chunks to a query, and differ only in the prompt and the shape of JSON they ask for.\n\n"
        "Long-running work (indexing and the analyzers) runs as in-process background tasks. That keeps deployment "
        "simple but means work is lost if the process restarts mid-job."
    ),
}

_APIS = [
    # internal routes
    *[
        {"id": _id(600 + i), "name": name, "api_type": "internal", "version": None, "endpoint": endpoint,
         "file_path": path, "status": "active", "detected_at": _t(28, 10, 0)}
        for i, (name, endpoint, path) in enumerate([
            ("List repositories", "GET /repos", "backend/routers/repos.py"),
            ("Connect a repository", "POST /repos", "backend/routers/repos.py"),
            ("Start indexing", "POST /repos/{repo_id}/index", "backend/routers/indexing.py"),
            ("Indexing history", "GET /repos/{repo_id}/jobs", "backend/routers/indexing.py"),
            ("Ask a question", "POST /repos/{repo_id}/ask", "backend/routers/rag.py"),
            ("Onboarding chat", "POST /repos/{repo_id}/onboard", "backend/routers/rag.py"),
            ("Architecture graph", "GET /repos/{repo_id}/architecture", "backend/routers/architecture.py"),
            ("Impact analysis", "POST /repos/{repo_id}/impact", "backend/routers/impact.py"),
            ("Decision records", "GET /repos/{repo_id}/adrs", "backend/routers/adrs.py"),
            ("Admin stats", "GET /admin/stats", "backend/routers/admin.py"),
        ])
    ],
    # external services
    {"id": _id(650), "name": "GitHub REST API", "api_type": "external", "version": "v3",
     "endpoint": "https://api.github.com", "file_path": "backend/services/github_parser.py",
     "status": "active", "detected_at": _t(28, 10, 0)},
    {"id": _id(651), "name": "Groq chat completions", "api_type": "external", "version": None,
     "endpoint": "https://api.groq.com", "file_path": "backend/services/rag.py",
     "status": "active", "detected_at": _t(28, 10, 0)},
    {"id": _id(652), "name": "Supabase Auth JWKS", "api_type": "external", "version": "v1",
     "endpoint": "/auth/v1/.well-known/jwks.json", "file_path": "backend/auth.py",
     "status": "active", "detected_at": _t(28, 10, 0)},
    {"id": _id(653), "name": "Hugging Face model download", "api_type": "external", "version": None,
     "endpoint": "https://huggingface.co", "file_path": "backend/services/embeddings.py",
     "status": "active", "detected_at": _t(28, 10, 0)},
]

_IMPACT = [
    {"id": _id(701), "created_at": _t(29, 14, 10),
     "query": "Switch to a 768-dimension embedding model",
     "result": {
         "summary": "The vector column is fixed at 384 dimensions, so the schema, the embedder and every stored "
                    "chunk change together. Every repository has to be re-indexed after the switch.",
         "risk_level": "high",
         "affected_files": [
             {"path": "backend/migrations/001_initial.sql", "risk": "high",
              "reason": "repo_chunks.embedding is declared vector(384) and its HNSW index is built on it."},
             {"path": "backend/services/embeddings.py", "risk": "high",
              "reason": "Loads BAAI/bge-small-en-v1.5; the model name and output size change here."},
             {"path": "backend/services/indexing.py", "risk": "medium",
              "reason": "Writes vectors with CAST(:embedding AS vector); fails if sizes don't match the column."},
             {"path": "backend/services/retriever.py", "risk": "medium",
              "reason": "Compares query vectors to stored ones; mixed sizes would error at query time."},
         ],
     }},
    {"id": _id(702), "created_at": _t(29, 11, 30),
     "query": "Replace Groq with a different LLM provider",
     "result": {
         "summary": "Five services create their own Groq client, so the change is spread out but mechanical. "
                    "Streaming in rag.py needs the most care because the AI SDK stream depends on it.",
         "risk_level": "medium",
         "affected_files": [
             {"path": "backend/services/rag.py", "risk": "high",
              "reason": "Streams chat completions; the delta format feeds the AI SDK protocol."},
             {"path": "backend/services/arch_analyzer.py", "risk": "medium",
              "reason": "Uses JSON response_format, which not every provider supports the same way."},
             {"path": "backend/services/pattern_detector.py", "risk": "medium", "reason": "Same JSON-mode call."},
             {"path": "backend/services/impact_analyzer.py", "risk": "medium", "reason": "Same JSON-mode call."},
             {"path": "backend/config.py", "risk": "low", "reason": "GROQ_API_KEY and GROQ_MODEL settings."},
             {"path": "backend/requirements.txt", "risk": "low", "reason": "The groq package."},
         ],
     }},
    {"id": _id(703), "created_at": _t(29, 9, 5),
     "query": "Rename the 'Index History' page to 'Runs'",
     "result": {
         "summary": "A label change in the frontend only. The API route and table names stay the same.",
         "risk_level": "low",
         "affected_files": [
             {"path": "frontend/app/(dashboard)/dashboard/repos/[id]/jobs/page.tsx", "risk": "low",
              "reason": "Page title."},
             {"path": "frontend/components/layout/nav-data.ts", "risk": "low", "reason": "Sidebar label."},
         ],
     }},
]

_ADRS = [
    {"id": _id(801), "status": "accepted", "created_at": _t(20), "updated_at": _t(20),
     "title": "Store code embeddings in Postgres with pgvector",
     "context": "Answers need similarity search over code chunks. The app already uses Supabase Postgres for "
                "everything else, and a separate vector database would add a service to run and keep in sync.",
     "decision": "Store chunk vectors in a repo_chunks table with a vector(384) column and an HNSW index, "
                 "and query with the cosine distance operator.",
     "consequences": "One database to back up and secure. Re-indexing is a plain DELETE then INSERT. "
                     "Changing embedding size needs a migration and a full re-index.",
     "linked_files": ["backend/migrations/001_initial.sql", "backend/services/retriever.py"]},
    {"id": _id(802), "status": "accepted", "created_at": _t(20, 11), "updated_at": _t(21),
     "title": "Generate embeddings locally with FastEmbed",
     "context": "Indexing a repo produces thousands of chunks. A hosted embedding API would cost money per "
                "repo and send source code to another third party.",
     "decision": "Run BAAI/bge-small-en-v1.5 in-process with FastEmbed, loaded once and reused.",
     "consequences": "No per-token cost and code stays on the server. The first start downloads about 70 MB, "
                     "and the model needs memory on small hosts.",
     "linked_files": ["backend/services/embeddings.py", "backend/main.py"]},
    {"id": _id(803), "status": "accepted", "created_at": _t(21), "updated_at": _t(21),
     "title": "Check repository ownership in the API, not with row-level security",
     "context": "The backend connects with the Supabase service-role key, which bypasses row-level security.",
     "decision": "Every repo-scoped handler calls get_owned_repo, which returns 404 unless the repo belongs "
                 "to the caller's organisation.",
     "consequences": "Ownership rules live in one Python function and are easy to test. Forgetting the call "
                     "in a new handler would expose data, so reviews must check for it.",
     "linked_files": ["backend/auth.py"]},
    {"id": _id(804), "status": "accepted", "created_at": _t(22), "updated_at": _t(22),
     "title": "Stream chat answers with the AI SDK UI message protocol",
     "context": "The frontend uses useChat from the AI SDK, which expects a specific server-sent event format.",
     "decision": "Convert the backend's sources and text deltas into AI SDK UI message stream events.",
     "consequences": "The frontend gets streaming and source data for free. A protocol change in the AI SDK "
                     "means updating ai_stream.py.",
     "linked_files": ["backend/services/ai_stream.py", "frontend/components/chat/chat-interface.tsx"]},
    {"id": _id(805), "status": "proposed", "created_at": _t(26), "updated_at": _t(26),
     "title": "Move indexing and analysis to a job queue",
     "context": "Indexing and the analyzers run as in-process background tasks. If the server restarts, "
                "running jobs stop and stay marked as running.",
     "decision": "Proposed: move long-running work to a queue with a separate worker and retry on failure.",
     "consequences": "Jobs survive restarts and can be retried. Adds a worker and a queue to deploy.",
     "linked_files": ["backend/routers/indexing.py", "backend/services/indexing.py"]},
]

_KNOWLEDGE = [
    {"id": _id(901), "created_at": _t(23), "updated_at": _t(23),
     "title": "Re-indexing deletes the old chunks first",
     "body": "run_indexing removes every repo_chunks row for the repo before inserting new ones. "
             "If indexing fails halfway, the repo has fewer chunks than before until the next successful run.",
     "file_path": "backend/services/indexing.py", "tags": ["indexing", "data"]},
    {"id": _id(902), "created_at": _t(23, 12), "updated_at": _t(23, 12),
     "title": "The service-role key bypasses row-level security",
     "body": "Always call get_owned_repo in repo-scoped handlers. The database will not stop a query for "
             "another organisation's repo.",
     "file_path": "backend/auth.py", "tags": ["security"]},
    {"id": _id(903), "created_at": _t(24), "updated_at": _t(24),
     "title": "Chat answers use the five closest chunks",
     "body": "retrieve_chunks defaults to k=5. Questions that span many files can miss context; the analyzers "
             "ask for 15 to 25 chunks instead.",
     "file_path": "backend/services/retriever.py", "tags": ["chat", "retrieval"]},
]

_MESSAGES = {
    "ask": [
        {"id": _id(1001), "role": "user", "mode": "ask", "sources": [], "created_at": _t(29, 15, 0),
         "content": "How does a chat answer get its sources?"},
        {"id": _id(1002), "role": "assistant", "mode": "ask", "created_at": _t(29, 15, 0),
         "content": "The Ask endpoint in `backend/routers/rag.py` passes your question to `answer_question` in "
                    "`backend/services/rag.py`. That function embeds the question, calls `retrieve_chunks` "
                    "(`backend/services/retriever.py`) to find the five closest chunks, and yields their file "
                    "paths and line ranges as a sources event before any answer text.\n\n"
                    "`to_ai_sdk_sse` in `backend/services/ai_stream.py` turns that sources event into a "
                    "`data-sources` message, so the frontend can show the files while the answer is still streaming.",
         "sources": [
             {"file_path": "backend/routers/rag.py", "start_line": 65, "end_line": 97},
             {"file_path": "backend/services/rag.py", "start_line": 23, "end_line": 55},
             {"file_path": "backend/services/retriever.py", "start_line": 5, "end_line": 19},
             {"file_path": "backend/services/ai_stream.py", "start_line": 10, "end_line": 27},
         ]},
    ],
    "onboard": [],
}


def repo() -> dict:
    return copy.deepcopy(_REPO)


def jobs() -> list[dict]:
    return copy.deepcopy(_JOBS)


def architecture() -> dict:
    return copy.deepcopy(_ARCHITECTURE)


def patterns() -> dict:
    return copy.deepcopy(_PATTERNS)


def apis() -> list[dict]:
    return [{**a, "repo_id": SAMPLE_REPO_ID} for a in copy.deepcopy(_APIS)]


def impact() -> list[dict]:
    return [{**i, "repo_id": SAMPLE_REPO_ID} for i in copy.deepcopy(_IMPACT)]


def adrs() -> list[dict]:
    return [{**a, "repo_id": SAMPLE_REPO_ID} for a in copy.deepcopy(_ADRS)]


def knowledge() -> list[dict]:
    return [{**k, "repo_id": SAMPLE_REPO_ID, "author_id": SAMPLE_AUTHOR_ID} for k in copy.deepcopy(_KNOWLEDGE)]


def messages(mode: str) -> list[dict]:
    return copy.deepcopy(_MESSAGES[mode])


def snapshot() -> dict:
    """Everything the demo can serve, for tests that prove nothing was mutated."""
    return copy.deepcopy({
        "repo": _REPO, "jobs": _JOBS, "architecture": _ARCHITECTURE, "patterns": _PATTERNS, "apis": _APIS,
        "impact": _IMPACT, "adrs": _ADRS, "knowledge": _KNOWLEDGE, "messages": _MESSAGES,
    })
