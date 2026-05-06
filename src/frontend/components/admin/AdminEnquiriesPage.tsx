import React, { useState, useEffect } from 'react';
import { MessageSquare, Mail, Phone, RefreshCw, ChevronDown, ChevronUp, Clock, CheckCircle, XCircle, Eye, Trash2, User, Globe, MessageCircle } from 'lucide-react';
import { api } from '../../services/api';
import AdminDropdown from './AdminDropdown';

interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'closed' | 'spam';
  submittedAt: string;
}

const getStatusConfig = (status: string) => {
  const s = status.toLowerCase();
  if (s === 'new') return { bg: 'bg-black text-white border-black', icon: Eye, label: 'NEW' };
  if (s === 'replied') return { bg: 'bg-green-500 text-white border-green-500', icon: CheckCircle, label: 'REPLIED' };
  if (s === 'read') return { bg: 'bg-white text-black border-black/10', icon: Clock, label: 'READ' };
  return { bg: 'bg-gray-100 text-gray-400 border-gray-200', icon: XCircle, label: s.toUpperCase() };
};

const AdminEnquiriesPage: React.FC = () => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.enquiries.getAll({ limit: 200 });
      setEnquiries((res.enquiries || []).map((e: any) => ({
        id: e.id,
        name: e.name || 'N/A',
        email: e.email || '',
        phone: e.phone || '',
        subject: e.subject || '',
        message: e.message || '',
        status: (e.status || 'new').toLowerCase() as Enquiry['status'],
        submittedAt: e.submitted_at || e.submittedAt || '',
      })));
    } catch (err) {
      console.error('Failed to fetch enquiries', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleExpand = async (id: string) => {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    const enq = enquiries.find(e => e.id === id);
    if (enq?.status === 'new') {
      try {
        await api.enquiries.updateStatus(id, 'read');
        setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status: 'read' } : e));
      } catch {}
    }
  };

  const updateStatus = async (id: string, status: any) => {
    try {
      await api.enquiries.updateStatus(id, status);
      setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status: status as Enquiry['status'] } : e));
    } catch { alert('Failed to update status'); }
  };

  const deleteEnquiry = async (id: string) => {
    if (!confirm('Delete this enquiry permanently?')) return;
    try {
      await api.enquiries.delete(id);
      setEnquiries(prev => prev.filter(e => e.id !== id));
      if (expanded === id) setExpanded(null);
    } catch { alert('Failed to delete enquiry'); }
  };

  const filters = ['all', 'new', 'read', 'replied', 'closed', 'spam'];
  const filtered = filter === 'all' ? enquiries : enquiries.filter(e => e.status === filter);

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-black rounded-xl text-white">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">Incoming Messages</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black leading-none uppercase tracking-tighter text-black">
            ENQUIRIES
          </h1>
          <p className="text-black/60 text-sm mt-4 max-w-md font-medium tracking-wide">
            Handle studio enquiries and feedback from potential clients. Match the editorial standard.
          </p>
        </div>
        <button 
          onClick={load} 
          className="group flex items-center gap-3 px-8 py-4 border-2 border-black text-black text-[11px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all duration-500 rounded-2xl shadow-sm hover:shadow-xl"
        >
          <RefreshCw className={`w-4 h-4 group-hover:rotate-180 transition-transform duration-700 ${loading ? 'animate-spin' : ''}`} /> 
          SYNC MESSAGES
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
            {f === 'all' ? `ALL (${enquiries.length})` : `${f.toUpperCase()} (${enquiries.filter(e => e.status === f).length})`}
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
            <p className="text-black/40 text-[10px] font-black uppercase tracking-widest">Accessing Encrypted Inbox</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 bg-white border-2 border-dashed border-black/20 rounded-[2.5rem]">
            <div className="w-20 h-20 bg-black/5 rounded-3xl flex items-center justify-center mb-6">
              <MessageSquare className="w-10 h-10 text-black/20" />
            </div>
            <p className="text-black/60 text-sm font-black uppercase tracking-widest">Inbox is currently empty</p>
            <p className="text-black/40 text-xs mt-2 uppercase tracking-wide">Messages will appear here once submitted</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filtered.map((e, idx) => {
              const status = getStatusConfig(e.status);
              const isExpanded = expanded === e.id;
              
              return (
                <div 
                  key={e.id} 
                  className={`group bg-white border-2 transition-all duration-500 rounded-[2rem] animate-fade-in ${
                    isExpanded ? 'border-black shadow-2xl scale-[1.01]' : (e.status === 'new' ? 'border-black shadow-lg' : 'border-black/5 hover:border-black/20')
                  }`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* Summary Row */}
                  <div 
                    className="flex flex-col md:flex-row md:items-center gap-8 p-10 cursor-pointer" 
                    onClick={() => handleExpand(e.id)}
                  >
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8">
                      <div className="space-y-2 relative">
                        {e.status === 'new' && <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-2 h-2 bg-black rounded-full animate-pulse" />}
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Sender</p>
                        <p className="font-black text-black text-lg uppercase tracking-tight leading-none truncate">{e.name}</p>
                        <p className="text-[10px] text-black/40 font-bold uppercase tracking-widest truncate">{e.email}</p>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Subject / Matter</p>
                        <p className="font-black text-black text-sm uppercase tracking-wider truncate">{e.subject}</p>
                        <p className="text-[10px] text-black/40 font-bold">{e.phone}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Timestamp</p>
                        <p className="font-black text-black text-sm uppercase tracking-widest leading-none">
                          {e.submittedAt ? new Date(e.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                        </p>
                        <p className="text-[10px] text-black/40 font-bold uppercase tracking-widest">
                          {e.submittedAt ? new Date(e.submittedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </p>
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
                      <div className="grid md:grid-cols-12 gap-12">
                        
                        {/* Message Content */}
                        <div className="md:col-span-8 space-y-8">
                           <div className="flex items-center gap-3">
                             <div className="p-3 bg-black/5 rounded-2xl"><MessageCircle className="w-4 h-4" /></div>
                             <h4 className="text-sm font-black uppercase tracking-widest">Client Message</h4>
                           </div>
                           <div className="bg-white p-10 rounded-[2.5rem] border-2 border-black/5 shadow-2xl relative">
                              <div className="absolute top-0 right-0 p-8 border-r-2 border-t-2 border-black/[0.03] w-24 h-24 rounded-tr-[2.5rem] -z-0" />
                              <p className="relative z-10 text-lg font-medium text-black/80 leading-relaxed tracking-tight whitespace-pre-wrap uppercase">
                                {e.message}
                              </p>
                           </div>
                           <div className="flex flex-wrap gap-4">
                             <a href={`mailto:${e.email}?subject=Re: ${encodeURIComponent(e.subject)}`}
                               onClick={() => e.status === 'read' && updateStatus(e.id, 'replied')}
                               className="flex items-center gap-3 px-8 py-4 bg-black text-white text-[11px] font-black uppercase tracking-widest hover:shadow-2xl transition-all rounded-2xl group shadow-black/20"
                             >
                               <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" /> START CORRESPONDENCE
                             </a>
                             <a href={`tel:${e.phone}`}
                               className="flex items-center gap-3 px-8 py-4 border-2 border-black text-black text-[11px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all rounded-2xl group"
                             >
                               <Phone className="w-4 h-4 group-hover:rotate-12 transition-transform" /> CALL {e.phone}
                             </a>
                           </div>
                        </div>

                        {/* Authority Actions */}
                        <div className="md:col-span-4 space-y-8">
                           <div className="space-y-6">
                              <div className="flex items-center gap-3">
                                <div className="p-3 bg-black/5 rounded-2xl"><User className="w-4 h-4" /></div>
                                <h4 className="text-sm font-black uppercase tracking-widest">Profile Records</h4>
                              </div>
                              <div className="bg-white p-8 rounded-3xl border-2 border-black/5 shadow-sm space-y-4 font-bold uppercase tracking-widest text-[10px]">
                                 <div className="flex justify-between items-center py-2 border-b border-black/5">
                                   <span className="text-black/40">Verified Name</span>
                                   <span className="text-black">{e.name}</span>
                                 </div>
                                 <div className="flex justify-between items-center py-2 border-b border-black/5">
                                   <span className="text-black/40">Communications</span>
                                   <span className="text-black lowercase">{e.email}</span>
                                 </div>
                                 <div className="flex justify-between items-center py-2">
                                   <span className="text-black/40">Access Code</span>
                                   <span className="font-mono text-black font-black">{e.id.substring(0, 8).toUpperCase()}</span>
                                 </div>
                              </div>
                           </div>

                           <div className="space-y-6">
                              <div className="flex items-center gap-3">
                                <div className="p-3 bg-black/5 rounded-2xl"><Globe className="w-4 h-4" /></div>
                                <h4 className="text-sm font-black uppercase tracking-widest">Protocol Status</h4>
                              </div>
                              <div className="space-y-4">
                                <AdminDropdown
                                  value={e.status}
                                  onChange={(val) => updateStatus(e.id, val)}
                                  options={[
                                    { value: 'new', label: 'NEW', icon: MessageSquare },
                                    { value: 'read', label: 'READ', icon: Clock },
                                    { value: 'replied', label: 'REPLIED', icon: CheckCircle },
                                    { value: 'closed', label: 'CLOSED', icon: XCircle },
                                    { value: 'spam', label: 'SPAM', icon: Trash2 },
                                  ]}
                                />
                                <button 
                                  onClick={() => deleteEnquiry(e.id)}
                                  className="w-full flex items-center justify-center gap-3 px-8 py-5 border-2 border-red-50 text-red-600 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white hover:border-red-600 transition-all rounded-[1.5rem] shadow-sm hover:shadow-red-200"
                                >
                                  <Trash2 className="w-4 h-4" /> PURGE RECORD
                                </button>
                              </div>
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

export default AdminEnquiriesPage;
