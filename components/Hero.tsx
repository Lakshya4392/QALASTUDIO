import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContent } from '../contexts/ContentContext';

interface HeroProps {
  onNavigate: (page: 'home' | 'studios' | 'services' | 'contact' | 'golden-hour' | 'about' | 'projects' | 'book') => void;
}

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { content } = useContent();
  const h = content.hero;

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.opacity = '0';
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.style.transition = 'opacity 1.2s ease-out';
          containerRef.current.style.opacity = '1';
        }
      }, 100);
    }
  }, []);

  return (
    <section className="h-screen bg-black relative overflow-hidden">
      {/* Full viewport background image */}
      <div ref={containerRef} className="absolute inset-0">
        <img
          src="/hero_editorial.png"
          alt="Qala Studios Premium Production"
          className="w-full h-full object-cover object-center"
          fetchPriority="high"
          decoding="async"
        />
        {/* Clean gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* Content positioned bottom-left with proper spacing */}
      <div className="relative h-full">
        <div className="absolute left-8 md:left-16 lg:left-24 bottom-12 md:bottom-20 max-w-2xl">
          {/* Tagline */}
          <p className="text-xs md:text-sm font-bold uppercase tracking-widest text-white/70 mb-4">
            {h.tagline} · {h.location}
          </p>

          {/* Headline - BIG and BOLD */}
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-['Oswald'] font-bold leading-[0.9] uppercase text-white mb-6">
            {h.headline || 'QALA'}
          </h1>

          {/* Tagline2 */}
          {h.tagline2 && (
            <p className="text-base md:text-xl font-medium uppercase tracking-wide text-white/90 mb-8 max-w-xl">
              {h.tagline2}
            </p>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/studios')}
              className="px-10 py-4 bg-white text-black text-sm font-bold uppercase tracking-wider hover:bg-gray-100 transition-colors duration-300 w-fit"
            >
              {h.ctaPrimary || 'Explore Studios'}
            </button>
            <button
              onClick={() => navigate('/services')}
              className="px-10 py-4 border-2 border-white text-white text-sm font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-colors duration-300 w-fit"
            >
              {h.ctaSecondary || 'Our Services'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
