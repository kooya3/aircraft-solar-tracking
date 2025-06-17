"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Satellite,
  Search,
  MapPin,
  Ruler,
  Calendar,
  Orbit,
  ExternalLink,
  Filter,
  SortAsc,
  SortDesc,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SatelliteAbove {
  satid: number
  satname: string
  intDesignator: string
  launchDate: string
  satlat: number
  satlng: number
  satalt: number
}

interface SatelliteVisualizationProps {
  satellites: SatelliteAbove[]
  onSatelliteSelect: (satellite: SatelliteAbove) => void
  selectedSatellite: SatelliteAbove | null
  observerLocation: {
    lat: number
    lng: number
    alt: number
  }
  categoryName: string
}

type SortField = "name" | "altitude" | "distance" | "launchDate"
type SortOrder = "asc" | "desc"

export const SatelliteVisualization = ({
  satellites,
  onSatelliteSelect,
  selectedSatellite,
  observerLocation,
  categoryName,
}: SatelliteVisualizationProps) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>("altitude")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  // Calculate distance from observer to satellite
  const calculateDistance = (sat: SatelliteAbove) => {
    const R = 6371 // Earth's radius in km
    const dLat = ((sat.satlat - observerLocation.lat) * Math.PI) / 180
    const dLng = ((sat.satlng - observerLocation.lng) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((observerLocation.lat * Math.PI) / 180) *
        Math.cos((sat.satlat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const groundDistance = R * c

    // Calculate 3D distance including altitude
    const altitudeDiff = sat.satalt - observerLocation.alt / 1000
    return Math.sqrt(groundDistance * groundDistance + altitudeDiff * altitudeDiff)
  }

  // Filter and sort satellites
  const processedSatellites = useMemo(() => {
    const filtered = satellites.filter(
      (sat) =>
        sat.satname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sat.intDesignator.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sat.satid.toString().includes(searchQuery),
    )

    // Add calculated distance
    const withDistance = filtered.map((sat) => ({
      ...sat,
      distance: calculateDistance(sat),
    }))

    // Sort
    withDistance.sort((a, b) => {
      let aValue: number | string
      let bValue: number | string

      switch (sortField) {
        case "name":
          aValue = a.satname.toLowerCase()
          bValue = b.satname.toLowerCase()
          break
        case "altitude":
          aValue = a.satalt
          bValue = b.satalt
          break
        case "distance":
          aValue = a.distance
          bValue = b.distance
          break
        case "launchDate":
          aValue = new Date(a.launchDate).getTime()
          bValue = new Date(b.launchDate).getTime()
          break
        default:
          return 0
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      return sortOrder === "asc" ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number)
    })

    return withDistance
  }, [satellites, searchQuery, sortField, sortOrder, observerLocation])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("desc")
    }
  }

  const formatDistance = (distance: number) => {
    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(1)}k km`
    }
    return `${distance.toFixed(0)} km`
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return dateString
    }
  }

  const getSatelliteIcon = (satname: string) => {
    const name = satname.toLowerCase()
    if (name.includes("starlink")) return "🛰️"
    if (name.includes("iss") || name.includes("space station")) return "🚀"
    if (name.includes("gps")) return "📍"
    if (name.includes("weather") || name.includes("noaa")) return "🌤️"
    if (name.includes("amateur") || name.includes("oscar")) return "📻"
    if (name.includes("cubesat")) return "📦"
    if (name.includes("military")) return "🔒"
    return "🛰️"
  }

  return (
    <div className="space-y-8">
      {/* Search and Filter Controls */}
      <Card className="bg-slate-900/90 backdrop-blur-md border-cyan-500/30">
        <CardHeader className="pb-4 p-8">
          <CardTitle className="text-xl font-semibold text-cyan-400 flex items-center justify-between">
            <div className="flex items-center">
              <Satellite className="w-6 h-6 mr-3" />
              Satellite Search & Filter
            </div>
            <Badge variant="outline" className="text-cyan-400 border-cyan-400 px-3 py-1">
              {processedSatellites.length} satellites
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-8 pt-0">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name, designator, or NORAD ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-slate-800 border-slate-600 text-white py-3"
            />
          </div>

          {/* Sort Controls */}
          <div className="flex flex-wrap gap-3">
            <span className="text-sm text-gray-400 flex items-center py-2">
              <Filter className="w-4 h-4 mr-2" />
              Sort by:
            </span>
            {[
              { field: "name" as SortField, label: "Name" },
              { field: "altitude" as SortField, label: "Altitude" },
              { field: "distance" as SortField, label: "Distance" },
              { field: "launchDate" as SortField, label: "Launch Date" },
            ].map(({ field, label }) => (
              <Button
                key={field}
                variant="ghost"
                size="sm"
                onClick={() => handleSort(field)}
                className={cn(
                  "text-xs px-3 py-2",
                  sortField === field ? "bg-cyan-600 text-white" : "text-gray-400 hover:text-white",
                )}
              >
                {label}
                {sortField === field &&
                  (sortOrder === "asc" ? <SortAsc className="w-3 h-3 ml-2" /> : <SortDesc className="w-3 h-3 ml-2" />)}
              </Button>
            ))}
          </div>

          {/* Category Info */}
          <div className="text-sm text-gray-400 bg-slate-800/30 p-4 rounded-lg">
            Showing satellites in category: <span className="text-cyan-400 font-medium">{categoryName}</span>
          </div>
        </CardContent>
      </Card>

      {/* Satellite List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {processedSatellites.map((satellite) => (
          <Card
            key={satellite.satid}
            className={cn(
              "bg-slate-800/50 border-slate-600/50 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-cyan-500/10",
              selectedSatellite?.satid === satellite.satid && "border-cyan-500 bg-cyan-500/10",
            )}
            onClick={() => onSatelliteSelect(satellite)}
          >
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{getSatelliteIcon(satellite.satname)}</span>
                    <div>
                      <h3 className="font-semibold text-white text-sm leading-tight">{satellite.satname}</h3>
                      <p className="text-xs text-gray-400 font-mono mt-1">{satellite.intDesignator}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs text-cyan-400 border-cyan-400 px-2 py-1">
                    ID: {satellite.satid}
                  </Badge>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-700/30 p-3 rounded">
                    <div className="flex items-center text-gray-400 mb-2">
                      <Ruler className="w-3 h-3 mr-2" />
                      Altitude
                    </div>
                    <div className="font-mono text-cyan-400">{satellite.satalt.toFixed(0)} km</div>
                  </div>

                  <div className="bg-slate-700/30 p-3 rounded">
                    <div className="flex items-center text-gray-400 mb-2">
                      <MapPin className="w-3 h-3 mr-2" />
                      Distance
                    </div>
                    <div className="font-mono text-cyan-400">{formatDistance(satellite.distance)}</div>
                  </div>
                </div>

                {/* Position */}
                <div className="bg-slate-700/30 p-3 rounded">
                  <div className="flex items-center text-gray-400 mb-2 text-xs">
                    <Orbit className="w-3 h-3 mr-2" />
                    Current Position
                  </div>
                  <div className="font-mono text-xs text-cyan-400">
                    {satellite.satlat.toFixed(4)}°, {satellite.satlng.toFixed(4)}°
                  </div>
                </div>

                {/* Launch Date */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center text-gray-400">
                    <Calendar className="w-3 h-3 mr-2" />
                    Launched: {formatDate(satellite.launchDate)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-3 text-xs text-cyan-400 hover:text-cyan-300"
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(`https://www.n2yo.com/satellite/?s=${satellite.satid}`, "_blank")
                    }}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {processedSatellites.length === 0 && (
        <Card className="bg-slate-800/50 border-slate-600/50">
          <CardContent className="p-12 text-center">
            <Satellite className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-300 mb-3">No Satellites Found</h3>
            <p className="text-gray-400 mb-6">
              {searchQuery
                ? `No satellites match "${searchQuery}"`
                : "No satellites visible in the current search area"}
            </p>
            {searchQuery && (
              <Button onClick={() => setSearchQuery("")} variant="outline" className="text-cyan-400 border-cyan-400">
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
