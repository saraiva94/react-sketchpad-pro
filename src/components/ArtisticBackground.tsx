import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  hue: number;
}

export function ArtisticBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize particles - increased count and visibility
    const particleCount = 100;
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 4 + 2,
      opacity: Math.random() * 0.5 + 0.2,
      hue: Math.random() * 40 + 180, // Blue to teal range
    }));

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);

    let time = 0;

    const animate = () => {
      time += 0.005;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw flowing gradient waves
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, `hsla(200, 70%, 50%, 0.03)`);
      gradient.addColorStop(0.5, `hsla(170, 60%, 45%, 0.02)`);
      gradient.addColorStop(1, `hsla(200, 70%, 50%, 0.03)`);

      // Draw organic flowing curves
      ctx.beginPath();
      ctx.moveTo(0, canvas.height * 0.5);
      
      for (let x = 0; x <= canvas.width; x += 20) {
        const y = canvas.height * 0.5 + 
          Math.sin(x * 0.003 + time) * 100 + 
          Math.sin(x * 0.005 + time * 1.5) * 50;
        ctx.lineTo(x, y);
      }
      
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.fillStyle = `hsla(200, 60%, 50%, 0.02)`;
      ctx.fill();

      // Second wave
      ctx.beginPath();
      ctx.moveTo(0, canvas.height * 0.6);
      
      for (let x = 0; x <= canvas.width; x += 20) {
        const y = canvas.height * 0.6 + 
          Math.sin(x * 0.004 + time * 0.8) * 80 + 
          Math.cos(x * 0.002 + time * 1.2) * 60;
        ctx.lineTo(x, y);
      }
      
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.fillStyle = `hsla(170, 50%, 45%, 0.015)`;
      ctx.fill();

      // Draw particles
      const lightRadius = 200; // Same as mouse glow radius
      
      particlesRef.current.forEach((particle, i) => {
        // Update position with flowing motion
        particle.x += particle.vx + Math.sin(time + i * 0.1) * 0.2;
        particle.y += particle.vy + Math.cos(time + i * 0.1) * 0.2;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Calculate distance from cursor
        const dx = particle.x - mouseRef.current.x;
        const dy = particle.y - mouseRef.current.y;
        const distanceFromCursor = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate glow intensity based on proximity to cursor
        const isInLight = distanceFromCursor < lightRadius;
        const proximityFactor = isInLight ? 1 - (distanceFromCursor / lightRadius) : 0;
        
        // Enhanced opacity and size when in light
        const glowOpacity = particle.opacity + (proximityFactor * 0.6);
        const glowSize = particle.size * (1 + proximityFactor * 1.5);
        const glowHue = isInLight ? particle.hue + proximityFactor * 20 : particle.hue; // Shift towards lighter color

        // Draw particle with enhanced glow when near cursor
        const particleGradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, glowSize * 3
        );
        
        if (isInLight) {
          // Bright glow effect when in cursor light
          particleGradient.addColorStop(0, `hsla(${glowHue}, 80%, 75%, ${glowOpacity})`);
          particleGradient.addColorStop(0.3, `hsla(${glowHue}, 70%, 65%, ${glowOpacity * 0.7})`);
          particleGradient.addColorStop(1, `hsla(${glowHue}, 60%, 55%, 0)`);
        } else {
          particleGradient.addColorStop(0, `hsla(${particle.hue}, 60%, 55%, ${particle.opacity})`);
          particleGradient.addColorStop(1, `hsla(${particle.hue}, 60%, 55%, 0)`);
        }

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, glowSize * 3, 0, Math.PI * 2);
        ctx.fillStyle = particleGradient;
        ctx.fill();
        
        // Add extra bright core when in light
        if (isInLight && proximityFactor > 0.3) {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, glowSize * 0.8, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${glowHue + 30}, 90%, 85%, ${proximityFactor * 0.8})`;
          ctx.fill();
        }

        // Draw connections between nearby particles (enhanced when both in light)
        particlesRef.current.slice(i + 1).forEach((other) => {
          const odx = particle.x - other.x;
          const ody = particle.y - other.y;
          const distance = Math.sqrt(odx * odx + ody * ody);

          if (distance < 150) {
            // Check if both particles are in light
            const otherDx = other.x - mouseRef.current.x;
            const otherDy = other.y - mouseRef.current.y;
            const otherDistFromCursor = Math.sqrt(otherDx * otherDx + otherDy * otherDy);
            const bothInLight = isInLight && otherDistFromCursor < lightRadius;
            
            const connectionOpacity = bothInLight ? 0.15 : 0.05;
            
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `hsla(190, ${bothInLight ? 70 : 50}%, ${bothInLight ? 60 : 50}%, ${connectionOpacity * (1 - distance / 150)})`;
            ctx.lineWidth = bothInLight ? 1 : 0.5;
            ctx.stroke();
          }
        });
      });

      // Draw floating geometric shapes with cursor interaction
      const shapeRadius = 250; // Light interaction radius for shapes
      
      for (let i = 0; i < 5; i++) {
        const x = canvas.width * (0.2 + i * 0.15) + Math.sin(time + i) * 30;
        const y = canvas.height * 0.3 + Math.cos(time * 0.7 + i * 0.5) * 50;
        const size = 20 + Math.sin(time + i * 2) * 10;
        const rotation = time * 0.5 + i;

        // Calculate distance from cursor
        const dx = x - mouseRef.current.x;
        const dy = y - mouseRef.current.y;
        const distanceFromCursor = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate glow intensity based on proximity
        const isInLight = distanceFromCursor < shapeRadius;
        const proximityFactor = isInLight ? 1 - (distanceFromCursor / shapeRadius) : 0;
        
        // Enhanced properties when illuminated
        const glowOpacity = 0.08 + (proximityFactor * 0.5);
        const glowLineWidth = 1 + (proximityFactor * 2);
        const hue = 180 + i * 10 + (proximityFactor * 30);
        const lightness = 50 + (proximityFactor * 25);
        const saturation = 50 + (proximityFactor * 30);

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        
        // Draw outer glow when in light
        if (isInLight && proximityFactor > 0.2) {
          ctx.shadowColor = `hsla(${hue}, ${saturation}%, ${lightness}%, ${proximityFactor * 0.8})`;
          ctx.shadowBlur = 15 + proximityFactor * 20;
        }
        
        ctx.beginPath();

        // Alternate between shapes
        if (i % 3 === 0) {
          // Triangle
          ctx.moveTo(0, -size);
          ctx.lineTo(size * 0.866, size * 0.5);
          ctx.lineTo(-size * 0.866, size * 0.5);
          ctx.closePath();
        } else if (i % 3 === 1) {
          // Diamond
          ctx.moveTo(0, -size);
          ctx.lineTo(size * 0.7, 0);
          ctx.lineTo(0, size);
          ctx.lineTo(-size * 0.7, 0);
          ctx.closePath();
        } else {
          // Circle
          ctx.arc(0, 0, size * 0.5, 0, Math.PI * 2);
        }

        ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${glowOpacity})`;
        ctx.lineWidth = glowLineWidth;
        ctx.stroke();
        
        // Add fill glow when very close
        if (isInLight && proximityFactor > 0.4) {
          ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness + 10}%, ${proximityFactor * 0.15})`;
          ctx.fill();
        }
        
        ctx.restore();
      }

      // Subtle mouse interaction glow
      const mouseGradient = ctx.createRadialGradient(
        mouseRef.current.x, mouseRef.current.y, 0,
        mouseRef.current.x, mouseRef.current.y, 200
      );
      mouseGradient.addColorStop(0, `hsla(190, 60%, 50%, 0.03)`);
      mouseGradient.addColorStop(1, `hsla(190, 60%, 50%, 0)`);
      ctx.fillStyle = mouseGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 1, zIndex: 0 }}
    />
  );
}