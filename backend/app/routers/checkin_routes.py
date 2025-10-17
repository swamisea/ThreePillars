"""
API routes for check-ins and top locations.
"""
from fastapi import APIRouter, HTTPException
from fastapi.encoders import jsonable_encoder
from typing import List, Optional
from ..models.schemas import CheckIn, CheckInCreate, TopLocation
from ..services.checkin_store import (
    get_zone_checkins,
    get_top_locations,
    add_checkin
)

router = APIRouter()


@router.get("/checkins/{zone}", response_model=List[CheckIn])
def get_checkins(zone: str, limit: Optional[int] = 20):
    """Get recent check-ins for a zone."""
    try:
        checkins = get_zone_checkins(zone, limit)
        return jsonable_encoder(checkins)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/locations/{zone}/top", response_model=List[TopLocation])
def get_zone_top_locations(zone: str, limit: Optional[int] = 10):
    """Get top locations for a zone."""
    try:
        locations = get_top_locations(zone, limit)
        return jsonable_encoder(locations)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/checkins", response_model=CheckIn)
def create_checkin(checkin: CheckInCreate):
    """Create a new check-in."""
    try:
        # Convert to dict to match store expectations
        poi_data = {
            "poi_name": checkin.poi_name,
            "lat": checkin.poi_lat,
            "lon": checkin.poi_lon,
            "zone_name": checkin.zone_name,
            "amenity_type": checkin.amenity_type
        }
        result = add_checkin(checkin.user_name, poi_data, checkin.caption)
        return jsonable_encoder(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))