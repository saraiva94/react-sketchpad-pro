export interface CarouselImageItem {
  url: string;
  fit?: "cover" | "contain" | "fill";
}

// Accepts both legacy string[] and new CarouselImageItem[]
type CarouselEntry = string | CarouselImageItem;

interface ProjectImageCarouselProps {
  images: CarouselEntry[];
  className?: string;
}

function normalizeEntry(entry: CarouselEntry): CarouselImageItem {
  if (typeof entry === "string") return { url: entry, fit: "cover" };
  return { url: entry.url, fit: entry.fit || "cover" };
}

export function ProjectImageCarousel({ images, className = "" }: ProjectImageCarouselProps) {
  if (!images || images.length === 0) {
    return null;
  }

  const items = images.map(normalizeEntry);

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {items.map((item, index) => (
        <div
          key={index}
          className="relative group rounded-lg overflow-hidden bg-card border border-border hover:border-accent/50 transition-all hover:shadow-lg"
        >
          <img
            src={item.url}
            alt={`Imagem ${index + 1}`}
            className="w-full h-auto block"
            loading="lazy"
          />

          {/* Overlay com número da imagem no hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
              {index + 1} / {items.length}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
