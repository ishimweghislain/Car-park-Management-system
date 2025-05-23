import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Car, Clock, DollarSign } from 'lucide-react';
import { parkingRecordsAPI } from '../services/api';
import { formatDateTime, formatDuration, formatCurrency, getStatusBadgeClass } from '../utils/formatters';
import CarEntryForm from '../components/CarEntryForm';

const ParkingRecordsList = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchRecords();
  }, [filters]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        ...(filters.search && { search: filters.search })
      };

      const response = await parkingRecordsAPI.getAll(params);
      setRecords(response.data.records);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        total: response.data.total
      });
    } catch (error) {
      console.error('Error fetching parking records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleProcessExit = async (recordId) => {
    try {
      await parkingRecordsAPI.processExit(recordId, {});
      fetchRecords(); // Refresh the list
    } catch (error) {
      console.error('Error processing exit:', error);
      alert('Error processing exit: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const handleDelete = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await parkingRecordsAPI.delete(recordId);
        fetchRecords(); // Refresh the list
      } catch (error) {
        console.error('Error deleting record:', error);
        alert('Error deleting record: ' + (error.response?.data?.message || 'Unknown error'));
      }
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Parking Records</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage car entries and exits
            </p>
          </div>
          <Link
            to="/parking-records/new"
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Entry
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by plate number, driver name..."
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
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="card">
        <div className="card-content p-0">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : records.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No parking records found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Car Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Slot
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entry Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {records.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {record.car?.plateNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.car?.driverName}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.parkingSlot?.slotNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(record.entryTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDuration(record.duration)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(record.totalAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`badge ${getStatusBadgeClass(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {record.status === 'active' && (
                          <button
                            onClick={() => handleProcessExit(record._id)}
                            className="text-warning-600 hover:text-warning-900"
                          >
                            Process Exit
                          </button>
                        )}
                        <Link
                          to={`/parking-records/${record._id}/edit`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(record._id)}
                          className="text-danger-600 hover:text-danger-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
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

// Use the CarEntryForm component
const NewParkingRecord = () => <CarEntryForm />;

const EditParkingRecord = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">Edit Parking Record</h1>
    <p className="text-gray-500">Edit form will be implemented here.</p>
  </div>
);

const ParkingRecords = () => {
  return (
    <Routes>
      <Route index element={<ParkingRecordsList />} />
      <Route path="new" element={<NewParkingRecord />} />
      <Route path=":id/edit" element={<EditParkingRecord />} />
    </Routes>
  );
};

export default ParkingRecords;
