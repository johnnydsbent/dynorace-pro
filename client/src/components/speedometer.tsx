import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface SpeedometerProps {
  speed: number;
  maxSpeed?: number;
  color?: string;
  size?: "sm" | "md" | "lg";
}

export function Speedometer({ speed, maxSpeed = 200, color = "#ef4444", size = "md" }: SpeedometerProps) {
  const [displaySpeed, setDisplaySpeed] = useState(0);
  
  useEffect(() => {
    setDisplaySpeed(speed);
  }, [speed]);

  const sizeClasses = {
    sm: "w-32 h-32",
    md: "w-48 h-48",
    lg: "w-64 h-64",
  };

  const fontSizes = {
    sm: "text-3xl",
    md: "text-5xl",
    lg: "text-7xl",
  };

  const percentage = Math.min(displaySpeed / maxSpeed, 1);
  const rotation = -135 + (percentage * 270);

  return (
    <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-zinc-800"
          strokeDasharray="212"
          strokeDashoffset="53"
          transform="rotate(135 50 50)"
          strokeLinecap="round"
        />
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray="212"
          strokeDashoffset={212 - (percentage * 159)}
          transform="rotate(135 50 50)"
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
        <motion.line
          x1="50"
          y1="50"
          x2="50"
          y2="15"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          animate={{ rotate: rotation }}
          style={{ transformOrigin: "50px 50px" }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
        />
        <circle cx="50" cy="50" r="4" fill={color} />
      </svg>
      
      <div className="flex flex-col items-center z-10">
        <motion.span 
          className={`${fontSizes[size]} font-display font-bold tabular-nums`}
          style={{ color }}
          key={Math.round(displaySpeed)}
        >
          {Math.round(displaySpeed)}
        </motion.span>
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">MPH</span>
      </div>
    </div>
  );
}
