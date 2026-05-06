import React, { useEffect } from 'react';

interface GoogleAnalyticsProps {
  trackingId?: string;
}

const GoogleAnalytics: React.FC<GoogleAnalyticsProps> = ({ trackingId }) => {
  useEffect(() => {
    const GA_ID = trackingId || import.meta.env.VITE_GA_TRACKING_ID;

    if (!GA_ID) {
      // No tracking ID configured, skip
      return;
    }

    // Inject GA4 script
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize GA
    const initGA = () => {
      // @ts-ignore
      window.dataLayer = window.dataLayer || [];
      // @ts-ignore
      function gtag(...args: any[]) {
        // @ts-ignore
        window.dataLayer.push(args);
      }
      // @ts-ignore
      gtag('js', new Date());
      // @ts-ignore
      gtag('config', GA_ID, {
        page_path: window.location.pathname,
      });
    };

    script.onload = initGA;

    // Cleanup on unmount (optional)
    return () => {
      // Note: GA doesn't support cleanup easily; we'll leave script in place
    };
  }, [trackingId]);

  return null;
};

export default GoogleAnalytics;
