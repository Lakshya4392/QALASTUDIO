
import React from 'react';
import FadeInSection from './FadeInSection';
import Button from './Button';

const EventSpaces: React.FC = () => {
  return (
    <section className="bg-white section-spacer-lg">
      <div className="container-standard">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Large Image */}
          <FadeInSection className="order-2 lg:order-1">
            <div className="relative aspect-[4/5] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1600"
                alt="Fashion Show Event"
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-[2000ms] ease-out"
              />
              {/* Minimalist caption */}
              <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-sm px-6 py-3">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-600 font-bold">Capacity up to 500</p>
              </div>
            </div>
          </FadeInSection>

          {/* Content */}
          <FadeInSection className="order-1 lg:order-2 space-y-10">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-gray-500 font-bold mb-4">
                Bespoke Events
              </p>
              <h2 className="text-section text-6xl md:text-8xl lg:text-9xl leading-[0.9] font-['Oswald'] font-bold uppercase tracking-tighter text-black">
                EVENT<br />SPACES
              </h2>
            </div>

            <div className="space-y-6">
              <p className="text-body-light text-2xl text-gray-700 leading-relaxed">
                From high-profile fashion shows to intimate product launches, our expansive light-filled spaces adapt to your vision.
              </p>
              <p className="text-body text-gray-600 leading-loose">
                Our venues have hosted Industry's most prestigious events, offering unparalleled flexibility with industrial backdrops.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-6">
              <div>
                <p className="text-4xl font-display font-black tracking-tight mb-2">5+</p>
                <p className="text-sm uppercase tracking-widest text-gray-500 font-bold">Event Spaces</p>
              </div>
              <div>
                <p className="text-4xl font-display font-black tracking-tight mb-2">10,000</p>
                <p className="text-sm uppercase tracking-widest text-gray-500 font-bold">Sq Ft Total</p>
              </div>
            </div>

            <div className="pt-4">
              <Button variant="fill" size="lg">
                Book Your Event
              </Button>
            </div>
          </FadeInSection>
        </div>
      </div>
    </section>
  );
};

export default EventSpaces;
