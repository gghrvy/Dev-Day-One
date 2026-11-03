"""Pre-recorded answers for the public demo's Ask and Onboard chats.

Questions are matched by keyword overlap; nothing is generated and nothing is stored.
Each answer cites real files and line ranges in this repository.
"""
import re
import time
from collections import OrderedDict

MAX_SOURCES = 8
MAX_ANSWER_CHARS = 4000

_STOPWORDS = {
    "a", "an", "the", "is", "are", "was", "be", "do", "does", "did", "how", "what", "where", "when", "why",
    "which", "who", "i", "me", "my", "we", "our", "you", "it", "its", "of", "in", "on", "to", "for", "and",
    "or", "with", "this", "that", "there", "get", "gets", "can", "should", "would", "about", "from", "at", "by",
}


def _src(path: str, start: int | None = None, end: int | None = None) -> dict:
    return {"file_path": path, "start_line": start, "end_line": end}


ANSWERS: dict[str, list[dict]] = {
    "ask": [
        {
            "question": "Where are requests authenticated?",
            "keywords": {"auth", "authenticated", "authentication", "login", "jwt", "token", "owner", "ownership",
                         "permission", "security", "user", "signed"},
            "answer": (
                "Every protected route depends on `get_current_user` in `backend/auth.py`. It reads the bearer token, "
                "and `decode_token` validates it as a Supabase JWT: HS256 tokens are checked with the project secret, "
                "and ES256 tokens with keys fetched from Supabase's JWKS endpoint and cached by key id.\n\n"
                "Being signed in isn't enough to read a repository. Handlers also call `get_owned_repo`, which returns "
                "404 unless the repo belongs to the caller's organisation. That check matters because the backend "
                "connects with the service-role key, which bypasses row-level security in the database.\n\n"
                "In the public demo none of this runs: there is no sign-in, and an allow-list middleware in "
                "`backend/demo/guard.py` blocks every route that isn't read-only."
            ),
            "sources": [_src("backend/auth.py", 35, 50), _src("backend/auth.py", 53, 61),
                        _src("backend/auth.py", 64, 73), _src("backend/demo/guard.py")],
        },
        {
            "question": "How does a chat answer get its sources?",
            "keywords": {"chat", "answer", "sources", "source", "citation", "citations", "cite", "rag", "retrieval",
                         "stream", "streaming"},
            "answer": (
                "The Ask endpoint in `backend/routers/rag.py` passes your question to `answer_question` in "
                "`backend/services/rag.py`. That function embeds the question, calls `retrieve_chunks` "
                "(`backend/services/retriever.py`) to find the five closest chunks, and yields their file paths and "
                "line ranges as a sources event before any answer text.\n\n"
                "`to_ai_sdk_sse` in `backend/services/ai_stream.py` turns that sources event into a `data-sources` "
                "message, so the frontend can show the files while the answer is still streaming."
            ),
            "sources": [_src("backend/routers/rag.py", 65, 97), _src("backend/services/rag.py", 23, 55),
                        _src("backend/services/retriever.py", 5, 19), _src("backend/services/ai_stream.py", 10, 27)],
        },
        {
            "question": "How does indexing work?",
            "keywords": {"index", "indexing", "indexed", "chunk", "chunks", "chunking", "embed", "embedding",
                         "embeddings", "tarball", "pipeline"},
            "answer": (
                "`POST /repos/{id}/index` in `backend/routers/indexing.py` creates an `indexing_jobs` row and starts "
                "`run_indexing` as a background task.\n\n"
                "`run_indexing` (`backend/services/indexing.py`) then:\n"
                "1. downloads the default branch as a tarball with `fetch_repo_files`, skipping vendored folders, "
                "binary files and anything over 100 KB;\n"
                "2. splits each file into 60-line windows with 10 lines of overlap (`chunk_file`);\n"
                "3. deletes the repo's old chunks, embeds the new ones in batches of 64 with FastEmbed, and inserts "
                "them into `repo_chunks`;\n"
                "4. updates the job's progress after each batch, then marks the repo as indexed.\n\n"
                "If anything fails, the job is marked failed with the first 500 characters of the error."
            ),
            "sources": [_src("backend/routers/indexing.py", 44, 57), _src("backend/services/indexing.py", 24, 80),
                        _src("backend/services/github_parser.py", 17, 46), _src("backend/services/code_chunker.py", 1, 21),
                        _src("backend/services/embeddings.py", 19, 28)],
        },
        {
            "question": "What tables are in the database?",
            "keywords": {"database", "table", "tables", "schema", "postgres", "migration", "migrations", "model",
                         "models", "sql", "pgvector"},
            "answer": (
                "The first migration creates the core tables: `organizations`, `users` (one row per Supabase auth "
                "user, created by a trigger along with a personal organisation), `repositories`, `indexing_jobs`, "
                "`repo_chunks` (code chunks with a `vector(384)` embedding and an HNSW index) and `chat_messages`.\n\n"
                "The second migration adds the analysis tables: `adrs`, `pattern_detections`, `knowledge_entries`, "
                "`architecture_graphs`, `impact_analyses` and `api_inventory`. The third adds an `is_admin` flag to "
                "`users`. The SQLAlchemy models in `backend/models/core.py` mirror all of these."
            ),
            "sources": [_src("backend/migrations/001_initial.sql", 1, 114), _src("backend/migrations/002_phase2.sql", 1, 64),
                        _src("backend/migrations/003_admin.sql"), _src("backend/models/core.py", 1, 127)],
        },
        {
            "question": "How is the architecture graph generated?",
            "keywords": {"architecture", "graph", "diagram", "nodes", "edges", "structure", "modules", "components"},
            "answer": (
                "`POST /repos/{id}/architecture/analyze` starts `_run_analysis` in the background. It calls "
                "`analyze_architecture` (`backend/services/arch_analyzer.py`), which searches the index with a fixed "
                "query about imports, services and databases, takes the 25 closest chunks, and asks the model for "
                "JSON with 6 to 16 nodes and the edges between them.\n\n"
                "The result is stored as one row per repo in `architecture_graphs` and drawn in the browser with "
                "React Flow."
            ),
            "sources": [_src("backend/routers/architecture.py", 16, 53), _src("backend/services/arch_analyzer.py", 12, 67),
                        _src("frontend/components/architecture/arch-graph.tsx")],
        },
        {
            "question": "How does the frontend call the backend?",
            "keywords": {"frontend", "fetch", "client", "browser", "nextjs", "next", "react", "apifetch", "api", "call"},
            "answer": (
                "Most requests go through `apiFetch` in `frontend/lib/api/client.ts`. It adds the Supabase access "
                "token as a bearer header, turns error responses into a toast with the server's message, and returns "
                "parsed JSON. React Query wraps these calls for caching and refetching.\n\n"
                "Chat is the exception: `chat-interface.tsx` uses the AI SDK's `useChat` with a transport pointed "
                "straight at `/repos/{id}/ask` or `/onboard`, because the answer arrives as a stream."
            ),
            "sources": [_src("frontend/lib/api/client.ts", 1, 39), _src("frontend/components/chat/chat-interface.tsx")],
        },
        {
            "question": "What would break if I change the embedding model?",
            "keywords": {"break", "change", "breaks", "impact", "risk", "model", "dimension", "dimensions"},
            "answer": (
                "The embedding size is fixed in three places that must agree: the `vector(384)` column in "
                "`backend/migrations/001_initial.sql`, the model loaded in `backend/services/embeddings.py`, and the "
                "vectors already stored for every repo. A model with a different size needs a migration, and every "
                "repository has to be re-indexed. The Impact page has a full analysis of this change."
            ),
            "sources": [_src("backend/migrations/001_initial.sql", 43, 52), _src("backend/services/embeddings.py", 19, 28),
                        _src("backend/services/retriever.py", 5, 19)],
        },
    ],
    "onboard": [
        {
            "question": "Where should I start reading?",
            "keywords": {"start", "begin", "first", "reading", "read", "new", "overview", "orientation", "entry"},
            "answer": (
                "Start with `backend/main.py`. It's short and shows every router the API mounts, which doubles as a "
                "feature list. Then read `backend/auth.py`, because nearly every handler depends on it.\n\n"
                "Next, follow one feature end to end. Indexing is the best first choice since everything else "
                "depends on it: `backend/routers/indexing.py`, then `backend/services/indexing.py`.\n\n"
                "On the frontend, open `frontend/lib/api/client.ts` to see how the browser talks to the API, then "
                "any page under `frontend/app/(dashboard)/dashboard/repos/[id]/`."
            ),
            "sources": [_src("backend/main.py"), _src("backend/auth.py", 1, 73), _src("backend/routers/indexing.py", 1, 57),
                        _src("frontend/lib/api/client.ts", 1, 39)],
        },
        {
            "question": "How do I run it locally?",
            "keywords": {"run", "locally", "local", "setup", "install", "dev", "start", "environment", "env"},
            "answer": (
                "From the repo root, `node dev.js` starts both apps: the FastAPI backend with uvicorn on port 8000 "
                "(from `backend/.venv`) and the Next.js dev server on port 3000.\n\n"
                "Before that, install the backend requirements, run `npm install` in `frontend/`, copy both "
                "`.env.example` files and fill them in, and run the SQL files in `backend/migrations/` in order "
                "against a Supabase project. The README lists every variable."
            ),
            "sources": [_src("dev.js"), _src("README.md"), _src("backend/.env.example"), _src("frontend/.env.example")],
        },
        {
            "question": "How are the backend folders organised?",
            "keywords": {"folders", "folder", "organised", "organized", "structure", "layout", "routers", "services",
                         "directories"},
            "answer": (
                "`routers/` holds one FastAPI router per feature and stays thin. `services/` holds the work: GitHub "
                "download, chunking, embeddings, retrieval and the AI analyzers. `models/` has the SQLAlchemy tables, "
                "`schemas/` the Pydantic request and response shapes, and `migrations/` the SQL to create the "
                "database. `demo/` contains the public demo's sample data and its allow-list guard."
            ),
            "sources": [_src("backend/routers/repos.py"), _src("backend/services/rag.py"), _src("backend/models/core.py"),
                        _src("backend/schemas/repo.py"), _src("backend/demo/guard.py")],
        },
    ],
}


