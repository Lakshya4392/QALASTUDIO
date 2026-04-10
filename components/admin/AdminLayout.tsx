import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import {
  LayoutDashboard,
  Calendar,
  Building2,
  MessageSquare,
  Settings,
  Image,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Sun
} from 'lucide-react';

const AdminLayout: React.FC = () => {
  const { logout, user } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'DASHBOARD' },
    { path: '/admin/bookings', icon: Calendar, label: 'BOOKINGS' },
    { path: '/admin/studios', icon: Building2, label: 'STUDIOS' },
    { path: '/admin/golden-hour', icon: Sun, label: 'GOLDEN HOUR' },
    { path: '/admin/projects', icon: Image, label: 'PROJECTS' },
    { path: '/admin/enquiries', icon: MessageSquare, label: 'ENQUIRIES' },
    { path: '/admin/content', icon: Image, label: 'CONTENT' },
    { path: '/admin/settings', icon: Settings, label: 'SETTINGS' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-white font-sans flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-24'} bg-white border-r-2 border-black transition-all duration-300 flex flex-col fixed h-full z-50`}>
        {/* Logo */}
        <div className="p-6 border-b-2 border-black">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <h1 className="text-2xl font-black uppercase tracking-tight text-black">QALA<span className="text-black/40">.admin</span></h1>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-3 hover:bg-black hover:text-white rounded-full transition-all duration-300 border-2 border-black"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 border-2 ${
                  active
                    ? 'bg-black text-white border-black shadow-lg'
                    : 'bg-white text-black/60 border-transparent hover:border-black hover:text-black'
                }`}
              >
                <Icon className="w-6 h-6 flex-shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="font-black text-xs uppercase tracking-widest">{item.label}</span>
                    {active && <ChevronRight className="w-5 h-5 ml-auto" />}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="p-4 border-t-2 border-black space-y-2">
          {user && sidebarOpen && (
            <div className="px-5 py-4 rounded-2xl bg-black/5 border-2 border-black">
              <p className="text-xs font-black uppercase tracking-widest text-black truncate">{user.username}</p>
              <p className="text-xs text-black/40 truncate uppercase tracking-wide">{user.role || 'ADMIN'}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 border-2 ${
              sidebarOpen
                ? 'bg-white text-black/60 border-transparent hover:border-black hover:text-black'
                : 'bg-transparent border-transparent hover:bg-black hover:text-white'
            }`}
          >
            <LogOut className="w-6 h-6 flex-shrink-0" />
            {sidebarOpen && <span className="font-black text-xs uppercase tracking-widest">LOGOUT</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        <main className={`${sidebarOpen ? 'ml-72' : 'ml-24'} transition-all duration-300 p-6 md:p-8 lg:p-10`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
