// import React from 'react';
// import { formatDistanceToNow } from 'date-fns';

// const FeedPanel = ({ zone }) => {
//   const [checkins, setCheckins] = React.useState([]);
//   const [loading, setLoading] = React.useState(true);

//   React.useEffect(() => {
//     const fetchCheckins = async () => {
//       if (!zone) return;
//       setLoading(true);
//       try {
//         const response = await fetch(`http://localhost:8000/api/checkins/${zone}`);
//         if (!response.ok) throw new Error('Failed to fetch check-ins');
//         const data = await response.json();
//         setCheckins(data);
//       } catch (error) {
//         console.error('Error fetching check-ins:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCheckins();
//   }, [zone]);

//   if (!zone) {
//     return (
//       <div className="h-full flex items-center justify-center text-gray-500">
//         Select a zone to view check-ins
//       </div>
//     );
//   }

//   if (loading) {
//     return (
//       <div className="h-full flex items-center justify-center">
//         <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="h-full overflow-y-auto bg-gray-50 p-4">
//       <h2 className="text-xl font-semibold mb-4 sticky top-0 bg-gray-50 py-2 z-10">
//         Recent Check-ins in {zone}
//       </h2>
//       <div className="space-y-4">
//         {checkins.map((checkin) => (
//           <div
//             key={checkin.id}
//             className="bg-white rounded-lg shadow-sm overflow-hidden transition-shadow hover:shadow-md"
//           >
//             <img
//               src={checkin.photo_url}
//               alt={checkin.poi_name}
//               className="w-full h-48 object-cover"
//               loading="lazy"
//             />
//             <div className="p-4">
//               <div className="flex items-start justify-between">
//                 <div>
//                   <h3 className="font-semibold text-lg">{checkin.poi_name}</h3>
//                   <p className="text-sm text-gray-600">{checkin.user_name}</p>
//                 </div>
//                 <span className="text-xs text-gray-500">
//                   {formatDistanceToNow(new Date(checkin.timestamp), { addSuffix: true })}
//                 </span>
//               </div>
//               {checkin.caption && (
//                 <p className="mt-2 text-gray-700">{checkin.caption}</p>
//               )}
//               <div className="mt-2 text-xs text-gray-500">
//                 <span className="inline-flex items-center px-2 py-1 bg-gray-100 rounded-full">
//                   {checkin.amenity_type}
//                 </span>
//               </div>
//             </div>
//           </div>
//         ))}
//         {checkins.length === 0 && (
//           <div className="text-center text-gray-500 py-8">
//             No check-ins yet in this zone
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default FeedPanel;

import React from 'react';
import { formatDistanceToNow } from 'date-fns';

const FeedPanel = ({ zone }) => {
  const [checkins, setCheckins] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchCheckins = async () => {
      if (!zone) return;
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8000/api/checkins/${zone}`);
        if (!response.ok) throw new Error('Failed to fetch check-ins');
        const data = await response.json();
        setCheckins(data);
      } catch (error) {
        console.error('Error fetching check-ins:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCheckins();
  }, [zone]);

  if (!zone) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Select a zone to view check-ins
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="feed-panel">
      <div className="carousel-header">
        <h3>Recent Check-ins in {zone}</h3>
        <p className="checkin-count">{checkins.length} Check-in{checkins.length !== 1 ? 's' : ''}</p>
      </div>
      
      <div className="carousel-content">
        <div className="checkin-list">
          {checkins.map((checkin) => (
            <div key={checkin.id} className="checkin-card">
              <img
                src={checkin.photo_url}
                alt={checkin.poi_name}
                className="checkin-image"
              />
              <div className="checkin-details">
                <div className="checkin-header">
                  <h4 className="poi-name">{checkin.poi_name}</h4>
                  <span className="timestamp">
                    {formatDistanceToNow(new Date(checkin.timestamp), { addSuffix: true })}
                  </span>
                </div>
                <p className="user-name">{checkin.user_name}</p>
                {checkin.caption && (
                  <p className="caption">{checkin.caption}</p>
                )}
                <span className="amenity-type">{checkin.amenity_type}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .feed-panel {
          position: absolute;
          top: 0;
          left: 0;
          height: 100vh;
          width: 300px;
          background: white;
          z-index: 10;
          border-right: 1px solid #e1e5e9;
        }

        .carousel-header {
          padding: 16px;
          border-bottom: 1px solid #e1e5e9;
          background: white;
          position: sticky;
          top: 0;
          z-index: 11;
        }

        .carousel-content {
          height: calc(100vh - 70px); /* Subtract header height */
          overflow-y: auto;
          padding: 8px;
        }

        .carousel-header h3 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
          color: #333;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .checkin-count {
          margin: 0;
          font-size: 14px;
          color: #666;
        }

        .checkin-list {
          height: 100%;
          overflow-y: auto;
          padding: 8px;
        }

        .checkin-card {
          background: #f8f9fa;
          border: 1px solid #e1e5e9;
          border-radius: 8px;
          margin-bottom: 12px;
          overflow: hidden;
          width: calc(100% - 8px); /* Account for parent padding */
        }

        .checkin-image {
          width: 100%;
          height: 160px;
          object-fit: cover;
        }

        .checkin-details {
          padding: 12px;
        }

        .checkin-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
        }

        .poi-name {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #333;
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .timestamp {
          font-size: 12px;
          color: #666;
          white-space: nowrap;
        }

        .user-name {
          margin: 4px 0;
          font-size: 13px;
          color: #666;
        }

        .caption {
          margin: 8px 0;
          font-size: 13px;
          color: #333;
          word-break: break-word;
        }

        .amenity-type {
          display: inline-block;
          background: #4ECDC4;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
        }

        /* Custom scrollbar */
        .checkin-list::-webkit-scrollbar {
          width: 6px;
        }

        .checkin-list::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .checkin-list::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        .checkin-list::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        @media (max-width: 1200px) {
          .feed-panel {
            width: 250px;
          }
        }
      `}</style>
    </div>
  );
};

export default FeedPanel;