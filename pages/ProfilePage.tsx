import React, { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import { useUserAuth } from '../contexts/UserAuthContext';
import { api } from '../services/api';
import { Calendar, Mail, Phone, User, LogOut, Loader2, XCircle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Booking {
  id: string;
  studioName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  totalAmount: number;
  status: string;
  confirmationCode: string;
  specialRequirements?: string | null;
  bookedAt: string;
}

interface UserProfile {
  id: string;
  email: string;
  phone: string;
  role: string;
  fullName: string | null;
}

const ProfilePage: React.FC = () => {
  const { logout: authLogout } = useUserAuth();
  const [profile, setProfile] = useState<{ user: UserProfile; bookings: Booking[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelModal, setCancelModal] = useState<{
    bookingId: string; confirmationCode: string; studioName: string; date: string; amount: number;
  } | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await api.user.getMe();
      setProfile(data);
    } catch { /* handled by ProtectedUserRoute */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleCancelBooking = async () => {
    if (!cancelModal) return;
    setCancellingId(cancelModal.bookingId);
    setCancelModal(null);
    try {
      const res = await fetch(`${API_BASE}/bookings/${cancelModal.bookingId}/cancel`, {
        method: 'POST', credentials: 'include',
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed'); }
      await fetchProfile();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  const handleLogout = async () => { await authLogout(); window.location.href = '/'; };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const formatDateTime = (d: string) => new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const getStatusBadge = (status: string) => {
    const s: Record<string, string> = {
      CONFIRMED: 'bg-green-100 text-green-800 border-green-300',
      PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      CANCELLED: 'bg-red-100 text-red-800 border-red-300',
      COMPLETED: 'bg-blue-100 text-blue-800 border-blue-300',
      HOLD: 'bg-orange-100 text-orange-800 border-orange-300',
      EXPIRED: 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return s[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F4F4F4] flex items-center justify-center">
      <Loader2 className="w-12 h-12 animate-spin text-black" />
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen bg-[#F4F4F4] flex items-center justify-center">
      <div className="text-center"><h1 className="text-4xl font-bold mb-4">Profile not found</h1></div>
    </div>
  );

  const { user, bookings } = profile;

  return (
    <>
      <SEO title="My Profile - Qala Studios" description="View your bookings and profile" />
      <div className="min-h-screen bg-[#F4F4F4] py-20 px-6">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-5xl md:text-6xl font-['Oswald'] font-bold uppercase tracking-tight mb-2">MY PROFILE</h1>
              <p className="text-xl text-neutral-600">Manage your account and bookings</p>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-black text-black font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
              <LogOut className="w-5 h-5" /> Logout
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="md:col-span-1">
              <div className="bg-white border-4 border-black p-8 shadow-lg sticky top-8">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold uppercase tracking-tight">{user.fullName || 'Guest User'}</h2>
                  <p className="text-sm text-neutral-500 uppercase tracking-widest mt-1">{user.role?.toLowerCase() || 'customer'}</p>
                </div>
                <div className="space-y-4 border-t-2 border-black pt-6">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-neutral-500" />
                    <div><p className="text-xs font-bold uppercase text-neutral-500">Email</p><p className="text-sm font-medium break-all">{user.email}</p></div>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-neutral-500" />
                      <div><p className="text-xs font-bold uppercase text-neutral-500">Phone</p><p className="text-sm font-medium">{user.phone}</p></div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-neutral-500" />
                    <div><p className="text-xs font-bold uppercase text-neutral-500">Total Bookings</p><p className="text-lg font-bold">{bookings.length}</p></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bookings */}
            <div className="md:col-span-2">
              <div className="bg-white border-4 border-black shadow-lg">
                <div className="bg-black text-white px-8 py-6">
                  <h2 className="text-2xl font-['Oswald'] font-bold uppercase">Your Bookings</h2>
                  <p className="text-sm text-neutral-300 mt-1">{bookings.length} reservation{bookings.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="p-8">
                  {bookings.length === 0 ? (
                    <div className="text-center py-16">
                      <Calendar className="w-20 h-20 text-neutral-300 mx-auto mb-6" />
                      <h3 className="text-2xl font-bold mb-2">No bookings yet</h3>
                      <p className="text-neutral-600 mb-8">Book your studio session today!</p>
                      <a href="/book" className="inline-block px-8 py-4 bg-black text-white font-bold uppercase tracking-widest hover:bg-neutral-900 transition-colors">
                        Book a Studio
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {bookings.map(booking => (
                        <div key={booking.id} className="border-2 border-black rounded-lg overflow-hidden">
                          {/* Booking Header */}
                          <div className="bg-neutral-50 px-6 py-4 flex justify-between items-center border-b-2 border-black">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">CONFIRMATION CODE</p>
                              <p className="text-lg font-mono font-bold text-black">{booking.confirmationCode}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`inline-block px-4 py-2 text-sm font-bold uppercase border ${getStatusBadge(booking.status)}`}>
                                {booking.status.replace('_', ' ')}
                              </span>
                              {/* Cancel button */}
                              {['CONFIRMED', 'PENDING_PAYMENT', 'HOLD'].includes(booking.status) && (
                                <button
                                  onClick={() => setCancelModal({
                                    bookingId: booking.id,
                                    confirmationCode: booking.confirmationCode,
                                    studioName: booking.studioName,
                                    date: booking.date,
                                    amount: booking.totalAmount,
                                  })}
                                  disabled={cancellingId === booking.id}
                                  className="flex items-center gap-1.5 px-4 py-2 border-2 border-red-300 text-red-600 text-xs font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white hover:border-red-600 transition-all disabled:opacity-50"
                                >
                                  {cancellingId === booking.id
                                    ? <span className="w-3 h-3 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                                    : <XCircle className="w-3 h-3" />}
                                  Cancel
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Booking Details */}
                          <div className="p-6">
                            <div className="grid md:grid-cols-2 gap-8 mb-6">
                              <div>
                                <h3 className="text-lg font-bold uppercase tracking-tight mb-4">Booking Details</h3>
                                <div className="space-y-3">
                                  <div><p className="text-xs font-bold uppercase text-neutral-500">Studio</p><p className="text-lg font-bold">{booking.studioName}</p></div>
                                  <div><p className="text-xs font-bold uppercase text-neutral-500">Date</p><p className="text-lg font-bold">{formatDate(booking.date)}</p></div>
                                  <div><p className="text-xs font-bold uppercase text-neutral-500">Time</p><p className="text-lg font-bold">{booking.startTime} - {booking.endTime}</p></div>
                                  <div><p className="text-xs font-bold uppercase text-neutral-500">Duration</p><p className="text-lg font-bold">{booking.duration}</p></div>
                                </div>
                              </div>
                              <div>
                                <h3 className="text-lg font-bold uppercase tracking-tight mb-4">Amount</h3>
                                <div className="bg-neutral-100 p-6 rounded-lg mb-4">
                                  <p className="text-xs font-bold uppercase text-neutral-500 mb-2">Total Price</p>
                                  <p className="text-4xl font-black">₹{booking.totalAmount.toLocaleString('en-IN')}</p>
                                </div>
                                {booking.specialRequirements && (
                                  <div>
                                    <p className="text-xs font-bold uppercase text-neutral-500 mb-2">Special Requirements</p>
                                    <p className="text-sm bg-amber-50 border-2 border-amber-200 p-4 rounded">{booking.specialRequirements}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="border-t-2 border-black pt-4 flex items-center justify-between">
                              <div><p className="text-xs font-bold uppercase tracking-widest text-neutral-500">BOOKED ON</p><p className="text-sm">{formatDateTime(booking.bookedAt)}</p></div>
                              <div className="text-right"><p className="text-xs font-bold uppercase tracking-widest text-neutral-500">BOOKING ID</p><p className="text-sm font-mono text-neutral-600">{booking.id.substring(0, 12)}...</p></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {cancelModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCancelModal(null)} />
          <div className="relative w-full max-w-md bg-white border-4 border-black shadow-2xl">
            <div className="bg-black text-white px-8 py-6 flex items-center gap-3">
              <XCircle className="w-6 h-6 text-red-400" />
              <h3 className="text-xl font-bold uppercase tracking-tight">Cancel Booking</h3>
            </div>
            <div className="px-8 py-6 space-y-5">
              <p className="text-neutral-600 text-sm leading-relaxed">
                Are you sure you want to cancel this booking? This action <strong>cannot be undone</strong>.
              </p>
              <div className="bg-neutral-50 border-2 border-neutral-200 p-5 space-y-3">
                {[
                  { label: 'Studio', value: cancelModal.studioName },
                  { label: 'Date', value: new Date(cancelModal.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
                  { label: 'Amount', value: `₹${cancelModal.amount.toLocaleString('en-IN')}` },
                  { label: 'Code', value: cancelModal.confirmationCode },
                ].map(row => (
                  <div key={row.label} className="flex justify-between text-sm">
                    <span className="text-neutral-500 font-bold uppercase tracking-wider text-xs">{row.label}</span>
                    <span className="font-bold text-black font-mono">{row.value}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-neutral-500 bg-amber-50 border border-amber-200 p-3">
                ⚠️ Cancellations less than 48 hours before the session may not be eligible for a refund.
              </p>
            </div>
            <div className="px-8 pb-8 flex gap-4">
              <button onClick={() => setCancelModal(null)}
                className="flex-1 py-4 border-2 border-black text-black font-bold uppercase tracking-widest text-xs hover:bg-neutral-50 transition-all">
                Keep Booking
              </button>
              <button onClick={handleCancelBooking}
                className="flex-1 py-4 bg-red-600 text-white font-bold uppercase tracking-widest text-xs hover:bg-red-700 transition-all">
                Yes, Cancel It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePage;
