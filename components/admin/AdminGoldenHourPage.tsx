import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Power, X, RefreshCw, ChevronDown, ChevronUp, Sun, Save, Image as ImageIcon, Sparkles, Layout, Map as MapIcon, Video } from 'lucide-react';
import { api, GoldenHourSet } from '../../services/api';
import { useContent } from '../../contexts/ContentContext';
import ImageUpload from './ImageUpload';

const API_BASE = import.meta.env.VITE_API_URL || 'https://qalastudio.onrender.com/api';

const Inp: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (p) => (
  <input {...p} className={`w-full px-5 py-4 border-2 border-black/10 rounded-2xl focus:border-black focus:ring-4 focus:ring-black/5 outline-none text-sm font-bold uppercase tracking-wide transition-all bg-black/5 hover:bg-black/[0.08] ${p.className || ''}`} />
);

const Txta: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (p) => (
  <textarea {...p} className="w-full px-5 py-4 border-2 border-black/10 rounded-2xl focus:border-black focus:ring-4 focus:ring-black/5 outline-none text-sm resize-none font-bold uppercase tracking-wide transition-all bg-black/5 hover:bg-black/[0.08]" />
);

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-black/40 mb-2">{children}</label>
);

interface SetFormProps {
  set: GoldenHourSet | null;
  onSubmit: (d: any) => void;
  onCancel: () => void;
  uploadedImages: any[];
  fetchImages: () => void;
}

