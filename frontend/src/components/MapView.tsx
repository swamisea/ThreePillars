import React, { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet-routing-machine'
import { Place, Zone } from '../types'

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface MapViewProps {
  userLocation: [number, number] | null
  searchResult: Place | null
  zones: Zone[]
  isLoading: boolean
}

/**
 * Routing component that handles route display between user and destination
 */
const Routing: React.FC<{ userLocation: [number, number], destination: [number, number] }> = ({ 
  userLocation, 
  destination 
}) => {
  const map = useMap()

  useEffect(() => {
    if (!map) return

    // Create routing control
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(userLocation[0], userLocation[1]),
        L.latLng(destination[0], destination[1])
      ],
      routeWhileDragging: true,
      addWaypoints: false,
      createMarker: () => null, // Don't create default markers
      lineOptions: {
        styles: [{ color: '#4ECDC4', weight: 5, opacity: 0.8 }]
      }
    }).addTo(map)

    // Cleanup on unmount
    return () => {
      map.removeControl(routingControl)
    }
  }, [map, userLocation, destination])

  return null
}

/**
 * MapView component renders the interactive Leaflet map with zones, markers, and routing.
 * Handles map interactions, zone display, and route visualization.
 */
const MapView: React.FC<MapViewProps> = ({ 
  userLocation, 
  searchResult, 
  zones, 
  isLoading 
}) => {
  const mapRef = useRef<L.Map>(null)

  // Default LA center coordinates
  const laCenter: [number, number] = [34.0522, -118.2437]
  const mapCenter = userLocation || laCenter

  // Custom icons for markers
  const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })

  const destinationIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <MapContainer
        center={mapCenter}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        {/* TODO: Customize map tile layer URL for different styles */}
        {/* Currently using OpenStreetMap tiles - can be replaced with MapTiler or other providers */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Render zone polygons */}
        {zones.map((zone, index) => (
          <Polygon
            key={index}
            positions={zone.coordinates[0].map(coord => [coord[1], coord[0]])}
            pathOptions={{
              color: zone.color,
              fillColor: zone.color,
              fillOpacity: 0.3,
              weight: 2,
              opacity: 0.8
            }}
          >
            <Popup>
              <div>
                <h3>{zone.name}</h3>
                <p>Zone color: {zone.color}</p>
              </div>
            </Popup>
          </Polygon>
        ))}

        {/* User location marker */}
        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>
              <div>
                <h3>Your Location</h3>
                <p>Lat: {userLocation[0].toFixed(4)}</p>
                <p>Lon: {userLocation[1].toFixed(4)}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Search result marker */}
        {searchResult && (
          <Marker 
            position={[searchResult.lat, searchResult.lon]} 
            icon={destinationIcon}
          >
            <Popup>
              <div>
                <h3>{searchResult.name}</h3>
                <p>{searchResult.description}</p>
                <p>Lat: {searchResult.lat.toFixed(4)}</p>
                <p>Lon: {searchResult.lon.toFixed(4)}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Routing between user and destination */}
        {userLocation && searchResult && (
          <Routing 
            userLocation={userLocation}
            destination={[searchResult.lat, searchResult.lon]}
          />
        )}
      </MapContainer>
    </div>
  )
}

export default MapView
