"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Star,
  Globe,
  Moon,
  Zap,
  Thermometer,
  Scale,
  ChevronDown,
  ChevronUp,
  Orbit,
  Ruler,
  Weight,
  Gauge,
  Calendar,
  RotateCcw,
  Eye,
  Search,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SolarSystemBody {
  id: string
  name: string
  englishName: string
  type: "planet" | "moon" | "asteroid" | "comet" | "star"
  isPlanet: boolean
  radius: number
  mass: number
  density: number
  gravity: number
  temperature: number
  distanceFromSun: number
  orbitalPeriod: number
  rotationPeriod: number
  moons: number
  discoveredBy?: string
  discoveryDate?: string
  parentBody?: string
}

interface SolarSystemVisualizationProps {
  bodies: SolarSystemBody[]
  onBodySelect: (body: SolarSystemBody) => void
  selectedBody: SolarSystemBody | null
}

// Enhanced tooltip component
const Tooltip = ({
  children,
  content,
  side = "top",
}: {
  children: React.ReactNode
  content: string
  side?: "top" | "bottom" | "left" | "right"
}) => {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            "absolute z-50 px-4 py-3 text-xs text-white bg-slate-900/95 backdrop-blur-md rounded-lg border border-purple-500/30 shadow-lg shadow-purple-500/20 whitespace-nowrap animate-in fade-in-0 zoom-in-95 duration-200",
            side === "top" && "bottom-full left-1/2 transform -translate-x-1/2 mb-3",
            side === "bottom" && "top-full left-1/2 transform -translate-x-1/2 mt-3",
            side === "left" && "right-full top-1/2 transform -translate-y-1/2 mr-3",
            side === "right" && "left-full top-1/2 transform -translate-y-1/2 ml-3",
          )}
        >
          {content}
          <div
            className={cn(
              "absolute w-2 h-2 bg-slate-900 border-l border-t border-purple-500/30 transform rotate-45",
              side === "top" && "top-full left-1/2 -translate-x-1/2 -mt-1",
              side === "bottom" && "bottom-full left-1/2 -translate-x-1/2 -mb-1",
              side === "left" && "left-full top-1/2 -translate-y-1/2 -ml-1",
              side === "right" && "right-full top-1/2 -translate-y-1/2 -mr-1",
            )}
          />
        </div>
      )}
    </div>
  )
}

// Animated progress bar for orbital periods
const OrbitalProgress = ({ period, maxPeriod }: { period: number; maxPeriod: number }) => {
  const percentage = Math.min((period / maxPeriod) * 100, 100)

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">Orbital Period</span>
        <span className="text-purple-400 font-mono">
          {period > 365 ? `${(period / 365).toFixed(1)} years` : `${period.toFixed(1)} days`}
        </span>
      </div>
      <div className="relative">
        <Progress value={percentage} className="h-3 bg-slate-800/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 rounded-full animate-pulse" />
      </div>
    </div>
  )
}

