import React, { useEffect, useState } from 'react';
import FadeInSection from '../components/FadeInSection';

const API_BASE = import.meta.env.VITE_API_URL || 'https://qalastudio.onrender.com/api';

interface Member {
  name: string;
  role: string;
  quote: string;
  image: string;
  ghostName: string;
  footNote: string;
  annotations: string[];
}

interface AboutContent {
  eyebrow: string;
  headingLine1: string;
  headingLine2: string;
  members: Member[];
  manifestoHeading: string;
  manifestoHighlight: string;
  manifestoText: string;
}

const fallback: AboutContent = {
  eyebrow: 'The Minds Behind',
  headingLine1: 'MEET THE MINDS',
  headingLine2: 'BEHIND THE MAGIC',
  members: [
    {
      name: 'Mudit Sharma',
      role: 'THE DRIVING FORCE',
      quote:
        "Founder. Visionary. Petrolhead. Mudit doesn't just build studios; he builds ecosystems for creativity. His passion is the fuel that keeps Qala moving forward at 100mph.",
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=1200',
      ghostName: 'MUDIT',
      footNote: 'Grew up in garage bands & garage startups',
      annotations: ["Can't live without!\nHis Car", 'FPV goggles on,\nworld off', 'Builder by day,\nDJ by night'],
    },
    {
      name: 'Rishab',
      role: 'MASTER OF COMPOSITION',
      quote:
        "For most, Golden Hour is a time of day; for Rishab, it’s game time. Addicted to cinematic flair and perfect framing, he’s the one who turns a shot into a story.",
      image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=1200',
      ghostName: 'RISHAB',
      footNote: 'Uses Ctrl+Z more than anything!! • Style: Cinematic',
      annotations: ['Addicted to\ncomposition', 'Builder mindset', 'Fav time? golden hour'],
    },
    {
      name: 'Parth',
      role: 'THE DOP & STORYTELLER',
      quote:
        'Seeing the world through a 16-35mm lens, Parth captures what others miss. He doesn’t just record footage; he crafts visual narratives that breathe life into every frame.',
      image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=1200',
      ghostName: 'PARTH',
      footNote: 'Shoots in 24fps but thinks 100 ideas per second',
      annotations: ['Go to lens:\n16-35mm', 'Dream location:\nLadakh', 'Sharp story telling'],
    },
  ],
  manifestoHeading: 'QALA IS NOT JUST A SPACE; IT\'S A',
  manifestoHighlight: 'MOVEMENT',
  manifestoText: 'We are a team of misfits, artists, and gear-heads united by one goal: Your best shot.',
};

