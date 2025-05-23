import { useState, useEffect } from 'react';
import { Car, Search, Phone, User } from 'lucide-react';
import { carsAPI } from '../services/api';
import { formatDateTime } from '../utils/formatters';

const Cars = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  useEffect(() => {
    fetchCars();
  }, [filters]);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const response = await carsAPI.getAll(filters);
      setCars(response.data.cars);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        total: response.data.total
      });
    } catch (error) {
      console.error('Error fetching cars:', error);
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

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cars</h1>
            <p className="mt-1 text-sm text-gray-500">
              View registered cars and driver information (cars are added automatically when creating parking records)
            </p>
          </div>
          <div className="text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
            <span className="font-medium">Note:</span> Cars are automatically registered when creating parking entries
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by plate number, driver name, or phone..."
              className="input pl-10"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Cars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="card-content">
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))
        ) : cars.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No cars found</p>
          </div>
        ) : (
          cars.map((car) => (
            <div key={car._id} className="card hover:shadow-md transition-shadow">
              <div className="card-content">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Car className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {car.plateNumber}
                    </h3>
                    {car.carModel && (
                      <p className="text-sm text-gray-500">{car.carModel}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    <span>{car.driverName}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{car.phoneNumber}</span>
                  </div>

                  {car.carColor && (
                    <div className="flex items-center text-sm text-gray-600">
                      <div
                        className="w-4 h-4 rounded-full mr-2 border border-gray-300"
                        style={{ backgroundColor: car.carColor.toLowerCase() }}
                      ></div>
                      <span className="capitalize">{car.carColor}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Registered: {formatDateTime(car.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((pagination.currentPage - 1) * filters.limit) + 1} to{' '}
            {Math.min(pagination.currentPage * filters.limit, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="btn-secondary disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="btn-secondary disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cars;
