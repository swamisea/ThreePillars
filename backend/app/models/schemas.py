"""
Pydantic models for API request/response schemas.
"""

from pydantic import BaseModel
from typing import List, Tuple

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
