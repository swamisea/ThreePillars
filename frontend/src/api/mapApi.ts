/**
 * API client for communicating with the LA Interactive Map backend.
 * Handles all HTTP requests to the FastAPI backend.
 */

import { SearchRequest, SearchResponse, ZonesResponse } from '../types'

// Backend API base URL
const API_BASE_URL = 'http://localhost:8000/api'

/**
 * Search for places using the backend API
 * @param request - Search request with query and coordinates
 * @returns Promise with search results
 */
export const searchPlaces = async (request: SearchRequest): Promise<SearchResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Search API error:', error)
    throw error
  }
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
