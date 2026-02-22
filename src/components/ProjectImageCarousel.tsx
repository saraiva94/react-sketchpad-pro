import { Image as ImageIcon } from "lucide-react";

interface ProjectImageCarouselProps {
  images: string[];
  className?: string;
}

export function ProjectImageCarousel({ images, className = "" }: ProjectImageCarouselProps) {
  console.log("🖼️ [CAROUSEL] Renderizando galeria de imagens:", {
    imageCount: images?.length || 0,
    images: images,
    hasImages: !!(images && images.length > 0)
  });

  // Se não há imagens, não renderiza nada (o card já tem condição no ProjectPage)
  if (!images || images.length === 0) {
    console.log("⚠️ [CAROUSEL] Nenhuma imagem para exibir");
    return null;
  }

  // Grid de 3 colunas (ou 2 em telas médias, ou 1 em mobile)
  console.log(`✅ [CAROUSEL] Renderizando grid com ${images.length} imagens`);
  
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {images.map((image, index) => {
        console.log(`🖼️ [CAROUSEL] Imagem ${index + 1}:`, image);
        return (
        <div 
          key={index}
          className="relative group aspect-square rounded-lg overflow-hidden bg-card border border-border hover:border-accent/50 transition-all hover:shadow-lg"
        >
          <img 
            src={image} 
            alt={`Imagem ${index + 1}`} 
            className="w-full h-full object-cover"
            loading="lazy"
          />
          
          {/* Overlay com número da imagem no hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
              {index + 1} / {images.length}
            </div>
          </div>
        </div>
      );
      })}
    </div>
  );
}
