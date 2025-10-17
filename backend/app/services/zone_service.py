"""
Zone service for managing LA zone definitions and polygon data.
"""

from typing import List
import requests
import json
from app.models.schemas import ZonePolygon
from collections import Counter


def get_la_zones() -> List[ZonePolygon]:
    """
    Get predefined LA zones with their polygon coordinates and colors.
    """
    zones = []
    headers = {"User-Agent": "BuilHackAgent/1.0"}
    search_url = "https://nominatim.openstreetmap.org/search"
    zones_list = get_zone_name('')
    for zone in zones_list:
        zone_info = get_zone_name(zone)
        search_params = {
            "q": zone_info[0],
            "format": "json",
            "limit": 1,
            "polygon_geojson": 1,
        }
        print(f"Full URL: {search_url}?{requests.compat.urlencode(search_params)}")
        response = requests.get(search_url, params=search_params, headers=headers)
        data = response.json()
        if data:
            geometry = data[0]["geojson"]

            # Extract coordinates
            if geometry["type"] == "Polygon":
                coordinates = geometry["coordinates"]
            elif geometry["type"] == "MultiPolygon":
                # Take the largest polygon
                coordinates = max(geometry["coordinates"], key=lambda x: len(x[0]))

            if(len(coordinates) == 0):
                    print("No coordinates found for: ", zone)
            zones.append(
                ZonePolygon(name= zone, color= zone_info[1], coordinates=coordinates)
            )
    return zones


def get_zone_name(zone_name:str) -> str:
    zone_list = [
        "Long Beach Zone",
        "Pomona Zone",
        "Whittier Narrows Zone",
        "City of Industry Zone",
        "Anaheim Zone",
        "Valley Zone",
        "Arcadia Zone",
        "Carson Zone",
        "Pasadena Zone",
        "Universal City Zone",
        "Inglewood Zone",
        "Port of Los Angeles Zone",
    ]
    zone_name_color_mapping = {
        "Whittier Narrows Zone": ["Whittier Narrows, CA, USA","#639d53"],
        "Pomona Zone": ["Pomona, CA, USA", "#fdb638"],
        "Inglewood Zone": ["Inglewood, CA, USA", "#b5fa05"],
        "Arcadia Zone": ["Arcadia, CA, USA", "#23572c"],
        "Carson Zone": ["Carson, CA, USA", "#57ced2"],
        "Universal City Zone": ["Universal City, CA, USA", "#49859e"],
        "City of Industry Zone": ["City of Industry, CA, USA", "#a81387"],
        "Valley Zone": ["San Fernando, CA, USA", "#71b0ac"],
        "Port of Los Angeles Zone": ["Port of Los Angeles, CA, USA", "#865429"],
        "Pasadena Zone": ["Pasadena, CA, USA", "#99ac50"],
        "Long Beach Zone": ["Long Beach, CA, USA", "#fd960b"],
        "Anaheim Zone": ["Anaheim, CA, USA", "#b9ad29"],
    }
    if zone_name:
        return zone_name_color_mapping[zone_name]
    else:
        return zone_list
#Excluded 
# "Exposition Park Zone": ["Exposition+Park+Los+Angeles+CA+USA", "#7a00aa"],
# "Venice Zone": ["Venice, CA, USA", "#8c529d"],
# "Trestles Beach Zone": ["Trestles Beach, CA, USA", "#d1074a"],
# "Riviera Zone": ["Riviera, CA, USA", "#395cec"],
# "OKC Zone": ["OKC, CA, USA", "#f75699"],
# "DTLA Zone": ["DTLA, CA, USA", "#030ba3"],