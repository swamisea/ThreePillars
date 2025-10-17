import asyncio
import json
from app.services.nominatim_service import NominatimService

async def run():
    svc = NominatimService()
    print('CALLING _search_overpass for name match (should be empty)')
    try:
        ov = await svc._search_overpass(amenity='colosseum', lat=34.05, lon=-118.25, radius_km=32.0, limit=10)
        print('OVERPASS:', json.dumps(ov, indent=2))
    except Exception as e:
        print('OVERPASS EX:', e)

    print('CALLING _search_nominatim')
    try:
        nom = await svc._search_nominatim('colosseum', 34.05, -118.25, limit=10, radius_km=32.0)
        print('NOMINATIM:', json.dumps(nom, indent=2))
    except Exception as e:
        print('NOM EX:', e)

if __name__ == '__main__':
    asyncio.run(run())
