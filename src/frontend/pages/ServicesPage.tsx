import React, { useEffect, useState } from 'react';
import FadeInSection from '../components/FadeInSection';

type ServiceType = 'Equipment' | 'Digital' | 'Locations' | 'VFX' | 'Drone';

interface ServiceSection {
  key: ServiceType;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  beforeImage?: string;
  afterVideo?: string;
  layout: 'image-left' | 'image-right';
}

interface ServicesPageContent {
  headerTitle: string;
  headerSubtitle: string;
  sections: ServiceSection[];
}

const API_BASE = import.meta.env.VITE_API_URL || 'https://qalastudio.onrender.com/api';

const fallbackContent: ServicesPageContent = {
  headerTitle: 'PRODUCTION SERVICES',
  headerSubtitle: 'Everything you need from pre-production to wrap.',
  sections: [
    {
      key: 'Equipment',
      title: 'Equipment Rental',
      subtitle: '',
      description:
        "Qala Studios houses Punjab's most extensive inventory of high-end camera, lighting, and grip equipment. Our on-site department ensures your technical needs are met with precision.",
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1200',
      layout: 'image-left',
    },
    {
      key: 'Digital',
      title: 'Digital Services',
      subtitle: '',
      description:
        'Capture your vision with our top-tier digital support. We provide calibrated workstations, high-speed data management, and on-site digital technicians for seamless workflow from sensor to server.',
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1200',
      layout: 'image-right',
    },
    {
      key: 'VFX',
      title: 'VFX Magic',
      subtitle: 'Where Imagination Meets Reality.',
      description:
        'Our in-house VFX experts convert your wildest concepts into pixel-perfect reality, from chroma keying to 3D environment integration.',
      image: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=1200',
      beforeImage: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=1200',
      afterVideo: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-a-futuristic-city-4412-large.mp4',
      layout: 'image-left',
    },
    {
      key: 'Drone',
      title: 'Drone Shoot & Aerial Cinematography',
      subtitle: 'New Heights, New Perspectives.',
      description:
        'Capture the bigger picture with certified drone pilots delivering 4K HDR aerial shots and fast-paced FPV maneuvers.',
      image: 'https://images.unsplash.com/photo-1508444845599-5c89863b1c44?auto=format&fit=crop&q=80&w=1200',
      layout: 'image-right',
    },
    {
      key: 'Locations',
      title: 'Location Scouting',
      subtitle: '',
      description:
        'Beyond our dedicated studios, we offer location scouting and production vehicle support for shoots across Punjab.',
      image: 'https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb5b?auto=format&fit=crop&q=80&w=1200',
      layout: 'image-left',
    },
  ],
};

