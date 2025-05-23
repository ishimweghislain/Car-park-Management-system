import { useState, useEffect } from 'react';
import { ParkingCircle, Plus, Search } from 'lucide-react';
import { parkingSlotsAPI } from '../services/api';
import { getStatusBadgeClass, capitalize } from '../utils/formatters';

const ParkingSlots = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1,
    limit: 50
  });

  useEffect(() => {
    fetchSlots();
  }, [filters]);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const response = await parkingSlotsAPI.getAll(filters);
      setSlots(response.data.slots);
    } catch (error) {
      console.error('Error fetching parking slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-success-100 border-success-200';
      case 'occupied':
        return 'bg-warning-100 border-warning-200';
      case 'maintenance':
        return 'bg-danger-100 border-danger-200';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Parking Slots</h1>
            <p className="mt-1 text-sm text-gray-500">
              View parking slot availability and status (View Only - Slots are managed by admin)
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by slot number..."
                className="input pl-10"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              className="input"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Slots Grid */}
      <div className="card">
        <div className="card-content">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No parking slots found
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
              {slots.map((slot) => (
                <div
                  key={slot._id}
                  className={`p-4 rounded-lg border-2 text-center transition-colors ${getStatusColor(slot.slotStatus)}`}
                >
                  <ParkingCircle className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                  <div className="text-sm font-medium text-gray-900">
                    {slot.slotNumber}
                  </div>
                  <div className={`text-xs mt-1 badge ${getStatusBadgeClass(slot.slotStatus)}`}>
                    {capitalize(slot.slotStatus)}
                  </div>
                  {slot.location && (
                    <div className="text-xs text-gray-500 mt-1">
                      {slot.location}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 card">
        <div className="card-header">
          <h3 className="text-lg font-medium">Status Legend</h3>
        </div>
        <div className="card-content">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded bg-success-200 mr-2"></div>
              <span className="text-sm text-gray-600">Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded bg-warning-200 mr-2"></div>
              <span className="text-sm text-gray-600">Occupied</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded bg-danger-200 mr-2"></div>
              <span className="text-sm text-gray-600">Maintenance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkingSlots;
