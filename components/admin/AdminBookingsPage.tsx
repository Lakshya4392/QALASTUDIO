import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Clock, XCircle, ChevronDown, ChevronUp, Phone, Mail, RefreshCw, Trash2, User, CreditCard, Hash } from 'lucide-react';
import { api } from '../../services/api';
import AdminDropdown from './AdminDropdown';

interface Booking {
  id: string;
  studioName: string;
  date: string;
  startTime: string;
  duration: string;
  userDetails: { name: string; email: string; phone: string };
  totalAmount: number;
  status: string;
  confirmationCode: string;
  bookedAt: string;
}

const getStatusConfig = (status: string) => {
  const s = status.toLowerCase();
  if (s === 'confirmed' || s === 'completed') return { 
    bg: 'bg-black text-white border-black', 
    icon: CheckCircle, 
    label: s.toUpperCase() 
  };
  if (s === 'pending' || s === 'pending_payment' || s === 'hold') return { 
    bg: 'bg-white text-black border-black', 
    icon: Clock, 
    label: s.toUpperCase().replace('_', ' ') 
  };
  return { 
    bg: 'bg-gray-100 text-gray-400 border-gray-200', 
    icon: XCircle, 
    label: s.toUpperCase() 
  };
};

const AdminBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.bookings.getAll({ limit: 200 });
      setBookings((res.bookings || []).map((b: any) => ({
        id: b.id,
        studioName: b.studioName || 'Unknown',
        date: b.date || '',
        startTime: b.startTime || '',
        duration: b.duration || '',
        userDetails: b.userDetails || { name: 'N/A', email: '', phone: '' },
        totalAmount: b.totalAmount || 0,
        status: (b.status || 'unknown').toLowerCase(),
        confirmationCode: b.confirmationCode || b.id?.substring(0, 8).toUpperCase(),
        bookedAt: b.bookedAt || '',
      })));
    } catch (e) {
      console.error('Failed to fetch bookings', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const backendStatus = status === 'pending' ? 'pending_payment' : status;
      await api.bookings.updateStatus(id, backendStatus);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    } catch (e) { alert('Failed to update status'); }
  };

  const deleteBooking = async (id: string) => {
    if (!confirm('Delete this booking permanently?')) return;
    try {
      await api.bookings.delete(id);
      setBookings(prev => prev.filter(b => b.id !== id));
    } catch (e) { alert('Failed to delete booking'); }
  };

  const filters = ['all', 'confirmed', 'pending_payment', 'cancelled', 'completed', 'hold'];
  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-black rounded-xl text-white">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">Reservations</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black leading-none uppercase tracking-tighter text-black">
            BOOKINGS
          </h1>
          <p className="text-black/60 text-sm mt-4 max-w-md font-medium tracking-wide">
            Oversee and manage all studio reservations. Update statuses or handle cancellations.
          </p>
        </div>
        <button 
          onClick={fetch} 
          className="group flex items-center gap-3 px-8 py-4 border-2 border-black text-black text-[11px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all duration-500 rounded-2xl shadow-sm hover:shadow-xl"
        >
          <RefreshCw className={`w-4 h-4 group-hover:rotate-180 transition-transform duration-700 ${loading ? 'animate-spin' : ''}`} /> 
          SYNC DATA
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-3 p-2 bg-black/5 rounded-[2rem]">
        {filters.map(f => (
          <button 
            key={f} 
            onClick={() => setFilter(f)}
            className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all duration-300 rounded-xl relative ${
              filter === f 
                ? 'bg-black text-white shadow-lg translate-y-[-2px]' 
                : 'bg-transparent text-black/40 hover:text-black hover:bg-white'
            }`}
          >
            {f === 'all' ? `ALL (${bookings.length})` : `${f.replace('_', ' ').toUpperCase()} (${bookings.filter(b => b.status === f).length})`}
            {filter === f && (
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Main List Container */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 bg-white border-2 border-black rounded-[2.5rem] shadow-xl">
            <div className="w-12 h-12 border-4 border-black/10 border-t-black rounded-full animate-spin mb-6" />
            <p className="text-black/40 text-[10px] font-black uppercase tracking-widest">Retrieving Secure Records</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 bg-white border-2 border-dashed border-black/20 rounded-[2.5rem]">
            <div className="w-20 h-20 bg-black/5 rounded-3xl flex items-center justify-center mb-6">
              <Calendar className="w-10 h-10 text-black/20" />
            </div>
            <p className="text-black/60 text-sm font-black uppercase tracking-widest">No matching records found</p>
            <p className="text-black/40 text-xs mt-2 uppercase tracking-wide">Adjust filters or check for new entries</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filtered.map((b, idx) => {
              const status = getStatusConfig(b.status);
              const isExpanded = expanded === b.id;
              
              return (
                <div 
                  key={b.id} 
                  className={`group bg-white border-2 transition-all duration-500 rounded-[2rem] animate-fade-in ${
                    isExpanded ? 'border-black shadow-2xl scale-[1.01]' : 'border-black/5 hover:border-black/20'
                  }`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* Summary Row */}
                  <div 
                    className="flex flex-col md:flex-row md:items-center gap-8 p-10 cursor-pointer" 
                    onClick={() => setExpanded(isExpanded ? null : b.id)}
                  >
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Studio</p>
                        <p className="font-black text-black text-lg uppercase tracking-tight leading-none">{b.studioName}</p>
                        <p className="text-[10px] text-black/40 font-bold uppercase tracking-widest">{b.duration}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Client</p>
                        <p className="font-black text-black text-sm uppercase tracking-wider">{b.userDetails.name}</p>
                        <p className="text-[10px] text-black/40 font-bold">{b.userDetails.phone}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Schedule</p>
                        <p className="font-black text-black text-sm uppercase tracking-widest">
                          {b.date ? new Date(b.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                        </p>
                        <p className="text-[10px] text-black/40 font-bold uppercase tracking-widest">{b.startTime}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Valuation</p>
                        <p className="font-black text-black text-3xl uppercase tracking-tighter leading-none">₹{b.totalAmount.toLocaleString('en-IN')}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 flex-shrink-0 pt-6 md:pt-0 border-t-2 md:border-0 border-black/5">
                      <span className={`inline-flex items-center gap-2 px-6 py-3 border-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-sm ${status.bg}`}>
                        <status.icon className="w-4 h-4" />
                        {status.label}
                      </span>
                      <div className={`p-4 rounded-full transition-all duration-300 ${isExpanded ? 'bg-black text-white rotate-0' : 'bg-black/5 text-black hover:bg-black/10'}`}>
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Detail View */}
                  {isExpanded && (
                    <div className="border-t-2 border-black/5 bg-black/[0.01] p-12 space-y-12 animate-fade-in">
                      <div className="grid md:grid-cols-3 gap-12">
                        {/* Client Card */}
                        <div className="space-y-6">
                           <div className="flex items-center gap-3">
                             <div className="p-3 bg-black/5 rounded-2xl"><User className="w-4 h-4" /></div>
                             <h4 className="text-sm font-black uppercase tracking-widest">Customer Protocol</h4>
                           </div>
                           <div className="bg-white p-8 rounded-3xl border-2 border-black/5 shadow-sm space-y-4">
                             <p className="text-xl font-black text-black uppercase tracking-tight">{b.userDetails.name}</p>
                             <div className="space-y-2">
                               <a href={`mailto:${b.userDetails.email}`} className="flex items-center gap-3 text-xs font-bold text-black/40 hover:text-black transition-colors uppercase tracking-widest">
                                 <Mail className="w-3.5 h-3.5" /> {b.userDetails.email}
                               </a>
                               <a href={`tel:${b.userDetails.phone}`} className="flex items-center gap-3 text-xs font-bold text-black/40 hover:text-black transition-colors uppercase tracking-widest">
                                 <Phone className="w-3.5 h-3.5" /> {b.userDetails.phone}
                               </a>
                             </div>
                           </div>
                        </div>

                        {/* Transaction Card */}
                        <div className="space-y-6">
                           <div className="flex items-center gap-3">
                             <div className="p-3 bg-black/5 rounded-2xl"><CreditCard className="w-4 h-4" /></div>
                             <h4 className="text-sm font-black uppercase tracking-widest">Reference Data</h4>
                           </div>
                           <div className="bg-white p-8 rounded-3xl border-2 border-black/5 shadow-sm space-y-4 text-xs font-bold uppercase tracking-widest">
                              <div className="flex justify-between items-center py-2 border-b border-black/5">
                                <span className="text-black/40">Confirmation</span>
                                <span className="p-2 bg-black text-white rounded-lg px-3 font-mono">{b.confirmationCode}</span>
                              </div>
                              <div className="flex justify-between items-center py-2 border-b border-black/5">
                                <span className="text-black/40">Session ID</span>
                                <span className="font-mono text-[9px] text-black/60 truncate max-w-[120px]">{b.id}</span>
                              </div>
                              <div className="flex justify-between items-center py-2">
                                <span className="text-black/40">Logged</span>
                                <span className="text-black">{b.bookedAt ? new Date(b.bookedAt).toLocaleString('en-IN', { hour12: true, timeStyle: 'short', dateStyle: 'short' }) : '—'}</span>
                              </div>
                           </div>
                        </div>

                        {/* Authority Actions */}
                        <div className="space-y-6">
                           <div className="flex items-center gap-3">
                             <div className="p-3 bg-black/5 rounded-2xl"><Hash className="w-4 h-4" /></div>
                             <h4 className="text-sm font-black uppercase tracking-widest">Administrative</h4>
                           </div>
                           <div className="space-y-4">
                             <AdminDropdown
                                value={b.status}
                                onChange={val => updateStatus(b.id, val)}
                                options={[
                                  { value: 'pending_payment', label: 'PENDING PAYMENT', icon: Clock },
                                  { value: 'confirmed', label: 'CONFIRMED', icon: CheckCircle },
                                  { value: 'completed', label: 'COMPLETED', icon: CheckCircle },
                                  { value: 'cancelled', label: 'CANCELLED', icon: XCircle },
                                  { value: 'hold', label: 'ON HOLD', icon: Clock },
                                ]}
                             />
                             <button 
                               onClick={() => deleteBooking(b.id)}
                               className="w-full flex items-center justify-center gap-3 px-8 py-5 border-2 border-red-100 text-red-600 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white hover:border-red-600 transition-all rounded-[1.5rem] shadow-sm hover:shadow-red-200"
                             >
                               <Trash2 className="w-4 h-4" /> PERMANENT DELETE
                             </button>
                           </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookingsPage;
