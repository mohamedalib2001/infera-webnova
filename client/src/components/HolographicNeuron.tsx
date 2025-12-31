import { motion } from "framer-motion";

interface HolographicNeuronProps {
  isConnected: boolean;
  showLabel?: boolean;
}

export function HolographicNeuron({ isConnected, showLabel = true }: HolographicNeuronProps) {
  const color = isConnected ? "#22c55e" : "#ef4444";
  const glowColor = isConnected ? "rgba(34, 197, 94, 0.6)" : "rgba(239, 68, 68, 0.6)";

  const axonAngles = [0, 45, 90, 135, 180, 225, 270, 315];
  const synapseAngles = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5];

  const degToRad = (deg: number) => (deg * Math.PI) / 180;

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-12 h-12">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <svg viewBox="0 0 100 100" className="w-full h-full relative z-10">
          <defs>
            <filter id="neuronGlow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="haloGradient">
              <stop offset="0%" stopColor={color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </radialGradient>
          </defs>

          <motion.circle
            cx="50"
            cy="50"
            fill="url(#haloGradient)"
            filter="url(#neuronGlow)"
            animate={{ r: [12, 15, 12] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {axonAngles.map((angle, i) => {
            const rad = degToRad(angle);
            const x1 = 50 + 15 * Math.cos(rad);
            const y1 = 50 + 15 * Math.sin(rad);
            const x2 = 50 + 35 * Math.cos(rad);
            const y2 = 50 + 35 * Math.sin(rad);

            return (
              <motion.line
                key={`axon-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                filter="url(#neuronGlow)"
                initial={{ pathLength: 0, opacity: 0.3 }}
                animate={{
                  pathLength: [0, 1, 0],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }}
              />
            );
          })}

          {synapseAngles.map((angle, i) => {
            const rad = degToRad(angle);
            const cx = 50 + 40 * Math.cos(rad);
            const cy = 50 + 40 * Math.sin(rad);

            return (
              <motion.circle
                key={`synapse-${i}`}
                cx={cx}
                cy={cy}
                fill={color}
                filter="url(#neuronGlow)"
                animate={{
                  r: [2, 4, 2],
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut",
                }}
              />
            );
          })}

          <motion.circle
            cx="50"
            cy="50"
            r="8"
            fill={color}
            filter="url(#neuronGlow)"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </svg>
      </div>

      {showLabel && (
        <div className="flex flex-col">
          <span
            className="text-sm font-medium"
            style={{ color }}
          >
            {isConnected ? "Connected" : "Disconnected"}
          </span>
          <span className="text-xs text-muted-foreground">
            {isConnected ? "Hetzner API Active" : "No Connection"}
          </span>
        </div>
      )}
    </div>
  );
}
