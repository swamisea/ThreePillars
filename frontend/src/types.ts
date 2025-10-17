/**
 * TypeScript type definitions for the LA Interactive Map application.
 */

// Place search result type
export interface Place {
  name: string
  lat: number
  lon: number
  description: string
  distance_miles?: number 
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