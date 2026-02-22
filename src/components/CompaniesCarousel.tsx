import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Building2 } from "lucide-react";
import { Button } from "./ui/button";

interface CompanyLogo {
  id: string;
  image_url: string;
  name?: string;
}

interface CompaniesCarouselProps {
  logos: CompanyLogo[];
  displayCount?: 1 | 3 | 5;
  className?: string;
}

export function CompaniesCarousel({ logos, displayCount = 5, className = "" }: CompaniesCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHoveringLeft, setIsHoveringLeft] = useState(false);
  const [isHoveringRight, setIsHoveringRight] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-advance quando hover na seta direita
  useEffect(() => {
    if (isHoveringRight && logos.length > displayCount) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => Math.min(prev + 1, logos.length - displayCount));
      }, 500);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isHoveringRight, logos.length, displayCount]);

  // Auto-retroceder quando hover na seta esquerda
  useEffect(() => {
    if (isHoveringLeft && currentIndex > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      }, 500);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isHoveringLeft, currentIndex]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => {
      // Loop infinito: se está no início, vai para o final
      if (prev === 0) {
        return Math.max(0, logos.length - displayCount);
      }
      return prev - 1;
    });
  };

  const goToNext = () => {
    setCurrentIndex((prev) => {
      // Loop infinito: se está no final, volta para o início
      if (prev >= logos.length - displayCount) {
        return 0;
      }
      return prev + 1;
    });
  };

  // Garantir que temos pelo menos displayCount slots (preenchidos ou vazios)
  const displaySlots = Array.from({ length: displayCount }, (_, i) => {
    const logoIndex = currentIndex + i;
    return logoIndex < logos.length ? logos[logoIndex] : null;
  });

  // Com loop infinito, as setas sempre estão disponíveis quando há mais logos que slots
  const canGoPrevious = logos.length > displayCount;
  const canGoNext = logos.length > displayCount;

  // Se não há logos, mostrar skeletons vazios baseado no displayCount
  if (logos.length === 0) {
    return (
      <div className={`group ${className}`}>
        {/* Container flex com setas ao lado */}
        <div className="flex items-center gap-4">
          {/* Seta Esquerda (desabilitada) */}
          <div className="flex-shrink-0 opacity-30">
            <Button
              variant="secondary"
              size="icon"
              className="h-12 w-12 rounded-full bg-white/50 shadow-lg backdrop-blur-sm pointer-events-none"
              disabled
            >
              <ChevronLeft className="w-6 h-6 text-muted-foreground" />
            </Button>
          </div>

          {/* Grid de skeletons */}
          <div className="flex-1 overflow-hidden">
            <div className={`grid gap-6 ${
              displayCount === 1 ? 'grid-cols-1' :
              displayCount === 3 ? 'grid-cols-1 md:grid-cols-3' :
              'grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
            }`}>
              {Array.from({ length: displayCount }).map((_, index) => (
                <div 
                  key={index}
                  className="aspect-square bg-muted/20 rounded-xl border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center p-6 hover:border-muted-foreground/40"
                  style={{
                    transition: 'all 700ms ease-out',
                  }}
                >
                  <Building2 className="w-12 h-12 text-muted-foreground/30 mb-3" />
                  <p className="text-xs text-muted-foreground/50 text-center">
                    Slot {index + 1}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Seta Direita (desabilitada) */}
          <div className="flex-shrink-0 opacity-30">
            <Button
              variant="secondary"
              size="icon"
              className="h-12 w-12 rounded-full bg-white/50 shadow-lg backdrop-blur-sm pointer-events-none"
              disabled
            >
              <ChevronRight className="w-6 h-6 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`group ${className}`}>
      {/* Container flex com setas ao lado */}
      <div className="flex items-center gap-4">
        {/* Seta Esquerda */}
        <div className="flex-shrink-0">
          {logos.length > displayCount && canGoPrevious ? (
            <div
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              onMouseEnter={() => setIsHoveringLeft(true)}
              onMouseLeave={() => setIsHoveringLeft(false)}
            >
              <Button
                variant="secondary"
                size="icon"
                className="h-12 w-12 rounded-full bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm"
                onClick={goToPrevious}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
            </div>
          ) : (
            <div className="w-12 h-12" /> // Espaço reservado
          )}
        </div>

        {/* Grid de logos */}
        <div className="flex-1 overflow-hidden">
          <div 
            className={`grid gap-6 ${displayCount === 5 ? 'grid-cols-5' : displayCount === 3 ? 'grid-cols-3' : 'grid-cols-1'}`}
            style={{
              transition: 'opacity 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
          >
            {displaySlots.map((logo, index) => (
              <div
                key={logo?.id || `empty-${index}`}
                className={`relative aspect-square rounded-xl overflow-hidden ${
                  logo ? 'bg-card border border-border hover:shadow-lg' : 'bg-muted/30 border-2 border-dashed border-muted'
                }`}
                style={{
                  transition: 'all 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  animation: 'fadeInScale 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                }}
              >
                {logo ? (
                  <div className="w-full h-full p-4 flex items-center justify-center">
                    <img
                      src={logo.image_url}
                      alt={logo.name || `Logo ${currentIndex + index + 1}`}
                      className="max-w-full max-h-full object-contain transition-all duration-300"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                    <Building2 className="w-8 h-8" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Seta Direita */}
        <div className="flex-shrink-0">
          {logos.length > displayCount && canGoNext ? (
            <div
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              onMouseEnter={() => setIsHoveringRight(true)}
              onMouseLeave={() => setIsHoveringRight(false)}
            >
              <Button
                variant="secondary"
                size="icon"
                className="h-12 w-12 rounded-full bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm"
                onClick={goToNext}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </div>
          ) : (
            <div className="w-12 h-12" /> // Espaço reservado
          )}
        </div>
      </div>

      {/* Indicadores de posição */}
      {logos.length > displayCount && (
        <div className="flex justify-center mt-6 gap-1.5">
          {Array.from({ length: Math.ceil(logos.length / displayCount) }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index * displayCount)}
              className={`h-2 rounded-full transition-all duration-300 ${
                Math.floor(currentIndex / displayCount) === index
                  ? "bg-primary w-6"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50 w-2"
              }`}
              aria-label={`Ir para grupo ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
