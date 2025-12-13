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
  displayCount?: 1 | 3 | 5;
}

export function VideoCarousel({ videos, loading = false, displayCount = 5 }: VideoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Use displayCount for how many cards to show
  const totalSlots = displayCount;
  
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

  // Get styles based on position and displayCount
  const getCardStyles = (position: number) => {
    const absPosition = Math.abs(position);
    
    // For single video mode, hide all but center
    if (displayCount === 1) {
      if (position !== 0) {
        return {
          opacity: 0,
          transform: `translateX(${position * 100}%) scale(0.4)`,
          zIndex: 0,
          visibility: 'hidden' as const,
        };
      }
      return {
        opacity: 1,
        transform: `translateX(0) translateZ(0) scale(1)`,
        zIndex: 10,
        visibility: 'visible' as const,
      };
    }
    
    // For 3 video mode, only show center and immediate neighbors
    if (displayCount === 3) {
      if (absPosition > 1) {
        return {
          opacity: 0,
          transform: `translateX(${position * 100}%) scale(0.4)`,
          zIndex: 0,
          visibility: 'hidden' as const,
        };
      }
      
      if (position === 0) {
        return {
          opacity: 1,
          transform: `translateX(0) translateZ(0) scale(1)`,
          zIndex: 10,
          visibility: 'visible' as const,
        };
      }
      
      // First level cards for 3-video mode
      return {
        opacity: 1,
        transform: `translateX(${position * 45}%) translateZ(-80px) scale(0.75)`,
        zIndex: 9,
        visibility: 'visible' as const,
      };
    }
    
    // Full 5 video mode (default)
    // Only show cards within 2 positions of center
    if (absPosition > 2) {
      return {
        opacity: 0,
        transform: `translateX(${position * 100}%) scale(0.4)`,
        zIndex: 0,
        visibility: 'hidden' as const,
      };
    }

    // Scale hierarchy: center=1, first level=0.70, second level=0.50
    let scale: number;
    let translateX: number;
    let translateZ: number;
    
    if (position === 0) {
      scale = 1;
      translateX = 0;
      translateZ = 0;
    } else if (absPosition === 1) {
      // First level cards - medium size, overlapping with center
      scale = 0.70;
      translateX = position * 38;
      translateZ = -80;
    } else {
      // Second level cards - smallest, overlapping more with first level
      scale = 0.50;
      translateX = position * 35;
      translateZ = -160;
    }
    
    const opacity = 1;
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

      {/* Navigation arrows - only show if more than 1 video */}
      {displayCount > 1 && (
        <>
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
        </>
      )}

      {/* Dot indicators - only show if more than 1 video */}
      {displayCount > 1 && (
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
      )}
    </div>
  );
}