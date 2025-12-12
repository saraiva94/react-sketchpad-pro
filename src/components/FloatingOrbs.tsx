import { useEffect, useState } from "react";

interface Orb {
  id: number;
  x: number;
  y: number;
  size: "large" | "small";
  color: "primary" | "accent";
  opacity: number;
  targetOpacity: number;
}

export const FloatingOrbs = () => {
  const [orbs, setOrbs] = useState<Orb[]>([]);

  useEffect(() => {
    // Create initial orbs distributed across the page
    const initialOrbs: Orb[] = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      size: i % 2 === 0 ? "large" : "small",
      color: i % 3 === 0 ? "accent" : "primary",
      opacity: 0,
      targetOpacity: 0,
    }));
    setOrbs(initialOrbs);

    // Staggered initial appearance
    initialOrbs.forEach((_, index) => {
      setTimeout(() => {
        setOrbs((prev) =>
          prev.map((o, i) => 
            i === index ? { ...o, targetOpacity: 0.06 + Math.random() * 0.06 } : o
          )
        );
      }, 500 + index * 300);
    });

    // Randomly animate orbs
    const interval = setInterval(() => {
      setOrbs((prev) =>
        prev.map((orb) => {
          // 20% chance to change state
          if (Math.random() < 0.2) {
            const shouldFade = orb.targetOpacity > 0.05;
            return {
              ...orb,
              targetOpacity: shouldFade 
                ? 0.02 + Math.random() * 0.04 
                : 0.08 + Math.random() * 0.06,
              // Move slightly when fading
              x: Math.max(5, Math.min(95, orb.x + (Math.random() - 0.5) * 15)),
              y: Math.max(5, Math.min(95, orb.y + (Math.random() - 0.5) * 15)),
            };
          }
          return orb;
        })
      );
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[1]">
      {orbs.map((orb) => (
        <div
          key={orb.id}
          className={`absolute rounded-full blur-3xl transition-all duration-[2000ms] ease-in-out ${
            orb.color === "primary" ? "bg-primary" : "bg-accent"
          }`}
          style={{
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            width: orb.size === "large" ? "20rem" : "10rem",
            height: orb.size === "large" ? "20rem" : "10rem",
            transform: "translate(-50%, -50%)",
            opacity: orb.targetOpacity,
          }}
        />
      ))}
    </div>
  );
};
