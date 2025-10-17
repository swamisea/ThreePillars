"""
Zone utility functions for point-in-polygon detection and zone operations.
"""

from typing import List, Optional, Tuple
from app.models.schemas import ZonePolygon
from app.services.zone_service import get_la_zones

def point_in_polygon(point: Tuple[float, float], polygon: List[List[Tuple[float, float]]]) -> bool:
    """
    Check if a point is inside a polygon using the ray casting algorithm.
    
    Args:
        point: Tuple of (longitude, latitude)
        polygon: List of polygon rings, where each ring is a list of (lon, lat) tuples
    
    Returns:
        True if point is inside polygon, False otherwise
    """
    x, y = point
    
    # Use the first ring (outer boundary) for point-in-polygon check
    if not polygon or not polygon[0]:
        return False
    
    ring = polygon[0]
    n = len(ring)
    inside = False
    
    p1x, p1y = ring[0]
    for i in range(1, n + 1):
        p2x, p2y = ring[i % n]
        if y > min(p1y, p2y):
            if y <= max(p1y, p2y):
                if x <= max(p1x, p2x):
                    if p1y != p2y:
                        xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                    if p1x == p2x or x <= xinters:
                        inside = not inside
        p1x, p1y = p2x, p2y
    
    return inside

def find_zone_for_point(lat: float, lon: float) -> Optional[ZonePolygon]:
    """
    Find which zone a point (lat, lon) falls within.
    
    Args:
        lat: Latitude of the point
        lon: Longitude of the point
    
    Returns:
        ZonePolygon object if point is within a zone, None otherwise
    """
    zones = get_la_zones()
    point = (lon, lat)  # Note: polygon coordinates are stored as [lon, lat]
    
    for zone in zones:
        if point_in_polygon(point, zone.coordinates):
            return zone
    
    return None

def get_zone_boundaries(zone_name: str) -> Optional[List[List[Tuple[float, float]]]]:
    """
    Get polygon boundaries for a specific zone by name.
    
    Args:
        zone_name: Name of the zone
    
    Returns:
        Zone coordinates if found, None otherwise
    """
    zones = get_la_zones()
    
    for zone in zones:
        if zone.name.lower() == zone_name.lower():
            return zone.coordinates
    
    return None

def is_point_in_zone(lat: float, lon: float, zone_name: str) -> bool:
    """
    Check if a point is within a specific zone.
    
    Args:
        lat: Latitude of the point
        lon: Longitude of the point
        zone_name: Name of the zone to check
    
    Returns:
        True if point is in the zone, False otherwise
    """
    zone_boundaries = get_zone_boundaries(zone_name)
    if not zone_boundaries:
        return False
    
    point = (lon, lat)
    return point_in_polygon(point, zone_boundaries)

def get_zone_names() -> List[str]:
    """
    Get list of all available zone names.
    
    Returns:
        List of zone names
    """
    zones = get_la_zones()
    return [zone.name for zone in zones]

def validate_coordinates(lat: float, lon: float) -> bool:
    """
    Validate that coordinates are within valid ranges.
    
    Args:
        lat: Latitude
        lon: Longitude
    
    Returns:
        True if coordinates are valid, False otherwise
    """
    return -90 <= lat <= 90 and -180 <= lon <= 180
