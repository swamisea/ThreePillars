# Backend - FastAPI Application

This is the FastAPI backend for the LA Interactive Map application.

## 🚀 Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the development server:
```bash
# Option 1: Using the run script (recommended)
python run_server.py

# Option 2: Using uvicorn directly
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

## 📚 API Documentation

Once running, visit:
- Interactive API docs: `http://localhost:8000/docs`
- ReDoc documentation: `http://localhost:8000/redoc`

## 🛠 Endpoints

### GET /zones
Returns the predefined LA zones with their polygons and colors.

### POST /search
Search for places using the Nominatim API.

**Request Body:**
```json
{
  "query": "nearest restroom",
  "lat": 34.0522,
  "lon": -118.2437
}
```

**Response:**
```json
{
  "name": "Place Name",
  "lat": 34.0522,
  "lon": -118.2437,
  "description": "Place description"
}
```

## 🧩 Customization

### Adding New Zones
Edit `app/services/zone_service.py` to add or modify zone definitions.

### Extending Search
Modify `app/services/nominatim_service.py` to add caching, filtering, or additional search logic.
