import React, { useState, useRef, useEffect } from 'react';
import FadeInSection from '../components/FadeInSection';
import { useContent } from '../contexts/ContentContext';
import { api } from '../services/api';

interface PortfolioItem {
  id: string;
  type: 'image' | 'video';
  category: string[];
  brand: string;
  name: string;
  year: string;
  media_url: string;
  thumbnail: string;
}

const PortfolioCard: React.FC<{ item: PortfolioItem; isLarge?: boolean; onClick: () => void }> = ({ item, isLarge, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const onEnter = () => { setHovered(true); videoRef.current?.play().catch(() => {}); };
  const onLeave = () => { setHovered(false); if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0; } };

  return (
    <div className="group" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <div className="relative overflow-hidden cursor-pointer mb-6" onClick={onClick}>
        {item.type === 'video' ? (
          <>
            <img src={item.thumbnail} alt={item.brand} className={`w-full ${isLarge ? 'aspect-[21/9]' : 'aspect-[16/9]'} object-cover transition-opacity duration-300 ${hovered ? 'opacity-0' : 'opacity-100'}`} />
            <video ref={videoRef} src={item.media_url} muted loop playsInline className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`} />
          </>
        ) : (
          <img src={item.thumbnail || item.media_url} alt={item.brand} className={`w-full ${isLarge ? 'aspect-[21/9]' : 'aspect-[16/9]'} object-cover transition-transform duration-700 group-hover:scale-105`} />
        )}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
            <svg className="w-6 h-6 text-white -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </div>
        </div>
      </div>
      <div>
        <div className="flex items-baseline gap-4 mb-1">
          <h3 className="text-3xl md:text-4xl font-bold font-['Oswald'] uppercase tracking-tight leading-none">{item.brand}</h3>
          <span className="text-[10px] font-bold text-gray-400">{item.year}</span>
        </div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{item.category?.[0] || 'FEATURED'}</p>
      </div>
    </div>
  );
};

const ProjectsPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [projects, setProjects] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { content } = useContent();
  const c = content.contact;

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await api.projects.getAll();
        if (Array.isArray(data)) {
          setProjects(data.filter((p: any) => p.is_active));
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const categories = ['ALL', ...Array.from(new Set(projects.flatMap(p => p.category || [])))];

  const filtered = projects.filter(i => activeFilter === 'ALL' || i.category?.includes(activeFilter));

  return (
    <section className="bg-white min-h-screen pt-32 pb-20 font-sans">
      {/* Header */}
      <div className="max-w-[1600px] mx-auto px-6 mb-16">
        <div className="flex justify-between items-start mb-8">
          <h1 className="text-[12vw] md:text-[10vw] font-bold leading-[0.8] tracking-tighter text-black font-['Oswald'] uppercase">Projects</h1>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-4 border-t border-black/10 pt-6">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveFilter(cat)}
              className={`text-[10px] font-bold uppercase tracking-[0.1em] transition-all ${activeFilter === cat ? 'text-black' : 'text-gray-300 hover:text-black'}`}>
              [{cat}]
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-[1600px] mx-auto px-6">
        {loading ? (
          <div className="py-40 flex items-center justify-center">
             <div className="w-12 h-12 border-2 border-black/10 border-t-black rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-40 text-center">
            <p className="text-black/40 text-xs font-bold uppercase tracking-[0.3em]">No projects found in this category</p>
          </div>
        ) : (
          <div className="flex flex-col gap-24">
            {filtered[0] && <PortfolioCard item={filtered[0]} isLarge onClick={() => setSelectedItem(filtered[0])} />}
            
            {filtered.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
                {filtered.slice(1, 3).map((item, idx) => (
                  <div key={item.id} className={idx % 2 === 0 ? 'md:mt-24' : ''}>
                    <PortfolioCard item={item} onClick={() => setSelectedItem(item)} />
                  </div>
                ))}
              </div>
            )}

            {filtered.length > 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {filtered.slice(3).map(item => (
                  <PortfolioCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Let's Talk */}
      <div className="max-w-[1600px] mx-auto px-6 mt-40 pt-20 border-t border-black/10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-10">
          <h2 className="text-[15vw] md:text-[12vw] font-bold leading-[0.8] tracking-tighter text-black font-['Oswald'] uppercase">QALA <br className="md:hidden" /> STUDIOS</h2>
          <div className="flex flex-col md:flex-row gap-10 md:gap-20 items-end mb-4">
            <div className="text-[10px] leading-relaxed uppercase tracking-wider text-gray-500 max-w-[220px]">
              <p className="font-bold text-black mb-1">QALA STUDIOS</p>
              <p>{c.phone}</p>
              <p>{c.email}</p>
              <p className="mt-2 whitespace-pre-line">{c.address}</p>
            </div>
            <a href={`mailto:${c.email}`}
              className="w-20 h-20 rounded-full border border-black flex items-center justify-center group hover:bg-black transition-all duration-500">
              <svg className="w-6 h-6 transform -rotate-45 group-hover:text-white transition-colors duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-white/95 backdrop-blur-sm">
          <button onClick={() => setSelectedItem(null)} className="absolute top-8 right-8 text-4xl font-light z-50 hover:rotate-90 transition-transform">×</button>
          <div className="relative w-full max-w-6xl">
            {selectedItem.type === 'video'
              ? <video src={selectedItem.media_url} controls autoPlay className="w-full h-auto max-h-[85vh] object-contain shadow-2xl" />
              : <img src={selectedItem.media_url} alt={selectedItem.brand} className="w-full h-auto max-h-[85vh] object-contain shadow-2xl" />
            }
          </div>
        </div>
      )}
    </section>
  );
};

export default ProjectsPage;
