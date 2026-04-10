import React, { useState, useEffect } from 'react';
import { Save, CheckCircle, Eye, Image, Type, Phone, Layers, ChevronDown, ChevronUp, FolderCode, Sparkles, Globe, Sun } from 'lucide-react';
import { useContent } from '../../contexts/ContentContext';
import ImageUpload from './ImageUpload';

const API_BASE = import.meta.env.VITE_API_URL || 'https://qalastudio.onrender.com/api';

type Tab = 'hero' | 'about' | 'contact' | 'services';

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
  const token = localStorage.getItem('admin_token');
  const r = await fetch(`${API_BASE}/content/${type}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
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
  const [about, setAbout] = useState({
    eyebrow: 'The Minds Behind',
    headingLine1: 'MEET THE MINDS',
    headingLine2: 'BEHIND THE MAGIC',
    members: [
      { name: 'Mudit Sharma', role: 'THE DRIVING FORCE', quote: "Founder. Visionary. Petrolhead. Mudit doesn't just build studios; he builds ecosystems for creativity. His passion is the fuel that keeps Qala moving forward at 100mph.", image: '/assets/mudit.png', footNote: 'Grew up in garage bands & garage startups', annotations: ["Can't live without!\nHis Car", 'FPV goggles on,\nworld off', 'Builder by day,\nDJ by night'], ghostName: 'MUDIT' },
      { name: 'Rishab', role: 'MASTER OF COMPOSITION', quote: "For most, Golden Hour is a time of day; for Rishab, it's game time. Addicted to cinematic flair and perfect framing, he's the one who turns a shot into a story.", image: '/assets/rishab.png', ghostName: 'RISHAB', footNote: 'Uses Ctrl+Z more than anything!! • Style: Cinematic', annotations: ['Addicted to\ncomposition', 'Builder mindset', 'Fav time? golden hour'] },
      { name: 'Parth', role: 'THE DOP & STORYTELLER', quote: 'Seeing the world through a 16-35mm lens, Parth captures what others miss. He doesn\'t just record footage; he crafts visual narratives that breathe life into every frame.', image: '/assets/parth.png', ghostName: 'PARTH', footNote: 'Shoots in 24fps but thinks 100 ideas per second', annotations: ['Go to lens:\n16-35mm', 'Dream location:\nLadakh', 'Sharp story telling'] }
    ],
    manifestoHeading: "QALA IS NOT JUST A SPACE; IT'S A",
    manifestoHighlight: 'MOVEMENT',
    manifestoText: 'We are a team of misfits, artists, and gear-heads united by one goal: Your best shot.'
  });
  const [contact, setContact] = useState({ email: '', phone: '', address: '', mapUrl: '', socialLinks: { instagram: '', twitter: '', linkedin: '' } });
  
  const [services, setServices] = useState({
    headerTitle: 'PRODUCTION SERVICES',
    headerSubtitle: 'Everything you need from pre-production to wrap.',
    sections: [
      { key: 'Equipment', title: 'Equipment Rental', subtitle: '', description: "Qala Studios houses Punjab's most extensive inventory of high-end camera, lighting, and grip equipment. Our on-site department ensures your technical needs are met with precision.", image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1200', layout: 'image-left', beforeImage: '', afterVideo: '', expanded: false },
      { key: 'Digital', title: 'Digital Services', subtitle: '', description: 'Capture your vision with our top-tier digital support. We provide calibrated workstations, high-speed data management, and on-site digital technicians for seamless workflow from sensor to server.', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1200', layout: 'image-right', beforeImage: '', afterVideo: '', expanded: false },
      { key: 'VFX', title: 'VFX Magic', subtitle: 'Where Imagination Meets Reality.', description: 'Our in-house VFX experts convert your wildest concepts into pixel-perfect reality, from chroma keying to 3D environment integration.', image: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=1200', layout: 'image-left', beforeImage: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=1200', afterVideo: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-a-futuristic-city-4412-large.mp4', expanded: false },
      { key: 'Drone', title: 'Drone Shoot & Aerial Cinematography', subtitle: 'New Heights, New Perspectives.', description: 'Capture the bigger picture with certified drone pilots delivering 4K HDR aerial shots and fast-paced FPV maneuvers.', image: 'https://images.unsplash.com/photo-1508444845599-5c89863b1c44?auto=format&fit=crop&q=80&w=1200', layout: 'image-right', beforeImage: '', afterVideo: '', expanded: false },
      { key: 'Locations', title: 'Location Scouting', subtitle: '', description: 'Beyond our dedicated studios, we offer location scouting and production vehicle support for shoots across Punjab.', image: 'https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb5b?auto=format&fit=crop&q=80&w=1200', layout: 'image-left', beforeImage: '', afterVideo: '', expanded: false },
    ]
  });
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);


  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [h, a, c, s] = await Promise.all([
          getContent('HERO'),
          getContent('ABOUT'),
          getContent('CONTACT'),
          getContent('SERVICES'),
        ]);
        if (h?.data) setHero(prev => ({ ...prev, ...h.data }));
        if (a?.data && Array.isArray(a.data.members)) {
          setAbout(prev => ({ 
            ...prev, ...a.data, 
            members: a.data.members.length === 3 ? a.data.members : prev.members 
          }));
        }
        if (c?.data) setContact(prev => ({ ...prev, ...c.data, socialLinks: c.data.socialLinks || prev.socialLinks }));
        if (s?.data && Array.isArray(s.data.sections)) {
          setServices(prev => ({
            ...prev,
            ...s.data,
            sections: s.data.sections.map((sec: any) => ({ ...sec, expanded: false }))
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
        await updateContent('SERVICES', services);
        updateSection('services', services);
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

  const saveAll = async () => {
    setSaving(true);
    setError('');
    try {
      await Promise.all([
        updateContent('HERO', hero).then(() => updateSection('hero', hero)),
        updateContent('ABOUT', about).then(() => updateSection('about', about)),
        updateContent('CONTACT', contact).then(() => updateSection('contact', contact)),
        updateContent('SERVICES', services).then(() => updateSection('services', services)),
      ]);
      setSaved(tab);
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
            <div className="space-y-12 animate-fade-in">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10 border-b-2 border-black/5">
                <F label="Eyebrow Text"><I value={about.eyebrow} onChange={e => setAbout({ ...about, eyebrow: e.target.value })} /></F>
                <F label="Heading Line 1"><I value={about.headingLine1} onChange={e => setAbout({ ...about, headingLine1: e.target.value })} /></F>
                <F label="Heading Line 2"><I value={about.headingLine2} onChange={e => setAbout({ ...about, headingLine2: e.target.value })} /></F>
              </div>

              <h3 className="text-xl font-black uppercase tracking-wider text-black flex items-center gap-3">
                <div className="w-1.5 h-8 bg-black rounded-full" /> TEAM MEMBERS
              </h3>
              
              <div className="space-y-10">
                {about.members.map((m, i) => (
                  <div key={i} className="bg-black/[0.02] border-2 border-black/5 p-8 rounded-[2rem] gap-8 grid md:grid-cols-12">
                     <div className="md:col-span-4 self-stretch">
                       <F label={`Member ${i+1} Photo`} className="h-full">
                         <div className="bg-white p-4 rounded-3xl shadow-sm border-2 border-dashed border-black/10 h-full min-h-[300px]">
                           <ImageUpload value={m.image} onChange={url => { const newA = {...about}; newA.members[i].image = url; setAbout(newA); }} folder="qala-studios/team" label="Vertical Portrait" availableImages={uploadedImages} onUploadComplete={() => {}} />
                         </div>
                       </F>
                     </div>
                     <div className="md:col-span-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <F label="Full Name"><I value={m.name} onChange={e => { const newA = {...about}; newA.members[i].name = e.target.value; setAbout(newA); }} /></F>
                          <F label="Role"><I value={m.role} onChange={e => { const newA = {...about}; newA.members[i].role = e.target.value; setAbout(newA); }} /></F>
                          <F label="Ghost Name (Background)"><I value={m.ghostName} onChange={e => { const newA = {...about}; newA.members[i].ghostName = e.target.value; setAbout(newA); }} /></F>
                          <F label="Footnote / Trivia"><I value={m.footNote} onChange={e => { const newA = {...about}; newA.members[i].footNote = e.target.value; setAbout(newA); }} /></F>
                        </div>
                        <F label="Personal Quote"><T rows={3} value={m.quote} onChange={e => { const newA = {...about}; newA.members[i].quote = e.target.value; setAbout(newA); }} /></F>
                     </div>
                  </div>
                ))}
              </div>

              <div className="pt-10 border-t-2 border-black/5 space-y-8">
                 <h3 className="text-xl font-black uppercase tracking-wider text-black flex items-center gap-3">
                   <div className="w-1.5 h-8 bg-black rounded-full" /> MANIFESTO
                 </h3>
                 <div className="grid md:grid-cols-2 gap-8">
                   <F label="Heading (Regular)"><I value={about.manifestoHeading} onChange={e => setAbout({ ...about, manifestoHeading: e.target.value })} /></F>
                   <F label="Heading (Highlight)"><I value={about.manifestoHighlight} onChange={e => setAbout({ ...about, manifestoHighlight: e.target.value })} /></F>
                   <F label="Main Body" className="md:col-span-2"><T rows={3} value={about.manifestoText} onChange={e => setAbout({ ...about, manifestoText: e.target.value })} /></F>
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
            <div className="space-y-12 animate-fade-in">
              <div className="grid md:grid-cols-2 gap-8 pb-10 border-b-2 border-black/5">
                <F label="Header Title"><I value={services.headerTitle} onChange={e => setServices({ ...services, headerTitle: e.target.value })} /></F>
                <F label="Header Subtitle"><I value={services.headerSubtitle} onChange={e => setServices({ ...services, headerSubtitle: e.target.value })} /></F>
              </div>
              <div className="space-y-8 animate-fade-in">
                {services.sections.map((svc, i) => (
                <div key={svc.key} className={`group bg-white border-2 rounded-[2rem] transition-all duration-500 overflow-hidden ${svc.expanded ? 'border-black shadow-2xl scale-[1.01]' : 'border-black/10 hover:border-black/30'}`}>
                  <div className="p-8 cursor-pointer flex items-center gap-8" onClick={() => {
                    const s = { ...services };
                    s.sections.forEach((sv, idx) => s.sections[idx] = { ...sv, expanded: idx === i ? !sv.expanded : false });
                    setServices(s);
                  }}>
                    <div className="w-24 h-24 bg-black/5 rounded-2xl overflow-hidden border-2 border-black/5 flex-shrink-0 relative group-hover:border-black/10 transition-all">
                      {svc.image ? <img src={svc.image} alt={svc.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Image className="w-8 h-8 text-black/20" /></div>}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-black uppercase tracking-tight text-neutral-800">{svc.title || 'UNNAMED SECTION'}</h4>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400 mt-1">{svc.subtitle || svc.key}</p>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest bg-black/5 text-black/40">
                         {svc.layout}
                       </span>
                       <div className={`p-4 rounded-full transition-all ${svc.expanded ? 'bg-black text-white' : 'bg-black/5 text-black'}`}>
                         {svc.expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                       </div>
                    </div>
                  </div>

                  {svc.expanded && (
                    <div className="px-10 pb-10 pt-4 border-t-2 border-black/5 space-y-10 animate-fade-in bg-black/[0.01]">
                      <div className="grid md:grid-cols-12 gap-10 items-start">
                        <div className="md:col-span-4 self-stretch space-y-6">
                           <F label="Primary Image">
                             <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-black/5">
                               <ImageUpload value={svc.image} onChange={url => { const s = { ...services }; s.sections[i].image = url; setServices(s); }} folder="qala-studios/services" label="Standard or After-state" availableImages={uploadedImages} onUploadComplete={() => {}} />
                             </div>
                           </F>
                           {svc.key === 'VFX' && (
                             <F label="VFX Before Image">
                               <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-black/5">
                                 <ImageUpload value={svc.beforeImage || ''} onChange={url => { const s = { ...services }; s.sections[i].beforeImage = url; setServices(s); }} folder="qala-studios/services" label="Before-state Image" availableImages={uploadedImages} onUploadComplete={() => {}} />
                               </div>
                             </F>
                           )}
                        </div>
                        <div className="md:col-span-8 grid md:grid-cols-2 gap-8">
                             <F label="Section Title"><I value={svc.title} onChange={e => { const s = { ...services }; s.sections[i].title = e.target.value; setServices(s); }} /></F>
                             <F label="Section Subtitle"><I value={svc.subtitle} onChange={e => { const s = { ...services }; s.sections[i].subtitle = e.target.value; setServices(s); }} /></F>
                             <F label="Description" className="md:col-span-2"><T rows={5} value={svc.description} onChange={e => { const s = { ...services }; s.sections[i].description = e.target.value; setServices(s); }} /></F>
                             
                             <div className="md:col-span-2">
                               <F label="Layout Alignment">
                                 <select 
                                   value={svc.layout} 
                                   onChange={e => { const s = { ...services }; s.sections[i].layout = e.target.value as any; setServices(s); }}
                                   className="w-full px-5 py-4 border-2 border-black/10 rounded-2xl focus:border-black focus:ring-4 focus:ring-black/5 outline-none text-sm font-bold uppercase tracking-wide transition-all bg-black/5 cursor-pointer appearance-none"
                                 >
                                   <option value="image-left">Image Left (Text Right)</option>
                                   <option value="image-right">Image Right (Text Left)</option>
                                 </select>
                               </F>
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
