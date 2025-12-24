import { useState, useEffect, useRef } from "react";
import { Briefcase, Users, Award, TrendingUp } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface StatItem {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon: React.ReactNode;
  color: string;
}

interface AnimatedStatsProps {
  stats: StatItem[];
}

function useCountUp(end: number, duration: number = 2000, startCounting: boolean = false) {
  const [count, setCount] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);
  
  useEffect(() => {
    if (!startCounting) return;
    
    // Phase 1: Random number shuffling (slot machine effect)
    setIsShuffling(true);
    const shuffleDuration = 800; // 800ms of random numbers
    const shuffleInterval = 50; // Change number every 50ms
    
    let shuffleTimer: NodeJS.Timeout;
    const maxShuffleValue = Math.max(end * 2, 999); // Random numbers up to 2x the target or 999
    
    const shuffle = () => {
      setCount(Math.floor(Math.random() * maxShuffleValue));
    };
    
    shuffleTimer = setInterval(shuffle, shuffleInterval);
    
    // Phase 2: After shuffle, animate to final value
    const transitionTimeout = setTimeout(() => {
      clearInterval(shuffleTimer);
      setIsShuffling(false);
      
      let startTime: number | null = null;
      let animationFrame: number;
      
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        setCount(Math.floor(easeOutQuart * end));
        
        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      };
      
      animationFrame = requestAnimationFrame(animate);
      
      return () => cancelAnimationFrame(animationFrame);
    }, shuffleDuration);
    
    return () => {
      clearInterval(shuffleTimer);
      clearTimeout(transitionTimeout);
    };
  }, [end, duration, startCounting]);
  
  return { count, isShuffling };
}

function StatCard({ stat, index, isVisible }: { stat: StatItem; index: number; isVisible: boolean }) {
  const { t } = useLanguage();
  const { count, isShuffling } = useCountUp(stat.value, 1500, isVisible);

  const resolvedLabel = (() => {
    switch (stat.label) {
      case "__t_home_registeredProjects__":
        return t.home.registeredProjects;
      case "__t_home_culturalCreators__":
        return t.home.culturalCreators;
      case "__t_home_approvedProjects__":
        return t.home.approvedProjects;
      case "__t_home_successRate__":
        return t.home.successRate;
      default:
        return stat.label;
    }
  })();

  return (
    <div
      className="relative group"
      style={{
        animationDelay: `${index * 150}ms`,
        animation: isVisible ? `fadeInUp 0.6s ease-out ${index * 150}ms forwards` : "none",
        opacity: isVisible ? undefined : 0,
      }}
    >
      <div className="text-center p-6 md:p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
        {/* Icon */}
        <div
          className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${stat.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}
        >
          {stat.icon}
        </div>

        {/* Number */}
        <div
          className={`text-4xl md:text-5xl font-bold text-foreground mb-2 tabular-nums transition-all duration-300 ${
            isShuffling ? "text-primary/70 blur-[1px]" : ""
          }`}
        >
          {stat.prefix}
          {count}
          {stat.suffix}
        </div>

        {/* Label */}
        <p className="text-muted-foreground font-medium">{resolvedLabel}</p>

        {/* Decorative line */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent group-hover:w-3/4 transition-all duration-500" />
      </div>
    </div>
  );
}

export function AnimatedStats({ stats }: AnimatedStatsProps) {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 lg:py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            {t.home.impactBadge}
          </span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-semibold text-foreground">
            {t.home.impactTitle} <span className="text-primary">{t.home.impactHighlight}</span>
          </h2>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} isVisible={isVisible} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Default stats configuration
export const defaultStats: StatItem[] = [
  {
    label: "__t_home_registeredProjects__",
    value: 150,
    suffix: "+",
    icon: <Briefcase className="w-8 h-8 text-white" />,
    color: "bg-gradient-to-br from-primary to-blue-600",
  },
  {
    label: "__t_home_culturalCreators__",
    value: 85,
    suffix: "+",
    icon: <Users className="w-8 h-8 text-white" />,
    color: "bg-gradient-to-br from-emerald-500 to-emerald-600",
  },
  {
    label: "__t_home_approvedProjects__",
    value: 42,
    icon: <Award className="w-8 h-8 text-white" />,
    color: "bg-gradient-to-br from-violet-500 to-violet-600",
  },
  {
    label: "__t_home_successRate__",
    value: 95,
    suffix: "%",
    icon: <TrendingUp className="w-8 h-8 text-white" />,
    color: "bg-gradient-to-br from-amber-500 to-orange-500",
  },
];
