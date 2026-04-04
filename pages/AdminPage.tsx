import React, { useState, useEffect } from 'react';
import FadeInSection from '../components/FadeInSection';
import { 
    LayoutDashboard, 
    Calendar, 
    Building, 
    MessageSquare, 
    Edit3, 
    LogOut,
    TrendingUp,
    Users,
    DollarSign,
    CheckCircle2,
    Clock,
    XCircle,
    ChevronRight,
    Settings,
    Eye,
    Plus,
    Trash2,
    Mail,
    Phone,
    MapPin,
    ArrowRightCircle,
    Save,
    Image,
    Type,
    RefreshCcw,
    ExternalLink,
    X
} from 'lucide-react';

// Types
interface Booking {
    id: string;
    studioId: string;
    studioName: string;
    date: string;
    startTime: string;
    duration: string;
    userDetails: {
        name: string;
        email: string;
        phone: string;
        company?: string;
    };
    totalAmount: number;
    status: 'confirmed' | 'pending' | 'cancelled';
    confirmationCode: string;
    bookedAt: string;
    paymentMethod: 'card' | 'upi' | 'cash';
}

interface Studio {
    id: string;
    name: string;
    tagline: string;
    description: string;
    price: string;
    priceNote: string;
    image: string;
    features: string[];
    isActive: boolean;
    order: number;
}

interface Enquiry {
    id: string;
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    status: 'new' | 'read' | 'replied' | 'closed';
    submittedAt: string;
}

interface HeroContent {
    tagline: string;
    headline: string;
    subtitle: string;
    tagline2: string;
    ctaPrimary: string;
    ctaSecondary: string;
    location: string;
}

interface AboutContent {
    philosophyTitle: string;
    philosophyText: string;
    description: string;
    quote: string;
    quoteAuthor: string;
    image: string;
}

interface ServiceContent {
    id: string;
    name: string;
    category: string;
    img: string;
    isActive: boolean;
}

interface ContactContent {
    email: string;
    phone: string;
    address: string;
    mapUrl: string;
    socialLinks: {
        instagram: string;
        twitter: string;
        linkedin: string;
    };
}

const AdminPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('Dashboard');
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [studios, setStudios] = useState<Studio[]>([]);
    const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    // Content State
    const [heroContent, setHeroContent] = useState<HeroContent>({
        tagline: 'Production House',
        headline: 'QALA STUDIOS',
        subtitle: 'Production House',
        tagline2: "Punjab's Premier Production Infrastructure",
        ctaPrimary: 'EXPLORE STUDIOS',
        ctaSecondary: 'OUR SERVICES',
        location: 'Mohali, Punjab'
    });

    const [aboutContent, setAboutContent] = useState<AboutContent>({
        philosophyTitle: 'Our Philosophy',
        philosophyText: 'Qala Studios is the crown jewel of visual production in Punjab. We combine world-class technology with industrial aesthetics to provide an unparalleled creative hub.',
        description: 'Located in the heart of Mohali\'s industrial belt, our facility serves the booming Punjabi cinematic and fashion industry with international standards. Every corner, every light, every surface has been curated for the perfect shot.',
        quote: "We don't just provide space; we provide the canvas for your vision to come alive.",
        quoteAuthor: '— The Qala Team',
        image: 'https://images.unsplash.com/photo-1598425237654-4fc758e50a93?auto=format&fit=crop&q=80&w=2000'
    });

    const [services, setServices] = useState<ServiceContent[]>([
        { id: '1', name: 'Equipment', category: 'Gear & Tech', img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1200', isActive: true },
        { id: '2', name: 'Digital', category: 'Workflow', img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1200', isActive: true },
        { id: '3', name: 'Locations', category: 'Scouting', img: 'https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb5b?auto=format&fit=crop&q=80&w=1200', isActive: true },
        { id: '4', name: 'Crew', category: 'Talent', img: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=1200', isActive: true },
        { id: '5', name: 'Creative', category: 'Direction', img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=1200', isActive: true },
        { id: '6', name: 'Talent', category: 'Artists', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1200', isActive: true },
    ]);

    const [contactContent, setContactContent] = useState<ContactContent>({
        email: 'info@qalastudios.com',
        phone: '+91 98765 43210',
        address: 'Phase 8, Industrial Area, Sector 72, Mohali, Punjab - 160071',
        mapUrl: 'https://maps.google.com',
        socialLinks: {
            instagram: 'https://instagram.com/qalastudios',
            twitter: 'https://twitter.com/qalastudios',
            linkedin: 'https://linkedin.com/company/qalastudios'
        }
    });

    const [showContentForm, setShowContentForm] = useState<string | null>(null);
    const [editingService, setEditingService] = useState<ServiceContent | null>(null);
    const [showStudioForm, setShowStudioForm] = useState(false);
    const [editingStudio, setEditingStudio] = useState<Studio | null>(null);

    // Load data from localStorage on mount
    useEffect(() => {
        const savedBookings = localStorage.getItem('admin_bookings');
        const savedStudios = localStorage.getItem('admin_studios');
        const savedEnquiries = localStorage.getItem('admin_enquiries');
        const savedHero = localStorage.getItem('admin_hero');
        const savedAbout = localStorage.getItem('admin_about');
        const savedServices = localStorage.getItem('admin_services');
        const savedContact = localStorage.getItem('admin_contact');

        if (savedBookings) {
            try { setBookings(JSON.parse(savedBookings)); } catch (e) { console.error('Failed to load bookings:', e); }
        } else { initializeSampleData(); }

        if (savedStudios) {
            try { setStudios(JSON.parse(savedStudios)); } catch (e) { console.error('Failed to load studios:', e); }
        } else { initializeStudios(); }

        if (savedEnquiries) {
            try { setEnquiries(JSON.parse(savedEnquiries)); } catch (e) { console.error('Failed to load enquiries:', e); }
        } else { initializeEnquiries(); }

        if (savedHero) {
            try { setHeroContent(JSON.parse(savedHero)); } catch (e) { console.error('Failed to load hero:', e); }
        }
        if (savedAbout) {
            try { setAboutContent(JSON.parse(savedAbout)); } catch (e) { console.error('Failed to load about:', e); }
        }
        if (savedServices) {
            try { setServices(JSON.parse(savedServices)); } catch (e) { console.error('Failed to load services:', e); }
        }
        if (savedContact) {
            try { setContactContent(JSON.parse(savedContact)); } catch (e) { console.error('Failed to load contact:', e); }
        }
    }, []);

    // Save to localStorage whenever data changes
    useEffect(() => { if (bookings.length > 0) localStorage.setItem('admin_bookings', JSON.stringify(bookings)); }, [bookings]);
    useEffect(() => { if (studios.length > 0) localStorage.setItem('admin_studios', JSON.stringify(studios)); }, [studios]);
    useEffect(() => { if (enquiries.length > 0) localStorage.setItem('admin_enquiries', JSON.stringify(enquiries)); }, [enquiries]);
    useEffect(() => { localStorage.setItem('admin_hero', JSON.stringify(heroContent)); }, [heroContent]);
    useEffect(() => { localStorage.setItem('admin_about', JSON.stringify(aboutContent)); }, [aboutContent]);
    useEffect(() => { localStorage.setItem('admin_services', JSON.stringify(services)); }, [services]);
    useEffect(() => { localStorage.setItem('admin_contact', JSON.stringify(contactContent)); }, [contactContent]);

    const initializeSampleData = () => {
        const sampleBookings: Booking[] = [
            {
                id: 'BK-ABC123',
                studioId: 'qala-studio',
                studioName: 'Simple Studio Sets',
                date: '2025-04-15',
                startTime: '14:00',
                duration: '2',
                userDetails: { name: 'Rahul Kumar', email: 'rahul@example.com', phone: '+91 98765 43210', company: 'Creative Agency' },
                totalAmount: 10000,
                status: 'confirmed',
                confirmationCode: 'CONF-XYZ789',
                bookedAt: new Date().toISOString(),
                paymentMethod: 'card'
            },
            {
                id: 'BK-DEF456',
                studioId: 'golden-hour',
                studioName: 'Golden Hour Studio',
                date: '2025-04-16',
                startTime: '16:00',
                duration: '4',
                userDetails: { name: 'Priya Sharma', email: 'priya@example.com', phone: '+91 87654 32109' },
                totalAmount: 32000,
                status: 'pending',
                confirmationCode: 'CONF-UVW123',
                bookedAt: new Date(Date.now() - 3600000).toISOString(),
                paymentMethod: 'upi'
            }
        ];
        setBookings(sampleBookings);
    };

    const initializeStudios = () => {
        const defaultStudios: Studio[] = [
            {
                id: 'qala-studio',
                name: 'Simple Studio Sets',
                tagline: 'Professional Production Space',
                description: 'A versatile 3,000 sq ft studio with modular sets, professional lighting rigs, and complete production support.',
                price: '₹5,000',
                priceNote: 'per hour',
                image: 'https://images.unsplash.com/photo-1598425237654-4fc758e50a93?auto=format&fit=crop&q=80&w=1200',
                features: ['3,000 sq ft space', 'Modular set pieces', '1200 Amps power', 'Hair & makeup stations', 'Client lounge'],
                isActive: true,
                order: 1
            },
            {
                id: 'golden-hour',
                name: 'Golden Hour Studio',
                tagline: 'Curated Lighting Environments',
                description: 'Experience the magic of golden hour, any hour. Our signature studio features programmable LED walls.',
                price: '₹8,000',
                priceNote: 'per hour',
                image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1200',
                features: ['LED light walls', 'Programmable scenes', 'Sunrise to sunset', 'Climate controlled', 'Premium finishes'],
                isActive: true,
                order: 2
            }
        ];
        setStudios(defaultStudios);
    };

    const initializeEnquiries = () => {
        const sampleEnquiries: Enquiry[] = [
            { id: 'ENQ-001', name: 'Richmond', email: 'richmond@example.com', phone: '+91 98765 43210', subject: 'Equipment Rental', message: 'Need professional camera equipment for a 3-day shoot.', status: 'new', submittedAt: new Date().toISOString() },
            { id: 'ENQ-002', name: 'Ruhter', email: 'ruhter@example.com', phone: '+91 87654 32109', subject: 'VFX Services', message: 'Looking for VFX magic for our upcoming commercial.', status: 'read', submittedAt: new Date(Date.now() - 86400000).toISOString() }
        ];
        setEnquiries(sampleEnquiries);
    };

    // Handlers
    const handleUpdateBookingStatus = (bookingId: string, newStatus: Booking['status']) => {
        setBookings(prev => prev.map(booking => booking.id === bookingId ? { ...booking, status: newStatus } : booking));
        if (selectedBooking?.id === bookingId) setSelectedBooking({ ...selectedBooking, status: newStatus });
    };

    const handleDeleteBooking = (bookingId: string) => {
        if (window.confirm('Are you sure you want to delete this booking?')) {
            setBookings(prev => prev.filter(b => b.id !== bookingId));
            if (selectedBooking?.id === bookingId) setSelectedBooking(null);
        }
    };

    const handleUpdateStudio = (studio: Studio) => {
        setStudios(prev => prev.map(s => s.id === studio.id ? studio : s));
        setEditingStudio(null); setShowStudioForm(false);
    };

    const handleAddStudio = (studio: Omit<Studio, 'id' | 'order'>) => {
        const newStudio: Studio = { ...studio, id: studio.name.toLowerCase().replace(/\s+/g, '-'), order: studios.length + 1 };
        setStudios(prev => [...prev, newStudio]); setShowStudioForm(false);
    };

    const handleDeleteStudio = (studioId: string) => {
        if (window.confirm('Are you sure you want to delete this studio? This will also affect existing bookings.')) {
            setStudios(prev => prev.filter(s => s.id !== studioId));
        }
    };

    const handleToggleStudioActive = (studioId: string) => {
        setStudios(prev => prev.map(s => s.id === studioId ? { ...s, isActive: !s.isActive } : s));
    };

    const handleUpdateEnquiryStatus = (enquiryId: string, newStatus: Enquiry['status']) => {
        setEnquiries(prev => prev.map(enq => enq.id === enquiryId ? { ...enq, status: newStatus } : enq));
    };

    const handleDeleteEnquiry = (enquiryId: string) => {
        if (window.confirm('Delete this enquiry?')) {
            setEnquiries(prev => prev.filter(e => e.id !== enquiryId));
        }
    };

    const handleSaveHero = () => { alert('Hero content saved!'); setShowContentForm(null); };
    const handleSaveAbout = () => { alert('About content saved!'); setShowContentForm(null); };
    const handleSaveContact = () => { alert('Contact content saved!'); setShowContentForm(null); };

    const handleAddService = (service: Omit<ServiceContent, 'id'>) => {
        const newService: ServiceContent = { ...service, id: Date.now().toString() };
        setServices(prev => [...prev, newService]); setEditingService(null); setShowContentForm(null);
    };

    const handleUpdateService = (service: ServiceContent) => {
        setServices(prev => prev.map(s => s.id === service.id ? service : s));
        setEditingService(null); setShowContentForm(null);
    };

    const handleDeleteService = (serviceId: string) => {
        if (window.confirm('Delete this service?')) {
            setServices(prev => prev.filter(s => s.id !== serviceId));
        }
    };

    const handleToggleServiceActive = (serviceId: string) => {
        setServices(prev => prev.map(s => s.id === serviceId ? { ...s, isActive: !s.isActive } : s));
    };

    // Stats
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const totalRevenue = bookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + b.totalAmount, 0);
    const activeStudios = studios.filter(s => s.isActive).length;
    const newEnquiries = enquiries.filter(e => e.status === 'new').length;

    const sidebarItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { name: 'Bookings', icon: <Calendar size={18} /> },
        { name: 'Studios', icon: <Building size={18} /> },
        { name: 'Enquiries', icon: <MessageSquare size={18} /> },
        { name: 'Content', icon: <Edit3 size={18} /> },
    ];

    const renderDashboard = () => (
        <div className="space-y-12">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, sub: 'confirmed bookings', icon: <DollarSign className="text-green-600" size={20} />, trend: '+12%' },
                    { label: 'Total Bookings', value: totalBookings, sub: `${confirmedBookings} confirmed`, icon: <Calendar className="text-black" size={20} />, trend: '+5' },
                    { label: 'New Enquiries', value: newEnquiries, sub: 'awaiting response', icon: <Mail className="text-blue-600" size={20} />, trend: 'NEW' },
                    { label: 'Active Studios', value: `${activeStudios}/${studios.length}`, sub: 'currently online', icon: <Building className="text-black" size={20} />, trend: 'LIVE' }
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white p-8 border-2 border-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all group relative overflow-hidden">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-neutral-50 border-2 border-black group-hover:bg-black group-hover:text-white transition-colors">
                                {stat.icon}
                            </div>
                            <span className="text-[10px] font-black font-mono px-2 py-1 bg-black text-white">{stat.trend}</span>
                        </div>
                        <p className="text-[10px] font-display font-bold uppercase tracking-[0.2em] text-neutral-500 mb-2">{stat.label}</p>
                        <p className="text-5xl font-['Oswald'] font-bold uppercase tracking-tighter leading-none">{stat.value}</p>
                        <p className="text-[10px] text-neutral-400 mt-4 uppercase tracking-[0.15em] font-bold">{stat.sub}</p>
                    </div>
                ))}
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white border-2 border-black p-10">
                        <div className="flex justify-between items-end mb-10 pb-6 border-b-2 border-black/5">
                            <div>
                                <h3 className="text-3xl font-['Oswald'] font-bold uppercase tracking-tight">Recent Bookings</h3>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 mt-2">Latest photoshoot reservations</p>
                            </div>
                            <button onClick={() => setActiveTab('Bookings')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:gap-4 transition-all">
                                View History <ChevronRight size={14} />
                            </button>
                        </div>
                        <div className="space-y-2">
                            {bookings.slice(0, 5).map(booking => (
                                <div key={booking.id} className="flex justify-between items-center p-4 border-2 border-transparent hover:border-black hover:bg-neutral-50 transition-all group cursor-pointer">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 bg-black flex flex-col items-center justify-center text-white shrink-0">
                                            <span className="text-[10px] font-black uppercase tracking-tighter leading-none">{new Date(booking.date).toLocaleDateString('en-IN', { month: 'short' })}</span>
                                            <span className="text-lg font-['Oswald'] font-bold leading-none">{new Date(booking.date).toLocaleDateString('en-IN', { day: '2-digit' })}</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm font-display uppercase tracking-wider group-hover:tracking-widest transition-all">{booking.studioName}</p>
                                            <p className="text-[10px] text-neutral-500 mt-1 uppercase font-bold tracking-tight">{booking.userDetails.name} • {booking.startTime} ({booking.duration}h)</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="text-sm font-['Oswald'] font-bold uppercase tracking-tighter">₹{booking.totalAmount.toLocaleString('en-IN')}</p>
                                        <span className={`px-3 py-1 text-[9px] font-black uppercase border-2 ${
                                            booking.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-600' :
                                            booking.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-600' :
                                            'bg-amber-50 text-amber-700 border-amber-600'
                                        }`}>{booking.status}</span>
                                    </div>
                                </div>
                            ))}
                            {bookings.length === 0 && <p className="text-neutral-400 text-sm py-12 text-center border-2 border-dashed border-black/10">No recent bookings recorded</p>}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-black text-white p-10 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] transition-all">
                        <h3 className="text-2xl font-['Oswald'] font-bold uppercase tracking-tight mb-6">Inbound Enquiries</h3>
                        <div className="space-y-6">
                            {enquiries.filter(e => e.status === 'new').slice(0, 3).map(enquiry => (
                                <div key={enquiry.id} className="pb-6 border-b border-white/20 last:border-0 last:pb-0 group cursor-pointer">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="font-bold text-xs font-display uppercase tracking-widest text-white/90">{enquiry.name}</p>
                                        <span className="flex items-center gap-1 text-[8px] font-black tracking-widest text-blue-400 uppercase"><Clock size={10} /> NEW</span>
                                    </div>
                                    <p className="text-[10px] text-white/50 uppercase tracking-wider mb-3 truncate">{enquiry.subject}</p>
                                    <button onClick={() => setActiveTab('Enquiries')} className="text-[9px] font-black uppercase tracking-widest text-white hover:underline transition-all">Respond →</button>
                                </div>
                            ))}
                            {enquiries.filter(e => e.status === 'new').length === 0 && <p className="text-white/30 text-xs py-4 text-center border border-white/10 italic">Workspace is quiet today</p>}
                        </div>
                        <button onClick={() => setActiveTab('Enquiries')} className="w-full mt-8 py-4 border-2 border-white text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all">
                            All Enquiries
                        </button>
                    </div>

                    <div className="bg-white border-2 border-black p-8">
                        <h4 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Settings size={14} /> Quick Settings
                        </h4>
                        <div className="space-y-3">
                            <button className="w-full text-left p-4 bg-neutral-50 hover:bg-black hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest border-2 border-black/5 hover:border-black">Manage Studios</button>
                            <button className="w-full text-left p-4 bg-neutral-50 hover:bg-black hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest border-2 border-black/5 hover:border-black">Site Content</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderBookings = () => (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-white border-2 border-black overflow-hidden">
                <div className="p-8 border-b-2 border-black flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div>
                        <h3 className="text-3xl font-['Oswald'] font-bold uppercase tracking-tight">All Bookings</h3>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 mt-2 font-bold">Comprehensive reservation log</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="relative">
                            <select className="appearance-none bg-neutral-50 border-2 border-black px-8 py-3 pr-12 text-[10px] font-black uppercase tracking-widest focus:outline-none hover:bg-black hover:text-white transition-all cursor-pointer">
                                <option>Filter: Status</option>
                                <option>Confirmed</option>
                                <option>Pending</option>
                                <option>Cancelled</option>
                            </select>
                            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" size={14} />
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-neutral-50 border-b-2 border-black">
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-black border-r-2 border-black/5">Ref ID</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-black border-r-2 border-black/5">Studio</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-black border-r-2 border-black/5">Client Details</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-black border-r-2 border-black/5">Schedule</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-black border-r-2 border-black/5">Amount</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-black border-r-2 border-black/5">Status</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-black">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-black/5">
                            {bookings.map((booking) => (
                                <tr key={booking.id} className="group hover:bg-neutral-50 transition-all">
                                    <td className="px-8 py-6 border-r-2 border-black/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-black group-hover:scale-150 transition-all" />
                                            <p className="text-xs font-black font-mono tracking-tighter text-black/40 group-hover:text-black transition-all">{booking.id}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 border-r-2 border-black/5">
                                        <p className="text-sm font-bold font-display uppercase tracking-wider">{booking.studioName}</p>
                                    </td>
                                    <td className="px-8 py-6 border-r-2 border-black/5">
                                        <p className="text-sm font-bold">{booking.userDetails.name}</p>
                                        <p className="text-[10px] text-neutral-400 font-mono mt-1">{booking.userDetails.email}</p>
                                    </td>
                                    <td className="px-8 py-6 border-r-2 border-black/5">
                                        <div className="flex items-center gap-4">
                                            <div className="shrink-0 text-center">
                                                <p className="text-[10px] font-black uppercase leading-none">{new Date(booking.date).toLocaleDateString('en-IN', { month: 'short' })}</p>
                                                <p className="text-lg font-['Oswald'] font-bold leading-none mt-1">{new Date(booking.date).toLocaleDateString('en-IN', { day: '2-digit' })}</p>
                                            </div>
                                            <div className="border-l-2 border-black/5 pl-4">
                                                <p className="text-[10px] font-bold uppercase tracking-tight">{booking.startTime}</p>
                                                <p className="text-[9px] text-neutral-400 font-bold uppercase mt-0.5">{booking.duration} HOURS</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 border-r-2 border-black/5">
                                        <p className="text-sm font-['Oswald'] font-bold">₹{booking.totalAmount.toLocaleString('en-IN')}</p>
                                        <p className="text-[9px] font-black uppercase text-neutral-400 mt-1">{booking.paymentMethod}</p>
                                    </td>
                                    <td className="px-8 py-6 border-r-2 border-black/5">
                                        <select
                                            value={booking.status}
                                            onChange={(e) => handleUpdateBookingStatus(booking.id, e.target.value as any)}
                                            className={`text-[9px] font-black uppercase px-4 py-2 border-2 cursor-pointer min-w-[120px] transition-all hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] focus:outline-none ${
                                                booking.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-600' :
                                                booking.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-600' :
                                                'bg-amber-50 text-amber-700 border-amber-600'
                                            }`}
                                        >
                                            <option value="confirmed">Confirmed</option>
                                            <option value="pending">Pending</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                    <td className="px-8 py-6">
                                        <button
                                            onClick={() => setSelectedBooking(booking)}
                                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:gap-3 transition-all"
                                        >
                                            DETAILS <ArrowRightCircle size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderStudios = () => (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-end gap-6 bg-white border-2 border-black p-10">
                <div>
                    <h3 className="text-4xl font-['Oswald'] font-bold uppercase tracking-tight">Studio Assets</h3>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 mt-4 font-bold">Manage modular production environments</p>
                </div>
                <button
                    onClick={() => { setEditingStudio(null); setShowStudioForm(true); }}
                    className="flex items-center gap-4 px-12 py-5 bg-black text-white text-[12px] font-black uppercase tracking-[0.25em] hover:bg-neutral-800 transition-all group"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform" /> Add New Asset
                </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {studios.map((studio) => (
                    <div key={studio.id} className={`bg-white border-2 ${studio.isActive ? 'border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'border-neutral-200 opacity-60'} hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all group overflow-hidden`}>
                        <div className="aspect-[21/9] bg-neutral-100 border-b-2 border-black overflow-hidden relative">
                            <img src={studio.image} alt={studio.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute top-4 left-4">
                                <span className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border-2 ${
                                    studio.isActive ? 'bg-white border-black text-black' : 'bg-neutral-500 border-neutral-600 text-white'
                                }`}>
                                    {studio.isActive ? 'ONLINE' : 'OFFLINE'}
                                </span>
                            </div>
                        </div>
                        <div className="p-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex-1">
                                    <h4 className="text-2xl font-bold font-display uppercase tracking-tighter">{studio.name}</h4>
                                    <p className="text-[9px] uppercase tracking-[0.3em] text-neutral-400 mt-2 font-bold">{studio.tagline}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-['Oswald'] font-bold leading-none">{studio.price}</p>
                                    <p className="text-[9px] uppercase tracking-widest text-neutral-400 mt-1 font-bold">{studio.priceNote}</p>
                                </div>
                            </div>
                            
                            <p className="text-sm text-neutral-600 mb-8 leading-relaxed line-clamp-2 font-display">{studio.description}</p>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => { setEditingStudio(studio); setShowStudioForm(true); }}
                                    className="flex items-center justify-center gap-2 py-4 border-2 border-black text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all"
                                >
                                    <Edit3 size={14} /> Configure
                                </button>
                                <button
                                    onClick={() => handleToggleStudioActive(studio.id)}
                                    className={`flex items-center justify-center gap-2 py-4 border-2 border-black text-[10px] font-black uppercase tracking-widest transition-all ${
                                        studio.isActive ? 'bg-neutral-50 hover:bg-neutral-100' : 'bg-black text-white hover:bg-neutral-800'
                                    }`}
                                >
                                    {studio.isActive ? <XCircle size={14} /> : <CheckCircle2 size={14} />} {studio.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                                <button
                                    onClick={() => handleDeleteStudio(studio.id)}
                                    className="col-span-2 flex items-center justify-center gap-2 py-3 text-red-600 hover:text-red-800 text-[10px] font-black uppercase tracking-widest transition-all mt-2"
                                >
                                    <Trash2 size={12} /> Permanent Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderEnquiries = () => (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-white border-2 border-black overflow-hidden">
                <div className="p-8 border-b-2 border-black flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div>
                        <h3 className="text-3xl font-['Oswald'] font-bold uppercase tracking-tight">Customer Enquiries</h3>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 mt-2 font-bold">Client communications and support</p>
                    </div>
                    <div className="flex gap-4">
                        <select className="bg-neutral-50 border-2 border-black px-8 py-3 text-[10px] font-black uppercase tracking-widest focus:outline-none">
                            <option>Status: All</option>
                            <option>New</option>
                            <option>Read</option>
                            <option>Replied</option>
                        </select>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-neutral-50 border-b-2 border-black">
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-black">Sender</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-black">Subject & Message</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-black">Status</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-black">Sent</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-black text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-black/5">
                            {enquiries.map((enquiry) => (
                                <tr key={enquiry.id} className="group hover:bg-neutral-50 transition-all">
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-bold font-display uppercase tracking-widest">{enquiry.name}</p>
                                        <div className="flex flex-col gap-1 mt-2">
                                            <p className="flex items-center gap-2 text-[10px] text-neutral-400 group-hover:text-black transition-all"><Mail size={10} /> {enquiry.email}</p>
                                            <p className="flex items-center gap-2 text-[10px] text-neutral-400 group-hover:text-black transition-all"><Phone size={10} /> {enquiry.phone}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 max-w-md">
                                        <p className="text-sm font-bold mb-1">{enquiry.subject}</p>
                                        <p className="text-xs text-neutral-500 line-clamp-2">{enquiry.message}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <select
                                            value={enquiry.status}
                                            onChange={(e) => handleUpdateEnquiryStatus(enquiry.id, e.target.value as any)}
                                            className={`text-[9px] font-black uppercase px-4 py-2 border-2 cursor-pointer transition-all ${
                                                enquiry.status === 'new' ? 'bg-blue-50 text-blue-700 border-blue-600 shadow-[4px_4px_0px_0px_rgba(37,99,235,0.1)]' :
                                                enquiry.status === 'read' ? 'bg-yellow-50 text-yellow-700 border-yellow-600' :
                                                enquiry.status === 'replied' ? 'bg-green-50 text-green-700 border-green-600' :
                                                'bg-neutral-50 text-neutral-600 border-neutral-400'
                                            }`}
                                        >
                                            <option value="new">NEW</option>
                                            <option value="read">READ</option>
                                            <option value="replied">REPLIED</option>
                                            <option value="closed">CLOSED</option>
                                        </select>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-[10px] font-black uppercase tracking-tighter">{new Date(enquiry.submittedAt).toLocaleDateString('en-IN', { month: 'short', day: '2-digit' })}</p>
                                        <p className="text-[10px] text-neutral-400 font-bold uppercase mt-1">{new Date(enquiry.submittedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button
                                            onClick={() => handleDeleteEnquiry(enquiry.id)}
                                            className="p-3 border-2 border-transparent hover:border-red-600 hover:bg-red-50 text-red-600 transition-all rounded-lg"
                                            title="Delete Enquiry"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderContent = () => (
        <div className="space-y-12 animate-fade-in">
            {/* Content Tabs Navigation */}
            <div className="bg-white border-2 border-black p-2 flex flex-wrap gap-2">
                {[
                    { id: 'Hero', icon: <Type size={16} />, label: 'Hero Header' },
                    { id: 'About', icon: <Image size={16} />, label: 'Story & Philo' },
                    { id: 'Services', icon: <Settings size={16} />, label: 'Capabilities' },
                    { id: 'Contact', icon: <Phone size={16} />, label: 'Contact Info' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setShowContentForm(showContentForm === tab.id ? null : tab.id)}
                        className={`flex-1 min-w-[200px] flex items-center justify-center gap-3 px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-2 ${
                            showContentForm === tab.id
                                ? 'bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]'
                                : 'bg-transparent text-neutral-400 border-transparent hover:border-black hover:text-black'
                        }`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Editors */}
            <div className="space-y-8">
                {showContentForm === 'Hero' && (
                    <div className="bg-white border-2 border-black p-12 animate-fade-in">
                        <div className="flex items-center gap-3 mb-10 pb-6 border-b-2 border-black/5">
                            <div className="p-3 bg-black text-white"><Type size={20} /></div>
                            <h3 className="text-3xl font-['Oswald'] font-bold uppercase tracking-tight text-black">Hero Configuration</h3>
                        </div>
                        <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                            {[
                                { key: 'tagline', label: 'Primary Label', type: 'text' },
                                { key: 'headline', label: 'Main Headline', type: 'text' },
                                { key: 'subtitle', label: 'Sub-Header', type: 'text' },
                                { key: 'location', label: 'Studio Location', type: 'text' },
                                { key: 'ctaPrimary', label: 'Action 1 (Primary)', type: 'text' },
                                { key: 'ctaSecondary', label: 'Action 2 (Secondary)', type: 'text' },
                                { key: 'tagline2', label: 'Section Summary', type: 'text', fullWidth: true },
                            ].map((field) => (
                                <div key={field.key} className={field.fullWidth ? 'md:col-span-2' : ''}>
                                    <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-3">{field.label}</label>
                                    <input
                                        type={field.type}
                                        value={(heroContent as any)[field.key]}
                                        onChange={(e) => setHeroContent({ ...heroContent, [field.key]: e.target.value })}
                                        className="w-full bg-neutral-50 border-2 border-black/10 px-6 py-4 font-display text-sm focus:border-black focus:bg-white focus:outline-none transition-all placeholder:text-neutral-300"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-6 mt-12 pt-10 border-t-2 border-black/5">
                            <button onClick={handleSaveHero} className="flex-1 py-5 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-neutral-800 transition-all flex items-center justify-center gap-3">
                                <Save size={16} /> Deploy Changes
                            </button>
                            <button onClick={() => setShowContentForm(null)} className="px-10 py-5 border-2 border-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-neutral-50 transition-all">
                                Discard
                            </button>
                        </div>
                    </div>
                )}

                {showContentForm === 'About' && (
                    <div className="bg-white border-2 border-black p-12 animate-fade-in">
                        <div className="flex items-center gap-3 mb-10 pb-6 border-b-2 border-black/5">
                            <div className="p-3 bg-black text-white"><Image size={20} /></div>
                            <h3 className="text-3xl font-['Oswald'] font-bold uppercase tracking-tight text-black">Studio Philosophy</h3>
                        </div>
                        <div className="space-y-10">
                            <div className="grid md:grid-cols-2 gap-12">
                                <div className="space-y-8">
                                    <div>
                                        <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-3">Narrative Title</label>
                                        <input type="text" value={aboutContent.philosophyTitle} onChange={(e) => setAboutContent({ ...aboutContent, philosophyTitle: e.target.value })} className="w-full bg-neutral-50 border-2 border-black/10 px-6 py-4 font-display text-sm focus:border-black focus:bg-white focus:outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-3">Core Content</label>
                                        <textarea value={aboutContent.philosophyText} onChange={(e) => setAboutContent({ ...aboutContent, philosophyText: e.target.value })} className="w-full bg-neutral-50 border-2 border-black/10 px-6 py-4 font-display text-sm focus:border-black focus:bg-white focus:outline-none transition-all h-40 resize-none" />
                                    </div>
                                </div>
                                <div className="space-y-8">
                                    <div>
                                        <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-3">Featured Portrait URL</label>
                                        <div className="flex gap-4">
                                            <input type="url" value={aboutContent.image} onChange={(e) => setAboutContent({ ...aboutContent, image: e.target.value })} className="flex-1 bg-neutral-50 border-2 border-black/10 px-6 py-4 font-mono text-[10px] focus:border-black focus:bg-white focus:outline-none transition-all" />
                                            <div className="w-16 h-14 bg-neutral-100 border-2 border-black shrink-0 overflow-hidden">
                                                <img src={aboutContent.image} className="w-full h-full object-cover" />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-3">Extended Bio</label>
                                        <textarea value={aboutContent.description} onChange={(e) => setAboutContent({ ...aboutContent, description: e.target.value })} className="w-full bg-neutral-50 border-2 border-black/10 px-6 py-4 font-display text-sm focus:border-black focus:bg-white focus:outline-none transition-all h-40 resize-none" />
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 bg-neutral-50 border-2 border-dashed border-black/10">
                                <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-6">Quote Component</label>
                                <div className="grid md:grid-cols-3 gap-8">
                                    <div className="md:col-span-2">
                                        <textarea value={aboutContent.quote} onChange={(e) => setAboutContent({ ...aboutContent, quote: e.target.value })} className="w-full bg-white border-2 border-black/10 px-6 py-4 font-serif italic text-lg focus:border-black focus:outline-none transition-all h-24 resize-none" placeholder="Enter quote text..." />
                                    </div>
                                    <div>
                                        <input type="text" value={aboutContent.quoteAuthor} onChange={(e) => setAboutContent({ ...aboutContent, quoteAuthor: e.target.value })} className="w-full bg-white border-2 border-black/10 px-6 py-4 font-display font-bold uppercase tracking-widest text-[10px] focus:border-black focus:outline-none transition-all" placeholder="Author name" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-6 mt-12 pt-10 border-t-2 border-black/5">
                            <button onClick={handleSaveAbout} className="flex-1 py-5 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-neutral-800 transition-all flex items-center justify-center gap-3">
                                <Save size={16} /> Update Studio Story
                            </button>
                            <button onClick={() => setShowContentForm(null)} className="px-10 py-5 border-2 border-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-neutral-50 transition-all">
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {showContentForm === 'Services' && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="flex justify-between items-center bg-white border-2 border-black p-10">
                            <div>
                                <h3 className="text-3xl font-['Oswald'] font-bold uppercase tracking-tight">Capability Matrix</h3>
                                <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 mt-3 font-bold">Catalogue of available production services</p>
                            </div>
                            <button
                                onClick={() => { setEditingService(null); setShowContentForm('Services'); }}
                                className="px-10 py-5 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-neutral-800 transition-all"
                            >
                                + Define New Capability
                            </button>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {services.map((service) => (
                                <div key={service.id} className={`bg-white border-2 ${service.isActive ? 'border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'border-neutral-200 opacity-60'} group hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all overflow-hidden`}>
                                    <div className="aspect-video bg-neutral-100 border-b-2 border-black overflow-hidden relative">
                                        <img src={service.img} alt={service.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute top-3 right-3">
                                            <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest border-2 ${service.isActive ? 'bg-white border-black' : 'bg-neutral-400 border-neutral-500 text-white'}`}>
                                                {service.isActive ? 'ACTIVE' : 'IDLE'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h4 className="font-bold font-display uppercase tracking-wider text-sm">{service.name}</h4>
                                                <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-400 mt-1 font-bold">{service.category}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button onClick={() => { setEditingService(service); setShowContentForm('Services'); }} className="py-3 text-[9px] font-black uppercase tracking-widest bg-neutral-50 border-2 border-black/10 hover:border-black transition-all flex items-center justify-center gap-2">
                                                <Edit3 size={12} /> Edit
                                            </button>
                                            <button onClick={() => handleDeleteService(service.id)} className="py-3 text-[9px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 transition-all border-2 border-transparent hover:border-red-600">
                                                Delete
                                            </button>
                                            <button onClick={() => handleToggleServiceActive(service.id)} className={`col-span-2 py-3 text-[9px] font-black uppercase tracking-widest border-2 transition-all ${service.isActive ? 'border-black/10 hover:border-black' : 'bg-black text-white border-black'}`}>
                                                {service.isActive ? 'Suspend Service' : 'Resume Service'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {editingService && (
                            <div className="bg-white border-2 border-black p-10 mt-12 animate-fade-in relative">
                                <button onClick={() => setEditingService(null)} className="absolute top-6 right-6 text-2xl hover:rotate-90 transition-transform">&times;</button>
                                <div className="flex items-center gap-3 mb-10 pb-6 border-b-2 border-black/5">
                                    <h3 className="text-2xl font-['Oswald'] font-bold uppercase tracking-tight">Edit Capability</h3>
                                </div>
                                <ServiceForm
                                    service={editingService}
                                    onSubmit={handleUpdateService}
                                    onCancel={() => setEditingService(null)}
                                />
                            </div>
                        )}
                    </div>
                )}

                {showContentForm === 'Contact' && (
                    <div className="bg-white border-2 border-black p-12 animate-fade-in">
                        <div className="flex items-center gap-3 mb-10 pb-6 border-b-2 border-black/5">
                            <div className="p-3 bg-black text-white"><Phone size={20} /></div>
                            <h3 className="text-3xl font-['Oswald'] font-bold uppercase tracking-tight text-black">Global Access</h3>
                        </div>
                        <div className="grid md:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <div>
                                    <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-3">Enquiry Channel (Email)</label>
                                    <div className="flex items-center gap-4 bg-neutral-50 border-2 border-black/10 px-6 py-4 focus-within:border-black focus-within:bg-white transition-all">
                                        <Mail size={16} className="text-neutral-400" />
                                        <input type="email" value={contactContent.email} onChange={(e) => setContactContent({ ...contactContent, email: e.target.value })} className="flex-1 bg-transparent font-mono text-[11px] focus:outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-3">Direct Hotline</label>
                                    <div className="flex items-center gap-4 bg-neutral-50 border-2 border-black/10 px-6 py-4 focus-within:border-black focus-within:bg-white transition-all">
                                        <Phone size={16} className="text-neutral-400" />
                                        <input type="tel" value={contactContent.phone} onChange={(e) => setContactContent({ ...contactContent, phone: e.target.value })} className="flex-1 bg-transparent font-mono text-[11px] focus:outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-3">Physical HQ</label>
                                    <div className="flex gap-4">
                                        <div className="p-4 bg-neutral-100 border-2 border-black shrink-0"><MapPin size={24} /></div>
                                        <textarea value={contactContent.address} onChange={(e) => setContactContent({ ...contactContent, address: e.target.value })} className="w-full bg-neutral-50 border-2 border-black/10 px-6 py-4 font-display text-xs focus:border-black focus:bg-white focus:outline-none transition-all h-28 resize-none" />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-8">
                                <div>
                                    <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-3">Map Infrastructure (URL)</label>
                                    <input type="url" value={contactContent.mapUrl} onChange={(e) => setContactContent({ ...contactContent, mapUrl: e.target.value })} className="w-full bg-neutral-50 border-2 border-black/10 px-6 py-4 font-mono text-[10px] focus:border-black focus:bg-white focus:outline-none transition-all" />
                                </div>
                                <div className="p-8 bg-neutral-50 border-2 border-dashed border-black/10">
                                    <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-6">Social Integration</label>
                                    <div className="space-y-4">
                                        {['instagram', 'twitter', 'linkedin'].map((platform) => (
                                            <div key={platform} className="flex items-center gap-4 bg-white border-2 border-black/10 px-6 py-3 focus-within:border-black transition-all">
                                                <span className="text-[10px] font-black uppercase tracking-widest w-24 border-r border-black/10">{platform}</span>
                                                <input 
                                                    type="url" 
                                                    value={(contactContent.socialLinks as any)[platform]} 
                                                    onChange={(e) => setContactContent({ ...contactContent, socialLinks: { ...contactContent.socialLinks, [platform]: e.target.value } })} 
                                                    className="flex-1 font-mono text-[10px] focus:outline-none bg-transparent"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-6 mt-12 pt-10 border-t-2 border-black/5">
                            <button onClick={handleSaveContact} className="flex-1 py-5 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-neutral-800 transition-all flex items-center justify-center gap-3">
                                <Save size={16} /> Sync Contact Matrix
                            </button>
                            <button onClick={() => setShowContentForm(null)} className="px-10 py-5 border-2 border-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-neutral-50 transition-all">
                                Revert
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-white text-black font-sans">
            {/* Sidebar */}
            <aside className="w-full md:w-72 bg-white border-r-2 border-black flex-shrink-0 hidden md:flex flex-col fixed h-screen z-40">
                <div className="p-10 border-b-2 border-black">
                    <div className="mb-14">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-2 bg-black" />
                            <h2 className="text-4xl font-['Oswald'] font-bold uppercase tracking-tighter leading-none">ADMIN</h2>
                        </div>
                        <p className="text-[9px] uppercase tracking-[0.4em] text-neutral-400 font-black">Control Terminal v2.0</p>
                    </div>

                    <nav className="space-y-1">
                        {sidebarItems.map((item) => (
                            <button
                                key={item.name}
                                onClick={() => setActiveTab(item.name)}
                                className={`w-full flex items-center gap-4 px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative group overflow-hidden ${
                                    activeTab === item.name
                                        ? 'bg-black text-white'
                                        : 'text-neutral-400 hover:text-black'
                                }`}
                            >
                                {activeTab === item.name && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white" />
                                )}
                                <span className={`${activeTab === item.name ? 'text-white' : 'text-neutral-300 group-hover:text-black transition-colors'}`}>
                                    {item.icon}
                                </span>
                                {item.name}
                                {activeTab !== item.name && (
                                    <div className="absolute right-[-100%] group-hover:right-4 transition-all duration-300 opacity-0 group-hover:opacity-100">
                                        <ChevronRight size={14} />
                                    </div>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-8 border-t-2 border-black bg-neutral-50/50">
                    <div className="flex items-center gap-4 group cursor-pointer">
                        <div className="w-12 h-12 border-2 border-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                            <span className="font-['Oswald'] font-black text-xl">A</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.1em]">Administrator</p>
                            <p className="text-[9px] text-neutral-400 font-mono mt-1">SECURE ACCESS</p>
                        </div>
                        <LogOut size={16} className="text-neutral-400 hover:text-red-600 cursor-pointer" />
                    </div>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-black/5 p-4 flex justify-between items-center">
                <h2 className="text-xl font-['Oswald'] font-bold uppercase tracking-tight">ADMIN</h2>
                <button onClick={() => {/* mobile menu toggle */}} className="p-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 md:ml-72 bg-neutral-50/30">
                <FadeInSection>
                    {/* Editorial Header */}
                    <header className="bg-white border-b-2 border-black p-12 md:p-20">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12">
                            <div className="max-w-4xl">
                                <span className="inline-block px-4 py-2 bg-black text-white text-[10px] font-black uppercase tracking-[0.4em] mb-8">System Phase 04</span>
                                <h1 className="text-6xl md:text-9xl font-['Oswald'] font-bold uppercase tracking-tighter leading-[0.8] mb-8">
                                    {activeTab}
                                </h1>
                                <p className="text-lg md:text-xl text-neutral-600 leading-relaxed font-display max-w-2xl">
                                    {activeTab === 'Dashboard' && 'Unified operational overview. Reality captured, metrics processed, and studio intelligence synthesized in real-time.'}
                                    {activeTab === 'Bookings' && 'Modular reservation management. Orchestrate studio throughput and streamline customer production lifecycles.'}
                                    {activeTab === 'Studios' && 'Asset configuration terminal. Maintain structural integrity and commercial availability across all studio environments.'}
                                    {activeTab === 'Enquiries' && 'Client communication matrix. Process inbound logistics and facilitate collaborative production planning.'}
                                    {activeTab === 'Content' && 'Narrative framework management. Control the digital footprint and editorial direction of the Qala brand.'}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-4 pt-8 lg:pt-0">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="flex items-center gap-3 px-8 py-5 border-2 border-black text-[11px] font-black uppercase tracking-[0.2em] hover:bg-neutral-50 transition-all active:scale-95"
                                >
                                    <RefreshCcw size={14} /> System Refresh
                                </button>
                                {activeTab !== 'Dashboard' && (
                                    <button
                                        onClick={() => window.open('/', '_blank')}
                                        className="flex items-center gap-3 px-8 py-5 bg-black text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all active:scale-95 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)]"
                                    >
                                        <ExternalLink size={14} /> Live View
                                    </button>
                                )}
                            </div>
                        </div>
                    </header>

                    <div className="p-8 md:p-12 lg:p-20 max-w-[1600px] mx-auto">

                    {activeTab === 'Dashboard' && renderDashboard()}
                    {activeTab === 'Bookings' && renderBookings()}
                    {activeTab === 'Studios' && renderStudios()}
                    {activeTab === 'Enquiries' && renderEnquiries()}
                    {activeTab === 'Content' && renderContent()}
                    </div>
                </FadeInSection>
            </main>

            {/* Booking Detail Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setSelectedBooking(null)}>
                    <div className="bg-white w-full max-w-5xl border-2 border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] animate-scale-up" onClick={e => e.stopPropagation()}>
                        <div className="flex border-b-2 border-black">
                            <div className="flex-1 p-8 md:p-12">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-2 bg-black" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">Transaction Registry</span>
                                </div>
                                <h2 className="text-4xl md:text-6xl font-black font-['Oswald'] uppercase tracking-tight leading-none mb-2">{selectedBooking.id}</h2>
                                <p className="text-[11px] font-mono text-neutral-400 tracking-widest">{selectedBooking.confirmationCode}</p>
                            </div>
                            <button onClick={() => setSelectedBooking(null)} className="w-24 md:w-32 border-l-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition-all text-2xl font-light">
                                <X size={32} />
                            </button>
                        </div>

                        <div className="grid md:grid-cols-2">
                            <div className="p-8 md:p-12 border-b-2 md:border-b-0 md:border-r-2 border-black space-y-12">
                                <div>
                                    <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-4">Environment</label>
                                    <p className="text-3xl font-black font-display uppercase tracking-tighter">{selectedBooking.studioName}</p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-4">Date</label>
                                        <p className="text-lg font-bold uppercase tracking-tight">{new Date(selectedBooking.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-4">Duration</label>
                                        <p className="text-lg font-bold uppercase tracking-tight">{selectedBooking.startTime} <span className="text-neutral-400 text-sm">/</span> {selectedBooking.duration}Hrs</p>
                                    </div>
                                </div>

                                <div className="bg-neutral-50 border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)]">
                                    <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-6">Client Identity</label>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center border-b border-black/5 pb-4">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Name</span>
                                            <span className="text-sm font-black uppercase">{selectedBooking.userDetails.name}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-black/5 pb-4">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Contact</span>
                                            <span className="text-sm font-mono">{selectedBooking.userDetails.email}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Company</span>
                                            <span className="text-sm font-black uppercase tracking-tight text-right">{selectedBooking.userDetails.company || 'Private Entity'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 md:p-12 bg-neutral-50 space-y-12">
                                <div>
                                    <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-4">Financial Payload</label>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold font-['Oswald']">₹</span>
                                        <p className="text-6xl font-black font-['Oswald'] tracking-tighter leading-none">{selectedBooking.totalAmount.toLocaleString('en-IN')}</p>
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 mt-4">Method: {selectedBooking.paymentMethod}</p>
                                </div>

                                <div>
                                    <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-6">Execution Status</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['confirmed', 'pending', 'cancelled'].map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => {
                                                    handleUpdateBookingStatus(selectedBooking.id, status as any);
                                                    setSelectedBooking({ ...selectedBooking, status: status as any });
                                                }}
                                                className={`py-5 text-[10px] font-black uppercase tracking-[0.25em] border-2 transition-all ${
                                                    selectedBooking.status === status
                                                        ? 'bg-black text-white border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)]'
                                                        : 'bg-white text-neutral-400 border-black/5 hover:border-black hover:text-black'
                                                } ${status === 'cancelled' ? 'col-span-2 mt-2' : ''}`}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-8">
                                    <button
                                        onClick={() => handleDeleteBooking(selectedBooking.id)}
                                        className="flex-1 py-5 border-2 border-red-600 text-red-600 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all"
                                    >
                                        Void Transaction
                                    </button>
                                    <button
                                        onClick={() => setSelectedBooking(null)}
                                        className="flex-1 py-5 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all"
                                    >
                                        Commit & Exit
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Studio Form Modal */}
            {showStudioForm && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setShowStudioForm(false)}>
                    <div className="bg-white w-full max-w-4xl border-2 border-black shadow-[30px_30px_0px_0px_rgba(0,0,0,1)] animate-scale-up max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex border-b-2 border-black sticky top-0 bg-white z-10">
                            <div className="flex-1 p-8 md:p-12">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-2 bg-black" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">Asset Configuration</span>
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black font-['Oswald'] uppercase tracking-tight leading-none">
                                    {editingStudio ? 'Modify Studio' : 'Register New Asset'}
                                </h2>
                            </div>
                            <button onClick={() => setShowStudioForm(false)} className="w-24 border-l-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition-all">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-8 md:p-12">
                            <StudioForm
                                studio={editingStudio}
                                onSubmit={editingStudio ? handleUpdateStudio : handleAddStudio}
                                onCancel={() => setShowStudioForm(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Studio Form Component
const StudioForm: React.FC<{
    studio: Studio | null;
    onSubmit: (studio: any) => void;
    onCancel: () => void;
}> = ({ studio, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: studio?.name || '',
        tagline: studio?.tagline || '',
        description: studio?.description || '',
        price: studio?.price || '₹',
        priceNote: studio?.priceNote || 'per hour',
        image: studio?.image || '',
        features: studio?.features || [],
        isActive: studio?.isActive ?? true
    });
    const [newFeature, setNewFeature] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            features: formData.features.filter(f => f.trim() !== '')
        });
    };

    const addFeature = () => {
        if (newFeature.trim() && formData.features.length < 10) {
            setFormData({
                ...formData,
                features: [...formData.features, newFeature.trim()]
            });
            setNewFeature('');
        }
    };

    const removeFeature = (index: number) => {
        setFormData({
            ...formData,
            features: formData.features.filter((_, i) => i !== index)
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-12">
            <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-8">
                    <div>
                        <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-3">Asset Designation</label>
                        <input
                            type="text"
                            placeholder="e.g. Studio 01 - The Vault"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-neutral-50 border-2 border-black/10 px-8 py-5 text-sm font-display font-bold uppercase tracking-wider focus:border-black focus:bg-white focus:outline-none transition-all"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-3">Narrative Snippet</label>
                        <input
                            type="text"
                            placeholder="e.g. Cinematic High-End Virtual Production"
                            value={formData.tagline}
                            onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                            className="w-full bg-neutral-50 border-2 border-black/10 px-8 py-5 text-sm font-display focus:border-black focus:bg-white focus:outline-none transition-all"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-3">Structural Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-neutral-50 border-2 border-black/10 px-8 py-5 text-sm font-display focus:border-black focus:bg-white focus:outline-none transition-all h-48 resize-none"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-3">Commercial Rate</label>
                            <input
                                type="text"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="w-full bg-neutral-50 border-2 border-black/10 px-8 py-5 font-['Oswald'] font-bold text-xl focus:border-black focus:bg-white focus:outline-none transition-all"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-3">Rate Modifier</label>
                            <input
                                type="text"
                                value={formData.priceNote}
                                onChange={(e) => setFormData({ ...formData, priceNote: e.target.value })}
                                className="w-full bg-neutral-50 border-2 border-black/10 px-8 py-5 text-sm font-display font-bold uppercase tracking-widest focus:border-black focus:bg-white focus:outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-3">Visual Asset URL</label>
                        <div className="flex gap-4">
                            <input
                                type="url"
                                value={formData.image}
                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                className="flex-1 bg-neutral-50 border-2 border-black/10 px-8 py-5 font-mono text-[11px] focus:border-black focus:bg-white focus:outline-none transition-all"
                                placeholder="https://cdn.qala.media/assets/studio-01.jpg"
                            />
                            {formData.image && (
                                <div className="w-20 h-16 border-2 border-black bg-neutral-100 overflow-hidden shrink-0">
                                    <img src={formData.image} className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-3">System Capabilities (max 10)</label>
                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={newFeature}
                                onChange={(e) => setNewFeature(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                className="flex-1 bg-neutral-50 border-2 border-black/10 px-6 py-4 text-sm font-display focus:border-black focus:bg-white focus:outline-none transition-all"
                                placeholder="e.g. 8K LED Wall"
                            />
                            <button
                                type="button"
                                onClick={addFeature}
                                disabled={formData.features.length >= 10}
                                className="px-8 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 disabled:opacity-30 transition-all"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.features.map((feature, idx) => (
                                <span
                                    key={idx}
                                    className="px-4 py-2 bg-white border-2 border-black text-[10px] font-black uppercase tracking-wider flex items-center gap-3 transition-all hover:bg-neutral-50"
                                >
                                    {feature}
                                    <button
                                        type="button"
                                        onClick={() => removeFeature(idx)}
                                        className="text-neutral-400 hover:text-red-600 transition-colors"
                                    >
                                        <XCircle size={14} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-12 border-t-2 border-black/5">
                <div className="flex items-center gap-4">
                    <button 
                        type="button"
                        onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                        className={`w-14 h-8 border-2 border-black transition-all relative ${formData.isActive ? 'bg-black' : 'bg-neutral-200'}`}
                    >
                        <div className={`absolute top-1 bottom-1 w-4 border-2 border-black transition-all ${formData.isActive ? 'right-1 bg-white' : 'left-1 bg-white'}`} />
                    </button>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em]">{formData.isActive ? 'Operational / Active' : 'System Offline / Maintenance'}</label>
                </div>
                
                <div className="flex gap-4 w-full md:w-auto">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 md:px-12 py-5 border-2 border-black text-[11px] font-black uppercase tracking-[0.2em] hover:bg-neutral-50 transition-all"
                    >
                        Abort
                    </button>
                    <button
                        type="submit"
                        className="flex-1 md:px-12 py-5 bg-black text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)]"
                    >
                        {studio ? 'Sync Asset Data' : 'Initialize Asset'}
                    </button>
                </div>
            </div>
        </form>
    );
};

// Service Form Component
// Service Form Component
const ServiceForm: React.FC<{
    service: ServiceContent | null;
    onSubmit: (service: Omit<ServiceContent, 'id'>) => void;
    onCancel: () => void;
}> = ({ service, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: service?.name || '',
        category: service?.category || '',
        img: service?.img || '',
        isActive: service?.isActive ?? true
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                    <div>
                        <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-3">Service Designation</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-neutral-50 border-2 border-black/10 px-8 py-5 text-sm font-display font-bold uppercase tracking-widest focus:border-black focus:bg-white focus:outline-none transition-all"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-3">Service Logic / Category</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full bg-neutral-50 border-2 border-black/10 px-8 py-5 text-sm font-display font-bold uppercase tracking-widest focus:border-black focus:bg-white focus:outline-none transition-all appearance-none"
                            required
                        >
                            <option value="">Select Domain</option>
                            <option value="Production">Production</option>
                            <option value="Post-Production">Post-Production</option>
                            <option value="Visual Effects">Visual Effects</option>
                            <option value="Virtual Production">Virtual Production</option>
                            <option value="Hospitality">Hospitality</option>
                            <option value="Events">Events</option>
                        </select>
                    </div>
                </div>
                <div className="space-y-6">
                    <div>
                        <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-3">Cover Asset Storage / URL</label>
                        <input
                            type="url"
                            value={formData.img}
                            onChange={(e) => setFormData({ ...formData, img: e.target.value })}
                            className="w-full bg-neutral-50 border-2 border-black/10 px-8 py-5 font-mono text-[11px] focus:border-black focus:bg-white focus:outline-none transition-all"
                            required
                        />
                    </div>
                    <div className="p-8 bg-neutral-50 border-2 border-black/5 flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">System Visibility</label>
                        <button 
                            type="button"
                            onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                            className={`w-14 h-8 border-2 border-black transition-all relative ${formData.isActive ? 'bg-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]' : 'bg-neutral-200'}`}
                        >
                            <div className={`absolute top-1 bottom-1 w-4 border-2 border-black transition-all ${formData.isActive ? 'right-1 bg-white' : 'left-1 bg-white'}`} />
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex gap-4 pt-12 border-t-2 border-black/5">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 py-5 border-2 border-black text-[11px] font-black uppercase tracking-[0.2em] hover:bg-neutral-50 transition-all active:scale-95"
                >
                    Discard Changes
                </button>
                <button
                    type="submit"
                    className="flex-1 py-5 bg-black text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all active:scale-95 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]"
                >
                    {service ? 'Sync Vector Data' : 'Deploy Module'}
                </button>
            </div>
        </form>
    );
};

export default AdminPage;
