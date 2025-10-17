from typing import Dict, List, Tuple
import requests

class TransitService:
    def __init__(self):
        self.base_url = "https://api.metro.net/api/v1"  # LA Metro API base URL
        
    async def get_transit_directions(
        self, 
        start_lat: float, 
        start_lon: float, 
        end_lat: float, 
        end_lon: float
    ) -> Dict:
        """Get transit directions between two points."""
        url = f"{self.base_url}/trip-planner"
        params = {
            "from": f"{start_lat},{start_lon}",
            "to": f"{end_lat},{end_lon}",
            "mode": "TRANSIT,WALK"
        }
        response = requests.get(url, params=params)
        return response.json()

    def calculate_carbon_savings(self, distance_km: float) -> Dict[str, float]:
        """Calculate carbon savings for different transport modes."""
        # CO2 emissions in kg per kilometer
        emissions = {
            "car": 0.192,
            "bus": 0.082,
            "train": 0.041,
            "carpool": 0.096
        }
        
        car_emissions = distance_km * emissions["car"]
        return {
            "transit": car_emissions - (distance_km * emissions["bus"]),
            "train": car_emissions - (distance_km * emissions["train"]),
            "carpool": car_emissions - (distance_km * emissions["carpool"])
        }