import { lazy, Suspense, useEffect, useState } from "react";
import { useAnimationsEnabled } from "@/hooks/useAnimationsEnabled";

// Lazy load the heavy canvas animation component
const ArtisticBackground = lazy(() =>
  import("./ArtisticBackground").then(module => ({ default: module.ArtisticBackground }))
);

const placeholder = (
  <div
    className="fixed inset-0 w-full h-full pointer-events-none"
    style={{ backgroundColor: 'hsl(var(--background))', zIndex: 0 }}
  />
);

export function LazyArtisticBackground() {
  const [shouldRender, setShouldRender] = useState(false);
  const animationsEnabled = useAnimationsEnabled();

  useEffect(() => {
    // Defer heavy animation until after first paint
    // Uses requestIdleCallback for best performance, falls back to setTimeout
    if ('requestIdleCallback' in window) {
      (window as Window).requestIdleCallback(() => setShouldRender(true), { timeout: 1000 });
    } else {
      setTimeout(() => setShouldRender(true), 100);
    }
  }, []);

  if (!animationsEnabled || !shouldRender) {
    return placeholder;
  }

  return (
    <Suspense fallback={placeholder}>
      <ArtisticBackground />
    </Suspense>
  );
}
