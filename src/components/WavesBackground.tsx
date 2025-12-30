import { useEffect, useRef } from "react";

export function WavesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

    let time = 0;

    const animate = () => {
      time += 0.005;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw flowing gradient waves
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, `hsla(200, 70%, 50%, 0.03)`);
      gradient.addColorStop(0.5, `hsla(170, 60%, 45%, 0.02)`);
      gradient.addColorStop(1, `hsla(200, 70%, 50%, 0.03)`);

      // Draw organic flowing curves - first wave
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

      // Third wave - more subtle
      ctx.beginPath();
      ctx.moveTo(0, canvas.height * 0.35);
      
      for (let x = 0; x <= canvas.width; x += 20) {
        const y = canvas.height * 0.35 + 
          Math.sin(x * 0.002 + time * 0.6) * 60 + 
          Math.cos(x * 0.003 + time * 0.9) * 40;
        ctx.lineTo(x, y);
      }
      
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.fillStyle = `hsla(180, 55%, 48%, 0.012)`;
      ctx.fill();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none -z-10"
      style={{ opacity: 1 }}
    />
  );
}
