import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  Plus,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  MessageSquare,
  Film,
  Image,
  Activity,
  Sparkles,
  Target,
  Zap,
  Crown
} from 'lucide-react';
import { api } from '../../services/api';

interface RecentBooking {
  id: string;
  studioName: string;
  userDetails: { name: string; email: string };
  totalAmount: number;
  status: string;
  bookedAt: string;
}

interface RecentEnquiry {
  id: string;
  name: string;
  subject: string;
  status: string;
  submittedAt: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [recentEnquiries, setRecentEnquiries] = useState<RecentEnquiry[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    totalRevenue: 0
  });
  const [studioCount, setStudioCount] = useState({ active: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, bookingsRes, enquiriesRes, studiosRes] = await Promise.all([
          api.bookings.getStats(),
          api.bookings.getAll({ limit: 5 }),
          api.enquiries.getAll({ limit: 5 }),
          api.studios.getAll(),
        ]);

        setStats({
          total: statsRes.total || 0,
          confirmed: statsRes.confirmed || 0,
          pending: statsRes.pending || 0,
          cancelled: statsRes.cancelled || 0,
          totalRevenue: statsRes.totalRevenue || 0,
        });

        setRecentBookings(
          (bookingsRes.bookings || []).map((b: any) => ({
            id: b.id,
            studioName: b.studioName || 'Unknown',
            userDetails: { name: b.userDetails?.name || 'N/A', email: b.userDetails?.email || '' },
            totalAmount: b.totalAmount || 0,
            status: b.status || 'unknown',
            bookedAt: b.bookedAt || '',
          }))
        );

        setRecentEnquiries(
          (enquiriesRes.enquiries || []).map((e: any) => ({
            id: e.id,
            name: e.name || 'N/A',
            subject: e.subject || '',
            status: e.status || 'new',
            submittedAt: e.submitted_at || e.submittedAt || '',
          }))
        );

        const allStudios = Array.isArray(studiosRes) ? studiosRes : [];
        setStudioCount({
          active: allStudios.filter((s: any) => s.is_active).length,
          total: allStudios.length
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statCards = [
    {
      label: 'Revenue',
      value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`,
      icon: DollarSign,
      sub: `${stats.confirmed} confirmed`,
      trend: true
    },
    {
      label: 'Total Bookings',
      value: stats.total,
      icon: Calendar,
      sub: `${stats.pending} pending`,
      trend: false
    },
    {
      label: 'New Enquiries',
      value: recentEnquiries.filter(e => e.status === 'new').length,
      icon: Users,
      sub: 'unread',
      trend: false
    },
    {
      label: 'Active Studios',
      value: `${studioCount.active}/${studioCount.total}`,
      icon: Activity,
      sub: 'online',
      trend: false
    },
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'confirmed':
        return {
          bg: 'bg-gray-900 text-white border border-gray-900',
          text: 'text-white',
          icon: CheckCircle,
          label: 'CONFIRMED'
        };
      case 'pending':
      case 'pending_payment':
        return {
          bg: 'bg-white text-gray-900 border border-gray-300',
          text: 'text-gray-900',
          icon: Clock,
          label: 'PENDING'
        };
      case 'cancelled':
        return {
          bg: 'bg-gray-100 text-gray-600 border border-gray-300',
          text: 'text-gray-600',
          icon: XCircle,
          label: 'CANCELLED'
        };
      case 'new':
        return {
          bg: 'bg-gray-800 text-white border border-gray-800',
          text: 'text-white',
          icon: Sparkles,
          label: 'NEW'
        };
      case 'replied':
        return {
          bg: 'bg-gray-200 text-gray-800 border border-gray-300',
          text: 'text-gray-800',
          icon: CheckCircle,
          label: 'REPLIED'
        };
      default:
        return {
          bg: 'bg-white text-gray-600 border border-gray-300',
          text: 'text-gray-600',
          icon: Activity,
          label: status.toUpperCase()
        };
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">Loading</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="p-8 bg-white border-2 border-black rounded-3xl">
        <div className="flex items-start gap-4">
          <XCircle className="w-6 h-6 text-black flex-shrink-0" />
          <div>
            <p className="font-bold text-black text-sm uppercase tracking-wider">Error</p>
            <p className="text-black/70 text-xs mt-1">{error}</p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="space-y-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl md:text-6xl font-black leading-none uppercase tracking-tight text-black">
              Dashboard
            </h1>
            <p className="text-black/60 text-sm mt-4 max-w-md tracking-wide">
              Overview of your studio operations and recent activity
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 mb-1">Last Updated</p>
              <p className="text-sm font-bold uppercase tracking-wide text-black">
                {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="p-4 bg-white border-2 border-black rounded-full hover:bg-black hover:text-white transition-all duration-300"
            >
              <Sparkles className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, idx) => (
            <div
              key={idx}
              className="group relative bg-white border-2 border-black rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 overflow-hidden"
            >
              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-black -translate-y-1/2 translate-x-1/2 rounded-full opacity-5 group-hover:opacity-10 transition-opacity" />

              <div className="flex items-start justify-between mb-6">
                <div className="p-4 bg-black rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                {stat.trend && (
                  <div className="flex items-center gap-1 bg-black text-white text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-full">
                    <ArrowUpRight className="w-4 h-4" />
                    Live
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="text-4xl md:text-5xl font-black leading-none uppercase tracking-tight text-black">
                  {stat.value}
                </h3>
                <p className="text-sm font-bold uppercase tracking-widest text-black/60">{stat.label}</p>
                <p className="text-xs text-black/40 uppercase tracking-wide">{stat.sub}</p>
              </div>

              {/* Bottom border animation */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Bookings */}
          <div className="lg:col-span-2 bg-white border-2 border-black rounded-3xl p-8 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-black/10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-black rounded-2xl">
                  <Film className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-black">Recent Bookings</h2>
                  <p className="text-xs text-black/40 mt-1 uppercase tracking-wide">Latest reservations</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/admin/bookings')}
                className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black hover:bg-black hover:text-white px-6 py-3 border-2 border-black rounded-full transition-all duration-300"
              >
                <Eye className="w-4 h-4" />
                View All
              </button>
            </div>

            {recentBookings.length === 0 ? (
              <div className="py-20 px-12 text-center">
                <div className="w-24 h-24 bg-black/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-12 h-12 text-black/30" />
                </div>
                <p className="text-black/60 text-sm font-bold uppercase tracking-wider">No Bookings Yet</p>
                <p className="text-black/40 text-xs mt-2 uppercase tracking-wide">Start receiving reservations</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((b, idx) => {
                  const statusConfig = getStatusConfig(b.status);
                  return (
                    <div
                      key={b.id}
                      className="group flex items-start justify-between p-6 bg-black/5 hover:bg-white border-2 border-transparent hover:border-black rounded-2xl transition-all duration-300 cursor-pointer animate-fade-in"
                      style={{ animationDelay: `${idx * 100}ms` }}
                      onClick={() => navigate('/admin/bookings')}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 bg-black rounded-full" />
                          <p className="font-bold text-black text-lg uppercase tracking-tight truncate">{b.studioName}</p>
                        </div>
                        <p className="text-sm text-black/60 font-bold mb-2">{b.userDetails.name}</p>
                        <p className="text-xs text-black/40 flex items-center gap-2 uppercase tracking-wide">
                          <Clock className="w-3 h-3" />
                          {b.bookedAt ? new Date(b.bookedAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          }) : 'NO DATE'}
                        </p>
                      </div>
                      <div className="text-right ml-6 flex-shrink-0 flex flex-col items-end gap-3">
                        <p className="font-black text-2xl uppercase tracking-tight text-black">
                          ₹{b.totalAmount.toLocaleString('en-IN')}
                        </p>
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border ${statusConfig.bg} ${statusConfig.icon ? '' : 'text-black/60'}`}>
                          <statusConfig.icon className="w-4 h-4" />
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Enquiries */}
          <div className="bg-white border-2 border-black rounded-3xl p-8 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-black/10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-black rounded-2xl">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-black">Enquiries</h2>
                  <p className="text-xs text-black/40 mt-1 uppercase tracking-wide">Customer messages</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/admin/enquiries')}
                className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black hover:bg-black hover:text-white px-6 py-3 border-2 border-black rounded-full transition-all duration-300"
              >
                <Eye className="w-4 h-4" />
                All
              </button>
            </div>

            {recentEnquiries.length === 0 ? (
              <div className="py-20 px-12 text-center">
                <div className="w-24 h-24 bg-black/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Users className="w-12 h-12 text-black/30" />
                </div>
                <p className="text-black/60 text-sm font-bold uppercase tracking-wider">No Enquiries</p>
                <p className="text-black/40 text-xs mt-2 uppercase tracking-wide">Messages appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentEnquiries.map((e, idx) => {
                  const statusConfig = getStatusConfig(e.status);
                  return (
                    <div
                      key={e.id}
                      className="group p-6 bg-black/5 hover:bg-white border-2 border-transparent hover:border-black rounded-2xl transition-all duration-300 cursor-pointer animate-fade-in"
                      style={{ animationDelay: `${idx * 100}ms` }}
                      onClick={() => navigate('/admin/enquiries')}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="w-2 h-2 bg-black rounded-full flex-shrink-0" />
                          <p className="font-bold text-black text-sm uppercase truncate">{e.name}</p>
                        </div>
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border flex-shrink-0 ${statusConfig.bg}`}>
                          {statusConfig.icon && <statusConfig.icon className="w-3.5 h-3.5" />}
                          {statusConfig.label}
                        </span>
                      </div>
                      <p className="text-sm text-black/70 leading-relaxed mb-3 uppercase tracking-wide">{e.subject}</p>
                      <p className="text-xs text-black/40 flex items-center gap-2 uppercase tracking-wide">
                        <Clock className="w-3 h-3" />
                        {e.submittedAt ? new Date(e.submittedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short'
                        }) : 'NO DATE'}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border-2 border-black rounded-3xl p-8 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-black/10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-black rounded-2xl">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider text-black">Quick Actions</h2>
                <p className="text-xs text-black/40 mt-1 uppercase tracking-wide">Frequent tasks</p>
              </div>
            </div>
            <Plus className="w-6 h-6 text-black/40" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Add Studio', path: '/admin/studios', icon: Film, desc: 'Create new' },
              { label: 'Manage Projects', path: '/admin/projects', icon: Image, desc: 'Portfolio' },
              { label: 'Manage Bookings', path: '/admin/bookings', icon: Calendar, desc: 'View & edit' },
              { label: 'Reply Enquiries', path: '/admin/enquiries', icon: MessageSquare, desc: 'Respond' },
              { label: 'Edit Content', path: '/admin/content', icon: TrendingUp, desc: 'Update site' },
            ].map((action) => (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className="group flex flex-col items-center justify-center gap-4 p-8 bg-black/5 hover:bg-black hover:text-white border-2 border-black hover:border-black rounded-2xl transition-all duration-300"
              >
                <div className="p-5 bg-white group-hover:bg-white/10 border-2 border-black group-hover:border-white/20 rounded-xl transition-all duration-300">
                  <action.icon className="w-8 h-8 text-black group-hover:text-white" />
                </div>
                <div className="text-center">
                  <span className="block text-sm font-black uppercase tracking-wider mb-1">{action.label}</span>
                  <span className="text-xs text-black/40 group-hover:text-white/60 uppercase tracking-wide">{action.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* System Status Bar */}
        <div className="bg-black rounded-3xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest">System Operational</span>
              </div>
              <div className="hidden md:flex items-center gap-4 text-xs text-white/60 uppercase tracking-wide">
                <span>API: 45ms</span>
                <span>•</span>
                <span>Uptime: 99.9%</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/40 uppercase tracking-wider">All services running</p>
            </div>
          </div>
        </div>
      </div>
  );
};

export default AdminDashboard;
