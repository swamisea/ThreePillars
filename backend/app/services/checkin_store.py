"""
In-memory mock data store for check-ins and top locations.
For hackathon demo only - data resets on server restart.
"""
from datetime import datetime, timedelta
import random

# LA neighborhoods and their popular venues (real locations)
LA_VENUES = {
    "Long Beach Zone": [
        {"name": "Aquarium of the Pacific", "lat": 33.7621, "lon": -118.1975, "type": "attraction"},
        {"name": "The Queen Mary", "lat": 33.7526, "lon": -118.1906, "type": "attraction"},
        {"name": "Long Beach Museum of Art", "lat": 33.7642, "lon": -118.1790, "type": "museum"},
        {"name": "Shoreline Village", "lat": 33.7622, "lon": -118.1900, "type": "attraction"},
        {"name": "El Dorado Nature Center", "lat": 33.8293, "lon": -118.0857, "type": "park"},
        {"name": "The Pike Outlets", "lat": 33.7633, "lon": -118.1926, "type": "shopping"},
        {"name": "Parkers' Lighthouse", "lat": 33.7617, "lon": -118.1899, "type": "restaurant"}
    ],
    "Pasadena Zone": [
        {"name": "Rose Bowl Stadium", "lat": 34.1613, "lon": -118.1677, "type": "stadium"},
        {"name": "Norton Simon Museum", "lat": 34.1463, "lon": -118.1587, "type": "museum"},
        {"name": "The Huntington Library", "lat": 34.1285, "lon": -118.1140, "type": "attraction"},
        {"name": "Old Pasadena", "lat": 34.1461, "lon": -118.1514, "type": "attraction"},
        {"name": "Eaton Canyon Nature Center", "lat": 34.1783, "lon": -118.0952, "type": "park"},
        {"name": "Gamble House", "lat": 34.1516, "lon": -118.1588, "type": "attraction"}
    ],
    "Universal City Zone": [
        {"name": "Universal Studios Hollywood", "lat": 34.1381, "lon": -118.3534, "type": "theme_park"},
        {"name": "Universal CityWalk", "lat": 34.1367, "lon": -118.3513, "type": "entertainment"},
        {"name": "Studio Tour", "lat": 34.1391, "lon": -118.3533, "type": "attraction"},
        {"name": "The Wizarding World of Harry Potter", "lat": 34.1385, "lon": -118.3521, "type": "attraction"},
        {"name": "Universal Cinema", "lat": 34.1369, "lon": -118.3516, "type": "entertainment"}
    ],
    "Anaheim Zone": [
        {"name": "Disneyland Park", "lat": 33.8121, "lon": -117.9190, "type": "theme_park"},
        {"name": "Disney California Adventure", "lat": 33.8061, "lon": -117.9215, "type": "theme_park"},
        {"name": "Downtown Disney", "lat": 33.8088, "lon": -117.9252, "type": "entertainment"},
        {"name": "Anaheim Convention Center", "lat": 33.8019, "lon": -117.9228, "type": "convention_center"},
        {"name": "Angel Stadium", "lat": 33.8003, "lon": -117.8827, "type": "stadium"},
        {"name": "Honda Center", "lat": 33.8078, "lon": -117.8768, "type": "stadium"}
    ],
    "Carson Zone": [
        {"name": "Dignity Health Sports Park", "lat": 33.8644, "lon": -118.2611, "type": "stadium"},
        {"name": "International Printing Museum", "lat": 33.8507, "lon": -118.2820, "type": "museum"},
        {"name": "SouthBay Pavilion", "lat": 33.8606, "lon": -118.2820, "type": "shopping"},
        {"name": "Goodyear Blimp Base", "lat": 33.8671, "lon": -118.2567, "type": "attraction"}
    ]
}

# Update caption templates to reference new locations
CAPTIONS = [
    "Best spot in LA! 🌟",
    "Amazing vibes here ✨",
    "Had to check this place out 👀",
    "Finally made it! Worth the hype 🙌",
    "Can't beat these views 📸",
    "Hidden gem in {zone} 💎",
    "My new favorite spot 🎯",
    "So much history here 🏛️",
    "The food was incredible 😋",
    "Perfect evening out 🌅",
    "Already planning my next visit! 🗓️",
    "A must-visit in LA 🌴",
    "{venue} never disappoints ⭐",
    "Tourist mode activated 📸",
    "Living my best LA life 🌞"
    "Loving {zone} vibes 🌟",
    "Perfect day at {venue} 🎡",
    "SoCal adventures continue! 🌴",
    "Weekend fun in {zone} 🎉",
    "Tourist mode: activated 📸"
]

USERS = [
    "Alex Chen", "Maria Garcia", "James Kim", "Sarah Lee", "David Patel",
    "Emma Wilson", "Michael Lopez", "Sofia Rodriguez", "Ryan Park", "Lisa Nguyen",
    "Chris Wong", "Olivia Brown", "Daniel Lee", "Isabella Martinez", "Kevin Tran"
]