const AboutPage: React.FC = () => {
  const [content, setContent] = useState<AboutContent>(fallback);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/content/ABOUT`);
        if (!res.ok) return;
        const json = await res.json();
        const data = json?.data;
        if (!data || typeof data !== 'object') return;

        const members = Array.isArray(data.members) ? data.members : fallback.members;
        setContent({
          eyebrow: data.eyebrow || fallback.eyebrow,
          headingLine1: data.headingLine1 || fallback.headingLine1,
          headingLine2: data.headingLine2 || fallback.headingLine2,
          members: members.map((m: any, idx: number) => ({
            name: m.name || fallback.members[idx]?.name || 'Member',
            role: m.role || fallback.members[idx]?.role || 'TEAM',
            quote: m.quote || fallback.members[idx]?.quote || '',
            image: m.image || fallback.members[idx]?.image || '',
            ghostName: m.ghostName || fallback.members[idx]?.ghostName || '',
            footNote: m.footNote || fallback.members[idx]?.footNote || '',
            annotations: Array.isArray(m.annotations) ? m.annotations : (fallback.members[idx]?.annotations || []),
          })),
          manifestoHeading: data.manifestoHeading || fallback.manifestoHeading,
          manifestoHighlight: data.manifestoHighlight || fallback.manifestoHighlight,
          manifestoText: data.manifestoText || fallback.manifestoText,
        });
      } catch {
        // fallback stays
      }
    };
    load();
  }, []);

  const member1 = content.members[0];
  const member2 = content.members[1];
  const member3 = content.members[2];

  return (
    <div className="pt-40 pb-20 px-10 bg-[#F5F5F7] min-h-screen text-[#1D1D1F] font-sans overflow-hidden">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center select-none z-0">
        <h1 className="text-[20vw] font-montserrat font-black uppercase tracking-tighter leading-none text-center">
          ART . PASSION
          <br />
          PRECISION
        </h1>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <FadeInSection className="text-center mb-32">
          <h2 className="text-[10px] font-montserrat font-black uppercase tracking-[0.5em] text-[#D4AF37] mb-6">{content.eyebrow}</h2>
          <h1 className="text-6xl md:text-8xl font-montserrat font-black tracking-tighter uppercase leading-none">
            {content.headingLine1}
            <br />
            {content.headingLine2}
          </h1>
        </FadeInSection>

        <div className="flex flex-col gap-32 mb-40">
          {/* Member 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 group relative">
              <div className="relative overflow-hidden image-mask-feather">
                <img
                  src={member1?.image}
                  alt={member1?.name}
                  className="w-full grayscale group-hover:grayscale-0 transition-all duration-1000 transform group-hover:scale-105"
                />
                <div className="absolute top-10 left-10 font-handwritten text-[#D4AF37] text-2xl rotate-[-5deg] opacity-0 group-hover:opacity-100 transition-all duration-700 whitespace-pre-line">
                  {member1?.annotations?.[0]}
                </div>
                <div className="absolute top-1/2 right-10 font-handwritten text-[#1D1D1F] text-xl rotate-12 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100 whitespace-pre-line">
                  {member1?.annotations?.[1]}
                </div>
                <div className="absolute bottom-1/4 left-1/4 font-handwritten text-[#D4AF37] text-lg rotate-3 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-200 whitespace-pre-line">
                  {member1?.annotations?.[2]}
                </div>
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#F5F5F7] to-transparent pointer-events-none" />
              </div>
              <div className="absolute -bottom-10 -right-10 text-[120px] font-montserrat font-black opacity-[0.04] pointer-events-none group-hover:opacity-[0.08] transition-opacity">
                {member1?.ghostName}
              </div>
            </div>
            <div className="lg:col-span-5 space-y-6">
              <FadeInSection>
                <h3 className="text-[11px] font-montserrat font-black uppercase tracking-[0.5em] text-[#D4AF37]">{member1?.role}</h3>
                <h4 className="text-5xl font-montserrat font-black uppercase tracking-tighter mb-4">{member1?.name}</h4>
                <p className="font-lora italic text-xl leading-relaxed text-[#1D1D1F]/80">"{member1?.quote}"</p>
                <div className="pt-6 border-t border-black/5">
                  <p className="text-[10px] font-montserrat font-bold uppercase tracking-widest text-gray-400">{member1?.footNote}</p>
                </div>
              </FadeInSection>
            </div>
          </div>

          {/* Member 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 lg:order-2 group relative">
              <div className="relative overflow-hidden image-mask-feather">
                <img
                  src={member2?.image}
                  alt={member2?.name}
                  className="w-full grayscale group-hover:grayscale-0 transition-all duration-1000 transform group-hover:scale-105"
                />
                <div className="absolute top-1/4 left-0 font-handwritten text-[#D4AF37] text-2xl rotate-[-15deg] opacity-0 group-hover:opacity-100 transition-all duration-700 whitespace-pre-line">
                  {member2?.annotations?.[0]}
                </div>
                <div className="absolute top-10 right-10 font-handwritten text-[#1D1D1F] text-xl rotate-6 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100 whitespace-pre-line">
                  {member2?.annotations?.[1]}
                </div>
                <div className="absolute bottom-20 right-4 font-handwritten text-[#D4AF37] text-lg -rotate-3 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-200 whitespace-pre-line">
                  {member2?.annotations?.[2]}
                </div>
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#F5F5F7] to-transparent pointer-events-none" />
              </div>
              <div className="absolute -bottom-10 -left-10 text-[120px] font-montserrat font-black opacity-[0.04] pointer-events-none group-hover:opacity-[0.08] transition-opacity">
                {member2?.ghostName}
              </div>
            </div>
            <div className="lg:col-span-7 lg:order-1 text-right space-y-6">
              <FadeInSection>
                <h3 className="text-[11px] font-montserrat font-black uppercase tracking-[0.5em] text-[#D4AF37]">{member2?.role}</h3>
                <h4 className="text-5xl font-montserrat font-black uppercase tracking-tighter mb-4">{member2?.name}</h4>
                <p className="font-lora italic text-xl leading-relaxed text-[#1D1D1F]/80 ml-auto max-w-lg">"{member2?.quote}"</p>
                <div className="pt-6 border-t border-black/5">
                  <p className="text-[10px] font-montserrat font-bold uppercase tracking-widest text-gray-400">{member2?.footNote}</p>
                </div>
              </FadeInSection>
            </div>
          </div>

          {/* Member 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 group relative">
              <div className="relative overflow-hidden image-mask-feather">
                <img
                  src={member3?.image}
                  alt={member3?.name}
                  className="w-full grayscale group-hover:grayscale-0 transition-all duration-1000 transform group-hover:scale-105"
                />
                <div className="absolute top-20 left-10 font-handwritten text-[#D4AF37] text-2xl rotate-[-10deg] opacity-0 group-hover:opacity-100 transition-all duration-700 whitespace-pre-line">
                  {member3?.annotations?.[0]}
                </div>
                <div className="absolute top-1/2 right-4 font-handwritten text-[#1D1D1F] text-xl rotate-12 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100 whitespace-pre-line">
                  {member3?.annotations?.[1]}
                </div>
                <div className="absolute bottom-1/4 right-1/4 font-handwritten text-[#D4AF37] text-lg -rotate-6 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-200 whitespace-pre-line">
                  {member3?.annotations?.[2]}
                </div>
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#F5F5F7] to-transparent pointer-events-none" />
              </div>
              <div className="absolute -bottom-10 -right-10 text-[120px] font-montserrat font-black opacity-[0.04] pointer-events-none group-hover:opacity-[0.08] transition-opacity">
                {member3?.ghostName}
              </div>
            </div>
            <div className="lg:col-span-5 space-y-6">
              <FadeInSection>
                <h3 className="text-[11px] font-montserrat font-black uppercase tracking-[0.5em] text-[#D4AF37]">{member3?.role}</h3>
                <h4 className="text-5xl font-montserrat font-black uppercase tracking-tighter mb-4">{member3?.name}</h4>
                <p className="font-lora italic text-xl leading-relaxed text-[#1D1D1F]/80">"{member3?.quote}"</p>
                <div className="pt-6 border-t border-black/5">
                  <p className="text-[10px] font-montserrat font-bold uppercase tracking-widest text-gray-400">{member3?.footNote}</p>
                </div>
              </FadeInSection>
            </div>
          </div>
        </div>

        <section className="mb-40 py-24 text-center border-t border-black/5">
          <FadeInSection>
            <h2 className="text-5xl md:text-7xl font-montserrat font-black tracking-tighter uppercase leading-none mb-12">
              "{content.manifestoHeading} <span className="text-[#D4AF37]">{content.manifestoHighlight}</span> FOR CREATORS."
            </h2>
            <p className="text-[#1D1D1F] font-lora italic text-xl max-w-2xl mx-auto">{content.manifestoText}</p>
          </FadeInSection>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center pb-20">
          <FadeInSection className="group">
            <div className="mb-6 inline-block p-4 rounded-full border border-black/5 group-hover:bg-white group-hover:shadow-xl transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>
            </div>
            <h4 className="font-montserrat font-black uppercase tracking-tighter text-lg mb-2">Innovation</h4>
            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-[0.2em]">Pioneering new tech.</p>
          </FadeInSection>

          <FadeInSection className="group">
            <div className="mb-6 inline-block p-4 rounded-full border border-black/5 group-hover:bg-white group-hover:shadow-xl transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <h4 className="font-montserrat font-black uppercase tracking-tighter text-lg mb-2">Collaboration</h4>
            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-[0.2em]">Client-first artistry.</p>
          </FadeInSection>

          <FadeInSection className="group">
            <div className="mb-6 inline-block p-4 rounded-full border border-black/5 group-hover:bg-white group-hover:shadow-xl transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>
            </div>
            <h4 className="font-montserrat font-black uppercase tracking-tighter text-lg mb-2">Excellence</h4>
            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-[0.2em]">Quality in every frame.</p>
          </FadeInSection>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
