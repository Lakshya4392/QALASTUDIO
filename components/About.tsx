import React from 'react';
import { useContent } from '../contexts/ContentContext';

const About: React.FC = () => {
  const { content } = useContent();
  const a = content.about;

  return (
    <section id="about-section" className="bg-neutral-50 py-32 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">

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

        {a.image && (
          <div className="relative aspect-[16/9] w-full overflow-hidden mb-24">
            <img
              src={a.image}
              alt="Studio Space"
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-[2000ms]"
            />
          </div>
        )}

        {a.quote && (
          <div className="text-center pb-8">
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

      </div>
    </section>
  );
};

export default About;
