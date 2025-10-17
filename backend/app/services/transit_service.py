from typing import Dict, List, Tuple, Any
import requests

class TransitService:
    def __init__(self):
        self.base_url = "https://api.metro.net/api/v1"  # LA Metro API base URL
        self.osrm_base = "http://router.project-osrm.org/route/v1"
        
    async def get_transit_directions(
    self,
    start_lat: float,
    start_lon: float,
    end_lat: float,
    end_lon: float,
    mode: str = "driving",
    passengers: int = 1
) -> Dict[str, Any]:
        """Get directions based on mode with realistic time estimates."""
    
        # Get base route from OSRM
        profile = "foot" if mode in ("transit", "walking") else "driving"
        coords = f"{start_lon},{start_lat};{end_lon},{end_lat}"
        url = f"{self.osrm_base}/{profile}/{coords}"
        params = {"overview": "full", "geometries": "geojson", "steps": "true"}
        
        try:
            resp = requests.get(url, params=params, timeout=10)
            resp.raise_for_status()
            osrm = resp.json()
            
            if not osrm.get("routes"):
                return {"routes": [], "total_distance": 0.0, "total_duration": 0}

            r0 = osrm["routes"][0]
            dist_km = r0["distance"] / 1000.0
            dur_seconds = int(r0["duration"])
            
            # Adjust duration based on mode
            if mode == "transit":
                # Public transit is slower: add waiting time + slower speed
                dur_seconds = int(dur_seconds * 1.5 + 300)  # 50% slower + 5 min wait
            elif mode == "walking":
                # Walking is slower than driving: ~5 km/h vs 50 km/h
                dur_seconds = int((dist_km / 5) * 3600)  # Calculate from distance
            elif mode == "carpool":
                # Carpool same as driving
                dur_seconds = int(r0["duration"])
            
            instr = []
            for leg in r0.get("legs", []):
                for step in leg.get("steps", []):
                    instr.append(step.get("maneuver", {}).get("instruction", step.get("name", "")))
            instructions = " / ".join([s for s in instr if s])
            
            route_item = {
                "mode": mode,
                "distance": dist_km,
                "duration": dur_seconds,
                "instructions": instructions,
                "geometry": r0.get("geometry")
            }
            return {"routes": [route_item], "total_distance": dist_km, "total_duration": dur_seconds}
            
        except Exception as e:
            print(f"OSRM Error: {e}")
            raise

    def calculate_carbon_savings(self, distance_km: float, mode: str, passengers: int = 1) -> Dict[str, float]:
        """
        Returns carbon savings over driving alone (kg CO2).
        Also returns breakdown for transit/train/carpool for display compatibility.
        """
        emissions = {
            "car": 0.192,   # kg CO2 / km per car (single occupant)
            "bus": 0.082,
            "train": 0.041,
            "walk": 0.0,
        }
        car_em = distance_km * emissions["car"] / max(1, passengers)  # if passengers>1 reduces per person
        bus_em = distance_km * emissions["bus"]
        train_em = distance_km * emissions["train"]
        walk_em = 0.0
        # savings compared to driving alone (single occupant)
        savings = {
            "transit": max(0.0, (distance_km * emissions["car"]) - bus_em),
            "train": max(0.0, (distance_km * emissions["car"]) - train_em),
            "carpool": max(0.0, (distance_km * emissions["car"]) - (distance_km * emissions["car"] / max(1, passengers))),
            "walking": max(0.0, (distance_km * emissions["car"]) - walk_em)
        }
        return savings