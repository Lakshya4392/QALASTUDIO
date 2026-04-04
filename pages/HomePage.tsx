import React from 'react';
import SEO from '../components/SEO';
import Hero from '../components/Hero';
import About from '../components/About';
import ServiceGrid from '../components/ServiceGrid';
import VirtualProduction from '../components/VirtualProduction';
import Hospitality from '../components/Hospitality';
import EventSpaces from '../components/EventSpaces';
import RecentProductions from '../components/RecentProductions';

const HomePage: React.FC = () => {
  return (
    <>
      <SEO
        title="Visionary Creative Production Studio"
        description="Qala Studios - State-of-the-art production facility offering premium studio spaces, cutting-edge technology, and expert support for photography, videography, and creative projects in Mumbai."
        ogImage="/hero_editorial.png"
        ogType="website"
      />
      <Hero onNavigate={(page: string) => {
        const path = page === 'home' ? '/' : `/${page}`;
        window.location.pathname = path;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }} />
      <About />
      <ServiceGrid />
      <VirtualProduction />
      <Hospitality />
      <EventSpaces />
      <RecentProductions onNavigate={(page: string) => {
        const path = page === 'home' ? '/' : `/${page}`;
        window.location.pathname = path;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }} />
    </>
  );
};

export default HomePage;
