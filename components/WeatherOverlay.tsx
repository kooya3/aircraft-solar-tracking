"use client"
import { Cloud, CloudRain, Sun, AlertTriangle } from "lucide-react"

interface WeatherCell {
  lat: number
  lng: number
  condition: "Clear" | "Cloudy" | "Rain" | "Storm"
  intensity: number
}

const generateWeatherData = (): WeatherCell[] => {
  const cells: WeatherCell[] = []
  const conditions: WeatherCell["condition"][] = ["Clear", "Cloudy", "Rain", "Storm"]

  for (let lat = -60; lat <= 60; lat += 20) {
    for (let lng = -180; lng <= 180; lng += 30) {
      cells.push({
        lat,
        lng,
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        intensity: Math.random(),
      })
    }
  }

  return cells
}

export const WeatherOverlay = ({ zoom, pan }: { zoom: number; pan: { x: number; y: number } }) => {
  const weatherData = generateWeatherData()

  const getWeatherColor = (condition: WeatherCell["condition"], intensity: number) => {
    const alpha = intensity * 0.6
    switch (condition) {
      case "Clear":
        return `rgba(255, 255, 0, ${alpha})`
      case "Cloudy":
        return `rgba(128, 128, 128, ${alpha})`
      case "Rain":
        return `rgba(0, 100, 255, ${alpha})`
      case "Storm":
        return `rgba(255, 0, 0, ${alpha})`
      default:
        return `rgba(128, 128, 128, ${alpha})`
    }
  }

  const getWeatherIcon = (condition: WeatherCell["condition"]) => {
    switch (condition) {
      case "Clear":
        return <Sun className="w-4 h-4" />
      case "Cloudy":
        return <Cloud className="w-4 h-4" />
      case "Rain":
        return <CloudRain className="w-4 h-4" />
      case "Storm":
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Cloud className="w-4 h-4" />
    }
  }

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
      }}
    >
      {weatherData.map((cell, index) => (
        <div
          key={index}
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${((cell.lng + 180) / 360) * 100}%`,
            top: `${((90 - cell.lat) / 180) * 100}%`,
            backgroundColor: getWeatherColor(cell.condition, cell.intensity),
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
          }}
        >
          {getWeatherIcon(cell.condition)}
        </div>
      ))}
    </div>
  )
}
