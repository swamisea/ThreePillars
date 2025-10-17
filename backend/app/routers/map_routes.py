"""
Map-related API routes for zone data, place search, and POI data.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.models.schemas import SearchRequest, SearchResponse, ZonesResponse, POIRequest, POIResponse, SearchResult
from app.services.zone_service import get_la_zones
from app.services.nominatim_service import NominatimService
from app.services.overpass_service import OverpassService
from app.utils.zone_utils import find_zone_for_point, validate_coordinates
from app.services.transit_service import TransitService
from app.models.schemas import TransitResponse

# Create router instance
router = APIRouter()

# Initialize services
nominatim_service = NominatimService()
overpass_service = OverpassService()
transit_service = TransitService()

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
    Search for places and return multiple results for user selection.
    
    Args:
        request: SearchRequest with query and user coordinates
    
    Returns:
        SearchResponse: List of matching places sorted by distance
    """
    try:
        # Validate coordinates
        if not validate_coordinates(request.lat, request.lon):
            raise HTTPException(status_code=400, detail="Invalid coordinates")
        
        # Search for places (returns list now)
        results = await nominatim_service.search_places(
            query=request.query,
            user_lat=request.lat,
            user_lon=request.lon,
            limit=10,
            radius_km=32.0  # 20 miles
        )
        
        if not results:
            raise HTTPException(
                status_code=404, 
                detail=f"No places found for '{request.query}' within 20 miles"
            )
        
        return SearchResponse(
            results=[SearchResult(**r) for r in results],
            total_count=len(results),
            query=request.query,
            user_location={"lat": request.lat, "lon": request.lon}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error searching places: {str(e)}"
        )

@router.get("/pois", response_model=POIResponse)
async def get_pois(
    zone: str = Query(..., description="Zone name to search for POIs"),
    categories: Optional[str] = Query(None, description="Comma-separated list of POI categories"),
    lat: Optional[float] = Query(None, description="User latitude for distance calculation"),
    lon: Optional[float] = Query(None, description="User longitude for distance calculation")
):
    """
    Get Points of Interest (POIs) within a specific zone.
    
    Args:
        zone: Name of the zone to search
        categories: Comma-separated list of categories (restaurants, bars, attractions, utilities)
        lat: User's latitude for distance calculation
        lon: User's longitude for distance calculation
    
    Returns:
        POIResponse: POIs grouped by category
    """
    print(f"🌐 POI API endpoint called")
    print(f"  - Zone: {zone}")
    print(f"  - Categories: {categories}")
    print(f"  - Lat: {lat}, Lon: {lon}")
    
    try:
        # Validate coordinates if provided
        if lat is not None and lon is not None:
            if not validate_coordinates(lat, lon):
                raise HTTPException(status_code=400, detail="Invalid coordinates")
        
        # Parse categories
        category_list = None
        if categories:
            category_list = [cat.strip().lower() for cat in categories.split(",")]
            # Validate categories
            valid_categories = overpass_service.get_all_categories()
            invalid_categories = [cat for cat in category_list if cat not in valid_categories]
            if invalid_categories:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid categories: {invalid_categories}. Valid categories: {valid_categories}"
                )
        
        # Find the zone
        zones = get_la_zones()
        target_zone = None
        for z in zones:
            if z.name.lower() == zone.lower():
                target_zone = z
                break
        
        if not target_zone:
            available_zones = [z.name for z in zones]
            raise HTTPException(
                status_code=404, 
                detail=f"Zone '{zone}' not found. Available zones: {available_zones}"
            )
        
        # Get POIs from Overpass API
        print(f"🔄 Calling overpass_service.get_pois_in_zone...")
        print(f"  - Zone: {target_zone.name}")
        print(f"  - Categories: {category_list}")
        print(f"  - User location: {lat}, {lon}")
        
        pois_by_category = await overpass_service.get_pois_in_zone(
            target_zone,
            category_list,
            lat,
            lon
        )
        
        # Calculate total count
        total_count = sum(len(pois) for pois in pois_by_category.values())
        
        return POIResponse(
            zone=target_zone.name,
            pois=pois_by_category,
            total_count=total_count
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching POIs: {str(e)}")

@router.get("/pois/test")
async def test_overpass_api():
    """
    Test endpoint to verify Overpass API is working with a simple query.
    
    Returns:
        Test results from Overpass API
    """
    try:
        result = await overpass_service.test_simple_query()
        return {
            "status": "success",
            "test_result": result,
            "message": "Overpass API test completed"
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "message": "Overpass API test failed"
        }

@router.get("/pois/categories")
async def get_poi_categories():
    """
    Get available POI categories and their information.
    
    Returns:
        Dictionary with category information
    """
    try:
        categories = {}
        for category in overpass_service.get_all_categories():
            info = overpass_service.get_category_info(category)
            if info:
                categories[category] = {
                    "color": info["color"],
                    "icon": info["icon"],
                    "tags": info["tags"]
                }
        return categories
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching categories: {str(e)}")

@router.get("/zone/detect")
async def detect_zone(
    lat: float = Query(..., description="User latitude"),
    lon: float = Query(..., description="User longitude")
):
    """
    Detect which zone a user's coordinates fall within.
    
    Args:
        lat: User's latitude
        lon: User's longitude
    
    Returns:
        Dictionary with zone information or null if not in any zone
    """
    try:
        if not validate_coordinates(lat, lon):
            raise HTTPException(status_code=400, detail="Invalid coordinates")
        
        from app.utils.zone_utils import find_zone_for_point
        zone = find_zone_for_point(lat, lon)
        
        if zone:
            return {
                "zone": zone.name,
                "color": zone.color,
                "coordinates": zone.coordinates
            }
        else:
            return {"zone": None}
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error detecting zone: {str(e)}")

@router.get("/transit", response_model=TransitResponse)
async def get_transit_directions(
    start_lat: float = Query(..., description="Starting point latitude"),
    start_lon: float = Query(..., description="Starting point longitude"),
    end_lat: float = Query(..., description="Destination latitude"),
    end_lon: float = Query(..., description="Destination longitude")
):
    """
    Get transit directions and carbon savings between two points.
    
    Args:
        start_lat: Starting point latitude
        start_lon: Starting point longitude
        end_lat: Destination latitude
        end_lon: Destination longitude
    
    Returns:
        TransitResponse: Transit routes and environmental impact data
    """
    try:
        if not validate_coordinates(start_lat, start_lon) or \
           not validate_coordinates(end_lat, end_lon):
            raise HTTPException(status_code=400, detail="Invalid coordinates")
        
        # Get transit directions
        directions = await transit_service.get_transit_directions(
            start_lat, start_lon, end_lat, end_lon
        )
        
        # Calculate total distance in kilometers
        total_distance = sum(route["distance"] for route in directions["routes"])
        
        # Calculate carbon savings
        carbon_savings = transit_service.calculate_carbon_savings(total_distance)
        
        return TransitResponse(
            routes=[TransitRoute(**route) for route in directions["routes"]],
            total_distance=total_distance,
            total_duration=sum(route["duration"] for route in directions["routes"]),
            carbon_savings=CarbonSavings(**carbon_savings)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error getting transit directions: {str(e)}"
        )