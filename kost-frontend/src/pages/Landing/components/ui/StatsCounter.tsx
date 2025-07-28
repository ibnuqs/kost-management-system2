// src/pages/Landing/components/ui/StatsCounter.tsx - FIXED
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useIntersectionObserver } from '../../hooks';

interface StatItem {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}

interface StatsCounterProps {
  stats: StatItem[];
  className?: string;
}

const AnimatedNumber: React.FC<{
  value: number;
  duration: number;
  prefix?: string;
  suffix?: string;
  shouldStart: boolean;
}> = ({ value, duration, prefix = '', suffix = '', shouldStart }) => {
  const [currentValue, setCurrentValue] = useState(0);
  const animationRef = useRef<number>();
  const hasStartedRef = useRef(false);

  const animate = useCallback((startTime: number) => {
    return (timestamp: number) => {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function for smoother animation
      const easeOutQuad = 1 - (1 - progress) * (1 - progress);
      const currentNumber = Math.floor(easeOutQuad * value);
      
      setCurrentValue(currentNumber);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate(startTime));
      }
    };
  }, [value, duration]);

  useEffect(() => {
    // Fix: Only start animation once when shouldStart becomes true
    if (shouldStart && !hasStartedRef.current) {
      hasStartedRef.current = true;
      setCurrentValue(0); // Reset to 0 before starting
      
      const startAnimation = (timestamp: number) => {
        animationRef.current = requestAnimationFrame(animate(timestamp));
      };
      
      animationRef.current = requestAnimationFrame(startAnimation);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [shouldStart, animate]); // Fix: Stable dependencies

  // Fix: Reset when component unmounts or shouldStart becomes false
  useEffect(() => {
    if (!shouldStart) {
      hasStartedRef.current = false;
      setCurrentValue(0);
    }
  }, [shouldStart]);

  return (
    <span>
      {prefix}{currentValue.toLocaleString('id-ID')}{suffix}
    </span>
  );
};

export const StatsCounter: React.FC<StatsCounterProps> = ({
  stats,
  className = ''
}) => {
  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.3,
    triggerOnce: true
  });

  return (
    <div
      ref={targetRef}
      className={`grid grid-cols-2 md:grid-cols-4 gap-6 ${className}`}
    >
      {stats.map((stat, index) => (
        <div
          key={`${stat.label}-${index}`} // Fix: Stable key
          className="text-center"
          style={{
            animationDelay: `${index * 0.1}s`
          }}
        >
          <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
            <AnimatedNumber
              value={stat.value}
              duration={stat.duration || 2000}
              prefix={stat.prefix}
              suffix={stat.suffix}
              shouldStart={isIntersecting}
            />
          </div>
          <p className="text-gray-600 text-sm font-medium">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
};

export default StatsCounter;