import ipaddress
import time
from collections import deque

from starlette.requests import Request

WINDOW_SECONDS = 3600
MAX_TRACKED_VISITORS = 10_000


def visitor_key(request: Request, client_ip_header: str = "") -> str:
    """Who is asking, for the per-visitor limit.

    1. client_ip_header (e.g. CF-Connecting-IP): set by the edge proxy, which overwrites any value the
       visitor sends. Render sits behind Cloudflare; checked live, the visitor can fake X-Forwarded-For.
    2. Otherwise the LAST X-Forwarded-For entry (the one our host appended), then the socket peer.
    """
    if client_ip_header:
        edge_ip = request.headers.get(client_ip_header, "").strip()
        if edge_ip:
            return _bucket(edge_ip)
    forwarded = request.headers.get("x-forwarded-for", "")
    entries = [e.strip() for e in forwarded.split(",") if e.strip()]
    raw = entries[-1] if entries else (request.client.host if request.client else "unknown")
    return _bucket(raw)


def _bucket(address: str) -> str:
    """IPv6 visitors usually control a whole /64, so rotating addresses inside it must not reset their limit."""
    try:
        ip = ipaddress.ip_address(address)
    except ValueError:
        return address
    if ip.version == 6:
        return str(ipaddress.ip_network(f"{ip}/64", strict=False))
    return str(ip)


class HourlyLimiter:
    """Sliding one-hour window: a per-visitor limit plus a global cap. In-memory, single process."""

    def __init__(self, per_visitor: int, global_cap: int, clock=time.monotonic):
        self.per_visitor, self.global_cap, self._clock = per_visitor, global_cap, clock
        self._visitors: dict[str, deque[float]] = {}
        self._global: deque[float] = deque()

    @staticmethod
    def _trim(q: deque[float], now: float) -> None:
        while q and now - q[0] >= WINDOW_SECONDS:
            q.popleft()

    def check(self, key: str) -> tuple[bool, int, str]:
        """Record one use if allowed. Returns (allowed, retry_after_seconds, reason)."""
        now = self._clock()
        self._trim(self._global, now)
        if len(self._global) >= self.global_cap:
            return False, int(WINDOW_SECONDS - (now - self._global[0])) + 1, "global"

        q = self._visitors.get(key)
        if q is None:
            if len(self._visitors) >= MAX_TRACKED_VISITORS:
                self._evict_idle(now)
            q = self._visitors[key] = deque()
        self._trim(q, now)
        if len(q) >= self.per_visitor:
            return False, int(WINDOW_SECONDS - (now - q[0])) + 1, "visitor"

        q.append(now)
        self._global.append(now)
        return True, 0, ""

    def _evict_idle(self, now: float) -> None:
        for k in [k for k, q in self._visitors.items() if not q or now - q[-1] >= WINDOW_SECONDS]:
            del self._visitors[k]
        if len(self._visitors) >= MAX_TRACKED_VISITORS:  # still full: drop the oldest-active half
            for k in sorted(self._visitors, key=lambda k: self._visitors[k][-1])[: MAX_TRACKED_VISITORS // 2]:
                del self._visitors[k]
