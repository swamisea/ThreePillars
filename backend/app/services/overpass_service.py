import httpx
import asyncio
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from app.models.schemas import ZonePolygon


class OverpassService:
    """Service for interacting with Overpass API to fetch POI data within zone boundaries."""

    def __init__(self):
        self.base_url = "https://overpass-api.de/api/interpreter"
        self.headers = {"User-Agent": "LA-Interactive-Map/1.0"}

        # In-memory cache
        self._cache: Dict[str, Dict] = {}
        self._cache_ttl = timedelta(hours=1)

        # POI category mappings
        self.poi_categories = {
            "restaurants": {
                "tags": ["amenity=restaurant"],
                "color": "#FF6B6B",
                "icon": "restaurant"
            },
            "bars": {
                "tags": ["amenity=bar", "amenity=pub"],
                "color": "#4ECDC4",
                "icon": "bar"
            },
            "attractions": {
                "tags": [
                    "tourism=attraction",
                    "tourism=museum",
                    "tourism=gallery",
                    "historic=monument"
                ],
                "color": "#45B7D1",
                "icon": "attraction"
            },
            "utilities": {
                "tags": ["amenity=toilets", "amenity=drinking_water"],
                "color": "#96CEB4",
                "icon": "utility"
            }
        }

    async def get_pois_in_zone(
        self,
        zone: ZonePolygon,
        categories: Optional[List[str]] = None,
        user_lat: Optional[float] = None,
        user_lon: Optional[float] = None
    ) -> Dict[str, List[Dict]]:
        print(f"🔍 Querying zone: {zone.name}")
        print(f"📍 Zone coordinates: {zone.coordinates}")

        # Default to all categories
        if categories is None:
            categories = list(self.poi_categories.keys())

        valid_categories = [c for c in categories if c in self.poi_categories]
        if not valid_categories:
            print("❌ No valid categories found")
            return {}

        cache_key = f"{zone.name}_{','.join(sorted(valid_categories))}"
        cached = self._get_from_cache(cache_key)
        if cached:
            print(f"💾 Using cached result for {cache_key}")
            return cached

        try:
            query = self._build_overpass_query(zone, valid_categories)
            print(f"🔧 Built Overpass query:\n{query}")

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.base_url,
                    data={"data": query},
                    headers=self.headers,
                    timeout=45.0
                )
                print(f"📡 Response status: {response.status_code}")
                response.raise_for_status()

                data = response.json()
                if not isinstance(data, dict) or "elements" not in data:
                    print("⚠️ Unexpected response format:")
                    print(response.text[:2000])
                    return {}

                print(f"🎯 Found {len(data['elements'])} elements")

                pois = self._process_overpass_results(data, valid_categories)

                # Compute distance if available
                if user_lat is not None and user_lon is not None:
                    pois = self._add_distance_info(pois, user_lat, user_lon)

                # Only cache non-empty results
                if any(pois.values()):
                    self._cache_result(cache_key, pois)
                else:
                    print("⚠️ Empty result — skipping cache")

                total = sum(len(v) for v in pois.values())
                print(f"✅ Processed {total} POIs total")
                return pois

        except httpx.RequestError as e:
            print(f"❌ Overpass request error: {e}")
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            import traceback; traceback.print_exc()

        return {}

    # ---------------- Core helpers ----------------

    def _build_overpass_query(self, zone: ZonePolygon, categories: List[str]) -> str:
        polygon_coords = []
        for ring in zone.coordinates:
            for lon, lat in ring:
                polygon_coords.append(f"{lat} {lon}")

        # Ensure closed polygon
        if polygon_coords and polygon_coords[0] != polygon_coords[-1]:
            polygon_coords.append(polygon_coords[0])

        polygon_str = " ".join(polygon_coords)
        query_parts = []

        for category in categories:
            for tag in self.poi_categories[category]["tags"]:
                if "=" in tag:
                    key, value = tag.split("=", 1)
                    for elem in ("node", "way", "relation"):
                        query_parts.append(f'{elem}["{key}"="{value}"](poly:"{polygon_str}");')
                else:
                    for elem in ("node", "way", "relation"):
                        query_parts.append(f'{elem}["{tag}"](poly:"{polygon_str}");')

        return f"""[out:json][timeout:25];
(
{chr(10).join(query_parts)}
);
out center meta;"""

    def _process_overpass_results(self, data: Dict, categories: List[str]) -> Dict[str, List[Dict]]:
        pois_by_cat = {c: [] for c in categories}
        elements = data.get("elements", [])
        print(f"📊 Processing {len(elements)} elements")

        for el in elements:
            poi = self._extract_poi_data(el)
            if not poi:
                continue

            category = self._categorize_poi(el.get("tags", {}))
            if category and category in pois_by_cat:
                pois_by_cat[category].append(poi)

        for c in pois_by_cat:
            pois_by_cat[c].sort(key=lambda x: x.get("distance", float('inf')))
            print(f"📋 Category {c}: {len(pois_by_cat[c])} POIs")

        return pois_by_cat

    def _extract_poi_data(self, element: Dict) -> Optional[Dict]:
        tags = element.get("tags", {})
        name = tags.get("name") or tags.get("brand") or tags.get("operator")
        if not name:
            # fallback for unnamed features
            name = f"Unnamed ({tags.get('amenity') or tags.get('tourism') or tags.get('shop') or 'POI'})"

        # Coordinates
        lat, lon = None, None
        typ = element.get("type")
        if typ == "node":
            lat, lon = element.get("lat"), element.get("lon")
        elif typ in ("way", "relation") and "center" in element:
            lat = element["center"].get("lat")
            lon = element["center"].get("lon")

        if lat is None or lon is None:
            return None

        desc_parts = []
        for key in ("amenity", "tourism", "historic"):
            if key in tags:
                desc_parts.append(f"{key.title()}: {tags[key]}")

        address_parts = [
            tags.get("addr:street"),
            tags.get("addr:city"),
            tags.get("addr:state"),
        ]
        address = ", ".join([a for a in address_parts if a])

        return {
            "name": name,
            "lat": float(lat),
            "lon": float(lon),
            "amenity_type": tags.get("amenity") or tags.get("tourism") or tags.get("historic"),
            "description": " | ".join(desc_parts) or "POI",
            "address": address,
            "tags": tags
        }

    def _categorize_poi(self, tags: Dict[str, str]) -> Optional[str]:
        for cat, info in self.poi_categories.items():
            for tag in info["tags"]:
                if "=" in tag:
                    key, value = tag.split("=", 1)
                    val = tags.get(key)
                    if not val:
                        continue
                    if value in val.split(";"):
                        return cat
                elif tag in tags:
                    return cat
        return None

    def _add_distance_info(self, pois: Dict[str, List[Dict]], user_lat: float, user_lon: float):
        from app.utils.geo_utils import calculate_distance
        for cat in pois:
            for poi in pois[cat]:
                poi["distance"] = round(calculate_distance(user_lat, user_lon, poi["lat"], poi["lon"]), 2)
        return pois

    # ---------------- Caching ----------------

    def _get_from_cache(self, key: str) -> Optional[Dict]:
        entry = self._cache.get(key)
        if entry and datetime.now() < entry["expires_at"]:
            return entry["data"]
        if entry:
            del self._cache[key]
        return None

    def _cache_result(self, key: str, data: Dict):
        self._cache[key] = {
            "data": data,
            "expires_at": datetime.now() + self._cache_ttl
        }

    # ---------------- Testing ----------------

    async def test_simple_query(self) -> Dict:
        print("🧪 Testing simple Overpass query...")
        query = """[out:json][timeout:25];
(
  node["amenity"="restaurant"](34.0,-118.5,34.2,-118.2);
);
out center meta;"""

        async with httpx.AsyncClient() as client:
            resp = await client.post(self.base_url, data={"data": query}, headers=self.headers)
            print(f"📡 Status: {resp.status_code}")
            resp.raise_for_status()
            data = resp.json()
            print(f"🎯 Found {len(data.get('elements', []))} elements")
            return data