const SetForm: React.FC<SetFormProps> = ({ set, onSubmit, onCancel, uploadedImages, fetchImages }) => {
  const [d, setD] = useState({
    name: set?.name || '', category: set?.category || 'Indoor',
    theme: set?.theme || '', description: set?.description || '',
    price: set?.price || '', price_note: set?.price_note || 'per hour',
    image_url: set?.image_url || '', bts_video: set?.bts_video || '',
    dimensions: set?.dimensions || '', props: set?.props || [],
    coords_x: set?.coords_x || 0, coords_y: set?.coords_y || 0,
    coords_w: set?.coords_w || 100, coords_h: set?.coords_h || 100,
    is_active: set?.is_active ?? true,
  });
  const [prop, setProp] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  const addProp = () => {
    if (prop.trim() && d.props.length < 15) { 
      setD({ ...d, props: [...d.props, prop.trim().toUpperCase()] }); 
      setProp(''); 
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
            <div><Label>Set Name *</Label><Inp value={d.name} onChange={e => setD({ ...d, name: e.target.value })} required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Category</Label><Inp value={d.category} onChange={e => setD({ ...d, category: e.target.value })} /></div>
              <div><Label>Theme</Label><Inp value={d.theme} onChange={e => setD({ ...d, theme: e.target.value })} /></div>
            </div>
            <div><Label>Description</Label><Txta rows={4} value={d.description} onChange={e => setD({ ...d, description: e.target.value })} /></div>
          </div>

          <h4 className="text-xl font-black uppercase tracking-wider text-black flex items-center gap-3 pt-6">
            <div className="w-1.5 h-8 bg-black rounded-full" />
            COMMERCIALS
          </h4>
          <div className="grid grid-cols-2 gap-6 bg-black/[0.02] p-8 rounded-[2rem] border-2 border-black/5">
            <div><Label>Estimate Price (₹)</Label><Inp value={d.price} onChange={e => setD({ ...d, price: e.target.value })} /></div>
            <div><Label>Price Note</Label><Inp value={d.price_note} onChange={e => setD({ ...d, price_note: e.target.value })} /></div>
          </div>

          <h4 className="text-xl font-black uppercase tracking-wider text-black flex items-center gap-3 pt-6">
            <div className="w-1.5 h-8 bg-black rounded-full" />
            MAP COORDINATES (BLUEPRINT)
          </h4>
          <div className="grid grid-cols-2 gap-4 bg-black/[0.02] p-8 rounded-[2rem] border-2 border-black/5">
            <div><Label>X Position</Label><Inp type="number" value={d.coords_x} onChange={e => setD({ ...d, coords_x: parseInt(e.target.value) })} /></div>
            <div><Label>Y Position</Label><Inp type="number" value={d.coords_y} onChange={e => setD({ ...d, coords_y: parseInt(e.target.value) })} /></div>
            <div><Label>Width</Label><Inp type="number" value={d.coords_w} onChange={e => setD({ ...d, coords_w: parseInt(e.target.value) })} /></div>
            <div><Label>Height</Label><Inp type="number" value={d.coords_h} onChange={e => setD({ ...d, coords_h: parseInt(e.target.value) })} /></div>
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="text-xl font-black uppercase tracking-wider text-black flex items-center gap-3">
            <div className="w-1.5 h-8 bg-black rounded-full" />
            VISUAL ASSETS
          </h4>
          <div className="space-y-6 bg-black/[0.02] p-8 rounded-[2rem] border-2 border-black/5">
            <div>
              <Label>Main Media Image</Label>
              <ImageUpload
                value={d.image_url}
                onChange={(url) => setD({ ...d, image_url: url })}
                folder="qala-studios/golden-hour"
                label="Select Set Image"
                availableImages={uploadedImages}
                onUploadComplete={fetchImages}
              />
            </div>
            <div><Label>BTS Video URL (MP4)</Label><Inp value={d.bts_video} onChange={e => setD({ ...d, bts_video: e.target.value })} placeholder="https://..." /></div>
          </div>

          <h4 className="text-xl font-black uppercase tracking-wider text-black flex items-center gap-3 pt-6">
            <div className="w-1.5 h-8 bg-black rounded-full" />
            SPECIFICATIONS
          </h4>
          <div className="bg-black/[0.02] p-8 rounded-[2rem] border-2 border-black/5 space-y-6">
            <div><Label>Dimensions</Label><Inp value={d.dimensions} onChange={e => setD({ ...d, dimensions: e.target.value })} placeholder="40 x 60 FT" /></div>
            <div>
               <Label>Included Props</Label>
               <div className="flex gap-3">
                 <Inp value={prop} onChange={e => setProp(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addProp())} placeholder="VINTAGE SOFA" />
                 <button type="button" onClick={addProp} className="px-6 py-4 bg-black text-white text-[11px] font-black uppercase tracking-widest rounded-2xl">ADD</button>
               </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {d.props.map((p, i) => (
                <span key={i} className="inline-flex items-center gap-2 px-4 py-2 border-2 border-black text-[10px] font-black uppercase tracking-widest bg-white rounded-xl group shadow-sm">
                  {p}
                  <button type="button" onClick={() => setD({ ...d, props: d.props.filter((_, j) => j !== i) })} className="hover:text-red-600 transition-colors">×</button>
                </span>
              ))}
            </div>
          </div>

          <div className="pt-6">
            <button type="button" onClick={() => setD({ ...d, is_active: !d.is_active })}
              className={`w-full py-5 border-2 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-500 ${d.is_active ? 'bg-black text-white border-black shadow-xl shadow-black/10' : 'bg-white text-black/40 border-black/10 hover:border-black'}`}>
              {d.is_active ? 'VISIBLE ON PUBLIC PAGE' : 'HIDDEN FROM PUBLIC PAGE'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-10 border-t-2 border-black/5">
        <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-3 px-12 py-6 bg-black text-white text-[12px] font-black uppercase tracking-[0.3em] hover:bg-neutral-900 disabled:opacity-50 transition-all rounded-3xl shadow-2xl hover:shadow-black/20">
          {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {set ? 'UPDATE DB RECORD' : 'CREATE DB RECORD'}
        </button>
        <button type="button" onClick={onCancel} className="px-12 py-6 border-2 border-black/10 text-black/40 text-[11px] font-black uppercase tracking-widest hover:border-black hover:text-black transition-all rounded-3xl">
          CANCEL
        </button>
      </div>
    </form>
  );
};

const AdminGoldenHourPage: React.FC = () => {
  const [sets, setSets] = useState<GoldenHourSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<GoldenHourSet | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const { content, updateSection, refresh } = useContent();
  const [meta, setMeta] = useState(content.goldenHour);
  const [metaSaving, setMetaSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.goldenHour.getAll();
      setSets(Array.isArray(res) ? res : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchImages = React.useCallback(async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${API_BASE}/upload/images?folder=qala-studios/golden-hour`, {
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setUploadedImages(data.images || []);
      }
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { load(); fetchImages(); }, [fetchImages]);
  useEffect(() => { setMeta(content.goldenHour); }, [content.goldenHour]);

  const handleSetSave = async (data: any) => {
    try {
      if (editing) await api.goldenHour.update(editing.id, data);
      else await api.goldenHour.create(data);
      await load();
      await refresh(); // sync public page
      setShowForm(false);
      setEditing(null);
    } catch (e: any) { alert(`Failed to save set: ${e?.message || 'Unknown error'}`); }
  };

  const handleSetDelete = async (id: string) => {
    if (!confirm('Permanently delete this set from DB?')) return;
    try { await api.goldenHour.delete(id); await load(); await refresh(); }
    catch (e: any) { alert(`Failed to delete set: ${e?.message || 'Unknown error'}`); }
  };

  const handleSetToggle = async (id: string) => {
    try { await api.goldenHour.toggle(id); await load(); await refresh(); }
    catch (e: any) { alert(`Failed to toggle set: ${e?.message || 'Unknown error'}`); }
  };

  const handleMetaSave = async () => {
    setMetaSaving(true);
    try {
      await api.content.update('GOLDEN_HOUR', meta);
      updateSection('goldenHour', meta);
      alert('Page editorial updated successfully');
    } catch (e: any) { alert(`Failed to update page editorial: ${e?.message || 'Unknown error'}`); }
    finally { setMetaSaving(false); }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-black rounded-xl text-white">
              <Sun className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">Infrastructure</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black leading-none uppercase tracking-tighter text-black">
            GOLDEN HOUR
          </h1>
          <p className="text-black/60 text-sm mt-4 max-w-md font-medium tracking-wide">
            Manage the world-class sets and blueprint data for the Golden Hour boutique experience.
          </p>
        </div>
        <div className="flex gap-4">
          <button onClick={load} className="group p-4 border-2 border-black/10 text-black/40 hover:border-black hover:text-black transition-all rounded-2xl">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => { setEditing(null); setShowForm(true); }}
            className="flex items-center gap-3 px-8 py-4 bg-black text-white text-[11px] font-black uppercase tracking-widest hover:shadow-2xl transition-all rounded-2xl shadow-black/10">
            <Plus className="w-4 h-4" /> ADD SYSTEM SET
          </button>
        </div>
      </div>

      {/* Page Editorial Accordion */}
      <div className="bg-white border-2 border-black/5 rounded-[2.5rem] overflow-hidden">
        <div className="p-8 flex items-center justify-between border-b-2 border-black/5">
          <div className="flex items-center gap-4">
             <div className="p-4 bg-black/[0.03] rounded-2xl"><Layout className="w-6 h-6" /></div>
             <div>
               <h3 className="font-black uppercase tracking-widest text-sm text-black">Page Editorial & Labels</h3>
               <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest">Configure Global Page Attributes</p>
             </div>
          </div>
          <button onClick={handleMetaSave} disabled={metaSaving} className="px-8 py-3 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:shadow-xl transition-all disabled:opacity-50">
             {metaSaving ? 'SAVING...' : 'PUBLISH PAGE UPDATES'}
          </button>
        </div>
        <div className="p-10 grid md:grid-cols-2 lg:grid-cols-3 gap-10 bg-black/[0.01]">
            <div className="space-y-4">
              <Label>Hero Section Tag</Label>
              <Inp value={meta.sectionTag} onChange={e => setMeta({ ...meta, sectionTag: e.target.value })} />
            </div>
            <div className="space-y-4">
              <Label>Page Title</Label>
              <Inp value={meta.sectionTitle} onChange={e => setMeta({ ...meta, sectionTitle: e.target.value })} />
            </div>
            <div className="space-y-4">
              <Label>Main Description</Label>
              <Txta rows={3} value={meta.sectionDescription} onChange={e => setMeta({ ...meta, sectionDescription: e.target.value })} />
            </div>
            <div className="space-y-4">
              <Label>Map Section Title</Label>
              <Inp value={meta.mapTitle} onChange={e => setMeta({ ...meta, mapTitle: e.target.value })} />
            </div>
            <div className="space-y-4">
              <Label>Availability Status Label</Label>
              <Inp value={meta.availabilityText} onChange={e => setMeta({ ...meta, availabilityText: e.target.value })} />
            </div>
            <div className="space-y-4">
              <Label>Primary Booking Label</Label>
              <Inp value={meta.primaryCtaLabel} onChange={e => setMeta({ ...meta, primaryCtaLabel: e.target.value })} />
            </div>
            <div className="space-y-4">
              <Label>Secondary Action Label</Label>
              <Inp value={meta.secondaryCtaLabel} onChange={e => setMeta({ ...meta, secondaryCtaLabel: e.target.value })} />
            </div>
            <div className="space-y-4">
              <Label>Map Description</Label>
              <Txta rows={3} value={meta.mapDescription} onChange={e => setMeta({ ...meta, mapDescription: e.target.value })} />
            </div>
            <div className="space-y-4">
              <Label>BTS Section Label</Label>
              <Inp value={meta.btsLabel} onChange={e => setMeta({ ...meta, btsLabel: e.target.value })} />
            </div>
            <div className="space-y-4">
              <Label>Dimensions Label</Label>
              <Inp value={meta.dimensionsLabel} onChange={e => setMeta({ ...meta, dimensionsLabel: e.target.value })} />
            </div>
            <div className="space-y-4">
              <Label>Props Label</Label>
              <Inp value={meta.propsLabel} onChange={e => setMeta({ ...meta, propsLabel: e.target.value })} />
            </div>
            <div className="space-y-4">
              <Label>Availability Status Title</Label>
              <Inp value={meta.availabilityLabel} onChange={e => setMeta({ ...meta, availabilityLabel: e.target.value })} />
            </div>
        </div>
      </div>

      {/* Sets List */}
      <div className="space-y-6">
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-black flex items-center gap-3">
          <MapIcon className="w-4 h-4" />
          DEPLOYED SETS ({sets.length})
        </h2>

        {loading ? (
          <div className="py-40 bg-white border-2 border-black rounded-[2.5rem] shadow-xl flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-black/10 border-t-black rounded-full animate-spin mb-6" />
            <p className="text-black/40 text-[10px] font-black uppercase tracking-widest">Syncing with DB Nodes</p>
          </div>
        ) : sets.length === 0 ? (
          <div className="py-40 bg-white border-2 border-dashed border-black/20 rounded-[2.5rem] flex flex-col items-center justify-center">
            <Sun className="w-20 h-20 text-black/10 mb-8" />
            <p className="text-black/60 text-sm font-black uppercase tracking-widest leading-none">NO ASSETS DEPLOYED</p>
            <p className="text-black/40 text-xs mt-3 uppercase tracking-wide">Initialize your first set to begin</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {sets.map((s, idx) => {
              const isExpanded = expanded === s.id;
              return (
                <div key={s.id} className={`group bg-white border-2 transition-all duration-500 rounded-[2rem] overflow-hidden ${isExpanded ? 'border-black shadow-2xl scale-[1.01]' : 'border-black/5 hover:border-black/20'}`} style={{ animationDelay: `${idx * 50}ms` }}>
                  <div className="flex flex-col lg:flex-row lg:items-center gap-8 p-6">
                    <div className="w-24 h-24 bg-black/5 border-2 border-black/5 rounded-2xl overflow-hidden shadow-inner group-hover:border-black/10 transition-all flex-shrink-0 relative">
                      {s.image_url ? <img src={s.image_url} alt={s.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : <Sun className="w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black/10" />}
                      {!s.is_active && <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center font-black text-[8px] uppercase tracking-widest text-black/40">Inactive</div>}
                    </div>

                    <div className="flex-1 min-w-0" onClick={() => setExpanded(isExpanded ? null : s.id)}>
                      <div className="flex flex-wrap items-center gap-3 mb-1">
                         <h3 className="font-black text-xl uppercase tracking-tighter leading-none">{s.name}</h3>
                         <span className="text-[8px] font-black uppercase tracking-[0.2em] bg-black/5 px-2 py-0.5 rounded text-black/40">{s.category}</span>
                      </div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-black/30 mb-3">{s.theme || 'NO THEME'}</p>
                      <div className="flex items-baseline gap-3">
                         <span className="text-xl font-black tracking-tighter">₹{s.price || '0'}</span>
                         <span className="text-[8px] font-black uppercase tracking-widest text-black/20 bg-black/[0.02] px-2 py-1 rounded">{s.price_note}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                       <button onClick={() => { setEditing(s); setShowForm(true); }} className="p-4 bg-black/5 hover:bg-black text-black hover:text-white rounded-xl transition-all">
                         <Edit2 className="w-4 h-4" />
                       </button>
                       <button onClick={() => handleSetToggle(s.id)} className={`p-4 border-2 transition-all rounded-xl ${s.is_active ? 'border-black text-black hover:bg-black hover:text-white' : 'border-gray-100 text-gray-300 hover:border-black hover:text-black'}`}>
                         <Power className="w-4 h-4" />
                       </button>
                       <button onClick={() => handleSetDelete(s.id)} className="p-4 border-2 border-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all rounded-xl">
                         <Trash2 className="w-4 h-4" />
                       </button>
                       <button onClick={() => setExpanded(isExpanded ? null : s.id)} className={`p-4 rounded-full transition-all ${isExpanded ? 'bg-black text-white' : 'bg-black/5 text-black'}`}>
                         {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                       </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t-2 border-black/5 p-10 bg-black/[0.01] grid md:grid-cols-2 lg:grid-cols-3 gap-12 animate-fade-in">
                       <div className="space-y-6">
                         <div className="flex items-center gap-3 border-b border-black/5 pb-4">
                           <Sparkles className="w-4 h-4 text-black/30" />
                           <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Description</h4>
                         </div>
                         <p className="text-sm font-medium text-black/60 leading-relaxed uppercase tracking-tight">{s.description || 'No description'}</p>
                       </div>
                       
                       <div className="space-y-6">
                         <div className="flex items-center gap-3 border-b border-black/5 pb-4">
                           <Layout className="w-4 h-4 text-black/30" />
                           <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Specifications</h4>
                         </div>
                         <div className="space-y-4">
                            <div>
                               <p className="text-[8px] font-black text-black/20 uppercase mb-2">Dimensions</p>
                               <p className="font-bold text-xs uppercase">{s.dimensions || 'NOT SPECIFIED'}</p>
                            </div>
                            <div>
                               <p className="text-[8px] font-black text-black/20 uppercase mb-2">Props ({s.props.length})</p>
                               <div className="flex flex-wrap gap-2">
                                 {s.props.map((p, i) => (
                                   <span key={i} className="px-3 py-1 bg-white border-2 border-black/5 text-[8px] font-black uppercase tracking-widest rounded-lg">{p}</span>
                                 ))}
                               </div>
                            </div>
                         </div>
                       </div>

                       <div className="space-y-6">
                         <div className="flex items-center gap-3 border-b border-black/5 pb-4">
                           <MapIcon className="w-4 h-4 text-black/30" />
                           <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Map Metadata</h4>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="bg-black/5 p-4 rounded-2xl">
                               <p className="text-[8px] font-black text-black/20 uppercase mb-1">Position</p>
                               <p className="font-bold text-xs">X:{s.coords_x} Y:{s.coords_y}</p>
                            </div>
                            <div className="bg-black/5 p-4 rounded-2xl">
                               <p className="text-[8px] font-black text-black/20 uppercase mb-1">Scale</p>
                               <p className="font-bold text-xs">W:{s.coords_w} H:{s.coords_h}</p>
                            </div>
                            <div className="col-span-2 bg-black/5 p-4 rounded-2xl overflow-hidden">
                               <p className="text-[8px] font-black text-black/20 uppercase mb-2">BTS Link</p>
                               <p className="font-bold text-[9px] truncate text-black/40">{s.bts_video || 'NO VIDEO LINK'}</p>
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

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-fade-in" onClick={() => { setShowForm(false); setEditing(null); }} />
          <div className="relative bg-white w-full max-w-6xl max-h-full overflow-hidden flex flex-col rounded-[3rem] shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between px-12 py-8 border-b-2 border-black/5">
              <div>
                <h3 className="text-3xl font-black uppercase tracking-tighter text-black">{editing ? 'EDIT SYSTEM SET' : 'NEW SYSTEM SET'}</h3>
              </div>
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="p-4 bg-black/5 hover:bg-black text-black hover:text-white rounded-full transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-12">
              <SetForm
                set={editing}
                onSubmit={handleSetSave}
                onCancel={() => { setShowForm(false); setEditing(null); }}
                uploadedImages={uploadedImages}
                fetchImages={fetchImages}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGoldenHourPage;
