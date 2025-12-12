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

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? videos.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === videos.length - 1 ? 0 : prev + 1));
  };

  const activeVideos = videos.filter((v) => v.url);

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

  if (activeVideos.length === 0) {
    return (
      <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-border bg-card card-solid">
        <div className="absolute inset-0 bg-card" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 w-28 h-28 rounded-full bg-primary blur-xl opacity-20 animate-pulse" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center border border-border shadow-2xl group hover:scale-105 transition-transform duration-300">
              <Play className="w-12 h-12 text-primary-foreground ml-1 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-foreground font-medium text-lg">Vídeo Institucional</p>
            <p className="text-muted-foreground text-sm">Em breve</p>
          </div>
        </div>
        {/* Decorative corners */}
        <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-primary rounded-tl-lg" />
        <div className="absolute top-4 right-4 w-12 h-12 border-r-2 border-t-2 border-primary rounded-tr-lg" />
        <div className="absolute bottom-4 left-4 w-12 h-12 border-l-2 border-b-2 border-primary rounded-bl-lg" />
        <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-primary rounded-br-lg" />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-border bg-card card-solid">
        <video
          key={activeVideos[currentIndex]?.url}
          src={activeVideos[currentIndex]?.url}
          controls
          className="w-full h-full object-cover"
          poster=""
        >
          Seu navegador não suporta vídeos.
        </video>

        {/* Video indicator dots */}
        {activeVideos.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {activeVideos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-primary scale-125"
                    : "bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Ir para vídeo ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Navigation arrows - only show if more than 1 video */}
      {activeVideos.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-background/80 backdrop-blur-sm border-border hover:bg-background hover:scale-110 transition-all duration-300 shadow-lg"
            aria-label="Vídeo anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-background/80 backdrop-blur-sm border-border hover:bg-background hover:scale-110 transition-all duration-300 shadow-lg"
            aria-label="Próximo vídeo"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </>
      )}

      {/* Video counter */}
      {activeVideos.length > 1 && (
        <div className="absolute top-4 right-4 z-10 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border text-sm font-medium">
          {currentIndex + 1} / {activeVideos.length}
        </div>
      )}
    </div>
  );
}