// Enhanced planet card with animations
const PlanetCard = ({
  planet,
  onClick,
  isSelected,
}: {
  planet: SolarSystemBody
  onClick: () => void
  isSelected: boolean
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const size = Math.max(10, Math.min(18, (planet.radius || 1000) / 3500))
  const BodyIcon = planet.type === "star" ? Star : planet.type === "planet" ? Globe : Moon

  const getBodyColor = (body: SolarSystemBody) => {
    switch (body.id) {
      case "sun":
      case "soleil":
        return "from-yellow-400 to-orange-500"
      case "mercury":
      case "mercure":
        return "from-gray-400 to-gray-600"
      case "venus":
        return "from-orange-300 to-yellow-500"
      case "earth":
      case "terre":
        return "from-blue-400 to-green-500"
      case "mars":
        return "from-red-400 to-orange-600"
      case "jupiter":
        return "from-orange-500 to-red-600"
      case "saturn":
      case "saturne":
        return "from-yellow-400 to-orange-400"
      case "uranus":
        return "from-cyan-300 to-blue-400"
      case "neptune":
        return "from-blue-500 to-indigo-600"
      default:
        return body.type === "star" ? "from-yellow-400 to-orange-500" : "from-blue-400 to-purple-500"
    }
  }

  const formatDistance = (distance: number) => {
    if (distance >= 1e9) return `${(distance / 1e9).toFixed(1)}B km`
    if (distance >= 1e6) return `${(distance / 1e6).toFixed(1)}M km`
    return `${distance.toLocaleString()} km`
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Orbital path indicator */}
      <div className="w-px h-8 bg-gradient-to-b from-transparent via-purple-500/50 to-transparent" />

      {/* Planet container */}
      <div
        className={cn(
          "relative cursor-pointer transition-all duration-500 ease-out group",
          isSelected && "scale-110",
          isHovered && "scale-105",
        )}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Glow effect */}
        <div
          className={cn(
            "absolute inset-0 rounded-full blur-xl opacity-0 transition-opacity duration-500",
            `bg-gradient-to-r ${getBodyColor(planet)}`,
            (isHovered || isSelected) && "opacity-60",
          )}
          style={{
            width: `${size * 7}px`,
            height: `${size * 7}px`,
            transform: "translate(-50%, -50%)",
            left: "50%",
            top: "50%",
          }}
        />

        {/* Planet body */}
        <div
          className={cn(
            "relative rounded-full shadow-2xl transition-all duration-500 flex items-center justify-center overflow-hidden",
            `bg-gradient-to-br ${getBodyColor(planet)}`,
            isSelected && "ring-2 ring-purple-400 ring-offset-2 ring-offset-slate-900",
            isHovered && "shadow-lg shadow-purple-500/30",
          )}
          style={{ width: `${size * 5}px`, height: `${size * 5}px` }}
        >
          {/* Rotating animation for planets */}
          <div
            className={cn(
              "absolute inset-0 rounded-full",
              planet.type !== "star" && "animate-spin",
              planet.type === "star" && "animate-pulse",
            )}
            style={{ animationDuration: planet.type === "star" ? "2s" : "20s" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-full" />
          </div>

          <BodyIcon
            className={cn(
              "relative z-10 text-white transition-all duration-300",
              size > 14 ? "w-7 h-7" : "w-5 h-5",
              isHovered && "scale-110",
            )}
          />

          {/* Atmospheric glow for gas giants */}
          {(planet.id === "jupiter" || planet.id === "saturn" || planet.id === "uranus" || planet.id === "neptune") && (
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
          )}
        </div>

        {/* Saturn's rings */}
        {(planet.id === "saturn" || planet.id === "saturne") && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="border-2 border-yellow-400/40 rounded-full animate-spin"
              style={{
                width: `${size * 7}px`,
                height: `${size * 2.5}px`,
                animationDuration: "30s",
              }}
            />
          </div>
        )}
      </div>

      {/* Planet info */}
      <div className="text-center space-y-2">
        <Tooltip content={`${planet.englishName} - Click for detailed information`}>
          <div
            className={cn(
              "text-sm font-bold transition-colors duration-300",
              isSelected ? "text-purple-300" : "text-purple-400",
              isHovered && "text-purple-200",
            )}
          >
            {planet.englishName}
          </div>
        </Tooltip>

        <Tooltip content={`Distance from Sun: ${formatDistance(planet.distanceFromSun)}`}>
          <div className="text-xs text-gray-500 font-mono">{formatDistance(planet.distanceFromSun)}</div>
        </Tooltip>

        {planet.moons > 0 && (
          <Tooltip content={`This ${planet.type} has ${planet.moons} known moon${planet.moons > 1 ? "s" : ""}`}>
            <Badge
              variant="outline"
              className={cn(
                "text-xs border-purple-500/50 text-purple-300 transition-all duration-300 hover:border-purple-400 hover:text-purple-200 px-2 py-1",
                isHovered && "scale-105",
              )}
            >
              <Moon className="w-3 h-3 mr-1" />
              {planet.moons}
            </Badge>
          </Tooltip>
        )}
      </div>
    </div>
  )
}

