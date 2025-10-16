"""
Nominatim service for place search using OpenStreetMap's free geocoding API.
"""

import httpx
from typing import Dict, List, Optional
from app.utils.geo_utils import find_closest_point

class NominatimService:
    """Service for interacting with Nominatim API for place search."""
    
    def __init__(self):
        self.base_url = "https://nominatim.openstreetmap.org/search"
        self.headers = {
            "User-Agent": "LA-Interactive-Map/1.0"  # Required by Nominatim
        }
    
    async def search_places(
        self, 
        query: str, 
        user_lat: float, 
        user_lon: float,
        limit: int = 5
    ) -> Optional[Dict]:
        """
        Search for places using Nominatim API and return the closest match.
        
        Args:
            query: Search query (e.g., "nearest restroom", "Italian restaurant")
            user_lat: User's latitude
            user_lon: User's longitude
            limit: Maximum number of results to fetch
        
        Returns:
            Dictionary with place information or None if no results
        """
        try:
            # TODO: Add caching mechanism to reduce API calls
            # Consider implementing Redis or in-memory cache for frequent searches
            
            # TODO: Add category filtering (restaurants, restrooms, etc.)
            # Could use Nominatim's category parameter for better results
            
            async with httpx.AsyncClient() as client:
                params = {
                    "q": query,
                    "format": "json",
                    "limit": limit,
                    "addressdetails": 1,
                    "extratags": 1
                }
                
                response = await client.get(
                    self.base_url,
                    params=params,
                    headers=self.headers,
                    timeout=10.0
                )
                response.raise_for_status()
                
                results = response.json()
                
                if not results:
                    return None
                
                # Find the closest result to user's location
                closest_place = find_closest_point(user_lat, user_lon, results)
                
                if not closest_place:
                    return None
                
                # Format the response
                return {
                    "name": closest_place.get("display_name", "Unknown Place"),
                    "lat": float(closest_place["lat"]),
                    "lon": float(closest_place["lon"]),
                    "description": self._format_description(closest_place)
                }
                
        except httpx.RequestError as e:
            print(f"Request error: {e}")
            return None
        except Exception as e:
            print(f"Unexpected error: {e}")
            return None
    
    def _format_description(self, place: Dict) -> str:
        """
        Format a description from place data.
        
        Args:
            place: Place data from Nominatim
        
        Returns:
            Formatted description string
        """
        # Extract relevant information for description
        address = place.get("address", {})
        place_type = place.get("type", "")
        category = place.get("category", "")
        
        # Build description from available data
        parts = []
        
        if category:
            parts.append(f"Category: {category}")
        
        if place_type:
            parts.append(f"Type: {place_type}")
        
        # Add address components if available
        if address.get("city"):
            parts.append(f"City: {address['city']}")
        
        if address.get("state"):
            parts.append(f"State: {address['state']}")
        
        return " | ".join(parts) if parts else "Location found"
