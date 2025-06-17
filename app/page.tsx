"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plane,
  Navigation,
  Clock,
  Radio,
  Users,
  Cloud,
  Activity,
  AlertTriangle,
  Maximize,
  Volume2,
  Satellite,
  Target,
  Database,
  Star,
  Globe,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { WeatherOverlay } from "../components/WeatherOverlay"
import { FlightSearch } from "../components/FlightSearch"
import { RadarScanner } from "../components/RadarScanner"
import { AircraftTrail } from "../components/AircraftTrail"
import { RealFlightControls } from "../components/RealFlightControls"
import { SolarSystemControls } from "../components/SolarSystemControls"
import { SolarSystemVisualization } from "../components/SolarSystemVisualization"
import { SatelliteControls } from "../components/SatelliteControls"
import { SatelliteVisualization } from "../components/SatelliteVisualization"
import { useRealFlightData } from "../hooks/useRealFlightData"
import { useSolarSystemData } from "../hooks/useSolarSystemData"
import { useSatelliteData } from "../hooks/useSatelliteData"

interface Airport {
  code: string
  name: string
  city: string
  country: string
  latitude: number
  longitude: number
  elevation: number
  runways: string[]
}

interface WeatherData {
  temperature: number
  humidity: number
  windSpeed: number
  windDirection: number
  visibility: number
  conditions: "Clear" | "Cloudy" | "Rain" | "Storm" | "Fog"
  pressure: number
}

interface FlightPath {
  points: Array<{ lat: number; lng: number; alt: number; timestamp: number }>
  totalDistance: number
  estimatedTime: number
  currentProgress: number
}

interface Aircraft {
  id: string
  callsign: string
  latitude: number
  longitude: number
  altitude: number
  speed: number
  heading: number
  status: "En Route" | "Landing" | "Takeoff" | "Taxiing" | "Boarding" | "Delayed"
  aircraft_type: string
  origin: string
  destination: string
  squawk: string
  registration: string
  flightPath?: FlightPath
  weather?: WeatherData
  departureTime?: string
  arrivalTime?: string
  gate?: string
  terminal?: string
  trail: Array<{ lat: number; lng: number; timestamp: number }>
  country?: string
  lastContact?: number
  onGround?: boolean
  verticalRate?: number
}

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

interface SatelliteAbove {
  satid: number
  satname: string
  intDesignator: string
  launchDate: string
  satlat: number
  satlng: number
  satalt: number
}

// Enhanced airport data
const airports: Record<string, Airport> = {
  LAX: {
    code: "LAX",
    name: "Los Angeles International",
    city: "Los Angeles",
    country: "USA",
    latitude: 33.9425,
    longitude: -118.4081,
    elevation: 125,
    runways: ["06L/24R", "06R/24L", "07L/25R", "07R/25L"],
  },
  JFK: {
    code: "JFK",
    name: "John F. Kennedy International",
    city: "New York",
    country: "USA",
    latitude: 40.6413,
    longitude: -73.7781,
    elevation: 13,
    runways: ["04L/22R", "04R/22L", "08L/26R", "08R/26L"],
  },
  LHR: {
    code: "LHR",
    name: "London Heathrow",
    city: "London",
    country: "UK",
    latitude: 51.47,
    longitude: -0.4543,
    elevation: 83,
    runways: ["09L/27R", "09R/27L"],
  },
  NRT: {
    code: "NRT",
    name: "Narita International",
    city: "Tokyo",
    country: "Japan",
    latitude: 35.772,
    longitude: 140.3929,
    elevation: 141,
    runways: ["16L/34R", "16R/34L"],
  },
  SYD: {
    code: "SYD",
    name: "Sydney Kingsford Smith",
    city: "Sydney",
    country: "Australia",
    latitude: -33.9399,
    longitude: 151.1753,
    elevation: 21,
    runways: ["07/25", "16L/34R", "16R/34L"],
  },
  DXB: {
    code: "DXB",
    name: "Dubai International",
    city: "Dubai",
    country: "UAE",
    latitude: 25.2532,
    longitude: 55.3657,
    elevation: 62,
    runways: ["12L/30R", "12R/30L"],
  },
  CDG: {
    code: "CDG",
    name: "Charles de Gaulle",
    city: "Paris",
    country: "France",
    latitude: 49.0097,
    longitude: 2.5479,
    elevation: 392,
    runways: ["08L/26R", "08R/26L", "09L/27R", "09R/27L"],
  },
  SIN: {
    code: "SIN",
    name: "Singapore Changi",
    city: "Singapore",
    country: "Singapore",
    latitude: 1.3644,
    longitude: 103.9915,
    elevation: 22,
    runways: ["02L/20R", "02R/20L", "03/21"],
  },
  ORD: {
    code: "ORD",
    name: "O'Hare International",
    city: "Chicago",
    country: "USA",
    latitude: 41.9742,
    longitude: -87.9073,
    elevation: 672,
    runways: ["04L/22R", "04R/22L", "09L/27R", "09R/27L"],
  },
  ATL: {
    code: "ATL",
    name: "Hartsfield-Jackson Atlanta",
    city: "Atlanta",
    country: "USA",
    latitude: 33.6407,
    longitude: -84.4277,
    elevation: 1026,
    runways: ["08L/26R", "08R/26L", "09L/27R", "09R/27L"],
  },
}

