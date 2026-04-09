import React, { useEffect, useMemo, useState } from 'react';
import FadeInSection from '../components/FadeInSection';
import { useContent } from '../contexts/ContentContext';
import { api } from '../services/api';

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
}

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

const GoldenHourPage: React.FC = () => {
  const { content } = useContent();
  const gh = content.goldenHour;
  const setsData = (gh?.sets || []) as StudioSet[];
  const [filter, setFilter] = useState<'All' | 'Indoor' | 'Outdoor' | 'Blueprint'>('All');
  const [selectedSet, setSelectedSet] = useState<StudioSet | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [hoveredMapId, setHoveredMapId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [projectStartIndex, setProjectStartIndex] = useState(0);

  const filteredSets = useMemo(() => {
    const activeSets = setsData.filter(s => s.isActive !== false);
    if (filter === 'All' || filter === 'Blueprint') return activeSets;
    return activeSets.filter(s => s.category === filter);
  }, [filter, setsData]);
  const visibleSets = useMemo(() => setsData.filter(s => s.isActive !== false), [setsData]);
  const featuredSets = useMemo(() => filteredSets.slice(0, 2), [filteredSets]);
  const gridSets = useMemo(() => filteredSets.slice(2, 14), [filteredSets]);
  const highlightProjects = useMemo(() => projects.slice(0, 8), [projects]);

  const visibleProjectCards = useMemo(() => {
    if (highlightProjects.length <= 2) return highlightProjects;
    return [
      highlightProjects[projectStartIndex % highlightProjects.length],
      highlightProjects[(projectStartIndex + 1) % highlightProjects.length],
    ];
  }, [highlightProjects, projectStartIndex]);

  const projectMediaSet = useMemo(() => {
    if (!selectedProject) return [];
    const related = projects.filter(
      p =>
        p.id !== selectedProject.id &&
        p.category?.some(cat => selectedProject.category?.includes(cat))
    );
    return [selectedProject, ...related].slice(0, 4);
  }, [selectedProject, projects]);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await api.projects.getAll();
        if (!Array.isArray(data)) return;
        const activeProjects = data.filter((p: any) => p.is_active !== false);
        setProjects(activeProjects);
      } catch (error) {
        console.error('Failed to load project highlights:', error);
      }
    };

    loadProjects();
  }, []);

  const nextProjects = () => {
    if (highlightProjects.length <= 2) return;
    setProjectStartIndex(prev => (prev + 1) % highlightProjects.length);
  };

  const prevProjects = () => {
    if (highlightProjects.length <= 2) return;
    setProjectStartIndex(prev => (prev - 1 + highlightProjects.length) % highlightProjects.length);
  };

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
            {gh.sectionDescription}
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
                {gh.mapTitle}
              </h3>
              <p className="text-[9px] text-neutral-500 leading-relaxed">
                {gh.mapDescription}
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
                    src={visibleSets.find(s => s.id === hoveredMapId)?.img}
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
                        src={set.img}
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
                        src={set.img}
                        alt={set.name}
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

        {highlightProjects.length > 0 && filter !== 'Blueprint' && (
          <FadeInSection className="mt-20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl md:text-3xl font-semibold uppercase tracking-tight">Studios Highlights</h3>
              <button className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 hover:text-black transition-colors">
                View All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
              {visibleProjectCards.map(project => (
                <article
                  key={project.id}
                  className="group cursor-pointer"
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-neutral-100">
                    {project.type === 'video' ? (
                      <video
                        src={project.media_url}
                        poster={project.thumbnail}
                        muted
                        playsInline
                        className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-[1.04]"
                      />
                    ) : (
                      <img
                        src={project.thumbnail || project.media_url}
                        alt={project.name}
                        className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-[1.04]"
                      />
                    )}
                  </div>
                  <div className="pt-1">
                    <p className="text-[11px] font-semibold leading-none">{project.name || project.brand}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                onClick={prevProjects}
                className="px-3 py-1 border border-black/20 text-[10px] uppercase tracking-[0.2em] hover:border-black transition-colors"
              >
                Prev
              </button>
              <button
                onClick={nextProjects}
                className="px-3 py-1 border border-black/20 text-[10px] uppercase tracking-[0.2em] hover:border-black transition-colors"
              >
                Next
              </button>
            </div>
          </FadeInSection>
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
                  {gh.btsLabel}
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
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{gh.dimensionsLabel}</h4>
                  <p className="text-2xl font-bold">{selectedSet.dimensions}</p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{gh.propsLabel}</h4>
                  <div className="flex flex-wrap gap-3">
                    {selectedSet.props.map(prop => (
                      <span key={prop} className="px-4 py-2 bg-neutral-50 border border-black/10 text-xs font-bold uppercase tracking-wider">
                        {prop}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{gh.availabilityLabel}</h4>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs font-bold uppercase">{gh.availabilityText}</span>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col gap-4">
                <button className="w-full bg-black text-white py-5 uppercase font-black text-xs tracking-[0.3em] hover:invert transition-all">
                  {gh.primaryCtaLabel}
                </button>
                <button className="w-full border-2 border-black py-4 uppercase font-black text-xs tracking-widest hover:bg-black hover:text-white transition-all">
                  {gh.secondaryCtaLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedProject && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-3 md:p-6 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/75"
            onClick={() => setSelectedProject(null)}
          />

          <div className="relative w-full max-w-7xl bg-white max-h-[92vh] overflow-hidden">
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-2 right-4 z-40 text-3xl font-light hover:rotate-90 transition-transform"
            >
              ×
            </button>

            <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] h-full">
              <aside className="p-6 md:p-8 border-r border-black/10 overflow-y-auto">
                <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-3">
                  Studios
                </p>
                <h4 className="text-3xl font-semibold tracking-tight mb-4">
                  {selectedProject.name || selectedProject.brand}
                </h4>
                <p className="text-sm leading-relaxed text-neutral-700">
                  {selectedProject.brand} campaign captured in Golden Hour Studio sets. This production highlights our
                  cinematic environments, controlled lighting, and editorial-ready floors designed for premium visual storytelling.
                </p>
              </aside>

              <div className="p-3 md:p-4 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {projectMediaSet.map(media => (
                    <div key={media.id} className="bg-black">
                      {media.type === 'video' ? (
                        <video
                          src={media.media_url}
                          poster={media.thumbnail}
                          controls
                          className="w-full h-full max-h-[360px] object-cover"
                        />
                      ) : (
                        <img
                          src={media.media_url}
                          alt={media.name || media.brand}
                          className="w-full h-full max-h-[360px] object-cover"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoldenHourPage;
