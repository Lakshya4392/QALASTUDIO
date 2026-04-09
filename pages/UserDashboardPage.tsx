import React, { useState } from 'react';
import { useAuth } from '../services/auth-context';

const UserDashboardPage: React.FC = () => {
  const { user, logout, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'bookings' | 'favorites'>('profile');
  const [profile, setProfile] = useState({ full_name: user?.full_name || '', phone: user?.phone || '' });
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(profile);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.hash = '#/';
  };

  // Mock data - will be replaced with real API calls
  const upcomingBookings = [
    { id: '1', studio_name: 'Prestige Studio', date: '2026-03-30', time: '10:00 AM', duration: '2 hours' },
    { id: '2', studio_name: 'Royal Labs', date: '2026-04-05', time: '3:00 PM', duration: '4 hours' },
  ];

  const favoriteStudios = [
    { id: '1', name: 'Prestige Studio', city: 'Mumbai', rating: 4.8 },
    { id: '2', name: 'Green Screen Hub', city: 'Bangalore', rating: 4.5 },
  ];

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Please login to access dashboard</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <div className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">My Dashboard</h1>
            <p className="text-sm text-gray-300 mt-1">Welcome back, {user.full_name}!</p>
          </div>
          <button
            onClick={handleLogout}
            className="border border-white px-4 py-2 text-sm font-medium uppercase tracking-wider hover:bg-white hover:text-black"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8">
            {(['profile', 'bookings', 'favorites'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 border-b-2 text-sm font-medium uppercase tracking-wider ${
                  activeTab === tab ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message.text && (
          <div
            className={`p-4 rounded mb-6 ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
            <h2 className="text-xl font-bold mb-6">Profile Settings</h2>
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Type</label>
                <div className="mt-1">
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded uppercase">{user.role}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Verified</label>
                <div className="mt-1">
                  {user.email_verified ? (
                    <span className="text-green-600 text-sm">✓ Verified</span>
                  ) : (
                    <span className="text-yellow-600 text-sm">⚠ Not verified</span>
                  )}
                </div>
              </div>
              <button type="submit" className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
                Save Changes
              </button>
            </form>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div>
            <h2 className="text-xl font-bold mb-6">Upcoming Bookings</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {upcomingBookings.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Studio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {upcomingBookings.map((booking) => (
                      <tr key={booking.id}>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">{booking.studio_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{booking.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{booking.time}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{booking.duration}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                          <button className="text-red-600 hover:text-red-900">Cancel</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-gray-500">No upcoming bookings</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'favorites' && (
          <div>
            <h2 className="text-xl font-bold mb-6">Favorite Studios</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteStudios.map((studio) => (
                <div key={studio.id} className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-bold text-lg mb-1">{studio.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{studio.city}</p>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-yellow-400">★</span>
                    <span className="text-sm">{studio.rating}</span>
                  </div>
                  <button className="w-full border border-black py-2 text-sm uppercase tracking-wider hover:bg-black hover:text-white">
                    View Studio
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboardPage;