const ServicesPage: React.FC = () => {
  const [pageContent, setPageContent] = useState<ServicesPageContent>(fallbackContent);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceType>('Equipment');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  });

  useEffect(() => {
    const loadServicesContent = async () => {
      try {
        const res = await fetch(`${API_BASE}/content/SERVICES`);
        if (!res.ok) {
          return;
        }
        const data = await res.json();
        const payload = data?.data;

        if (payload && typeof payload === 'object' && Array.isArray(payload.sections)) {
          const normalizedSections = payload.sections
            .map((item: any) => ({
              key: item.key as ServiceType,
              title: item.title || '',
              subtitle: item.subtitle || '',
              description: item.description || '',
              image: item.image || '',
              beforeImage: item.beforeImage || item.image || '',
              afterVideo: item.afterVideo || '',
              layout: item.layout === 'image-right' ? 'image-right' : 'image-left',
            }))
            .filter((item: ServiceSection) => ['Equipment', 'Digital', 'Locations', 'VFX', 'Drone'].includes(item.key));

          if (normalizedSections.length > 0) {
            setPageContent({
              headerTitle: payload.headerTitle || fallbackContent.headerTitle,
              headerSubtitle: payload.headerSubtitle || fallbackContent.headerSubtitle,
              sections: normalizedSections,
            });
          }
        }
      } catch {
        // Keep fallback content on API failures
      }
    };

    loadServicesContent();
  }, []);

  const openEnquiry = (service: ServiceType) => {
    setSelectedService(service);
    setIsFormOpen(true);
    setFormSubmitted(false);
    setFormError('');
    setForm({ name: '', email: '', phone: '', company: '', message: '' });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      const res = await fetch(`${API_BASE}/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          subject: `${selectedService} Enquiry`,
          message: `${form.message}${form.company ? `\n\nCompany: ${form.company}` : ''}`,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to submit enquiry');
      }

      setFormSubmitted(true);
      setTimeout(() => {
        setIsFormOpen(false);
        setFormSubmitted(false);
      }, 2500);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to submit enquiry');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen text-black">
      <div className="pt-32 pb-20 px-6 md:px-16">
        <FadeInSection>
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400 block mb-4">PRODUCTION SERVICES</span>
          <h1 className="text-6xl md:text-[9rem] font-['Oswald'] font-bold leading-[0.85] uppercase tracking-tighter max-w-5xl">
            {pageContent.headerTitle}
          </h1>
        </FadeInSection>
        <FadeInSection>
          <p className="mt-8 text-xl md:text-2xl text-neutral-600 max-w-3xl leading-relaxed">
            {pageContent.headerSubtitle}
          </p>
          <p className="mt-5 text-sm md:text-base text-neutral-500 max-w-3xl leading-relaxed">
            From camera and digital workflow to VFX, drone cinematography, and location support - our team and infrastructure are
            designed to keep your production fast, reliable, and creatively uncompromised.
          </p>
        </FadeInSection>
      </div>

      <div className="px-3 md:px-6 pb-20 md:pb-28">
      {pageContent.sections.map((section, idx) => {
        const isImageLeft = section.layout === 'image-left';
        return (
          <section key={section.key} className={`grid md:grid-cols-2 gap-0 border-b border-black/5 items-center ${idx === 0 ? 'border-t border-black/5' : ''}`}>
            <div className={`h-[560px] md:h-[600px] overflow-hidden group relative ${isImageLeft ? 'order-1' : 'order-1 md:order-2'}`}>
              {section.key === 'VFX' && section.afterVideo ? (
                <>
                  {/* AFTER layer (always visible underneath) */}
                  <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
                    <source src={section.afterVideo} type="video/mp4" />
                  </video>

                  {/* BEFORE layer slides right on hover */}
                  <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:translate-x-full">
                    <img
                      src={section.beforeImage || section.image}
                      alt={`${section.title} before`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-green-900/35" />
                  </div>

                  <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-md px-4 py-2 border border-white/20 text-[9px] font-black uppercase tracking-widest z-10 text-white">
                    Before/After (Hover)
                  </div>
                </>
              ) : (
                <img
                  src={section.image}
                  alt={section.title}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
                />
              )}
            </div>
            <div className={`p-8 md:p-20 lg:p-24 space-y-8 ${isImageLeft ? 'order-2' : 'order-2 md:order-1'}`}>
              <FadeInSection>
                <h2
                  className={`text-5xl font-black uppercase tracking-tighter ${
                    section.key === 'VFX' ? 'text-blue-500 drop-shadow-[0_0_14px_rgba(59,130,246,0.65)]' : ''
                  }`}
                >
                  {section.title}
                </h2>
                {section.subtitle && <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.4em]">{section.subtitle}</p>}
                <p className="text-gray-600 leading-relaxed text-lg font-medium">{section.description}</p>
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <button
                    onClick={() => openEnquiry(section.key)}
                    className="bg-black text-white px-10 py-4 uppercase font-black text-xs tracking-widest hover:invert transition-all"
                  >
                    Enquire Now
                  </button>
                </div>
              </FadeInSection>
            </div>
          </section>
        );
      })}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsFormOpen(false)} />
          <div className="relative w-full max-w-lg bg-white flex flex-col shadow-2xl overflow-hidden">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-6 right-6 font-black text-2xl z-50 hover:scale-125 transition-transform"
            >
              ×
            </button>

            <div className="p-10 md:p-16 flex flex-col w-full">
              {formSubmitted ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-fade-in">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter">Enquiry Received</h3>
                  <p className="text-gray-500 text-sm uppercase font-bold tracking-widest">A specialist will contact you shortly.</p>
                </div>
              ) : (
                <>
                  <h2 className="text-3xl font-black tracking-tighter uppercase mb-2">{selectedService} Enquiry</h2>
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-10">
                    Professional Support for your vision
                  </p>
                  {formError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm">
                      {formError}
                    </div>
                  )}

                  <form onSubmit={handleFormSubmit} className="space-y-6">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Full Name</label>
                      <input
                        required
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full border-b border-black py-2 outline-none text-xs font-bold uppercase tracking-tight"
                        placeholder="JOHN DOE"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Email</label>
                        <input
                          required
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full border-b border-black py-2 outline-none text-xs font-bold tracking-tight"
                          placeholder="you@example.com"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Phone Number</label>
                        <input
                          required
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          className="w-full border-b border-black py-2 outline-none text-xs font-bold tracking-tight"
                          placeholder="+91 XXXXX XXXXX"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Company Name (Optional)</label>
                      <input
                        type="text"
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                        className="w-full border-b border-black py-2 outline-none text-xs font-bold uppercase tracking-tight"
                        placeholder="PRODUCTION CO."
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Requirements / Message</label>
                      <textarea
                        required
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="w-full border-b border-black py-2 outline-none text-xs font-bold uppercase tracking-tight min-h-[100px]"
                        placeholder="GEAR LIST OR SPECIAL REQUESTS..."
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-black text-white py-5 uppercase font-black text-xs tracking-[0.3em] hover:invert transition-all mt-6 disabled:opacity-50"
                    >
                      {submitting ? 'Submitting...' : 'Submit Enquiry'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;
