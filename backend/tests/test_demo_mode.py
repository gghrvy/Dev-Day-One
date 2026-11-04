"""Demo mode is a security boundary: every route is blocked unless explicitly allowed,
the allowed ones serve read-only fixtures, and the one live feature (pre-recorded Ask) is limited."""
import copy
import json
import uuid

import pytest
from fastapi.testclient import TestClient

import database
from config import Settings
from main import create_app

SAMPLE = "5a3b1e00-0000-4000-8000-00000000d001"  # must match frontend/lib/sample.ts
ORIGIN = "https://demo.example"


def make_client(**overrides) -> TestClient:
    s = Settings(_env_file=None, **{"DEMO_MODE": True, "FRONTEND_URL": ORIGIN, "DEMO_STREAM_DELAY": 0, **overrides})
    return TestClient(create_app(s))


@pytest.fixture
def client():
    return make_client()


def ask(client, text, path="ask", xff=None, **extra):
    body = {"messages": [{"id": "m1", "role": "user", "parts": [{"type": "text", "text": text}]}], **extra}
    headers = {"x-forwarded-for": xff} if xff else {}
    return client.post(f"/repos/{SAMPLE}/{path}", json=body, headers=headers)


def sse_events(text: str) -> list[dict]:
    return [json.loads(line[6:]) for line in text.splitlines() if line.startswith("data: {")]


# ── Allowed routes serve fixtures ─────────────────────────────────────────────

ALLOWED_GETS = [
    "/health",
    "/repos",
    f"/repos/{SAMPLE}",
    f"/repos/{SAMPLE}/jobs",
    f"/repos/{SAMPLE}/messages?mode=ask",
    f"/repos/{SAMPLE}/messages?mode=onboard",
    f"/repos/{SAMPLE}/architecture",
    f"/repos/{SAMPLE}/patterns",
    f"/repos/{SAMPLE}/apis",
    f"/repos/{SAMPLE}/impact",
    f"/repos/{SAMPLE}/adrs",
    f"/repos/{SAMPLE}/knowledge",
    "/demo/questions",
]


@pytest.mark.parametrize("path", ALLOWED_GETS)
def test_allowed_reads_return_200(client, path):
    assert client.get(path).status_code == 200


def test_repo_list_is_only_the_labelled_sample(client):
    [repo] = client.get("/repos").json()
    assert repo["id"] == SAMPLE
    assert repo["indexed"] is True
    assert "sample" in repo["description"].lower()


def test_adr_detail_is_reachable_from_list(client):
    adrs = client.get(f"/repos/{SAMPLE}/adrs").json()
    assert adrs
    r = client.get(f"/repos/{SAMPLE}/adrs/{adrs[0]['id']}")
    assert r.status_code == 200
    assert r.json()["title"] == adrs[0]["title"]


def test_unknown_adr_id_is_404_not_500(client):
    assert client.get(f"/repos/{SAMPLE}/adrs/{uuid.uuid4()}").status_code == 404


# ── Everything else is blocked ───────────────────────────────────────────────

BLOCKED = [
    ("POST", "/repos"),
    ("DELETE", f"/repos/{SAMPLE}"),
    ("POST", f"/repos/{SAMPLE}/index"),
    ("DELETE", f"/repos/{SAMPLE}/messages?mode=ask"),
    ("POST", f"/repos/{SAMPLE}/adrs"),
    ("PATCH", f"/repos/{SAMPLE}/adrs/{uuid.uuid4()}"),
    ("DELETE", f"/repos/{SAMPLE}/adrs/{uuid.uuid4()}"),
    ("POST", f"/repos/{SAMPLE}/knowledge"),
    ("PATCH", f"/repos/{SAMPLE}/knowledge/{uuid.uuid4()}"),
    ("DELETE", f"/repos/{SAMPLE}/knowledge/{uuid.uuid4()}"),
    ("POST", f"/repos/{SAMPLE}/impact"),
    ("POST", f"/repos/{SAMPLE}/patterns/detect"),
    ("POST", f"/repos/{SAMPLE}/architecture/analyze"),
    ("POST", f"/repos/{SAMPLE}/apis/scan"),
    ("GET", "/admin/stats"),
    ("GET", "/admin/users"),
    ("POST", f"/admin/users/{uuid.uuid4()}/toggle-admin"),
    ("GET", "/docs"),
    ("GET", "/openapi.json"),
    ("GET", f"/repos/{uuid.uuid4()}"),
    ("GET", f"/repos/{uuid.uuid4()}/adrs"),
    ("GET", "/anything/else"),
    ("PUT", "/repos"),
]


