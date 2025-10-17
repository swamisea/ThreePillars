import React from 'react'
import { POICategoryType } from '../types'

interface POIFilterProps {
  selectedCategory: POICategoryType
  onCategoryChange: (category: POICategoryType) => void
  isLoading?: boolean
}

const POIFilter: React.FC<POIFilterProps> = ({
  selectedCategory,
  onCategoryChange,
  isLoading = false
}) => {
  const categories: { value: POICategoryType; label: string; icon: string }[] = [
    { value: 'all', label: 'All POIs', icon: '📍' },
    { value: 'restaurants', label: 'Restaurants', icon: '🍽️' },
    { value: 'bars', label: 'Bars', icon: '🍺' },
    { value: 'attractions', label: 'Attractions', icon: '🎭' },
    { value: 'utilities', label: 'Utilities', icon: '🚻' }
  ]

  return (
    <div className="poi-filter">
      <h3 className="filter-title">Filters</h3>
      <div className="filter-buttons">
        {categories.map((category) => (
          <button
            key={category.value}
            className={`filter-button ${selectedCategory === category.value ? 'active' : ''}`}
            onClick={() => onCategoryChange(category.value)}
            disabled={isLoading}
          >
            <span className="filter-icon">{category.icon}</span>
            <span className="filter-label">{category.label}</span>
          </button>
        ))}
      </div>
      
      <style jsx>{`
        .poi-filter {
          background: white;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 16px;
        }

        .filter-title {
          margin: 0 0 12px 0;
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }

        .filter-buttons {
          display: flex;
          flex-direction: row;
          overflow-x: auto;
          gap: 4px;
        }

        .filter-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 5px 8px;
          border: 2px solid #e1e5e9;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
          font-weight: 500;
        }

        .filter-button:hover:not(:disabled) {
          border-color: #4ECDC4;
          background: #f8f9fa;
        }

        .filter-button.active {
          border-color: #4ECDC4;
          background: #4ECDC4;
          color: white;
        }

        .filter-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .filter-icon {
          font-size: 16px;
        }

        .filter-label {
          flex: 1;
          text-align: left;
        }

        @media (max-width: 768px) {
          .filter-buttons {
            flex-direction: row;
            flex-wrap: wrap;
          }
          
          .filter-button {
            flex: 1;
            min-width: 120px;
          }
        }
      `}</style>
    </div>
  )
}

export default POIFilter
