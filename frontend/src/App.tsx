import React, { useState, useEffect } from 'react'
import MapView from './components/MapView'
import SearchBar from './components/SearchBar'
import ZoneLegend from './components/ZoneLegend'
import { searchPlaces, getZones } from './api/mapApi'
import { Place, Zone } from './types'

/**
 * Main App component that orchestrates the LA Interactive Map application.
 * Manages state for user location, search results, zones, and map interactions.
 */
function App() {
  // State management for the application
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [searchResult, setSearchResult] = useState<Place | null>(null)
  const [zones, setZones] = useState<Zone[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get user's current location on component mount
  useEffect(() => {
    getCurrentLocation()
    loadZones()
  }, [])

  /**
   * Get user's current location using browser geolocation API
   */
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation([latitude, longitude])
        setError(null)
      },
      (error) => {
        console.error('Error getting location:', error)
        setError('Unable to get your location. Please enable location services.')
        // Fallback to LA center if location fails
        setUserLocation([34.0522, -118.2437])
      }
    )
  }

  /**
   * Load zone data from the backend API
   */
  const loadZones = async () => {
    try {
      const zoneData = await getZones()
      setZones(zoneData.zones)
    } catch (err) {
      console.error('Error loading zones:', err)
      setError('Failed to load map zones')
    }
  }

  /**
   * Handle search functionality
   * @param query - Search query string
   */
  const handleSearch = async (query: string) => {
    if (!userLocation) {
      setError('Location not available for search')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await searchPlaces({
        query,
        lat: userLocation[0],
        lon: userLocation[1]
      })
      
      setSearchResult(result)
    } catch (err) {
      console.error('Search error:', err)
      setError('Search failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="map-container">
      {/* Search bar component */}
      <SearchBar 
        onSearch={handleSearch}
        isLoading={isLoading}
      />
      
      {/* Zone legend component */}
      <ZoneLegend zones={zones} />
      
      {/* Error display */}
      {error && (
        <div className="error">
          {error}
        </div>
      )}
      
      {/* Main map view */}
      <MapView
        userLocation={userLocation}
        searchResult={searchResult}
        zones={zones}
        isLoading={isLoading}
      />
    </div>
  )
}

export default App
