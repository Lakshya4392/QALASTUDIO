import React, { useState, useEffect } from 'react';
import BookingModal from '../components/BookingModal';
import FadeInSection from '../components/FadeInSection';
import { api, optimizeCloudinaryUrl } from '../services/api';
import ProjectsCarousel from '../components/ProjectsCarousel';

interface Studio {
  id: string;
  name: string;
  type: string;
  img: string;
  description: string;
  price: string;
  priceNote: string;
  features: string[];
}

// Blueprint SVG — matches the clean architectural floor plan style from the reference image
const BlueprintMap: React.FC<{ studios: Studio[]; onSelect: (s: Studio) => void; hovered: string | null; onHover: (id: string | null) => void }> = ({ studios, onSelect, hovered, onHover }) => {
  // Layout mirrors the reference: Studio 1 (tall left), Stage C (large center), Studio 4+5 (stacked right), Event Wing (dashed far right)
  const slots: { x: number; y: number; w: number; h: number; label: string; dashed?: boolean }[] = [
    { x: 60,  y: 60,  w: 160, h: 220, label: 'STUDIO 1' },
    { x: 228, y: 60,  w: 220, h: 220, label: 'STAGE C' },
    { x: 456, y: 60,  w: 160, h: 100, label: 'STUDIO 4' },
    { x: 456, y: 168, w: 160, h: 112, label: 'STUDIO 5' },
    { x: 624, y: 60,  w: 160, h: 220, label: 'EVENT WING', dashed: true },
  ];

  const VB_W = 860;
  const VB_H = 340;

  return (
    <div className="w-full">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-black uppercase tracking-[0.35em]">Interactive Floor Plan</span>
        <button className="text-[10px] font-bold uppercase tracking-widest underline underline-offset-4 hover:opacity-60 transition-opacity">
          Download Full Floor Plan (PDF)
        </button>
      </div>

      {/* Floor plan canvas */}
      <div className="bg-[#ebebeb] w-full rounded-sm overflow-hidden">
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full h-auto" style={{ display: 'block' }}>
          {slots.map((slot, i) => {
            const studio = studios[i];
            const isHovered = studio && hovered === studio.id;
            const label = studio ? studio.name.toUpperCase() : slot.label;

            return (
              <g key={i}
                className={studio ? 'cursor-pointer' : ''}
                onMouseEnter={() => studio && onHover(studio.id)}
                onMouseLeave={() => onHover(null)}
                onClick={() => studio && onSelect(studio)}
              >
                {/* Room fill */}
                <rect
                  x={slot.x} y={slot.y}
                  width={slot.w} height={slot.h}
                  fill={isHovered ? '#1a1a1a' : 'white'}
                  stroke={isHovered ? '#1a1a1a' : '#1a1a1a'}
                  strokeWidth={slot.dashed ? 0 : 1.5}
                  strokeDasharray={slot.dashed ? '6 4' : undefined}
                />
                {/* Dashed border drawn separately so fill stays white */}
                {slot.dashed && (
                  <rect
                    x={slot.x} y={slot.y}
                    width={slot.w} height={slot.h}
                    fill="none"
                    stroke="#1a1a1a"
                    strokeWidth="1.5"
                    strokeDasharray="6 4"
                  />
                )}

                {/* Room label */}
                <text
                  x={slot.x + slot.w / 2}
                  y={slot.y + slot.h / 2 + (studio ? -6 : 0)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="11"
                  fontWeight="700"
                  fill={isHovered ? 'white' : '#1a1a1a'}
                  style={{ fontFamily: 'sans-serif', letterSpacing: '0.12em' }}
                  className="pointer-events-none select-none"
                >
                  {label}
                </text>

                {/* Studio type subtitle */}
                {studio && (
                  <text
                    x={slot.x + slot.w / 2}
                    y={slot.y + slot.h / 2 + 12}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="8"
                    fontWeight="400"
                    fill={isHovered ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.4)'}
                    style={{ fontFamily: 'sans-serif', letterSpacing: '0.06em' }}
                    className="pointer-events-none select-none"
                  >
                    {studio.type.length > 18 ? studio.type.slice(0, 18) + '…' : studio.type}
                  </text>
                )}

                {/* Hover CTA */}
                {isHovered && studio && (
                  <text
                    x={slot.x + slot.w / 2}
                    y={slot.y + slot.h - 14}
                    textAnchor="middle"
                    fontSize="7"
                    fontWeight="700"
                    fill="rgba(255,255,255,0.45)"
                    style={{ fontFamily: 'sans-serif', letterSpacing: '0.15em' }}
                    className="pointer-events-none select-none"
                  >
                    CLICK TO VIEW
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

const StudiosPage: React.FC = () => {
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingStudio, setBookingStudio] = useState<Studio | null>(null);
  const [selectedStudio, setSelectedStudio] = useState<Studio | null>(null);
  const [filter, setFilter] = useState<'All' | 'Blueprint'>('All');
  const [hovered, setHovered] = useState<string | null>(null);
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  useEffect(() => {
    api.studios.getAll()
      .then((res: any) => {
        const arr = Array.isArray(res) ? res : [];
        setStudios(arr.filter((s: any) => s.is_active !== false).map((s: any) => ({
          id: s.id,
          name: s.name,
          type: s.tagline || 'Production Space',
          img: s.image_url || '',
          description: s.description || '',
          price: s.price ? `₹${Number(s.price).toLocaleString('en-IN')}` : 'Contact for pricing',
          priceNote: s.price_note || 'per hour',
          features: s.features || [],
        })));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const featured = studios.slice(0, 2);
  const grid = studios.slice(2);

  return (
    <div className="bg-white min-h-screen pt-32 pb-20 text-black">

      {/* Header */}
      <div className="px-6 md:px-16 mb-8">
        <FadeInSection>
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400 block mb-4">OUR SPACES</span>
          <h1 className="text-6xl md:text-[9rem] font-['Oswald'] font-bold leading-[0.85] uppercase tracking-tighter max-w-5xl">
            STUDIOS
          </h1>
        </FadeInSection>
        <FadeInSection>
          <p className="mt-6 text-xl md:text-2xl text-neutral-600 max-w-3xl leading-relaxed">
            Premier production spaces built for world-class shoots. Every studio is fully equipped and ready to book.
          </p>
        </FadeInSection>

        {/* Filters */}
        <FadeInSection>
          <div className="flex gap-8 mt-10">
            {(['All', 'Blueprint'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`text-sm font-bold uppercase tracking-[0.2em] transition-all pb-2 ${
                  filter === cat
                    ? 'text-black border-b-2 border-black'
                    : 'text-neutral-400 hover:text-black border-b-2 border-transparent'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </FadeInSection>
      </div>

      <div className="px-3 md:px-6 pb-20">
        {loading ? (
          <div className="py-40 flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-black/10 border-t-black rounded-full animate-spin" />
          </div>
        ) : studios.length === 0 ? (
          <div className="py-40 text-center">
            <p className="text-neutral-400 text-xs font-bold uppercase tracking-[0.3em]">No studios available</p>
          </div>
        ) : (
          <>
            {/* Blueprint view */}
            {filter === 'Blueprint' && (
              <FadeInSection className="mb-10 px-2 md:px-6">
                <BlueprintMap
                  studios={studios}
                  onSelect={setSelectedStudio}
                  hovered={hovered}
                  onHover={setHovered}
                />
              </FadeInSection>
            )}

            {/* Studio Tour — same as GoldenHour */}
            {filter === 'All' && (
              <div className="space-y-3">
                <h2 className="text-[11px] md:text-xs font-bold uppercase tracking-[0.3em] text-neutral-700 flex items-center gap-3 px-1 mb-2">
                  <span className="inline-block w-8 h-px bg-black" />
                  Studio Tour
                </h2>

                {/* Featured 2-col */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                  {featured.map(studio => (
                    <FadeInSection key={studio.id}>
                      <article
                        className="group cursor-pointer"
                        onMouseEnter={() => setPreviewImg(studio.id)}
                        onMouseLeave={() => setPreviewImg(null)}
                        onClick={() => setSelectedStudio(studio)}
                      >
                        <div className="relative aspect-[16/9] overflow-hidden bg-neutral-100">
                          {studio.img ? (
                            <img src={optimizeCloudinaryUrl(studio.img, { width: 1200 })} alt={studio.name}
                              className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-[1.04]"
                              loading="lazy" decoding="async" />
                          ) : <div className="w-full h-full bg-neutral-200" />}
                          {previewImg === studio.id && <div className="absolute inset-0 bg-black/20 transition-all duration-300" />}
                          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/90 px-2 py-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Available</span>
                          </div>
                        </div>
                        <div className="pt-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{studio.type}</p>
                          <h3 className="text-sm md:text-base font-semibold uppercase tracking-tight leading-none mt-0.5">{studio.name}</h3>
                        </div>
                      </article>
                    </FadeInSection>
                  ))}
                </div>

                {/* 3-col grid */}
                {grid.length > 0 && (
                  <>
                    <h2 className="text-[11px] md:text-xs font-bold uppercase tracking-[0.3em] text-neutral-700 flex items-center gap-3 px-1 pt-4 mb-2">
                      <span className="inline-block w-8 h-px bg-black" />
                      All Spaces
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                      {grid.map(studio => (
                        <FadeInSection key={studio.id}>
                          <article
                            className="group cursor-pointer"
                            onMouseEnter={() => setPreviewImg(studio.id)}
                            onMouseLeave={() => setPreviewImg(null)}
                            onClick={() => setSelectedStudio(studio)}
                          >
                            <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                              {studio.img ? (
                                <img src={optimizeCloudinaryUrl(studio.img, { width: 800 })} alt={studio.name}
                                  className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-[1.04]"
                                  loading="lazy" decoding="async" />
                              ) : <div className="w-full h-full bg-neutral-200" />}
                              {previewImg === studio.id && <div className="absolute inset-0 bg-black/20 transition-all duration-300" />}
                              <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/90 px-2 py-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Available</span>
                              </div>
                            </div>
                            <div className="pt-1">
                              <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400">{studio.type}</p>
                              <h4 className="text-xs md:text-sm font-semibold uppercase tracking-tight leading-none mt-0.5">{studio.name}</h4>
                            </div>
                          </article>
                        </FadeInSection>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Projects Carousel */}
      <ProjectsCarousel title="Recent Productions" />

      {/* Studio Detail Modal — GoldenHour style */}
      {selectedStudio && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-10 animate-fade-in">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedStudio(null)} />

          <div className="relative w-full max-w-7xl bg-white flex flex-col md:flex-row max-h-[90vh] overflow-hidden animate-slide-up">
            <button
              onClick={() => setSelectedStudio(null)}
              className="absolute top-6 right-6 z-50 text-4xl font-light hover:rotate-90 transition-transform duration-500"
            >×</button>

            {/* Left: Image */}
            <div className="w-full md:w-[60%] h-[50vh] md:h-auto bg-neutral-100 relative overflow-hidden">
              {selectedStudio.img
                ? <img src={optimizeCloudinaryUrl(selectedStudio.img, { width: 1200 })} alt={selectedStudio.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-neutral-200" />
              }
              <div className="absolute top-6 left-6">
                <span className="px-4 py-2 bg-white/90 backdrop-blur-md text-[10px] font-black uppercase tracking-widest">
                  {selectedStudio.type}
                </span>
              </div>
            </div>

            {/* Right: Details */}
            <div className="w-full md:w-[40%] p-10 md:p-16 overflow-y-auto">
              <div className="mb-8">
                <span className="text-[9px] font-black uppercase tracking-[0.5em] text-[#D4AF37] mb-4 block">
                  PRODUCTION SPACE
                </span>
                <h2 className="text-5xl font-['Oswald'] font-bold uppercase tracking-tighter mb-6 leading-none">
                  {selectedStudio.name}
                </h2>
                <p className="text-neutral-600 text-sm leading-relaxed italic">
                  "{selectedStudio.description}"
                </p>
              </div>

              <div className="space-y-8 mb-12 pb-12 border-b border-black/10">
                {selectedStudio.features.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400">FEATURES</h4>
                    <div className="flex flex-wrap gap-3">
                      {selectedStudio.features.map((f, i) => (
                        <span key={i} className="px-4 py-2 bg-neutral-50 border border-black/10 text-xs font-bold uppercase tracking-wider">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400">COMMERCIAL ESTIMATE</h4>
                  <div className="flex items-baseline gap-3">
                    <p className="text-4xl font-bold tracking-tighter">{selectedStudio.price}</p>
                    <span className="text-[10px] font-black uppercase tracking-widest text-black/30 bg-black/5 px-2 py-1 rounded-md">{selectedStudio.priceNote}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400">AVAILABILITY</h4>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs font-bold uppercase">READY FOR BOOKING</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button
                  className="w-full bg-black text-white py-5 uppercase font-black text-xs tracking-[0.3em] hover:invert transition-all"
                  onClick={() => { setBookingStudio(selectedStudio); setSelectedStudio(null); }}
                >
                  BOOK THIS STUDIO
                </button>
                <button
                  className="w-full border-2 border-black py-4 uppercase font-black text-xs tracking-widest hover:bg-black hover:text-white transition-all"
                  onClick={() => setSelectedStudio(null)}
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {bookingStudio && (
        <BookingModal studioId={bookingStudio.id} studioName={bookingStudio.name} onClose={() => setBookingStudio(null)} />
      )}
    </div>
  );
};

export default StudiosPage;
