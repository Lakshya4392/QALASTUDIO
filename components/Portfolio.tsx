
import React, { useState, useRef } from 'react';
import FadeInSection from './FadeInSection';

type Category = 'ALL' | 'STUDIO' | 'GOLDEN HOUR' | 'EVENTS' | 'FILMS/VIDEOS';

interface PortfolioItem {
  id: string;
  type: 'image' | 'video';
  category: Category[];
  brand: string;
  project: string;
  media: string; // Image URL or Video URL
  thumbnail: string;
}

const portfolioData: PortfolioItem[] = [
  {
    id: '1',
    type: 'video',
    category: ['FILMS/VIDEOS', 'STUDIO'],
    brand: 'Vogue India',
    project: 'The Ethereal Edit',
    media: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-posing-in-a-photo-studio-41481-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: '2',
    type: 'image',
    category: ['GOLDEN HOUR'],
    brand: 'Tom Ford',
    project: 'Summer Glow',
    media: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1200',
    thumbnail: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: '3',
    type: 'image',
    category: ['STUDIO'],
    brand: 'Nike',
    project: 'Mohali Run',
    media: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&q=80&w=1200',
    thumbnail: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: '4',
    type: 'video',
    category: ['EVENTS', 'FILMS/VIDEOS'],
    brand: 'LFW',
    project: 'Runway Highlights',
    media: 'https://assets.mixkit.co/videos/preview/mixkit-girl-with-red-dress-dancing-under-the-sun-41490-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: '5',
    type: 'image',
    category: ['GOLDEN HOUR'],
    brand: 'Zara',
    project: 'Pastoral Bliss',
    media: 'https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?auto=format&fit=crop&q=80&w=1200',
    thumbnail: 'https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: '6',
    type: 'image',
    category: ['EVENTS'],
    brand: 'BMW',
    project: 'Launch Event Mohali',
    media: 'https://images.unsplash.com/photo-1542362567-b05503f3f5f4?auto=format&fit=crop&q=80&w=1200',
    thumbnail: 'https://images.unsplash.com/photo-1542362567-b05503f3f5f4?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: '7',
    type: 'video',
    category: ['FILMS/VIDEOS'],
    brand: 'Dior',
    project: 'Fragrance Story',
    media: 'https://assets.mixkit.co/videos/preview/mixkit-woman-walking-on-the-steps-of-a-museum-41487-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1513161455079-7dc1de15ef3e?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: '8',
    type: 'image',
    category: ['STUDIO'],
    brand: 'Apple',
    project: 'Creator Series',
    media: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=1200',
    thumbnail: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=800',
  },
];

const Portfolio: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<Category>('ALL');
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [visibleCount, setVisibleCount] = useState(8);

  const filteredItems = portfolioData.filter((item) => activeFilter === 'ALL' || item.category.includes(activeFilter));

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 4);
  };

  return (
    <section className="bg-white min-h-screen pt-24">
      {/* Smart Filter Navigation */}
      <div className="sticky top-20 z-40 bg-white border-b border-black/5 py-6 mb-8">
        <div className="max-w-[1600px] mx-auto px-6 flex flex-wrap justify-center gap-6 md:gap-12">
          {(['ALL', 'STUDIO', 'GOLDEN HOUR', 'EVENTS', 'FILMS/VIDEOS'] as Category[]).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveFilter(cat);
                setVisibleCount(8);
              }}
              className={`text-[10px] font-black uppercase tracking-[0.2em] pb-1 transition-all relative
                ${activeFilter === cat ? 'text-black' : 'text-gray-400 hover:text-black'}
              `}
            >
              {cat}
              <span
                className={`absolute bottom-0 left-0 w-full h-[1px] bg-black transition-transform duration-300 origin-left ${
                  activeFilter === cat ? 'scale-x-100' : 'scale-x-0'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Simple 4-Column Grid */}
      <div className="max-w-[1600px] mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.slice(0, visibleCount).map((item) => (
            <PortfolioCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />
          ))}
        </div>

        {/* Load More */}
        {visibleCount < filteredItems.length && (
          <div className="flex justify-center py-16">
            <button
              onClick={handleLoadMore}
              className="px-10 py-4 border border-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all duration-300"
            >
              Load More
            </button>
          </div>
        )}
      </div>

      {/* Full-Screen Pop-up Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-fade-in">
          <div className="absolute inset-0 bg-white/98 backdrop-blur-md" onClick={() => setSelectedItem(null)} />
          <button
            onClick={() => setSelectedItem(null)}
            className="absolute top-8 right-8 text-3xl font-light z-50 hover:rotate-90 transition-transform"
          >
            ×
          </button>

          <div className="relative w-full max-w-5xl flex flex-col items-center">
            {selectedItem.type === 'video' ? (
              <video src={selectedItem.media} controls autoPlay className="max-w-full max-h-[75vh] object-contain shadow-xl" />
            ) : (
              <img
                src={selectedItem.media}
                alt={selectedItem.brand}
                className="max-w-full max-h-[75vh] object-contain shadow-xl"
              />
            )}
            <div className="mt-6 text-center">
              <h2 className="text-2xl font-black uppercase tracking-tighter">{selectedItem.brand}</h2>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">{selectedItem.project}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const PortfolioCard: React.FC<{ item: PortfolioItem; onClick: () => void }> = ({ item, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (item.type === 'video' && videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (item.type === 'video' && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      className="relative group aspect-[4/5] bg-gray-50 overflow-hidden cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {item.type === 'video' ? (
        <>
          <img
            src={item.thumbnail}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              isHovered ? 'opacity-0' : 'opacity-100'
            }`}
            alt={item.brand}
          />
          <video
            ref={videoRef}
            src={item.media}
            muted
            loop
            playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </>
      ) : (
        <img
          src={item.thumbnail}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
          alt={item.brand}
        />
      )}

      {/* Simplified Hover Overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex flex-col justify-end p-5">
        <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <h4 className="text-white text-lg font-black uppercase tracking-tighter">{item.brand}</h4>
          <p className="text-white/70 text-[8px] font-bold uppercase tracking-widest">{item.project}</p>
        </div>
        {/* Play icon for videos */}
        {item.type === 'video' && !isHovered && (
          <div className="absolute top-4 right-4 text-white opacity-60">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;

