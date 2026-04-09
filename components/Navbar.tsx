import React, { useState, useEffect } from 'react';

interface NavbarProps {
  onNavigate: (
    page:
      | 'home'
      | 'studios'
      | 'services'
      | 'contact'
      | 'golden-hour'
      | 'about'
      | 'portfolio'
      | 'book'
      | 'login'
      | 'register'
      | 'dashboard'
      | 'admin'
  ) => void;
  currentPage: string;
  user?: any;
  logout?: () => Promise<void>;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage, user, logout }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
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

  const navClass =
    isScrolled || currentPage !== 'home'
      ? 'bg-white/90 backdrop-blur-md py-4 shadow-sm text-black'
      : 'bg-transparent text-white';

  const borderColor = isScrolled || currentPage !== 'home' ? 'border-black' : 'border-white';

  const handleMobileNav = (page: any) => {
    onNavigate(page);
    setIsMenuOpen(false);
  };

  const navItems: { label: string; id: any }[] = [
    { label: 'Home', id: 'home' },
    { label: 'Studios', id: 'studios' },
    { label: 'Golden Hour', id: 'golden-hour' },
    { label: 'Portfolio', id: 'portfolio' },
    { label: 'Services', id: 'services' },
    { label: 'About', id: 'about' },
    { label: 'Contact', id: 'contact' },
  ];

  const handleLogout = async () => {
    if (logout) {
      await logout();
    }
    onNavigate('home');
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 px-6 md:px-10 py-6 flex justify-between items-center ${navClass}`}
      >
        <div className="font-black text-2xl tracking-tighter cursor-pointer z-50" onClick={() => handleMobileNav('home')}>
          QALA STUDIOS
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 text-xs font-bold uppercase tracking-widest">
          {navItems
            .filter((item) => item.id !== 'home')
            .map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`hover:opacity-50 transition-opacity ${
                  currentPage === item.id ? 'border-b-2 border-current' : ''
                }`}
              >
                {item.label}
              </button>
            ))}
        </div>

        <div className="flex items-center gap-4">
          {!user ? (
            // Not logged in - show login/register
            <>
              <button
                onClick={() => onNavigate('book')}
                className={`hidden sm:block border px-4 py-2 text-[10px] uppercase font-bold tracking-widest transition-all ${borderColor} hover:invert`}
              >
                Book Now
              </button>
              <button
                onClick={() => onNavigate('login')}
                className="hidden md:block border px-4 py-2 text-[10px] uppercase font-bold tracking-widest transition-all border-black hover:bg-black hover:text-white"
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="hidden md:block bg-black text-white px-4 py-2 text-[10px] uppercase font-bold tracking-widest transition-all hover:bg-gray-800"
              >
                Sign Up
              </button>
            </>
          ) : (
            // Logged in - show user menu
            <>
              <div className="hidden md:flex items-center gap-4">
                <span className="text-sm">{user.full_name}</span>
                <span className="text-xs bg-black text-white px-2 py-1 rounded uppercase">
                  {user.role === 'STUDIO_OWNER' ? 'Owner' : user.role === 'ADMIN' ? 'Admin' : 'Customer'}
                </span>
              </div>

              {/* Role-specific menu */}
              {user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? (
                <button
                  onClick={() => onNavigate('admin')}
                  className={`hidden sm:block px-4 py-2 text-[10px] uppercase font-bold tracking-widest transition-all ${
                    currentPage === 'admin' ? 'bg-white text-black' : 'bg-black text-white hover:bg-gray-800'
                  }`}
                >
                  ⚡ Admin Panel
                </button>
              ) : (
                <button
                  onClick={() => onNavigate('dashboard')}
                  className={`hidden sm:block border px-4 py-2 text-[10px] uppercase font-bold tracking-widest transition-all ${
                    currentPage === 'dashboard' ? 'bg-black text-white' : 'border-black hover:bg-black hover:text-white'
                  }`}
                >
                  My Dashboard
                </button>
              )}

              <button
                onClick={handleLogout}
                className="hidden md:block text-sm border border-black px-3 py-1 rounded hover:bg-red-50 hover:text-red-600"
              >
                Logout
              </button>
            </>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden z-50 p-2 focus:outline-none"
            aria-label="Toggle Menu"
          >
            <div className="w-6 h-5 relative flex flex-col justify-between overflow-hidden">
              <span
                className={`w-full h-0.5 bg-current transition-all duration-300 ${
                  isMenuOpen ? 'rotate-45 translate-y-[9px]' : ''
                }`}
              ></span>
              <span
                className={`w-full h-0.5 bg-current transition-all duration-300 ${
                  isMenuOpen ? 'opacity-0 translate-x-4' : ''
                }`}
              ></span>
              <span
                className={`w-full h-0.5 bg-current transition-all duration-300 ${
                  isMenuOpen ? '-rotate-45 -translate-y-[9px]' : ''
                }`}
              ></span>
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-[45] bg-white transition-all duration-500 md:hidden ${
          isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
        }`}
      >
        <div className="h-full flex flex-col justify-center items-center px-10 pt-20">
          <div className="flex flex-col gap-6 text-center">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMobileNav(item.id)}
                className={`text-3xl font-black uppercase tracking-tighter transition-all hover:text-gray-400 ${
                  currentPage === item.id ? 'text-black' : 'text-gray-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-16 w-full max-w-xs space-y-4">
            {!user ? (
              <>
                <button
                  onClick={() => handleMobileNav('book')}
                  className="w-full bg-black text-white py-5 text-xs font-black uppercase tracking-[0.3em] hover:opacity-80 transition-all"
                >
                  Book Now
                </button>
                <button
                  onClick={() => handleMobileNav('login')}
                  className="w-full border-2 border-black py-4 text-xs font-black uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleMobileNav('register')}
                  className="w-full bg-gray-900 text-white py-4 text-xs font-black uppercase tracking-[0.3em] hover:bg-black transition-all"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                <div className="text-center py-2">
                  <p className="font-bold">{user.full_name}</p>
                  <p className="text-xs text-gray-500 uppercase">{user.role}</p>
                </div>
                {user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? (
                  <button
                    onClick={() => handleMobileNav('admin')}
                    className="w-full border-2 border-black py-4 text-xs font-black uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all"
                  >
                    Admin Panel
                  </button>
                ) : (
                  <button
                    onClick={() => handleMobileNav('dashboard')}
                    className="w-full border-2 border-black py-4 text-xs font-black uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all"
                  >
                    My Dashboard
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full border-2 border-red-500 text-red-500 py-4 text-xs font-black uppercase tracking-[0.3em] hover:bg-red-50 transition-all"
                >
                  Logout
                </button>
              </>
            )}
            <div className="flex justify-center gap-6 pt-6 opacity-30">
              <span className="text-[10px] font-bold tracking-widest uppercase">Instagram</span>
              <span className="text-[10px] font-bold tracking-widest uppercase">X</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
