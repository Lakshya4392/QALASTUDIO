import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Power, X, RefreshCw, ChevronDown, ChevronUp, Briefcase, Save, Image as ImageIcon, Video, Film, Sparkles, Filter } from 'lucide-react';
import { api } from '../../services/api';
import ImageUpload from './ImageUpload';
import AdminDropdown from './AdminDropdown';

const API_BASE = import.meta.env.VITE_API_URL || 'https://qalastudio.onrender.com/api';

interface Project {
  id: string;
  type: string;
  category: string[];
  brand: string;
  name: string;
  year: string;
  media_url: string;
  thumbnail: string;
  isActive: boolean;
  order: number;
}

const Inp: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (p) => (
  <input {...p} className={`w-full px-5 py-4 border-2 border-black/10 rounded-2xl focus:border-black focus:ring-4 focus:ring-black/5 outline-none text-sm font-bold uppercase tracking-wide transition-all bg-black/5 hover:bg-black/[0.08] ${p.className || ''}`} />
);

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-black/40 mb-2">{children}</label>
);

interface ProjectFormProps {
  project: Project | null;
  onSubmit: (d: any) => void;
  onCancel: () => void;
  uploadedImages: any[];
  fetchImages: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ project, onSubmit, onCancel, uploadedImages, fetchImages }) => {
  const [d, setD] = useState({
    type: project?.type || 'image',
    brand: project?.brand || '',
    name: project?.name || '',
    year: project?.year || new Date().getFullYear().toString(),
    media_url: project?.media_url || '',
    thumbnail: project?.thumbnail || '',
    category: project?.category || [],
    isActive: project?.isActive ?? true,
  });
  const [cat, setCat] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  const addCat = () => {
    if (cat.trim() && d.category.length < 10) { setD({ ...d, category: [...d.category, cat.trim().toUpperCase()] }); setCat(''); }
  };

  return (
    <form onSubmit={async (e) => { e.preventDefault(); setSaving(true); await onSubmit(d); setSaving(false); }} className="space-y-10">
      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <h4 className="text-xl font-black uppercase tracking-wider text-black flex items-center gap-3">
            <div className="w-1.5 h-8 bg-black rounded-full" />
            EDITORIAL DATA
          </h4>
          <div className="space-y-6 bg-black/[0.02] p-8 rounded-[2rem] border-2 border-black/5">
            <div><Label>Media Strategy</Label>
              <AdminDropdown
                value={d.type}
                onChange={val => setD({ ...d, type: val })}
                options={[
                  { value: 'image', label: 'PHOTOGRAPHY UNIT', icon: ImageIcon },
                  { value: 'video', label: 'CINEMATOGRAPHY UNIT', icon: Video },
                ]}
              />
            </div>
            <div><Label>Brand / High-End Client *</Label><Inp value={d.brand} onChange={e => setD({ ...d, brand: e.target.value })} required /></div>
            <div><Label>Project / Editorial Title *</Label><Inp value={d.name} onChange={e => setD({ ...d, name: e.target.value })} required /></div>
            <div><Label>Production Year</Label><Inp value={d.year} onChange={e => setD({ ...d, year: e.target.value })} /></div>
          </div>

          <h4 className="text-xl font-black uppercase tracking-wider text-black flex items-center gap-3 pt-6">
            <div className="w-1.5 h-8 bg-black rounded-full" />
            CLASSIFICATION
          </h4>
          <div className="bg-black/[0.02] p-8 rounded-[2rem] border-2 border-black/5 space-y-6">
            <div className="flex gap-3">
              <Inp value={cat} onChange={e => setCat(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCat())} placeholder="NEW TAG" />
              <button type="button" onClick={addCat} className="px-6 py-4 bg-black text-white text-[11px] font-black uppercase tracking-widest rounded-2xl">ADD</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {d.category.map((c, i) => (
                <span key={i} className="inline-flex items-center gap-2 px-4 py-2 border-2 border-black text-[10px] font-black uppercase tracking-widest bg-white rounded-xl shadow-sm">
                  {c}
                  <button type="button" onClick={() => setD({ ...d, category: d.category.filter((_, j) => j !== i) })} className="hover:text-red-600 transition-colors">×</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="text-xl font-black uppercase tracking-wider text-black flex items-center gap-3">
            <div className="w-1.5 h-8 bg-black rounded-full" />
            MEDIA ASSETS
          </h4>
          <div className="bg-black/[0.02] p-8 rounded-[2rem] border-2 border-black/5 space-y-8">
            <div>
              <Label>Thumbnail Asset (Grid Cover)</Label>
              <ImageUpload value={d.thumbnail} onChange={url => setD({ ...d, thumbnail: url })} folder="qala-studios/projects" availableImages={uploadedImages} onUploadComplete={fetchImages} />
            </div>
            <div>
              <Label>{d.type === 'video' ? 'Production Stream URL' : 'Full-Resolution Asset'}</Label>
              {d.type === 'video' ? (
                <Inp value={d.media_url} onChange={e => setD({ ...d, media_url: e.target.value })} placeholder="YouTube, Vimeo, or CDN URL" />
              ) : (
                <ImageUpload value={d.media_url} onChange={url => setD({ ...d, media_url: url })} folder="qala-studios/projects" availableImages={uploadedImages} onUploadComplete={fetchImages} />
              )}
            </div>
          </div>

          <div className="pt-6">
            <button type="button" onClick={() => setD({ ...d, isActive: !d.isActive })}
              className={`w-full py-5 border-2 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-500 ${d.isActive ? 'bg-black text-white border-black shadow-xl shadow-black/10' : 'bg-white text-black/40 border-black/10 hover:border-black'}`}>
              {d.isActive ? 'VISIBLE IN SHOWREEL' : 'STORED IN ARCHIVES'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-10 border-t-2 border-black/5">
        <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-3 px-12 py-6 bg-black text-white text-[12px] font-black uppercase tracking-[0.3em] hover:bg-neutral-900 disabled:opacity-50 transition-all rounded-3xl shadow-2xl hover:shadow-black/20 translate-z-0 hover:-translate-y-1">
          {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {project ? 'UPDATE PRODUCTION RECORD' : 'CREATE PRODUCTION RECORD'}
        </button>
        <button type="button" onClick={onCancel} className="px-12 py-6 border-2 border-black/10 text-black/40 text-[11px] font-black uppercase tracking-widest hover:border-black hover:text-black transition-all rounded-3xl">
          CANCEL
        </button>
      </div>
    </form>
  );
};

const AdminProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);

  const parseJsonSafe = (data: any): string[] => {
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') { try { return JSON.parse(data); } catch { return []; } }
    return [];
  };

  const load = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const res = await api.projects.getAll();
      setProjects((Array.isArray(res) ? res : []).map((p: any) => ({
        id: p.id,
        type: p.type || 'image',
        brand: p.brand || '',
        name: p.name || '',
        year: p.year || new Date().getFullYear().toString(),
        media_url: p.media_url || '',
        thumbnail: p.thumbnail || '',
        category: parseJsonSafe(p.category),
        isActive: p.is_active,
        order: p.order,
      })));
    } catch (e) { console.error(e); }
    finally { if (showSpinner) setLoading(false); }
  };

  const fetchImages = React.useCallback(async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${API_BASE}/upload/images?folder=qala-studios/projects`, {
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setUploadedImages(data.images || []);
      }
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { load(); }, []);

  const handleSave = async (data: Omit<Project, 'id' | 'order'>) => {
    try {
      const payload = {
        type: data.type,
        brand: data.brand,
        name: data.name,
        year: data.year,
        media_url: data.media_url || data.thumbnail || 'https://placeholder.com/image.jpg',
        thumbnail: data.thumbnail || null,
        is_active: data.isActive,
        category: data.category,
        order: editing ? editing.order : projects.length + 1,
      };
      
      if (editing) {
        setProjects(prev => prev.map(p => p.id === editing.id ? { ...p, ...payload, isActive: payload.is_active } : p));
        await api.projects.update(editing.id, payload);
      } else {
        await api.projects.create(payload);
        await load(false);
      }
      
      setShowForm(false);
      setEditing(null);
    } catch (e: any) { alert(`Failed to save project: ${e?.message || 'Unknown error'}`); await load(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project permanently?')) return;
    const oldProjects = projects;
    setProjects(prev => prev.filter(p => p.id !== id));
    try { await api.projects.delete(id); }
    catch { setProjects(oldProjects); alert('Failed to delete project'); }
  };

  const handleToggle = async (id: string, current: boolean) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, isActive: !current } : p));
    try { await api.projects.update(id, { is_active: !current }); }
    catch { setProjects(prev => prev.map(p => p.id === id ? { ...p, isActive: current } : p)); alert('Failed to toggle project'); }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-black rounded-xl text-white">
              <Film className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">Master Portfolio</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black leading-none uppercase tracking-tighter text-black">
            PORTFOLIO
          </h1>
          <p className="text-black/60 text-sm mt-4 max-w-md font-medium tracking-wide">
            Curated cinematic and photographic works.
          </p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => load()} className="group p-4 border-2 border-black/10 text-black/40 hover:border-black hover:text-black transition-all rounded-2xl">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => { setEditing(null); setShowForm(true); }}
            className="flex items-center gap-3 px-8 py-4 bg-black text-white text-[11px] font-black uppercase tracking-widest hover:shadow-2xl transition-all rounded-2xl shadow-black/10">
            <Plus className="w-4 h-4" /> ADD PRODUCTION
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-40 bg-white border-2 border-black rounded-[2.5rem] shadow-xl flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-black/10 border-t-black rounded-full animate-spin mb-6" />
          <p className="text-black/40 text-[10px] font-black uppercase tracking-widest">Compiling Production Masters</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="py-40 bg-white border-2 border-dashed border-black/20 rounded-[2.5rem] flex flex-col items-center justify-center">
          <Briefcase className="w-20 h-20 text-black/10 mb-8" />
          <p className="text-black/60 text-sm font-black uppercase tracking-widest leading-none">EMPTY SHOWREEL</p>
          <p className="text-black/40 text-xs mt-3 uppercase tracking-wide">Initialize your first production and share it</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {projects.map((p, idx) => {
            const isExpanded = expanded === p.id;
            return (
              <div key={p.id} className={`group bg-white border-2 transition-all duration-500 rounded-[2rem] overflow-hidden animate-fade-in ${isExpanded ? 'border-black shadow-2xl scale-[1.01]' : 'border-black/5 hover:border-black/20 text-black/70 hover:text-black'}`} style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="flex flex-col lg:flex-row lg:items-center gap-8 p-8">
                  <div className="w-full lg:w-32 h-32 bg-black/5 border-2 border-black/5 rounded-2xl overflow-hidden shadow-inner group-hover:border-black/10 transition-all flex-shrink-0 relative">
                    {p.thumbnail ? <img src={p.thumbnail} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" /> : <Sparkles className="w-10 h-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black/10" />}
                    {!p.isActive && <div className="absolute inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center font-black text-[9px] uppercase tracking-widest">Draft</div>}
                  </div>
                  
                  <div className="flex-1 min-w-0" onClick={() => setExpanded(isExpanded ? null : p.id)}>
                    <div className="flex flex-wrap items-center gap-4 mb-2">
                      <h3 className="font-black text-2xl uppercase tracking-tighter leading-none">{p.brand}</h3>
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black/30">/ {p.name}</span>
                      <span className={`px-3 py-1 border-2 rounded-lg text-[9px] font-black uppercase tracking-widest ${p.isActive ? 'bg-black text-white border-black' : 'bg-gray-100 text-gray-400 border-gray-100'}`}>
                        {p.isActive ? 'PUBLISHED' : 'ARCHIVED'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                       <span className="text-[9px] font-black uppercase tracking-widest text-black/60 bg-black/5 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                         {p.type === 'video' ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                         {p.type}
                       </span>
                       <span className="text-[9px] font-black uppercase tracking-widest text-black/40">— {p.year}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {p.category.map((c, i) => <span key={i} className="text-[9px] font-black text-black/30 uppercase tracking-[0.25em] border-2 border-black/5 px-2 py-0.5 rounded-full">{c}</span>)}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button onClick={() => { setEditing(p); setShowForm(true); }} className="group p-4 bg-black/5 hover:bg-black text-black hover:text-white rounded-xl transition-all duration-300">
                      <Edit2 className="w-4 h-4 group-hover:scale-110" />
                    </button>
                    <button onClick={() => handleToggle(p.id, p.isActive)} className={`p-4 border-2 transition-all rounded-xl ${p.isActive ? 'border-black text-black hover:bg-black hover:text-white' : 'border-gray-200 text-gray-300 hover:border-black hover:text-black'}`}>
                      <Power className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-4 border-2 border-red-50 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all rounded-xl">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setExpanded(isExpanded ? null : p.id)} className={`p-4 rounded-full transition-all ${isExpanded ? 'bg-black text-white shadow-xl' : 'bg-black/5 text-black'}`}>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t-2 border-black/5 p-12 bg-black/[0.01] flex flex-col md:flex-row gap-12 items-center animate-fade-in">
                    <div className="w-full md:w-1/2 aspect-video bg-black rounded-[2rem] border-2 border-black overflow-hidden shadow-2xl relative">
                       {p.type === 'video' ? (
                          <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                             <Film className="w-12 h-12 text-white/20 animate-pulse" />
                             <p className="text-[9px] font-black uppercase text-white/40 tracking-widest">Source: {p.media_url.substring(0, 30)}...</p>
                          </div>
                       ) : (
                          <img src={p.media_url} className="w-full h-full object-cover" />
                       )}
                    </div>
                    <div className="w-full md:w-1/2 space-y-8 text-center md:text-left">
                       <div className="flex items-center gap-3 justify-center md:justify-start">
                         <div className="p-3 bg-black/5 rounded-2xl"><Sparkles className="w-4 h-4" /></div>
                         <h4 className="text-sm font-black uppercase tracking-widest">Metadata</h4>
                       </div>
                       <div className="space-y-4 uppercase tracking-widest text-[9px] font-black text-black/40">
                          <p>Captured in {p.year}</p>
                          <p>Project Code: {p.id.substring(0, 8)}</p>
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
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/40">{editing ? 'Record Modification' : 'Record Initialization'}</span>
                </div>
                <h3 className="text-4xl font-black uppercase tracking-tighter text-black">{editing ? 'EDIT PROJECT' : 'NEW PROJECT ENTRY'}</h3>
              </div>
              <button 
                onClick={() => { setShowForm(false); setEditing(null); }} 
                className="p-5 bg-black/5 hover:bg-black text-black hover:text-white rounded-full transition-all"
              >
                <X className="w-8 h-8" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-12">
              <ProjectForm
                project={editing}
                onSubmit={handleSave}
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

export default AdminProjectsPage;
