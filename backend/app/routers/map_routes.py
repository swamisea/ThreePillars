"""
Map-related API routes for zone data and place search.
"""

from fastapi import APIRouter, HTTPException
from app.models.schemas import SearchRequest, SearchResponse, ZonesResponse
from app.services.zone_service import get_la_zones
from app.services.nominatim_service import NominatimService

# Create router instance
router = APIRouter()

# Initialize services
nominatim_service = NominatimService()

@router.get("/zones", response_model=ZonesResponse)
async def get_zones():
    """
    Get all LA zones with their polygon coordinates and colors.
    
    Returns:
        ZonesResponse: List of zones with polygon data
    """
    try:
        zones = get_la_zones()
        return ZonesResponse(zones=zones)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching zones: {str(e)}")

@router.post("/search", response_model=SearchResponse)
async def search_places(request: SearchRequest):
    """
    Search for places using Nominatim API and return the closest match.
    
    Args:
        request: SearchRequest with query and user coordinates
    
    Returns:
        SearchResponse: Closest matching place information
    """
    try:
        # Validate coordinates
        if not (-90 <= request.lat <= 90):
            raise HTTPException(status_code=400, detail="Invalid latitude")
        if not (-180 <= request.lon <= 180):
            raise HTTPException(status_code=400, detail="Invalid longitude")
        
        # Search for places
        result = await nominatim_service.search_places(
            query=request.query,
            user_lat=request.lat,
            user_lon=request.lon
        )
        
        if not result:
            raise HTTPException(
                status_code=404, 
                detail=f"No places found for query: {request.query}"
            )
        
        return SearchResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching places: {str(e)}")
