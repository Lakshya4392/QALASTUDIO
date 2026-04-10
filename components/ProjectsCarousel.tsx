import React, { useRef, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

interface ProjectItem {
  id: string;
  type: 'image' | 'video';
  category: string[];
  brand: string;
  name: string;
  year: string;
  media_url: string;
  thumbnail?: string;
  is_active?: boolean;
}

interface Props {
  title?: string;
  onNavigate?: (page: string) => void;
}

const DEMO: ProjectItem[] = [
  { id: 'd1', type: 'image', category: ['STUDIO'], brand: 'Vogue India', name: 'The Ethereal Edit', year: '2025', media_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1400', thumbnail: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800' },
  { id: 'd2', type: 'image', category: ['STUDIO'], brand: 'Tom Ford', name: 'Autumn/Winter Campaign', year: '2025', media_url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1400', thumbnail: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800' },
  { id: 'd3', type: 'image', category: ['GOLDEN HOUR'], brand: 'Nike', name: 'Street Culture Series', year: '2025', media_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1400', thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800' },
  { id: 'd4', type: 'image', category: ['STUDIO'], brand: 'Fenty Beauty', name: 'Glow Campaign', year: '2025', media_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=1400', thumbnail: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=800' },
  { id: 'd5', type: 'image', category: ['EVENTS'], brand: 'BMW', name: 'M Series Launch', year: '2025', media_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1400', thumbnail: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800' },
  { id: 'd6', type: 'image', category: ['GOLDEN HOUR'], brand: 'Gucci', name: 'Digital Art Showcase', year: '2025', media_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1400', thumbnail: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800' },
  { id: 'd7', type: 'image', category: ['STUDIO'], brand: 'Dior', name: 'Spring Collection', year: '2025', media_url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=1400', thumbnail: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=800' },
  { id: 'd8', type: 'image', category: ['FILMS/VIDEOS'], brand: 'Apple', name: 'Product Reveal', year: '2025', media_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1400', thumbnail: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800' },
];

const CARD_W = 300;
const GAP = 16;
const SPEED = 0.5;

const ProjectsCarousel: React.FC<Props> = ({ title = 'Recent Productions', onNavigate }) => {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [selected, setSelected] = useState<ProjectItem | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Scroll refs
  const trackRef = useRef<HTMLDivElement>(null);
  const animRef = useRef(0);
  const offsetRef = useRef(0);
  const pausedRef = useRef(false);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartOffset = useRef(0);
  const didDrag = useRef(false);

  useEffect(() => {
    api.projects.getAll()
      .then((data: any) => {
        if (Array.isArray(data) && data.length > 0) {
          setProjects(data.filter((p: any) => p.is_active !== false));
        } else {
          setProjects(DEMO);
        }
      })
      .catch(() => setProjects(DEMO));
  }, []);

  const loopWidth = projects.length * (CARD_W + GAP);

  // rAF auto-scroll — uses scrollLeft on the overflow container
  const animate = useCallback(() => {
    if (trackRef.current && !pausedRef.current && !isDragging.current && loopWidth > 0) {
      offsetRef.current += SPEED;
      if (offsetRef.current >= loopWidth) offsetRef.current -= loopWidth;
      trackRef.current.scrollLeft = offsetRef.current;
    }
    animRef.current = requestAnimationFrame(animate);
  }, [loopWidth]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [animate]);

  // Mouse drag
  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    didDrag.current = false;
    dragStartX.current = e.clientX;
    dragStartOffset.current = offsetRef.current;
    if (trackRef.current) trackRef.current.style.cursor = 'grabbing';
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !trackRef.current) return;
    const delta = dragStartX.current - e.clientX;
    if (Math.abs(delta) > 4) didDrag.current = true;
    let next = dragStartOffset.current + delta;
    // clamp within tripled range
    const total = loopWidth * 3;
    if (next < 0) next += loopWidth;
    if (next >= total) next -= loopWidth;
    offsetRef.current = next;
    trackRef.current.scrollLeft = next;
  };

  const onMouseUp = () => {
    isDragging.current = false;
    if (trackRef.current) trackRef.current.style.cursor = 'grab';
  };

  const handleCardClick = (p: ProjectItem) => {
    if (!didDrag.current) setSelected(p);
  };

  if (projects.length === 0) return null;

  // Triple for seamless infinite loop
  const items = [...projects, ...projects, ...projects];

  return (
    <>
      <section className="py-16">
        {/* Header */}
        <div className="flex items-center justify-between px-6 md:px-16 mb-8">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400 block mb-1">OUR WORK</span>
            <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tighter leading-none">{title}</h3>
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate('projects')}
              className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 hover:text-black transition-colors"
            >
              View All
              <span className="w-8 h-px bg-neutral-300 group-hover:bg-black group-hover:w-12 transition-all duration-300" />
            </button>
          )}
        </div>

        {/* Track — overflow hidden, drag to scroll, auto-scrolls */}
        <div
          ref={trackRef}
          className="flex gap-4 overflow-x-auto px-6 md:px-16 pb-4 cursor-grab select-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onMouseEnter={() => { pausedRef.current = true; }}
          onMouseLeave={() => { pausedRef.current = false; onMouseUp(); }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
        >
          {items.map((p, i) => (
            <div
              key={`${p.id}-${i}`}
              className="flex-shrink-0 group cursor-pointer"
              style={{ width: CARD_W }}
              onMouseEnter={() => setHoveredId(`${p.id}-${i}`)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => handleCardClick(p)}
            >
              {/* Portrait card — same as ProjectsPage */}
              <div className="relative overflow-hidden bg-neutral-100" style={{ aspectRatio: '3/4' }}>
                {p.type === 'video' ? (
                  <video src={p.media_url} poster={p.thumbnail} muted playsInline
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                ) : (
                  <img src={p.thumbnail || p.media_url} alt={p.name || p.brand} draggable={false} loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                )}
                {/* Hover overlay */}
                <div className={`absolute inset-0 bg-black/50 flex flex-col justify-end p-5 transition-opacity duration-300 ${hoveredId === `${p.id}-${i}` ? 'opacity-100' : 'opacity-0'}`}>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/60 mb-1">{p.category?.[0]}</p>
                  <h3 className="text-white font-black text-xl uppercase tracking-tight leading-none">{p.brand}</h3>
                  {p.name && <p className="text-white/70 text-xs mt-1">{p.name}</p>}
                </div>
                {p.type === 'video' && (
                  <div className="absolute top-3 right-3 w-8 h-8 bg-white flex items-center justify-center">
                    <svg className="w-3 h-3 ml-0.5" fill="black" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                )}
              </div>
              {/* Label below */}
              <div className="pt-3">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400">{p.category?.[0]}</p>
                <h4 className="text-sm font-black uppercase tracking-tight text-black mt-0.5 group-hover:text-neutral-500 transition-colors">{p.brand}</h4>
                {p.name && <p className="text-xs text-neutral-400 mt-0.5">{p.name}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dark modal — same as ProjectsPage */}
      {selected && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 md:p-12"
          onClick={() => setSelected(null)}>
          <button onClick={() => setSelected(null)}
            className="absolute top-5 right-6 text-white/50 hover:text-white text-5xl font-thin leading-none z-10 transition-colors">×</button>
          <div className="w-full max-w-5xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              {selected.category?.[0] && (
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40 border border-white/20 px-2 py-1">{selected.category[0]}</span>
              )}
              {selected.year && <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{selected.year}</span>}
            </div>
            <h2 className="text-white font-black text-3xl md:text-4xl uppercase tracking-tight mb-1">{selected.brand}</h2>
            {selected.name && <p className="text-white/50 text-sm mb-6">{selected.name}</p>}
            {selected.type === 'video' ? (
              <video src={selected.media_url} controls autoPlay className="w-full max-h-[70vh] object-contain" />
            ) : (
              <img src={selected.media_url} alt={selected.brand} className="w-full max-h-[70vh] object-contain" />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectsCarousel;
