import React from 'react'
import { Zone } from '../types'

interface ZoneLegendProps {
  zones: Zone[]
}

/**
 * ZoneLegend component displays the color-coded legend for LA zones.
 * Shows zone names and their corresponding colors for map reference.
 */
const ZoneLegend: React.FC<ZoneLegendProps> = ({ zones }) => {
  return (
    <div className="zone-legend">
      <h3>LA Zones</h3>
      {zones.map((zone) => (
        <div key={zone.name} className="zone-item">
          <div 
            className="zone-color" 
            style={{ backgroundColor: zone.color }}
          />
          <span>{zone.name}</span>
        </div>
      ))}
    </div>
  )
}

export default ZoneLegend
