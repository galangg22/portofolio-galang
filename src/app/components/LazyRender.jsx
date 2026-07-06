'use client';

import { useState, useEffect, useRef } from 'react';

export default function LazyRender({ children, height = '200px' }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' } // Load 300px before it enters the screen
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className="w-full h-full" style={{ minHeight: !isVisible ? height : 'auto' }}>
      {isVisible ? (
        children
      ) : (
        <div className="w-full h-full animate-pulse bg-white/5 flex items-center justify-center rounded-lg border border-white/10">
          <i className="ri-file-list-3-line text-4xl text-white/20"></i>
        </div>
      )}
    </div>
  );
}
