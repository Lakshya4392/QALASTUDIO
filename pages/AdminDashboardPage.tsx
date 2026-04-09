import React, { useEffect, useState } from 'react';
import { useAuth } from '../services/auth-context';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface DashboardStats {
  total_bookings: number;
  total_revenue: number;
  total_users: number;
  total_studios: number;
}

interface Studio {
  id: string;
  name: string;
  owner_email: string;
  city: string;
  status: string;
  bookings_count: number;
  created_at: string;
}

interface Activity {
  id: string;
  action: string;
  details: string;
  created_at: string;
}

const AdminDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    total_bookings: 0,
    total_revenue: 0,
    total_users: 0,
    total_studios: 0,
  });
  const [studios, setStudios] = useState<Studio[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'studios' | 'users' | 'bookings'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');

      // Fetch all stats in parallel
      const [studiosRes, usersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/studios?limit=100`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/auth/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Process studios response
      if (studiosRes.ok) {
        const studiosData = await studiosRes.json();
        setStudios(studiosData.data || []);
      }

      // Process users response separately
      let totalUsers = 0;
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        totalUsers = usersData.data?.length || 0;
      }

      // Calculate basic stats from studios data
      if (studios.length > 0) {
        const totalBookings = studios.reduce((sum, s) => sum + (s.bookings_count || 0), 0);
        setStats((prev) => ({
          ...prev,
          total_bookings: totalBookings,
          total_studios: studios.length,
          total_users: totalUsers,
        }));
      }

      // Mock activities (replace with real activity log API)
      setActivities([
        { id: '1', action: 'New booking', details: 'Studio booking confirmed', created_at: new Date().toISOString() },
        { id: '2', action: 'New user registered', details: 'User signed up', created_at: new Date().toISOString() },
      ]);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-red-100 text-red-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don't have permission to access the admin dashboard.</p>
          <button onClick={() => window.history.back()} className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="mb-4 text-red-500">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Dashboard</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={fetchDashboardData} className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <p className="text-xs text-gray-300 mt-1">Platform Management</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-sm font-medium block">{user.full_name}</span>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded uppercase">{user.role}</span>
            </div>
            <button
              onClick={logout}
              className="text-sm border border-white px-4 py-2 rounded hover:bg-white hover:text-black transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1">
            {([
              { id: 'overview', label: 'Overview' },
              { id: 'studios', label: 'Studios' },
              { id: 'users', label: 'Users' },
              { id: 'bookings', label: 'Bookings' },
            ] as const).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-6 text-sm font-semibold uppercase tracking-wider transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-black text-black bg-gray-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Platform Overview</h2>
              <button onClick={fetchDashboardData} className="text-sm border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50">
                Refresh
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Revenue</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(stats.total_revenue)}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-full">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Bookings</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total_bookings.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-full">
                    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Users</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total_users.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-full">
                    <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Studios</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total_studios}</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-full">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                </div>
                <div className="p-6">
                  {activities.length > 0 ? (
                    <div className="space-y-4">
                      {activities.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0">
                          <div className="w-2 h-2 bg-black rounded-full mt-2"></div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{activity.action}</p>
                            <p className="text-sm text-gray-500">{activity.details}</p>
                            <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(activity.created_at)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No recent activity</p>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-lg shadow border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">Platform Health</h3>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Studio Approval Rate</span>
                      <span className="text-sm font-bold text-gray-900">75%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-black h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Booking Completion Rate</span>
                      <span className="text-sm font-bold text-gray-900">92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">User Retention</span>
                      <span className="text-sm font-bold text-gray-900">68%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      SystemStatus:{' '}
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-green-700 font-medium">Operational</span>
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'studios' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Studio Management</h2>
              <div className="flex gap-2">
                <button className="bg-black text-white px-4 py-2 text-sm font-medium rounded hover:bg-gray-800">Add Studio</button>
                <button className="border border-gray-300 px-4 py-2 text-sm rounded hover:bg-gray-50">Export CSV</button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Studio</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Owner</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">City</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Bookings</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Created</th>
                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {studios.length > 0 ? (
                        studios.map((studio) => (
                          <tr key={studio.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <p className="font-medium text-gray-900">{studio.name}</p>
                                <p className="text-sm text-gray-500">ID: {studio.id.slice(0, 8)}...</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{studio.owner_email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{studio.city || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(studio.status)}`}>
                                {studio.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{studio.bookings_count || 0}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(studio.created_at).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                              <button className="text-red-600 hover:text-red-900">Delete</button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                              />
                            </svg>
                            <p>No studios found</p>
                            <p className="text-sm mt-1">Add your first studio to get started</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">User Management</h2>
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">User Management</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                View all users, manage roles, ban accounts, and control permissions.
              </p>
              <button className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800">User Management Coming Soon</button>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">All Bookings</h2>
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Booking Management</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                View all bookings, manage cancellations, process refunds, and modify bookings as needed.
              </p>
              <button className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800">
                Booking Management Coming Soon
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;

