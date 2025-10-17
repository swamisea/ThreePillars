import asyncio
import json
from app.services.nominatim_service import NominatimService

async def run_test():
    svc = NominatimService()
    try:
        results = await svc.search_places("colosseum", 34.05, -118.25, limit=10, radius_km=32.0)
        print("RESULTS:")
        print(json.dumps(results, indent=2))
    except Exception as e:
        print("EXCEPTION:", repr(e))

if __name__ == '__main__':
    asyncio.run(run_test())
