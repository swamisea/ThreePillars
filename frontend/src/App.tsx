import { useState, useEffect } from 'react'
import MapView from './components/MapView'
import SearchBar from './components/SearchBar'
import ZoneLegend from './components/ZoneLegend'
import POIFilter from './components/POIFilter'
import POICarousel from './components/POICarousel'
import { searchPlaces, getZones, getPOIs, detectZone } from './api/mapApi'
import { Place, Zone, POI, POICategoryType } from './types'

/**
 * Main App component that orchestrates the LA Interactive Map application.
 * Manages state for user location, search results, zones, POIs, and map interactions.
 */
function App() {
  // State management for the application
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [searchResults, setSearchResults] = useState<Place[]>([])
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [zones, setZones] = useState<Zone[]>([])
  const [pois, setPois] = useState<POI[]>([])
  const [selectedPOICategory, setSelectedPOICategory] = useState<POICategoryType>('all')
  const [currentZone, setCurrentZone] = useState<string | null>(null)
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [userZone, setUserZone] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPOIs, setIsLoadingPOIs] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get user's current location on component mount
  useEffect(() => {
    getCurrentLocation()
    loadZones()
  }, [])

  // Load POIs when user location or selected zone changes
  useEffect(() => {
    const zoneToLoad = selectedZone || currentZone
    console.log('🔄 POI useEffect triggered')
    console.log('  - userLocation:', userLocation)
    console.log('  - selectedZone:', selectedZone)
    console.log('  - currentZone:', currentZone)
    console.log('  - zoneToLoad:', zoneToLoad)
    
    if (userLocation && zoneToLoad) {
      console.log('✅ Conditions met, calling loadPOIs')
      loadPOIs(zoneToLoad)
    } else {
      console.log('❌ Conditions not met for loading POIs')
    }
  }, [userLocation, selectedZone, currentZone])

  /**
   * Get user's current location using browser geolocation API
   */
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation([latitude, longitude])
        setError(null)
        
        // Use backend API to determine which zone the user is in
        try {
          const zoneData = await detectZone(latitude, longitude)
          if (zoneData.zone) {
            setCurrentZone(zoneData.zone)
            setUserZone(zoneData.zone)
            setSelectedZone(null) // Reset selected zone to show user's zone
          } else {
            setCurrentZone('Downtown LA') // Default fallback
            setUserZone('Downtown LA')
          }
        } catch (err) {
          console.error('Error detecting zone:', err)
          setCurrentZone('Downtown LA') // Default fallback
          setUserZone('Downtown LA')
        }
      },
      (error) => {
        console.error('Error getting location:', error)
        setError('Unable to get your location. Please enable location services.')
        // Fallback to LA center if location fails
        setUserLocation([34.0522, -118.2437])
        setCurrentZone('Downtown LA') // Default zone
        setUserZone('Downtown LA')
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
   * Load POIs for the current zone
   */
  const loadPOIs = async (zone: string) => {
    console.log('🔍 loadPOIs called for zone:', zone)
    console.log('📍 User location:', userLocation)
    
    if (!userLocation) {
      console.log('❌ No user location, skipping POI load')
      return
    }

    setIsLoadingPOIs(true)
    console.log('🔄 Loading POIs...')
    
    try {
      const categories = selectedPOICategory === 'all' ? undefined : selectedPOICategory
      console.log('📂 Categories:', categories)
      
      const poiData = await getPOIs(zone, categories, userLocation[0], userLocation[1])
      console.log('📊 POI data received:', poiData)
      console.log('📊 Total POI count:', poiData.total_count)
      
      // Flatten POIs from all categories
      const allPois: POI[] = []
      Object.values(poiData.pois).forEach(categoryPois => {
        allPois.push(...categoryPois)
      })
      
      console.log('✅ Flattened POIs:', allPois.length)
      setPois(allPois)
    } catch (err) {
      console.error('❌ Error loading POIs:', err)
      setError('Failed to load points of interest')
    } finally {
      setIsLoadingPOIs(false)
      console.log('🏁 POI loading complete')
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
  setSearchResults([]) // Clear previous results
  setSelectedPlace(null) // Clear selection

  try {
    const result = await searchPlaces({
      query,
      lat: userLocation[0],
      lon: userLocation[1]
    })
    
    // result should now be an array of places
    setSearchResults(Array.isArray(result) ? result : [result])
  } catch (err) {
    console.error('Search error:', err)
    setError('Search failed. Please try again.')
  } finally {
    setIsLoading(false)
  }
}

// Add a handler for selecting a place from results:
const handleSelectPlace = (place: Place) => {
  setSelectedPlace(place)
  setSearchResults([]) // Clear results after selection
}

  /**
   * Handle POI category filter change
   */
  const handlePOICategoryChange = (category: POICategoryType) => {
    setSelectedPOICategory(category)
    // POIs will be filtered client-side, no need to reload
  }

  /**
   * Handle zone click for exploring different zones
   */
  const handleZoneClick = (zone: Zone) => {
    setSelectedZone(zone.name)
    // POIs will be loaded automatically via useEffect
  }

  /**
   * Reset to user's current zone
   */
  const resetToUserZone = () => {
    setSelectedZone(null)
    setCurrentZone(userZone)
  }

  /**
   * Handle POI click for navigation
   */
  const handlePOIClick = (poi: POI) => {
    // For now, just log the POI. In a real implementation, this could:
    // - Center the map on the POI
    // - Show routing to the POI
    // - Display more detailed information
    console.log('POI clicked:', poi)
  }

  /**
   * Filter POIs based on selected category
   */
  const getFilteredPOIs = (): POI[] => {
    if (selectedPOICategory === 'all') {
      return pois
    }
    
    // Filter POIs based on amenity type
    const categoryMapping: Record<POICategoryType, string[]> = {
      all: [],
      restaurants: ['restaurant'],
      bars: ['bar', 'pub'],
      attractions: ['attraction', 'museum', 'gallery', 'monument'],
      utilities: ['toilets', 'drinking_water']
    }
    
    const allowedTypes = categoryMapping[selectedPOICategory]
    return pois.filter(poi => allowedTypes.includes(poi.amenity_type))
  }

  return (
    <div className="app-container">
      {/* Left sidebar with search and filters */}
      <div className="left-sidebar">
        <SearchBar 
          onSearch={handleSearch}
          onSelectPlace={handleSelectPlace}
          isLoading={isLoading}
          searchResults={searchResults}
          selectedPlace={selectedPlace}
        />
        <ZoneLegend zones={zones} />
      </div>

      {/* Main map view */}
      <div className="map-container">
        <MapView
          userLocation={userLocation}
          searchResult={selectedPlace}  // Changed from searchResult
          zones={zones}
          pois={getFilteredPOIs()}
          selectedPOICategory={selectedPOICategory}
          selectedZone={selectedZone}
          onPOIClick={handlePOIClick}
          onZoneClick={handleZoneClick}
          isLoading={isLoading}
        />
      </div>

      {/* Right sidebar with POI carousel */}
      <div className="right-sidebar">
        <POIFilter
          selectedCategory={selectedPOICategory}
          onCategoryChange={handlePOICategoryChange}
          isLoading={isLoadingPOIs}
        />
        <POICarousel
          pois={getFilteredPOIs()}
          selectedCategory={selectedPOICategory}
          onPOIClick={handlePOIClick}
          isLoading={isLoadingPOIs}
        />
      </div>
      
      {/* Error display */}
      {error && (
        <div className="error-overlay">
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        </div>
      )}
      
      <style>{`
        .app-container {
          display: flex;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
        }

        .location-controls {
          padding: 16px;
          border-bottom: 1px solid #e1e5e9;
        }

        .my-location-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 12px 16px;
          background: #4ECDC4;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .my-location-btn:hover:not(:disabled) {
          background: #45B7D1;
          transform: translateY(-1px);
        }

        .my-location-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
        }

        .btn-icon {
          font-size: 16px;
        }

        .zone-info {
          margin-top: 12px;
          padding: 12px;
          background: white;
          border-radius: 6px;
          border: 1px solid #e1e5e9;
        }

        .current-zone {
          margin: 0 0 4px 0;
          font-size: 14px;
          color: #333;
        }

        .user-zone {
          margin: 0;
          font-size: 12px;
          color: #666;
        }

        .map-container {
          flex: 1;
          position: relative;
        }

        .right-sidebar {
          width: 350px;
          background: #f8f9fa;
          border-left: 1px solid #e1e5e9;
          display: flex;
          flex-direction: column;
        }

        .error-overlay {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
        }

        .error-message {
          background: #ff6b6b;
          color: white;
          padding: 12px 16px;
          border-radius: 6px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .error-message button {
          background: none;
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
          padding: 0;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @media (max-width: 1200px) {
          .left-sidebar {
            width: 250px;
          }
          
          .right-sidebar {
            width: 300px;
          }
        }

        @media (max-width: 768px) {
          .app-container {
            flex-direction: column;
          }
          
          .left-sidebar,
          .right-sidebar {
            width: 100%;
            height: auto;
            max-height: 200px;
          }
          
          .map-container {
            height: calc(100vh - 400px);
          }
        }
      `}</style>
    </div>
  )
}

export default App