# In-memory stores (reset on server restart)
MOCK_CHECKINS = {}  # zone_name -> list of check-ins
TOP_LOCATIONS = {}  # zone_name -> list of top venues with counts


def generate_mock_checkins():
    """Generate 20-30 check-ins per zone with realistic data."""
    global MOCK_CHECKINS, TOP_LOCATIONS
    MOCK_CHECKINS.clear()
    TOP_LOCATIONS.clear()
    
    now = datetime.now()
    checkin_id = 1

    for zone, venues in LA_VENUES.items():
        MOCK_CHECKINS[zone] = []
        venue_counts = {v["name"]: 0 for v in venues}
        
        # Generate 20-30 check-ins per zone
        num_checkins = random.randint(20, 30)
        for _ in range(num_checkins):
            venue = random.choice(venues)
            venue_counts[venue["name"]] += 1
            
            # Random time in last 7 days
            time_ago = timedelta(
                days=random.randint(0, 6),
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59)
            )
            checkin_time = now - time_ago

            checkin = {
                "id": str(checkin_id),
                "user_name": random.choice(USERS),
                "poi_name": venue["name"],
                "poi_id": f"{zone}-{venue['name'].lower().replace(' ', '-')}",
                "poi_lat": venue["lat"],
                "poi_lon": venue["lon"],
                "zone_name": zone,
                "photo_url": f"https://picsum.photos/400/300?random={checkin_id}",
                "caption": random.choice(CAPTIONS).format(zone=zone, venue=venue["name"]),
                "timestamp": checkin_time.isoformat(),
                "amenity_type": venue["type"]
            }
            MOCK_CHECKINS[zone].append(checkin)
            checkin_id += 1
        
        # Sort by timestamp descending
        MOCK_CHECKINS[zone].sort(key=lambda x: x["timestamp"], reverse=True)
        
        # Generate top locations based on check-in counts
        top_venues = []
        for venue in venues:
            base_count = random.randint(15, 75)  # Base popularity
            bonus = venue_counts[venue["name"]] * 2  # Bonus from recent check-ins
            top_venues.append({
                "poi_name": venue["name"],
                "poi_id": f"{zone}-{venue['name'].lower().replace(' ', '-')}",
                "lat": venue["lat"],
                "lon": venue["lon"],
                "amenity_type": venue["type"],
                "checkin_count": base_count + bonus
            })
        
        # Sort by check-in count descending and keep top 10
        top_venues.sort(key=lambda x: x["checkin_count"], reverse=True)
        TOP_LOCATIONS[zone] = top_venues[:10]


def get_zone_checkins(zone: str, limit: int = 20) -> list:
    """Get recent check-ins for a zone."""
    if zone not in MOCK_CHECKINS:
        return []
    return MOCK_CHECKINS[zone][:limit]


def get_top_locations(zone: str, limit: int = 10) -> list:
    """Get top locations for a zone."""
    if zone not in TOP_LOCATIONS:
        return []
    return TOP_LOCATIONS[zone][:limit]


def add_checkin(user_name: str, poi_data: dict, caption: str = None) -> dict:
    """Add a new check-in to the in-memory store."""
    global MOCK_CHECKINS, TOP_LOCATIONS
    
    zone = poi_data["zone_name"]
    if zone not in MOCK_CHECKINS:
        MOCK_CHECKINS[zone] = []
    
    # Get next ID
    max_id = max((int(c["id"]) for checkins in MOCK_CHECKINS.values() for c in checkins), default=0)
    new_id = str(max_id + 1)
    
    # Create check-in with random photo
    checkin = {
        "id": new_id,
        "user_name": user_name,
        "poi_name": poi_data["poi_name"],
        "poi_id": poi_data.get("poi_id") or f"{zone}-{poi_data['poi_name'].lower().replace(' ', '-')}",
        "poi_lat": poi_data["lat"],
        "poi_lon": poi_data["lon"],
        "zone_name": zone,
        "photo_url": f"https://picsum.photos/400/300?random={new_id}",
        "caption": caption,
        "timestamp": datetime.now().isoformat(),
        "amenity_type": poi_data.get("amenity_type", "attraction")
    }
    
    # Add to start of zone's list
    MOCK_CHECKINS[zone].insert(0, checkin)
    
    # Update top locations
    if zone in TOP_LOCATIONS:
        for loc in TOP_LOCATIONS[zone]:
            if loc["poi_name"] == poi_data["poi_name"]:
                loc["checkin_count"] += 1
                break
        # Re-sort by count
        TOP_LOCATIONS[zone].sort(key=lambda x: x["checkin_count"], reverse=True)
    
    return checkin


# Generate initial mock data
generate_mock_checkins()