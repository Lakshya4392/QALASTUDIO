import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Power, X, RefreshCw, ChevronDown, ChevronUp, Building2, Save, Image as ImageIcon, Sparkles, Layout } from 'lucide-react';
import { api } from '../../services/api';
import ImageUpload from './ImageUpload';

const API_BASE = import.meta.env.VITE_API_URL || 'https://qalastudio.onrender.com/api';

interface Studio {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: string;
  priceNote: string;
  image: string;
  features: string[];
  isActive: boolean;
  order: number;
}

const Inp: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (p) => (
  <input {...p} className={`w-full px-5 py-4 border-2 border-black/10 rounded-2xl focus:border-black focus:ring-4 focus:ring-black/5 outline-none text-sm font-bold uppercase tracking-wide transition-all bg-black/5 hover:bg-black/[0.08] ${p.className || ''}`} />
);

const Txta: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (p) => (
  <textarea {...p} className="w-full px-5 py-4 border-2 border-black/10 rounded-2xl focus:border-black focus:ring-4 focus:ring-black/5 outline-none text-sm resize-none font-bold uppercase tracking-wide transition-all bg-black/5 hover:bg-black/[0.08]" />
);

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-black/40 mb-2">{children}</label>
);

interface StudioFormProps {
  studio: Studio | null;
  onSubmit: (d: any) => void;
  onCancel: () => void;
  uploadedStudioImages: any[];
  fetchStudioImages: () => void;
}