export const SolarSystemVisualization = ({ bodies, onBodySelect, selectedBody }: SolarSystemVisualizationProps) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    physical: true,
    orbital: true,
    environment: true,
    discovery: false,
  })

  const planets = useMemo(
    () => bodies.filter((body) => body.isPlanet).sort((a, b) => a.distanceFromSun - b.distanceFromSun),
    [bodies],
  )
  const sun = useMemo(() => bodies.find((body) => body.type === "star"), [bodies])

  const maxOrbitalPeriod = useMemo(() => Math.max(...planets.map((p) => p.orbitalPeriod || 0)), [planets])

  const formatMass = (mass: number | null | undefined) => {
    if (!mass || mass === 0 || isNaN(mass)) return "Unknown"
    try {
      if (mass >= 1e24) return `${(mass / 1e24).toFixed(2)} × 10²⁴ kg`
      if (mass >= 1e21) return `${(mass / 1e21).toFixed(2)} × 10²¹ kg`
      if (mass >= 1e18) return `${(mass / 1e18).toFixed(2)} × 10¹⁸ kg`
      return `${mass.toExponential(2)} kg`
    } catch (error) {
      return "Unknown"
    }
  }

  const formatDistance = (distance: number | null | undefined) => {
    if (!distance || distance === 0 || isNaN(distance)) return "Unknown"
    try {
      if (distance >= 1e9) return `${(distance / 1e9).toFixed(2)} billion km`
      if (distance >= 1e6) return `${(distance / 1e6).toFixed(2)} million km`
      if (distance >= 1000) return `${(distance / 1000).toFixed(0)} thousand km`
      return `${distance.toLocaleString()} km`
    } catch (error) {
      return "Unknown"
    }
  }

  const formatPeriod = (period: number | null | undefined) => {
    if (!period || period === 0 || isNaN(period)) return "Unknown"
    try {
      if (period >= 365) return `${(period / 365).toFixed(1)} years`
      if (period >= 1) return `${period.toFixed(1)} days`
      return `${(period * 24).toFixed(1)} hours`
    } catch (error) {
      return "Unknown"
    }
  }

  const formatNumber = (value: number | null | undefined, unit = "") => {
    if (!value || value === 0 || isNaN(value)) return "Unknown"
    try {
      return `${value.toLocaleString()}${unit ? ` ${unit}` : ""}`
    } catch (error) {
      return "Unknown"
    }
  }

  const formatTemperature = (temp: number | null | undefined) => {
    if (temp === null || temp === undefined || isNaN(temp)) return "Unknown"
    try {
      const celsius = temp
      const fahrenheit = (temp * 9) / 5 + 32
      const kelvin = temp + 273.15
      return `${celsius}°C (${fahrenheit.toFixed(0)}°F, ${kelvin.toFixed(0)}K)`
    } catch (error) {
      return "Unknown"
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  return (
    <div className="space-y-10">
      {/* Enhanced Solar System Overview */}
      <Card className="bg-slate-900/90 backdrop-blur-md border-purple-500/30 shadow-2xl shadow-purple-500/10 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-900/50 to-purple-900/20 border-b border-purple-500/20 p-8">
          <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 flex items-center">
            <Star className="w-8 h-8 mr-4 text-purple-400 animate-pulse" />
            Solar System Overview
            <Sparkles className="w-6 h-6 ml-3 text-cyan-400 animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-10">
          <div className="relative bg-gradient-to-r from-slate-950/50 via-slate-900/50 to-slate-950/50 rounded-xl p-10 overflow-x-auto border border-purple-500/20">
            {/* Background stars */}
            <div className="absolute inset-0 overflow-hidden">
              {Array.from({ length: 50 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${2 + Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>

            <div className="relative flex items-center space-x-16 min-w-max">
              {/* Sun */}
              {sun && (
                <PlanetCard planet={sun} onClick={() => onBodySelect(sun)} isSelected={selectedBody?.id === sun.id} />
              )}

              {/* Planets */}
              {planets.map((planet) => (
                <PlanetCard
                  key={planet.id}
                  planet={planet}
                  onClick={() => onBodySelect(planet)}
                  isSelected={selectedBody?.id === planet.id}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Body Details */}
      {selectedBody && (
        <Card className="bg-slate-900/90 backdrop-blur-md border-purple-500/30 shadow-2xl shadow-purple-500/10 animate-in slide-in-from-bottom duration-500">
          <CardHeader className="bg-gradient-to-r from-slate-900/50 to-purple-900/20 border-b border-purple-500/20 p-8">
            <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 flex items-center">
              {(() => {
                const BodyIcon = selectedBody.type === "star" ? Star : selectedBody.type === "planet" ? Globe : Moon
                return <BodyIcon className="w-8 h-8 mr-4 text-purple-400" />
              })()}
              {selectedBody.englishName}
              <Badge className="ml-4 bg-purple-500/20 text-purple-300 border-purple-500/30 px-3 py-1">
                {selectedBody.type.charAt(0).toUpperCase() + selectedBody.type.slice(1)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10">
              {/* Physical Properties */}
              <Collapsible open={expandedSections.physical} onOpenChange={() => toggleSection("physical")}>
                <Card className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-slate-700/30 transition-colors duration-200 p-6">
                      <CardTitle className="text-lg text-purple-400 flex items-center justify-between group">
                        <div className="flex items-center">
                          <Scale className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200" />
                          Physical Properties
                        </div>
                        {expandedSections.physical ? (
                          <ChevronUp className="w-4 h-4 group-hover:text-purple-300 transition-colors duration-200" />
                        ) : (
                          <ChevronDown className="w-4 h-4 group-hover:text-purple-300 transition-colors duration-200" />
                        )}
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-5 p-6 pt-0">
                      <div className="space-y-4">
                        <Tooltip content="The average radius from the center to the surface">
                          <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors duration-200">
                            <div className="flex items-center">
                              <Ruler className="w-4 h-4 mr-3 text-cyan-400" />
                              <span className="text-gray-400">Radius:</span>
                            </div>
                            <span className="font-mono text-purple-300">{formatNumber(selectedBody.radius, "km")}</span>
                          </div>
                        </Tooltip>

                        <Tooltip content="Total mass of the celestial body">
                          <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors duration-200">
                            <div className="flex items-center">
                              <Weight className="w-4 h-4 mr-3 text-cyan-400" />
                              <span className="text-gray-400">Mass:</span>
                            </div>
                            <span className="font-mono text-purple-300">{formatMass(selectedBody.mass)}</span>
                          </div>
                        </Tooltip>

                        <Tooltip content="Mass per unit volume">
                          <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors duration-200">
                            <div className="flex items-center">
                              <Gauge className="w-4 h-4 mr-3 text-cyan-400" />
                              <span className="text-gray-400">Density:</span>
                            </div>
                            <span className="font-mono text-purple-300">
                              {formatNumber(selectedBody.density, "kg/m³")}
                            </span>
                          </div>
                        </Tooltip>

                        <Tooltip content="Surface gravitational acceleration">
                          <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors duration-200">
                            <div className="flex items-center">
                              <Zap className="w-4 h-4 mr-3 text-cyan-400" />
                              <span className="text-gray-400">Gravity:</span>
                            </div>
                            <span className="font-mono text-purple-300">
                              {formatNumber(selectedBody.gravity, "m/s²")}
                            </span>
                          </div>
                        </Tooltip>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              {/* Orbital Properties */}
              <Collapsible open={expandedSections.orbital} onOpenChange={() => toggleSection("orbital")}>
                <Card className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-slate-700/30 transition-colors duration-200 p-6">
                      <CardTitle className="text-lg text-purple-400 flex items-center justify-between group">
                        <div className="flex items-center">
                          <Orbit className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200" />
                          Orbital Properties
                        </div>
                        {expandedSections.orbital ? (
                          <ChevronUp className="w-4 h-4 group-hover:text-purple-300 transition-colors duration-200" />
                        ) : (
                          <ChevronDown className="w-4 h-4 group-hover:text-purple-300 transition-colors duration-200" />
                        )}
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-5 p-6 pt-0">
                      <div className="space-y-4">
                        <Tooltip content="Average distance from the Sun">
                          <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors duration-200">
                            <div className="flex items-center">
                              <Ruler className="w-4 h-4 mr-3 text-cyan-400" />
                              <span className="text-gray-400">Distance from Sun:</span>
                            </div>
                            <span className="font-mono text-purple-300">
                              {formatDistance(selectedBody.distanceFromSun)}
                            </span>
                          </div>
                        </Tooltip>

                        {selectedBody.orbitalPeriod > 0 && (
                          <div className="p-4 bg-slate-700/30 rounded-lg">
                            <OrbitalProgress period={selectedBody.orbitalPeriod} maxPeriod={maxOrbitalPeriod} />
                          </div>
                        )}

                        <Tooltip content="Time to complete one rotation on its axis">
                          <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors duration-200">
                            <div className="flex items-center">
                              <RotateCcw className="w-4 h-4 mr-3 text-cyan-400" />
                              <span className="text-gray-400">Rotation Period:</span>
                            </div>
                            <span className="font-mono text-purple-300">
                              {selectedBody.rotationPeriod
                                ? `${Math.abs(selectedBody.rotationPeriod).toFixed(1)} hours`
                                : "Unknown"}
                            </span>
                          </div>
                        </Tooltip>

                        <Tooltip content="Number of natural satellites">
                          <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors duration-200">
                            <div className="flex items-center">
                              <Moon className="w-4 h-4 mr-3 text-cyan-400" />
                              <span className="text-gray-400">Moons:</span>
                            </div>
                            <span className="font-mono text-purple-300">{selectedBody.moons || 0}</span>
                          </div>
                        </Tooltip>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              {/* Environmental Properties */}
              <Collapsible open={expandedSections.environment} onOpenChange={() => toggleSection("environment")}>
                <Card className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-slate-700/30 transition-colors duration-200 p-6">
                      <CardTitle className="text-lg text-purple-400 flex items-center justify-between group">
                        <div className="flex items-center">
                          <Thermometer className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200" />
                          Environment
                        </div>
                        {expandedSections.environment ? (
                          <ChevronUp className="w-4 h-4 group-hover:text-purple-300 transition-colors duration-200" />
                        ) : (
                          <ChevronDown className="w-4 h-4 group-hover:text-purple-300 transition-colors duration-200" />
                        )}
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-5 p-6 pt-0">
                      <div className="space-y-4">
                        <Tooltip content="Average surface or atmospheric temperature">
                          <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors duration-200">
                            <div className="flex items-center">
                              <Thermometer className="w-4 h-4 mr-3 text-cyan-400" />
                              <span className="text-gray-400">Temperature:</span>
                            </div>
                            <span className="font-mono text-purple-300 text-sm">
                              {formatTemperature(selectedBody.temperature)}
                            </span>
                          </div>
                        </Tooltip>

                        <Tooltip content="Classification of celestial body">
                          <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors duration-200">
                            <div className="flex items-center">
                              <Eye className="w-4 h-4 mr-3 text-cyan-400" />
                              <span className="text-gray-400">Type:</span>
                            </div>
                            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 capitalize px-3 py-1">
                              {selectedBody.type}
                            </Badge>
                          </div>
                        </Tooltip>

                        {selectedBody.parentBody && (
                          <Tooltip content="The celestial body this object orbits">
                            <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors duration-200">
                              <div className="flex items-center">
                                <Orbit className="w-4 h-4 mr-3 text-cyan-400" />
                                <span className="text-gray-400">Orbits:</span>
                              </div>
                              <span className="font-mono text-purple-300">{selectedBody.parentBody}</span>
                            </div>
                          </Tooltip>
                        )}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              {/* Discovery Information */}
              {(selectedBody.discoveredBy || selectedBody.discoveryDate) && (
                <Collapsible
                  open={expandedSections.discovery}
                  onOpenChange={() => toggleSection("discovery")}
                  className="lg:col-span-2 xl:col-span-3"
                >
                  <Card className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-slate-700/30 transition-colors duration-200 p-6">
                        <CardTitle className="text-lg text-purple-400 flex items-center justify-between group">
                          <div className="flex items-center">
                            <Search className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200" />
                            Discovery Information
                          </div>
                          {expandedSections.discovery ? (
                            <ChevronUp className="w-4 h-4 group-hover:text-purple-300 transition-colors duration-200" />
                          ) : (
                            <ChevronDown className="w-4 h-4 group-hover:text-purple-300 transition-colors duration-200" />
                          )}
                        </CardTitle>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-5 p-6 pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {selectedBody.discoveredBy && (
                            <Tooltip content="Person or team credited with the discovery">
                              <div className="p-5 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors duration-200">
                                <div className="flex items-center mb-3">
                                  <Eye className="w-4 h-4 mr-3 text-cyan-400" />
                                  <span className="text-gray-400 text-sm">Discovered by:</span>
                                </div>
                                <span className="text-purple-300 font-medium">{selectedBody.discoveredBy}</span>
                              </div>
                            </Tooltip>
                          )}

                          {selectedBody.discoveryDate && (
                            <Tooltip content="Date when this celestial body was first discovered">
                              <div className="p-5 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors duration-200">
                                <div className="flex items-center mb-3">
                                  <Calendar className="w-4 h-4 mr-3 text-cyan-400" />
                                  <span className="text-gray-400 text-sm">Discovery Date:</span>
                                </div>
                                <span className="text-purple-300 font-medium font-mono">
                                  {selectedBody.discoveryDate}
                                </span>
                              </div>
                            </Tooltip>
                          )}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Statistics */}
      <Card className="bg-slate-900/90 backdrop-blur-md border-purple-500/30 shadow-2xl shadow-purple-500/10">
        <CardHeader className="bg-gradient-to-r from-slate-900/50 to-purple-900/20 border-b border-purple-500/20 p-8">
          <CardTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            Solar System Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="p-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              {
                count: bodies.filter((b) => b.type === "star").length,
                label: "Stars",
                color: "text-yellow-400",
                icon: Star,
                description: "Nuclear fusion powered",
              },
              {
                count: bodies.filter((b) => b.isPlanet).length,
                label: "Planets",
                color: "text-blue-400",
                icon: Globe,
                description: "Orbiting the Sun",
              },
              {
                count: bodies.filter((b) => b.type === "moon").length,
                label: "Moons",
                color: "text-gray-400",
                icon: Moon,
                description: "Natural satellites",
              },
              {
                count: bodies.length,
                label: "Total Bodies",
                color: "text-purple-400",
                icon: Sparkles,
                description: "All celestial objects",
              },
            ].map((stat, index) => (
              <Tooltip key={stat.label} content={stat.description}>
                <Card className="bg-slate-800/50 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/10 cursor-pointer group">
                  <CardContent className="p-8 text-center">
                    <div className="flex justify-center mb-4">
                      <stat.icon
                        className={cn("w-10 h-10 group-hover:scale-110 transition-transform duration-300", stat.color)}
                      />
                    </div>
                    <div className={cn("text-4xl font-bold mb-3 transition-colors duration-300", stat.color)}>
                      {stat.count}
                    </div>
                    <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              </Tooltip>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
