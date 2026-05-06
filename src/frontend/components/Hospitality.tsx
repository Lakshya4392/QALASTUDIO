
import React from 'react';
import FadeInSection from './FadeInSection';

const spaces = [
  { name: 'Studio Café', desc: 'Gourmet refreshments for your crew', img: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=1200' },
  { name: 'Catering', desc: 'Fine dining services & custom menus', img: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=1200' },
  { name: 'Private Club', desc: 'Exclusive lounges for talent & clients', img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=1200' },
  { name: 'The Deck', desc: 'Al fresco dining with panoramic views', img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=1200' },
];

const Hospitality: React.FC = () => {
  return (
    <section className="bg-neutral-50 pt-32 pb-20">
      <div className="px-6 md:px-16">
        {/* Header */}
        <div className="mb-24">
          <FadeInSection>
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400 block mb-4">
              HOSPITALITY
            </span>
            <h2 className="text-6xl md:text-[8rem] font-['Oswald'] font-bold leading-[0.85] uppercase tracking-tighter max-w-5xl">
              HOSPITALITY &<br />LIFESTYLE
            </h2>
          </FadeInSection>
          <FadeInSection>
            <p className="mt-8 text-xl md:text-2xl text-neutral-600 max-w-3xl leading-relaxed">
              Luxurious comfort meets production efficiency. Every detail curated for elite creators.
            </p>
          </FadeInSection>
        </div>

        {/* Grid - ServicesPage style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-20">
          {spaces.map((space, idx) => (
            <FadeInSection key={space.name} className="group cursor-pointer">
              <div className="relative aspect-[4/3] overflow-hidden mb-8 rounded-lg bg-neutral-100">
                <img
                  src={space.img}
                  alt={space.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500" />
              </div>
              <div className="space-y-3">
                <div className="inline-block px-4 py-1.5 border border-black/10 rounded-full text-[9px] font-bold uppercase tracking-widest text-neutral-400">
                  EXPERIENCE
                </div>
                <h3 className="text-3xl md:text-4xl font-['Oswald'] font-bold uppercase tracking-tight leading-none group-hover:translate-x-2 transition-transform duration-500">
                  {space.name}
                </h3>
                <p className="text-neutral-500 text-sm leading-relaxed">
                  {space.desc}
                </p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hospitality;
