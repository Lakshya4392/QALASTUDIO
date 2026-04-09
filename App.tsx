import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './services/auth-context';
import { ContentProvider } from './contexts/ContentContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AIAssistant from './components/AIAssistant';
import Hero from './components/Hero';
import About from './components/About';
import ServiceGrid from './components/ServiceGrid';
import VirtualProduction from './components/VirtualProduction';
import Hospitality from './components/Hospitality';
import EventSpaces from './components/EventSpaces';
import RecentProductions from './components/RecentProductions';
import Portfolio from './components/Portfolio';
import StudiosPage from './pages/StudiosPage';
import ServicesPage from './pages/ServicesPage';
import ContactPage from './pages/ContactPage';
import GoldenHourPage from './pages/GoldenHourPage';
import AboutPage from './pages/AboutPage';
import BookPage from './pages/BookPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboardPage from './pages/UserDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

// Type for all possible pages
type PageType =
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
  | 'admin';

const NavigationHandler: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageType>('home');

  const parseHash = (): PageType => {
    const raw = window.location.hash.replace(/^#\/?/, '');
    const page = (raw || 'home') as PageType;
    const allowed: PageType[] = [
      'home',
      'studios',
      'services',
      'contact',
      'golden-hour',
      'about',
      'portfolio',
      'book',
      'login',
      'register',
      'dashboard',
      'admin',
    ];
    return allowed.includes(page) ? page : 'home';
  };

  useEffect(() => {
    // Initialize from current hash + keep in sync for pages that set window.location.hash
    const sync = () => setCurrentPage(parseHash());
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigate = (page: PageType) => {
    setCurrentPage(page);
    window.location.hash = `#/${page === 'home' ? '' : page}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render appropriate page
  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage />;
      case 'register':
        return <RegisterPage />;
      case 'dashboard':
        return <UserDashboardPage />;
      case 'admin':
        return <AdminDashboardPage />;
      case 'home':
        return (
          <>
            <Hero onNavigate={navigate as any} />
            <About onNavigate={navigate} />
            <ServiceGrid />
            <VirtualProduction />
            <Hospitality />
            <EventSpaces />
            <RecentProductions />
          </>
        );
      case 'studios':
        return <StudiosPage />;
      case 'services':
        return <ServicesPage />;
      case 'golden-hour':
        return <GoldenHourPage />;
      case 'about':
        return <AboutPage />;
      case 'portfolio':
        return <Portfolio />;
      case 'book':
        return <BookPage />;
      case 'contact':
      default:
        return <ContactPage />;
    }
  };

  // Determine what to show in navbar based on auth state
  const navbarProps = {
    onNavigate: navigate,
    currentPage,
    user,
    logout,
  };

  return (
    <div className="relative min-h-screen">
      <Navbar {...navbarProps} />
      <main>{renderPage()}</main>
      {!['login', 'register'].includes(currentPage) && <Footer />}
      <AIAssistant />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ContentProvider>
        <NavigationHandler />
      </ContentProvider>
    </AuthProvider>
  );
};

export default App;
