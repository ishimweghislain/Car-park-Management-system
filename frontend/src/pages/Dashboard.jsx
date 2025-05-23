import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  ParkingCircle,
  FileText,
  CreditCard,
  TrendingUp,
  Clock,
  DollarSign,
  Activity
} from 'lucide-react';
import { parkingSlotsAPI, parkingRecordsAPI, paymentsAPI } from '../services/api';
import { formatCurrency, formatDateTime } from '../utils/formatters';

const Dashboard = () => {
  const [stats, setStats] = useState({
    slots: { total: 0, available: 0, occupied: 0, maintenance: 0 },
    records: { todayRecords: 0, activeRecords: 0, totalRevenue: 0, todayRevenue: 0 },
    payments: { todayPayments: { count: 0, total: 0 }, totalPayments: { count: 0, total: 0 } }
  });
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all stats in parallel
      const [slotsStats, recordsStats, paymentsStats, recentRecordsData] = await Promise.all([
        parkingSlotsAPI.getStats(),
        parkingRecordsAPI.getStats(),
        paymentsAPI.getStats(),
        parkingRecordsAPI.getAll({ page: 1, limit: 5 })
      ]);

      setStats({
        slots: slotsStats.data,
        records: recordsStats.data,
        payments: paymentsStats.data
      });

      setRecentRecords(recentRecordsData.data.records);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle, link }) => (
    <div className="card">
      <div className="card-content">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 rounded-md flex items-center justify-center ${color}`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-lg font-medium text-gray-900">{value}</dd>
              {subtitle && <dd className="text-sm text-gray-500">{subtitle}</dd>}
            </dl>
          </div>
          {link && (
            <div className="ml-5 flex-shrink-0">
              <Link
                to={link}
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                View all
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card">
                <div className="card-content">
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome to SmartPark parking management system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Available Slots"
          value={`${stats.slots.available}/${stats.slots.total}`}
          icon={ParkingCircle}
          color="bg-success-500"
          subtitle={`${stats.slots.occupied} occupied`}
          link="/parking-slots"
        />
        
        <StatCard
          title="Active Parking"
          value={stats.records.activeRecords}
          icon={Car}
          color="bg-warning-500"
          subtitle="Currently parked"
          link="/parking-records"
        />
        
        <StatCard
          title="Today's Records"
          value={stats.records.todayRecords}
          icon={FileText}
          color="bg-primary-500"
          subtitle="New entries today"
          link="/parking-records"
        />
        
        <StatCard
          title="Today's Revenue"
          value={formatCurrency(stats.records.todayRevenue)}
          icon={DollarSign}
          color="bg-success-600"
          subtitle={formatCurrency(stats.payments.totalPayments.total) + " total"}
          link="/payments"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">Parking Slots Status</h3>
          </div>
          <div className="card-content">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Available</span>
                <span className="text-sm font-medium text-success-600">
                  {stats.slots.available}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Occupied</span>
                <span className="text-sm font-medium text-warning-600">
                  {stats.slots.occupied}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Maintenance</span>
                <span className="text-sm font-medium text-danger-600">
                  {stats.slots.maintenance}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">Revenue Summary</h3>
          </div>
          <div className="card-content">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Today</span>
                <span className="text-sm font-medium text-success-600">
                  {formatCurrency(stats.records.todayRevenue)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total</span>
                <span className="text-sm font-medium text-primary-600">
                  {formatCurrency(stats.payments.totalPayments.total)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Payments Today</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.payments.todayPayments.count}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">Quick Actions</h3>
          </div>
          <div className="card-content">
            <div className="space-y-2">
              <Link
                to="/parking-records/new"
                className="btn-primary w-full text-center block"
              >
                New Car Entry
              </Link>
              <Link
                to="/parking-records?status=active"
                className="btn-secondary w-full text-center block"
              >
                Process Exit
              </Link>
              <Link
                to="/parking-slots"
                className="btn-secondary w-full text-center block"
              >
                Manage Slots
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Records */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Recent Parking Records</h3>
            <Link
              to="/parking-records"
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              View all
            </Link>
          </div>
        </div>
        <div className="card-content">
          {recentRecords.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent records</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Car
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Slot
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entry Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentRecords.map((record) => (
                    <tr key={record._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.car?.plateNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.parkingSlot?.slotNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(record.entryTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`badge ${record.status === 'active' ? 'badge-warning' : 'badge-success'}`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
