import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface SiteContent {
  hero: { tagline: string; headline: string; subtitle: string; tagline2: string; ctaPrimary: string; ctaSecondary: string; location: string };
  about: { philosophyTitle: string; philosophyText: string; description: string; quote: string; quoteAuthor: string; image: string };
  contact: { email: string; phone: string; address: string; mapUrl: string; socialLinks: { instagram: string; twitter: string; linkedin: string } };
  services: Array<{ id: string; name: string; category: string; img: string; isActive: boolean }>;
  goldenHour: {
    sectionTag: string;
    sectionTitle: string;
    sectionDescription: string;
    mapTitle: string;
    mapDescription: string;
    btsLabel: string;
    dimensionsLabel: string;
    propsLabel: string;
    availabilityLabel: string;
    availabilityText: string;
    primaryCtaLabel: string;
    secondaryCtaLabel: string;
    sets: Array<{
      id: string;
      name: string;
      category: string;
      theme: string;
      props: string[];
      dimensions: string;
      img: string;
      btsVideo: string;
      description: string;
      coords: { x: number; y: number; w: number; h: number };
      isActive: boolean;
    }>;
  };
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
  goldenHour: {
    sectionTag: 'Golden Hour Collection',
    sectionTitle: 'Golden Hour',
    sectionDescription: '12 world-class sets designed for cinematic storytelling. Explore our curated collection.',
    mapTitle: 'Blueprint Map',
    mapDescription: 'Click any room to view details. Hover for preview.',
    btsLabel: 'BTS Preview',
    dimensionsLabel: 'Dimensions',
    propsLabel: 'Included Props',
    availabilityLabel: 'Availability',
    availabilityText: 'Ready for Booking',
    primaryCtaLabel: 'Book This Set',
    secondaryCtaLabel: 'Add to Production Cart',
    sets: [
      { id: '1', name: 'Golden Hour Lounge', category: 'Indoor', theme: 'Modern', props: ['Vintage Sofa', 'Marble Tables'], dimensions: '40 x 60 ft', img: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=1200', btsVideo: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-posing-in-a-photo-studio-41481-large.mp4', description: "Our flagship space capturing Mohali's iconic sunset vibes.", coords: { x: 50, y: 50, w: 100, h: 100 }, isActive: true },
      { id: '2', name: 'Conversion Room', category: 'Indoor', theme: 'Minimalist', props: ['Rolling Walls', 'Softbox Grid'], dimensions: '35 x 50 ft', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200', btsVideo: 'https://assets.mixkit.co/videos/preview/mixkit-professional-photographer-working-in-a-studio-41477-large.mp4', description: 'A versatile blank canvas for high-concept editorial builds.', coords: { x: 160, y: 50, w: 100, h: 100 }, isActive: true },
      { id: '3', name: 'Dreamcatcher Den', category: 'Indoor', theme: 'Rustic', props: ['Bamboo Hangings', 'Macramé'], dimensions: '25 x 30 ft', img: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=1200', btsVideo: 'https://assets.mixkit.co/videos/preview/mixkit-photographer-taking-pictures-of-a-model-41479-large.mp4', description: 'Intimate texture-rich environment for lifestyle brand stories.', coords: { x: 270, y: 50, w: 80, h: 100 }, isActive: true },
      { id: '4', name: 'The Red Arch', category: 'Indoor', theme: 'Royal', props: ['Velvet Curtains', 'Gold Pedestals'], dimensions: '30 x 45 ft', img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=1200', btsVideo: 'https://assets.mixkit.co/videos/preview/mixkit-girl-with-red-dress-dancing-under-the-sun-41490-large.mp4', description: 'Striking architectural curves with high-contrast lighting.', coords: { x: 50, y: 160, w: 100, h: 80 }, isActive: true },
      { id: '5', name: 'Backdrop Boulevard', category: 'Indoor', theme: 'Industrial', props: ['Motorized Tracks', 'Steel Beams'], dimensions: '20 x 120 ft', img: 'https://images.unsplash.com/photo-1493106819501-66d381c466f1?auto=format&fit=crop&q=80&w=1200', btsVideo: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-posing-in-front-of-a-white-background-41480-large.mp4', description: 'Massive corridor for automotive and large-scale fashion walk-throughs.', coords: { x: 160, y: 160, w: 190, h: 80 }, isActive: true },
      { id: '6', name: 'The Prism Panel', category: 'Indoor', theme: 'Modern', props: ['Glass Mirrors', 'Neon Bars'], dimensions: '28 x 35 ft', img: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=1200', btsVideo: 'https://assets.mixkit.co/videos/preview/mixkit-woman-dancing-in-a-studio-with-lights-41484-large.mp4', description: 'High-key beauty zone with complex reflective surfaces.', coords: { x: 50, y: 250, w: 120, h: 100 }, isActive: true },
      { id: '7', name: 'Heritage Wall', category: 'Indoor', theme: 'Vintage', props: ['Antique Frames', 'Old Books'], dimensions: '30 x 40 ft', img: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80&w=1200', btsVideo: 'https://assets.mixkit.co/videos/preview/mixkit-man-and-woman-dancing-the-tango-in-a-studio-41485-large.mp4', description: 'Hand-crafted stone and aged textures for cinematic portraits.', coords: { x: 180, y: 250, w: 170, h: 100 }, isActive: true },
      { id: '8', name: 'Nature Niche', category: 'Outdoor', theme: 'Rustic', props: ['Raw Stone Walls', 'Plants'], dimensions: '40 x 80 ft', img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200', btsVideo: 'https://assets.mixkit.co/videos/preview/mixkit-drone-view-of-a-beautiful-resort-area-41482-large.mp4', description: "Botanical sanctuary where Punjab's wild flora meets stone.", coords: { x: 360, y: 50, w: 100, h: 150 }, isActive: true },
      { id: '9', name: 'Echoes of Rome', category: 'Outdoor', theme: 'Royal', props: ['White Columns', 'Marble Steps'], dimensions: '50 x 100 ft', img: 'https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&q=80&w=1200', btsVideo: 'https://assets.mixkit.co/videos/preview/mixkit-model-walking-in-a-white-dress-41486-large.mp4', description: 'Grand white colonnades for epic-scale cinematic storytelling.', coords: { x: 470, y: 50, w: 120, h: 150 }, isActive: true },
      { id: '10', name: 'Golden Steps', category: 'Outdoor', theme: 'Modern', props: ['Tiered Concrete', 'LED strips'], dimensions: '30 x 60 ft', img: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&q=80&w=1200', btsVideo: 'https://assets.mixkit.co/videos/preview/mixkit-woman-walking-on-the-steps-of-a-museum-41487-large.mp4', description: 'Tiered platforms oriented for surgical sunset lighting.', coords: { x: 360, y: 210, w: 100, h: 140 }, isActive: true },
      { id: '11', name: 'White Echo', category: 'Outdoor', theme: 'Minimalist', props: ['White Bounce Walls'], dimensions: '40 x 50 ft', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200', btsVideo: 'https://assets.mixkit.co/videos/preview/mixkit-model-posing-in-a-minimalist-setting-41488-large.mp4', description: 'Stark white surfaces where shadows become the main character.', coords: { x: 470, y: 210, w: 120, h: 140 }, isActive: true },
      { id: '12', name: 'The Arch Vault', category: 'Outdoor', theme: 'Industrial', props: ['Iron Arches', 'Brick Floors'], dimensions: '60 x 90 ft', img: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=1200', btsVideo: 'https://assets.mixkit.co/videos/preview/mixkit-man-dancing-hip-hop-in-an-industrial-area-41489-large.mp4', description: 'Dramatic open-air ironwork under the vast Mohali sky.', coords: { x: 360, y: 360, w: 230, h: 80 }, isActive: true },
    ],
  },
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
      const g = await fetchOne('GOLDEN_HOUR');
      setContent(prev => ({
        hero: h?.data ? { ...defaults.hero, ...h.data } : prev.hero,
        about: a?.data ? { ...defaults.about, ...a.data } : prev.about,
        contact: c?.data ? { ...defaults.contact, ...c.data, socialLinks: c.data.socialLinks || defaults.contact.socialLinks } : prev.contact,
        services: s?.data?.services
          ? s.data.services.map((sv: any) => ({ id: sv.id, name: sv.name, category: sv.category, img: sv.image_url || sv.img || '', isActive: sv.is_active ?? sv.isActive ?? true }))
          : Array.isArray(s?.data)
          ? s.data.map((sv: any) => ({ id: sv.id, name: sv.name, category: sv.category, img: sv.image_url || sv.img || '', isActive: sv.is_active ?? sv.isActive ?? true }))
          : prev.services,
        goldenHour: g?.data
          ? {
              ...defaults.goldenHour,
              ...g.data,
              sets: Array.isArray(g.data.sets)
                ? g.data.sets.map((set: any) => ({
                    ...set,
                    isActive: set.isActive ?? set.is_active ?? true,
                  }))
                : prev.goldenHour.sets,
            }
          : prev.goldenHour,
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
      if (section === 'goldenHour') {
        return {
          ...prev,
          goldenHour: {
            ...defaults.goldenHour,
            ...data,
            sets: Array.isArray(data.sets) ? data.sets : prev.goldenHour.sets,
          },
        };
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
