
import React from 'react';
import FadeInSection from './FadeInSection';

const productions = [
  { brand: 'Vogue India', project: 'The Ethereal Edit', img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1200' },
  { brand: 'Tom Ford', project: 'Autumn/Winter Campaign', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1200' },
  { brand: 'Gucci', project: 'Digital Art Showcase', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1200' },
  { brand: 'Dior', project: 'Spring Collection', img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1200' },
];

interface RecentProductionsProps {
  onNavigate: (page: 'home' | 'studios' | 'services' | 'contact' | 'golden-hour' | 'about' | 'projects' | 'book') => void;
}

const RecentProductions: React.FC<RecentProductionsProps> = ({ onNavigate }) => {
  return (
    <section className="bg-[#F5F5F7] py-32 px-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div>
            <FadeInSection>
              <h2 className="text-[10px] font-montserrat font-black uppercase tracking-[0.5em] text-[#D4AF37] mb-4">OUR WORK</h2>
              <h1 className="text-6xl md:text-8xl font-montserrat font-black tracking-tighter uppercase leading-none text-[#1D1D1F]">
                RECENT<br />PRODUCTIONS
              </h1>
            </FadeInSection>
            <FadeInSection>
              <p className="mt-6 font-lora text-xl text-[#1D1D1F]/70 max-w-xl leading-relaxed">
                A curated selection of our finest work. Every frame tells a story of collaboration, innovation, and uncompromising quality.
              </p>
            </FadeInSection>
          </div>
          
          <FadeInSection>
            <button 
              onClick={() => onNavigate('projects')}
              className="group flex items-center gap-4 text-[10px] font-montserrat font-black uppercase tracking-[0.4em] text-gray-400 hover:text-[#D4AF37] transition-colors duration-500"
            >
              View All Projects
              <span className="w-12 h-px bg-gray-300 group-hover:bg-[#D4AF37] group-hover:w-16 transition-all duration-500" />
            </button>
          </FadeInSection>
        </div>

        {/* 4 Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {productions.map((prod, idx) => (
            <FadeInSection key={idx}>
              <div className="group cursor-pointer">
                <div className="relative overflow-hidden mb-6 image-mask-feather">
                  <img
                    src={prod.img}
                    alt={prod.brand}
                    className="w-full aspect-[3/4] object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 transform group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#F5F5F7] to-transparent pointer-events-none" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-[11px] font-montserrat font-black uppercase tracking-[0.5em] text-[#D4AF37]">
                    {prod.brand}
                  </h3>
                  <h4 className="text-2xl font-montserrat font-black uppercase tracking-tighter text-[#1D1D1F] group-hover:translate-x-2 transition-transform duration-500">
                    {prod.project}
                  </h4>
                </div>
              </div>
            </FadeInSection>
          ))}
        </div>

        {/* Stats Bar */}
        <FadeInSection>
          <div className="pt-12 border-t border-black/5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-5xl font-montserrat font-black tracking-tight mb-2 text-[#1D1D1F]">250+</p>
                <p className="text-[10px] font-montserrat font-bold uppercase tracking-widest text-gray-400">Projects Completed</p>
              </div>
              <div>
                <p className="text-5xl font-montserrat font-black tracking-tight mb-2 text-[#1D1D1F]">98%</p>
                <p className="text-[10px] font-montserrat font-bold uppercase tracking-widest text-gray-400">Client Satisfaction</p>
              </div>
              <div>
                <p className="text-5xl font-montserrat font-black tracking-tight mb-2 text-[#1D1D1F]">50+</p>
                <p className="text-[10px] font-montserrat font-bold uppercase tracking-widest text-gray-400">Brand Partners</p>
              </div>
              <div>
                <p className="text-5xl font-montserrat font-black tracking-tight mb-2 text-[#1D1D1F]">12</p>
                <p className="text-[10px] font-montserrat font-bold uppercase tracking-widest text-gray-400">Industry Awards</p>
              </div>
            </div>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
};

export default RecentProductions;
