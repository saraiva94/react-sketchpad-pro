import { useEffect, useState } from "react";

interface Orb {
  id: number;
  x: number;
  y: number;
  size: "large" | "small";
  color: "primary" | "accent";
  visible: boolean;
  delay: number;
}

export const FloatingOrbs = () => {
  const [orbs, setOrbs] = useState<Orb[]>([]);

  useEffect(() => {
    // Create initial orbs
    const initialOrbs: Orb[] = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() > 0.5 ? "large" : "small",
      color: Math.random() > 0.5 ? "primary" : "accent",
      visible: false,
      delay: Math.random() * 2000,
    }));
    setOrbs(initialOrbs);

    // Randomly toggle orb visibility
    const interval = setInterval(() => {
      setOrbs((prev) =>
        prev.map((orb) => {
          // 30% chance to toggle visibility
          if (Math.random() < 0.3) {
            return {
              ...orb,
              visible: !orb.visible,
              // Move to new position when becoming visible
              ...(orb.visible
                ? {}
                : {
                    x: Math.random() * 100,
                    y: Math.random() * 100,
                  }),
            };
          }
          return orb;
        })
      );
    }, 800);

    // Initial staggered appearance
    initialOrbs.forEach((orb, index) => {
      setTimeout(() => {
        setOrbs((prev) =>
          prev.map((o) => (o.id === orb.id ? { ...o, visible: true } : o))
        );
      }, orb.delay + index * 200);
    });

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[1]">
      {orbs.map((orb) => (
        <div
          key={orb.id}
          className={`absolute rounded-full blur-3xl transition-all duration-1000 ease-in-out ${
            orb.visible ? "opacity-10" : "opacity-0"
          } ${orb.color === "primary" ? "bg-primary" : "bg-accent"}`}
          style={{
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            width: orb.size === "large" ? "18rem" : "9rem",
            height: orb.size === "large" ? "18rem" : "9rem",
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </div>
  );
};
