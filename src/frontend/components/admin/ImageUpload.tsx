import React, { useRef, useState } from 'react';
import { Upload, X, Image, CheckCircle, Circle, FolderOpen, Sparkles, Layout } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://qalastudio.onrender.com/api';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  availableImages?: Array<{ url: string; public_id: string; filename?: string; created_at?: string }>;
  onImageSelect?: (url: string) => void;
  onUploadComplete?: () => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, folder = 'qala-studios', label = 'Image', availableImages = [], onImageSelect, onUploadComplete }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  const handleFile = async (file: File) => {
    if (!file) return;
    setError('');
    setSuccess(false);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${API_BASE}/upload?folder=${folder}`, {
        method: 'POST',
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      onChange(data.url);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      if (onUploadComplete) onUploadComplete();
    } catch (e: any) {
      setError(e.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="space-y-4 relative">
      {label && <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-black/40 mb-2">{label}</label>}

      <div className="flex items-start gap-4 p-5 bg-black/[0.03] rounded-3xl border-2 border-black/5">
        {/* Image preview (larger for better visibility) */}
        {value ? (
          <div className="relative w-24 h-24 border-2 border-black flex-shrink-0 group rounded-2xl overflow-hidden shadow-lg translate-z-0">
            <img src={value} alt="Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute top-2 right-2 p-1.5 bg-black text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-neutral-800 rounded-full flex items-center justify-center shadow-xl"
              title="Remove image"
            >
              <X className="w-3 h-3" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white text-[8px] py-1.5 font-black uppercase tracking-widest text-center">
              READY
            </div>
          </div>
        ) : (
          /* Upload button (compact) */
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => inputRef.current?.click()}
            className={`w-24 h-24 border-2 flex-shrink-0 cursor-pointer flex flex-col items-center justify-center gap-1 transition-all rounded-2xl ${
              isDragging
                ? 'border-black bg-black/10 scale-105'
                : 'border-dashed border-black/10 hover:border-black hover:bg-black/5'
            }`}
          >
            {uploading ? (
              <div className="w-5 h-5 border-2 border-black/10 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <Upload className="w-5 h-5 text-black/40 mb-1" />
                <span className="text-[8px] font-black text-black/40 uppercase tracking-widest">DRAG ASSET</span>
              </>
            )}
          </div>
        )}

        <div className="flex-1 min-w-0 flex flex-col gap-3 justify-center">
           <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex-1 px-4 py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-neutral-900 transition-all rounded-xl flex items-center justify-center gap-2 shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              {value ? 'SWAP ASSET' : 'UPLOAD ASSET'}
            </button>
            
            {availableImages.length > 0 && (
              <button
                type="button"
                onClick={() => setShowGallery(true)}
                className="p-3 border-2 border-black text-black hover:bg-black hover:text-white transition-all rounded-xl"
                title="Browse Gallery"
              >
                <FolderOpen className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status messages */}
          {error && <p className="text-[9px] font-black text-red-600 uppercase tracking-widest animate-pulse">⚠️ {error}</p>}
          {success && <p className="text-[9px] font-black text-green-600 uppercase tracking-widest"><CheckCircle className="w-3 h-3 inline mr-1" /> ASSET DEPLOYED</p>}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />

      {/* Modern Brutalist Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 md:p-12 animate-fade-in" onClick={() => setShowGallery(false)}>
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
          <div className="relative bg-white w-full max-w-5xl max-h-full overflow-hidden flex flex-col rounded-[2.5rem] shadow-2xl scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-10 py-8 border-b-2 border-black/5">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-2 h-2 bg-black rounded-full" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/40">Media Infrastructure</span>
                </div>
                <h3 className="text-3xl font-black uppercase tracking-tighter text-black">ASSET REPOSITORY</h3>
              </div>
              <button 
                onClick={() => setShowGallery(false)} 
                className="p-4 bg-black/5 hover:bg-red-600 hover:text-white rounded-full transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 bg-black/[0.01]">
              {availableImages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-20">
                  <Layout className="w-16 h-16 mb-4" />
                  <p className="text-sm font-black uppercase tracking-[0.3em]">No Assets Found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {availableImages.map((img, idx) => {
                    const filename = img.filename || img.public_id?.split('/').pop() || 'image';
                    const isSelected = value === img.url;
                    
                    return (
                      <div
                        key={img.public_id || idx}
                        className={`group relative aspect-square bg-white border-2 transition-all duration-500 cursor-pointer rounded-2xl overflow-hidden ${isSelected ? 'border-black shadow-xl ring-4 ring-black/5 scale-[0.98]' : 'border-black/5 hover:border-black'}`}
                        onClick={() => {
                          onChange(img.url);
                          if (onImageSelect) onImageSelect(img.url);
                          setShowGallery(false);
                        }}
                      >
                        <img src={img.url} alt={filename} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-3 p-4 text-center">
                           <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black shadow-2xl translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                             <CheckCircle className="w-5 h-5" />
                           </div>
                           <span className="text-[10px] font-black uppercase tracking-widest text-white translate-y-4 group-hover:translate-y-0 transition-transform duration-700 delay-75">DEPLOY ASSET</span>
                        </div>

                        {isSelected && (
                          <div className="absolute top-3 right-3 p-1.5 bg-black text-white rounded-lg shadow-xl">
                            <CheckCircle className="w-3 h-3" />
                          </div>
                        )}
                        
                        {/* Filename hint on hover */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-[8px] font-black text-white truncate uppercase tracking-widest">{filename}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="px-10 py-6 border-t-2 border-black/5 bg-white flex items-center justify-between">
               <p className="text-[10px] font-black uppercase tracking-widest text-black/40">Total Assets Available: {availableImages.length}</p>
               <button 
                 onClick={() => setShowGallery(false)}
                 className="px-8 py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-neutral-900 transition-all"
               >
                 CLOSE REPOSITORY
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
