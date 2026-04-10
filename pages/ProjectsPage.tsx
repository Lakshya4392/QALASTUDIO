import React, { useState, useRef, useEffect } from 'react';
import FadeInSection from '../components/FadeInSection';
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

const DEMO: PortfolioItem[] = [
  { id: 'd1', type: 'image', category: ['STUDIO'], brand: 'Vogue India', name: 'The Ethereal Edit', year: '2025', media_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1400', thumbnail: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1400' },
  { id: 'd2', type: 'image', category: ['STUDIO'], brand: 'Tom Ford', name: 'Autumn/Winter Campaign', year: '2025', media_url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1400', thumbnail: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1400' },
  { id: 'd3', type: 'image', category: ['STUDIO'], brand: 'New Balance', name: 'Sneaker Drop 574', year: '2025', media_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1400', thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1400' },
  { id: 'd4', type: 'image', category: ['GOLDEN HOUR'], brand: 'Nike', name: 'Street Culture Series', year: '2025', media_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1400', thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1400' },
  { id: 'd5', type: 'image', category: ['STUDIO'], brand: 'Fenty Beauty', name: 'Glow Campaign', year: '2025', media_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=1400', thumbnail: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=1400' },
  { id: 'd6', type: 'image', category: ['EVENTS'], brand: 'BMW', name: 'M Series Launch', year: '2025', media_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1400', thumbnail: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1400' },
  { id: 'd7', type: 'image', category: ['EVENTS'], brand: 'Botanical', name: 'Interior Lookbook', year: '2025', media_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=1400', thumbnail: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=1400' },
  { id: 'd8', type: 'image', category: ['FILMS/VIDEOS'], brand: 'Apple', name: 'Product Reveal', year: '2025', media_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1400', thumbnail: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1400' },
  { id: 'd9', type: 'image', category: ['GOLDEN HOUR'], brand: 'Gucci', name: 'Digital Art Showcase', year: '2025', media_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1400', thumbnail: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1400' },
  { id: 'd10', type: 'image', category: ['STUDIO'], brand: 'Dior', name: 'Spring Collection', year: '2025', media_url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=1400', thumbnail: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=1400' },
  { id: 'd11', type: 'image', category: ['FILMS/VIDEOS'], brand: 'Sony', name: 'Alpha Series Film', year: '2025', media_url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=1400', thumbnail: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=1400' },
  { id: 'd12', type: 'image', category: ['EVENTS'], brand: 'Prada', name: 'Runway Backstage', year: '2025', media_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=1400', thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=1400' },
  { id: 'd13', type: 'image', category: ['GOLDEN HOUR'], brand: 'Zara', name: 'Golden Light Series', year: '2025', media_url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=1400', thumbnail: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=1400' },
  { id: 'd14', type: 'image', category: ['STUDIO'], brand: 'Chanel', name: 'No.5 Campaign', year: '2025', media_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=1400', thumbnail: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=1400' },
  { id: 'd15', type: 'image', category: ['FILMS/VIDEOS'], brand: 'Red Bull', name: 'Extreme Sports Doc', year: '2025', media_url: 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?auto=format&fit=crop&q=80&w=1400', thumbnail: 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?auto=format&fit=crop&q=80&w=1400' },
  { id: 'd16', type: 'image', category: ['EVENTS'], brand: 'Rolex', name: 'Timeless Moments', year: '2025', media_url: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=1400', thumbnail: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=1400' },
];

const FILTERS = ['ALL', 'STUDIO', 'GOLDEN HOUR', 'EVENTS', 'FILMS/VIDEOS'];

