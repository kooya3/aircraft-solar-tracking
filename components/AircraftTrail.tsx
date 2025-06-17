"use client"

interface TrailPoint {
  lat: number
  lng: number
  timestamp: number
}

interface AircraftTrailProps {
  trail: TrailPoint[]
}

export const AircraftTrail = ({ trail }: AircraftTrailProps) => {
  if (trail.length < 2) return null

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      <defs>
        <linearGradient id="trailGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(34, 211, 238, 0)" />
          <stop offset="50%" stopColor="rgba(34, 211, 238, 0.3)" />
          <stop offset="100%" stopColor="rgba(34, 211, 238, 0.8)" />
        </linearGradient>
      </defs>
      <path
        d={`M ${trail
          .map(
            (point) =>
              `${((point.lng + 180) / 360) * window.innerWidth},${((90 - point.lat) / 180) * window.innerHeight}`,
          )
          .join(" L ")}`}
        stroke="url(#trailGradient)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-pulse"
        style={{
          filter: "drop-shadow(0 0 4px rgba(34, 211, 238, 0.5))",
        }}
      />

      {/* Trail dots */}
      {trail.slice(-5).map((point, index) => (
        <circle
          key={index}
          cx={((point.lng + 180) / 360) * window.innerWidth}
          cy={((90 - point.lat) / 180) * window.innerHeight}
          r={2 - index * 0.3}
          fill="rgba(34, 211, 238, 0.6)"
          className="animate-pulse"
          style={{
            animationDelay: `${index * 0.1}s`,
          }}
        />
      ))}
    </svg>
  )
}
