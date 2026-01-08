import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface VideoItem {
  url: string;
  title?: string;
}

interface VideoCarouselProps {
  videos: VideoItem[];
  loading?: boolean;
  displayCount?: 1 | 3 | 5;
  onAnimationComplete?: () => void;
}

/**
 * Extrai ID do YouTube de qualquer formato de URL
 */
const extractYouTubeId = (url: string): string | null => {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

/**
 * Verifica se é URL do YouTube
 */
const isYouTubeVideo = (url: string): boolean => {
  return url.includes('youtube.com') || url.includes('youtu.be');
};

/**
 * Verifica se é arquivo de vídeo direto
 */
const isDirectVideo = (url: string): boolean => {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
  return videoExtensions.some(ext => url.toLowerCase().includes(ext));
};

// Helper function to stop all videos
const stopAllVideos = (videoRefs: React.MutableRefObject<(HTMLVideoElement | null)[]>) => {
  videoRefs.current.forEach(video => {
    if (video) {
      video.pause();
      video.currentTime = 0;
      video.src = '';
      video.load(); // Forces browser to release media resource
    }
  });
};

export function VideoCarousel({ videos, loading = false, displayCount = 5, onAnimationComplete }: VideoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Start with cards already in position but hidden, then fade in
  const [hasEntered, setHasEntered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const hasCalledComplete = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const location = useLocation();
  
  // Touch/swipe state
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const isDragging = useRef(false);

  // Stop videos when route changes (navigating away from homepage)
  useEffect(() => {
    // If we're not on the homepage, stop all videos immediately
    if (location.pathname !== '/') {
      console.log('[VideoCarousel] Navigating away from homepage, stopping all videos');
      videoRefs.current.forEach(video => {
        if (video) {
          video.pause();
          video.muted = true;
          video.currentTime = 0;
        }
      });
      // Also use the full stop function for complete cleanup
      stopAllVideos(videoRefs);
    }
    
    // Cleanup when pathname changes
    return () => {
      console.log('[VideoCarousel] Route cleanup, pausing all videos');
      videoRefs.current.forEach(video => {
        if (video) {
          video.pause();
          video.muted = true;
        }
      });
    };
  }, [location.pathname]);

  // Cleanup: pause all videos when component unmounts
  useEffect(() => {
    return () => {
      stopAllVideos(videoRefs);
    };
  }, []);

  // Pause videos when page visibility changes (user switches tabs)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        videoRefs.current.forEach(video => {
          if (video) {
            video.pause();
          }
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Entrance animation - cards start in position but hidden, then fade in together
  useEffect(() => {
    if (!loading && !hasEntered) {
      // Cards are already positioned, just make them visible with a fade
      const fadeTimer = setTimeout(() => {
        setHasEntered(true);
        setIsVisible(true);
      }, 100);
      
      // Notify parent after animation completes
      const completeTimer = setTimeout(() => {
        if (!hasCalledComplete.current) {
          onAnimationComplete?.();
          hasCalledComplete.current = true;
        }
      }, 600);
      
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [loading, hasEntered, onAnimationComplete]);

  // Use displayCount for how many cards to show
  const totalSlots = displayCount;
  
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalSlots - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === totalSlots - 1 ? 0 : prev + 1));
  };

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!hasEntered || displayCount === 1) return;
    touchStartX.current = e.touches[0].clientX;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!isDragging.current || !hasEntered || displayCount === 1) return;
    isDragging.current = false;
    
    const swipeDistance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;
    
    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }
    
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // Mouse handlers for drag gestures (tablet/desktop with touch)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!hasEntered || displayCount === 1) return;
    touchStartX.current = e.clientX;
    isDragging.current = true;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    touchEndX.current = e.clientX;
  };

  const handleMouseUp = () => {
    if (!isDragging.current || !hasEntered || displayCount === 1) return;
    isDragging.current = false;
    
    const swipeDistance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;
    
    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }
    
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const handleMouseLeave = () => {
    if (isDragging.current) {
      handleMouseUp();
    }
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
  const getCardStyles = (position: number, forEntrance: boolean = false) => {
    const absPosition = Math.abs(position);
    
    // Initial state - cards already in final position but invisible (prevents overlap flash)
    if (!isVisible && forEntrance) {
      return {
        opacity: 0,
        transform: getTransformForPosition(position, absPosition, displayCount),
        zIndex: 10 - absPosition,
        visibility: 'hidden' as const,
      };
    }
    
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

    const opacity = 1;
    const zIndex = 10 - absPosition;

    return {
      opacity,
      transform: getTransformForPosition(position, absPosition, displayCount),
      zIndex,
      visibility: 'visible' as const,
    };
  };
  
  // Helper to calculate transform based on position
  const getTransformForPosition = (position: number, absPosition: number, count: number): string => {
    if (count === 1) {
      return position === 0 ? `translateX(0) translateZ(0) scale(1)` : `translateX(${position * 100}%) scale(0.4)`;
    }
    
    if (count === 3) {
      if (position === 0) return `translateX(0) translateZ(0) scale(1)`;
      if (absPosition === 1) return `translateX(${position * 45}%) translateZ(-80px) scale(0.75)`;
      return `translateX(${position * 100}%) scale(0.4)`;
    }
    
    // 5 video mode
    if (position === 0) return `translateX(0) translateZ(0) scale(1)`;
    if (absPosition === 1) return `translateX(${position * 38}%) translateZ(-80px) scale(0.70)`;
    if (absPosition === 2) return `translateX(${position * 35}%) translateZ(-160px) scale(0.50)`;
    return `translateX(${position * 100}%) scale(0.4)`;
  };

  // Get skeleton card styles based on position
  const getSkeletonCardStyles = (position: number) => {
    const absPosition = Math.abs(position);
    
    if (displayCount === 1) {
      if (position !== 0) {
        return { opacity: 0, transform: `translateX(${position * 100}%) scale(0.4)`, zIndex: 0, visibility: 'hidden' as const };
      }
      return { opacity: 1, transform: `translateX(0) translateZ(0) scale(1)`, zIndex: 10, visibility: 'visible' as const };
    }
    
    if (displayCount === 3) {
      if (absPosition > 1) {
        return { opacity: 0, transform: `translateX(${position * 100}%) scale(0.4)`, zIndex: 0, visibility: 'hidden' as const };
      }
      if (position === 0) {
        return { opacity: 1, transform: `translateX(0) translateZ(0) scale(1)`, zIndex: 10, visibility: 'visible' as const };
      }
      return { opacity: 1, transform: `translateX(${position * 45}%) translateZ(-80px) scale(0.75)`, zIndex: 9, visibility: 'visible' as const };
    }
    
    // 5 video mode
    if (absPosition > 2) {
      return { opacity: 0, transform: `translateX(${position * 100}%) scale(0.4)`, zIndex: 0, visibility: 'hidden' as const };
    }

    let scale: number, translateX: number, translateZ: number;
    if (position === 0) {
      scale = 1; translateX = 0; translateZ = 0;
    } else if (absPosition === 1) {
      scale = 0.70; translateX = position * 38; translateZ = -80;
    } else {
      scale = 0.50; translateX = position * 35; translateZ = -160;
    }
    
    return { opacity: 1, transform: `translateX(${translateX}%) translateZ(${translateZ}px) scale(${scale})`, zIndex: 10 - absPosition, visibility: 'visible' as const };
  };

  // Get position for skeleton carousel
  const getSkeletonPosition = (index: number): number => {
    const diff = index - currentIndex;
    if (diff > displayCount / 2) return diff - displayCount;
    if (diff < -displayCount / 2) return diff + displayCount;
    return diff;
  };

  if (loading) {
    return (
      <div className="relative w-full">
        <div 
          className="relative aspect-video flex items-center justify-center overflow-visible"
          style={{ perspective: '1500px', perspectiveOrigin: '50% 50%' }}
        >
          {Array.from({ length: displayCount }).map((_, index) => {
            const position = getSkeletonPosition(index);
            const styles = getSkeletonCardStyles(position);
            
            return (
              <div
                key={index}
                className="absolute inset-0 transition-all duration-700 ease-out"
                style={{
                  ...styles,
                  transformStyle: 'preserve-3d',
                  cursor: position === 0 ? 'default' : 'pointer',
                }}
                onClick={() => position !== 0 && setCurrentIndex(index)}
              >
                <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-border bg-card card-solid">
                  <Skeleton className="absolute inset-0 w-full h-full" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-card">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center border border-border shadow-lg animate-pulse">
                      <Play className="w-12 h-12 text-primary-foreground ml-1" />
                    </div>
                    {position === 0 && (
                      <div className="text-center">
                        <p className="text-muted-foreground text-sm">Carregando...</p>
                      </div>
                    )}
                  </div>
                  {/* Decorative corners */}
                  <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-primary/50 rounded-tl-lg" />
                  <div className="absolute top-4 right-4 w-12 h-12 border-r-2 border-t-2 border-primary/50 rounded-tr-lg" />
                  <div className="absolute bottom-4 left-4 w-12 h-12 border-l-2 border-b-2 border-primary/50 rounded-bl-lg" />
                  <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-primary/50 rounded-br-lg" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation arrows for skeleton */}
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

        {/* Dot indicators for skeleton */}
        {displayCount > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: displayCount }).map((_, index) => (
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

  return (
    <div className="relative w-full">
      {/* Carousel Container with 3D perspective */}
      <div 
        ref={containerRef}
        className="relative aspect-video flex items-center justify-center overflow-visible cursor-grab active:cursor-grabbing touch-pan-y"
        style={{ perspective: '1500px', perspectiveOrigin: '50% 50%' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* Cards */}
        {Array.from({ length: totalSlots }).map((_, index) => {
          const position = getPosition(index);
          const styles = getCardStyles(position, true);
          const video = videos[index];
          const hasVideo = video && video.url;
          const isCenter = position === 0;

          return (
            <div
              key={index}
              className="absolute inset-0 transition-all ease-out"
              style={{
                ...styles,
                transformStyle: 'preserve-3d',
                cursor: isCenter ? 'default' : 'pointer',
                transitionDuration: isVisible ? '500ms' : '0ms',
                transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              }}
              onClick={() => hasEntered && !isCenter && setCurrentIndex(index)}
            >
              <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-border bg-card card-solid">
                {hasVideo ? (
                  <>
                    {(() => {
                      const youtubeId = isYouTubeVideo(video.url) ? extractYouTubeId(video.url) : null;
                      
                      // YouTube video
                      if (youtubeId) {
                        return (
                          <div className="absolute inset-0 w-full h-full">
                            <iframe
                              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=${isCenter ? 1 : 0}&mute=${isCenter ? 0 : 1}&loop=1&playlist=${youtubeId}&controls=${isCenter ? 1 : 0}&modestbranding=1&rel=0`}
                              className="absolute inset-0 w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              title={video.title || "Video"}
                            />
                            {!isCenter && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/80 to-accent/80 flex items-center justify-center border border-border shadow-xl backdrop-blur-sm">
                                  <Play className="w-10 h-10 text-primary-foreground ml-1" />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      }
                      
                      // Direct video file (mp4, webm, etc)
                      return isCenter ? (
                        <video
                          ref={el => { videoRefs.current[index] = el; }}
                          autoPlay
                          loop
                          src={video.url}
                          controls
                          className="w-full h-full object-cover"
                        >
                          Seu navegador não suporta vídeos.
                        </video>
                      ) : (
                        <>
                          <video
                            ref={el => { videoRefs.current[index] = el; }}
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
                      );
                    })()}
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

      {/* Navigation arrows - only show if more than 1 video and animation complete */}
      {displayCount > 1 && hasEntered && (
        <>
          <Button
            variant="outline"
            size="icon"
            onClick={goToPrevious}
            className="absolute -left-6 md:-left-16 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-background/90 backdrop-blur-sm border-border hover:bg-background hover:scale-110 transition-all duration-300 shadow-lg animate-fade-in"
            aria-label="Vídeo anterior"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNext}
            className="absolute -right-6 md:-right-16 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-background/90 backdrop-blur-sm border-border hover:bg-background hover:scale-110 transition-all duration-300 shadow-lg animate-fade-in"
            aria-label="Próximo vídeo"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </Button>
        </>
      )}

      {/* Dot indicators - only show if more than 1 video and animation complete */}
      {displayCount > 1 && hasEntered && (
        <div className="flex justify-center gap-2 mt-8 animate-fade-in">
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
