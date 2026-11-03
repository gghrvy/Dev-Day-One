import uuid
from datetime import datetime, timezone

from fastapi.testclient import TestClient

from auth import get_current_user
from database import get_db
from main import app
from models import IndexingJob, Repository, User

ORG = uuid.uuid4()
REPO = uuid.uuid4()
STARTED = datetime(2026, 6, 13, 9, 30, tzinfo=timezone.utc)


class _Result:
    def __init__(self, rows):
        self._rows = rows

    def scalars(self):
        return self

    def all(self):
        return self._rows


class _FakeDB:
    def __init__(self):
        self.statements = []

    async def get(self, model, _id):
        if model is Repository:
            return Repository(id=REPO, org_id=ORG, name="r", full_name="o/r")
        return None

    async def execute(self, stmt):
        self.statements.append(str(stmt))
        job = IndexingJob(id=uuid.uuid4(), repo_id=REPO, status="done", progress=100, started_at=STARTED)
        return _Result([job])


def test_list_jobs_returns_start_time_as_created_at():
    db = _FakeDB()

    async def _db():
        yield db

    app.dependency_overrides[get_db] = _db
    app.dependency_overrides[get_current_user] = lambda: User(id=uuid.uuid4(), org_id=ORG)
    try:
        r = TestClient(app, raise_server_exceptions=False).get(f"/repos/{REPO}/jobs")
    finally:
        app.dependency_overrides.clear()

    assert r.status_code == 200
    [job] = r.json()
    assert datetime.fromisoformat(job["created_at"]) == STARTED
    assert "ORDER BY indexing_jobs.started_at DESC" in db.statements[0]
