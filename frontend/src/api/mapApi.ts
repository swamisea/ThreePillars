/**
 * API client for communicating with the LA Interactive Map backend.
 * Handles all HTTP requests to the FastAPI backend.
 */

import { SearchRequest, SearchResponse, ZonesResponse, POIResponse, POICategory, CheckIn, TopLocation, Place } from '../types'

// Backend API base URL
const API_BASE_URL = 'http://localhost:8000/api'

/**
 * Search for places using the backend API
 * @param request - Search request with query and coordinates
 * @returns Promise with search results
 */
export const searchPlaces = async (params: {
  query: string
  lat: number
  lon: number
}): Promise<Place[]> => {  // Note: Changed return type to Place[]
  const response = await fetch(`${API_BASE_URL}/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })

  if (!response.ok) {
    throw new Error('Search request failed')
  }

  const result = await response.json()
  
  // Return the results array, not the whole response object
  return result.results  // This is the key change!
}

/**
 * Get zone data from the backend API
 * @returns Promise with zones data
 */
export const getZones = async (): Promise<ZonesResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/zones`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Zones API error:', error)
    throw error
  }
}

/**
 * Get POIs (Points of Interest) for a specific zone
 * @param zone - Zone name to search for POIs
 * @param categories - Optional comma-separated list of categories
 * @param lat - Optional user latitude for distance calculation
 * @param lon - Optional user longitude for distance calculation
 * @returns Promise with POI data
 */
export const getPOIs = async (
  zone: string,
  categories?: string,
  lat?: number,
  lon?: number
): Promise<POIResponse> => {
  try {
    const params = new URLSearchParams({ zone })
    
    if (categories) {
      params.append('categories', categories)
    }
    if (lat !== undefined) {
      params.append('lat', lat.toString())
    }
    if (lon !== undefined) {
      params.append('lon', lon.toString())
    }

    const response = await fetch(`${API_BASE_URL}/pois?${params}`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('POIs API error:', error)
    throw error
  }
}

/**
 * Get POI category information
 * @returns Promise with category information
 */
export const getPOICategories = async (): Promise<Record<string, POICategory>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/pois/categories`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('POI Categories API error:', error)
    throw error
  }
}

/**
 * Detect which zone a user's coordinates fall within
 * @param lat - User's latitude
 * @param lon - User's longitude
 * @returns Promise with zone information
 */
export const detectZone = async (lat: number, lon: number): Promise<{ zone: string | null; color?: string; coordinates?: number[][][] }> => {
  try {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString()
    })

    const response = await fetch(`${API_BASE_URL}/zone/detect?${params}`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Zone detection API error:', error)
    throw error
  }
}
