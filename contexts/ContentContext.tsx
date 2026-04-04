import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface SiteContent {
  hero: { tagline: string; headline: string; subtitle: string; tagline2: string; ctaPrimary: string; ctaSecondary: string; location: string };
  about: { philosophyTitle: string; philosophyText: string; description: string; quote: string; quoteAuthor: string; image: string };
  contact: { email: string; phone: string; address: string; mapUrl: string; socialLinks: { instagram: string; twitter: string; linkedin: string } };
  services: Array<{ id: string; name: string; category: string; img: string; isActive: boolean }>;
}

const defaults: SiteContent = {
  hero: { tagline: 'Production House', headline: 'QALA STUDIOS', subtitle: 'Production House', tagline2: "Punjab's Premier Production Infrastructure", ctaPrimary: 'EXPLORE STUDIOS', ctaSecondary: 'OUR SERVICES', location: 'Mohali, Punjab' },
  about: { philosophyTitle: 'Our Philosophy', philosophyText: 'Qala Studios is the crown jewel of visual production in Punjab.', description: "Located in the heart of Mohali's industrial belt, our facility serves the booming Punjabi cinematic and fashion industry.", quote: "We don't just provide space; we provide the canvas for your vision to come alive.", quoteAuthor: '— The Qala Team', image: 'https://images.unsplash.com/photo-1598425237654-4fc758e50a93?auto=format&fit=crop&q=80&w=2000' },
  contact: { email: 'info@qalastudios.com', phone: '+91 98765 43210', address: 'Phase 8, Industrial Area, Sector 72, Mohali, Punjab - 160071', mapUrl: 'https://maps.google.com', socialLinks: { instagram: '', twitter: '', linkedin: '' } },
  services: [
    { id: '1', name: 'Equipment', category: 'Gear & Tech', img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1200', isActive: true },
    { id: '2', name: 'Digital', category: 'Workflow', img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1200', isActive: true },
    { id: '3', name: 'Locations', category: 'Scouting', img: 'https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb5b?auto=format&fit=crop&q=80&w=1200', isActive: true },
    { id: '4', name: 'Crew', category: 'Talent', img: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=1200', isActive: true },
    { id: '5', name: 'Creative', category: 'Direction', img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=1200', isActive: true },
    { id: '6', name: 'Talent', category: 'Artists', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1200', isActive: true },
  ],
};

interface ContentContextType {
  content: SiteContent;
  loading: boolean;
  refresh: () => Promise<void>;
  // Direct update — instant, no network call needed
  updateSection: (section: keyof SiteContent, data: any) => void;
}

const ContentContext = createContext<ContentContextType>({
  content: defaults,
  loading: false,
  refresh: async () => {},
  updateSection: () => {},
});

const fetchOne = async (type: string): Promise<any> => {
  try {
    const r = await fetch(`${API_BASE}/content/${type}`, { cache: 'no-store' });
    if (!r.ok) return null;
    const json = await r.json();
    // data field might be serialized string
    if (json?.data && typeof json.data === 'string') {
      try { json.data = JSON.parse(json.data); } catch {}
    }
    // Unwrap double-nested: { data: { data: {...} } } → { data: {...} }
    if (json?.data?.data && typeof json.data.data === 'object') {
      json.data = json.data.data;
    }
    return json;
  } catch { return null; }
};

export const ContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<SiteContent>(defaults);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const [h, a, c, s] = await Promise.all([
        fetchOne('HERO'), fetchOne('ABOUT'), fetchOne('CONTACT'), fetchOne('SERVICES'),
      ]);
      setContent(prev => ({
        hero: h?.data ? { ...defaults.hero, ...h.data } : prev.hero,
        about: a?.data ? { ...defaults.about, ...a.data } : prev.about,
        contact: c?.data ? { ...defaults.contact, ...c.data, socialLinks: c.data.socialLinks || defaults.contact.socialLinks } : prev.contact,
        services: s?.data?.services
          ? s.data.services.map((sv: any) => ({ id: sv.id, name: sv.name, category: sv.category, img: sv.image_url || sv.img || '', isActive: sv.is_active ?? sv.isActive ?? true }))
          : Array.isArray(s?.data)
          ? s.data.map((sv: any) => ({ id: sv.id, name: sv.name, category: sv.category, img: sv.image_url || sv.img || '', isActive: sv.is_active ?? sv.isActive ?? true }))
          : prev.services,
      }));
    } catch (e) {
      console.error('ContentContext fetch failed:', e);
    } finally {
      setLoading(false);
    }
  };

  // Instant update — called right after admin saves, no re-fetch needed
  const updateSection = (section: keyof SiteContent, data: any) => {
    setContent(prev => {
      if (section === 'services') {
        const list = Array.isArray(data) ? data : (data.services || []);
        return {
          ...prev,
          services: list.map((sv: any) => ({ id: sv.id, name: sv.name, category: sv.category, img: sv.image_url || sv.img || '', isActive: sv.is_active ?? sv.isActive ?? true }))
        };
      }
      if (section === 'contact') {
        return { ...prev, contact: { ...defaults.contact, ...data, socialLinks: data.socialLinks || defaults.contact.socialLinks } };
      }
      return { ...prev, [section]: { ...(defaults[section] as any), ...data } };
    });
  };

  useEffect(() => { fetchAll(); }, []);

  return (
    <ContentContext.Provider value={{ content, loading, refresh: fetchAll, updateSection }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => useContext(ContentContext);
