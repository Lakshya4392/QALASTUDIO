import React, { useMemo, useState } from 'react';
import FadeInSection from '../components/FadeInSection';
import { useContent } from '../contexts/ContentContext';
import ProjectsCarousel from '../components/ProjectsCarousel';
import { optimizeCloudinaryUrl } from '../services/api';

interface StudioSet {
  id: string;
  name: string;
  category: string;
  theme: string;
  props: string[];
  dimensions: string;
  img: string;
  btsVideo: string;
  description: string;
  coords: { x: number, y: number, w: number, h: number };
  isActive?: boolean;
  price?: string;
  priceNote?: string;
}

// Fallback sets used when no sets are configured in the CMS
const fallbackSets: StudioSet[] = [
  { id: '1', name: 'Golden Hour Lounge', category: 'Indoor', theme: 'Modern', props: ['Vintage Sofa', 'Marble Tables'], dimensions: '40 x 60 ft', img: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=1200', btsVideo: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-posing-in-a-photo-studio-41481-large.mp4', description: "Our flagship space capturing Mohali's iconic sunset vibes.", coords: { x: 50, y: 50, w: 100, h: 100 }, price: '5000', priceNote: 'per hour' },
  { id: '2', name: 'Conversion Room', category: 'Indoor', theme: 'Minimalist', props: ['Rolling Walls', 'Softbox Grid'], dimensions: '35 x 50 ft', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200', btsVideo: 'https://assets.mixkit.co/videos/preview/mixkit-professional-photographer-working-in-a-studio-41477-large.mp4', description: 'A versatile blank canvas for high-concept editorial builds.', coords: { x: 160, y: 50, w: 100, h: 100 }, price: '4500', priceNote: 'per hour' },
  { id: '3', name: 'Dreamcatcher Den', category: 'Indoor', theme: 'Rustic', props: ['Bamboo Hangings', 'Macramé'], dimensions: '25 x 30 ft', img: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=1200', btsVideo: 'https://assets.mixkit.co/videos/preview/mixkit-photographer-taking-pictures-of-a-model-41479-large.mp4', description: 'Intimate texture-rich environment for lifestyle brand stories.', coords: { x: 270, y: 50, w: 80, h: 100 }, price: '3000', priceNote: 'per hour' },
  { id: '4', name: 'The Red Arch', category: 'Indoor', theme: 'Royal', props: ['Velvet Curtains', 'Gold Pedestals'], dimensions: '30 x 45 ft', img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=1200', btsVideo: 'https://assets.mixkit.co/videos/preview/mixkit-girl-with-red-dress-dancing-under-the-sun-41490-large.mp4', description: 'Striking architectural curves with high-contrast lighting.', coords: { x: 50, y: 160, w: 100, h: 80 }, price: '6000', priceNote: 'per hour' },
  { id: '5', name: 'Backdrop Boulevard', category: 'Indoor', theme: 'Industrial', props: ['Motorized Tracks', 'Steel Beams'], dimensions: '20 x 120 ft', img: 'https://images.unsplash.com/photo-1493106819501-66d381c466f1?auto=format&fit=crop&q=80&w=1200', btsVideo: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-posing-in-front-of-a-white-background-41480-large.mp4', description: 'Massive corridor for automotive and large-scale fashion walk-throughs.', coords: { x: 160, y: 160, w: 190, h: 80 }, price: '8000', priceNote: 'per hour' },
  { id: '6', name: 'The Prism Panel', category: 'Indoor', theme: 'Modern', props: ['Glass Mirrors', 'Neon Bars'], dimensions: '28 x 35 ft', img: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=1200', btsVideo: 'https://assets.mixkit.co/videos/preview/mixkit-woman-dancing-in-a-studio-with-lights-41484-large.mp4', description: 'High-key beauty zone with complex reflective surfaces.', coords: { x: 50, y: 250, w: 120, h: 100 }, price: '5500', priceNote: 'per hour' },
  { id: '7', name: 'Heritage Wall', category: 'Indoor', theme: 'Vintage', props: ['Antique Frames', 'Old Books'], dimensions: '30 x 40 ft', img: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80&w=1200', btsVideo: 'https://assets.mixkit.co/videos/preview/mixkit-man-and-woman-dancing-the-tango-in-a-studio-41485-large.mp4', description: 'Hand-crafted stone and aged textures for cinematic portraits.', coords: { x: 180, y: 250, w: 170, h: 100 }, price: '4000', priceNote: 'per hour' },
  { id: '8', name: 'Nature Niche', category: 'Outdoor', theme: 'Rustic', props: ['Raw Stone Walls', 'Plants'], dimensions: '40 x 80 ft', img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200', btsVideo: 'https://assets.mixkit.co/videos/preview/mixkit-drone-view-of-a-beautiful-resort-area-41482-large.mp4', description: "Botanical sanctuary where Punjab's wild flora meets stone.", coords: { x: 360, y: 50, w: 100, h: 150 }, price: '7000', priceNote: 'per hour' },
  { id: '9', name: 'Echoes of Rome', category: 'Outdoor', theme: 'Royal', props: ['White Columns', 'Marble Steps'], dimensions: '50 x 100 ft', img: 'https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&q=80&w=1200', btsVideo: 'https://assets.mixkit.co/videos/preview/mixkit-model-walking-in-a-white-dress-41486-large.mp4', description: 'Grand white colonnades for epic-scale cinematic storytelling.', coords: { x: 470, y: 50, w: 120, h: 150 }, price: '9000', priceNote: 'per hour' },
  { id: '10', name: 'Golden Steps', category: 'Outdoor', theme: 'Modern', props: ['Tiered Concrete', 'LED strips'], dimensions: '30 x 60 ft', img: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&q=80&w=1200', btsVideo: 'https://assets.mixkit.co/videos/preview/mixkit-woman-walking-on-the-steps-of-a-museum-41487-large.mp4', description: 'Tiered platforms oriented for surgical sunset lighting.', coords: { x: 360, y: 210, w: 100, h: 140 }, price: '4500', priceNote: 'per hour' },
  { id: '11', name: 'White Echo', category: 'Outdoor', theme: 'Minimalist', props: ['White Bounce Walls'], dimensions: '40 x 50 ft', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200', btsVideo: 'https://assets.mixkit.co/videos/preview/mixkit-model-posing-in-a-minimalist-setting-41488-large.mp4', description: 'Stark white surfaces where shadows become the main character.', coords: { x: 470, y: 210, w: 120, h: 140 }, price: '4000', priceNote: 'per hour' },
  { id: '12', name: 'The Arch Vault', category: 'Outdoor', theme: 'Industrial', props: ['Iron Arches', 'Brick Floors'], dimensions: '60 x 90 ft', img: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=1200', btsVideo: 'https://assets.mixkit.co/videos/preview/mixkit-man-dancing-hip-hop-in-an-industrial-area-41489-large.mp4', description: 'Dramatic open-air ironwork under the vast Mohali sky.', coords: { x: 360, y: 360, w: 230, h: 80 }, price: '7500', priceNote: 'per hour' },
];

const GoldenHourPage: React.FC = () => {
  const { content } = useContent();
  const gh = content.goldenHour;
  const setsData = (gh?.sets?.length ? gh.sets : fallbackSets) as StudioSet[];
  const [filter, setFilter] = useState<'All' | 'Indoor' | 'Outdoor' | 'Blueprint'>('All');
  const [selectedSet, setSelectedSet] = useState<StudioSet | null>(null);
  const [hoveredMapId, setHoveredMapId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const filteredSets = useMemo(() => {
    const activeSets = setsData.filter(s => s.isActive !== false);
    if (filter === 'All' || filter === 'Blueprint') return activeSets;
    return activeSets.filter(s => s.category === filter);
  }, [filter, setsData]);
  const visibleSets = useMemo(() => setsData.filter(s => s.isActive !== false), [setsData]);
  const featuredSets = useMemo(() => filteredSets.slice(0, 2), [filteredSets]);
  const gridSets = useMemo(() => filteredSets.slice(2, 14), [filteredSets]);

  return (
    <div className="bg-white min-h-screen text-black">
      {/* Header - ServicesPage Style */}
      <div className="pt-32 pb-20 px-6 md:px-16">
        <FadeInSection>
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400 block mb-4">
            {gh.sectionTag}
          </span>
          <h1 className="text-6xl md:text-[9rem] font-['Oswald'] font-bold leading-[0.85] uppercase tracking-tighter max-w-5xl">
            {gh.sectionTitle}
          </h1>
        </FadeInSection>
        <FadeInSection>
          <p className="mt-8 text-xl md:text-2xl text-neutral-600 max-w-3xl leading-relaxed">
            {gh?.sectionDescription || '12 world-class sets designed for cinematic storytelling. Explore our curated collection.'}
          </p>
        </FadeInSection>

        {/* Filters */}
        <FadeInSection>
          <div className="flex gap-8 mt-12">
            {['All', 'Indoor', 'Outdoor', 'Blueprint'].map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat as any)}
                className={`text-sm font-bold uppercase tracking-[0.2em] transition-all pb-2 ${
                  filter === cat
                    ? 'text-black border-b-2 border-black'
                    : 'text-neutral-500 hover:text-black border-b-2 border-transparent'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </FadeInSection>
      </div>

      {/* Blueprint Section (visible only when selected) */}
      <div className="px-3 md:px-6 pb-20">
        {filter === 'Blueprint' && (
          <FadeInSection className="mb-16">
            <div className="mb-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-black rounded-full animate-pulse" />
                {gh?.mapTitle || 'Blueprint Map'}
              </h3>
              <p className="text-[9px] text-neutral-500 leading-relaxed">
                {gh?.mapDescription || 'Click any room to view details. Hover for preview.'}
              </p>
            </div>

            <div className="relative aspect-[16/10] bg-white border-2 border-black overflow-hidden">
              <svg viewBox="0 0 800 600" className="w-full h-full">
                {/* Grid pattern */}
                <defs>
                  <pattern id="gridSmall" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#gridSmall)" />

                {/* Set rectangles */}
                {visibleSets.map(set => (
                  <rect
                    key={set.id}
                    x={set.coords.x}
                    y={set.coords.y}
                    width={set.coords.w}
                    height={set.coords.h}
                    fill={hoveredMapId === set.id ? 'black' : 'white'}
                    stroke="black"
                    strokeWidth="2"
                    className="cursor-pointer transition-all hover:fill-black hover:stroke-black"
                    onMouseEnter={() => setHoveredMapId(set.id)}
                    onMouseLeave={() => setHoveredMapId(null)}
                    onClick={() => setSelectedSet(set)}
                  />
                ))}
              </svg>

              {/* Hover Preview */}
              {hoveredMapId && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-fade-in pointer-events-none">
                  <img
                    src={optimizeCloudinaryUrl(visibleSets.find(s => s.id === hoveredMapId)?.img, { width: 1200 })}
                    className="w-full max-w-2xl aspect-video object-cover mb-4 grayscale"
                    alt="Preview"
                  />
                  <span className="text-[10px] font-black uppercase tracking-widest text-black text-center">
                    {visibleSets.find(s => s.id === hoveredMapId)?.name}
                  </span>
                </div>
              )}
            </div>
          </FadeInSection>
        )}

        {/* Portfolio Layout: Featured + Grid */}
        {filter !== 'Blueprint' && (
          <div className="space-y-8">
            <h2 className="text-[11px] md:text-xs font-bold uppercase tracking-[0.3em] text-neutral-700 flex items-center gap-3">
              <span className="inline-block w-8 h-px bg-black" />
              Studio Tour
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
              {featuredSets.map(set => (
                <FadeInSection key={set.id}>
                  <article
                    className="group cursor-pointer"
                    onMouseEnter={() => setPreviewImage(set.img)}
                    onMouseLeave={() => setPreviewImage(null)}
                    onClick={() => setSelectedSet(set)}
                  >
                    <div className="relative aspect-[16/9] overflow-hidden bg-neutral-100">
                      <img
                        src={optimizeCloudinaryUrl(set.img, { width: 1200 })}
                        alt={set.name}
                        className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-[1.04]"
                      />
                      {previewImage === set.img && (
                        <div className="absolute inset-0 bg-black/25 transition-all duration-300" />
                      )}
                    </div>
                    <div className="pt-1">
                      <h3 className="text-xs md:text-sm font-semibold tracking-tight leading-none">
                        {set.name}
                      </h3>
                    </div>
                  </article>
                </FadeInSection>
              ))}
            </div>

            <h2 className="text-[11px] md:text-xs font-bold uppercase tracking-[0.3em] text-neutral-700 flex items-center gap-3 pt-2">
              <span className="inline-block w-8 h-px bg-black" />
              Your Creative Space
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
              {gridSets.map(set => (
                <FadeInSection key={set.id}>
                  <article
                    className="group cursor-pointer"
                    onMouseEnter={() => setPreviewImage(set.img)}
                    onMouseLeave={() => setPreviewImage(null)}
                    onClick={() => setSelectedSet(set)}
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                      <img
                        src={optimizeCloudinaryUrl(set.img, { width: 800 })}
                        alt={set.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-[1.04]"
                      />
                      {previewImage === set.img && (
                        <div className="absolute inset-0 bg-black/20 transition-all duration-300" />
                      )}
                    </div>
                    <div className="pt-1">
                      <h4 className="text-xs md:text-sm font-semibold tracking-tight leading-none">
                        {set.name}
                      </h4>
                    </div>
                  </article>
                </FadeInSection>
              ))}
            </div>
          </div>
        )}

        {filter !== 'Blueprint' && (
          <ProjectsCarousel title="Studios Highlights" />
        )}
      </div>

      {/* Detail Modal */}
      {selectedSet && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-10 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedSet(null)}
          />

          <div className="relative w-full max-w-7xl bg-white flex flex-col md:flex-row max-h-[90vh] overflow-hidden animate-slide-up">
            <button
              onClick={() => setSelectedSet(null)}
              className="absolute top-6 right-6 z-50 text-4xl font-light hover:rotate-90 transition-transform duration-500"
            >×</button>

            {/* Left: BTS Video + Image */}
            <div className="w-full md:w-[60%] h-[50vh] md:h-auto bg-neutral-100 relative">
              <video
                src={selectedSet.btsVideo}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute top-6 left-6">
                <span className="px-4 py-2 bg-white/90 backdrop-blur-md text-[10px] font-black uppercase tracking-widest">
                  {gh?.btsLabel || 'BTS PREVIEW'}
                </span>
              </div>
            </div>

            {/* Right: Details */}
            <div className="w-full md:w-[40%] p-10 md:p-16 overflow-y-auto">
              <div className="mb-8">
                <span className="text-[9px] font-black uppercase tracking-[0.5em] text-[#D4AF37] mb-4 block">
                  {selectedSet.category} • {selectedSet.theme}
                </span>
                <h2 className="text-5xl font-['Oswald'] font-bold uppercase tracking-tighter mb-6 leading-none">
                  {selectedSet.name}
                </h2>
                <p className="text-neutral-600 text-sm leading-relaxed italic">
                  "{selectedSet.description}"
                </p>
              </div>

              {/* Specs */}
              <div className="space-y-8 mb-12 pb-12 border-b border-black/10">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{gh?.dimensionsLabel || 'DIMENSIONS'}</h4>
                  <p className="text-2xl font-bold">{selectedSet.dimensions}</p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{gh?.propsLabel || 'INCLUDED PROPS'}</h4>
                  <div className="flex flex-wrap gap-3">
                    {selectedSet.props.map(prop => (
                      <span key={prop} className="px-4 py-2 bg-neutral-50 border border-black/10 text-xs font-bold uppercase tracking-wider">
                        {prop}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Commercial Estimate</h4>
                  <div className="flex items-baseline gap-3">
                    <p className="text-4xl font-bold tracking-tighter">₹{selectedSet.price || '0'}</p>
                    <span className="text-[10px] font-black uppercase tracking-widest text-black/30 bg-black/5 px-2 py-1 rounded-md">{selectedSet.priceNote || 'per hour'}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{gh?.availabilityLabel || 'AVAILABILITY'}</h4>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs font-bold uppercase">{gh?.availabilityText || 'READY FOR BOOKING'}</span>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col gap-4">
                <button className="w-full bg-black text-white py-5 uppercase font-black text-xs tracking-[0.3em] hover:invert transition-all">
                  {gh?.primaryCtaLabel || 'BOOK THIS SET'}
                </button>
                <button className="w-full border-2 border-black py-4 uppercase font-black text-xs tracking-widest hover:bg-black hover:text-white transition-all">
                  {gh?.secondaryCtaLabel || 'ADD TO PRODUCTION CART'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoldenHourPage;