def _tokens(text: str) -> set[str]:
    return {w for w in re.findall(r"[a-z0-9]+", text.lower()) if w not in _STOPWORDS}


def _fallback(mode: str) -> dict:
    listed = "\n".join(f"- {a['question']}" for a in ANSWERS[mode])
    return {
        "answer": (
            "This public demo only has pre-recorded answers, and none of them matches that question. "
            f"Try one of these:\n\n{listed}"
        ),
        "sources": [],
    }


class AnswerCache:
    """Small TTL cache of matched answers, keyed by mode and normalised question."""

    def __init__(self, ttl: float = 300.0, max_entries: int = 256, clock=time.monotonic):
        self._ttl, self._max, self._clock = ttl, max_entries, clock
        self._items: OrderedDict[tuple[str, str], tuple[float, dict]] = OrderedDict()

    def get_or_match(self, mode: str, question: str) -> dict:
        key = (mode, " ".join(sorted(_tokens(question))))
        now = self._clock()
        hit = self._items.get(key)
        if hit and now - hit[0] < self._ttl:
            self._items.move_to_end(key)
            return hit[1]
        result = match(mode, question)
        self._items[key] = (now, result)
        self._items.move_to_end(key)
        while len(self._items) > self._max:
            self._items.popitem(last=False)
        return result


def match(mode: str, question: str) -> dict:
    """Return {'answer', 'sources'} for the best pre-recorded answer, or a list of suggestions."""
    asked = _tokens(question)
    best, best_score = None, 0
    for entry in ANSWERS[mode]:
        if question.strip().lower() == entry["question"].lower():
            best, best_score = entry, 99
            break
        score = len(asked & (entry["keywords"] | _tokens(entry["question"])))
        if score > best_score:
            best, best_score = entry, score
    if best is None:
        return _fallback(mode)
    return {"answer": best["answer"][:MAX_ANSWER_CHARS], "sources": best["sources"][:MAX_SOURCES]}


def questions() -> dict[str, list[str]]:
    return {mode: [a["question"] for a in entries] for mode, entries in ANSWERS.items()}
