// src/pages/Landing/hooks/useScrollAnimation.ts
import { useEffect, useState, useCallback } from 'react';

export const useScrollAnimation = (threshold: number = 50) => {
  const [scrollY, setScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    
    setScrollY(currentScrollY);
    setIsScrolled(currentScrollY > threshold);
    
    // Determine scroll direction
    if (currentScrollY > lastScrollY) {
      setScrollDirection('down');
    } else if (currentScrollY < lastScrollY) {
      setScrollDirection('up');
    }
    
    setLastScrollY(currentScrollY);
  }, [threshold, lastScrollY]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Get initial scroll position
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return { 
    scrollY, 
    isScrolled, 
    scrollDirection,
    isScrollingDown: scrollDirection === 'down',
    isScrollingUp: scrollDirection === 'up'
  };
};