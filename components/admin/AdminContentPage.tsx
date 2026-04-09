import React, { useState, useEffect } from 'react';
import { Save, CheckCircle, Eye, Image, Type, Phone, Layers, ChevronDown, ChevronUp, FolderCode, Sparkles, Globe } from 'lucide-react';
import { useContent } from '../../contexts/ContentContext';
import ImageUpload from './ImageUpload';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

type Tab = 'hero' | 'about' | 'contact' | 'services' | 'goldenHour';

const F: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({ label, children, className = '' }) => (
  <div className={className}>
    <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-black/40 mb-2">{label}</label>
    {children}
  </div>
);

const I = (p: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...p} className="w-full px-5 py-4 border-2 border-black/10 rounded-2xl focus:border-black focus:ring-4 focus:ring-black/5 outline-none text-sm font-bold uppercase tracking-wide transition-all bg-black/5 hover:bg-black/[0.08]" />
);

const T = (p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...p} className="w-full px-5 py-4 border-2 border-black/10 rounded-2xl focus:border-black focus:ring-4 focus:ring-black/5 outline-none text-sm resize-none font-bold uppercase tracking-wide transition-all bg-black/5 hover:bg-black/[0.08]" />
);

const getContent = async (type: string) => {
  try {
    const r = await fetch(`${API_BASE}/content/${type}`, { cache: 'no-store' });
    if (!r.ok) return null;
    const json = await r.json();
    if (json?.data && typeof json.data === 'string') {
      try { json.data = JSON.parse(json.data); } catch {}
    }
    return json;
  } catch (e) {
    console.error(`Failed to fetch ${type}:`, e);
    return null;
  }
};

