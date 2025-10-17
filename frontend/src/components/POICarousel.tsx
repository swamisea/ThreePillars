import React from 'react'
import { POI, POICategoryType } from '../types'

interface POICarouselProps {
  pois: POI[]
  selectedCategory: POICategoryType
  onPOIClick: (poi: POI) => void
  isLoading?: boolean
}

const POICarousel: React.FC<POICarouselProps> = ({
  pois,
  selectedCategory,
  onPOIClick,
  isLoading = false
}) => {
  const getCategoryIcon = (category: POICategoryType): string => {
    const icons = {
      all: '📍',
      restaurants: '🍽️',
      bars: '🍺',
      attractions: '🎭',
      utilities: '🚻'
    }
    return icons[category] || '📍'
  }

  const getCategoryColor = (category: POICategoryType): string => {
    const colors = {
      all: '#4ECDC4',
      restaurants: '#FF6B6B',
      bars: '#4ECDC4',
      attractions: '#45B7D1',
      utilities: '#96CEB4'
    }
    return colors[category] || '#4ECDC4'
  }

  const formatDistance = (distance?: number): string => {
    if (distance === undefined) return ''
    return distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`
  }

  if (isLoading) {
    return (
      <div className="poi-carousel">
        <div className="carousel-header">
          <h3>Loading POIs...</h3>
        </div>
        <div className="carousel-content">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Fetching points of interest...</p>
          </div>
        </div>
        
        <style jsx>{`
          .poi-carousel {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            height: 100%;
            display: flex;
            flex-direction: column;
          }

          .carousel-header {
            padding: 16px;
            border-bottom: 1px solid #e1e5e9;
          }

          .carousel-header h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            color: #333;
          }

          .carousel-content {
            flex: 1;
            padding: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .loading-spinner {
            text-align: center;
            color: #666;
          }

          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #4ECDC4;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 16px;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (pois.length === 0) {
    return (
      <div className="poi-carousel">
        <div className="carousel-header">
          <h3>
            <span className="category-icon">{getCategoryIcon(selectedCategory)}</span>
            {selectedCategory === 'all' ? 'All POIs' : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
          </h3>
          <p className="poi-count">No POIs found</p>
        </div>
        <div className="carousel-content">
          <div className="empty-state">
            <p>No points of interest found in this zone.</p>
            <p>Try selecting a different zone or category.</p>
          </div>
        </div>
        
        <style jsx>{`
          .poi-carousel {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            height: 100%;
            display: flex;
            flex-direction: column;
          }

          .carousel-header {
            padding: 16px;
            border-bottom: 1px solid #e1e5e9;
          }

          .carousel-header h3 {
            margin: 0 0 4px 0;
            font-size: 18px;
            font-weight: 600;
            color: #333;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .category-icon {
            font-size: 20px;
          }

          .poi-count {
            margin: 0;
            font-size: 14px;
            color: #666;
          }

          .carousel-content {
            flex: 1;
            padding: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .empty-state {
            text-align: center;
            color: #666;
          }

          .empty-state p {
            margin: 8px 0;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="poi-carousel">
      <div className="carousel-header">
        <h3>
          <span className="category-icon">{getCategoryIcon(selectedCategory)}</span>
          {selectedCategory === 'all' ? 'All POIs' : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
        </h3>
        <p className="poi-count">{pois.length} POI{pois.length !== 1 ? 's' : ''} found</p>
      </div>
      
      <div className="carousel-content">
        <div className="poi-list">
          {pois.map((poi, index) => (
            <div
              key={`${poi.name}-${index}`}
              className="poi-card"
              onClick={() => onPOIClick(poi)}
            >
              <div className="poi-header">
                <h4 className="poi-name">{poi.name}</h4>
                {poi.distance && (
                  <span className="poi-distance">{formatDistance(poi.distance)}</span>
                )}
              </div>
              
              <div className="poi-details">
                <p className="poi-type">{poi.amenity_type}</p>
                {poi.address && (
                  <p className="poi-address">{poi.address}</p>
                )}
                <p className="poi-description">{poi.description}</p>
              </div>
              
              <div className="poi-action">
                <span className="action-text">Click to navigate</span>
                <span className="action-arrow">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <style jsx>{`
        .poi-carousel {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .carousel-header {
          padding: 16px;
          border-bottom: 1px solid #e1e5e9;
          flex-shrink: 0;
        }

        .carousel-header h3 {
          margin: 0 0 4px 0;
          font-size: 18px;
          font-weight: 600;
          color: #333;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .category-icon {
          font-size: 20px;
        }

        .poi-count {
          margin: 0;
          font-size: 14px;
          color: #666;
        }

        .carousel-content {
          flex: 1;
          overflow: hidden;
        }

        .poi-list {
          height: 100%;
          overflow-y: auto;
          padding: 8px;
        }

        .poi-card {
          background: #f8f9fa;
          border: 1px solid #e1e5e9;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .poi-card:hover {
          border-color: ${getCategoryColor(selectedCategory)};
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .poi-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }

        .poi-name {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #333;
          flex: 1;
          margin-right: 8px;
        }

        .poi-distance {
          background: ${getCategoryColor(selectedCategory)};
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
        }

        .poi-details {
          margin-bottom: 8px;
        }

        .poi-type {
          margin: 0 0 4px 0;
          font-size: 14px;
          font-weight: 500;
          color: ${getCategoryColor(selectedCategory)};
        }

        .poi-address {
          margin: 0 0 4px 0;
          font-size: 13px;
          color: #666;
        }

        .poi-description {
          margin: 0;
          font-size: 12px;
          color: #888;
        }

        .poi-action {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 8px;
          border-top: 1px solid #e1e5e9;
        }

        .action-text {
          font-size: 12px;
          color: #666;
        }

        .action-arrow {
          font-size: 16px;
          color: ${getCategoryColor(selectedCategory)};
        }

        /* Scrollbar styling */
        .poi-list::-webkit-scrollbar {
          width: 6px;
        }

        .poi-list::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .poi-list::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        .poi-list::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  )
}

export default POICarousel
