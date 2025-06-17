"use client"

import { useState, useEffect, useCallback } from "react"

interface SatelliteAbove {
  satid: number
  satname: string
  intDesignator: string
  launchDate: string
  satlat: number
  satlng: number
  satalt: number
}

interface SatelliteDataResponse {
  satellites: SatelliteAbove[]
  cached: boolean
  timestamp: number
  total: number
  source: string
  error?: string
  warning?: string
  transactionCount: number
  categoryName: string
}

interface UseSatelliteDataOptions {
  observerLat: number
  observerLng: number
  observerAlt: number
  searchRadius: number
  categoryId: number
  updateInterval?: number
  autoUpdate?: boolean
  useMockData?: boolean
}

const SATELLITE_CATEGORIES = {
  0: "All Categories",
  1: "Brightest",
  2: "ISS",
  3: "Weather",
  4: "NOAA",
  5: "GOES",
  6: "Earth Resources",
  7: "Search & Rescue",
  8: "Disaster Monitoring",
  9: "Tracking and Data Relay",
  10: "Geostationary",
  11: "Intelsat",
  12: "Gorizont",
  13: "Raduga",
  14: "Molniya",
  15: "Iridium",
  16: "Orbcomm",
  17: "Globalstar",
  18: "Amateur Radio",
  19: "Experimental",
  20: "GPS Operational",
  21: "Glonass Operational",
  22: "Galileo",
  23: "Satellite-Based Augmentation",
  24: "Navy Navigation",
  25: "Russian LEO Navigation",
  26: "Space & Earth Science",
  27: "Geodetic",
  28: "Engineering",
  29: "Education",
  30: "Military",
  31: "Radar Calibration",
  32: "CubeSats",
  33: "XM and Sirius",
  34: "TV",
  35: "Beidou Navigation",
  36: "Yaogan",
  37: "Westford Needles",
  38: "Parus",
  39: "Strela",
  40: "Gonets",
  41: "Tsiklon",
  42: "Tsikada",
  43: "O3B Networks",
  44: "Tselina",
  45: "Celestis",
  46: "IRNSS",
  47: "QZSS",
  48: "Flock",
  49: "Lemur",
  50: "GPS Constellation",
  51: "Glonass Constellation",
  52: "Starlink",
  53: "OneWeb",
  54: "Chinese Space Station",
  55: "Qianfan",
  56: "Kuiper",
}

export function useSatelliteData(options: UseSatelliteDataOptions) {
  const {
    observerLat,
    observerLng,
    observerAlt,
    searchRadius,
    categoryId,
    updateInterval = 60000, // 1 minute
    autoUpdate = true,
    useMockData = false,
  } = options

  const [satellites, setSatellites] = useState<SatelliteAbove[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<number>(0)
  const [transactionCount, setTransactionCount] = useState<number>(0)
  const [dataSource, setDataSource] = useState<string>("unknown")
  const [categoryName, setCategoryName] = useState<string>("Unknown")

  const fetchSatellites = useCallback(async () => {
    try {
      setError(null)
      setWarning(null)

      const params = new URLSearchParams({
        lat: observerLat.toString(),
        lng: observerLng.toString(),
        alt: observerAlt.toString(),
        radius: searchRadius.toString(),
        category: categoryId.toString(),
        ...(useMockData && { mock: "true" }),
      })

      console.log(`[useSatelliteData] Fetching satellites: ${params.toString()}`)

      const response = await fetch(`/api/satellites?${params}`, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: SatelliteDataResponse = await response.json()

      // Handle warnings (like fallback data)
      if (data.warning) {
        setWarning(data.warning)
        console.warn(`[useSatelliteData] Warning: ${data.warning}`)
      }

      // Handle errors (but still use the data if available)
      if (data.error && data.source !== "n2yo") {
        setError(`API Error: ${data.error}`)
        console.error(`[useSatelliteData] API Error: ${data.error}`)
      }

      setSatellites(data.satellites)
      setLastUpdate(data.timestamp)
      setDataSource(data.source)
      setTransactionCount(data.transactionCount)
      setCategoryName(data.categoryName)

      console.log(`[useSatelliteData] Updated with ${data.satellites.length} satellites from ${data.source}`, {
        cached: data.cached,
        total: data.total,
        transactionCount: data.transactionCount,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch satellite data"
      setError(errorMessage)
      console.error("[useSatelliteData] Fetch error:", err)

      // Don't clear satellites on error - keep showing last known data
    } finally {
      setLoading(false)
    }
  }, [observerLat, observerLng, observerAlt, searchRadius, categoryId, useMockData])

  // Initial fetch
  useEffect(() => {
    fetchSatellites()
  }, [fetchSatellites])

  // Auto-update interval
  useEffect(() => {
    if (!autoUpdate) return

    const interval = setInterval(fetchSatellites, updateInterval)
    return () => clearInterval(interval)
  }, [fetchSatellites, updateInterval, autoUpdate])

  const refresh = useCallback(() => {
    setLoading(true)
    fetchSatellites()
  }, [fetchSatellites])

  return {
    satellites,
    loading,
    error,
    warning,
    lastUpdate,
    transactionCount,
    dataSource,
    categoryName,
    refresh,
  }
}

export { SATELLITE_CATEGORIES }
