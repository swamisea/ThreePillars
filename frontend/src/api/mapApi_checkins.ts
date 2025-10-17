import { CheckIn, TopLocation } from '../types'

// Backend API base URL
const API_BASE_URL = 'http://localhost:8000/api'

/**
 * Get recent check-ins for a zone
 * @param zone - Zone name to get check-ins for
 * @param limit - Optional maximum number of check-ins to return
 * @returns Promise with list of check-ins
 */
export const getZoneCheckins = async (zone: string, limit: number = 20): Promise<CheckIn[]> => {
  try {
    const params = new URLSearchParams()
    if (limit) params.append('limit', limit.toString())

    const response = await fetch(`${API_BASE_URL}/checkins/${zone}?${params}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Check-ins API error:', error)
    throw error
  }
}

/**
 * Get top locations for a zone
 * @param zone - Zone name to get top locations for
 * @param limit - Optional maximum number of locations to return
 * @returns Promise with list of top locations
 */
export const getTopLocations = async (zone: string, limit: number = 10): Promise<TopLocation[]> => {
  try {
    const params = new URLSearchParams()
    if (limit) params.append('limit', limit.toString())

    const response = await fetch(`${API_BASE_URL}/locations/${zone}/top?${params}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Top locations API error:', error)
    throw error
  }
}