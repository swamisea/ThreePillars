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
