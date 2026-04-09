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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
          {services.map((service, idx) => (
            <FadeInSection key={service.id} delay={idx * 100} className="group">
              <article className="relative aspect-[4/5] overflow-hidden cursor-pointer">
                {/* Full-bleed Image */}
                <div className="absolute inset-0 bg-neutral-100">
                  {service.img ? (
                    <img
                      src={service.img}
                      alt={service.name}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-50" />
                  )}
                </div>

                {/* Subtle cinematic overlay */}
                <div className="absolute inset-0 bg-black/15 transition-colors duration-500 ease-out group-hover:bg-black/30" />

                {/* Centered title */}
                <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
                  <h3 className="font-sans text-white text-2xl md:text-3xl font-medium tracking-tight transition-all duration-300 ease-out group-hover:opacity-100">
                    {service.name || 'Untitled Service'}
                  </h3>
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
