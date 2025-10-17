import React, { useState } from 'react'

interface SearchBarProps {
  onSearch: (query: string) => void
  isLoading: boolean
}

/**
 * SearchBar component for place search functionality.
 * Provides input field and search button for user queries.
 */
const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('')

  /**
   * Handle search form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
    }
  }

  /**
   * Handle input change
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit} style={{ display: 'flex', width: '100%' }}>
        <input
          type="text"
          className="search-input"
          placeholder="Search for places (e.g., 'nearest restroom', 'Italian restaurant')"
          value={query}
          onChange={handleInputChange}
          disabled={isLoading}
        />
        <button
          type="submit"
          className="search-button"
          disabled={isLoading || !query.trim()}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>
    </div>
  )
}

export default SearchBar
