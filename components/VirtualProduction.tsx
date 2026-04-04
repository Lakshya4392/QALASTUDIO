
import React from 'react';
import FadeInSection from './FadeInSection';

const VirtualProduction: React.FC = () => {
  return (
    <section className="bg-white pt-32 pb-20">
      <div className="px-6 md:px-16">
        {/* Header */}
        <div className="mb-24">
          <FadeInSection>
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400 block mb-4">
              THE FUTURE
            </span>
            <h2 className="text-6xl md:text-[9rem] font-['Oswald'] font-bold leading-[0.85] uppercase tracking-tighter max-w-5xl">
              VIRTUAL<br />PRODUCTION
            </h2>
          </FadeInSection>
        </div>

        {/* Content Grid - 60/40 split */}
        <div className="grid lg:grid-cols-2 gap-x-16 gap-y-12 items-center">
          {/* Image/Visual */}
          <FadeInSection>
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-neutral-100">
              <img
                src="https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&q=80&w=1600"
                alt="LED Volume Virtual Production"
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105"
              />
              {/* Hover overlay effect */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500 opacity-0 group-hover:opacity-100">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full border border-black/30 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-[10px] text-black font-bold uppercase tracking-widest">EXPLORE</span>
                  </div>
                </div>
              </div>
            </div>
          </FadeInSection>

          {/* Content */}
          <FadeInSection>
            <div className="space-y-8">
              <p className="text-xl md:text-2xl text-neutral-700 leading-relaxed font-medium">
                Step into the future with our state-of-the-art LED volume and real-time rendering environments. Limitless locations, complete light control, and zero travel.
              </p>

              <div className="space-y-6">
                <h3 className="text-2xl font-['Oswald'] font-bold uppercase tracking-tight">
                  CAPABILITIES
                </h3>
                <div className="space-y-4">
                  {[
                    'Real-time Unreal Engine integration',
                    'In-camera VFX with LED walls',
                    'Dynamic lighting control',
                    'Virtual set extensions',
                    'Motion capture ready'
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0" />
                      <p className="text-neutral-600 font-bold uppercase tracking-tight text-sm">
                        {feature}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => {}}
                  className="w-full md:w-auto px-12 py-5 bg-black text-white uppercase font-black text-xs tracking-[0.3em] hover:invert transition-all border-2 border-black"
                >
                  LEARN MORE
                </button>
              </div>
            </div>
          </FadeInSection>
        </div>
      </div>
    </section>
  );
};

export default VirtualProduction;
