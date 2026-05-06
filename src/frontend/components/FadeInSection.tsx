
import React, { useEffect, useRef, useState } from 'react';

interface FadeInSectionProps {
  children: React.ReactNode;
  className?: string;
  // Supporting click events for interactive components wrapping this animation
  onClick?: () => void;
}

const FadeInSection: React.FC<FadeInSectionProps> = ({ children, className = "", onClick }) => {
  const [isVisible, setVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisible(true);
        }
      });
    }, { threshold: 0.1 });

    const current = domRef.current;
    if (current) observer.observe(current);
    
    return () => {
      if (current) observer.unobserve(current);
    };
  }, []);

  // Pass the onClick handler to the wrapper div
  return (
    <div
      className={`fade-in ${isVisible ? 'visible' : ''} ${className}`}
      ref={domRef}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default FadeInSection;
