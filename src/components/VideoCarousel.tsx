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
        transform: `translateX(${position * 100}%) scale(0.5)`,
        zIndex: 0,
        display: 'none' as const,
      };
    }

    // Scale and position based on distance from center
    const scale = 1 - absPosition * 0.15;
    const translateX = position * 28; // Percentage offset
    const translateZ = -absPosition * 100; // Depth effect
    const opacity = 1 - absPosition * 0.3;
    const zIndex = 10 - absPosition;

    return {
      opacity,
      transform: `translateX(${translateX}%) translateZ(${translateZ}px) scale(${scale})`,
      zIndex,
      display: 'block' as const,
    };
  };

  if (loading) {
    return (
      <div className="relative w-full py-8">
        <div className="relative h-[400px] flex items-center justify-center" style={{ perspective: '1000px' }}>
          <div className="w-full max-w-2xl aspect-video rounded-2xl overflow-hidden shadow-2xl border border-border bg-card">
            <Skeleton className="absolute inset-0 w-full h-full" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-card">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-pulse">
                <Play className="w-10 h-10 text-primary-foreground ml-1" />
              </div>
              <p className="text-muted-foreground text-sm">Carregando...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full py-8">
      {/* Carousel Container with 3D perspective */}
      <div 
        className="relative h-[350px] md:h-[400px] lg:h-[450px] flex items-center justify-center overflow-visible"
        style={{ perspective: '1200px', perspectiveOrigin: '50% 50%' }}
      >
        {/* Cards */}
        {Array.from({ length: totalSlots }).map((_, index) => {
          const position = getPosition(index);
          const styles = getCardStyles(position);
          const video = videos[index];
          const hasVideo = video && video.url;

          return (
            <div
              key={index}
              className="absolute left-1/2 top-1/2 w-[280px] md:w-[400px] lg:w-[500px] aspect-video transition-all duration-500 ease-out cursor-pointer"
              style={{
                ...styles,
                marginLeft: '-140px',
                marginTop: '-78.75px',
                transformStyle: 'preserve-3d',
              }}
              onClick={() => setCurrentIndex(index)}
            >
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-border bg-card">
                {hasVideo ? (
                  <>
                    {position === 0 ? (
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
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                            <Play className="w-7 h-7 text-white ml-0.5" />
                          </div>
                        </div>
                      </>
                    )}
                    {/* Video title bar (placeholder style) */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                      <div className="h-2 bg-white/30 rounded w-1/3 mb-2" />
                      <div className="h-2 bg-white/20 rounded w-2/3 mb-1" />
                      <div className="h-2 bg-white/20 rounded w-1/2" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-card" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 w-20 h-20 rounded-full bg-primary/20 blur-xl animate-pulse" />
                        <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary/80 to-accent/80 flex items-center justify-center border border-border shadow-xl">
                          <Play className="w-8 h-8 text-primary-foreground ml-0.5" />
                        </div>
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-foreground font-medium text-sm">Vídeo {index + 1}</p>
                        <p className="text-muted-foreground text-xs">Em breve</p>
                      </div>
                    </div>
                    {/* Decorative corners */}
                    <div className="absolute top-3 left-3 w-8 h-8 border-l-2 border-t-2 border-primary/50 rounded-tl-lg" />
                    <div className="absolute top-3 right-3 w-8 h-8 border-r-2 border-t-2 border-primary/50 rounded-tr-lg" />
                    <div className="absolute bottom-3 left-3 w-8 h-8 border-l-2 border-b-2 border-primary/50 rounded-bl-lg" />
                    <div className="absolute bottom-3 right-3 w-8 h-8 border-r-2 border-b-2 border-primary/50 rounded-br-lg" />
                    {/* Placeholder title bars */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                      <div className="h-2 bg-white/20 rounded w-1/3 mb-2" />
                      <div className="h-2 bg-white/15 rounded w-2/3 mb-1" />
                      <div className="h-2 bg-white/15 rounded w-1/2" />
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation arrows */}
      <Button
        variant="outline"
        size="icon"
        onClick={goToPrevious}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-background/90 backdrop-blur-sm border-border hover:bg-background hover:scale-110 transition-all duration-300 shadow-lg"
        aria-label="Vídeo anterior"
      >
        <ChevronLeft className="w-6 h-6" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={goToNext}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-background/90 backdrop-blur-sm border-border hover:bg-background hover:scale-110 transition-all duration-300 shadow-lg"
        aria-label="Próximo vídeo"
      >
        <ChevronRight className="w-6 h-6" />
      </Button>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mt-6">
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