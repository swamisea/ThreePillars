"""
FastAPI main application for LA Interactive Map backend.
Provides endpoints for zone data and place search functionality.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import map_routes

# Create FastAPI application instance
app = FastAPI(
    title="LA Interactive Map API",
    description="Backend API for LA Interactive Map application",
    version="1.0.0"
)

# Configure CORS to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(map_routes.router, prefix="/api", tags=["map"])

@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "LA Interactive Map API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
