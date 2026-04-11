import React, { useState, useEffect, useRef } from 'react';
import { api, BookingHoldResponse, AvailabilitySlot, AvailabilityRange } from '../services/api';
import { UserDetailsForm, UserDetails } from './UserDetailsForm';
import { useContent } from '../contexts/ContentContext';
import { useUserAuth } from '../contexts/UserAuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'https://qalastudio.onrender.com/api';

// Icon Components
const IconCalendar: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const IconClock: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconUser: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const IconCreditCard: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const IconShieldCheck: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const IconSquarePen: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const IconPhone: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const IconEnvelope: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const IconBuildingOffice: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const IconAlertTriangle: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const IconArrowRight: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

const IconChevronLeft: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const IconRefresh: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const IconCheckBadge: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

interface BookingModalProps {
    studioId: string;
    studioName: string;
    onClose: () => void;
}

type BookingStep = 'datetime' | 'suggestions' | 'details' | 'payment' | 'confirm' | 'success';

const BookingModal: React.FC<BookingModalProps> = ({ studioId, studioName, onClose }) => {
    const { content } = useContent();
    const { user } = useUserAuth();
    const contact = content.contact;
    const [step, setStep] = useState<BookingStep>('datetime');
    const [date, setDate] = useState('');
    const [duration, setDuration] = useState('2');
    const [holdData, setHoldData] = useState<BookingHoldResponse | null>(null);
    const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
    const [suggestedSlots, setSuggestedSlots] = useState<any[]>([]);
    const [availableSlots, setAvailableSlots] = useState<{ start: string; end: string; price: number; currency: string; is_available: boolean }[]>([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string; price: number } | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailStatus, setEmailStatus] = useState<'pending' | 'sent' | 'failed'>('pending');
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('card');
    const [bookingId, setBookingId] = useState<string | null>(null);
    const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
    const today = new Date().toISOString().split('T')[0];

    // Real-time slot polling — refreshes every 10s while on datetime step
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const currentDateRef = useRef(date);
    const currentDurationRef = useRef(duration);
    currentDateRef.current = date;
    currentDurationRef.current = duration;

    useEffect(() => {
        if (step === 'datetime' && date && availableSlots.length > 0) {
            pollRef.current = setInterval(() => {
                silentRefreshSlots(currentDateRef.current, currentDurationRef.current);
            }, 10000);
        }
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, [step, date, availableSlots.length]);

    // Silent refresh — updates slots without showing loading spinner
    const silentRefreshSlots = async (selectedDate: string, durationHours: string) => {
        if (!selectedDate) return;
        try {
            const res = await fetch(`${API_BASE}/availability/slots?studio_id=${studioId}&date=${selectedDate}&duration_hours=${durationHours}`);
            const data = await res.json();
            if (!res.ok) return;
            const newSlots = data.slots || [];
            setAvailableSlots(newSlots);
            setLastRefreshed(new Date());
            // If selected slot is no longer available, deselect it
            setSelectedSlot(prev => {
                if (!prev) return prev;
                const updatedSlot = newSlots.find((s: any) => s.start === prev.start);
                if (!updatedSlot || !updatedSlot.is_available) {
                    setError('Your selected slot was just taken by another user! The time slot is now locked.');
                    return null;
                }
                return prev;
            });
        } catch { /* silent */ }
    };

    const formatTimeOnly = (isoString: string) => {
      return new Date(isoString).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    };

    // Fetch available slots for selected date + duration
    const fetchSlots = async (selectedDate: string, durationHours: string) => {
        if (!selectedDate) return;
        setSlotsLoading(true);
        setAvailableSlots([]);
        setSelectedSlot(null);
        setError('');
        // Stop any existing poll
        if (pollRef.current) clearInterval(pollRef.current);
        try {
            const res = await fetch(`${API_BASE}/availability/slots?studio_id=${studioId}&date=${selectedDate}&duration_hours=${durationHours}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to fetch slots');
            setAvailableSlots(data.slots || []);
            setLastRefreshed(new Date());
            if ((data.slots || []).length === 0) {
                setError('No available slots on this date. Please try another date.');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to check availability');
        } finally {
            setSlotsLoading(false);
        }
    };

    const handleHold = async () => {
        if (!selectedSlot) { setError('Please select a time slot'); return; }
        setLoading(true);
        setError('');
        try {
            const holdResponse = await api.bookings.hold(studioId, selectedSlot.start, selectedSlot.end);
            setHoldData({
                lock_token: holdResponse.lock_token,
                pricing_preview: holdResponse.pricing_preview,
                expires_at: holdResponse.expires_at
            });
            setStep('details');
        } catch (err: any) {
            setError(err.message || 'Failed to hold slot. It may have just been taken. Please select another.');
            // Refresh slots to show updated availability
            fetchSlots(date, duration);
        } finally {
            setLoading(false);
        }
    };
    // Helper: fetch available slots from availability ranges (used as fallback)
    const fetchAvailableSlots = async (date: string, durationHours: number): Promise<AvailabilitySlot[]> => {
        const dateStr = `${date}T00:00:00`;
        const startDate = new Date(dateStr);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);

        const response = await fetch(`${API_BASE}/availability?studio_id=${studioId}&start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`);
        if (!response.ok) {
            throw new Error('Failed to fetch availability');
        }
        const data = await response.json();
        const ranges: AvailabilityRange[] = data.available_slots || [];

        const slots: AvailabilitySlot[] = [];
        for (const range of ranges) {
            const rangeStart = new Date(range.start);
            const rangeEnd = new Date(range.end);
            const rangeDuration = (rangeEnd.getTime() - rangeStart.getTime()) / (1000 * 60 * 60);

            if (rangeDuration >= durationHours) {
                const slotStart = new Date(rangeStart);
                const slotEnd = new Date(slotStart);
                slotEnd.setHours(slotStart.getHours() + durationHours);

                if (slotEnd <= rangeEnd) {
                    try {
                        const priceRes = await api.studios.getPrice(studioId, slotStart.toISOString(), slotEnd.toISOString());
                        slots.push({
                            start: slotStart.toISOString(),
                            end: slotEnd.toISOString(),
                            price: {
                                base: priceRes.base || priceRes.total,
                                total: priceRes.total,
                                currency: priceRes.currency || 'INR'
                            },
                            is_available: true
                        });
                    } catch (e) {
                        console.error('Failed to get price for slot', e);
                    }
                }
            }
        }
        return slots;
    };

    const handleSelectSuggestion = (slot: AvailabilitySlot) => {
        const start = new Date(slot.start);
        const end = new Date(slot.end);

        const dateStr = start.toISOString().split('T')[0];
        setDate(dateStr);


        const durationHours = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60));
        setDuration(durationHours.toString());

        setError('');
        setStep('datetime');
    };

    const handleUserDetailsSubmit = (details: UserDetails) => {
        setUserDetails(details);
        setStep('payment');
    };

    // Pre-fill from logged-in user when entering details step
    useEffect(() => {
        if (step === 'details' && user && !userDetails) {
            setUserDetails({
                fullName: user.fullName || '',
                email: user.email || '',
                phone: user.phone || '',
                company: '',
                specialRequirements: '',
            });
        }
    }, [step]);

    const handlePaymentConfirm = async () => {
        if (!holdData || !userDetails) return;
        setLoading(true);
        setError('');
        try {
            // Generate a mock payment intent ID (real integration would come from Stripe/Payment Gateway)
            const mockPaymentIntentId = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Map UserDetails (camelCase) to API format (snake_case)
            const userDetailsInput = {
                full_name: userDetails.fullName,
                email: userDetails.email,
                phone: userDetails.phone,
                company: userDetails.company || undefined,
                special_requirements: userDetails.specialRequirements || undefined
            };

            const response = await api.bookings.confirm(
                holdData.lock_token,
                mockPaymentIntentId,
                holdData.pricing_preview.total,
                userDetailsInput
            );

            // Store booking ID and update email status
            setBookingId(response.booking_id);
            setEmailStatus(response.email_status === 'sent' ? 'sent' : 'failed');

            // Wait a moment to simulate email processing, then show success
            setTimeout(() => {
                setStep('success');
            }, 1000);
        } catch (err: any) {
            setError(err.message || 'Booking confirmation failed');
            setEmailStatus('failed');
        } finally {
            setLoading(false);
        }
    };

    const formatSlotTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleString('en-IN', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStepNumber = (stepId: string) => {
        const stepOrder = ['datetime', 'details', 'payment', 'confirm'];
        return stepOrder.indexOf(stepId) + 1;
    };

    const steps = [
        { id: 'datetime', label: 'Date & Time', icon: <IconCalendar className="w-5 h-5" /> },
        { id: 'details', label: 'Your Details', icon: <IconUser className="w-5 h-5" /> },
        { id: 'payment', label: 'Payment', icon: <IconCreditCard className="w-5 h-5" /> },
        { id: 'confirm', label: 'Confirm', icon: <IconShieldCheck className="w-5 h-5" /> },
    ];

    const currentStepIndex = steps.findIndex(s => s.id === step);

    return (
        <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in shadow-2xl">
                {/* Header */}
                <div className="px-8 py-6 border-b-4 border-black bg-neutral-50 flex-shrink-0">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <div className="flex items-center gap-4 mb-2">
                                <span className="text-xs font-black uppercase tracking-widest text-neutral-500">
                                    Booking Flow
                                </span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-['Oswald'] font-bold uppercase tracking-tight">
                                {studioName}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-3xl font-light hover:opacity-50 transition-opacity"
                            aria-label="Close"
                        >
                            ×
                        </button>
                    </div>

                    {/* Step Progress Bar */}
                    <div className="flex items-center gap-4">
                        {steps.map((s, idx) => (
                            <React.Fragment key={s.id}>
                                <div className="flex flex-col items-center gap-2">
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
                                            getStepNumber(s.id) <= currentStepIndex + 1
                                                ? 'bg-black text-white'
                                                : 'bg-neutral-200 text-neutral-400'
                                        }`}
                                    >
                                        {step === s.id ? <span className="animate-pulse">{s.icon}</span> : getStepNumber(s.id)}
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                                        {s.label}
                                    </span>
                                </div>
                                {idx < steps.length - 1 && (
                                    <div
                                        className={`flex-1 h-1 ${
                                            getStepNumber(s.id) < currentStepIndex + 1 ? 'bg-black' : 'bg-neutral-200'
                                        }`}
                                    />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-white">
                    {step === 'datetime' && (
                        <div className="max-w-3xl">
                            <div className="mb-8">
                                <h3 className="text-2xl font-['Oswald'] font-bold uppercase tracking-tight mb-2">SELECT DATE & DURATION</h3>
                                <p className="text-neutral-500 text-sm">Pick a date and session length — we'll show all available time slots.</p>
                            </div>

                            {/* Date + Duration */}
                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                                        <IconCalendar className="w-4 h-4" /> Date
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full border-2 border-black p-4 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
                                        value={date}
                                        min={today}
                                        onChange={e => {
                                            setDate(e.target.value);
                                            setAvailableSlots([]);
                                            setSelectedSlot(null);
                                            setError('');
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                                        <IconClock className="w-4 h-4" /> Duration
                                    </label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[['1','1h'],['2','2h'],['4','4h'],['8','8h']].map(([val, label]) => (
                                            <button key={val} onClick={() => {
                                                setDuration(val);
                                                setAvailableSlots([]);
                                                setSelectedSlot(null);
                                                setError('');
                                            }}
                                                className={`border-2 py-3 text-center transition-all ${duration === val ? 'border-black bg-black text-white' : 'border-black/20 hover:border-black'}`}>
                                                <div className="text-lg font-bold">{label}</div>
                                                <div className="text-[9px] uppercase tracking-wider opacity-70">
                                                    {val === '1' ? 'Quick' : val === '2' ? 'Standard' : val === '4' ? 'Half Day' : 'Full Day'}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Check Availability Button */}
                            <button
                                onClick={() => fetchSlots(date, duration)}
                                disabled={!date || slotsLoading}
                                className="w-full border-2 border-black py-4 uppercase font-black text-xs tracking-[0.3em] hover:bg-black hover:text-white transition-all disabled:opacity-40 flex items-center justify-center gap-3 mb-8"
                            >
                                {slotsLoading ? (
                                    <><div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" /> Checking availability...</>
                                ) : (
                                    <><IconCalendar className="w-4 h-4" /> Show Available Slots</>
                                )}
                            </button>

                            {/* Error */}
                            {error && !slotsLoading && (
                                <div className="bg-red-50 border-2 border-red-200 p-4 mb-6">
                                    <p className="text-red-700 font-bold text-sm">⚠️ {error}</p>
                                </div>
                            )}

                            {/* Available Slots Grid */}
                            {availableSlots.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-black uppercase tracking-widest text-neutral-500">
                                            {availableSlots.length} slots available on {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            {selectedSlot && (
                                                <span className="text-xs font-bold text-green-600 uppercase tracking-wider">✓ Slot selected</span>
                                            )}
                                            <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-neutral-400">
                                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                                Live · updates every 10s
                                            </span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-1">
                                        {availableSlots.map((slot, idx) => {
                                            const start = new Date(slot.start);
                                            const end = new Date(slot.end);
                                            const isSelected = selectedSlot?.start === slot.start;
                                            const isAvailable = slot.is_available;
                                            const fmt = (d: Date) => d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
                                            
                                            if (!isAvailable) {
                                                // BookMyShow Style Locked Slot
                                                return (
                                                    <div key={idx} className="border-2 p-4 text-left border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed relative overflow-hidden group">
                                                        <p className="text-sm font-black line-through">{fmt(start)}</p>
                                                        <p className="text-xs">to {fmt(end)}</p>
                                                        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100/80 backdrop-blur-[1px]">
                                                            <span className="font-bold text-xs uppercase tracking-widest text-neutral-500 flex items-center gap-1">
                                                                🔒 BOOKED
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <button key={idx} onClick={() => setSelectedSlot(slot)}
                                                    className={`border-2 p-4 text-left transition-all ${isSelected ? 'border-black bg-black text-white outline outline-2 outline-offset-2 outline-black' : 'border-neutral-300 hover:border-black bg-white shadow-[0_2px_0_0_black] hover:-translate-y-0.5 hover:shadow-[0_4px_0_0_black]'}`}>
                                                    <p className={`text-sm font-black ${isSelected ? 'text-white' : 'text-black'}`}>{fmt(start)}</p>
                                                    <p className={`text-xs ${isSelected ? 'text-white/70' : 'text-neutral-500'}`}>to {fmt(end)}</p>
                                                    {slot.price > 0 && (
                                                        <p className={`text-sm font-bold mt-2 ${isSelected ? 'text-[#D4AF37]' : 'text-black'}`}>
                                                            ₹{slot.price.toLocaleString('en-IN')}
                                                        </p>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Confirm selected slot */}
                                    {selectedSlot && (
                                        <button
                                            onClick={handleHold}
                                            disabled={loading}
                                            className="w-full bg-black text-white py-5 uppercase font-black text-xs tracking-[0.3em] hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
                                        >
                                            {loading ? (
                                                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Reserving slot...</>
                                            ) : (
                                                <>Book {new Date(selectedSlot.start).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })} — ₹{selectedSlot.price.toLocaleString('en-IN')}</>
                                            )}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 'suggestions' && (
                        <div className="max-w-3xl">
                            <div className="bg-amber-50 border-2 border-amber-400 p-6 mb-8">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <IconAlertTriangle className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-black uppercase tracking-tight text-amber-900 mb-2 text-xl">
                                            Slot Unavailable
                                        </h4>
                                        <p className="text-amber-800">
                                            The selected time is already booked. Here are the <strong>5 nearest available slots</strong> you can choose from:
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {suggestedSlots.length > 0 ? (
                                <div className="space-y-3 mb-8">
                                    {suggestedSlots.map((slot, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSelectSuggestion(slot)}
                                            disabled={loading}
                                            className="w-full border-2 border-neutral-200 p-5 text-left hover:border-black hover:bg-neutral-50 transition-all group"
                                        >
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-bold text-lg group-hover:translate-x-2 transition-transform flex items-center gap-2">
                                                        <IconCalendar className="w-5 h-5" />
                                                        {formatSlotTime(slot.start)}
                                                    </p>
                                                    <p className="text-neutral-500 text-sm">
                                                        to {formatSlotTime(slot.end)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <p className="text-xs text-neutral-500 uppercase">Total</p>
                                                        <p className="text-2xl font-black">₹{slot.price.total}</p>
                                                    </div>
                                                    <span className="text-sm font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform flex items-center gap-1">
                                                        Select <IconArrowRight className="w-4 h-4" />
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-neutral-50 rounded-lg border-2 border-dashed border-neutral-300">
                                    <p className="text-neutral-500 mb-4">No available slots found in the next 7 days.</p>
                                    <button
                                        onClick={() => setStep('datetime')}
                                        className="text-sm font-bold uppercase tracking-widest hover:underline"
                                    >
                                        ← Choose Different Date →
                                    </button>
                                </div>
                            )}

                            <button
                                onClick={() => { setStep('datetime'); setError(''); }}
                                className="text-sm font-bold uppercase tracking-widest hover:underline flex items-center gap-2"
                            >
                                <IconChevronLeft className="w-4 h-4" />
                                Back to Date Selection
                            </button>
                        </div>
                    )}

                    {step === 'details' && (
                        <div className="max-w-2xl">
                            <div className="mb-8">
                                <h3 className="text-2xl font-['Oswald'] font-bold uppercase tracking-tight mb-4">
                                    YOUR DETAILS
                                </h3>
                                <p className="text-neutral-600">
                                    Fill in your contact information so we can confirm your booking.
                                </p>
                            </div>
                            <UserDetailsForm
                                onSubmit={handleUserDetailsSubmit}
                                onCancel={() => setStep('datetime')}
                                loading={loading}
                            />
                        </div>
                    )}

                    {step === 'payment' && holdData && userDetails && (
                        <div className="max-w-3xl space-y-8">
                            <div>
                                <h3 className="text-2xl font-['Oswald'] font-bold uppercase tracking-tight mb-6">
                                    PAYMENT & CONFIRMATION
                                </h3>
                                <p className="text-neutral-600 mb-6">
                                    Review your booking and choose your preferred payment method.
                                </p>
                            </div>

                            {/* Booking Summary */}
                            <div className="bg-white border-4 border-black p-6 shadow-md">
                                <h4 className="font-bold uppercase tracking-tight mb-4 flex items-center gap-2">
                                    <IconSquarePen className="w-5 h-5" />
                                    Booking Summary
                                </h4>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-1">Studio</p>
                                            <p className="font-bold text-lg">{studioName}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-1">Date</p>
                                            <p className="font-bold">
                                                {date ? new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }) : '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-1">Time</p>
                                            <p className="font-bold">
                                                {selectedSlot ? formatTimeOnly(selectedSlot.start) : ''} - {selectedSlot ? formatTimeOnly(selectedSlot.end) : ''}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-1">Duration</p>
                                            <p className="font-bold">{duration} hours</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-1">Contact</p>
                                            <p className="font-bold">{userDetails.fullName}</p>
                                            <p className="text-sm text-neutral-600">{userDetails.email}</p>
                                            <p className="text-sm text-neutral-600">{userDetails.phone}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-1">Company</p>
                                            <p className="font-bold">{userDetails.company || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="space-y-4">
                                <h4 className="text-lg font-bold uppercase tracking-tight flex items-center gap-2">
                                    <IconCreditCard className="w-5 h-5" />
                                    Payment Method
                                </h4>
                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { id: 'card', label: 'Card / UPI', icon: <IconCreditCard className="w-8 h-8 mx-auto" />, desc: 'Online payment' },
                                        { id: 'upi', label: 'UPI', icon: <IconPhone className="w-8 h-8 mx-auto" />, desc: 'GPay, Paytm' },
                                        { id: 'cash', label: 'Cash', icon: <IconCreditCard className="w-8 h-8 mx-auto" />, desc: 'Pay at studio' }
                                    ].map(method => (
                                        <button
                                            key={method.id}
                                            onClick={() => setPaymentMethod(method.id as any)}
                                            className={`border-2 p-6 text-center transition-all ${
                                                paymentMethod === method.id
                                                    ? 'border-black bg-black text-white'
                                                    : 'border-black/20 hover:border-black hover:bg-neutral-50'
                                            }`}
                                        >
                                            <div className="mb-2 flex justify-center">{method.icon}</div>
                                            <div className="font-bold uppercase tracking-wider mb-1">
                                                {method.label}
                                            </div>
                                            <div className="text-xs opacity-70">
                                                {method.desc}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price */}
                            <div className="bg-neutral-100 border-2 border-black p-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-black uppercase tracking-widest text-neutral-500">
                                            Total Amount
                                        </p>
                                        {paymentMethod === 'cash' && (
                                            <p className="text-xs text-neutral-600 mt-1">
                                                Pay at studio before session
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-4xl font-black">₹{holdData.pricing_preview.total}</p>
                                        <p className="text-xs text-neutral-500">
                                            {paymentMethod === 'cash' ? 'Due on arrival' : 'Pay now'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border-2 border-red-200 p-4 flex items-start gap-3">
                                    <IconAlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                    <p className="text-red-700 font-bold text-sm">{error}</p>
                                </div>
                            )}

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setStep('details')}
                                    className="flex-1 border-2 border-black py-4 uppercase font-black text-xs tracking-widest hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2"
                                >
                                    <IconChevronLeft className="w-4 h-4" />
                                    Back
                                </button>
                                <button
                                    onClick={() => handlePaymentConfirm()}
                                    disabled={loading}
                                    className="flex-2 bg-black text-white py-4 uppercase font-black text-xs tracking-[0.3em] hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            {paymentMethod === 'cash' ? (
                                                <>
                                                    <IconSquarePen className="w-4 h-4" />
                                                    Book & Pay Later
                                                </>
                                            ) : (
                                                <>
                                                    <IconCreditCard className="w-4 h-4" />
                                                    Confirm & Pay Now
                                                </>
                                            )}
                                            <span className="font-black">₹{holdData.pricing_preview.total}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="max-w-2xl text-center space-y-8 py-8">
                            <div className="w-32 h-32 mx-auto bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                                <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <span className="inline-block px-4 py-1 bg-green-500 text-white text-[10px] font-black uppercase tracking-widest mb-4">
                                    CONFIRMED
                                </span>
                                <h3 className="text-5xl font-['Oswald'] font-bold uppercase tracking-tighter mb-4">
                                    BOOKING CONFIRMED!
                                </h3>
                                <p className="text-xl text-neutral-600">
                                    Thank you, <strong>{userDetails?.fullName}</strong>!
                                </p>
                            </div>

                            <div className="bg-white border-2 border-neutral-200 p-6 text-left shadow-sm">
                                <div className="space-y-6">
                                    {/* Studio */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <IconBuildingOffice className="w-6 h-6 text-neutral-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1">Studio</p>
                                            <p className="font-bold text-lg">{studioName}</p>
                                        </div>
                                    </div>

                                    {/* Date & Time */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <IconCalendar className="w-6 h-6 text-neutral-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1">Date & Time</p>
                                            <p className="font-bold text-lg">
                                                {date ? new Date(date).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' }) : '-'}
                                            </p>
                                            <p className="text-neutral-600 mt-1">
                                                {selectedSlot ? formatTimeOnly(selectedSlot.start) : ''} - {selectedSlot ? formatTimeOnly(selectedSlot.end) : ''} ({duration} hours)
                                            </p>
                                        </div>
                                    </div>

                                    {/* Customer */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <IconUser className="w-6 h-6 text-neutral-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1">Contact Details</p>
                                            <p className="font-bold">{userDetails.fullName}</p>
                                            <p className="text-sm text-neutral-600">{userDetails.email}</p>
                                            <p className="text-sm text-neutral-600">{userDetails.phone}</p>
                                            {userDetails.company && (
                                                <p className="text-sm text-neutral-500">{userDetails.company}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Amount */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <IconCreditCard className="w-6 h-6 text-neutral-600" />
                                        </div>
                                        <div className="flex-1 flex justify-between items-center">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1">Total Amount</p>
                                                <p className="text-2xl font-black">₹{holdData?.pricing_preview.total.toLocaleString('en-IN')}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1">Payment Method</p>
                                                <p className="font-bold">{paymentMethod === 'card' ? 'Card / UPI' : paymentMethod === 'upi' ? 'UPI' : 'Cash'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Confirmation Code */}
                                    <div className="flex items-start gap-4 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200">
                                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                                            <IconShieldCheck className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-green-600 mb-1">Confirmation Code</p>
                                            <p className="font-mono text-lg font-bold text-green-800 tracking-wider">
                                                {bookingId ? bookingId.substring(0, 8).toUpperCase() : holdData.lock_token.slice(-8).toUpperCase()}
                                            </p>
                                            <p className="text-xs text-green-600 mt-1">Keep this code for your records</p>
                                        </div>
                                    </div>

                                    {/* View Bookings Link */}
                                    <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-lg">
                                        <p className="text-blue-900 text-sm">
                                          <strong>View your bookings anytime:</strong>{' '}
                                          <a
                                            href="/my-bookings"
                                            className="font-bold underline hover:no-underline"
                                          >
                                            Click here to see all your reservations
                                          </a>
                                        </p>
                                    </div>

                                    {/* Email Status */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <IconEnvelope className="w-6 h-6 text-neutral-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1">Confirmation Email</p>
                                            {emailStatus === 'sent' ? (
                                                <p className="text-green-600 font-bold flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    Sent to {userDetails?.email}
                                                </p>
                                            ) : emailStatus === 'failed' ? (
                                                <p className="text-red-600 font-bold flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                    </svg>
                                                    Failed to send
                                                </p>
                                            ) : (
                                                <p className="text-amber-600 font-bold flex items-center gap-2">
                                                    Processing...
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {emailStatus === 'failed' && (
                                <div className="bg-amber-50 border-2 border-amber-300 p-6 text-left">
                                    <p className="text-amber-900 font-bold mb-2">⚠️ Email delivery failed</p>
                                    <p className="text-amber-800 text-sm">
                                        Your booking is confirmed! Please keep your confirmation code above. Contact us at <strong>{contact.email}</strong> or <strong>{contact.phone}</strong> if needed.
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={onClose}
                                className="px-12 py-5 bg-black text-white uppercase font-black text-xs tracking-[0.3em] hover:opacity-90 transition-all flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Done
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {step !== 'success' && (
                    <div className="px-8 py-4 border-t border-black/10 bg-neutral-100 flex-shrink-0">
                        <div className="flex justify-between items-center text-xs text-neutral-600">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                    <span>📍</span> {contact.address?.split(',')[0] || 'Mohali, Punjab'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <span>📞</span> {contact.phone}
                                </span>
                            </div>
                            <span className="font-bold uppercase tracking-widest">
                                Hold expires in 10 minutes
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingModal;
