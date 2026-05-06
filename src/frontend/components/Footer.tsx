import React from 'react';
import { useContent } from '../contexts/ContentContext';

const Footer: React.FC = () => {
  const { content } = useContent();
  const c = content.contact;
  const social = c.socialLinks || { instagram: '', twitter: '', linkedin: '' };

  const socialItems = [
    { label: 'Instagram', href: social.instagram || '#' },
    { label: 'X', href: social.twitter || '#' },
    { label: 'TikTok', href: '#' },
    { label: 'Facebook', href: social.linkedin || '#' },
  ];

  return (
    <footer className="bg-[#f6f6f6] text-black border-t border-black/10 relative overflow-hidden">
      <div className="relative z-10 px-6 md:px-16 pt-20 md:pt-24 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-14">

          {/* Brand */}
          <div>
            <h3 className="text-4xl md:text-5xl font-['Oswald'] font-bold uppercase tracking-tight mb-4">
              QALA STUDIOS
            </h3>
            <p className="text-[11px] uppercase tracking-[0.2em] text-black/55 font-semibold">
              {c.address || 'JLPL Industrial Area, Sector 82, Mohali'}
            </p>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-black/45 font-bold mb-4">Contact</p>
            <div className="space-y-2">
              <a
                href={`mailto:${c.email}`}
                className="block text-3xl md:text-4xl font-['Oswald'] font-bold tracking-tight hover:opacity-60 transition-opacity"
              >
                {c.email}
              </a>
              <a
                href={`tel:${c.phone}`}
                className="block text-3xl md:text-4xl font-['Oswald'] font-bold tracking-tight hover:opacity-60 transition-opacity"
              >
                {c.phone}
              </a>
            </div>
            <p className="mt-6 text-[13px] leading-relaxed text-black/70 max-w-sm">{c.address}</p>
          </div>

          {/* Socials */}
          <div className="md:text-right">
            <p className="text-[10px] uppercase tracking-[0.22em] text-black/45 font-bold mb-4">Socials</p>
            <div className="flex md:justify-end gap-5 md:gap-6">
              {socialItems.map(item => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href !== '#' ? '_blank' : undefined}
                  rel={item.href !== '#' ? 'noreferrer' : undefined}
                  className="text-[11px] uppercase tracking-wider font-bold hover:opacity-60 transition-opacity"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-4 border-t border-black/10 flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-[0.18em] text-black/40 font-bold">
            © {new Date().getFullYear()} Qala Studios. All rights reserved.
          </p>
          <div className="text-[10px] uppercase tracking-[0.18em] text-black/30 font-bold">Scroll</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
