"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import {
  RefreshCw,
  Satellite,
  Clock,
  MapPin,
  Search,
  AlertCircle,
  CheckCircle,
  Zap,
  Radar,
  TestTube,
} from "lucide-react"

interface SatelliteControlsProps {
  onLocationChange: (lat: number, lng: number, alt: number) => void
  onSearchRadiusChange: (radius: number) => void
  onCategoryChange: (categoryId: number) => void
  onAutoUpdateChange: (enabled: boolean) => void
  onMockDataToggle: (enabled: boolean) => void
  onRefresh: () => void
  loading: boolean
  error: string | null
  warning: string | null
  stats: {
    count: number
    transactionCount: number
  }
  lastUpdate: number
  autoUpdate: boolean
  categoryName: string
  observerLocation: {
    lat: number
    lng: number
    alt: number
  }
  searchRadius: number
  dataSource: string
  useMockData: boolean
}

export const SatelliteControls = ({
  onLocationChange,
  onSearchRadiusChange,
  onCategoryChange,
  onAutoUpdateChange,
  onMockDataToggle,
  onRefresh,
  loading,
  error,
  warning,
  stats,
  lastUpdate,
  autoUpdate,
  categoryName,
  observerLocation,
  searchRadius,
  dataSource,
  useMockData,
}: SatelliteControlsProps) => {
  const [selectedCategory, setSelectedCategory] = useState("0")
  const [radiusValue, setRadiusValue] = useState([searchRadius])
  const [locationInputs, setLocationInputs] = useState({
    lat: observerLocation.lat.toString(),
    lng: observerLocation.lng.toString(),
    alt: observerLocation.alt.toString(),
  })

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId)
    onCategoryChange(Number.parseInt(categoryId))
  }

  const handleRadiusChange = (value: number[]) => {
    setRadiusValue(value)
    onSearchRadiusChange(value[0])
  }

  const handleLocationUpdate = () => {
    const lat = Number.parseFloat(locationInputs.lat)
    const lng = Number.parseFloat(locationInputs.lng)
    const alt = Number.parseFloat(locationInputs.alt)

    if (!isNaN(lat) && !isNaN(lng) && !isNaN(alt)) {
      onLocationChange(lat, lng, alt)
    }
  }

  const formatLastUpdate = (timestamp: number) => {
    if (!timestamp) return "Never"
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)

    if (minutes > 0) {
      return `${minutes}m ${seconds}s ago`
    }
    return `${seconds}s ago`
  }

  const getDataSourceInfo = (source: string) => {
    switch (source) {
      case "n2yo":
        return { icon: Satellite, label: "Live N2YO", color: "text-green-400" }
      case "cache":
        return { icon: Radar, label: "Cached Data", color: "text-blue-400" }
      case "mock":
        return { icon: TestTube, label: "Demo Mode", color: "text-purple-400" }
      case "fallback":
        return { icon: Zap, label: "Smart Fallback", color: "text-yellow-400" }
      case "emergency_fallback":
        return { icon: AlertCircle, label: "Emergency Mode", color: "text-red-400" }
      default:
        return { icon: AlertCircle, label: "Unknown", color: "text-gray-400" }
    }
  }

  const sourceInfo = getDataSourceInfo(dataSource)
  const SourceIcon = sourceInfo.icon

  const popularLocations = [
    { name: "San Francisco, CA", lat: 37.7749, lng: -122.4194, alt: 0 },
    { name: "New York, NY", lat: 40.7128, lng: -74.006, alt: 0 },
    { name: "London, UK", lat: 51.5074, lng: -0.1278, alt: 0 },
    { name: "Tokyo, Japan", lat: 35.6762, lng: 139.6503, alt: 0 },
    { name: "Sydney, Australia", lat: -33.8688, lng: 151.2093, alt: 0 },
  ]

  return (
    <Card className="bg-slate-900/90 backdrop-blur-md border-cyan-500/30 shadow-lg shadow-cyan-500/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-cyan-400 flex items-center">
          <Satellite className="w-5 h-5 mr-2" />
          Satellite Tracking Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Indicators */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {error ? (
              <AlertCircle className="w-4 h-4 text-red-400" />
            ) : (
              <CheckCircle className="w-4 h-4 text-green-400" />
            )}
            <span className="text-sm font-mono">{error ? "Error" : "Connected"}</span>
          </div>
          <div className="flex items-center space-x-2">
            <SourceIcon className={`w-4 h-4 ${sourceInfo.color}`} />
            <span className={`text-xs font-mono ${sourceInfo.color}`}>{sourceInfo.label}</span>
          </div>
        </div>

        {/* Enhanced Status Messages */}
        {dataSource === "fallback" && !useMockData && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3">
            <div className="flex items-start space-x-2">
              <Zap className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-yellow-400 text-xs font-mono mb-1">⚡ Smart Fallback Active</div>
                <div className="text-yellow-300 text-xs mb-2">
                  N2YO API is temporarily unavailable. Using realistic satellite data.
                </div>
                <div className="text-gray-400 text-xs space-y-1">
                  <div>• Realistic satellite positions and orbital data</div>
                  <div>• Accurate altitude ranges for different satellite types</div>
                  <div>• Simulated real-world satellite operations</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {useMockData && (
          <div className="bg-purple-500/10 border border-purple-500/30 rounded p-3">
            <div className="flex items-start space-x-2">
              <TestTube className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-purple-400 text-xs font-mono mb-1">🧪 Demo Mode Active</div>
                <div className="text-purple-300 text-xs mb-2">
                  Displaying {stats.count.toLocaleString()} simulated satellites with realistic orbital patterns
                </div>
                <div className="text-gray-400 text-xs space-y-1">
                  <div>• Category-specific satellite types and names</div>
                  <div>• Realistic altitude ranges and positions</div>
                  <div>• Perfect for testing and demonstration purposes</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {dataSource === "n2yo" && (
          <div className="bg-green-500/10 border border-green-500/30 rounded p-3">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-green-400 text-xs font-mono mb-1">✅ Live Data Connected</div>
                <div className="text-green-300 text-xs mb-2">Receiving real-time satellite data from N2YO.com</div>
                <div className="text-gray-400 text-xs">
                  Showing {stats.count.toLocaleString()} satellites • {stats.transactionCount} API calls used
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded p-2">
            <div className="text-red-400 text-xs font-mono">{error}</div>
          </div>
        )}

        {/* Warning Message */}
        {warning && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-2">
            <div className="text-yellow-400 text-xs font-mono">{warning}</div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-slate-800/50 p-2 rounded">
            <div className="text-gray-400">Satellites</div>
            <div className="font-mono text-cyan-400">{stats.count.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/50 p-2 rounded">
            <div className="text-gray-400">API Calls</div>
            <div className="font-mono text-cyan-400">{stats.transactionCount}</div>
          </div>
        </div>

        {/* Mock Data Toggle */}
        <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-600/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <TestTube className={useMockData ? "w-4 h-4 text-purple-400" : "w-4 h-4 text-gray-400"} />
              <label className="text-sm font-medium text-gray-300">Demo Mode</label>
            </div>
            <Switch checked={useMockData} onCheckedChange={onMockDataToggle} />
          </div>
          <div className="text-xs text-gray-400">
            {useMockData
              ? "Using enhanced simulated satellite data with realistic orbital mechanics"
              : "Attempting live data from N2YO.com (may fallback to simulation)"}
          </div>
        </div>

        {/* Observer Location */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-300 flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            Observer Location
          </label>

          {/* Quick Location Selector */}
          <Select
            onValueChange={(value) => {
              const location = popularLocations.find((loc) => loc.name === value)
              if (location) {
                setLocationInputs({
                  lat: location.lat.toString(),
                  lng: location.lng.toString(),
                  alt: location.alt.toString(),
                })
                onLocationChange(location.lat, location.lng, location.alt)
              }
            }}
          >
            <SelectTrigger className="bg-slate-800 border-slate-600">
              <SelectValue placeholder="Quick select location..." />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              {popularLocations.map((location) => (
                <SelectItem key={location.name} value={location.name}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Manual Location Input */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-gray-400">Latitude</label>
              <Input
                type="number"
                step="0.0001"
                value={locationInputs.lat}
                onChange={(e) => setLocationInputs((prev) => ({ ...prev, lat: e.target.value }))}
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="37.7749"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Longitude</label>
              <Input
                type="number"
                step="0.0001"
                value={locationInputs.lng}
                onChange={(e) => setLocationInputs((prev) => ({ ...prev, lng: e.target.value }))}
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="-122.4194"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Altitude (m)</label>
              <Input
                type="number"
                value={locationInputs.alt}
                onChange={(e) => setLocationInputs((prev) => ({ ...prev, alt: e.target.value }))}
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="0"
              />
            </div>
          </div>

          <Button onClick={handleLocationUpdate} className="w-full bg-blue-600 hover:bg-blue-700">
            <MapPin className="w-4 h-4 mr-2" />
            Update Location
          </Button>
        </div>

        {/* Search Radius */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-300 flex items-center">
              <Search className="w-4 h-4 mr-2" />
              Search Radius
            </label>
            <span className="text-sm font-mono text-cyan-400 bg-slate-800/50 px-2 py-1 rounded">{radiusValue[0]}°</span>
          </div>
          <Slider value={radiusValue} onValueChange={handleRadiusChange} max={90} min={0} step={5} className="w-full" />
          <div className="text-xs text-gray-500">0° = directly overhead, 90° = entire horizon</div>
        </div>

        {/* Satellite Category */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 flex items-center">
            <Satellite className="w-4 h-4 mr-2" />
            Satellite Category
          </label>
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="bg-slate-800 border-slate-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600 max-h-60">
              <SelectItem value="0">🌍 All Categories</SelectItem>
              <SelectItem value="1">✨ Brightest</SelectItem>
              <SelectItem value="2">🚀 ISS</SelectItem>
              <SelectItem value="3">🌤️ Weather</SelectItem>
              <SelectItem value="20">📡 GPS Operational</SelectItem>
              <SelectItem value="52">🛰️ Starlink</SelectItem>
              <SelectItem value="18">📻 Amateur Radio</SelectItem>
              <SelectItem value="32">📦 CubeSats</SelectItem>
              <SelectItem value="15">📱 Iridium</SelectItem>
              <SelectItem value="53">🌐 OneWeb</SelectItem>
              <SelectItem value="30">🔒 Military</SelectItem>
              <SelectItem value="26">🔬 Space & Earth Science</SelectItem>
              <SelectItem value="29">🎓 Education</SelectItem>
              <SelectItem value="19">🧪 Experimental</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-xs text-gray-500">Currently showing: {categoryName}</div>
        </div>

        {/* Auto Update Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className={autoUpdate ? "w-4 h-4 text-green-400" : "w-4 h-4 text-gray-400"} />
            <label className="text-sm font-medium text-gray-300">Auto Update</label>
          </div>
          <Switch checked={autoUpdate} onCheckedChange={onAutoUpdateChange} />
        </div>

        {/* Last Update */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Last Update:</span>
          </div>
          <span className="font-mono">{formatLastUpdate(lastUpdate)}</span>
        </div>

        {/* Refresh Button */}
        <Button onClick={onRefresh} disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Updating..." : "Refresh Data"}
        </Button>

        {/* API Information */}
        <div className="text-xs text-gray-500 text-center">
          <div>Data provided by N2YO.com</div>
          <div>Updates every 60 seconds</div>
          <div>API limit: 100 calls/hour</div>
        </div>
      </CardContent>
    </Card>
  )
}
