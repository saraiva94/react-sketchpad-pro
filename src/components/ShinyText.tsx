import { useEffect, useRef, useState } from 'react';
import { useInView } from '@/hooks/useInView';

interface ShinyTextProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function ShinyText({ children, className = '', delay = 0 }: ShinyTextProps) {
  const { ref, isInView } = useInView<HTMLDivElement>({ threshold: 0.3 });
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (isInView && !hasAnimated) {
      const timer = setTimeout(() => {
        setHasAnimated(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [isInView, hasAnimated, delay]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      {children}
      {hasAnimated && (
        <div 
          className="absolute inset-0 pointer-events-none animate-shiny-sweep"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 60%, transparent 100%)',
            transform: 'translateX(-100%)',
          }}
        />
      )}
    </div>
  );
}
