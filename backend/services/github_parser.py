import io
import os
import tarfile

import httpx

from config import settings

ALLOWED_EXTENSIONS = {
    ".py", ".ts", ".tsx", ".js", ".jsx", ".go", ".rs", ".java", ".rb",
    ".md", ".sql", ".json", ".yaml", ".yml", ".toml", ".css", ".html",
}
SKIP_DIRS = {"node_modules", ".git", "dist", "build", "__pycache__", ".next", "vendor", ".venv"}
MAX_FILE_BYTES = 100_000


async def fetch_repo_files(full_name: str, github_token: str | None = None) -> list[tuple[str, str]]:
    """Download a repo's default-branch tarball; return (path, content) pairs.
    github_token: user's OAuth token (supports private repos). Falls back to GITHUB_TOKEN env var."""
    url = f"https://api.github.com/repos/{full_name}/tarball"
    token = github_token or settings.GITHUB_TOKEN
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    async with httpx.AsyncClient(follow_redirects=True, timeout=120) as client:
        resp = await client.get(url, headers=headers)
        resp.raise_for_status()

    files: list[tuple[str, str]] = []
    with tarfile.open(fileobj=io.BytesIO(resp.content), mode="r:gz") as tar:
        for member in tar.getmembers():
            if not member.isfile() or member.size > MAX_FILE_BYTES:
                continue
            parts = member.name.split("/")[1:]  # strip "<owner>-<repo>-<sha>/" prefix
            if not parts or any(p in SKIP_DIRS for p in parts):
                continue
            path = "/".join(parts)
            if os.path.splitext(path)[1].lower() not in ALLOWED_EXTENSIONS:
                continue
            fobj = tar.extractfile(member)
            if fobj is None:
                continue
            try:
                content = fobj.read().decode("utf-8")
            except UnicodeDecodeError:
                continue
            files.append((path, content))
    return files