const Card: React.FC<{ item: PortfolioItem; onClick: () => void }> = ({ item, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  return (
    <div
      className="group cursor-pointer"
      onMouseEnter={() => { setHovered(true); if (item.type === 'video') videoRef.current?.play().catch(() => {}); }}
      onMouseLeave={() => { setHovered(false); if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0; } }}
      onClick={onClick}
    >
      <div className="relative overflow-hidden bg-neutral-100 aspect-[3/4]">
        {item.type === 'video' ? (
          <>
            <img src={item.thumbnail} alt={item.brand} loading="lazy"
              className={`w-full h-full object-cover transition-opacity duration-500 ${hovered ? 'opacity-0' : 'opacity-100'}`} />
            <video ref={videoRef} src={item.media_url} muted loop playsInline
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${hovered ? 'opacity-100' : 'opacity-0'}`} />
            <div className="absolute top-3 right-3 w-8 h-8 bg-white flex items-center justify-center">
              <svg className="w-3 h-3 ml-0.5" fill="black" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </div>
          </>
        ) : (
          <img src={item.thumbnail || item.media_url} alt={item.brand} loading="lazy" decoding="async"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
        )}
        <div className={`absolute inset-0 bg-black/50 flex flex-col justify-end p-5 transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/60 mb-1">{item.category?.[0]}</p>
          <h3 className="text-white font-black text-xl uppercase tracking-tight leading-none">{item.brand}</h3>
          {item.name && <p className="text-white/70 text-xs mt-1">{item.name}</p>}
        </div>
      </div>
      <div className="pt-3">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400">{item.category?.[0]}</p>
        <h3 className="text-sm font-black uppercase tracking-tight text-black mt-0.5 group-hover:text-neutral-500 transition-colors">{item.brand}</h3>
        {item.name && <p className="text-xs text-neutral-400 mt-0.5">{item.name}</p>}
      </div>
    </div>
  );
};

const ProjectsPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [apiProjects, setApiProjects] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.projects.getAll()
      .then((data: any) => {
        if (Array.isArray(data)) setApiProjects(data.filter((p: any) => p.is_active));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const all = apiProjects.length > 0 ? apiProjects : DEMO;
  const filtered = activeFilter === 'ALL' ? all : all.filter(i => i.category?.includes(activeFilter));

  return (
    <div className="bg-white min-h-screen text-black">
      <div className="pt-32 pb-0 px-6 md:px-12 max-w-[1600px] mx-auto">
        <FadeInSection>
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400 block mb-4">OUR WORK</span>
          <h1 className="text-6xl md:text-[9rem] font-['Oswald'] font-bold leading-[0.85] uppercase tracking-tighter max-w-5xl">PROJECTS</h1>
        </FadeInSection>
        <FadeInSection>
          <p className="mt-4 text-lg text-neutral-500 max-w-xl">A curated selection of productions shot at Qala Studios.</p>
        </FadeInSection>
      </div>

      <div className="sticky top-[64px] z-40 bg-white border-b border-neutral-200 mt-8">
        <div className="px-6 md:px-12 max-w-[1600px] mx-auto flex items-center">
          {FILTERS.map(cat => (
            <button key={cat} onClick={() => setActiveFilter(cat)}
              className={`px-5 py-4 text-[11px] font-bold uppercase tracking-[0.15em] transition-all whitespace-nowrap border-b-2 -mb-px ${activeFilter === cat ? 'text-black border-black' : 'text-neutral-400 border-transparent hover:text-black'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 md:px-12 pt-10 pb-24 max-w-[1600px] mx-auto">
        {loading ? (
          <div className="py-40 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-black/10 border-t-black rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-40 text-center">
            <p className="text-neutral-400 text-xs font-bold uppercase tracking-[0.3em]">No projects found</p>
          </div>
        ) : (
          <FadeInSection>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {filtered.map(item => (
                <Card key={item.id} item={item} onClick={() => setSelectedItem(item)} />
              ))}
            </div>
          </FadeInSection>
        )}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 md:p-12" onClick={() => setSelectedItem(null)}>
          <button onClick={() => setSelectedItem(null)} className="absolute top-5 right-6 text-white/50 hover:text-white text-5xl font-thin leading-none z-10 transition-colors">×</button>
          <div className="w-full max-w-5xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              {selectedItem.category?.[0] && (
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40 border border-white/20 px-2 py-1">{selectedItem.category[0]}</span>
              )}
              {selectedItem.year && <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{selectedItem.year}</span>}
            </div>
            <h2 className="text-white font-['Oswald'] font-bold text-3xl md:text-4xl uppercase tracking-tight mb-1">{selectedItem.brand}</h2>
            {selectedItem.name && <p className="text-white/50 text-sm mb-6">{selectedItem.name}</p>}
            {selectedItem.type === 'video' ? (
              <video src={selectedItem.media_url} controls autoPlay className="w-full max-h-[70vh] object-contain" />
            ) : (
              <img src={selectedItem.media_url} alt={selectedItem.brand} className="w-full max-h-[70vh] object-contain" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
