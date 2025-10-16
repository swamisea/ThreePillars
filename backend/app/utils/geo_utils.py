"""
Geographic utility functions for distance calculations and coordinate operations.
"""

import math
from typing import Tuple

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the distance between two points using the Haversine formula.
    
    Args:
        lat1, lon1: First point coordinates
        lat2, lon2: Second point coordinates
    
    Returns:
        Distance in kilometers
    """
    # Earth's radius in kilometers
    R = 6371.0
    
    # Convert latitude and longitude from degrees to radians
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    # Calculate differences
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    # Haversine formula
    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    return R * c

def find_closest_point(user_lat: float, user_lon: float, points: list) -> dict:
    """
    Find the closest point from a list of points to the user's location.
    
    Args:
        user_lat, user_lon: User's coordinates
        points: List of dictionaries with 'lat' and 'lon' keys
    
    Returns:
        Dictionary of the closest point
    """
    if not points:
        return None
    
    closest_point = None
    min_distance = float('inf')
    
    for point in points:
        distance = calculate_distance(
            user_lat, user_lon, 
            float(point['lat']), float(point['lon'])
        )
        
        if distance < min_distance:
            min_distance = distance
            closest_point = point
    
    return closest_point
