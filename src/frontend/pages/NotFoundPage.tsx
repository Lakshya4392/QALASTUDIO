import React from 'react';
import { Link } from 'react-router-dom';
import FadeInSection from '../components/FadeInSection';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F4F4F4] flex items-center justify-center px-6">
      <div className="max-w-4xl mx-auto text-center">
        <FadeInSection>
          {/* 404 Number */}
          <h1 className="text-[12rem] md:text-[20rem] font-['Oswald'] font-bold leading-none uppercase text-black/10 mb-[-40px]">
            404
          </h1>

          {/* Main Message */}
          <h2 className="text-4xl md:text-6xl font-['Oswald'] font-bold uppercase tracking-tighter mb-6">
            Page Not Found
          </h2>

          <p className="text-xl text-neutral-600 max-w-2xl mx-auto mb-12 leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
            Let's get you back on track.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/"
              className="px-8 py-4 bg-black text-white uppercase font-bold text-sm tracking-wider hover:bg-neutral-800 transition-all rounded-lg"
            >
              Go to Homepage
            </Link>

            <button
              onClick={() => window.history.back()}
              className="px-8 py-4 border-2 border-black text-black uppercase font-bold text-sm tracking-wider hover:bg-black hover:text-white transition-all rounded-lg"
            >
              Go Back
            </button>
          </div>

          {/* Decorative Element */}
          <div className="mt-16">
            <p className="text-neutral-400 text-sm uppercase tracking-widest">
              Qala Studios
            </p>
          </div>
        </FadeInSection>
      </div>
    </div>
  );
};

export default NotFoundPage;
