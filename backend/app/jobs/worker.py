import asyncio
from datetime import datetime, timezone

from app.db import SessionLocal
from app.ingest import ingest_launches, ingest_celestrak_group

SAT_GROUPS = ["stations", "weather", "gps-ops"]  # add "active" later if needed

LAUNCH_INTERVAL_MIN = 20     # safer than 15 if LL2 rate-limits
SAT_INTERVAL_HOURS = 6

def log(msg: str) -> None:
    print(f"[{datetime.now(timezone.utc).isoformat()}] {msg}", flush=True)

async def run_launches():
    async with SessionLocal() as db:
        n = await ingest_launches(db, max_pages=2, page_size=50, page_delay_sec=0.8)
    log(f"launches upserted: {n}")

async def run_sat_groups():
    for g in SAT_GROUPS:
        async with SessionLocal() as db:
            res = await ingest_celestrak_group(db, g)
        log(f"celestrak {g}: {res}")

async def main():
    launch_interval = LAUNCH_INTERVAL_MIN * 60
    sat_interval = SAT_INTERVAL_HOURS * 60 * 60

    next_launch = 0.0
    next_sat = 0.0

    while True:
        now = asyncio.get_event_loop().time()

        if now >= next_launch:
            try:
                await run_launches()
            except Exception as e:
                log(f"launch ingest failed: {e}")
            next_launch = now + launch_interval

        if now >= next_sat:
            try:
                await run_sat_groups()
            except Exception as e:
                log(f"sat ingest failed: {e}")
            next_sat = now + sat_interval

        await asyncio.sleep(5)

if __name__ == "__main__":
    asyncio.run(main())
