"""
Zone service for managing LA zone definitions and polygon data.
"""

from typing import List
from app.models.schemas import ZonePolygon

def get_la_zones() -> List[ZonePolygon]:
    """
    Get predefined LA zones with their polygon coordinates and colors.
    
    TODO: Replace dummy coordinates with real LA zone boundaries.
    These are simplified rectangular zones for demonstration.
    """
    
    # TODO: Replace these dummy coordinates with actual LA zone boundaries
    # Consider using real geographic data from LA city boundaries or OpenStreetMap
    zones = [
        ZonePolygon(
            name="Downtown LA",
            color="#FF6B6B",  # Red
            coordinates=[[
                [-118.2600, 34.0400],  # Southwest corner
                [-118.2400, 34.0400],  # Southeast corner
                [-118.2400, 34.0600],  # Northeast corner
                [-118.2600, 34.0600],  # Northwest corner
                [-118.2600, 34.0400]   # Close polygon
            ]]
        ),
        ZonePolygon(
            name="Hollywood",
            color="#4ECDC4",  # Teal
            coordinates=[[
                [-118.3600, 34.0800],  # Southwest corner
                [-118.3200, 34.0800],  # Southeast corner
                [-118.3200, 34.1100],  # Northeast corner
                [-118.3600, 34.1100],  # Northwest corner
                [-118.3600, 34.0800]   # Close polygon
            ]]
        ),
        ZonePolygon(
            name="Santa Monica",
            color="#45B7D1",  # Blue
            coordinates=[[
                [-118.5000, 34.0100],  # Southwest corner
                [-118.4800, 34.0100],  # Southeast corner
                [-118.4800, 34.0300],  # Northeast corner
                [-118.5000, 34.0300],  # Northwest corner
                [-118.5000, 34.0100]   # Close polygon
            ]]
        ),
        ZonePolygon(
            name="Pasadena",
            color="#96CEB4",  # Green
            coordinates=[[
                [-118.1600, 34.1300],  # Southwest corner
                [-118.1200, 34.1300],  # Southeast corner
                [-118.1200, 34.1600],  # Northeast corner
                [-118.1600, 34.1600],  # Northwest corner
                [-118.1600, 34.1300]   # Close polygon
            ]]
        )
    ]
    
    return zones
