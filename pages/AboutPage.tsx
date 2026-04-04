import React from 'react';
import FadeInSection from '../components/FadeInSection';
import { useContent } from '../contexts/ContentContext';

const AboutPage: React.FC = () => {
  const { content } = useContent();
  const a = content.about;

  return (
    <div className="pt-40 pb-20 bg-[#F5F5F7] min-h-screen text-black">
      <div className="max-w-7xl mx-auto px-6 md:px-16">

        {/* Philosophy */}
        <FadeInSection className="mb-24">
          <p className="text-xs uppercase tracking-[0.4em] text-neutral-500 font-bold mb-6">{a.philosophyTitle}</p>
          <h1 className="text-6xl md:text-[8rem] font-['Oswald'] font-bold leading-[0.85] uppercase tracking-tighter max-w-5xl mb-12">
            {a.philosophyText}
          </h1>
          <div className="grid md:grid-cols-2 gap-16">
            <p className="text-xl text-neutral-600 leading-relaxed">{a.description}</p>
          </div>
        </FadeInSection>

        {/* Image */}
        {a.image && (
          <FadeInSection className="mb-24">
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              <img
                src={a.image}
                alt="About Qala Studios"
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-[2000ms]"
              />
            </div>
          </FadeInSection>
        )}

        {/* Quote */}
        <FadeInSection className="text-center mb-24">
          {a.quote && (
            <p className="font-serif text-3xl md:text-4xl italic text-neutral-700 max-w-3xl mx-auto leading-relaxed">
              "{a.quote}"
            </p>
          )}
          {a.quoteAuthor && <p className="mt-6 text-xs uppercase tracking-[0.3em] text-neutral-500 font-bold">{a.quoteAuthor}</p>}
        </FadeInSection>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center pb-20 border-t border-black/10 pt-20">
          {[
            { label: 'Innovation', desc: 'Pioneering new technology for creators.' },
            { label: 'Collaboration', desc: 'Client-first artistry, every time.' },
            { label: 'Excellence', desc: 'Quality in every frame we produce.' },
          ].map(v => (
            <FadeInSection key={v.label}>
              <h4 className="text-2xl font-['Oswald'] font-bold uppercase tracking-tight mb-3">{v.label}</h4>
              <p className="text-neutral-500 text-sm">{v.desc}</p>
            </FadeInSection>
          ))}
        </div>

      </div>
    </div>
  );
};

export default AboutPage;
