import React, { useState } from 'react';
import FadeInSection from '../components/FadeInSection';
import { useContent } from '../contexts/ContentContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const ContactPage: React.FC = () => {
  const { content } = useContent();
  const c = content.contact;

  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.subject) { setFormError('Please select a subject'); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to send');
      }
      setSubmitted(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err: any) {
      setFormError(err.message || 'Failed to send enquiry');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-20 bg-[#F4F4F4] min-h-screen text-black">
      <div className="px-6 md:px-16 mb-24">
        <FadeInSection>
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400 block mb-4">LOCATION</span>
          <h1 className="text-6xl md:text-[8rem] font-['Oswald'] font-bold leading-[0.85] uppercase tracking-tighter max-w-5xl">FIND US</h1>
        </FadeInSection>
        <FadeInSection>
          <p className="mt-8 text-xl md:text-2xl text-neutral-600 max-w-3xl leading-relaxed">
            Visit our Mohali flagship location. Punjab's most accessible production hub.
          </p>
        </FadeInSection>
      </div>

      <div className="px-6 md:px-16 mb-32">
        <div className="grid lg:grid-cols-2 gap-x-16 gap-y-12 items-stretch">
          <FadeInSection>
            <div className="relative h-[60vh] lg:h-[70vh] overflow-hidden rounded-lg bg-neutral-200 group">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3432.238497672228!2d76.7214563!3d30.654876!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390feea170b61e05%3A0xf6b17c8a676b7f3b!2sJLPL%20Industrial%20Area%2C%20Sector%2082%2C%20Sahibzada%20Ajit%20Singh%20Nagar%2C%20Punjab!5e0!3m2!1sen!2sin!4v1715421245678!5m2!1sen!2sin"
                width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
                referrerPolicy="no-referrer-when-downgrade" title="Qala Studios Location Map"
                className="grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <a href={c.mapUrl || 'https://maps.google.com'} target="_blank" rel="noopener noreferrer"
                  className="px-8 py-4 bg-white text-black uppercase font-black text-xs tracking-[0.3em] hover:bg-black hover:text-white transition-all">
                  Open Maps
                </a>
              </div>
            </div>
          </FadeInSection>

          <FadeInSection>
            <div className="bg-white p-10 md:p-16 rounded-lg shadow-sm h-full flex flex-col justify-center">
              <div className="mb-10">
                <h2 className="text-4xl md:text-5xl font-['Oswald'] font-bold uppercase tracking-tight mb-4">QALA STUDIOS</h2>
                <p className="text-black font-medium whitespace-pre-line">{c.address}</p>
              </div>
              <div className="space-y-3 mb-10">
                {['Direct access via JLPL industrial routes', 'Dedicated parking for 50+ vehicles', 'Heavy equipment truck accommodation', 'Ground floor loading bay', 'Freight elevators available'].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-black rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm text-neutral-700 font-medium">{item}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-4">
                <a href={`tel:${c.phone}`}
                  className="w-full bg-black text-white py-5 uppercase font-black text-xs tracking-[0.3em] hover:invert transition-all text-center border-2 border-black">
                  Call: {c.phone}
                </a>
                <a href={`mailto:${c.email}`}
                  className="w-full border-2 border-black text-black hover:bg-black hover:text-white transition-all py-5 uppercase font-black text-xs tracking-[0.3em] text-center">
                  {c.email}
                </a>
              </div>
            </div>
          </FadeInSection>
        </div>
      </div>

      {/* Enquiry Form */}
      <div className="px-6 md:px-16 pb-20">
        <div className="max-w-3xl mx-auto">
          <FadeInSection>
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400 block mb-4">GET IN TOUCH</span>
            <h2 className="text-5xl md:text-7xl font-['Oswald'] font-bold uppercase tracking-tighter mb-12">SEND AN ENQUIRY</h2>
          </FadeInSection>

          {submitted ? (
            <div className="bg-black text-white p-12 text-center">
              <p className="text-4xl font-['Oswald'] font-bold uppercase mb-4">Message Sent!</p>
              <p className="text-neutral-400">We'll get back to you within 24 hours.</p>
              <button onClick={() => setSubmitted(false)} className="mt-8 px-8 py-3 border-2 border-white text-white text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                Send Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {formError && <div className="p-4 bg-red-50 border-2 border-red-200 text-red-700 text-sm font-medium">⚠️ {formError}</div>}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Full Name *</label>
                  <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-4 border-2 border-black bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm"
                    placeholder="Your full name" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Email *</label>
                  <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-4 border-2 border-black bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm"
                    placeholder="you@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Phone *</label>
                  <input required type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-4 border-2 border-black bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm"
                    placeholder="+91 98765 43210" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Subject *</label>
                  <select required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-4 py-4 border-2 border-black bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm">
                    <option value="" disabled>Select a subject</option>
                    <option>Studio Booking Enquiry</option>
                    <option>Equipment Rental</option>
                    <option>Event Space</option>
                    <option>Pricing Information</option>
                    <option>Partnership</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Message *</label>
                <textarea required rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-4 border-2 border-black bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm resize-none"
                  placeholder="Tell us about your project, requirements, dates..." />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full py-5 bg-black text-white font-black uppercase tracking-widest text-xs hover:bg-neutral-900 transition-all disabled:opacity-50">
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : 'Send Enquiry'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
