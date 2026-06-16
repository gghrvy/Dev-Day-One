import pytest
from fastapi import HTTPException
from jose import jwt

from auth import decode_token

SECRET = "test-secret"  # matches conftest SUPABASE_JWT_SECRET


def make_token(sub: str = "11111111-1111-1111-1111-111111111111", aud: str = "authenticated") -> str:
    return jwt.encode({"sub": sub, "aud": aud}, SECRET, algorithm="HS256")


def test_valid_token_returns_sub():
    assert decode_token(make_token()) == "11111111-1111-1111-1111-111111111111"


def test_wrong_audience_rejected():
    with pytest.raises(HTTPException) as exc:
        decode_token(make_token(aud="anon"))
    assert exc.value.status_code == 401


def test_garbage_token_rejected():
    with pytest.raises(HTTPException) as exc:
        decode_token("not-a-jwt")
    assert exc.value.status_code == 401
