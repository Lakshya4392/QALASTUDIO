import React, { useState } from 'react';
import SEO from '../components/SEO';
import { api } from '../services/api';

const MyBookingsPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBookings([]);
    setSearched(true);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const res = await fetch(`${API_BASE}/users/my-bookings?email=${encodeURIComponent(email)}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'No bookings found');
      }
      const data = await res.json();
      setBookings(data.bookings);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <SEO
        title="My Bookings"
        description="View your studio bookings at Qala Studios"
      />
      <div className="min-h-screen bg-[#F4F4F4] py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-['Oswald'] font-bold uppercase tracking-tight mb-4">
              MY BOOKINGS
            </h1>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Enter your email address to view all your studio reservations.
              You'll see booking details, confirmation codes, and schedule information.
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white border-4 border-black p-8 mb-12 shadow-lg">
            <form onSubmit={handleSearch} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-bold uppercase tracking-widest text-neutral-500 mb-3">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=" Enter your registered email"
                  className="w-full px-6 py-4 border-2 border-black text-lg bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-black text-white font-bold uppercase tracking-widest hover:bg-neutral-900 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Loading...
                  </span>
                ) : (
                  'View My Bookings'
                )}
              </button>
            </form>
          </div>

          {/* Error */}
          {error && searched && (
            <div className="bg-red-50 border-2 border-red-200 p-6 mb-8 text-center">
              <p className="text-red-700 font-bold text-lg">{error}</p>
              <p className="text-red-600 mt-2">Please check your email and try again.</p>
            </div>
          )}

          {/* Results */}
          {bookings.length > 0 && (
            <div className="space-y-6">
              <div className="bg-white border-2 border-black p-4 mb-6">
                <p className="text-sm font-bold uppercase tracking-wider text-neutral-500">
                  Found {bookings.length} booking{bookings.length !== 1 ? 's' : ''} for {email}
                </p>
              </div>

              {bookings.map((booking) => (
                <div key={booking.id} className="bg-white border-4 border-black overflow-hidden shadow-lg">
                  {/* Header */}
                  <div className="bg-black text-white px-8 py-4 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-neutral-300">CONFIRMATION CODE</p>
                      <p className="text-2xl font-mono font-bold">{booking.confirmationCode}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold uppercase tracking-widest text-neutral-300">STATUS</p>
                      <p className={`text-lg font-bold ${booking.status === 'CONFIRMED' ? 'text-green-400' : booking.status === 'PENDING_PAYMENT' ? 'text-yellow-400' : 'text-red-400'}`}>
                        {booking.status.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-8">
                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                      <div>
                        <h3 className="text-lg font-bold uppercase tracking-tight mb-4">Booking Details</h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-bold uppercase text-neutral-500">Studio</p>
                            <p className="text-xl font-bold">{booking.studioName}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase text-neutral-500">Date</p>
                            <p className="text-lg font-bold">{formatDate(booking.date)}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase text-neutral-500">Time</p>
                            <p className="text-lg font-bold">
                              {booking.startTime} - {booking.endTime}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase text-neutral-500">Duration</p>
                            <p className="text-lg font-bold">{booking.duration}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold uppercase tracking-tight mb-4">Amount</h3>
                        <div className="bg-neutral-100 p-6 rounded-lg">
                          <p className="text-xs font-bold uppercase text-neutral-500 mb-2">Total Price</p>
                          <p className="text-4xl font-black">₹{booking.totalAmount.toLocaleString('en-IN')}</p>
                        </div>
                        {booking.specialRequirements && (
                          <div className="mt-6">
                            <p className="text-xs font-bold uppercase text-neutral-500 mb-2">Special Requirements</p>
                            <p className="text-sm bg-amber-50 border-2 border-amber-200 p-4 rounded">
                              {booking.specialRequirements}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border-t-2 border-black pt-6">
                      <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                        BOOKED ON
                      </p>
                      <p className="text-sm mt-1">
                        {new Date(booking.bookedAt).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyBookingsPage;
