import React, { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import BookingModal from '../components/BookingModal';
import FadeInSection from '../components/FadeInSection';
import { api, StudioOption } from '../services/api';
import { StudioCardSkeleton } from '../components/SkeletonLoader';

const BookPage: React.FC = () => {
    const [studios, setStudios] = useState<StudioOption[]>([]);
    const [selectedStudio, setSelectedStudio] = useState<StudioOption | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStudios = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const data = await api.studios.getAll();
                // Transform backend studio data to frontend format
                // API returns either array directly or { studios: array }
                const studiosArray = Array.isArray(data) ? data : (data as any).studios || [];
                const transformedStudios: StudioOption[] = studiosArray
                    .filter((studio: any) => studio.is_active !== false)
                    .map((studio: any) => ({
                    id: studio.id,
                    name: studio.name,
                    tagline: studio.tagline || 'Professional Production Space',
                    description: studio.description || '',
                    price: studio.price ? `₹${Number(studio.price).toLocaleString('en-IN')}` : 'Contact for pricing',
                    priceNote: studio.price_note || 'per hour',
                    image: studio.image_url || 'https://images.unsplash.com/photo-1598425237654-4fc758e50a93?auto=format&fit=crop&q=80&w=1200',
                    features: Array.isArray(studio.features) ? studio.features : [],
                }));
                setStudios(transformedStudios);
            } catch (err: any) {
                console.error('Failed to fetch studios:', err);
                setError(err.message || 'Failed to load studios');
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudios();
    }, []);

    if (isLoading) {
        return (
            <div className="bg-[#F4F4F4] min-h-screen text-black">
                {/* Header Skeleton */}
                <div className="pt-32 pb-20 px-6 md:px-16">
                    <FadeInSection>
                        <div className="space-y-4">
                            <div className="h-3 w-24 bg-neutral-200 rounded animate-pulse" />
                            <div className="h-24 md:h-40 w-3/4 bg-neutral-200 rounded animate-pulse" />
                            <div className="h-6 w-2/3 bg-neutral-200 rounded animate-pulse mt-4" />
                        </div>
                    </FadeInSection>
                </div>

                {/* Studio Grid Skeleton */}
                <div className="px-6 md:px-16 pb-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-16">
                        <StudioCardSkeleton />
                        <StudioCardSkeleton className="md:mt-20" />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-[#F4F4F4] min-h-screen text-black flex items-center justify-center">
                <div className="text-center p-8">
                    <h2 className="text-3xl font-bold text-red-600 mb-4">Unable to Load Studios</h2>
                    <p className="text-neutral-600 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
          <SEO
            title="Book Your Studio Session"
            description="Reserve your creative space at Qala Studios. Choose from our premium studio sets, get instant confirmation, and flexible booking options."
            ogImage="/hero_editorial.png"
            ogType="website"
          />
          <div className="bg-[#F4F4F4] min-h-screen text-black">
            {/* Header - ServicesPage Style */}
            <div className="pt-32 pb-20 px-6 md:px-16">
                <FadeInSection>
                    <span className="text-[10xs font-bold uppercase tracking-[0.4em] text-neutral-400 block mb-4">
                        BOOKING
                    </span>
                    <h1 className="text-6xl md:text-[8rem] font-['Oswald'] font-bold leading-[0.85] uppercase tracking-tighter max-w-5xl">
                        BOOK YOUR<br />SESSION
                    </h1>
                </FadeInSection>
                <FadeInSection>
                    <p className="mt-8 text-xl md:text-2xl text-neutral-600 max-w-3xl leading-relaxed">
                        Select your creative space and reserve your time. Instant confirmation, flexible booking.
                    </p>
                </FadeInSection>
            </div>

            {/* Studio Selection Grid - ServicesPage Style */}
            <div className="px-6 md:px-16 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-16">
                    {studios.length === 0 ? (
                        <div className="col-span-2 text-center py-20">
                            <p className="text-xl text-neutral-600">No studios available at the moment.</p>
                        </div>
                    ) : (
                        studios.map((studio, idx) => (
                        <FadeInSection key={studio.id} className={`${idx === 1 ? 'md:mt-20' : ''}`}>
                            <div
                                className="group cursor-pointer focus:outline-none focus:ring-4 focus:ring-black/20 rounded-lg"
                                onClick={() => setSelectedStudio(studio)}
                                tabIndex={0}
                                role="button"
                                aria-label={`Book ${studio.name}. Price: ${studio.price} ${studio.priceNote}`}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setSelectedStudio(studio);
                                    }
                                }}
                            >
                                {/* Image Card */}
                                <div className="relative aspect-[4/3] overflow-hidden mb-8 rounded-lg bg-neutral-100">
                                    <img
                                        src={studio.image}
                                        alt={`${studio.name} studio interior`}
                                        width={1200}
                                        height={900}
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                                        loading="lazy"
                                    />

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <div className="w-20 h-20 rounded-full border border-black/30 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                            <span className="text-[10px] text-black font-bold uppercase tracking-widest">
                                                Book Now
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="space-y-4">
                                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-neutral-400 block">
                                        {studio.tagline}
                                    </span>
                                    <h3 className="text-4xl md:text-5xl font-['Oswald'] font-bold uppercase tracking-tight leading-none">
                                        {studio.name}
                                    </h3>
                                    <p className="text-neutral-600 text-sm leading-relaxed">
                                        {studio.description}
                                    </p>

                                    {/* Features */}
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {studio.features.map((feature, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1.5 border border-black/10 rounded-full text-[9px] font-bold uppercase tracking-widest text-neutral-500"
                                            >
                                                {feature}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Price & CTA */}
                                    <div className="flex items-end justify-between pt-4 border-t border-black/10">
                                        <div>
                                            <p className="text-3xl font-black">{studio.price}</p>
                                            <p className="text-[9px] uppercase tracking-widest text-neutral-400">
                                                {studio.priceNote}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold uppercase tracking-widest text-neutral-500 mb-2">
                                                Availability
                                            </p>
                                            <div className="flex items-center gap-2 justify-end">
                                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                                <span className="text-xs font-bold uppercase">Open Now</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </FadeInSection>
                    )))}
                </div>
            </div>

            {/* Info Section */}
            <section className="bg-white pt-32 pb-20 px-6 md:px-16">
                <FadeInSection>
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-16">
                            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400 block mb-4">
                                BOOKING INFORMATION
                            </span>
                            <h2 className="text-5xl md:text-[6rem] font-['Oswald'] font-bold leading-[0.85] uppercase tracking-tighter max-w-4xl">
                                WHAT YOU<br />NEED TO KNOW
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-3 gap-12">
                            <div className="space-y-4">
                                <h3 className="text-xl font-['Oswald'] font-bold uppercase tracking-tight">
                                    Availability
                                </h3>
                                <p className="text-neutral-600 leading-relaxed">
                                    24/7 booking available. Check real-time availability in our calendar. Early bird discounts for bookings 7+ days in advance.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-xl font-['Oswald'] font-bold uppercase tracking-tight">
                                    Cancellation
                                </h3>
                                <p className="text-neutral-600 leading-relaxed">
                                    Free cancellation up to 48 hours before your session. No-show forfeits full deposit. Rescheduling allowed with notice.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-xl font-['Oswald'] font-bold uppercase tracking-tight">
                                    Payment
                                </h3>
                                <p className="text-neutral-600 leading-relaxed">
                                    50% advance deposit required. Balance due 24 hours before session. All major cards, UPI, and bank transfers accepted.
                                </p>
                            </div>
                        </div>
                    </div>
                </FadeInSection>
            </section>

            {/* CTA Section */}
            <section className="bg-black text-white py-32 px-6 md:px-16">
                <FadeInSection>
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-4xl md:text-5xl font-['Oswald'] font-bold uppercase tracking-tighter mb-8">
                            Need Help Choosing?
                        </h2>
                        <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto">
                            Our production consultants can help you select the perfect studio for your project requirements and budget.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <button
                                onClick={() => window.open('tel:+919876543210')}
                                className="px-12 py-6 bg-white text-black uppercase font-black text-xs tracking-[0.3em] hover:bg-neutral-200 transition-all"
                            >
                                Call Us
                            </button>
                            <button
                                onClick={() => document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' })}
                                className="px-12 py-6 border-2 border-white text-white uppercase font-black text-xs tracking-[0.3em] hover:bg-white hover:text-black transition-all"
                            >
                                Get Consultation
                            </button>
                        </div>
                    </div>
                </FadeInSection>
            </section>

            {/* Booking Modal */}
            {selectedStudio && (
                <BookingModal
                    studioId={selectedStudio.id}
                    studioName={selectedStudio.name}
                    onClose={() => setSelectedStudio(null)}
                />
            )}
          </div>
        </>
    );
};

export default BookPage;
