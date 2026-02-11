import httpx
from datetime import datetime
from typing import List, Dict

HORIZONS_LOOKUP = "https://ssd.jpl.nasa.gov/api/horizons_lookup.api"
HORIZONS_API = "https://ssd.jpl.nasa.gov/api/horizons.api"


async def resolve_object(query: str) -> Dict:
    async with httpx.AsyncClient(timeout=20) as client:
        r = await client.get(HORIZONS_LOOKUP, params={"sstr": query})
        r.raise_for_status()
        return r.json()


async def fetch_vectors(
    command: str,
    start: str,
    stop: str,
    step: int,
) -> str:
    params = {
        "format": "json",
        "COMMAND": command,
        "MAKE_EPHEM": "YES",
        "EPHEM_TYPE": "VECTORS",
        "CENTER": "500@399",  # Earth-centered
        "START_TIME": start,
        "STOP_TIME": stop,
        "STEP_SIZE": f"{step}m",
        "OUT_UNITS": "KM-S",
        "REF_FRAME": "J2000",
    }

    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.get(HORIZONS_API, params=params)
        r.raise_for_status()
        return r.text


def parse_vectors(raw_text: str) -> List[Dict]:
    """
    Extract XYZ from Horizons SOE block.
    """
    lines = raw_text.splitlines()
    in_block = False
    results = []

    for line in lines:
        if "$$SOE" in line:
            in_block = True
            continue
        if "$$EOE" in line:
            break
        if not in_block:
            continue

        parts = line.split(",")
        if len(parts) < 4:
            continue

        t = datetime.fromisoformat(parts[0].strip())
        x = float(parts[2])
        y = float(parts[3])
        z = float(parts[4])

        results.append(
            {
                "t": t,
                "x_km": x,
                "y_km": y,
                "z_km": z,
            }
        )

    return results