const updateContent = async (type: string, data: any) => {
  const r = await fetch(`${API_BASE}/content/${type}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ data }),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({ error: 'Failed' }));
    throw new Error(err.error || 'Save failed');
  }
  return r.json();
};

const AdminContentPage: React.FC = () => {
  const { refresh, updateSection } = useContent();
  const [tab, setTab] = useState<Tab>('hero');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<Tab | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [hero, setHero] = useState({ tagline: '', headline: '', subtitle: '', tagline2: '', ctaPrimary: '', ctaSecondary: '', location: '' });
  const [about, setAbout] = useState({ philosophyTitle: '', philosophyText: '', description: '', quote: '', quoteAuthor: '', image: '' });
  const [contact, setContact] = useState({ email: '', phone: '', address: '', mapUrl: '', socialLinks: { instagram: '', twitter: '', linkedin: '' } });
  const [services, setServices] = useState<Array<{ id: string; name: string; category: string; img: string; isActive: boolean; expanded?: boolean }>>([]);
  const [goldenHour, setGoldenHour] = useState({
    sectionTag: '',
    sectionTitle: '',
    sectionDescription: '',
    mapTitle: '',
    mapDescription: '',
    btsLabel: '',
    dimensionsLabel: '',
    propsLabel: '',
    availabilityLabel: '',
    availabilityText: '',
    primaryCtaLabel: '',
    secondaryCtaLabel: '',
    sets: [] as Array<any>,
  });
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [h, a, c, s, g] = await Promise.all([
          getContent('HERO'),
          getContent('ABOUT'),
          getContent('CONTACT'),
          getContent('SERVICES'),
          getContent('GOLDEN_HOUR'),
        ]);
        if (h?.data) setHero(prev => ({ ...prev, ...h.data }));
        if (a?.data) setAbout(prev => ({ ...prev, ...a.data }));
        if (c?.data) setContact(prev => ({ ...prev, ...c.data, socialLinks: c.data.socialLinks || prev.socialLinks }));
        const svcList = s?.data?.services || (Array.isArray(s?.data) ? s.data : null);
        if (svcList) {
          setServices(svcList.map((sv: any) => ({
            id: sv.id,
            name: sv.name,
            category: sv.category,
            img: sv.image_url || sv.img || '',
            isActive: sv.is_active ?? true,
            expanded: false,
          })));
        }
        if (g?.data) {
          setGoldenHour(prev => ({
            ...prev,
            ...g.data,
            sets: Array.isArray(g.data.sets) ? g.data.sets.map((set: any) => ({ ...set, expanded: false })) : prev.sets,
          }));
        }
      } catch (e) {
        console.error('Failed to load content:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const save = async (t: Tab) => {
    setSaving(true);
    setError('');
    try {
      if (t === 'hero') { await updateContent('HERO', hero); updateSection('hero', hero); }
      if (t === 'about') { await updateContent('ABOUT', about); updateSection('about', about); }
      if (t === 'contact') { await updateContent('CONTACT', contact); updateSection('contact', contact); }
      if (t === 'services') {
        const mapped = services.map(s => ({ id: s.id, name: s.name, category: s.category, image_url: s.img, is_active: s.isActive }));
        await updateContent('SERVICES', { services: mapped });
        updateSection('services', mapped);
      }
      if (t === 'goldenHour') {
        const payload = {
          ...goldenHour,
          sets: goldenHour.sets.map((set: any) => ({ ...set, expanded: undefined })),
        };
        await updateContent('GOLDEN_HOUR', payload);
        updateSection('goldenHour', payload);
      }
      setSaved(t);
      setTimeout(() => setSaved(null), 3000);
      refresh().catch(() => {});
    } catch (e: any) {
      setError(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'hero', label: 'HERO SECTION', icon: Type },
    { id: 'about', label: 'ABOUT STORY', icon: Layers },
    { id: 'contact', label: 'CONTACT INFO', icon: Phone },
    { id: 'services', label: 'ALL SERVICES', icon: Sparkles },
    { id: 'goldenHour', label: 'GOLDEN HOUR', icon: Image },
  ];

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-12 h-12 border-2 border-black/10 border-t-black rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-black rounded-xl text-white">
              <Globe className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">Visual CMS</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black leading-none uppercase tracking-tighter text-black">
            SITE CONTENT
          </h1>
          <p className="text-black/60 text-sm mt-4 max-w-md font-medium tracking-wide">
            Modify the editorial content of your website. Changes reflect instantly upon saving.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <a href="/" target="_blank" rel="noreferrer"
            className="flex items-center gap-3 px-8 py-4 border-2 border-black text-black text-[11px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all duration-500 rounded-2xl group shadow-sm hover:shadow-xl">
            <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" /> VIEW WEBSITE
          </a>
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="flex flex-wrap gap-4 p-2 bg-black/5 rounded-3xl">
        {tabs.map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-3 px-8 py-4 text-[11px] font-black uppercase tracking-widest transition-all duration-300 rounded-2xl relative overflow-hidden group ${
                active 
                  ? 'bg-black text-white shadow-xl translate-y-[-2px]' 
                  : 'bg-transparent text-black/40 hover:text-black hover:bg-white border-2 border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${active ? 'text-white' : 'text-black/40'}`} />
              {t.label}
              {saved === t.id && (
                <CheckCircle className="w-4 h-4 text-green-400 absolute right-2 top-2" />
              )}
              {active && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Container */}
      <div className="bg-white border-2 border-black rounded-[2.5rem] p-10 md:p-12 shadow-2xl relative overflow-hidden min-h-[500px]">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-black/[0.02] rounded-full -translate-y-1/2 translate-x-1/2 -z-0" />
        
        <div className="relative z-10">
          {tab === 'hero' && (
            <div className="space-y-10 animate-fade-in">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <F label="Primary Tagline"><I value={hero.tagline} onChange={e => setHero({ ...hero, tagline: e.target.value })} /></F>
                <F label="Studio Location"><I value={hero.location} onChange={e => setHero({ ...hero, location: e.target.value })} /></F>
                <F label="Hero Headline"><I value={hero.headline} onChange={e => setHero({ ...hero, headline: e.target.value })} /></F>
                <F label="Hero Subtitle"><I value={hero.subtitle} onChange={e => setHero({ ...hero, subtitle: e.target.value })} /></F>
                <F label="Secondary Tagline"><I value={hero.tagline2} onChange={e => setHero({ ...hero, tagline2: e.target.value })} /></F>
                <F label="Primary Button Text"><I value={hero.ctaPrimary} onChange={e => setHero({ ...hero, ctaPrimary: e.target.value })} /></F>
                <F label="Secondary Button Text" className="lg:col-span-1"><I value={hero.ctaSecondary} onChange={e => setHero({ ...hero, ctaSecondary: e.target.value })} /></F>
              </div>

            </div>
          )}

          {tab === 'about' && (
            <div className="space-y-10 animate-fade-in">
              <div className="grid md:grid-cols-2 gap-8">
                <F label="Philosophy Headline"><I value={about.philosophyTitle} onChange={e => setAbout({ ...about, philosophyTitle: e.target.value })} /></F>
                <F label="Quote Attribution"><I value={about.quoteAuthor} onChange={e => setAbout({ ...about, quoteAuthor: e.target.value })} /></F>
                <div className="md:col-span-2 space-y-8">
                  <F label="Philosophy Statement"><T rows={2} value={about.philosophyText} onChange={e => setAbout({ ...about, philosophyText: e.target.value })} /></F>
                  <F label="Main About Description"><T rows={5} value={about.description} onChange={e => setAbout({ ...about, description: e.target.value })} /></F>
                  <F label="Highlighted Quote Box"><T rows={2} value={about.quote} onChange={e => setAbout({ ...about, quote: e.target.value })} /></F>
                </div>
                <div className="md:col-span-2">
                  <F label="Featured About Image">
                    <div className="p-8 bg-black/5 rounded-3xl border-2 border-dashed border-black/10">
                      <ImageUpload value={about.image} onChange={url => setAbout({ ...about, image: url })} folder="qala-studios/about" label="Select a high-quality vertical or wide image" />
                    </div>
                  </F>
                </div>
              </div>
            </div>
          )}

          {tab === 'contact' && (
            <div className="space-y-12 animate-fade-in">
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <h3 className="text-xl font-black uppercase tracking-wider text-black flex items-center gap-3">
                    <div className="w-1.5 h-10 bg-black rounded-full" />
                    DIRECT CHANNELS
                  </h3>
                  <F label="Official Email"><I type="email" value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} /></F>
                  <F label="Studio Phone"><I type="tel" value={contact.phone} onChange={e => setContact({ ...contact, phone: e.target.value })} /></F>
                  <F label="Physical Address"><T rows={3} value={contact.address} onChange={e => setContact({ ...contact, address: e.target.value })} /></F>
                  <F label="Google Maps Integration URL"><I type="url" value={contact.mapUrl} onChange={e => setContact({ ...contact, mapUrl: e.target.value })} /></F>
                </div>
                <div className="space-y-8">
                  <h3 className="text-xl font-black uppercase tracking-wider text-black flex items-center gap-3">
                    <div className="w-1.5 h-10 bg-black rounded-full" />
                    SOCIAL PRESENCE
                  </h3>
                  <F label="Instagram Profile"><I type="url" value={contact.socialLinks?.instagram || ''} onChange={e => setContact({ ...contact, socialLinks: { ...contact.socialLinks, instagram: e.target.value }})} /></F>
                  <F label="X / Twitter Handle"><I type="url" value={contact.socialLinks?.twitter || ''} onChange={e => setContact({ ...contact, socialLinks: { ...contact.socialLinks, twitter: e.target.value }})} /></F>
                  <F label="LinkedIn Page"><I type="url" value={contact.socialLinks?.linkedin || ''} onChange={e => setContact({ ...contact, socialLinks: { ...contact.socialLinks, linkedin: e.target.value }})} /></F>
                </div>
              </div>
            </div>
          )}

          {tab === 'services' && (
            <div className="space-y-8 animate-fade-in">
              {services.map((svc, i) => (
                <div key={svc.id} className={`group bg-white border-2 rounded-[2rem] transition-all duration-500 overflow-hidden ${svc.expanded ? 'border-black shadow-2xl scale-[1.01]' : 'border-black/10 hover:border-black/30'}`}>
                  <div className="p-8 cursor-pointer flex items-center gap-8" onClick={() => {
                    const s = [...services];
                    s.forEach((sv, idx) => s[idx] = { ...sv, expanded: idx === i ? !sv.expanded : false });
                    setServices(s);
                  }}>
                    <div className="w-24 h-24 bg-black/5 rounded-2xl overflow-hidden border-2 border-black/5 flex-shrink-0 relative group-hover:border-black/10 transition-all">
                      {svc.img ? <img src={svc.img} alt={svc.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Image className="w-8 h-8 text-black/20" /></div>}
                      {!svc.isActive && <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center"><p className="text-[10px] font-black uppercase">Hidden</p></div>}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-black uppercase tracking-tight text-neutral-800">{svc.name || 'UNNAMED SERVICE'}</h4>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400 mt-1">{svc.category || 'GENERAL'}</p>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${svc.isActive ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>
                         {svc.isActive ? 'LIVE' : 'DRAFT'}
                       </span>
                       <div className={`p-4 rounded-full transition-all ${svc.expanded ? 'bg-black text-white' : 'bg-black/5 text-black'}`}>
                         {svc.expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                       </div>
                    </div>
                  </div>

                  {svc.expanded && (
                    <div className="px-10 pb-10 pt-4 border-t-2 border-black/5 space-y-10 animate-fade-in bg-black/[0.01]">
                      <div className="grid md:grid-cols-12 gap-10 items-start">
                        <div className="md:col-span-4 self-stretch">
                           <F label="Featured Image">
                             <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-black/5 h-full">
                               <ImageUpload value={svc.img} onChange={url => { const s = [...services]; s[i].img = url; setServices(s); }} folder="qala-studios/services" label="Minimalist framing preferred" />
                             </div>
                           </F>
                        </div>
                        <div className="md:col-span-8 grid md:grid-cols-2 gap-8">
                             <F label="Service Title"><I value={svc.name} onChange={e => { const s = [...services]; s[i].name = e.target.value; setServices(s); }} /></F>
                             <F label="Service Category"><I value={svc.category} onChange={e => { const s = [...services]; s[i].category = e.target.value; setServices(s); }} /></F>
                             <div className="md:col-span-2 pt-6">
                               <button 
                                 onClick={() => { const s = [...services]; s[i].isActive = !s[i].isActive; setServices(s); }}
                                 className={`w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest border-2 transition-all ${svc.isActive ? 'bg-black text-white border-black shadow-lg' : 'bg-white text-black/40 border-black/10 hover:border-black/40'}`}
                               >
                                 {svc.isActive ? 'DISABLE FROM PUBLIC VIEW' : 'ENABLE ON WEBSITE'}
                               </button>
                             </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === 'goldenHour' && (
            <div className="space-y-10 animate-fade-in">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <F label="Section Tag"><I value={goldenHour.sectionTag} onChange={e => setGoldenHour({ ...goldenHour, sectionTag: e.target.value })} /></F>
                <F label="Section Title"><I value={goldenHour.sectionTitle} onChange={e => setGoldenHour({ ...goldenHour, sectionTitle: e.target.value })} /></F>
                <F label="Section Description" className="lg:col-span-3"><T rows={2} value={goldenHour.sectionDescription} onChange={e => setGoldenHour({ ...goldenHour, sectionDescription: e.target.value })} /></F>
                <F label="Map Title"><I value={goldenHour.mapTitle} onChange={e => setGoldenHour({ ...goldenHour, mapTitle: e.target.value })} /></F>
                <F label="Map Description"><I value={goldenHour.mapDescription} onChange={e => setGoldenHour({ ...goldenHour, mapDescription: e.target.value })} /></F>
                <F label="BTS Label"><I value={goldenHour.btsLabel} onChange={e => setGoldenHour({ ...goldenHour, btsLabel: e.target.value })} /></F>
                <F label="Dimensions Label"><I value={goldenHour.dimensionsLabel} onChange={e => setGoldenHour({ ...goldenHour, dimensionsLabel: e.target.value })} /></F>
                <F label="Props Label"><I value={goldenHour.propsLabel} onChange={e => setGoldenHour({ ...goldenHour, propsLabel: e.target.value })} /></F>
                <F label="Availability Label"><I value={goldenHour.availabilityLabel} onChange={e => setGoldenHour({ ...goldenHour, availabilityLabel: e.target.value })} /></F>
                <F label="Availability Text"><I value={goldenHour.availabilityText} onChange={e => setGoldenHour({ ...goldenHour, availabilityText: e.target.value })} /></F>
                <F label="Primary CTA"><I value={goldenHour.primaryCtaLabel} onChange={e => setGoldenHour({ ...goldenHour, primaryCtaLabel: e.target.value })} /></F>
                <F label="Secondary CTA"><I value={goldenHour.secondaryCtaLabel} onChange={e => setGoldenHour({ ...goldenHour, secondaryCtaLabel: e.target.value })} /></F>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-black uppercase tracking-widest">Sets</h3>
                {goldenHour.sets.map((set: any, i: number) => (
                  <div key={set.id || i} className={`group bg-white border-2 rounded-[2rem] transition-all duration-500 overflow-hidden ${set.expanded ? 'border-black shadow-2xl' : 'border-black/10 hover:border-black/30'}`}>
                    <div className="p-8 cursor-pointer flex items-center gap-8" onClick={() => {
                      const next = [...goldenHour.sets];
                      next.forEach((s: any, idx: number) => { next[idx] = { ...s, expanded: idx === i ? !s.expanded : false }; });
                      setGoldenHour({ ...goldenHour, sets: next });
                    }}>
                      <div className="w-24 h-24 bg-black/5 rounded-2xl overflow-hidden border-2 border-black/5 flex-shrink-0">
                        {set.img ? <img src={set.img} alt={set.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Image className="w-8 h-8 text-black/20" /></div>}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-black uppercase tracking-tight text-neutral-800">{set.name || 'UNNAMED SET'}</h4>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400 mt-1">{set.category || 'CATEGORY'} • {set.theme || 'THEME'}</p>
                      </div>
                      <div className={`p-4 rounded-full transition-all ${set.expanded ? 'bg-black text-white' : 'bg-black/5 text-black'}`}>
                        {set.expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>

                    {set.expanded && (
                      <div className="px-10 pb-10 pt-4 border-t-2 border-black/5 space-y-8 animate-fade-in bg-black/[0.01]">
                        <div className="grid md:grid-cols-12 gap-8">
                          <div className="md:col-span-4">
                            <F label="Set Image">
                              <ImageUpload value={set.img} onChange={url => {
                                const next = [...goldenHour.sets];
                                next[i] = { ...next[i], img: url };
                                setGoldenHour({ ...goldenHour, sets: next });
                              }} folder="qala-studios/golden-hour" label="Upload set image" />
                            </F>
                          </div>
                          <div className="md:col-span-8 grid md:grid-cols-2 gap-6">
                            <F label="Set Name"><I value={set.name || ''} onChange={e => { const next = [...goldenHour.sets]; next[i] = { ...next[i], name: e.target.value }; setGoldenHour({ ...goldenHour, sets: next }); }} /></F>
                            <F label="Category"><I value={set.category || ''} onChange={e => { const next = [...goldenHour.sets]; next[i] = { ...next[i], category: e.target.value }; setGoldenHour({ ...goldenHour, sets: next }); }} /></F>
                            <F label="Theme"><I value={set.theme || ''} onChange={e => { const next = [...goldenHour.sets]; next[i] = { ...next[i], theme: e.target.value }; setGoldenHour({ ...goldenHour, sets: next }); }} /></F>
                            <F label="Dimensions"><I value={set.dimensions || ''} onChange={e => { const next = [...goldenHour.sets]; next[i] = { ...next[i], dimensions: e.target.value }; setGoldenHour({ ...goldenHour, sets: next }); }} /></F>
                            <F label="BTS Video URL" className="md:col-span-2"><I value={set.btsVideo || ''} onChange={e => { const next = [...goldenHour.sets]; next[i] = { ...next[i], btsVideo: e.target.value }; setGoldenHour({ ...goldenHour, sets: next }); }} /></F>
                            <F label="Description" className="md:col-span-2"><T rows={3} value={set.description || ''} onChange={e => { const next = [...goldenHour.sets]; next[i] = { ...next[i], description: e.target.value }; setGoldenHour({ ...goldenHour, sets: next }); }} /></F>
                            <F label="Props (comma separated)" className="md:col-span-2"><I value={Array.isArray(set.props) ? set.props.join(', ') : ''} onChange={e => { const next = [...goldenHour.sets]; next[i] = { ...next[i], props: e.target.value.split(',').map((p: string) => p.trim()).filter(Boolean) }; setGoldenHour({ ...goldenHour, sets: next }); }} /></F>
                            <F label="Map X"><I type="number" value={set.coords?.x ?? 0} onChange={e => { const next = [...goldenHour.sets]; next[i] = { ...next[i], coords: { ...(next[i].coords || {}), x: Number(e.target.value) } }; setGoldenHour({ ...goldenHour, sets: next }); }} /></F>
                            <F label="Map Y"><I type="number" value={set.coords?.y ?? 0} onChange={e => { const next = [...goldenHour.sets]; next[i] = { ...next[i], coords: { ...(next[i].coords || {}), y: Number(e.target.value) } }; setGoldenHour({ ...goldenHour, sets: next }); }} /></F>
                            <F label="Map Width"><I type="number" value={set.coords?.w ?? 0} onChange={e => { const next = [...goldenHour.sets]; next[i] = { ...next[i], coords: { ...(next[i].coords || {}), w: Number(e.target.value) } }; setGoldenHour({ ...goldenHour, sets: next }); }} /></F>
                            <F label="Map Height"><I type="number" value={set.coords?.h ?? 0} onChange={e => { const next = [...goldenHour.sets]; next[i] = { ...next[i], coords: { ...(next[i].coords || {}), h: Number(e.target.value) } }; setGoldenHour({ ...goldenHour, sets: next }); }} /></F>
                            <div className="md:col-span-2 pt-2">
                              <button
                                onClick={() => { const next = [...goldenHour.sets]; next[i] = { ...next[i], isActive: !(next[i].isActive ?? true) }; setGoldenHour({ ...goldenHour, sets: next }); }}
                                className={`w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest border-2 transition-all ${(set.isActive ?? true) ? 'bg-black text-white border-black' : 'bg-white text-black/40 border-black/10 hover:border-black/40'}`}
                              >
                                {(set.isActive ?? true) ? 'DISABLE FROM WEBSITE' : 'ENABLE ON WEBSITE'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Global Save Action Bar */}
        <div className="mt-20 pt-10 border-t-2 border-black/10 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-center gap-6">
              <div className="p-4 bg-black/5 rounded-2xl">
                <FolderCode className="w-6 h-6 text-black/40" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-black">Cloud Sync Enabled</p>
                <p className="text-xs text-black/40 mt-1 uppercase font-medium">Changes propagate via global edge CDN</p>
              </div>
           </div>
           
           <div className="flex flex-col items-center md:items-end gap-3">
             {error && <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">⚠️ {error}</p>}
             <button 
               onClick={() => save(tab)} 
               disabled={saving}
               className="group relative flex items-center gap-4 px-12 py-6 bg-black text-white text-[12px] font-black uppercase tracking-[0.3em] hover:bg-neutral-900 disabled:opacity-50 transition-all rounded-3xl shadow-2xl hover:shadow-black/20 translate-z-0 hover:-translate-y-1"
             >
               {saving ? (
                 <>
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   SYNCING...
                 </>
               ) : (
                 <>
                   <Save className="w-5 h-5 group-hover:animate-bounce" />
                   PUBLISH {tabs.find(t => t.id === tab)?.label.split(' ')[0]}
                 </>
               )}
               {saved === tab && (
                 <div className="absolute -top-3 -right-3 bg-green-500 text-white p-2 rounded-full shadow-lg animate-bounce">
                   <CheckCircle className="w-4 h-4" />
                 </div>
               )}
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminContentPage;
