/**
 * TypeScript type definitions for the LA Interactive Map application.
 */

// Place search result type
export interface Place {
  name: string
  lat: number
  lon: number
  description: string
}

// Zone polygon type
export interface Zone {
  name: string
  color: string
  coordinates: number[][][]
}

// Search request type
export interface SearchRequest {
  query: string
  lat: number
  lon: number
}

// Top location and check-in types
export interface TopLocation {
  poi_name: string
  poi_id: string
  lat: number
  lon: number
  amenity_type: string
  checkin_count: number
}

export interface CheckIn {
  id: string
  user_name: string
  poi_name: string
  poi_lat: number
  poi_lon: number
  zone_name: string
  photo_url: string
  caption?: string
  timestamp: string
  amenity_type: string
  poi_id: string
}

// API response types
export interface ZonesResponse {
  zones: Zone[]
}

export interface SearchResponse {
  name: string
  lat: number
  lon: number
  description: string
}

// POI (Point of Interest) types
export interface POI {
  name: string
  lat: number
  lon: number
  amenity_type: string
  description: string
  address: string
  distance?: number
  tags?: Record<string, string>
}

export interface POIResponse {
  zone: string
  pois: Record<string, POI[]>
  total_count: number
}

export interface POICategory {
  color: string
  icon: string
  tags: string[]
}

export type POICategoryType = 'restaurants' | 'bars' | 'attractions' | 'utilities' | 'all'