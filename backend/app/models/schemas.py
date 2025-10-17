"""
Pydantic models for API request/response schemas.
"""

from pydantic import BaseModel, Field
from typing import List, Tuple, Optional, Dict
from datetime import datetime
from typing import List

class SearchResult(BaseModel):
    """Single search result."""
    name: str
    lat: float
    lon: float
    description: str
    distance_km: float
    distance_miles: float
    source: str  # 'overpass' or 'nominatim'

class SearchResponse(BaseModel):
    """Response containing multiple search results."""
    results: List[SearchResult]
    total_count: int
    query: str
    user_location: dict  # {lat, lon}

class SearchRequest(BaseModel):
    """Request model for place search."""
    query: str
    lat: float
    lon: float

# New multi-result search models
class SearchResultOld(BaseModel):
    """Single search result."""
    name: str
    lat: float
    lon: float
    description: str
    distance_km: float
    distance_miles: float
    source: str


class SearchResponseOld(BaseModel):
    """Response model for multi-result place search."""
    results: List[SearchResult]
    total_count: int
    query: str
    user_location: dict  # {"lat": float, "lon": float}

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


class TopLocation(BaseModel):
    """Top location in a zone with check-in count."""
    poi_name: str = Field(..., description="Name of the POI")
    poi_id: str = Field(..., description="Unique identifier for the POI")
    lat: float = Field(..., description="Latitude")
    lon: float = Field(..., description="Longitude")
    amenity_type: str = Field(..., description="Type of venue (restaurant, bar, etc)")
    checkin_count: int = Field(..., description="Number of check-ins at this location")


class CheckInBase(BaseModel):
    """Base fields for check-in."""
    user_name: str = Field(..., description="Name of user checking in")
    poi_name: str = Field(..., description="Name of the POI")
    poi_lat: float = Field(..., description="POI latitude")
    poi_lon: float = Field(..., description="POI longitude")
    zone_name: str = Field(..., description="Zone name (e.g., Hollywood)")
    amenity_type: str = Field(..., description="Type of venue")
    caption: Optional[str] = Field(None, description="Check-in caption")


class CheckInCreate(CheckInBase):
    """Fields needed to create a new check-in."""
    pass


class CheckIn(CheckInBase):
    """Complete check-in object returned by API."""
    id: str = Field(..., description="Unique check-in ID")
    poi_id: str = Field(..., description="Unique identifier for the POI")
    photo_url: str = Field(..., description="URL to photo")
    timestamp: datetime = Field(..., description="When check-in occurred")
    
    class Config:
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        }
class TransitRoute(BaseModel):
    mode: str
    duration: int
    distance: float
    instructions: str
    
class CarbonSavings(BaseModel):
    transit: float
    train: float
    carpool: float
    
class TransitResponse(BaseModel):
    routes: List[TransitRoute]
    total_distance: float
    total_duration: int
    carbon_savings: CarbonSavings
