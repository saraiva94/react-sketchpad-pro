import { lazy, Suspense, useEffect, useState } from "react";

// Lazy load the floating orbs component
const FloatingOrbs = lazy(() => 
  import("./FloatingOrbs").then(module => ({ default: module.FloatingOrbs }))
);

export function LazyFloatingOrbs() {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Defer heavy animation until after first paint with longer delay
    // Orbs are purely decorative, can wait longer
    if ('requestIdleCallback' in window) {
      (window as Window).requestIdleCallback(() => setShouldRender(true), { timeout: 2000 });
    } else {
      setTimeout(() => setShouldRender(true), 500);
    }
  }, []);

  if (!shouldRender) {
    return null; // No placeholder needed for decorative elements
  }

  return (
    <Suspense fallback={null}>
      <FloatingOrbs />
    </Suspense>
  );
}
