"use client"

import { useState, useEffect, useCallback } from "react"

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

interface SolarSystemDataResponse {
  bodies: SolarSystemBody[]
  cached: boolean
  timestamp: number
  total?: number
  filtered?: number
  source?: string
  error?: string
  warning?: string
}

interface UseSolarSystemDataOptions {
  bodyType?: "all" | "planet" | "moon" | "asteroid" | "comet" | "star"
  updateInterval?: number
  autoUpdate?: boolean
  useMockData?: boolean
}

export function useSolarSystemData(options: UseSolarSystemDataOptions = {}) {
  const {
    bodyType = "all",
    updateInterval = 24 * 60 * 60 * 1000, // 24 hours
    autoUpdate = true,
    useMockData = false,
  } = options

  const [bodies, setBodies] = useState<SolarSystemBody[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<number>(0)
  const [dataSource, setDataSource] = useState<string>("unknown")
  const [stats, setStats] = useState({
    total: 0,
    filtered: 0,
    cached: false,
  })

  const fetchSolarSystemData = useCallback(async () => {
    try {
      setError(null)
      setWarning(null)

      const params = new URLSearchParams({
        type: bodyType,
        ...(useMockData && { mock: "true" }),
      })

      console.log(`[useSolarSystemData] Fetching solar system data: ${params.toString()}`)

      const response = await fetch(`/api/solar-system?${params}`, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: SolarSystemDataResponse = await response.json()

      // Handle warnings (like fallback data)
      if (data.warning) {
        setWarning(data.warning)
        console.warn(`[useSolarSystemData] Warning: ${data.warning}`)
      }

      // Handle errors (but still use the data if available)
      if (data.error && data.source !== "solar-system-api") {
        setError(`API Error: ${data.error}`)
        console.error(`[useSolarSystemData] API Error: ${data.error}`)
      }

      setBodies(data.bodies)
      setLastUpdate(data.timestamp)
      setDataSource(data.source || "unknown")
      setStats({
        total: data.total || 0,
        filtered: data.filtered || data.bodies.length,
        cached: data.cached || false,
      })

      console.log(`[useSolarSystemData] Updated with ${data.bodies.length} bodies from ${data.source}`, {
        cached: data.cached,
        total: data.total,
        filtered: data.filtered,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch solar system data"
      setError(errorMessage)
      console.error("[useSolarSystemData] Fetch error:", err)
    } finally {
      setLoading(false)
    }
  }, [bodyType, useMockData])

  // Initial fetch
  useEffect(() => {
    fetchSolarSystemData()
  }, [fetchSolarSystemData])

  // Auto-update interval (less frequent for solar system data)
  useEffect(() => {
    if (!autoUpdate) return

    const interval = setInterval(fetchSolarSystemData, updateInterval)
    return () => clearInterval(interval)
  }, [fetchSolarSystemData, updateInterval, autoUpdate])

  const refresh = useCallback(() => {
    setLoading(true)
    fetchSolarSystemData()
  }, [fetchSolarSystemData])

  return {
    bodies,
    loading,
    error,
    warning,
    lastUpdate,
    stats,
    dataSource,
    refresh,
  }
}
