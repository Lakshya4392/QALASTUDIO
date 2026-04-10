import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { useUserAuth } from '../contexts/UserAuthContext';
import { Mail, Phone, User, LogOut, CalendarDays, ArrowRight, Loader2, CheckCircle, Clock, XCircle, TrendingUp } from 'lucide-react';

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
  bookedAt: string;
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  CONFIRMED: <CheckCircle className="w-3.5 h-3.5 text-green-500" />,
  PENDING_PAYMENT: <Clock className="w-3.5 h-3.5 text-yellow-500" />,
  CANCELLED: <XCircle className="w-3.5 h-3.5 text-red-400" />,
  COMPLETED: <CheckCircle className="w-3.5 h-3.5 text-blue-500" />,
  HOLD: <Clock className="w-3.5 h-3.5 text-orange-400" />,
};

const STATUS_COLOR: Record<string, string> = {
  CONFIRMED: 'text-green-600',
  PENDING_PAYMENT: 'text-yellow-600',
  CANCELLED: 'text-red-400',
  COMPLETED: 'text-blue-600',
  HOLD: 'text-orange-500',
  EXPIRED: 'text-neutral-400',
};

const ProfilePage: React.FC = () => {
  const { user, logout, isLoading } = useUserAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch(`${API_BASE}/users/me`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => setBookings(d.bookings || []))
      .catch(() => {})
      .finally(() => setLoadingBookings(false));
  }, [user]);

  const handleLogout = async () => { await logout(); navigate('/'); };

  if (isLoading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-black" />
    </div>
  );

  if (!user) return null;

  const initials = user.fullName
    ? user.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : user.email[0].toUpperCase();

  const confirmed = bookings.filter(b => b.status === 'CONFIRMED').length;
  const completed = bookings.filter(b => b.status === 'COMPLETED').length;
  const upcoming = bookings.filter(b => ['CONFIRMED', 'HOLD', 'PENDING_PAYMENT'].includes(b.status));
  const recentBookings = bookings.slice(0, 3);

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <>
      <SEO title="Profile — Qala Studios" description="Your Qala Studios account" />
      <div className="min-h-screen bg-[#f8f8f8] pt-32 pb-20">
        <div className="max-w-5xl mx-auto px-6 md:px-10">

          {/* Top header */}
          <div className="flex items-start justify-between mb-10">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400 block mb-2">Account</span>
              <h1 className="text-4xl md:text-6xl font-['Oswald'] font-bold uppercase tracking-tighter leading-none">Profile</h1>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-black transition-colors mt-2">
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">

            {/* Left — user card */}
            <div className="md:col-span-1 space-y-4">
              {/* Avatar card */}
              <div className="bg-white border border-black/8 p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-lg font-black">{initials}</span>
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-black uppercase tracking-tight leading-tight truncate">{user.fullName || 'User'}</h2>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mt-0.5">{user.role?.toLowerCase() || 'customer'}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-black/5">
                  <div className="flex items-center gap-3">
                    <Mail className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                    <p className="text-xs truncate text-neutral-600">{user.email}</p>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                      <p className="text-xs text-neutral-600">{user.phone}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <User className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                    <p className="text-xs text-neutral-600 capitalize">{user.role?.toLowerCase() || 'Customer'}</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-white border border-black/8 p-6">
                <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-4">Stats</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-neutral-50">
                    <p className="text-2xl font-black">{bookings.length}</p>
                    <p className="text-[9px] uppercase tracking-widest text-neutral-400 mt-0.5">Total</p>
                  </div>
                  <div className="text-center p-3 bg-green-50">
                    <p className="text-2xl font-black text-green-600">{confirmed}</p>
                    <p className="text-[9px] uppercase tracking-widest text-neutral-400 mt-0.5">Confirmed</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50">
                    <p className="text-2xl font-black text-blue-600">{completed}</p>
                    <p className="text-[9px] uppercase tracking-widest text-neutral-400 mt-0.5">Completed</p>
                  </div>
                  <div className="text-center p-3 bg-neutral-50">
                    <p className="text-2xl font-black">{upcoming.length}</p>
                    <p className="text-[9px] uppercase tracking-widest text-neutral-400 mt-0.5">Upcoming</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button onClick={() => navigate('/my-bookings')}
                  className="w-full flex items-center justify-between px-5 py-4 bg-white border border-black/8 hover:border-black transition-colors group">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="w-4 h-4 text-neutral-400" />
                    <span className="text-xs font-black uppercase tracking-widest">All Bookings</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                </button>
                <button onClick={() => navigate('/book')}
                  className="w-full flex items-center justify-between px-5 py-4 bg-black text-white hover:bg-neutral-800 transition-colors group">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-4 h-4 text-white/60" />
                    <span className="text-xs font-black uppercase tracking-widest">Book a Studio</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-white/40 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* Right — recent bookings */}
            <div className="md:col-span-2 space-y-4">
              <div className="bg-white border border-black/8 p-6">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Recent Bookings</p>
                  <button onClick={() => navigate('/my-bookings')}
                    className="text-[9px] font-black uppercase tracking-widest text-neutral-400 hover:text-black transition-colors">
                    View All →
                  </button>
                </div>

                {loadingBookings ? (
                  <div className="py-10 flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-neutral-300" />
                  </div>
                ) : recentBookings.length === 0 ? (
                  <div className="py-12 text-center">
                    <CalendarDays className="w-10 h-10 text-neutral-200 mx-auto mb-3" />
                    <p className="text-sm font-bold uppercase tracking-tight text-neutral-400 mb-1">No bookings yet</p>
                    <p className="text-xs text-neutral-300 mb-6">Your sessions will appear here</p>
                    <button onClick={() => navigate('/studios')}
                      className="px-5 py-2.5 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-all">
                      Browse Studios
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentBookings.map(b => (
                      <div key={b.id} className="flex items-center justify-between py-4 border-b border-black/5 last:border-0">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-10 h-10 bg-neutral-100 flex items-center justify-center flex-shrink-0">
                            <CalendarDays className="w-4 h-4 text-neutral-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-black uppercase tracking-tight truncate">{b.studioName}</p>
                            <p className="text-[10px] text-neutral-400 mt-0.5">{fmtDate(b.date)} · {b.startTime}–{b.endTime}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                          <div className="flex items-center gap-1.5">
                            {STATUS_ICON[b.status] || <Clock className="w-3.5 h-3.5 text-neutral-300" />}
                            <span className={`text-[9px] font-black uppercase tracking-widest ${STATUS_COLOR[b.status] || 'text-neutral-400'}`}>
                              {b.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-xs font-black">₹{b.totalAmount.toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upcoming highlight */}
              {upcoming.length > 0 && (
                <div className="bg-black text-white p-6">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-3">Next Session</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-black uppercase tracking-tight">{upcoming[0].studioName}</p>
                      <p className="text-sm text-white/60 mt-1">{fmtDate(upcoming[0].date)} · {upcoming[0].startTime}–{upcoming[0].endTime}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black">₹{upcoming[0].totalAmount.toLocaleString('en-IN')}</p>
                      <p className="text-[9px] text-white/40 uppercase tracking-widest mt-0.5">{upcoming[0].confirmationCode}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
