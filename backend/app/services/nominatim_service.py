"""
Updated search service that returns multiple results for user selection.
"""

import httpx
from typing import Dict, List, Optional
from app.utils.geo_utils import calculate_distance
import math
import logging

class NominatimService:
    """Service for interacting with Nominatim API for place search."""
    
    def __init__(self):
        self.base_url = "https://nominatim.openstreetmap.org/search"
        self.headers = {
            "User-Agent": "LA-Interactive-Map/1.0"
        }
        self.overpass_url = "https://overpass-api.de/api/interpreter"
        self.logger = logging.getLogger("nominatim_service")
    
    async def search_places(
        self, 
        query: str, 
        user_lat: float, 
        user_lon: float,
        limit: int = 10,
        radius_km: float = 32.0  # 20 miles ≈ 32 km
    ) -> List[Dict]:
        """
        Search for places and return multiple results for user selection.
        
        Args:
            query: Search query
            user_lat: User's latitude
            user_lon: User's longitude
            limit: Maximum number of results (default 10)
            radius_km: Search radius in km (default 32km / 20 miles)
        
        Returns:
            List of place dictionaries sorted by distance
        """
        # Map common POI queries to Overpass tags
        poi_map = {
            "coffee": "cafe",
            "cafe": "cafe",
            "restaurant": "restaurant",
            "restroom": "toilets",
            "bathroom": "toilets",
            "gas": "fuel",
            "parking": "parking",
            "atm": "atm",
            "pharmacy": "pharmacy",
            "bar": "bar",
            "gym": "fitness_centre",
            "hospital": "hospital",
        }

        # Check if query matches a POI category
        poi_tag = None
        query_lower = query.lower()
        for keyword, tag in poi_map.items():
            if keyword in query_lower:
                poi_tag = tag
                break

        results = []

        # Try Overpass for POI queries
        if poi_tag:
            try:
                overpass_results = await self._search_overpass(
                    amenity=poi_tag,
                    lat=user_lat,
                    lon=user_lon,
                    radius_km=radius_km,
                    limit=limit
                )
                results.extend(overpass_results)
            except Exception as e:
                self.logger.exception("Overpass search failed: %s", e)

        # Always try Nominatim as well (for addresses and general queries)
        try:
            nominatim_results = await self._search_nominatim(
                query=query,
                lat=user_lat,
                lon=user_lon,
                limit=limit,
                radius_km=radius_km
            )
            results.extend(nominatim_results)
        except Exception as e:
            self.logger.exception("Nominatim search failed: %s", e)

        if not results:
            return []

        # Remove duplicates (places within 100m of each other)
        unique_results = self._deduplicate_results(results)

        # Sort by distance and limit
        unique_results.sort(key=lambda x: x["distance_km"])
        return unique_results[:limit]

    def _deduplicate_results(self, results: List[Dict]) -> List[Dict]:
        """Remove duplicate results that are very close to each other."""
        if not results:
            return []
        
        unique = []
        for result in results:
            is_duplicate = False
            for existing in unique:
                distance = calculate_distance(
                    result["lat"], result["lon"],
                    existing["lat"], existing["lon"]
                )
                # Consider places within 100m as duplicates
                if distance < 0.1:
                    is_duplicate = True
                    break
            
            if not is_duplicate:
                unique.append(result)
        
        return unique

    async def _search_overpass(
        self,
        amenity: str,
        lat: float,
        lon: float,
        radius_km: float,
        limit: int
    ) -> List[Dict]:
        """Search Overpass for POIs."""
        radius_m = int(radius_km * 1000)
        overpass_query = f"""
[out:json][timeout:25];
(
  node["amenity"="{amenity}"](around:{radius_m},{lat},{lon});
  way["amenity"="{amenity}"](around:{radius_m},{lat},{lon});
);
out body center;
"""

        async with httpx.AsyncClient() as client:
            resp = await client.post(
                self.overpass_url,
                data=overpass_query,
                headers=self.headers,
                timeout=30.0
            )
            resp.raise_for_status()
            data = resp.json()

        elements = data.get("elements", [])
        results = []
        
        for el in elements:
            try:
                # Get coordinates
                if el.get("type") == "node":
                    lat_r = float(el.get("lat"))
                    lon_r = float(el.get("lon"))
                else:
                    center = el.get("center")
                    if not center:
                        continue
                    lat_r = float(center.get("lat"))
                    lon_r = float(center.get("lon"))

                tags = el.get("tags", {})
                name = tags.get("name") or tags.get("operator") or f"{amenity.replace('_', ' ').title()}"
                
                # Build description
                desc_parts = []
                if tags.get("addr:street"):
                    desc_parts.append(tags.get("addr:street"))
                if tags.get("addr:city"):
                    desc_parts.append(tags.get("addr:city"))
                
                dist_km = calculate_distance(lat, lon, lat_r, lon_r)

                results.append({
                    "name": name,
                    "lat": lat_r,
                    "lon": lon_r,
                    "description": ", ".join(desc_parts) if desc_parts else f"{amenity.replace('_', ' ').title()}",
                    "distance_km": round(dist_km, 2),
                    "distance_miles": round(dist_km * 0.621371, 2),
                    "source": "overpass"
                })
            except Exception:
                self.logger.exception("Error parsing Overpass element")
                continue

        return results

    async def _search_nominatim(
        self,
        query: str,
        lat: float,
        lon: float,
        limit: int,
        radius_km: float
    ) -> List[Dict]:
        """Search Nominatim for places."""
        # Calculate bounding box
        lat_delta = radius_km / 111.0
        lon_delta = radius_km / (111.320 * math.cos(math.radians(lat))) if math.cos(math.radians(lat)) != 0 else radius_km / 111.32

        viewbox = f"{lon - lon_delta},{lat - lat_delta},{lon + lon_delta},{lat + lat_delta}"

        params = {
            "q": query,
            "format": "json",
            "limit": limit * 2,  # Get more results to filter
            "addressdetails": 1,
            "extratags": 1,
            "viewbox": viewbox,
            "bounded": 1
        }

        async with httpx.AsyncClient() as client:
            resp = await client.get(
                self.base_url,
                params=params,
                headers=self.headers,
                timeout=10.0
            )
            resp.raise_for_status()
            nominatim_results = resp.json()

        results = []
        for r in nominatim_results:
            try:
                lat_r = float(r.get("lat"))
                lon_r = float(r.get("lon"))
                dist_km = calculate_distance(lat, lon, lat_r, lon_r)
                
                # Skip results outside radius
                if dist_km > radius_km:
                    continue
                
                # Format address
                address = r.get("address", {})
                desc_parts = []
                for key in ["road", "suburb", "city", "state"]:
                    if address.get(key):
                        desc_parts.append(address[key])
                
                results.append({
                    "name": r.get("display_name", "Unknown Place"),
                    "lat": lat_r,
                    "lon": lon_r,
                    "description": ", ".join(desc_parts) if desc_parts else r.get("display_name", ""),
                    "distance_km": round(dist_km, 2),
                    "distance_miles": round(dist_km * 0.621371, 2),
                    "source": "nominatim"
                })
            except Exception:
                self.logger.exception("Error parsing Nominatim result")
                continue

        return results