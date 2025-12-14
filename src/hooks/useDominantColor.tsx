import { useState, useEffect } from 'react';

interface DominantColorResult {
  backgroundColor: string;
  textColor: string;
  isLoading: boolean;
}

function getContrastColor(r: number, g: number, b: number): string {
  // Calculate relative luminance using WCAG formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  // Return white for dark backgrounds, black for light backgrounds
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

export function useDominantColor(imageUrl: string | null): DominantColorResult {
  const [result, setResult] = useState<DominantColorResult>({
    backgroundColor: 'hsl(var(--primary))',
    textColor: 'hsl(var(--primary-foreground))',
    isLoading: true,
  });

  useEffect(() => {
    if (!imageUrl) {
      setResult({
        backgroundColor: 'hsl(var(--primary))',
        textColor: 'hsl(var(--primary-foreground))',
        isLoading: false,
      });
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setResult(prev => ({ ...prev, isLoading: false }));
          return;
        }

        // Sample a smaller version for performance
        const sampleSize = 50;
        canvas.width = sampleSize;
        canvas.height = sampleSize;
        ctx.drawImage(img, 0, 0, sampleSize, sampleSize);

        const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
        const data = imageData.data;

        // Color frequency map
        const colorCounts: Map<string, { r: number; g: number; b: number; count: number }> = new Map();

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          // Skip transparent pixels
          if (a < 128) continue;

          // Skip very dark or very light pixels (often not interesting)
          const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
          if (luminance < 20 || luminance > 235) continue;

          // Quantize colors to reduce noise (group similar colors)
          const qr = Math.round(r / 32) * 32;
          const qg = Math.round(g / 32) * 32;
          const qb = Math.round(b / 32) * 32;
          const key = `${qr},${qg},${qb}`;

          const existing = colorCounts.get(key);
          if (existing) {
            existing.count++;
            // Keep running average of actual colors
            existing.r = (existing.r * (existing.count - 1) + r) / existing.count;
            existing.g = (existing.g * (existing.count - 1) + g) / existing.count;
            existing.b = (existing.b * (existing.count - 1) + b) / existing.count;
          } else {
            colorCounts.set(key, { r, g, b, count: 1 });
          }
        }

        // Find the most common color
        let dominantColor = { r: 100, g: 100, b: 100, count: 0 };
        colorCounts.forEach((color) => {
          // Boost saturation score to prefer more vibrant colors
          const [, saturation] = rgbToHsl(color.r, color.g, color.b);
          const score = color.count * (1 + saturation / 100);
          if (score > dominantColor.count) {
            dominantColor = { ...color, count: score };
          }
        });

        const [h, s, l] = rgbToHsl(dominantColor.r, dominantColor.g, dominantColor.b);
        // Slightly increase saturation and adjust lightness for better badge appearance
        const adjustedS = Math.min(s + 15, 100);
        const adjustedL = Math.max(Math.min(l, 55), 35); // Keep lightness in readable range

        setResult({
          backgroundColor: `hsl(${h}, ${adjustedS}%, ${adjustedL}%)`,
          textColor: getContrastColor(dominantColor.r, dominantColor.g, dominantColor.b),
          isLoading: false,
        });
      } catch {
        // Fallback on error (likely CORS)
        setResult({
          backgroundColor: 'hsl(var(--primary))',
          textColor: 'hsl(var(--primary-foreground))',
          isLoading: false,
        });
      }
    };

    img.onerror = () => {
      setResult({
        backgroundColor: 'hsl(var(--primary))',
        textColor: 'hsl(var(--primary-foreground))',
        isLoading: false,
      });
    };

    img.src = imageUrl;
  }, [imageUrl]);

  return result;
}
