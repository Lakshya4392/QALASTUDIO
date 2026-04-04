import React from 'react';
import FadeInSection from './FadeInSection';
import { useContent } from '../contexts/ContentContext';

const ServiceGrid: React.FC = () => {
  const { content } = useContent();
  const services = content.services.filter(s => s.isActive);

  return (
    <section className="bg-neutral-50 py-32">
      <div className="px-6 md:px-16">
        {/* Section Header */}
        <div className="mb-32 text-center">
          <FadeInSection>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-400 block mb-6">WHAT WE OFFER</span>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-['Oswald'] font-bold uppercase tracking-tighter text-black leading-[0.9]">
              OUR SERVICES
            </h2>
          </FadeInSection>
          <FadeInSection>
            <p className="mt-8 text-lg md:text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              Comprehensive production support from pre-production to final delivery. Everything you need under one roof.
            </p>
          </FadeInSection>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-12 gap-y-16">
          {services.map((service, idx) => (
            <FadeInSection key={service.id} delay={idx * 100} className="group">
              <article className="flex flex-col h-full bg-white border-2 border-neutral-200 rounded-3xl overflow-hidden hover:border-black transition-all duration-500 hover:shadow-2xl">
                {/* Image Container */}
                <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                  {service.img ? (
                    <img
                      src={service.img}
                      alt={service.name}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 bg-neutral-100"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-50" />
                  )}
                  {/* Category Badge on Image */}
                  <div className="absolute top-4 left-4">
                    <span className="inline-block px-3 py-1.5 bg-white/95 backdrop-blur-sm text-[8px] font-black uppercase tracking-widest text-black border border-black/10 rounded-full shadow-sm">
                      {service.category || 'Service'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 flex flex-col">
                  <h3 className="text-2xl md:text-3xl font-['Oswald'] font-bold uppercase tracking-tight mb-4 group-hover:translate-x-2 transition-transform duration-300 leading-none">
                    {service.name || 'Untitled Service'}
                  </h3>

                  {/* Enquire Button */}
                  <div className="mt-auto pt-4">
                    <button className="w-full py-3 border-2 border-black bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-neutral-900 hover:glow transition-all duration-300 flex items-center justify-center gap-2 group/btn">
                      <span>VIEW DETAILS</span>
                      <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </article>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceGrid;
