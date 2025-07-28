// src/pages/Landing/hooks/useParallax.ts
import { useEffect, useState, useCallback } from 'react';

export const useParallax = (speed: number = 0.5, direction: 'vertical' | 'horizontal' = 'vertical') => {
  const [offset, setOffset] = useState(0);

  const handleScroll = useCallback(() => {
    const scrollTop = window.pageYOffset;
    const scrollLeft = window.pageXOffset;
    
    if (direction === 'vertical') {
      setOffset(scrollTop * speed);
    } else {
      setOffset(scrollLeft * speed);
    }
  }, [speed, direction]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Get initial offset
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return offset;
};

export const useParallaxTransform = (speed: number = 0.5) => {
  const offset = useParallax(speed);
  
  return {
    transform: `translateY(${offset}px)`,
    willChange: 'transform'
  };
};

export const useMouseParallax = (strength: number = 50) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    
    // Calculate normalized mouse position (-1 to 1)
    const x = (clientX / innerWidth) * 2 - 1;
    const y = (clientY / innerHeight) * 2 - 1;
    
    setMousePosition({ x: x * strength, y: y * strength });
  }, [strength]);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    setMousePosition({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (isHovering) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isHovering, handleMouseMove]);

  return {
    mousePosition,
    isHovering,
    handlers: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave
    },
    transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`
  };
};