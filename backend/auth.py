import uuid

import httpx
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from database import get_db
from models import Repository, User

bearer = HTTPBearer()

# JWKS cache keyed by kid — re-fetched when an unknown kid arrives (key rotation)
_jwks: dict[str, dict] = {}


def _load_jwks() -> None:
    resp = httpx.get(f"{settings.SUPABASE_URL}/auth/v1/.well-known/jwks.json", timeout=5)
    resp.raise_for_status()
    for key in resp.json().get("keys", []):
        _jwks[key["kid"]] = key


def _get_key(kid: str) -> dict:
    if kid not in _jwks:
        _load_jwks()
    key = _jwks.get(kid)
    if not key:
        raise HTTPException(status_code=401, detail="Unknown signing key")
    return key


def decode_token(token: str) -> str:
    """Validate a Supabase JWT (ES256 or HS256) and return the user id (sub claim)."""
    try:
        header = jwt.get_unverified_header(token)
        alg = header.get("alg", "HS256")

        if alg == "HS256":
            key = settings.SUPABASE_JWT_SECRET
        else:
            key = _get_key(header["kid"])

        payload = jwt.decode(token, key, algorithms=[alg], audience="authenticated")
        return payload["sub"]
    except (JWTError, KeyError) as e:
        print(f"[auth] JWT decode failed: {type(e).__name__}: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(bearer),
    db: AsyncSession = Depends(get_db),
) -> User:
    user_id = decode_token(creds.credentials)
    user = await db.get(User, uuid.UUID(user_id))
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def get_owned_repo(repo_id: str, user: User, db: AsyncSession) -> Repository:
    """Service-role key bypasses RLS — ownership MUST be checked here."""
    try:
        rid = uuid.UUID(repo_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Repository not found")
    repo = await db.get(Repository, rid)
    if repo is None or repo.org_id != user.org_id:
        raise HTTPException(status_code=404, detail="Repository not found")
    return repo
