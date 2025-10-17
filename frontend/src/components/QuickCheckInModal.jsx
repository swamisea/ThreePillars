import React from 'react';

const QuickCheckInModal = ({ isOpen, onClose, poi, zone }) => {
  const [userName, setUserName] = React.useState('');
  const [caption, setCaption] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('http://localhost:8000/api/checkins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_name: userName,
          poi_name: poi.name,
          poi_lat: poi.lat,
          poi_lon: poi.lon,
          zone_name: zone,
          amenity_type: poi.amenity_type || 'attraction',
          caption: caption.trim() || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to create check-in');

      // Clear form and close modal on success
      setUserName('');
      setCaption('');
      onClose();
    } catch (error) {
      console.error('Error creating check-in:', error);
      alert('Failed to create check-in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Check In</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={submitting}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <div className="text-gray-900">{poi.name}</div>
            </div>

            <div>
              <label
                htmlFor="userName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Your Name
              </label>
              <input
                type="text"
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={submitting}
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label
                htmlFor="caption"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Caption (optional)
              </label>
              <textarea
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                disabled={submitting}
                placeholder="Add a caption to your check-in..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? 'Checking in...' : 'Check In'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickCheckInModal;