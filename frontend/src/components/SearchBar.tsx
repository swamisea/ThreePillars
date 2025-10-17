import React, { useState } from "react";
import { Place } from "../types";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onSelectPlace: (place: Place) => void;
  isLoading: boolean;
  searchResults: Place[];
  selectedPlace: Place | null;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onSelectPlace,
  isLoading,
  searchResults,
  selectedPlace,
}) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const clearSelection = () => {
    onSelectPlace(null as any);
    setQuery("");
  };

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
          {isLoading ? "Searching..." : "Search"}
        </button>
      </form>

      {/* Search Results */}
      {searchResults.length > 0 && !selectedPlace && (
        <div className="search-results">
          <h3>Found {searchResults.length} places:</h3>
          <div className="results-list">
            {searchResults.map((place, index) => (
              <button
                key={index}
                onClick={() => onSelectPlace(place)}
                className="result-item"
              >
                <div className="result-content">
                  <h4>{place.name}</h4>
                  <p>{place.description}</p>
                  <span className="distance">
                    📍 {place.distance_miles} mi away
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Place */}
      {selectedPlace && (
        <div className="selected-place">
          <h3>Selected Location</h3>
          <p className="place-name">{selectedPlace.name}</p>
          <p className="place-description">{selectedPlace.description}</p>
          <p className="place-distance">
            📍 {selectedPlace.distance_miles} miles away
          </p>
          <button onClick={clearSelection} className="change-button">
            Change Selection
          </button>
        </div>
      )}

      <style>{`
  .search-container {
    position: relative;
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    z-index: 1000;
  }

  form {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(6px);
    padding: 8px 12px;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }

  .search-input {
    flex: 1;
    padding: 10px 14px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    outline: none;
    background: white;
  }

  .search-button {
    padding: 10px 22px;
    background: #4ECDC4;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s ease;
  }

  .search-button:hover:not(:disabled) {
    background: #3bb8b0;
  }

  .search-button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  /* Results & Selected Location */
  .search-results,
  .selected-place {
    margin-top: 12px;
    width: 100%;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(6px);
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    padding: 16px;
    animation: fadeIn 0.2s ease-in-out;
  }

  .search-results h3 {
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #333;
  }

  .results-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 250px;
    overflow-y: auto;
  }

  .result-item {
    text-align: left;
    padding: 10px 12px;
    border: 1px solid #e1e5e9;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
  }

  .result-item:hover {
    border-color: #4ECDC4;
    background: #f0fffe;
  }

  .result-content h4 {
    font-size: 14px;
    font-weight: 600;
    color: #222;
    margin: 0 0 4px 0;
  }

  .result-content p {
    font-size: 12px;
    color: #555;
    margin: 0 0 6px 0;
  }

  .distance {
    font-size: 11px;
    color: #777;
  }

  .selected-place h3 {
    font-size: 13px;
    font-weight: 600;
    color: #2a9d8f;
    margin-bottom: 6px;
  }

  .place-name {
    font-size: 15px;
    font-weight: 600;
    color: #111;
    margin: 0 0 4px 0;
  }

  .place-description {
    font-size: 13px;
    color: #555;
    margin: 0 0 6px 0;
  }

  .place-distance {
    font-size: 12px;
    color: #2a9d8f;
    margin: 0 0 10px 0;
  }

  .change-button {
    padding: 8px 14px;
    background: white;
    color: #2a9d8f;
    border: 1px solid #2a9d8f;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .change-button:hover {
    background: #2a9d8f;
    color: white;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }
`}</style>
    </div>
  );
};

export default SearchBar;