const EnhancedAircraftDetails = ({ aircraft, onClose }: { aircraft: Aircraft; onClose: () => void }) => {
  const getStatusColor = (status: Aircraft["status"]) => {
    switch (status) {
      case "En Route":
        return "bg-green-500"
      case "Landing":
        return "bg-yellow-500"
      case "Takeoff":
        return "bg-blue-500"
      case "Taxiing":
        return "bg-orange-500"
      case "Boarding":
        return "bg-purple-500"
      case "Delayed":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
      <Card className="w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-slate-900/95 border-cyan-500/30 text-white shadow-2xl shadow-cyan-500/20 animate-in slide-in-from-bottom duration-500">
        <CardHeader className="border-b border-cyan-500/30 bg-gradient-to-r from-slate-900 to-slate-800 p-8">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-6">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-4 rounded-xl shadow-lg animate-pulse">
                <Plane className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-3">
                <CardTitle className="text-4xl font-bold text-cyan-400 tracking-wide">{aircraft.callsign}</CardTitle>
                <p className="text-gray-400 font-mono text-lg">
                  {aircraft.aircraft_type} • {aircraft.registration}
                </p>
                <div className="flex items-center space-x-3">
                  <Badge className={cn("text-white animate-pulse px-3 py-1", getStatusColor(aircraft.status))}>
                    {aircraft.status}
                  </Badge>
                  {aircraft.country && (
                    <Badge variant="outline" className="text-cyan-400 border-cyan-400 px-3 py-1">
                      {aircraft.country}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-red-500/20 transition-all duration-200 p-3"
            >
              ✕
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-slate-800/50 border-green-500/20 backdrop-blur-sm hover:border-green-500/40 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Activity className="w-5 h-5 text-green-400 animate-pulse" />
                  <h3 className="font-semibold text-cyan-400 text-lg">Live Data</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-400">Altitude:</span>
                    <span className="font-mono text-white">{aircraft.altitude.toLocaleString()} ft</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-400">Speed:</span>
                    <span className="font-mono text-white">{aircraft.speed.toFixed(0)} kts</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-400">Heading:</span>
                    <span className="font-mono text-white">{aircraft.heading.toFixed(0)}°</span>
                  </div>
                  {aircraft.verticalRate !== undefined && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-400">Vertical Rate:</span>
                      <span className="font-mono text-white">
                        {aircraft.verticalRate > 0 ? "↗" : aircraft.verticalRate < 0 ? "↘" : "→"}{" "}
                        {Math.abs(aircraft.verticalRate).toFixed(0)} ft/min
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-cyan-500/20 backdrop-blur-sm hover:border-cyan-500/40 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Navigation className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-semibold text-cyan-400 text-lg">Navigation</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-400">Latitude:</span>
                    <span className="font-mono text-cyan-300">{aircraft.latitude.toFixed(6)}°</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-400">Longitude:</span>
                    <span className="font-mono text-cyan-300">{aircraft.longitude.toFixed(6)}°</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-400">Squawk:</span>
                    <span className="font-mono text-cyan-300">{aircraft.squawk}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-400">On Ground:</span>
                    <span className={aircraft.onGround ? "text-orange-400" : "text-green-400"}>
                      {aircraft.onGround ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm hover:border-blue-500/40 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <h3 className="font-semibold text-cyan-400 text-lg">Tracking Info</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-400">ICAO24:</span>
                    <span className="font-mono text-cyan-300">{aircraft.id}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-400">Registration:</span>
                    <span className="font-mono text-cyan-300">{aircraft.registration}</span>
                  </div>
                  {aircraft.lastContact && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-400">Last Contact:</span>
                      <span className="font-mono text-cyan-300">
                        {Math.floor((Date.now() / 1000 - aircraft.lastContact) / 60)}m ago
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-400">Data Source:</span>
                    <span className="text-green-400 flex items-center">
                      <Satellite className="w-3 h-3 mr-1" />
                      ADS-B
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center space-y-2">
            <p className="text-sm text-gray-400">Real-time flight data provided by OpenSky Network</p>
            <p className="text-xs text-gray-500">Data updates every 30 seconds • Position accuracy ±100m</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function IntegratedTrackingSystem() {
  const [selectedAircraft, setSelectedAircraft] = useState<Aircraft | null>(null)
  const [selectedSolarBody, setSelectedSolarBody] = useState<SolarSystemBody | null>(null)
  const [selectedSatellite, setSelectedSatellite] = useState<SatelliteAbove | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showWeather, setShowWeather] = useState(false)
  const [showTrails, setShowTrails] = useState(true)
  const [radarMode, setRadarMode] = useState<"standard" | "enhanced" | "military">("enhanced")
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [activeTab, setActiveTab] = useState("flights")

  // Flight data options
  const [flightDataOptions, setFlightDataOptions] = useState({
    region: "global",
    limit: 500,
    autoUpdate: true,
    useMockData: false,
  })

  // Solar system data options
  const [solarSystemOptions, setSolarSystemOptions] = useState({
    bodyType: "all",
    autoUpdate: true,
    useMockData: false,
  })

  // Satellite tracking options
  const [satelliteOptions, setSatelliteOptions] = useState({
    observerLat: 37.7749,
    observerLng: -122.4194,
    observerAlt: 0,
    searchRadius: 70,
    categoryId: 0,
    autoUpdate: true,
    useMockData: false,
  })

  const mapRef = useRef<HTMLDivElement>(null)

  // Use real flight data hook
  const {
    flights: realFlights,
    loading: realDataLoading,
    error: realDataError,
    warning: realDataWarning,
    lastUpdate: flightLastUpdate,
    stats: flightStats,
    dataSource: flightDataSource,
    refresh: refreshFlights,
  } = useRealFlightData({
    region: flightDataOptions.region,
    limit: flightDataOptions.limit,
    updateInterval: 30000,
    autoUpdate: flightDataOptions.autoUpdate,
    useMockData: flightDataOptions.useMockData,
  })

  // Use solar system data hook
  const {
    bodies: solarBodies,
    loading: solarDataLoading,
    error: solarDataError,
    warning: solarDataWarning,
    lastUpdate: solarLastUpdate,
    stats: solarStats,
    dataSource: solarDataSource,
    refresh: refreshSolarSystem,
  } = useSolarSystemData({
    bodyType: solarSystemOptions.bodyType as any,
    updateInterval: 24 * 60 * 60 * 1000,
    autoUpdate: solarSystemOptions.autoUpdate,
    useMockData: solarSystemOptions.useMockData,
  })

  // Use satellite data hook
  const {
    satellites,
    loading: satelliteLoading,
    error: satelliteError,
    warning: satelliteWarning,
    lastUpdate: satelliteLastUpdate,
    transactionCount,
    refresh: refreshSatellites,
    categoryName,
    dataSource: satelliteDataSource,
  } = useSatelliteData({
    observerLat: satelliteOptions.observerLat,
    observerLng: satelliteOptions.observerLng,
    observerAlt: satelliteOptions.observerAlt,
    searchRadius: satelliteOptions.searchRadius,
    categoryId: satelliteOptions.categoryId,
    updateInterval: 60000,
    autoUpdate: satelliteOptions.autoUpdate,
    useMockData: satelliteOptions.useMockData,
  })

  // Convert real flight data to our Aircraft interface
  const aircraft: Aircraft[] = realFlights.map((flight) => ({
    ...flight,
    trail: [], // Initialize empty trail for real flights
    flightPath: {
      points: [],
      totalDistance: 0,
      estimatedTime: 0,
      currentProgress: 0,
    },
    weather: {
      temperature: 15,
      humidity: 60,
      windSpeed: 20,
      windDirection: 270,
      visibility: 10,
      conditions: "Clear" as const,
      pressure: 1013,
    },
    departureTime: new Date().toISOString(),
    arrivalTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    gate: "A1",
    terminal: "T1",
  }))

  const filteredAircraft = aircraft.filter(
    (ac) =>
      ac.callsign.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ac.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ac.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ac.country && ac.country.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const newZoom = Math.max(0.5, Math.min(3, zoom + (e.deltaY > 0 ? -0.1 : 0.1)))
    setZoom(newZoom)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Enhanced Header with Better Spacing */}
      <div className="bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 border-b border-cyan-500/30 px-6 py-5 backdrop-blur-md shadow-lg shadow-cyan-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Radio className="w-9 h-9 text-cyan-400 animate-pulse" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 tracking-wide">
                  Integrated Tracking System
                </h1>
                <p className="text-xs text-gray-400 font-mono">
                  Real-time Flight Tracking • Solar System Data • Satellite Tracking • Live ADS-B
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="border-green-500 text-green-400 animate-pulse px-3 py-1">
                <Database className="w-3 h-3 mr-2" />
                LIVE DATA
              </Badge>
              <Badge variant="outline" className="border-cyan-500 text-cyan-400 px-3 py-1">
                <Satellite className="w-3 h-3 mr-2" />
                OPENSKY
              </Badge>
              <Badge variant="outline" className="border-purple-500 text-purple-400 px-3 py-1">
                <Star className="w-3 h-3 mr-2" />
                SOLAR API
              </Badge>
              <Badge variant="outline" className="border-orange-500 text-orange-400 px-3 py-1">
                <Target className="w-3 h-3 mr-2" />
                N2YO
              </Badge>
              {(realDataError || solarDataError || satelliteError) && (
                <Badge variant="outline" className="border-red-500 text-red-400 px-3 py-1">
                  <AlertTriangle className="w-3 h-3 mr-2" />
                  ERROR
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <FlightSearch
              aircraft={aircraft}
              onSelect={setSelectedAircraft}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
            <div className="flex items-center space-x-4 text-sm text-gray-400 font-mono">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{new Date().toLocaleTimeString()} UTC</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>{aircraft.length.toLocaleString()} Aircraft</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <span>{solarBodies.length.toLocaleString()} Bodies</span>
              </div>
              <div className="flex items-center space-x-2">
                <Satellite className="w-4 h-4" />
                <span>{satellites.length.toLocaleString()} Satellites</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={cn("text-gray-400 hover:text-white p-2", soundEnabled && "text-cyan-400")}
              >
                <Volume2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-gray-400 hover:text-white p-2"
              >
                <Maximize className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* API Status Banner with Better Spacing */}
      {(realDataError || solarDataError || satelliteError) && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/30 px-6 py-3">
          <div className="flex items-center justify-center space-x-3 text-yellow-400 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Some external APIs temporarily unavailable - System running with available data sources</span>
          </div>
        </div>
      )}

      {/* Main Content with Enhanced Spacing */}
      <div className="flex h-[calc(100vh-100px)]">
        {/* Left Sidebar - Controls with Better Spacing */}
        <div className="w-96 bg-slate-900/50 backdrop-blur-md border-r border-slate-700/50 p-6 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 p-1 mb-6">
              <TabsTrigger value="flights" className="data-[state=active]:bg-cyan-500/20 py-3">
                <Plane className="w-4 h-4 mr-2" />
                Flights
              </TabsTrigger>
              <TabsTrigger value="solar" className="data-[state=active]:bg-purple-500/20 py-3">
                <Star className="w-4 h-4 mr-2" />
                Solar System
              </TabsTrigger>
              <TabsTrigger value="satellites" className="data-[state=active]:bg-orange-500/20 py-3">
                <Satellite className="w-4 h-4 mr-2" />
                Satellites
              </TabsTrigger>
            </TabsList>

            <TabsContent value="flights" className="space-y-6 mt-0">
              <RealFlightControls
                onRegionChange={(region) => setFlightDataOptions((prev) => ({ ...prev, region }))}
                onLimitChange={(limit) => setFlightDataOptions((prev) => ({ ...prev, limit }))}
                onAutoUpdateChange={(autoUpdate) => setFlightDataOptions((prev) => ({ ...prev, autoUpdate }))}
                onMockDataToggle={(useMockData) => setFlightDataOptions((prev) => ({ ...prev, useMockData }))}
                onRefresh={refreshFlights}
                loading={realDataLoading}
                error={realDataError}
                warning={realDataWarning}
                stats={flightStats}
                lastUpdate={flightLastUpdate}
                autoUpdate={flightDataOptions.autoUpdate}
                dataSource={flightDataSource}
                useMockData={flightDataOptions.useMockData}
              />

              {/* Flight Map Controls with Better Spacing */}
              <div className="bg-slate-900/90 backdrop-blur-md border border-cyan-500/30 rounded-lg p-4 shadow-lg shadow-cyan-500/10">
                <h3 className="text-sm font-medium text-gray-300 mb-3">Map Controls</h3>
                <div className="space-y-3">
                  <Button
                    onClick={() => setZoom(Math.min(3, zoom + 0.2))}
                    className="w-full bg-slate-800 hover:bg-cyan-600 text-white transition-all duration-200 py-2"
                  >
                    Zoom In (+)
                  </Button>
                  <Button
                    onClick={() => setZoom(Math.max(0.5, zoom - 0.2))}
                    className="w-full bg-slate-800 hover:bg-cyan-600 text-white transition-all duration-200 py-2"
                  >
                    Zoom Out (-)
                  </Button>
                  <Button
                    onClick={() => {
                      setZoom(1)
                      setPan({ x: 0, y: 0 })
                    }}
                    className="w-full bg-slate-800 hover:bg-cyan-600 text-white transition-all duration-200 py-2"
                  >
                    Reset View
                  </Button>
                </div>
              </div>

              <div className="bg-slate-900/90 backdrop-blur-md border border-cyan-500/30 rounded-lg p-4 shadow-lg shadow-cyan-500/10">
                <h3 className="text-sm font-medium text-gray-300 mb-3">Display Options</h3>
                <div className="space-y-3">
                  <Button
                    onClick={() => setShowWeather(!showWeather)}
                    className={cn(
                      "w-full bg-slate-800 hover:bg-blue-600 text-white transition-all duration-200 py-2",
                      showWeather && "bg-blue-600 shadow-lg shadow-blue-500/20",
                    )}
                  >
                    <Cloud className="w-4 h-4 mr-2" />
                    Weather Overlay
                  </Button>
                  <Button
                    onClick={() => setShowTrails(!showTrails)}
                    className={cn(
                      "w-full bg-slate-800 hover:bg-purple-600 text-white transition-all duration-200 py-2",
                      showTrails && "bg-purple-600 shadow-lg shadow-purple-500/20",
                    )}
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Flight Trails
                  </Button>
                </div>
              </div>

              <div className="bg-slate-900/90 backdrop-blur-md border border-cyan-500/30 rounded-lg p-4 shadow-lg shadow-cyan-500/10">
                <h3 className="text-sm font-medium text-gray-300 mb-3">Radar Mode</h3>
                <div className="space-y-2">
                  {["standard", "enhanced", "military"].map((mode) => (
                    <Button
                      key={mode}
                      onClick={() => setRadarMode(mode as any)}
                      className={cn(
                        "w-full text-sm py-2 transition-all duration-200",
                        radarMode === mode
                          ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/20"
                          : "bg-slate-800 hover:bg-slate-700 text-gray-300",
                      )}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)} Radar
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="solar" className="space-y-6 mt-0">
              <SolarSystemControls
                onBodyTypeChange={(type) => setSolarSystemOptions((prev) => ({ ...prev, bodyType: type }))}
                onAutoUpdateChange={(autoUpdate) => setSolarSystemOptions((prev) => ({ ...prev, autoUpdate }))}
                onMockDataToggle={(useMockData) => setSolarSystemOptions((prev) => ({ ...prev, useMockData }))}
                onRefresh={refreshSolarSystem}
                loading={solarDataLoading}
                error={solarDataError}
                warning={solarDataWarning}
                stats={solarStats}
                lastUpdate={solarLastUpdate}
                autoUpdate={solarSystemOptions.autoUpdate}
                dataSource={solarDataSource}
                useMockData={solarSystemOptions.useMockData}
              />
            </TabsContent>

            <TabsContent value="satellites" className="space-y-6 mt-0">
              <SatelliteControls
                onLocationChange={(lat, lng, alt) =>
                  setSatelliteOptions((prev) => ({ ...prev, observerLat: lat, observerLng: lng, observerAlt: alt }))
                }
                onSearchRadiusChange={(radius) => setSatelliteOptions((prev) => ({ ...prev, searchRadius: radius }))}
                onCategoryChange={(categoryId) => setSatelliteOptions((prev) => ({ ...prev, categoryId }))}
                onAutoUpdateChange={(autoUpdate) => setSatelliteOptions((prev) => ({ ...prev, autoUpdate }))}
                onMockDataToggle={(useMockData) => setSatelliteOptions((prev) => ({ ...prev, useMockData }))}
                onRefresh={refreshSatellites}
                loading={satelliteLoading}
                error={satelliteError}
                warning={satelliteWarning}
                stats={{
                  count: satellites.length,
                  transactionCount,
                }}
                lastUpdate={satelliteLastUpdate}
                autoUpdate={satelliteOptions.autoUpdate}
                categoryName={categoryName}
                observerLocation={{
                  lat: satelliteOptions.observerLat,
                  lng: satelliteOptions.observerLng,
                  alt: satelliteOptions.observerAlt,
                }}
                searchRadius={satelliteOptions.searchRadius}
                dataSource={satelliteDataSource}
                useMockData={satelliteOptions.useMockData}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Content Area with Enhanced Spacing */}
        <div className="flex-1 relative">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsContent value="flights" className="h-full m-0">
              {/* Flight Map */}
              <div
                ref={mapRef}
                className="relative w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden cursor-move"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
              >
                {/* Enhanced Grid Background */}
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage: `
                      radial-gradient(circle at 1px 1px, rgba(34, 211, 238, 0.4) 1px, transparent 0),
                      linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: "50px 50px, 50px 50px, 50px 50px",
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  }}
                />

                {/* Enhanced Radar Scanner */}
                <RadarScanner mode={radarMode} zoom={zoom} pan={pan} />

                {/* Airport Markers */}
                <div
                  className="absolute inset-0"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  }}
                >
                  {Object.entries(airports).map(([code, airport]) => (
                    <div
                      key={code}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                      style={{
                        left: `${((airport.longitude + 180) / 360) * 100}%`,
                        top: `${((90 - airport.latitude) / 180) * 100}%`,
                      }}
                    >
                      <div className="relative">
                        <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full border-2 border-white shadow-lg shadow-blue-500/50 animate-pulse"></div>
                        <div className="absolute inset-0 w-4 h-4 bg-blue-500/30 rounded-full animate-ping"></div>
                      </div>
                      <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-slate-900/95 backdrop-blur-md text-white text-xs px-4 py-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap border border-cyan-500/30 shadow-lg shadow-cyan-500/20">
                        <div className="font-semibold text-cyan-400 font-mono text-sm">{code}</div>
                        <div className="text-gray-300">{airport.city}</div>
                        <div className="text-xs text-gray-400">{airport.country}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Weather Overlay */}
                {showWeather && <WeatherOverlay zoom={zoom} pan={pan} />}

                {/* Aircraft Icons with Enhanced Flight Paths and Trails */}
                <div
                  className="absolute inset-0"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  }}
                >
                  {filteredAircraft.map((ac) => (
                    <div key={ac.id}>
                      {/* Aircraft Trail */}
                      {showTrails && <AircraftTrail trail={ac.trail} />}

                      {/* Enhanced Aircraft Icon */}
                      <div
                        className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group"
                        style={{
                          left: `${((ac.longitude + 180) / 360) * 100}%`,
                          top: `${((90 - ac.latitude) / 180) * 100}%`,
                          transform: `translate(-50%, -50%) rotate(${ac.heading}deg) scale(${zoom})`,
                        }}
                        onClick={() => setSelectedAircraft(ac)}
                      >
                        <div className="relative">
                          {/* Aircraft Shadow/Glow */}
                          <div
                            className={cn(
                              "absolute inset-0 w-8 h-8 rounded-full blur-sm opacity-50 animate-pulse",
                              ac.status === "En Route"
                                ? "bg-green-400"
                                : ac.status === "Landing"
                                  ? "bg-yellow-400"
                                  : ac.status === "Takeoff"
                                    ? "bg-blue-400"
                                    : ac.status === "Taxiing"
                                      ? "bg-orange-400"
                                      : ac.status === "Boarding"
                                        ? "bg-purple-400"
                                        : "bg-red-400",
                            )}
                          ></div>

                          {/* Aircraft Icon */}
                          <Plane
                            className={cn(
                              "w-6 h-6 transition-all duration-300 group-hover:scale-125 relative z-10 drop-shadow-lg",
                              ac.status === "En Route"
                                ? "text-green-400"
                                : ac.status === "Landing"
                                  ? "text-yellow-400"
                                  : ac.status === "Takeoff"
                                    ? "text-blue-400"
                                    : ac.status === "Taxiing"
                                      ? "text-orange-400"
                                      : ac.status === "Boarding"
                                        ? "text-purple-400"
                                        : "text-red-400",
                            )}
                          />

                          {/* Enhanced Tooltip */}
                          <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 bg-slate-900/95 backdrop-blur-md text-white text-xs px-4 py-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap border border-cyan-500/30 shadow-lg shadow-cyan-500/20">
                            <div className="font-semibold text-cyan-400 font-mono">{ac.callsign}</div>
                            <div className="text-white font-mono">{ac.altitude.toLocaleString()}ft</div>
                            <div className="text-gray-300">{ac.status}</div>
                            <div className="text-xs text-gray-400 font-mono">
                              {ac.origin} → {ac.destination}
                            </div>
                            <div className="text-xs text-cyan-300 font-mono">{ac.speed.toFixed(0)} kts</div>
                            {ac.country && <div className="text-xs text-purple-300">{ac.country}</div>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="solar" className="h-full m-0 p-8 overflow-y-auto">
              <SolarSystemVisualization
                bodies={solarBodies}
                onBodySelect={setSelectedSolarBody}
                selectedBody={selectedSolarBody}
              />
            </TabsContent>

            <TabsContent value="satellites" className="h-full m-0 p-8 overflow-y-auto">
              <SatelliteVisualization
                satellites={satellites}
                onSatelliteSelect={setSelectedSatellite}
                selectedSatellite={selectedSatellite}
                observerLocation={{
                  lat: satelliteOptions.observerLat,
                  lng: satelliteOptions.observerLng,
                  alt: satelliteOptions.observerAlt,
                }}
                categoryName={categoryName}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Enhanced Aircraft Details Modal */}
      {selectedAircraft && (
        <EnhancedAircraftDetails aircraft={selectedAircraft} onClose={() => setSelectedAircraft(null)} />
      )}
    </div>
  )
}
