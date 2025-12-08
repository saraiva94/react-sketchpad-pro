import { useEffect, useState } from "react";

export function AnimatedPortoBello() {
  const [visible, setVisible] = useState(false);
  const [strokeProgress, setStrokeProgress] = useState(0);
  const [isReversing, setIsReversing] = useState(false);

  useEffect(() => {
    // Start animation after a small delay
    const timeout = setTimeout(() => {
      setVisible(true);
    }, 300);

    // Animate stroke progress with loop
    const interval = setInterval(() => {
      setStrokeProgress((prev) => {
        if (!isReversing) {
          // Forward animation
          if (prev >= 100) {
            // Pause at 100% then start reversing
            setTimeout(() => setIsReversing(true), 1500);
            return 100;
          }
          return prev + 0.4;
        } else {
          // Reverse animation
          if (prev <= 0) {
            // Pause at 0% then start forward again
            setTimeout(() => setIsReversing(false), 800);
            return 0;
          }
          return prev - 0.6;
        }
      });
    }, 20);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [isReversing]);

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
          viewBox="0 0 1000 300"
          className="w-[83vw] max-w-[1320px] h-auto"
          style={{
            filter: "drop-shadow(0 0 40px hsl(var(--primary) / 0.06))",
          }}
        >
          <defs>
            {/* Gradient matching the lamp icon - primary (blue) to accent (teal/green) */}
            <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary) / 0.12)" />
              <stop offset="50%" stopColor="hsl(var(--accent) / 0.10)" />
              <stop offset="100%" stopColor="hsl(var(--primary) / 0.08)" />
            </linearGradient>
            <linearGradient id="strokeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary) / 0.25)" />
              <stop offset="50%" stopColor="hsl(var(--accent) / 0.20)" />
              <stop offset="100%" stopColor="hsl(var(--primary) / 0.15)" />
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
                  fontSize: "200px",
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
                fontSize: "200px",
                fontFamily: "Sacramento, cursive",
                fill: "url(#textGradient)",
              }}
            >
              Porto Bello
            </text>
          </g>
          
          {/* Animated stroke effect with gradient */}
          <text
            x="50%"
            y="55%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="font-handwritten"
            style={{
              fontSize: "200px",
              fontFamily: "Sacramento, cursive",
              fill: "none",
              stroke: "url(#strokeGradient)",
              strokeWidth: "1.5px",
              strokeDasharray: "4000",
              strokeDashoffset: `${4000 - (strokeProgress * 40)}`,
              transition: "stroke-dashoffset 0.05s linear",
            }}
          >
            Porto Bello
          </text>
        </svg>
      </div>
      
      {/* Subtle glow effect */}
      <div 
        className="absolute inset-0 bg-gradient-radial from-accent/5 via-primary/3 to-transparent"
        style={{
          opacity: strokeProgress / 100 * 0.4,
          transition: "opacity 0.3s ease-out",
        }}
      />
    </div>
  );
}