import React, { useState } from 'react';
import FadeInSection from '../components/FadeInSection';
import { useContent } from '../contexts/ContentContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const ServicesPage: React.FC = () => {
  const { content } = useContent();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', dates: '', message: '' });

  const services = content.services.filter(s => s.isActive);

  const openEnquiry = (title: string) => {
    setSelectedService(title);
    setIsFormOpen(true);
    setFormSubmitted(false);
    setFormError('');
    setForm({ name: '', email: '', phone: '', company: '', dates: '', message: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          subject: `${selectedService} Enquiry`,
          message: `${form.message}${form.company ? `\n\nCompany: ${form.company}` : ''}${form.dates ? `\nDates: ${form.dates}` : ''}`,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to send');
      }
      setFormSubmitted(true);
    } catch (err: any) {
      setFormError(err.message || 'Failed to send. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-20 bg-[#F4F4F4] min-h-screen text-black">
      {/* Header */}
      <div className="px-6 md:px-16 mb-24">
        <FadeInSection>
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400 block mb-4">PRODUCTION SERVICES</span>
          <h1 className="text-6xl md:text-[9rem] font-['Oswald'] font-bold leading-[0.85] uppercase tracking-tighter max-w-5xl">
            CRAFTING WORKS<br />THAT STAND OUT
          </h1>
        </FadeInSection>
      </div>

      {/* Services Grid - Modern Card Design */}
      <div className="px-6 md:px-16 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-10 mb-32">
        {services.map((service, idx) => (
          <FadeInSection key={service.id} delay={idx * 100}>
            <article className="group flex flex-col bg-white border-2 border-neutral-200 rounded-3xl overflow-hidden hover:border-black hover:shadow-2xl transition-all duration-500 h-full cursor-pointer"
              onClick={() => openEnquiry(service.name)}>
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                {service.img ? (
                  <img
                    src={service.img}
                    alt={service.name}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 bg-neutral-100"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-50" />
                )}
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="inline-block px-3 py-1 bg-white/95 backdrop-blur-sm text-[8px] font-black uppercase tracking-widest text-black border border-black/10 rounded-full shadow-sm">
                    {service.category || 'Service'}
                  </span>
                </div>
                {/* Enquiry CTA Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="px-8 py-4 bg-white text-black text-sm font-black uppercase tracking-[0.2em] border-2 border-white rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 shadow-2xl">
                    Enquire Now
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 flex flex-col">
                <h3 className="text-2xl md:text-3xl font-['Oswald'] font-bold uppercase tracking-tight mb-4 group-hover:translate-x-2 transition-transform duration-300 leading-none">
                  {service.name}
                </h3>

                {/* Service info */}
                <div className="mt-auto pt-4 border-t-2 border-neutral-100">
                  <p className="text-neutral-500 text-xs uppercase tracking-widest">
                    Click to send enquiry
                  </p>
                </div>
              </div>
            </article>
          </FadeInSection>
        ))}
      </div>

      {/* Enquiry Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsFormOpen(false)} />
          <div className="relative w-full max-w-lg bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsFormOpen(false)} className="absolute top-5 right-5 text-2xl font-black z-50 hover:opacity-50">×</button>
            <div className="p-10">
              {formSubmitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"/>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Enquiry Sent!</h3>
                  <p className="text-gray-500 text-sm mb-8">Our team will contact you within 24 hours.</p>
                  <button onClick={() => setIsFormOpen(false)}
                    className="px-8 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-900 transition-all">
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-black uppercase tracking-tighter mb-1">{selectedService} Enquiry</h2>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-8">Fill in your details and we'll get back to you</p>
                  {formError && <div className="mb-5 p-4 bg-red-50 border-2 border-red-200 text-red-700 text-sm">⚠️ {formError}</div>}
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Full Name *</label>
                      <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                        className="w-full border-b-2 border-black py-2.5 outline-none text-sm bg-transparent" placeholder="Your name" />
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Email *</label>
                        <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                          className="w-full border-b-2 border-black py-2.5 outline-none text-sm bg-transparent" placeholder="you@email.com" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Phone *</label>
                        <input required type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                          className="w-full border-b-2 border-black py-2.5 outline-none text-sm bg-transparent" placeholder="+91 98765 43210" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Company</label>
                        <input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })}
                          className="w-full border-b-2 border-black py-2.5 outline-none text-sm bg-transparent" placeholder="Production Co." />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Project Dates</label>
                        <input value={form.dates} onChange={e => setForm({ ...form, dates: e.target.value })}
                          className="w-full border-b-2 border-black py-2.5 outline-none text-sm bg-transparent" placeholder="e.g. Apr 10–12" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Message *</label>
                      <textarea required rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                        className="w-full border-b-2 border-black py-2.5 outline-none text-sm bg-transparent resize-none"
                        placeholder="Tell us about your project..." />
                    </div>
                    <button type="submit" disabled={submitting}
                      className="w-full bg-black text-white py-4 uppercase font-black text-xs tracking-[0.3em] hover:bg-gray-900 transition-all disabled:opacity-50">
                      {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sending...
                        </span>
                      ) : 'Send Enquiry'}
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
