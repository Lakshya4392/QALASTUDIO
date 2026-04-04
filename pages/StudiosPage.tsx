import React, { useState, useEffect } from 'react';
import BookingModal from '../components/BookingModal';
import FadeInSection from '../components/FadeInSection';
import { api } from '../services/api';

interface Studio {
  id: string;
  name: string;
  type: string;
  available: boolean;
  img: string;
  description: string;
  price: string;
  priceNote: string;
  features: string[];
}

const StudiosPage: React.FC = () => {
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingStudio, setBookingStudio] = useState<Studio | null>(null);
  const [selectedStudio, setSelectedStudio] = useState<Studio | null>(null);

  useEffect(() => {
    api.studios.getAll()
      .then((res: any) => {
        const arr = Array.isArray(res) ? res : [];
        setStudios(
          arr
            .filter((s: any) => s.is_active !== false)
            .map((s: any) => ({
              id: s.id,
              name: s.name,
              type: s.tagline || 'Production Space',
              available: true,
              img: s.image_url || '',
              description: s.description || '',
              price: s.price ? `₹${Number(s.price).toLocaleString('en-IN')}` : 'Contact for pricing',
              priceNote: s.price_note || 'per hour',
              features: s.features || [],
            }))
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-32 pb-20 bg-[#F4F4F4] min-h-screen text-black">
      {/* Header */}
      <div className="px-6 md:px-16 mb-20">
        <FadeInSection>
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400 block mb-4">OUR SPACES</span>
          <h1 className="text-6xl md:text-[8rem] font-['Oswald'] font-bold leading-[0.85] uppercase tracking-tighter max-w-5xl">
            STUDIOS
          </h1>
        </FadeInSection>
        <FadeInSection>
          <p className="mt-8 text-xl md:text-2xl text-neutral-600 max-w-3xl leading-relaxed">
            Premier production spaces built for world-class shoots. Every studio is fully equipped and ready to book.
          </p>
        </FadeInSection>
      </div>

      {/* Studios Grid */}
      <div className="px-6 md:px-16 pb-20">
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-black/20 border-t-black rounded-full animate-spin" />
          </div>
        )}

        {!loading && studios.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-neutral-500 font-bold uppercase tracking-widest">No studios available at the moment.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-16">
          {studios.map((studio, idx) => (
            <FadeInSection key={studio.id} className={idx % 2 === 1 ? 'md:mt-20' : ''}>
              <div className="group cursor-pointer" onClick={() => setSelectedStudio(studio)}>
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden mb-8 rounded-lg bg-neutral-100">
                  {studio.img ? (
                    <img
                      src={studio.img}
                      alt={studio.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-50" />
                  )}
                  <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/90 px-3 py-1.5 rounded-full border border-black/10">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Available</span>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="w-20 h-20 rounded-full border border-black/30 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-[10px] text-black font-bold uppercase tracking-widest">Book Now</span>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-4">
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-neutral-400 block">{studio.type}</span>
                  <h3 className="text-4xl md:text-5xl font-['Oswald'] font-bold uppercase tracking-tight leading-none">{studio.name}</h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">{studio.description}</p>

                  {studio.features.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {studio.features.map((f, i) => (
                        <span key={i} className="px-3 py-1.5 border border-black/10 rounded-full text-[9px] font-bold uppercase tracking-widest text-neutral-500">{f}</span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-end justify-between pt-4 border-t border-black/10">
                    <div>
                      <p className="text-3xl font-black">{studio.price}</p>
                      <p className="text-[9px] uppercase tracking-widest text-neutral-400">{studio.priceNote}</p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); setBookingStudio(studio); }}
                      className="px-6 py-3 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-800 transition-all"
                    >
                      Book Studio
                    </button>
                  </div>
                </div>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>

      {/* Studio Detail Drawer */}
      {selectedStudio && (
        <div className="fixed inset-y-0 right-0 w-full md:w-[560px] z-[110] bg-white shadow-2xl border-l-2 border-black flex flex-col">
          <div className="p-8 border-b-2 border-black flex justify-between items-center">
            <div>
              <h3 className="text-3xl font-black tracking-tighter uppercase">{selectedStudio.name}</h3>
              <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">{selectedStudio.type}</p>
            </div>
            <button onClick={() => setSelectedStudio(null)} className="text-2xl font-black hover:opacity-50">×</button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {selectedStudio.img ? (
              <img src={selectedStudio.img} alt={selectedStudio.name} className="w-full aspect-video object-cover bg-neutral-100" />
            ) : (
              <div className="w-full aspect-video bg-neutral-100 flex items-center justify-center">
                <p className="text-xs text-neutral-400 uppercase tracking-widest">No image</p>
              </div>
            )}
            <div className="p-8 space-y-6">
              <p className="text-gray-600 leading-relaxed">{selectedStudio.description}</p>
              {selectedStudio.features.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Features</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedStudio.features.map((f, i) => (
                      <span key={i} className="px-3 py-1.5 border-2 border-gray-200 text-xs font-bold uppercase tracking-wider">{f}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="pt-4 border-t-2 border-gray-100">
                <p className="text-4xl font-black">{selectedStudio.price}</p>
                <p className="text-xs text-gray-400 uppercase tracking-widest">{selectedStudio.priceNote}</p>
              </div>
            </div>
          </div>
          <div className="p-6 border-t-2 border-black flex gap-4">
            <button
              className="flex-1 bg-black text-white py-4 uppercase font-black text-xs tracking-widest hover:bg-neutral-800 transition-all"
              onClick={() => { setBookingStudio(selectedStudio); setSelectedStudio(null); }}
            >
              Book This Studio
            </button>
            <button
              className="flex-1 border-2 border-black py-4 uppercase font-black text-xs tracking-widest hover:bg-black hover:text-white transition-all"
              onClick={() => setSelectedStudio(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {bookingStudio && (
        <BookingModal
          studioId={bookingStudio.id}
          studioName={bookingStudio.name}
          onClose={() => setBookingStudio(null)}
        />
      )}
    </div>
  );
};

export default StudiosPage;
