import { useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface VideoItem {
  url: string;
  title?: string;
}

interface VideoCarouselProps {
  videos: VideoItem[];
  loading?: boolean;
}

export function VideoCarousel({ videos, loading = false }: VideoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Always show 5 slots for the carousel effect
  const totalSlots = 5;
  
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalSlots - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === totalSlots - 1 ? 0 : prev + 1));
  };

  // Get position relative to center (0 = center, negative = left, positive = right)
  const getPosition = (index: number): number => {
    const diff = index - currentIndex;
    // Handle wrap-around for circular carousel
    if (diff > totalSlots / 2) return diff - totalSlots;
    if (diff < -totalSlots / 2) return diff + totalSlots;
    return diff;
  };

  // Get styles based on position
  const getCardStyles = (position: number) => {
    const absPosition = Math.abs(position);
    
    // Only show cards within 2 positions of center
    if (absPosition > 2) {
      return {
        opacity: 0,
        transform: `translateX(${position * 100}%) scale(0.4)`,
        zIndex: 0,
        visibility: 'hidden' as const,
      };
    }

    // Scale hierarchy: center=1, first level=0.75, second level=0.55
    let scale: number;
    let translateX: number;
    let translateZ: number;
    
    if (position === 0) {
      scale = 1;
      translateX = 0;
      translateZ = 0;
    } else if (absPosition === 1) {
      // First level cards - medium size, more overlap with center
      scale = 0.75;
      // Position so that half of visible edge is outside center card
      translateX = position * 55;
      translateZ = -100;
    } else {
      // Second level cards - smallest
      scale = 0.55;
      translateX = position * 85;
      translateZ = -200;
    }
    
    const opacity = position === 0 ? 1 : absPosition === 1 ? 0.7 : 0.5;
    const zIndex = 10 - absPosition;

    return {
      opacity,
      transform: `translateX(${translateX}%) translateZ(${translateZ}px) scale(${scale})`,
      zIndex,
      visibility: 'visible' as const,
    };
  };

  if (loading) {
    return (
      <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-border bg-card card-solid">
        <Skeleton className="absolute inset-0 w-full h-full" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-card">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center border border-border shadow-lg animate-pulse">
            <Play className="w-12 h-12 text-primary-foreground ml-1" />
          </div>
          <div className="text-center">
            <p className="text-muted-foreground text-sm">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Carousel Container with 3D perspective */}
      <div 
        className="relative aspect-video flex items-center justify-center overflow-visible"
        style={{ perspective: '1500px', perspectiveOrigin: '50% 50%' }}
      >
        {/* Cards */}
        {Array.from({ length: totalSlots }).map((_, index) => {
          const position = getPosition(index);
          const styles = getCardStyles(position);
          const video = videos[index];
          const hasVideo = video && video.url;
          const isCenter = position === 0;

          return (
            <div
              key={index}
              className="absolute inset-0 transition-all duration-500 ease-out"
              style={{
                ...styles,
                transformStyle: 'preserve-3d',
                cursor: isCenter ? 'default' : 'pointer',
              }}
              onClick={() => !isCenter && setCurrentIndex(index)}
            >
              <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-border bg-card card-solid">
                {hasVideo ? (
                  <>
                    {isCenter ? (
                      <video
                        src={video.url}
                        controls
                        className="w-full h-full object-cover"
                      >
                        Seu navegador não suporta vídeos.
                      </video>
                    ) : (
                      <>
                        <video
                          src={video.url}
                          className="w-full h-full object-cover"
                          muted
                        />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/80 to-accent/80 flex items-center justify-center border border-border shadow-xl backdrop-blur-sm">
                            <Play className="w-10 h-10 text-primary-foreground ml-1" />
                          </div>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-card" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="relative">
                        <div className="absolute inset-0 w-28 h-28 rounded-full bg-primary blur-xl opacity-20 animate-pulse" />
                        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center border border-border shadow-2xl group hover:scale-105 transition-transform duration-300">
                          <Play className="w-12 h-12 text-primary-foreground ml-1" />
                        </div>
                      </div>
                    </div>
                    {/* Decorative corners */}
                    <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-primary rounded-tl-lg" />
                    <div className="absolute top-4 right-4 w-12 h-12 border-r-2 border-t-2 border-primary rounded-tr-lg" />
                    <div className="absolute bottom-4 left-4 w-12 h-12 border-l-2 border-b-2 border-primary rounded-bl-lg" />
                    <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-primary rounded-br-lg" />
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation arrows - positioned outside the main card */}
      <Button
        variant="outline"
        size="icon"
        onClick={goToPrevious}
        className="absolute -left-6 md:-left-16 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-background/90 backdrop-blur-sm border-border hover:bg-background hover:scale-110 transition-all duration-300 shadow-lg"
        aria-label="Vídeo anterior"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={goToNext}
        className="absolute -right-6 md:-right-16 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-background/90 backdrop-blur-sm border-border hover:bg-background hover:scale-110 transition-all duration-300 shadow-lg"
        aria-label="Próximo vídeo"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
      </Button>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mt-8">
        {Array.from({ length: totalSlots }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "w-6 bg-primary"
                : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
            aria-label={`Ir para vídeo ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}