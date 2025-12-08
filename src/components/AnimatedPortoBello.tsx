import { useEffect, useState } from "react";

export function AnimatedPortoBello() {
  const [visible, setVisible] = useState(false);
  const [strokeProgress, setStrokeProgress] = useState(0);

  useEffect(() => {
    // Start animation after a small delay
    const timeout = setTimeout(() => {
      setVisible(true);
    }, 300);

    // Animate stroke progress
    const interval = setInterval(() => {
      setStrokeProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 0.5;
      });
    }, 20);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 1s ease-out",
        }}
      >
        <svg
          viewBox="0 0 1200 400"
          className="w-[90vw] max-w-[1400px] h-auto"
          style={{
            filter: "drop-shadow(0 0 40px hsl(var(--primary) / 0.1))",
          }}
        >
          <defs>
            <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary) / 0.08)" />
              <stop offset="50%" stopColor="hsl(var(--accent) / 0.06)" />
              <stop offset="100%" stopColor="hsl(var(--primary) / 0.04)" />
            </linearGradient>
            <mask id="textMask">
              <rect x="0" y="0" width="100%" height="100%" fill="black" />
              <text
                x="50%"
                y="55%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-handwritten"
                style={{
                  fontSize: "180px",
                  fontFamily: "Sacramento, cursive",
                  fill: "white",
                }}
              >
                Porto Bello
              </text>
            </mask>
            <clipPath id="revealClip">
              <rect 
                x="0" 
                y="0" 
                width={`${strokeProgress}%`} 
                height="100%" 
              />
            </clipPath>
          </defs>
          
          {/* Background text with reveal animation */}
          <g clipPath="url(#revealClip)">
            <text
              x="50%"
              y="55%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="font-handwritten"
              style={{
                fontSize: "180px",
                fontFamily: "Sacramento, cursive",
                fill: "url(#textGradient)",
              }}
            >
              Porto Bello
            </text>
          </g>
          
          {/* Animated stroke effect */}
          <text
            x="50%"
            y="55%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="font-handwritten"
            style={{
              fontSize: "180px",
              fontFamily: "Sacramento, cursive",
              fill: "none",
              stroke: "hsl(var(--primary) / 0.15)",
              strokeWidth: "1px",
              strokeDasharray: "3000",
              strokeDashoffset: `${3000 - (strokeProgress * 30)}`,
              transition: "stroke-dashoffset 0.1s ease-out",
            }}
          >
            Porto Bello
          </text>
        </svg>
      </div>
      
      {/* Subtle glow effect */}
      <div 
        className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent"
        style={{
          opacity: strokeProgress / 100 * 0.5,
          transition: "opacity 0.5s ease-out",
        }}
      />
    </div>
  );
}