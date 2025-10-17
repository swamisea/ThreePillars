import React, { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet-routing-machine'
import { Place, Zone, POI, POICategoryType } from '../types'

interface MapViewProps {
  userLocation: [number, number] | null
  searchResult: Place | null
  zones: Zone[]
  pois: POI[]
  selectedPOICategory: POICategoryType
  selectedZone: string | null
  onPOIClick: (poi: POI) => void
  onZoneClick: (zone: Zone) => void
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

     // Custom icons for routing markers
    const userIcon = new L.DivIcon({
      className: 'custom-user-marker',
      html: `
        <div style="
          width: 30px;
          height: 45px;
          background: #4169E1;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid #000080;
          box-shadow: 0 4px 8px rgba(0,0,0,0.4);
          position: relative;
        ">
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(45deg);
            width: 10px;
            height: 10px;
            background: white;
            border-radius: 50%;
          "></div>
        </div>
      `,
      iconSize: [30, 45],
      iconAnchor: [15, 45],
      popupAnchor: [1, -45],
    })

    const destinationIcon = new L.DivIcon({
      className: 'custom-destination-marker',
      html: `
        <div style="
          width: 30px;
          height: 45px;
          background: #FF0000;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid #8B0000;
          box-shadow: 0 4px 8px rgba(0,0,0,0.4);
          position: relative;
        ">
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(45deg);
            width: 10px;
            height: 10px;
            background: white;
            border-radius: 50%;
          "></div>
        </div>
      `,
      iconSize: [30, 45],
      iconAnchor: [15, 45],
      popupAnchor: [1, -45],
    })
    
    // Create routing control
    const routingControl = (L.Routing.control as any)({
      waypoints: [
        L.latLng(userLocation[0], userLocation[1]),
        L.latLng(destination[0], destination[1])
      ],
      routeWhileDragging: true,
      addWaypoints: false,
        lineOptions: {
          styles: [{ 
            color: '#4ECDC4', 
            weight: 6, 
            opacity: 0.9,
            dashArray: '10, 10' // Dashed route line for cartoon effect
          }],
          extendToWaypoints: false,
          missingRouteTolerance: 0
        },
        createMarker: (i: number, wp: any, n: number) => {
    return L.marker(wp.latLng, {
      icon: i === 0 ? userIcon : destinationIcon,
    })
  },
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
 * Handles map interactions, zone display, POI markers, and route visualization.
 */
const MapView: React.FC<MapViewProps> = ({ 
  userLocation, 
  searchResult, 
  zones, 
  pois,
  selectedZone,
  onPOIClick,
  onZoneClick
}) => {
  const mapRef = useRef<L.Map>(null)

  // Default LA center coordinates
  const laCenter: [number, number] = [34.0522, -118.2437]
  const mapCenter = userLocation || laCenter

  // Custom icons for markers
  const userIcon = new L.DivIcon({
    className: 'custom-user-marker',
    html: `
      <div style="
        width: 30px;
        height: 45px;
        background: #4169E1;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid #000080;
        box-shadow: 0 4px 8px rgba(0,0,0,0.4);
        position: relative;
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(45deg);
          width: 10px;
          height: 10px;
          background: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [30, 45],
    iconAnchor: [15, 45],
    popupAnchor: [1, -45],
  })

  const destinationIcon = new L.DivIcon({
    className: 'custom-destination-marker',
    html: `
      <div style="
        width: 30px;
        height: 45px;
        background: #FF0000;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid #8B0000;
        box-shadow: 0 4px 8px rgba(0,0,0,0.4);
        position: relative;
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(45deg);
          width: 10px;
          height: 10px;
          background: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [30, 45],
    iconAnchor: [15, 45],
    popupAnchor: [1, -45],
  })

  // Fix for default markers in React Leaflet
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  })

  // Create POI icons based on category
  const createPOIIcon = (category: string, color: string) => {
    return new L.DivIcon({
      className: 'poi-marker',
      html: `
        <div style="
          background-color: ${color};
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: white;
        ">
          ${getCategoryEmoji(category)}
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      popupAnchor: [0, -10]
    })
  }

  const getCategoryEmoji = (category: string): string => {
    const emojis: Record<string, string> = {
      'restaurant': '🍽️',
      'bar': '🍺',
      'pub': '🍺',
      'attraction': '🎭',
      'museum': '🏛️',
      'gallery': '🖼️',
      'monument': '🏛️',
      'toilets': '🚻',
      'drinking_water': '💧'
    }
    return emojis[category] || '📍'
  }

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      'restaurant': '#FF6B6B',
      'bar': '#4ECDC4',
      'pub': '#4ECDC4',
      'attraction': '#45B7D1',
      'museum': '#45B7D1',
      'gallery': '#45B7D1',
      'monument': '#45B7D1',
      'toilets': '#96CEB4',
      'drinking_water': '#96CEB4'
    }
    return colors[category] || '#4ECDC4'
  }

  // Simple point-in-polygon check for zone highlighting
  const isPointInZone = (lat: number, lon: number, coordinates: number[][][]): boolean => {
    const polygon = coordinates[0] // Use first ring
    let inside = false
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0], yi = polygon[i][1]
      const xj = polygon[j][0], yj = polygon[j][1]
      
      if (((yi > lon) !== (yj > lon)) && (lat < (xj - xi) * (lon - yi) / (yj - yi) + xi)) {
        inside = !inside
      }
    }
    
    return inside
  }

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <MapContainer
        center={mapCenter}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        {/* Cartoon-style map tiles using CartoDB Positron for a clean, cartoon-like appearance */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />
        
        {/* Render zone polygons */}
        {zones.map((zone, index) => {
          const isSelected = selectedZone === zone.name
          const isUserZone = userLocation && isPointInZone(userLocation[0], userLocation[1], zone.coordinates)
          
          return (
            <Polygon
              key={index}
              positions={zone.coordinates[0].map(coord => [coord[1], coord[0]])}
               pathOptions={{
                 color: zone.color,
                 fillColor: zone.color,
                 fillOpacity: isSelected ? 0.5 : (isUserZone ? 0.4 : 0.3),
                 weight: isSelected ? 4 : (isUserZone ? 3 : 2),
                 opacity: isSelected ? 1.0 : 0.8,
                 dashArray: isSelected ? '10, 5' : '5, 5' // Dashed borders for cartoon effect
               }}
              eventHandlers={{
                click: () => onZoneClick(zone),
                mouseover: (e) => {
                  const layer = e.target
                  layer.setStyle({
                    weight: 4,
                    opacity: 1.0,
                    fillOpacity: 0.5
                  })
                },
                mouseout: (e) => {
                  const layer = e.target
                  layer.setStyle({
                    weight: isSelected ? 4 : (isUserZone ? 3 : 2),
                    opacity: isSelected ? 1.0 : 0.8,
                    fillOpacity: isSelected ? 0.5 : (isUserZone ? 0.4 : 0.3)
                  })
                }
              }}
            >
              <Popup>
                <div>
                  <h3>{zone.name}</h3>
                  <p>Zone color: {zone.color}</p>
                  {isUserZone && <p><strong>📍 Your current zone</strong></p>}
                  {isSelected && <p><strong>🎯 Selected zone</strong></p>}
                  <p><em>Click to explore POIs in this zone</em></p>
                </div>
              </Popup>
            </Polygon>
          )
        })}

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

        {/* POI markers */}
        {pois.map((poi, index) => {
          const categoryColor = getCategoryColor(poi.amenity_type)
          const poiIcon = createPOIIcon(poi.amenity_type, categoryColor)
          
          return (
            <Marker
              key={`poi-${index}`}
              position={[poi.lat, poi.lon]}
              icon={poiIcon}
              eventHandlers={{
                click: () => onPOIClick(poi)
              }}
            >
              <Popup>
                <div>
                  <h3>{poi.name}</h3>
                  <p><strong>Type:</strong> {poi.amenity_type}</p>
                  <p><strong>Description:</strong> {poi.description}</p>
                  {poi.address && <p><strong>Address:</strong> {poi.address}</p>}
                  {poi.distance && <p><strong>Distance:</strong> {poi.distance.toFixed(2)} km</p>}
                  <p><strong>Coordinates:</strong> {poi.lat.toFixed(4)}, {poi.lon.toFixed(4)}</p>
                </div>
              </Popup>
            </Marker>
          )
        })}

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
