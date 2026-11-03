"""Allow-list guard for the public demo: every request is refused unless its method and path
match an entry below. This runs in the backend, so hiding buttons in the UI is not the only defence."""
import re

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from demo.fixtures import SAMPLE_REPO_ID

_UUID = r"[0-9a-fA-F-]{36}"
_REPO = re.escape(SAMPLE_REPO_ID)

ALLOWED: list[tuple[str, re.Pattern[str]]] = [
    ("GET", re.compile(r"/health")),
    ("HEAD", re.compile(r"/health")),  # uptime monitors default to HEAD
    ("GET", re.compile(r"/demo/questions")),
    ("GET", re.compile(r"/repos")),
    ("GET", re.compile(rf"/repos/{_REPO}")),
    ("GET", re.compile(rf"/repos/{_REPO}/(jobs|messages|architecture|patterns|apis|impact|adrs|knowledge)")),
    ("GET", re.compile(rf"/repos/{_REPO}/adrs/{_UUID}")),
    ("POST", re.compile(rf"/repos/{_REPO}/(ask|onboard)")),
]

BLOCKED_MESSAGE = "This action is turned off in the public demo. The demo is read-only and uses sample data."


def is_allowed(method: str, path: str) -> bool:
    return any(method == m and pattern.fullmatch(path) for m, pattern in ALLOWED)


class DemoAllowListMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if not is_allowed(request.method, request.url.path):
            return JSONResponse({"detail": BLOCKED_MESSAGE}, status_code=403)
        return await call_next(request)
