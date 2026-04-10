import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { useUserAuth } from '../contexts/UserAuthContext';
import { Calendar, XCircle, Loader2, ArrowRight, RefreshCw, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import BookingModal from '../components/BookingModal';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Booking {
  id: string;
  studioName: string;
  studioId?: string;
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

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  CONFIRMED:       { label: 'Confirmed',       color: 'text-green-700',  bg: 'bg-green-50 border-green-200',   icon: <CheckCircle className="w-3.5 h-3.5" /> },
  PENDING_PAYMENT: { label: 'Pending Payment', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200', icon: <Clock className="w-3.5 h-3.5" /> },
  HOLD:            { label: 'On Hold',         color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', icon: <Clock className="w-3.5 h-3.5" /> },
  COMPLETED:       { label: 'Completed',       color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200',     icon: <CheckCircle className="w-3.5 h-3.5" /> },
  CANCELLED:       { label: 'Cancelled',       color: 'text-red-600',    bg: 'bg-red-50 border-red-200',       icon: <XCircle className="w-3.5 h-3.5" /> },
  EXPIRED:         { label: 'Expired',         color: 'text-neutral-500',bg: 'bg-neutral-100 border-neutral-200', icon: <AlertCircle className="w-3.5 h-3.5" /> },
};

type FilterType = 'ALL' | 'UPCOMING' | 'PAST';

const MyBookingsPage: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading, user } = useUserAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelModal, setCancelModal] = useState<Booking | null>(null);
  const [rebookStudio, setRebookStudio] = useState<{ id: string; name: string } | null>(null);

  const fetchBookings = () => {
    if (!isAuthenticated) { setLoading(false); return; }
    setLoading(true);
    fetch(`${API_BASE}/users/me`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => setBookings(d.bookings || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (authLoading) return;
    fetchBookings();
  }, [isAuthenticated, authLoading]);

  const handleCancel = async () => {
    if (!cancelModal) return;
    setCancellingId(cancelModal.id);
    setCancelModal(null);
    try {
      const res = await fetch(`${API_BASE}/bookings/${cancelModal.id}/cancel`, { method: 'POST', credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      setBookings(prev => prev.map(b => b.id === cancelModal.id ? { ...b, status: 'CANCELLED' } : b));
    } catch { alert('Failed to cancel booking'); }
    finally { setCancellingId(null); }
  };

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const fmtBooked = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const isUpcoming = (b: Booking) => ['CONFIRMED', 'HOLD', 'PENDING_PAYMENT'].includes(b.status);
  const isPast = (b: Booking) => ['COMPLETED', 'CANCELLED', 'EXPIRED'].includes(b.status);

  const filtered = bookings.filter(b => {
    if (filter === 'UPCOMING') return isUpcoming(b);
    if (filter === 'PAST') return isPast(b);
    return true;
  });

  const upcomingCount = bookings.filter(isUpcoming).length;
  const pastCount = bookings.filter(isPast).length;

  if (authLoading || (loading && isAuthenticated)) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-black" />
    </div>
  );

  if (!isAuthenticated) return (
    <>
      <SEO title="My Bookings — Qala Studios" description="View your studio bookings" />
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-['Oswald'] font-bold uppercase tracking-tight mb-3">My Bookings</h1>
          <p className="text-neutral-500 text-sm mb-8 leading-relaxed">Sign in to view and manage your studio reservations.</p>
          <button onClick={() => navigate('/login', { state: { from: '/my-bookings' } })}
            className="inline-flex items-center gap-3 px-8 py-4 bg-black text-white text-xs font-black uppercase tracking-widest hover:bg-neutral-800 transition-all">
            Sign In <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <SEO title="My Bookings — Qala Studios" description="View your studio bookings" />
      <div className="min-h-screen bg-[#f8f8f8] pt-32 pb-20 px-6 md:px-16">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="flex items-start justify-between mb-10">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400 block mb-2">Account</span>
              <h1 className="text-4xl md:text-6xl font-['Oswald'] font-bold uppercase tracking-tighter leading-none">My Bookings</h1>
              {user && <p className="mt-2 text-xs text-neutral-400">{user.email}</p>}
            </div>
            <button onClick={fetchBookings}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-black transition-colors mt-2">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-0 mb-8 border-b border-black/10">
            {([
              { key: 'ALL', label: `All (${bookings.length})` },
              { key: 'UPCOMING', label: `Upcoming (${upcomingCount})` },
              { key: 'PAST', label: `Past (${pastCount})` },
            ] as { key: FilterType; label: string }[]).map(tab => (
              <button key={tab.key} onClick={() => setFilter(tab.key)}
                className={`px-5 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 -mb-px transition-all ${
                  filter === tab.key ? 'border-black text-black' : 'border-transparent text-neutral-400 hover:text-black'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="py-24 text-center bg-white border border-black/8">
              <Calendar className="w-10 h-10 text-neutral-200 mx-auto mb-4" />
              <p className="text-sm font-bold uppercase tracking-tight text-neutral-400 mb-1">
                {filter === 'UPCOMING' ? 'No upcoming bookings' : filter === 'PAST' ? 'No past bookings' : 'No bookings yet'}
              </p>
              <p className="text-xs text-neutral-300 mb-8">Your studio sessions will appear here.</p>
              <button onClick={() => navigate('/studios')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-xs font-black uppercase tracking-widest hover:bg-neutral-800 transition-all">
                Browse Studios <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(b => {
                const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.EXPIRED;
                const canCancel = ['CONFIRMED', 'PENDING_PAYMENT', 'HOLD'].includes(b.status);
                const canRebook = ['COMPLETED', 'CANCELLED', 'EXPIRED'].includes(b.status);

                return (
                  <div key={b.id} className="bg-white border border-black/8 hover:border-black/20 transition-colors">
                    {/* Status bar */}
                    <div className={`flex items-center justify-between px-5 py-3 border-b ${cfg.bg}`}>
                      <div className="flex items-center gap-2">
                        <span className={cfg.color}>{cfg.icon}</span>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${cfg.color}`}>{cfg.label}</span>
                        <span className="text-[9px] text-neutral-400 font-mono ml-2">{b.confirmationCode}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {canRebook && b.studioId && (
                          <button
                            onClick={() => setRebookStudio({ id: b.studioId!, name: b.studioName })}
                            className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-black hover:text-neutral-600 transition-colors"
                          >
                            <RefreshCw className="w-3 h-3" /> Rebook
                          </button>
                        )}
                        {canCancel && (
                          <button
                            onClick={() => setCancelModal(b)}
                            disabled={cancellingId === b.id}
                            className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
                          >
                            {cancellingId === b.id
                              ? <span className="w-3 h-3 border border-red-300 border-t-red-500 rounded-full animate-spin" />
                              : <XCircle className="w-3 h-3" />}
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Body */}
                    <div className="px-5 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="col-span-2 md:col-span-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-1">Studio</p>
                        <p className="font-black text-sm uppercase tracking-tight leading-tight">{b.studioName}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-1">Date</p>
                        <p className="font-semibold text-sm">{fmtDate(b.date)}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-1">Time</p>
                        <p className="font-semibold text-sm">{b.startTime} – {b.endTime}</p>
                        <p className="text-[9px] text-neutral-400">{b.duration}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-1">Amount</p>
                        <p className="font-black text-lg">₹{b.totalAmount.toLocaleString('en-IN')}</p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-2.5 border-t border-black/5 flex items-center justify-between">
                      <p className="text-[9px] text-neutral-400 uppercase tracking-widest">Booked {fmtBooked(b.bookedAt)}</p>
                      {b.specialRequirements && (
                        <p className="text-[9px] text-neutral-400 italic truncate max-w-xs">"{b.specialRequirements}"</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Book new CTA */}
          <div className="mt-10 pt-8 border-t border-black/8 flex items-center justify-between">
            <p className="text-xs text-neutral-400">Need a new session?</p>
            <button onClick={() => navigate('/book')}
              className="flex items-center gap-2 px-6 py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-all">
              Book a Studio <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Cancel modal */}
      {cancelModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCancelModal(null)} />
          <div className="relative w-full max-w-sm bg-white shadow-2xl">
            <div className="px-7 py-5 border-b border-black/8">
              <h3 className="text-base font-black uppercase tracking-tight">Cancel Booking</h3>
              <p className="text-[10px] text-neutral-400 mt-0.5">This cannot be undone</p>
            </div>
            <div className="px-7 py-5 space-y-3">
              {[
                { label: 'Studio', value: cancelModal.studioName },
                { label: 'Date', value: fmtDate(cancelModal.date) },
                { label: 'Time', value: `${cancelModal.startTime} – ${cancelModal.endTime}` },
                { label: 'Amount', value: `₹${cancelModal.totalAmount.toLocaleString('en-IN')}` },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">{row.label}</span>
                  <span className="font-bold text-xs">{row.value}</span>
                </div>
              ))}
              <p className="text-[9px] text-neutral-400 pt-3 border-t border-black/5">
                ⚠ Cancellations within 48 hours may not be eligible for a refund.
              </p>
            </div>
            <div className="px-7 pb-7 flex gap-3">
              <button onClick={() => setCancelModal(null)}
                className="flex-1 py-3 border border-black/15 text-xs font-black uppercase tracking-widest hover:border-black transition-all">
                Keep
              </button>
              <button onClick={handleCancel}
                className="flex-1 py-3 bg-red-600 text-white text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-all">
                Cancel It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rebook modal */}
      {rebookStudio && (
        <BookingModal
          studioId={rebookStudio.id}
          studioName={rebookStudio.name}
          onClose={() => { setRebookStudio(null); fetchBookings(); }}
        />
      )}
    </>
  );
};

export default MyBookingsPage;
