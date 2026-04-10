import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useContent } from '../contexts/ContentContext';

const IMAGES = [
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800',
];

const IMG_W = 320;
const IMG_H = 220;
const GAP = 12;
const SPEED = 0.5;

const ImageStrip: React.FC = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const animRef = useRef(0);
  const offsetRef = useRef(0);
  const pausedRef = useRef(false);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartOffset = useRef(0);
  const didDrag = useRef(false);

  // triple the images for seamless loop
  const items = [...IMAGES, ...IMAGES, ...IMAGES];
  const loopWidth = IMAGES.length * (IMG_W + GAP);

  const animate = useCallback(() => {
    if (!trackRef.current) { animRef.current = requestAnimationFrame(animate); return; }
    if (!pausedRef.current && !isDragging.current) {
      offsetRef.current += SPEED;
      if (offsetRef.current >= loopWidth) offsetRef.current -= loopWidth;
      trackRef.current.style.transform = `translateX(-${offsetRef.current}px)`;
    }
    animRef.current = requestAnimationFrame(animate);
  }, [loopWidth]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [animate]);

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    didDrag.current = false;
    dragStartX.current = e.clientX;
    dragStartOffset.current = offsetRef.current;
    if (trackRef.current) trackRef.current.style.cursor = 'grabbing';
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const delta = dragStartX.current - e.clientX;
    if (Math.abs(delta) > 3) didDrag.current = true;
    let next = dragStartOffset.current + delta;
    // keep in bounds for loop
    if (next < 0) next += loopWidth;
    if (next >= loopWidth) next -= loopWidth;
    offsetRef.current = next;
    if (trackRef.current) trackRef.current.style.transform = `translateX(-${next}px)`;
  };

  const onMouseUp = () => {
    isDragging.current = false;
    if (trackRef.current) trackRef.current.style.cursor = 'grab';
  };

  // Touch support
  const touchStartX = useRef(0);
  const touchStartOffset = useRef(0);
  const onTouchStart = (e: React.TouchEvent) => {
    pausedRef.current = true;
    touchStartX.current = e.touches[0].clientX;
    touchStartOffset.current = offsetRef.current;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const delta = touchStartX.current - e.touches[0].clientX;
    let next = touchStartOffset.current + delta;
    if (next < 0) next += loopWidth;
    if (next >= loopWidth) next -= loopWidth;
    offsetRef.current = next;
    if (trackRef.current) trackRef.current.style.transform = `translateX(-${next}px)`;
  };
  const onTouchEnd = () => { pausedRef.current = false; };

  return (
    <div
      className="overflow-hidden cursor-grab select-none"
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; onMouseUp(); }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div
        ref={trackRef}
        className="flex will-change-transform"
        style={{ gap: GAP, width: 'max-content' }}
      >
        {items.map((src, i) => (
          <div
            key={i}
            className="flex-shrink-0 overflow-hidden bg-neutral-200"
            style={{ width: IMG_W, height: IMG_H }}
          >
            <img
              src={src}
              alt=""
              draggable={false}
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 pointer-events-none"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const About: React.FC = () => {
  const { content } = useContent();
  const a = content.about;

  return (
    <section id="about-section" className="bg-neutral-50 py-32">
      <div className="max-w-7xl mx-auto px-6 md:px-16">

        {a.philosophyTitle && (
          <p className="text-xs uppercase tracking-[0.4em] text-neutral-500 font-bold mb-6">
            {a.philosophyTitle}
          </p>
        )}

        {a.philosophyText && (
          <h2 className="text-6xl md:text-8xl lg:text-9xl leading-[0.9] mb-12 max-w-5xl font-['Oswald'] font-bold uppercase tracking-tighter text-black">
            {a.philosophyText}
          </h2>
        )}

        {a.description && (
          <div className="grid md:grid-cols-2 gap-16 mb-20">
            <p className="text-neutral-600 leading-loose font-light text-lg">{a.description}</p>
            <div className="flex items-center">
              <div className="w-32 h-px bg-black/20" />
            </div>
          </div>
        )}
      </div>

      {a.quote && (
        <div className="text-center px-6 md:px-16 pb-8">
          <p className="font-serif text-3xl md:text-4xl italic text-neutral-700 max-w-3xl mx-auto leading-relaxed">
            "{a.quote}"
          </p>
          {a.quoteAuthor && (
            <p className="mt-6 text-xs uppercase tracking-[0.3em] text-neutral-500 font-bold">
              {a.quoteAuthor}
            </p>
          )}
        </div>
      )}
    </section>
  );
};

export default About;
