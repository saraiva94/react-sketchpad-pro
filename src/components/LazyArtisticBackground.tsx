import { lazy, Suspense, useEffect, useState } from "react";

// Lazy load the heavy canvas animation component
const ArtisticBackground = lazy(() => 
  import("./ArtisticBackground").then(module => ({ default: module.ArtisticBackground }))
);

export function LazyArtisticBackground() {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Defer heavy animation until after first paint
    // Uses requestIdleCallback for best performance, falls back to setTimeout
    if ('requestIdleCallback' in window) {
      (window as Window).requestIdleCallback(() => setShouldRender(true), { timeout: 1000 });
    } else {
      setTimeout(() => setShouldRender(true), 100);
    }
  }, []);

  if (!shouldRender) {
    // Minimal placeholder - does not block first paint
    return (
      <div 
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ backgroundColor: 'hsl(var(--background))', zIndex: 0 }}
      />
    );
  }

  return (
    <Suspense fallback={
      <div 
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ backgroundColor: 'hsl(var(--background))', zIndex: 0 }}
      />
    }>
      <ArtisticBackground />
    </Suspense>
  );
}
