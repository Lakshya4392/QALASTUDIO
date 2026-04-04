import React from 'react';
import FadeInSection from './FadeInSection';
import { useContent } from '../contexts/ContentContext';

const Footer: React.FC = () => {
  const { content } = useContent();
  const c = content.contact;
  // Guard against missing nested socialLinks object
  const social = c.socialLinks || { instagram: '', twitter: '', linkedin: '' };
  return (
    <footer className="bg-black text-white pt-40 pb-20 px-6 md:px-16 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-white/[0.02] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
      <div className="relative z-10">
        <div className="mb-40 group cursor-pointer inline-block">
          <FadeInSection>
            <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-neutral-500 block mb-8">PREMIER PRODUCTION FACILITY</span>
            <h2 className="text-[12vw] md:text-[15vw] font-['Oswald'] font-bold leading-[0.8] uppercase tracking-tighter hover:italic transition-all duration-700">QALA <br className="md:hidden" /> STUDIOS</h2>
          </FadeInSection>
        </div>
        <div className="grid md:grid-cols-3 gap-20 border-t border-white/10 pt-20">
          <div className="space-y-8">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-500">Contact</span>
            <div className="space-y-4">
              <a href={`mailto:${c.email}`} className="block text-2xl md:text-3xl font-light hover:opacity-50 transition-opacity">{c.email}</a>
              <p className="text-2xl md:text-3xl font-light">{c.phone}</p>
            </div>
          </div>
          <div className="space-y-8">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-500">Social</span>
            <div className="flex flex-wrap gap-x-10 gap-y-4">
              {social.instagram && <a href={social.instagram} target="_blank" rel="noreferrer" className="text-lg uppercase tracking-widest font-medium hover:line-through transition-all">Instagram</a>}
              {social.twitter && <a href={social.twitter} target="_blank" rel="noreferrer" className="text-lg uppercase tracking-widest font-medium hover:line-through transition-all">Twitter</a>}
              {social.linkedin && <a href={social.linkedin} target="_blank" rel="noreferrer" className="text-lg uppercase tracking-widest font-medium hover:line-through transition-all">LinkedIn</a>}
            </div>
          </div>
          <div className="space-y-8">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-500">Address</span>
            <p className="text-xl font-light text-neutral-400 leading-relaxed">{c.address}</p>
          </div>
        </div>
        <div className="mt-40 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 opacity-30">
          <p className="text-[10px] uppercase tracking-widest font-medium">© 2024 Qala Studios. All rights reserved.</p>
          <div className="flex gap-10 text-[10px] uppercase tracking-widest font-medium">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
