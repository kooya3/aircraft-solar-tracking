"use client"

import { useEffect, useState } from "react"

interface RadarScannerProps {
  mode: "standard" | "enhanced" | "military"
  zoom: number
  pan: { x: number; y: number }
}

export const RadarScanner = ({ mode, zoom, pan }: RadarScannerProps) => {
  const [scanAngle, setScanAngle] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setScanAngle((prev) => (prev + 2) % 360)
    }, 50)

    return () => clearInterval(interval)
  }, [])

  const getRadarConfig = () => {
    switch (mode) {
      case "standard":
        return {
          rings: [100, 200, 300, 400],
          sweepColor: "rgba(34, 197, 94, 0.3)",
          ringColor: "rgba(34, 197, 94, 0.2)",
          sweepWidth: 60,
        }
      case "enhanced":
        return {
          rings: [80, 160, 240, 320, 400],
          sweepColor: "rgba(34, 211, 238, 0.4)",
          ringColor: "rgba(34, 211, 238, 0.3)",
          sweepWidth: 45,
        }
      case "military":
        return {
          rings: [60, 120, 180, 240, 300, 360, 420],
          sweepColor: "rgba(239, 68, 68, 0.5)",
          ringColor: "rgba(239, 68, 68, 0.3)",
          sweepWidth: 30,
        }
    }
  }

  const config = getRadarConfig()

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
      }}
    >
      {/* Radar Rings */}
      {config.rings.map((radius, index) => (
        <div
          key={index}
          className="absolute top-1/2 left-1/2 border rounded-full animate-pulse"
          style={{
            width: `${radius}px`,
            height: `${radius}px`,
            marginLeft: `-${radius / 2}px`,
            marginTop: `-${radius / 2}px`,
            borderColor: config.ringColor,
            animationDelay: `${index * 0.2}s`,
            animationDuration: "3s",
          }}
        />
      ))}

      {/* Radar Sweep */}
      <div
        className="absolute top-1/2 left-1/2 origin-center"
        style={{
          transform: `rotate(${scanAngle}deg)`,
          transition: "transform 0.05s linear",
        }}
      >
        <div
          className="absolute"
          style={{
            width: "2px",
            height: `${config.rings[config.rings.length - 1] / 2}px`,
            background: `linear-gradient(to bottom, ${config.sweepColor}, transparent)`,
            transformOrigin: "bottom center",
            transform: "translateX(-1px)",
          }}
        />

        {/* Sweep Arc */}
        <svg
          className="absolute"
          style={{
            width: `${config.rings[config.rings.length - 1]}px`,
            height: `${config.rings[config.rings.length - 1]}px`,
            marginLeft: `-${config.rings[config.rings.length - 1] / 2}px`,
            marginTop: `-${config.rings[config.rings.length - 1] / 2}px`,
          }}
        >
          <defs>
            <radialGradient id={`sweepGradient-${mode}`} cx="50%" cy="50%">
              <stop offset="0%" stopColor={config.sweepColor} />
              <stop offset="70%" stopColor={config.sweepColor.replace("0.4", "0.2")} />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          <path
            d={`M ${config.rings[config.rings.length - 1] / 2} ${config.rings[config.rings.length - 1] / 2} 
                L ${config.rings[config.rings.length - 1] / 2} 0 
                A ${config.rings[config.rings.length - 1] / 2} ${config.rings[config.rings.length - 1] / 2} 0 0 1 
                ${config.rings[config.rings.length - 1] / 2 + Math.sin((config.sweepWidth * Math.PI) / 180) * (config.rings[config.rings.length - 1] / 2)} 
                ${config.rings[config.rings.length - 1] / 2 - Math.cos((config.sweepWidth * Math.PI) / 180) * (config.rings[config.rings.length - 1] / 2)} Z`}
            fill={`url(#sweepGradient-${mode})`}
            opacity="0.6"
          />
        </svg>
      </div>

      {/* Center Dot */}
      <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-cyan-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse shadow-lg shadow-cyan-500/50" />

      {/* Range Indicators */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        {config.rings.map((radius, index) => (
          <div
            key={index}
            className="absolute text-xs font-mono text-cyan-400/70"
            style={{
              top: `-${radius / 2 + 15}px`,
              left: "5px",
            }}
          >
            {(radius * 0.5).toFixed(0)}nm
          </div>
        ))}
      </div>
    </div>
  )
}