@pytest.mark.parametrize("method,path", BLOCKED)
def test_unlisted_routes_are_403_with_plain_message(client, method, path):
    r = client.request(method, path, json={})
    assert r.status_code == 403
    detail = r.json()["detail"]
    assert isinstance(detail, str) and "public demo" in detail


def test_cors_preflight_from_frontend_is_not_blocked(client):
    r = client.options(
        f"/repos/{SAMPLE}/ask",
        headers={"Origin": ORIGIN, "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "content-type"},
    )
    assert r.status_code == 200
    assert r.headers["access-control-allow-origin"] == ORIGIN


def test_blocked_response_still_carries_cors_headers(client):
    r = client.post("/repos", json={}, headers={"Origin": ORIGIN})
    assert r.status_code == 403
    assert r.headers["access-control-allow-origin"] == ORIGIN


# ── Pre-recorded Ask ─────────────────────────────────────────────────────────

def test_ask_streams_a_cited_prerecorded_answer(client):
    r = ask(client, "Where are requests authenticated?")
    assert r.status_code == 200
    assert r.headers["content-type"].startswith("text/event-stream")
    events = sse_events(r.text)
    [sources] = [e for e in events if e["type"] == "data-sources"]
    assert any(s["file_path"] == "backend/auth.py" for s in sources["data"])
    text = "".join(e["delta"] for e in events if e["type"] == "text-delta")
    assert "get_owned_repo" in text


def test_unmatched_question_gets_suggestions_not_an_invented_answer(client):
    events = sse_events(ask(client, "what is the airspeed of an unladen swallow").text)
    [sources] = [e for e in events if e["type"] == "data-sources"]
    assert sources["data"] == []
    text = "".join(e["delta"] for e in events if e["type"] == "text-delta")
    assert "pre-recorded" in text


def test_onboard_has_its_own_answers(client):
    events = sse_events(ask(client, "Where should I start reading?", path="onboard").text)
    text = "".join(e["delta"] for e in events if e["type"] == "text-delta")
    assert "main.py" in text


def test_overlong_question_is_400(client):
    r = ask(client, "x" * 501)
    assert r.status_code == 400
    assert isinstance(r.json()["detail"], str)


def test_empty_question_is_400(client):
    r = client.post(f"/repos/{SAMPLE}/ask", json={"messages": []})
    assert r.status_code == 400


def test_too_many_messages_is_400(client):
    msgs = [{"id": str(i), "role": "user", "parts": [{"type": "text", "text": "hi"}]} for i in range(101)]
    assert client.post(f"/repos/{SAMPLE}/ask", json={"messages": msgs}).status_code == 400


@pytest.mark.parametrize("flag", ["save", "persist", "store"])
def test_save_flags_are_refused(client, flag):
    r = ask(client, "Where are requests authenticated?", **{flag: True})
    assert r.status_code == 403


def test_unknown_message_mode_is_400(client):
    assert client.get(f"/repos/{SAMPLE}/messages?mode=admin").status_code == 400


def test_answer_size_is_capped(client):
    events = sse_events(ask(client, "How does indexing work?").text)
    [sources] = [e for e in events if e["type"] == "data-sources"]
    assert len(sources["data"]) <= 8
    text = "".join(e["delta"] for e in events if e["type"] == "text-delta")
    assert len(text) <= 4000


# ── Limits ───────────────────────────────────────────────────────────────────

def test_per_visitor_limit_returns_429():
    c = make_client(DEMO_ASK_PER_VISITOR_PER_HOUR=3, DEMO_ASK_GLOBAL_PER_HOUR=100)
    for _ in range(3):
        assert ask(c, "Where are requests authenticated?", xff="9.9.9.9").status_code == 200
    r = ask(c, "Where are requests authenticated?", xff="9.9.9.9")
    assert r.status_code == 429
    assert isinstance(r.json()["detail"], str)
    assert "retry-after" in r.headers
    # a different visitor is unaffected
    assert ask(c, "Where are requests authenticated?", xff="8.8.8.8").status_code == 200


def test_visitor_key_is_last_forwarded_for_entry_so_spoofed_first_entry_does_not_reset_limit():
    c = make_client(DEMO_ASK_PER_VISITOR_PER_HOUR=2, DEMO_ASK_GLOBAL_PER_HOUR=100)
    assert ask(c, "auth", xff="1.1.1.1, 7.7.7.7").status_code == 200
    assert ask(c, "auth", xff="2.2.2.2, 7.7.7.7").status_code == 200
    # attacker rotates the first (client-controlled) entry; the proxy-appended last entry is the same
    assert ask(c, "auth", xff="3.3.3.3, 7.7.7.7").status_code == 429


def test_global_hourly_cap_returns_429():
    c = make_client(DEMO_ASK_PER_VISITOR_PER_HOUR=100, DEMO_ASK_GLOBAL_PER_HOUR=2)
    assert ask(c, "auth", xff="1.1.1.1").status_code == 200
    assert ask(c, "auth", xff="2.2.2.2").status_code == 200
    r = ask(c, "auth", xff="3.3.3.3")
    assert r.status_code == 429


def test_rejected_requests_do_not_spend_the_visitor_budget():
    c = make_client(DEMO_ASK_PER_VISITOR_PER_HOUR=1, DEMO_ASK_GLOBAL_PER_HOUR=100)
    assert ask(c, "x" * 501, xff="4.4.4.4").status_code == 400
    assert ask(c, "auth", xff="4.4.4.4").status_code == 200


# ── Nothing is written ───────────────────────────────────────────────────────

def test_demo_never_touches_the_database(monkeypatch):
    def boom(*a, **k):
        raise AssertionError("demo mode must not open a database session")

    monkeypatch.setattr(database, "get_db", boom)
    monkeypatch.setattr(database, "SessionLocal", boom)
    c = make_client()
    for path in ALLOWED_GETS:
        assert c.get(path).status_code == 200
    assert ask(c, "auth").status_code == 200


def test_fixtures_are_unchanged_after_every_kind_of_request(client):
    from demo import fixtures

    before = copy.deepcopy(fixtures.snapshot())
    for path in ALLOWED_GETS:
        client.get(path)
    for method, path in BLOCKED:
        client.request(method, path, json={"title": "changed"})
    ask(client, "auth")
    assert fixtures.snapshot() == before


def test_demo_settings_need_no_secrets():
    s = Settings(_env_file=None, DEMO_MODE=True, DATABASE_URL="", SUPABASE_URL="", SUPABASE_SERVICE_ROLE_KEY="",
                 SUPABASE_JWT_SECRET="", GROQ_API_KEY="", GROQ_MODEL="")
    assert s.DEMO_MODE is True


def test_real_mode_still_requires_secrets():
    with pytest.raises(ValueError):
        Settings(_env_file=None, DEMO_MODE=False, DATABASE_URL="", SUPABASE_URL="", SUPABASE_SERVICE_ROLE_KEY="",
                 SUPABASE_JWT_SECRET="", GROQ_API_KEY="", GROQ_MODEL="")


def test_demo_defaults_on_when_running_on_render(monkeypatch):
    monkeypatch.setenv("RENDER", "true")
    monkeypatch.delenv("DEMO_MODE", raising=False)
    assert Settings(_env_file=None).DEMO_MODE is True


def test_demo_defaults_off_locally(monkeypatch):
    monkeypatch.delenv("RENDER", raising=False)
    monkeypatch.delenv("DEMO_MODE", raising=False)
    assert Settings(_env_file=None).DEMO_MODE is False


# ── Review fixes (Phase 4) ───────────────────────────────────────────────────

def test_oversized_body_is_rejected_before_parsing(client):
    body = '{"messages":[{"id":"1","role":"user","parts":[{"type":"text","text":"' + "x" * 70_000 + '"}]}]}'
    r = client.post(f"/repos/{SAMPLE}/ask", content=body, headers={"content-type": "application/json"})
    assert r.status_code == 413
    assert isinstance(r.json()["detail"], str)


def test_oversized_chunked_body_without_content_length_is_rejected(client):
    def chunks():
        yield b'{"messages":['
        for _ in range(2000):
            yield b'{"id":"1","role":"user","parts":[{"type":"text","text":"' + b"y" * 40 + b'"}]},'
        yield b'{"id":"2","role":"user","parts":[]}]}'
    r = client.post(f"/repos/{SAMPLE}/ask", content=chunks(), headers={"content-type": "application/json"})
    assert r.status_code == 413


def test_deeply_nested_json_is_a_plain_400_with_cors(client):
    body = '{"messages":' + "[" * 20_000 + "]" * 20_000 + "}"
    r = client.post(f"/repos/{SAMPLE}/ask", content=body, headers={"content-type": "application/json", "Origin": ORIGIN})
    assert r.status_code in (400, 413)
    assert r.headers["access-control-allow-origin"] == ORIGIN
    assert isinstance(r.json()["detail"], str)


def test_ipv6_visitors_share_a_bucket_per_64_prefix():
    c = make_client(DEMO_ASK_PER_VISITOR_PER_HOUR=2, DEMO_ASK_GLOBAL_PER_HOUR=100)
    assert ask(c, "auth", xff="2001:db8:1:2::1").status_code == 200
    assert ask(c, "auth", xff="2001:db8:1:2::abcd").status_code == 200
    assert ask(c, "auth", xff="2001:db8:1:2:ffff::9").status_code == 429
    assert ask(c, "auth", xff="2001:db8:1:3::1").status_code == 200  # a different /64


def test_head_health_is_allowed_for_uptime_monitors(client):
    assert client.head("/health").status_code == 200


def test_empty_demo_mode_env_value_falls_back_to_default(monkeypatch):
    monkeypatch.setenv("DEMO_MODE", "")
    monkeypatch.setenv("RENDER", "true")
    assert Settings(_env_file=None).DEMO_MODE is True


def test_frontend_url_trailing_slash_is_stripped_for_cors():
    c = make_client(FRONTEND_URL=ORIGIN + "/")
    r = c.get("/health", headers={"Origin": ORIGIN})
    assert r.headers["access-control-allow-origin"] == ORIGIN


def test_retry_after_is_readable_by_the_browser():
    c = make_client(DEMO_ASK_PER_VISITOR_PER_HOUR=1, DEMO_ASK_GLOBAL_PER_HOUR=100)
    ask(c, "auth", xff="5.5.5.5")
    body = {"messages": [{"id": "m1", "role": "user", "parts": [{"type": "text", "text": "auth"}]}]}
    r = c.post(f"/repos/{SAMPLE}/ask", json=body, headers={"x-forwarded-for": "5.5.5.5", "Origin": ORIGIN})
    assert r.status_code == 429
    assert "retry-after" in r.headers.get("access-control-expose-headers", "").lower()


def test_a_full_hour_of_questions_hits_the_rate_limit_not_the_message_limit():
    c = make_client(DEMO_ASK_PER_VISITOR_PER_HOUR=20, DEMO_ASK_GLOBAL_PER_HOUR=1000)
    msgs = []
    for i in range(21):
        msgs.append({"id": f"u{i}", "role": "user", "parts": [{"type": "text", "text": "auth"}]})
        r = c.post(f"/repos/{SAMPLE}/ask", json={"messages": msgs}, headers={"x-forwarded-for": "6.6.6.6"})
        msgs.append({"id": f"a{i}", "role": "assistant", "parts": [{"type": "text", "text": "answer"}]})
    assert r.status_code == 429


# ── Live finding: Render sits behind Cloudflare, so the visitor IP comes from CF-Connecting-IP ──

def test_cf_connecting_ip_is_the_visitor_key_when_present():
    c = make_client(DEMO_ASK_PER_VISITOR_PER_HOUR=2, DEMO_ASK_GLOBAL_PER_HOUR=100)
    body = {"messages": [{"id": "m1", "role": "user", "parts": [{"type": "text", "text": "auth"}]}]}
    # The visitor rotates X-Forwarded-For freely; Cloudflare's header stays their real IP.
    for i in range(3):
        h = {"x-forwarded-for": f"10.1.{i}.{i}", "cf-connecting-ip": "198.51.100.5"}
        r = c.post(f"/repos/{SAMPLE}/ask", json=body, headers=h)
        assert r.status_code == (200 if i < 2 else 429)


def test_falls_back_to_last_forwarded_for_without_cf_header():
    c = make_client(DEMO_ASK_PER_VISITOR_PER_HOUR=1, DEMO_ASK_GLOBAL_PER_HOUR=100)
    assert ask(c, "auth", xff="1.1.1.1, 7.7.7.8").status_code == 200
    assert ask(c, "auth", xff="2.2.2.2, 7.7.7.8").status_code == 429


def test_client_ip_header_can_be_disabled_for_hosts_without_cloudflare():
    c = make_client(DEMO_ASK_PER_VISITOR_PER_HOUR=1, DEMO_ASK_GLOBAL_PER_HOUR=100, DEMO_CLIENT_IP_HEADER="")
    body = {"messages": [{"id": "m1", "role": "user", "parts": [{"type": "text", "text": "auth"}]}]}
    # with the header disabled, a forged CF-Connecting-IP must not create a fresh bucket
    assert c.post(f"/repos/{SAMPLE}/ask", json=body, headers={"x-forwarded-for": "7.7.7.9", "cf-connecting-ip": "1.1.1.1"}).status_code == 200
    assert c.post(f"/repos/{SAMPLE}/ask", json=body, headers={"x-forwarded-for": "7.7.7.9", "cf-connecting-ip": "2.2.2.2"}).status_code == 429
