# LA Interactive Map Application

A React + FastAPI application that displays an interactive cartoon-style map of Los Angeles with place search and routing capabilities.

## 🎯 Features

- Interactive cartoon-style map of Los Angeles
- Search for places (restrooms, restaurants, etc.)
- Auto-routing from current location to nearest matching spot
- Drag and explore map functionality
- Color-coded zones (Downtown, Hollywood, Santa Monica, Pasadena)
- Uses only free APIs (no API keys required)

## 🗂 Project Structure

```
project-root/
├── backend/          # FastAPI backend
├── frontend/         # React frontend
└── README.md
```

## 🚀 Quick Start

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the FastAPI server:
```bash
# Option 1: Using the run script (recommended)
python run_server.py

# Option 2: Using uvicorn directly
uvicorn app.main:app --reload
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🧩 Customization

### Modifying Zones
Edit the zone definitions in `backend/app/services/zone_service.py` to add or modify LA zones.

### Customizing Map Style
Update the tile layer URL in `frontend/src/components/MapView.tsx` to use different map styles.

## 📚 API Endpoints

- `GET /zones` - Returns zone polygons and colors
- `POST /search` - Search for places using Nominatim API

## 🛠 Tech Stack

- **Frontend:** React + TypeScript + Vite + Leaflet
- **Backend:** FastAPI + Python 3.11
- **Maps:** OpenStreetMap + Nominatim API
- **Routing:** leaflet-routing-machine
