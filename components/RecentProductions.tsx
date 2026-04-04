
import React from 'react';
import FadeInSection from './FadeInSection';

const productions = [
  { brand: 'Vogue India', project: 'The Ethereal Edit', img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1200' },
  { brand: 'Tom Ford', project: 'Autumn/Winter Campaign', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1200' },
  { brand: 'Gucci', project: 'Digital Art Showcase', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1200' },
];

interface RecentProductionsProps {
  onNavigate: (page: 'home' | 'studios' | 'services' | 'contact' | 'golden-hour' | 'about' | 'projects' | 'book') => void;
}

const RecentProductions: React.FC<RecentProductionsProps> = ({ onNavigate }) => {
  return (
    <section className="bg-neutral-50 section-spacer">
      <div className="container-standard">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div>
            <FadeInSection>
              <h2 className="text-section text-4xl md:text-6xl mb-4 text-black">RECENT<br />PRODUCTIONS</h2>
            </FadeInSection>
            <FadeInSection>
              <p className="text-body-light text-lg text-neutral-600 max-w-xl">
                A curated selection of our finest work. Every frame tells a story of collaboration, innovation, and uncompromising quality.
              </p>
            </FadeInSection>
          </div>
          
          <FadeInSection>
            <button 
              onClick={() => onNavigate('projects')}
              className="group flex items-center gap-4 text-xs font-bold uppercase tracking-[0.4em] text-neutral-400 hover:text-black transition-colors duration-500"
            >
              View All Projects
              <span className="w-12 h-px bg-neutral-300 group-hover:bg-black group-hover:w-16 transition-all duration-500" />
            </button>
          </FadeInSection>
        </div>

        {/* Horizontal Gallery */}
        <div className="flex gap-8 overflow-x-auto pb-12 no-scrollbar -mx-8 px-8">
          {productions.map((prod, idx) => (
            <FadeInSection key={idx} className="min-w-[300px] md:min-w-[400px] group cursor-pointer">
              <div className="space-y-6">
                {/* Image */}
                <div className="aspect-[4/5] overflow-hidden bg-gray-100">
                  <img
                    src={prod.img}
                    alt={prod.brand}
                    className="w-full h-full object-cover transition-all duration-[1500ms] ease-out group-hover:scale-105 grayscale group-hover:grayscale-0"
                  />
                </div>

                {/* Info */}
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-500 font-bold">{prod.brand}</p>
                  <h3 className="text-2xl font-display font-black uppercase tracking-tight group-hover:translate-x-2 transition-transform duration-500">
                    {prod.project}
                  </h3>
                </div>
              </div>
            </FadeInSection>
          ))}
        </div>

        {/* Stats Bar */}
        <FadeInSection>
          <div className="mt-24 pt-12 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-5xl font-display font-black tracking-tight mb-2 text-black">250+</p>
                <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Projects Completed</p>
              </div>
              <div>
                <p className="text-5xl font-display font-black tracking-tight mb-2 text-black">98%</p>
                <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Client Satisfaction</p>
              </div>
              <div>
                <p className="text-5xl font-display font-black tracking-tight mb-2 text-black">50+</p>
                <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Brand Partners</p>
              </div>
              <div>
                <p className="text-5xl font-display font-black tracking-tight mb-2 text-black">12</p>
                <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Industry Awards</p>
              </div>
            </div>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
};

export default RecentProductions;
