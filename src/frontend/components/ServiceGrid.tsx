import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FadeInSection from './FadeInSection';
import { useContent } from '../contexts/ContentContext';
import { optimizeCloudinaryUrl } from '../services/cloudinary';

const ServiceGrid: React.FC = () => {
  const { content } = useContent();
  const navigate = useNavigate();
  const services = content.services.filter(s => s.isActive);
  const [hovered, setHovered] = useState<string | null>(null);

  const featured = services.slice(0, 2);
  const grid = services.slice(2);

  return (
    <section className="bg-white py-20 px-3 md:px-6">
      {/* Header */}
      <div className="mb-8 px-3 md:px-0">
        <FadeInSection>
          <h2 className="text-[11px] md:text-xs font-bold uppercase tracking-[0.3em] text-neutral-700 flex items-center gap-3">
            <span className="inline-block w-8 h-px bg-black" />
            What We Offer
          </h2>
        </FadeInSection>
      </div>

      {/* Featured 2-col */}
      {featured.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 mb-3">
          {featured.map(service => (
            <FadeInSection key={service.id}>
              <article
                className="group cursor-pointer"
                onMouseEnter={() => setHovered(service.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => navigate('/services')}
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-neutral-100">
                  {service.img ? (
                    <img
                      src={optimizeCloudinaryUrl(service.img, { width: 900, crop: 'fill', gravity: 'auto' })}
                      alt={service.name}
                      className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-[1.04]"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-200" />
                  )}
                  {hovered === service.id && (
                    <div className="absolute inset-0 bg-black/20 transition-all duration-300" />
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-[9px] font-black uppercase tracking-widest">
                      {service.category || 'Service'}
                    </span>
                  </div>
                </div>
                <div className="pt-2">
                  <h3 className="text-sm md:text-base font-semibold uppercase tracking-tight leading-none">
                    {service.name}
                  </h3>
                </div>
              </article>
            </FadeInSection>
          ))}
        </div>
      )}

      {/* Rest — 3-col grid */}
      {grid.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
          {grid.map(service => (
            <FadeInSection key={service.id}>
              <article
                className="group cursor-pointer"
                onMouseEnter={() => setHovered(service.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => navigate('/services')}
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                  {service.img ? (
                    <img
                      src={optimizeCloudinaryUrl(service.img, { width: 700, crop: 'fill', gravity: 'auto' })}
                      alt={service.name}
                      className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-[1.04]"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-200" />
                  )}
                  {hovered === service.id && (
                    <div className="absolute inset-0 bg-black/20 transition-all duration-300" />
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-[9px] font-black uppercase tracking-widest">
                      {service.category || 'Service'}
                    </span>
                  </div>
                </div>
                <div className="pt-1">
                  <h4 className="text-xs md:text-sm font-semibold uppercase tracking-tight leading-none">
                    {service.name}
                  </h4>
                </div>
              </article>
            </FadeInSection>
          ))}
        </div>
      )}

      {/* View all CTA */}
      <FadeInSection>
        <div className="mt-8 flex justify-end px-1">
          <button
            onClick={() => navigate('/services')}
            className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 hover:text-black transition-colors flex items-center gap-2"
          >
            View All Services
            <span className="w-8 h-px bg-current inline-block" />
          </button>
        </div>
      </FadeInSection>
    </section>
  );
};

export default ServiceGrid;
