"use client"

import { useState, useEffect, useCallback } from "react"

interface RealFlight {
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
  country: string
  lastContact: number
  onGround: boolean
  verticalRate: number
}

interface FlightDataResponse {
  flights: RealFlight[]
  cached: boolean
  timestamp: number
  total?: number
  processed?: number
  source?: string
  error?: string
  warning?: string
}

interface UseRealFlightDataOptions {
  region?: string
  limit?: number
  updateInterval?: number
  autoUpdate?: boolean
  useMockData?: boolean
}

export function useRealFlightData(options: UseRealFlightDataOptions = {}) {
  const {
    region = "global",
    limit = 500,
    updateInterval = 30000, // 30 seconds
    autoUpdate = true,
    useMockData = false,
  } = options

  const [flights, setFlights] = useState<RealFlight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<number>(0)
  const [dataSource, setDataSource] = useState<string>("unknown")
  const [stats, setStats] = useState({
    total: 0,
    processed: 0,
    cached: false,
  })

  const fetchFlights = useCallback(async () => {
    try {
      setError(null)
      setWarning(null)

      const params = new URLSearchParams({
        region,
        limit: limit.toString(),
        ...(useMockData && { mock: "true" }),
      })

      console.log(`[useRealFlightData] Fetching flights: ${params.toString()}`)

      const response = await fetch(`/api/flights?${params}`, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: FlightDataResponse = await response.json()

      // Handle warnings (like fallback data)
      if (data.warning) {
        setWarning(data.warning)
        console.warn(`[useRealFlightData] Warning: ${data.warning}`)
      }

      // Handle errors (but still use the data if available)
      if (data.error && data.source !== "opensky") {
        setError(`API Error: ${data.error}`)
        console.error(`[useRealFlightData] API Error: ${data.error}`)
      }

      setFlights(data.flights)
      setLastUpdate(data.timestamp)
      setDataSource(data.source || "unknown")
      setStats({
        total: data.total || 0,
        processed: data.processed || data.flights.length,
        cached: data.cached || false,
      })

      console.log(`[useRealFlightData] Updated with ${data.flights.length} flights from ${data.source}`, {
        cached: data.cached,
        total: data.total,
        processed: data.processed,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch flight data"
      setError(errorMessage)
      console.error("[useRealFlightData] Fetch error:", err)

      // Don't clear flights on error - keep showing last known data
    } finally {
      setLoading(false)
    }
  }, [region, limit, useMockData])

  // Initial fetch
  useEffect(() => {
    fetchFlights()
  }, [fetchFlights])

  // Auto-update interval
  useEffect(() => {
    if (!autoUpdate) return

    const interval = setInterval(fetchFlights, updateInterval)
    return () => clearInterval(interval)
  }, [fetchFlights, updateInterval, autoUpdate])

  const refresh = useCallback(() => {
    setLoading(true)
    fetchFlights()
  }, [fetchFlights])

  const toggleMockData = useCallback(() => {
    setLoading(true)
    // This will be handled by the parent component
  }, [])

  return {
    flights,
    loading,
    error,
    warning,
    lastUpdate,
    stats,
    dataSource,
    refresh,
    toggleMockData,
  }
}
