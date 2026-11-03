from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from config import settings


class Base(DeclarativeBase):
    pass


# Demo mode has no database at all; the engine only exists in real mode.
engine = None if settings.DEMO_MODE else create_async_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False) if engine else None


async def get_db():
    if SessionLocal is None:
        raise RuntimeError("No database in demo mode")
    async with SessionLocal() as session:
        yield session
