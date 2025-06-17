"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { RefreshCw, Satellite, Clock, Database, AlertCircle, CheckCircle, TestTube, Star, Zap } from "lucide-react"

interface SolarSystemControlsProps {
  onBodyTypeChange: (type: string) => void
  onAutoUpdateChange: (enabled: boolean) => void
  onMockDataToggle: (enabled: boolean) => void
  onRefresh: () => void
  loading: boolean
  error: string | null
  warning: string | null
  stats: {
    total: number
    filtered: number
    cached: boolean
  }
  lastUpdate: number
  autoUpdate: boolean
  dataSource: string
  useMockData: boolean
}

export const SolarSystemControls = ({
  onBodyTypeChange,
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
}: SolarSystemControlsProps) => {
  const [selectedBodyType, setSelectedBodyType] = useState("all")

  const handleBodyTypeChange = (type: string) => {
    setSelectedBodyType(type)
    onBodyTypeChange(type)
  }

  const formatLastUpdate = (timestamp: number) => {
    if (!timestamp) return "Never"
    const diff = Date.now() - timestamp
    const hours = Math.floor(diff / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)

    if (hours > 0) {
      return `${hours}h ${minutes}m ago`
    }
    return `${minutes}m ago`
  }

  const getDataSourceInfo = (source: string) => {
    switch (source) {
      case "solar-system-api":
        return { icon: Satellite, label: "Live Solar API", color: "text-green-400" }
      case "cache":
        return { icon: Database, label: "Cached Data", color: "text-yellow-400" }
      case "mock":
        return { icon: TestTube, label: "Mock Data", color: "text-blue-400" }
      case "fallback":
        return { icon: AlertCircle, label: "Fallback Data", color: "text-orange-400" }
      case "emergency_fallback":
        return { icon: AlertCircle, label: "Emergency Data", color: "text-red-400" }
      default:
        return { icon: AlertCircle, label: "Unknown", color: "text-gray-400" }
    }
  }

  const sourceInfo = getDataSourceInfo(dataSource)
  const SourceIcon = sourceInfo.icon

  return (
    <Card className="bg-slate-900/90 backdrop-blur-md border-purple-500/30 shadow-lg shadow-purple-500/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-purple-400 flex items-center">
          <Star className="w-5 h-5 mr-2" />
          Solar System Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Indicators */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {error ? (
              <AlertCircle className="w-4 h-4 text-red-400" />
            ) : warning ? (
              <AlertCircle className="w-4 h-4 text-yellow-400" />
            ) : (
              <CheckCircle className="w-4 h-4 text-green-400" />
            )}
            <span className="text-sm font-mono">{error ? "Error" : warning ? "Warning" : "Connected"}</span>
          </div>
          <div className="flex items-center space-x-2">
            <SourceIcon className={`w-4 h-4 ${sourceInfo.color}`} />
            <span className={`text-xs font-mono ${sourceInfo.color}`}>{sourceInfo.label}</span>
          </div>
        </div>

        {/* Error/Warning Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded p-2">
            <div className="text-red-400 text-xs font-mono">{error}</div>
          </div>
        )}

        {warning && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-2">
            <div className="text-yellow-400 text-xs font-mono">{warning}</div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-slate-800/50 p-2 rounded">
            <div className="text-gray-400">Total Bodies</div>
            <div className="font-mono text-purple-400">{stats.total.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/50 p-2 rounded">
            <div className="text-gray-400">Displayed</div>
            <div className="font-mono text-purple-400">{stats.filtered.toLocaleString()}</div>
          </div>
        </div>

        {/* Mock Data Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TestTube className={useMockData ? "w-4 h-4 text-blue-400" : "w-4 h-4 text-gray-400"} />
            <label className="text-sm font-medium text-gray-300">Demo Mode</label>
          </div>
          <Switch checked={useMockData} onCheckedChange={onMockDataToggle} />
        </div>

        {/* Body Type Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Body Type</label>
          <Select value={selectedBodyType} onValueChange={handleBodyTypeChange} disabled={useMockData}>
            <SelectTrigger className="bg-slate-800 border-slate-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="all">🌌 All Bodies</SelectItem>
              <SelectItem value="planet">🪐 Planets</SelectItem>
              <SelectItem value="moon">🌙 Moons</SelectItem>
              <SelectItem value="asteroid">☄️ Asteroids</SelectItem>
              <SelectItem value="comet">💫 Comets</SelectItem>
              <SelectItem value="star">⭐ Stars</SelectItem>
            </SelectContent>
          </Select>
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
        <Button onClick={onRefresh} disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Updating..." : "Refresh Data"}
        </Button>

        {/* Data Source Info */}
        <div className="text-xs text-gray-500 text-center">
          <div>{useMockData ? "Demo mode with simulated data" : "Data provided by Solar System OpenData"}</div>
          <div>Updates every 24 hours</div>
        </div>
      </CardContent>
    </Card>
  )
}
