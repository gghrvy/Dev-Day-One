import asyncio
from database import engine
from sqlalchemy import text

async def reset():
    async with engine.begin() as conn:
        await conn.execute(text("UPDATE indexing_jobs SET status='failed', error='interrupted' WHERE status='running'"))
    print("Reset done")

asyncio.run(reset())
