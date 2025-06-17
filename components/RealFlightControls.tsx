"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  RefreshCw,
  Globe,
  Satellite,
  Clock,
  Database,
  AlertCircle,
  Wifi,
  AlertTriangle,
  TestTube,
  WifiOff,
  CheckCircle,
  Zap,
} from "lucide-react"

interface RealFlightControlsProps {
  onRegionChange: (region: string) => void
  onLimitChange: (limit: number) => void
  onAutoUpdateChange: (enabled: boolean) => void
  onMockDataToggle: (enabled: boolean) => void
  onRefresh: () => void
  loading: boolean
  error: string | null
  warning: string | null
  stats: {
    total: number
    processed: number
    cached: boolean
  }
  lastUpdate: number
  autoUpdate: boolean
  dataSource: string
  useMockData: boolean
}

export const RealFlightControls = ({
  onRegionChange,
  onLimitChange,
  onAutoUpdateChange,
  onMockDataToggle,
  onRefresh,
  loading,
  error,
  warning,
  stats,
  lastUpdate,
  autoUpdate,
  dataSource,
  useMockData,
}: RealFlightControlsProps) => {
  const [selectedRegion, setSelectedRegion] = useState("global")
  const [flightLimit, setFlightLimit] = useState([500])

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region)
    onRegionChange(region)
  }

  const handleLimitChange = (value: number[]) => {
    setFlightLimit(value)
    onLimitChange(value[0])
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
      case "opensky":
        return {
          icon: Satellite,
          label: "Live OpenSky",
          color: "text-green-400",
          description: "Real-time flight data",
          status: "excellent",
        }
      case "cache":
        return {
          icon: Database,
          label: "Cached Data",
          color: "text-blue-400",
          description: "Recently fetched data",
          status: "good",
        }
      case "mock":
        return {
          icon: TestTube,
          label: "Demo Mode",
          color: "text-purple-400",
          description: "Enhanced realistic simulation",
          status: "demo",
        }
      case "fallback":
        return {
          icon: Zap,
          label: "Smart Fallback",
          color: "text-yellow-400",
          description: "Realistic backup data",
          status: "fallback",
        }
      case "emergency_fallback":
        return {
          icon: AlertCircle,
          label: "Emergency Mode",
          color: "text-red-400",
          description: "System error recovery",
          status: "emergency",
        }
      default:
        return {
          icon: WifiOff,
          label: "Unknown",
          color: "text-gray-400",
          description: "Unknown data source",
          status: "unknown",
        }
    }
  }

  const sourceInfo = getDataSourceInfo(dataSource)
  const SourceIcon = sourceInfo.icon

  const getSystemStatus = () => {
    if (error) return { icon: AlertCircle, label: "System Error", color: "text-red-400" }
    if (dataSource === "opensky") return { icon: CheckCircle, label: "Live Data", color: "text-green-400" }
    if (dataSource === "mock") return { icon: TestTube, label: "Demo Mode", color: "text-purple-400" }
    if (dataSource === "fallback") return { icon: Zap, label: "Backup Data", color: "text-yellow-400" }
    if (warning) return { icon: AlertTriangle, label: "Limited Service", color: "text-yellow-400" }
    return { icon: CheckCircle, label: "Operational", color: "text-green-400" }
  }

  const systemStatus = getSystemStatus()
  const StatusIcon = systemStatus.icon

  return (
    <Card className="bg-slate-900/90 backdrop-blur-md border-cyan-500/30 shadow-lg shadow-cyan-500/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-cyan-400 flex items-center">
          <Globe className="w-5 h-5 mr-2" />
          Flight Data Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* System Status Overview */}
        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-600/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <StatusIcon className={`w-4 h-4 ${systemStatus.color}`} />
              <span className="text-sm font-semibold text-gray-300">System Status</span>
            </div>
            <span className={`text-xs font-mono ${systemStatus.color}`}>{systemStatus.label}</span>
          </div>
          <div className="flex items-center space-x-2">
            <SourceIcon className={`w-4 h-4 ${sourceInfo.color}`} />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-300">{sourceInfo.label}</div>
              <div className="text-xs text-gray-400">{sourceInfo.description}</div>
            </div>
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
                  OpenSky Network is temporarily unavailable. Using enhanced realistic flight data.
                </div>
                <div className="text-gray-400 text-xs space-y-1">
                  <div>• Realistic flight paths with authentic airline routes</div>
                  <div>• Accurate aircraft types and registration numbers</div>
                  <div>• Simulated real-world flight operations</div>
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
                  Displaying {stats.processed.toLocaleString()} simulated aircraft with realistic flight patterns
                </div>
                <div className="text-gray-400 text-xs space-y-1">
                  <div>• Major airlines with authentic callsigns and routes</div>
                  <div>• Realistic aircraft performance and flight phases</div>
                  <div>• Perfect for testing and demonstration purposes</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {dataSource === "opensky" && (
          <div className="bg-green-500/10 border border-green-500/30 rounded p-3">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-green-400 text-xs font-mono mb-1">✅ Live Data Connected</div>
                <div className="text-green-300 text-xs mb-2">Receiving real-time flight data from OpenSky Network</div>
                <div className="text-gray-400 text-xs">
                  Showing {stats.processed.toLocaleString()} of {stats.total.toLocaleString()} tracked aircraft
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded p-3">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-red-400 text-xs font-mono mb-1">🚫 System Error</div>
                <div className="text-red-300 text-xs mb-2">{error}</div>
                <div className="text-gray-400 text-xs">
                  The system has automatically switched to emergency backup data
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Flight Statistics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/50 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <Globe className="w-4 h-4 text-cyan-400" />
              <div className="text-xs text-gray-400">Total Aircraft</div>
            </div>
            <div className="font-mono text-xl text-cyan-400">{stats.total.toLocaleString()}</div>
            <div className="text-xs text-gray-500">
              {stats.cached ? "Cached" : "Live"} • {sourceInfo.description}
            </div>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <Satellite className="w-4 h-4 text-cyan-400" />
              <div className="text-xs text-gray-400">Displayed</div>
            </div>
            <div className="font-mono text-xl text-cyan-400">{stats.processed.toLocaleString()}</div>
            <div className="text-xs text-gray-500">
              {stats.total > 0 ? ((stats.processed / stats.total) * 100).toFixed(1) : 0}% of total
            </div>
          </div>
        </div>

        {/* Data Mode Toggle */}
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
              ? "Using enhanced simulated flight data with realistic airline operations"
              : "Attempting live data from OpenSky Network (may fallback to simulation)"}
          </div>
        </div>

        {/* Region Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 flex items-center">
            <Globe className="w-4 h-4 mr-2" />
            Coverage Region
          </label>
          <Select value={selectedRegion} onValueChange={handleRegionChange}>
            <SelectTrigger className="bg-slate-800 border-slate-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="global">🌍 Global Coverage</SelectItem>
              <SelectItem value="europe">🇪🇺 Europe</SelectItem>
              <SelectItem value="north-america">🇺🇸 North America</SelectItem>
              <SelectItem value="asia">🌏 Asia Pacific</SelectItem>
              <SelectItem value="oceania">🇦🇺 Oceania</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Aircraft Limit */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-300 flex items-center">
              <Satellite className="w-4 h-4 mr-2" />
              Aircraft Limit
            </label>
            <span className="text-sm font-mono text-cyan-400 bg-slate-800/50 px-2 py-1 rounded">{flightLimit[0]}</span>
          </div>
          <Slider
            value={flightLimit}
            onValueChange={handleLimitChange}
            max={2000}
            min={100}
            step={100}
            className="w-full"
          />
          <div className="text-xs text-gray-500">Higher limits provide more aircraft but may impact performance</div>
        </div>

        {/* Auto Update Toggle */}
        <div className="flex items-center justify-between bg-slate-800/30 p-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <Wifi className={autoUpdate ? "w-4 h-4 text-green-400" : "w-4 h-4 text-gray-400"} />
            <div>
              <label className="text-sm font-medium text-gray-300">Auto Update</label>
              <div className="text-xs text-gray-400">Refresh data every 30 seconds</div>
            </div>
          </div>
          <Switch checked={autoUpdate} onCheckedChange={onAutoUpdateChange} />
        </div>

        {/* Last Update Info */}
        <div className="flex items-center justify-between text-xs text-gray-400 bg-slate-800/20 p-2 rounded">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Last Update:</span>
          </div>
          <span className="font-mono">{formatLastUpdate(lastUpdate)}</span>
        </div>

        {/* Refresh Button */}
        <Button
          onClick={onRefresh}
          disabled={loading}
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white transition-all duration-200 shadow-lg"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Updating..." : "Refresh Data"}
        </Button>

        {/* Data Source Information */}
        <div className="text-xs text-gray-500 text-center bg-slate-800/20 p-3 rounded-lg">
          <div className="font-semibold mb-2 text-gray-400">Data Source Information</div>
          <div className="space-y-1">
            {dataSource === "opensky" ? (
              <>
                <div>✈️ Live data from OpenSky Network</div>
                <div>🌍 Real-time ADS-B flight tracking</div>
                <div>⏱️ Updates every 30 seconds</div>
              </>
            ) : dataSource === "mock" ? (
              <>
                <div>🧪 Enhanced demo mode active</div>
                <div>✈️ Realistic airline operations simulation</div>
                <div>🎯 Perfect for testing and demonstration</div>
              </>
            ) : (
              <>
                <div>⚡ Smart fallback system active</div>
                <div>✈️ Realistic flight data simulation</div>
                <div>🔄 Automatic retry for live data</div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
