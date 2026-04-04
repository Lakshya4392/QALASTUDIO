import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserAuth } from '../contexts/UserAuthContext';
import { User, LogOut } from 'lucide-react';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout, isLoading } = useUserAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  const currentPath = location.pathname;
  const isHomepage = currentPath === '/' || currentPath === '';
  const navClass = isScrolled || !isHomepage
    ? 'bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm text-black'
    : 'bg-transparent text-white';

  const navItems: { label: string; path: string }[] = [
    { label: 'Home', path: '/' },
    { label: 'Studios', path: '/studios' },
    { label: 'Golden Hour', path: '/golden-hour' },
    { label: 'Projects', path: '/projects' },
    { label: 'Services', path: '/services' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
    { label: 'My Bookings', path: '/my-bookings' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 px-6 md:px-10 py-5 flex justify-between items-center ${navClass}`}>
        {/* Logo */}
        <div
          className={`font-black text-xl md:text-2xl tracking-tighter cursor-pointer hover:opacity-80 transition-opacity ${
            isActive('/projects') ? "font-['Oswald'] uppercase text-3xl" : "font-display"
          } ${isScrolled || !isHomepage ? 'text-black' : 'text-white'}`}
          onClick={() => navigate('/')}
        >
          QALA STUDIOS
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-10 text-xs font-bold uppercase tracking-wider">
          {navItems.map((item) => (
            <a
              key={item.path}
              href={item.path}
              onClick={(e) => { e.preventDefault(); navigate(item.path); }}
              className={`hover:opacity-60 transition-all relative group ${isActive(item.path) ? 'opacity-100' : 'opacity-70'}`}
            >
              <span className="relative z-10">{item.label}</span>
              <span className={`absolute -bottom-2 left-0 w-0 h-0.5 bg-current group-hover:w-full transition-all duration-300 ${isActive(item.path) ? 'w-full' : ''}`} />
            </a>
          ))}
        </div>

        {/* CTA Button */}
        <div className="flex items-center gap-3">
          {/* User auth state */}
          {!isLoading && (
            isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => navigate('/profile')}
                  className={`flex items-center gap-2 px-4 py-2 text-[10px] uppercase font-bold tracking-widest transition-all duration-300 border ${
                    isScrolled || !isHomepage
                      ? 'border-black text-black hover:bg-black hover:text-white'
                      : 'border-white text-white hover:bg-white hover:text-black'
                  }`}
                >
                  <User className="w-3 h-3" />
                  {user?.fullName?.split(' ')[0] || 'Profile'}
                </button>
                <button
                  onClick={async () => { await logout(); navigate('/'); }}
                  className={`p-2 transition-all ${isScrolled || !isHomepage ? 'text-black hover:text-neutral-500' : 'text-white hover:text-white/60'}`}
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className={`hidden sm:block px-4 py-2 text-[10px] uppercase font-bold tracking-widest transition-all duration-300 border ${
                  isScrolled || !isHomepage
                    ? 'border-black text-black hover:bg-black hover:text-white'
                    : 'border-white text-white hover:bg-white hover:text-black'
                }`}
              >
                Sign In
              </button>
            )
          )}

          <button
            onClick={() => navigate('/book')}
            className={`hidden sm:block px-6 py-3 text-[10px] uppercase font-bold tracking-widest transition-all duration-300 ${
              isScrolled || !isHomepage
                ? 'bg-black text-white hover:bg-neutral-800'
                : 'bg-white text-black hover:bg-neutral-100'
            }`}
          >
            Book Now
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden z-50 p-2 focus:outline-none"
            aria-label="Toggle Menu"
          >
            <div className="w-6 h-5 relative flex flex-col justify-between overflow-hidden">
              <span className={`w-full h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-[9px]' : ''}`}></span>
              <span className={`w-full h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'opacity-0 translate-x-4' : ''}`}></span>
              <span className={`w-full h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-[9px]' : ''}`}></span>
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-[45] bg-white transition-all duration-500 md:hidden ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
          }`}
      >
        <div className="h-full flex flex-col justify-center items-center px-6">
          <div className="flex flex-col gap-8 text-center">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setIsMenuOpen(false); }}
                className={`text-4xl font-display font-black uppercase tracking-tight transition-all hover:text-gray-400 ${isActive(item.path) ? 'text-black' : 'text-gray-300'}`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => { navigate('/book'); setIsMenuOpen(false); }}
              className={`text-4xl font-display font-black uppercase tracking-tight transition-all hover:text-gray-400 ${isActive('/book') ? 'text-black' : 'text-gray-300'}`}
            >
              Book
            </button>
          </div>

          <div className="mt-16 w-full max-w-xs space-y-4">
            <button
              onClick={() => navigate('/admin/login')}
              className="w-full bg-gray-900 text-white py-3 text-xs font-bold uppercase tracking-[0.3em] hover:bg-gray-800 transition-all"
            >
              Admin Portal
            </button>
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => { navigate('/profile'); setIsMenuOpen(false); }}
                  className="w-full bg-white border-2 border-black text-black py-4 text-xs font-bold uppercase tracking-[0.3em] hover:bg-neutral-50 transition-all"
                >
                  My Profile
                </button>
                <button
                  onClick={async () => { await logout(); navigate('/'); setIsMenuOpen(false); }}
                  className="w-full bg-neutral-100 text-black py-4 text-xs font-bold uppercase tracking-[0.3em] hover:bg-neutral-200 transition-all"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => { navigate('/login'); setIsMenuOpen(false); }}
                className="w-full bg-white border-2 border-black text-black py-4 text-xs font-bold uppercase tracking-[0.3em] hover:bg-neutral-50 transition-all"
              >
                Sign In / Register
              </button>
            )}
            <button
              onClick={() => { navigate('/book'); setIsMenuOpen(false); }}
              className="w-full bg-black text-white py-5 text-xs font-bold uppercase tracking-[0.3em] hover:bg-neutral-800 transition-all"
            >
              Book Now
            </button>
            <div className="flex justify-center gap-8 pt-6">
              <a href="#" className="text-sm uppercase tracking-wider text-gray-500 hover:text-black">Instagram</a>
              <a href="#" className="text-sm uppercase tracking-wider text-gray-500 hover:text-black">X</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
