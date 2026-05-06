import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'https://qalastudio.onrender.com/api';

export interface GoldenHourSet {
  id: string; name: string; category: string; theme: string;
  props: string[]; dimensions: string; img: string; btsVideo: string;
  description: string; coords: { x: number; y: number; w: number; h: number };
  isActive?: boolean;
  price?: string;
  priceNote?: string;
}

export interface SiteContent {
  hero: { tagline: string; headline: string; subtitle: string; tagline2: string; ctaPrimary: string; ctaSecondary: string; location: string };
  about: { philosophyTitle: string; philosophyText: string; description: string; quote: string; quoteAuthor: string; image: string };
  contact: { email: string; phone: string; address: string; mapUrl: string; socialLinks: { instagram: string; twitter: string; linkedin: string } };
  services: Array<{ id: string; name: string; category: string; img: string; isActive: boolean }>;
  goldenHour: {
    sectionTag: string; sectionTitle: string; sectionDescription: string;
    mapTitle: string; mapDescription: string; btsLabel: string;
    dimensionsLabel: string; propsLabel: string; availabilityLabel: string; availabilityText: string;
    primaryCtaLabel: string; secondaryCtaLabel: string;
    sets: GoldenHourSet[];
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
    sectionTag: 'GOLDEN HOUR COLLECTION',
    sectionTitle: 'GOLDEN HOUR',
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
    sets: [],
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

// Simple in-memory cache: { key → { data, ts } }
const memCache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const fetchOne = async (type: string): Promise<any> => {
  const cacheKey = `content_${type}`;
  const cached = memCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  try {
    const r = await fetch(`${API_BASE}/content/${type}`);
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
    memCache.set(cacheKey, { data: json, ts: Date.now() });
    return json;
  } catch { return null; }
};

// Invalidate client cache for a section (called after admin saves)
const invalidateContentCache = (type?: string) => {
  if (type) {
    memCache.delete(`content_${type}`);
  } else {
    memCache.clear();
  }
};

export const ContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<SiteContent>(defaults);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const [h, a, c, s, gh, ghSets] = await Promise.all([
        fetchOne('HERO'), fetchOne('ABOUT'), fetchOne('CONTACT'), fetchOne('SERVICES'), fetchOne('GOLDEN_HOUR'),
        fetch(`${API_BASE}/golden-hour?active=true`).then(res => res.json()).catch(() => [])
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
        goldenHour: {
          ...(gh?.data ? { ...defaults.goldenHour, ...gh.data } : prev.goldenHour),
          sets: Array.isArray(ghSets) ? ghSets.map((s: any) => ({
            id: s.id, name: s.name, category: s.category, theme: s.theme,
            props: s.props, dimensions: s.dimensions, img: s.image_url || s.img || '',
            btsVideo: s.bts_video || s.btsVideo || '', description: s.description || '',
            coords: { x: s.coords_x, y: s.coords_y, w: s.coords_w, h: s.coords_h },
            isActive: s.is_active, price: s.price?.toString() || '0', priceNote: s.price_note || 'per hour'
          })) : prev.goldenHour.sets
        },
      }));
    } catch (e) {
      console.error('ContentContext fetch failed:', e);
    } finally {
      setLoading(false);
    }
  };

  // Instant update — called right after admin saves, no re-fetch needed
  const updateSection = (section: keyof SiteContent, data: any) => {
    // Bust client-side cache so next refresh gets fresh data
    invalidateContentCache(section.toUpperCase());
    // Also bust golden-hour sets cache when goldenHour section is updated
    if (section === 'goldenHour') {
      memCache.delete('content_GOLDEN_HOUR_SETS');
    }
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

  const refresh = async () => {
    // Clear all caches so fetchAll gets fresh data from server
    invalidateContentCache();
    await fetchAll();
  };

  return (
    <ContentContext.Provider value={{ content, loading, refresh, updateSection }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => useContext(ContentContext);
