"""
Pydantic models for API request/response schemas.
"""

from pydantic import BaseModel
from typing import List, Tuple, Optional, Dict

class SearchRequest(BaseModel):
    """Request model for place search."""
    query: str
    lat: float
    lon: float

class SearchResponse(BaseModel):
    """Response model for place search results."""
    name: str
    lat: float
    lon: float
    description: str

class ZonePolygon(BaseModel):
    """Model for zone polygon data."""
    name: str
    color: str
    coordinates: List[List[Tuple[float, float]]]  # List of polygon rings

class ZonesResponse(BaseModel):
    """Response model for zones data."""
    zones: List[ZonePolygon]

class POI(BaseModel):
    """Model for Point of Interest data."""
    name: str
    lat: float
    lon: float
    amenity_type: str
    description: str
    address: str
    distance: Optional[float] = None
    tags: Optional[Dict[str, str]] = None

class POIRequest(BaseModel):
    """Request model for POI search."""
    zone: str
    categories: Optional[List[str]] = None
    lat: Optional[float] = None
    lon: Optional[float] = None

class POIResponse(BaseModel):
    """Response model for POI data."""
    zone: str
    pois: Dict[str, List[POI]]
    total_count: int
