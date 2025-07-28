// src/pages/Landing/hooks/useIntersectionObserver.ts - FIXED
import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverProps {
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
  root?: Element | null;
}

export const useIntersectionObserver = ({
  threshold = 0.1,
  rootMargin = '0px',
  triggerOnce = true,
  root = null
}: UseIntersectionObserverProps = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [intersectionRatio, setIntersectionRatio] = useState(0);
  // ✅ FIX: Use HTMLDivElement instead of HTMLElement for better type compatibility
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    // Don't create observer if already triggered and triggerOnce is true
    if (hasTriggered && triggerOnce) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isCurrentlyIntersecting = entry.isIntersecting;
        
        setIsIntersecting(isCurrentlyIntersecting);
        setIntersectionRatio(entry.intersectionRatio);
        
        if (isCurrentlyIntersecting && triggerOnce) {
          setHasTriggered(true);
        }
      },
      {
        threshold,
        rootMargin,
        root
      }
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [threshold, rootMargin, triggerOnce, hasTriggered, root]);

  return { 
    targetRef, 
    isIntersecting, 
    hasTriggered, 
    intersectionRatio 
  };
};