const StudioForm: React.FC<StudioFormProps> = ({ studio, onSubmit, onCancel, uploadedStudioImages, fetchStudioImages }) => {
  const [d, setD] = useState({
    name: studio?.name || '', tagline: studio?.tagline || '',
    description: studio?.description || '', price: studio?.price || '',
    priceNote: studio?.priceNote || 'per hour', image: studio?.image || '',
    features: studio?.features || [], isActive: studio?.isActive ?? true,
  });
  const [feat, setFeat] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchStudioImages(); }, [fetchStudioImages]);

  const addFeat = () => {
    if (feat.trim() && d.features.length < 15) { 
      setD({ ...d, features: [...d.features, feat.trim().toUpperCase()] }); 
      setFeat(''); 
    }
  };

  return (
    <form onSubmit={async (e) => { e.preventDefault(); setSaving(true); await onSubmit(d); setSaving(false); }} className="space-y-10">
      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <h4 className="text-xl font-black uppercase tracking-wider text-black flex items-center gap-3">
            <div className="w-1.5 h-8 bg-black rounded-full" />
            IDENTIFICATION
          </h4>
          <div className="space-y-6 bg-black/[0.02] p-8 rounded-[2rem] border-2 border-black/5">
            <div><Label>Full Studio Name *</Label><Inp value={d.name} onChange={e => setD({ ...d, name: e.target.value })} required /></div>
            <div><Label>Editorial Tagline</Label><Inp value={d.tagline} onChange={e => setD({ ...d, tagline: e.target.value })} /></div>
            <div><Label>Studio Description</Label><Txta rows={4} value={d.description} onChange={e => setD({ ...d, description: e.target.value })} /></div>
          </div>

          <h4 className="text-xl font-black uppercase tracking-wider text-black flex items-center gap-3 pt-6">
            <div className="w-1.5 h-8 bg-black rounded-full" />
            COMMERCIALS
          </h4>
          <div className="grid grid-cols-2 gap-6 bg-black/[0.02] p-8 rounded-[2rem] border-2 border-black/5">
            <div><Label>Base Price (₹)</Label><Inp value={d.price} onChange={e => setD({ ...d, price: e.target.value })} /></div>
            <div><Label>Price Note</Label><Inp value={d.priceNote} onChange={e => setD({ ...d, priceNote: e.target.value })} /></div>
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="text-xl font-black uppercase tracking-wider text-black flex items-center gap-3">
            <div className="w-1.5 h-8 bg-black rounded-full" />
            VISUAL ASSET
          </h4>
          <div className="bg-black/[0.02] p-8 rounded-[2rem] border-2 border-black/5">
            <ImageUpload
              value={d.image}
              onChange={(url) => setD({ ...d, image: url })}
              folder="qala-studios/studios"
              label="Select High-End Media"
              availableImages={uploadedStudioImages}
              onUploadComplete={fetchStudioImages}
            />
          </div>

          <h4 className="text-xl font-black uppercase tracking-wider text-black flex items-center gap-3 pt-6">
            <div className="w-1.5 h-8 bg-black rounded-full" />
            SPECIFICATIONS
          </h4>
          <div className="bg-black/[0.02] p-8 rounded-[2rem] border-2 border-black/5 space-y-6">
            <div className="flex gap-3">
              <Inp value={feat} onChange={e => setFeat(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeat())} placeholder="NEW FEATURE" />
              <button type="button" onClick={addFeat} className="px-6 py-4 bg-black text-white text-[11px] font-black uppercase tracking-widest rounded-2xl">ADD</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {d.features.map((f, i) => (
                <span key={i} className="inline-flex items-center gap-2 px-4 py-2 border-2 border-black text-[10px] font-black uppercase tracking-widest bg-white rounded-xl group shadow-sm">
                  {f}
                  <button type="button" onClick={() => setD({ ...d, features: d.features.filter((_, j) => j !== i) })} className="hover:text-red-600 transition-colors">×</button>
                </span>
              ))}
            </div>
          </div>

          <div className="pt-6">
            <button type="button" onClick={() => setD({ ...d, isActive: !d.isActive })}
              className={`w-full py-5 border-2 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-500 ${d.isActive ? 'bg-black text-white border-black shadow-xl shadow-black/10' : 'bg-white text-black/40 border-black/10 hover:border-black'}`}>
              {d.isActive ? 'VISIBLE ON PUBLIC DIRECTORY' : 'HIDDEN FROM PUBLIC VIEW'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-10 border-t-2 border-black/5">
        <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-3 px-12 py-6 bg-black text-white text-[12px] font-black uppercase tracking-[0.3em] hover:bg-neutral-900 disabled:opacity-50 transition-all rounded-3xl shadow-2xl hover:shadow-black/20">
          {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {studio ? 'UPDATE SYSTEM RECORD' : 'CREATE SYSTEM RECORD'}
        </button>
        <button type="button" onClick={onCancel} className="px-12 py-6 border-2 border-black/10 text-black/40 text-[11px] font-black uppercase tracking-widest hover:border-black hover:text-black transition-all rounded-3xl">
          CANCEL
        </button>
      </div>
    </form>
  );
};

const AdminStudiosPage: React.FC = () => {
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Studio | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [uploadedStudioImages, setUploadedStudioImages] = useState<any[]>([]);

  const parseFeatures = (f: any): string[] => {
    if (Array.isArray(f)) return f;
    if (typeof f === 'string') { try { return JSON.parse(f); } catch { return []; } }
    return [];
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.studios.getAll();
      setStudios((Array.isArray(res) ? res : []).map((s: any) => ({
        id: s.id, name: s.name, tagline: s.tagline || '',
        description: s.description || '',
        price: s.price?.toString() || '', priceNote: s.price_note || '',
        image: s.image_url || '', features: parseFeatures(s.features),
        isActive: s.is_active, order: s.order,
      })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchStudioImages = React.useCallback(async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${API_BASE}/upload/images?folder=qala-studios/studios`, {
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setUploadedStudioImages(data.images || []);
      }
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { load(); }, []);

  const handleSave = async (data: Omit<Studio, 'id' | 'order'>) => {
    try {
      const payload = {
        name: data.name, tagline: data.tagline, description: data.description,
        price: data.price ? parseFloat(data.price.toString().replace(/[^0-9.]/g, '')) : null,
        price_note: data.priceNote, image_url: data.image,
        is_active: data.isActive, features: data.features,
        order: editing ? editing.order : studios.length + 1,
      };
      if (editing) await api.studios.update(editing.id, payload);
      else await api.studios.create(payload);
      await load();
      setShowForm(false);
      setEditing(null);
    } catch { alert('Failed to save studio'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this studio permanently?')) return;
    try { await api.studios.delete(id); await load(); }
    catch { alert('Failed to delete studio'); }
  };

  const handleToggle = async (id: string, current: boolean) => {
    try { 
      await api.studios.update(id, { is_active: !current }); 
      await load(); 
    } catch { alert('Failed to toggle studio'); }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-black rounded-xl text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">Infrastructure</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black leading-none uppercase tracking-tighter text-black">
            STUDIO UNITS
          </h1>
          <p className="text-black/60 text-sm mt-4 max-w-md font-medium tracking-wide">
            Control the physical studio listings, technical specs, and commercial valuations.
          </p>
        </div>
        <div className="flex gap-4">
          <button onClick={load} className="group p-4 border-2 border-black/10 text-black/40 hover:border-black hover:text-black transition-all rounded-2xl">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => { setEditing(null); setShowForm(true); }}
            className="flex items-center gap-3 px-8 py-4 bg-black text-white text-[11px] font-black uppercase tracking-widest hover:shadow-2xl transition-all rounded-2xl shadow-black/10">
            <Plus className="w-4 h-4" /> ADD SYSTEM UNIT
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-40 bg-white border-2 border-black rounded-[2.5rem] shadow-xl flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-black/10 border-t-black rounded-full animate-spin mb-6" />
          <p className="text-black/40 text-[10px] font-black uppercase tracking-widest">Scanning Network Infrastructure</p>
        </div>
      ) : studios.length === 0 ? (
        <div className="py-40 bg-white border-2 border-dashed border-black/20 rounded-[2.5rem] flex flex-col items-center justify-center">
          <Building2 className="w-20 h-20 text-black/10 mb-8" />
          <p className="text-black/60 text-sm font-black uppercase tracking-widest leading-none">NO UNITS DEPLOYED</p>
          <p className="text-black/40 text-xs mt-3 uppercase tracking-wide">Initialize your first unit to begin</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {studios.map((s, idx) => {
            const isExpanded = expanded === s.id;
            return (
              <div key={s.id} className={`group bg-white border-2 transition-all duration-500 rounded-[2rem] overflow-hidden animate-fade-in ${isExpanded ? 'border-black shadow-2xl scale-[1.01]' : 'border-black/5 hover:border-black/20 text-black/70 hover:text-black'}`} style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="flex flex-col lg:flex-row lg:items-center gap-8 p-8">
                  <div className="w-full lg:w-32 h-32 bg-black/5 border-2 border-black/5 rounded-2xl overflow-hidden shadow-inner group-hover:border-black/10 transition-all flex-shrink-0 relative">
                    {s.image ? <img src={s.image} alt={s.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : <Building2 className="w-10 h-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black/10" />}
                    {!s.isActive && <div className="absolute inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center font-black text-[9px] uppercase tracking-widest">Draft</div>}
                  </div>
                  
                  <div className="flex-1 min-w-0" onClick={() => setExpanded(isExpanded ? null : s.id)}>
                    <div className="flex flex-wrap items-center gap-4 mb-2">
                       <h3 className="font-black text-2xl uppercase tracking-tighter leading-none">{s.name}</h3>
                       <span className={`px-3 py-1 border-2 rounded-lg text-[9px] font-black uppercase tracking-widest ${s.isActive ? 'bg-black text-white border-black' : 'bg-gray-100 text-gray-400 border-gray-100'}`}>
                         {s.isActive ? 'OPERATIONAL' : 'OFFLINE'}
                       </span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-black/30 mb-4">{s.tagline || 'NO TAGLINE'}</p>
                    <div className="flex items-baseline gap-3">
                       <span className="text-2xl font-black tracking-tighter">₹{s.price}</span>
                       <span className="text-[9px] font-black uppercase tracking-widest text-black/30 bg-black/5 px-2 py-1 rounded-md">{s.priceNote}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button onClick={() => { setEditing(s); setShowForm(true); }} className="group p-4 bg-black/5 hover:bg-black text-black hover:text-white rounded-xl transition-all duration-300">
                      <Edit2 className="w-4 h-4 group-hover:scale-110" />
                    </button>
                    <button onClick={() => handleToggle(s.id, s.isActive)} className={`p-4 border-2 transition-all rounded-xl ${s.isActive ? 'border-black text-black hover:bg-black hover:text-white' : 'border-gray-200 text-gray-300 hover:border-black hover:text-black'}`}>
                      <Power className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="p-4 border-2 border-red-50 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all rounded-xl">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setExpanded(isExpanded ? null : s.id)} className={`p-4 rounded-full transition-all ${isExpanded ? 'bg-black text-white shadow-xl' : 'bg-black/5 text-black'}`}>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t-2 border-black/5 p-12 bg-black/[0.01] flex flex-col md:flex-row gap-12 animate-fade-in">
                    <div className="md:w-2/3 space-y-8">
                       <div className="flex items-center gap-3">
                         <div className="p-3 bg-black/5 rounded-2xl"><Sparkles className="w-4 h-4" /></div>
                         <h4 className="text-sm font-black uppercase tracking-widest">Unit Description</h4>
                       </div>
                       <p className="text-lg font-medium text-black/60 leading-relaxed uppercase tracking-tight">{s.description || 'No description provided'}</p>
                    </div>
                    <div className="md:w-1/3 space-y-8">
                       <div className="flex items-center gap-3">
                         <div className="p-3 bg-black/5 rounded-2xl"><Layout className="w-4 h-4" /></div>
                         <h4 className="text-sm font-black uppercase tracking-widest">Specifications</h4>
                       </div>
                       <div className="flex flex-wrap gap-2">
                        {s.features.length > 0 ? s.features.map((f, i) => (
                          <span key={i} className="px-4 py-2 bg-white border-2 border-black/5 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-sm">{f}</span>
                        )) : <p className="text-[10px] text-black/30 font-black uppercase tracking-widest">DEFAULT SPECS</p>}
                       </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-fade-in" onClick={() => { setShowForm(false); setEditing(null); }} />
          <div className="relative bg-white w-full max-w-6xl max-h-full overflow-hidden flex flex-col rounded-[3rem] shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between px-12 py-10 border-b-2 border-black/5">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 bg-black rounded-full" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/40">{editing ? 'Modification Interface' : 'Initialization Interface'}</span>
                </div>
                <h3 className="text-4xl font-black uppercase tracking-tighter text-black">{editing ? 'EDIT UNIT' : 'NEW SYSTEM UNIT'}</h3>
              </div>
              <button 
                onClick={() => { setShowForm(false); setEditing(null); }} 
                className="p-5 bg-black/5 hover:bg-black text-black hover:text-white rounded-full transition-all"
              >
                <X className="w-8 h-8" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-12">
              <StudioForm
                studio={editing}
                onSubmit={handleSave}
                onCancel={() => { setShowForm(false); setEditing(null); }}
                uploadedStudioImages={uploadedStudioImages}
                fetchStudioImages={fetchStudioImages}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudiosPage;
