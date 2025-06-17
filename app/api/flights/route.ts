export const dynamic = "force-dynamic"

interface ProcessedFlight {
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

// Cache for flight data
let flightCache: { data: ProcessedFlight[]; timestamp: number } | null = null
const CACHE_DURATION = 30000 // 30 seconds

// Enhanced realistic mock flight data generator
function generateEnhancedMockFlightData(limit = 500): ProcessedFlight[] {
  // Real airline callsigns and routes
  const airlines = [
    { code: "UAL", name: "United Airlines", country: "United States" },
    { code: "DAL", name: "Delta Air Lines", country: "United States" },
    { code: "AAL", name: "American Airlines", country: "United States" },
    { code: "SWA", name: "Southwest Airlines", country: "United States" },
    { code: "JBU", name: "JetBlue Airways", country: "United States" },
    { code: "BAW", name: "British Airways", country: "United Kingdom" },
    { code: "VIR", name: "Virgin Atlantic", country: "United Kingdom" },
    { code: "AFR", name: "Air France", country: "France" },
    { code: "DLH", name: "Lufthansa", country: "Germany" },
    { code: "KLM", name: "KLM Royal Dutch Airlines", country: "Netherlands" },
    { code: "EK", name: "Emirates", country: "United Arab Emirates" },
    { code: "QR", name: "Qatar Airways", country: "Qatar" },
    { code: "SQ", name: "Singapore Airlines", country: "Singapore" },
    { code: "CX", name: "Cathay Pacific", country: "Hong Kong" },
    { code: "NH", name: "All Nippon Airways", country: "Japan" },
    { code: "JL", name: "Japan Airlines", country: "Japan" },
    { code: "KE", name: "Korean Air", country: "South Korea" },
    { code: "AC", name: "Air Canada", country: "Canada" },
    { code: "QF", name: "Qantas", country: "Australia" },
    { code: "TK", name: "Turkish Airlines", country: "Turkey" },
  ]

  const aircraftTypes = [
    { type: "B737-800", cruiseAlt: 37000, cruiseSpeed: 450 },
    { type: "A320-200", cruiseAlt: 36000, cruiseSpeed: 440 },
    { type: "B777-300ER", cruiseAlt: 41000, cruiseSpeed: 490 },
    { type: "A350-900", cruiseAlt: 42000, cruiseSpeed: 485 },
    { type: "B787-9", cruiseAlt: 43000, cruiseSpeed: 480 },
    { type: "A330-300", cruiseAlt: 38000, cruiseSpeed: 470 },
    { type: "B747-8F", cruiseAlt: 39000, cruiseSpeed: 475 },
    { type: "A380-800", cruiseAlt: 41000, cruiseSpeed: 485 },
    { type: "B737 MAX 8", cruiseAlt: 37000, cruiseSpeed: 455 },
    { type: "A321neo", cruiseAlt: 38000, cruiseSpeed: 450 },
    { type: "CRJ-900", cruiseAlt: 35000, cruiseSpeed: 420 },
    { type: "E190", cruiseAlt: 36000, cruiseSpeed: 430 },
  ]

  // Major airports with coordinates
  const airports = [
    { code: "LAX", lat: 33.9425, lng: -118.4081, city: "Los Angeles" },
    { code: "JFK", lat: 40.6413, lng: -73.7781, city: "New York" },
    { code: "LHR", lat: 51.47, lng: -0.4543, city: "London" },
    { code: "CDG", lat: 49.0097, lng: 2.5479, city: "Paris" },
    { code: "NRT", lat: 35.772, lng: 140.3929, city: "Tokyo" },
    { code: "SYD", lat: -33.9399, lng: 151.1753, city: "Sydney" },
    { code: "DXB", lat: 25.2532, lng: 55.3657, city: "Dubai" },
    { code: "SIN", lat: 1.3644, lng: 103.9915, city: "Singapore" },
    { code: "ORD", lat: 41.9742, lng: -87.9073, city: "Chicago" },
    { code: "ATL", lat: 33.6407, lng: -84.4277, city: "Atlanta" },
    { code: "DEN", lat: 39.8561, lng: -104.6737, city: "Denver" },
    { code: "DFW", lat: 32.8998, lng: -97.0403, city: "Dallas" },
    { code: "SEA", lat: 47.4502, lng: -122.3088, city: "Seattle" },
    { code: "SFO", lat: 37.6213, lng: -122.379, city: "San Francisco" },
    { code: "MIA", lat: 25.7959, lng: -80.287, city: "Miami" },
    { code: "FRA", lat: 50.0379, lng: 8.5622, city: "Frankfurt" },
    { code: "AMS", lat: 52.3105, lng: 4.7683, city: "Amsterdam" },
    { code: "MAD", lat: 40.4839, lng: -3.568, city: "Madrid" },
    { code: "FCO", lat: 41.8003, lng: 12.2389, city: "Rome" },
    { code: "IST", lat: 41.2753, lng: 28.7519, city: "Istanbul" },
  ]

  const flights: ProcessedFlight[] = []
  const currentTime = Math.floor(Date.now() / 1000)

  for (let i = 0; i < Math.min(limit, 1000); i++) {
    const airline = airlines[Math.floor(Math.random() * airlines.length)]
    const aircraft = aircraftTypes[Math.floor(Math.random() * aircraftTypes.length)]
    const origin = airports[Math.floor(Math.random() * airports.length)]
    const destination = airports[Math.floor(Math.random() * airports.length)]

    // Generate realistic flight path
    const progress = Math.random() // 0 to 1, how far along the route
    const lat = origin.lat + (destination.lat - origin.lat) * progress
    const lng = origin.lng + (destination.lng - origin.lng) * progress

    // Add some randomness to simulate actual flight paths (not straight lines)
    const deviation = 0.5 // degrees
    const finalLat = lat + (Math.random() - 0.5) * deviation
    const finalLng = lng + (Math.random() - 0.5) * deviation

    // Determine flight phase and realistic parameters
    let altitude: number
    let speed: number
    let status: ProcessedFlight["status"]
    let onGround: boolean

    if (progress < 0.05) {
      // Takeoff phase
      altitude = Math.random() * 5000 + 500
      speed = Math.random() * 100 + 150
      status = Math.random() > 0.5 ? "Takeoff" : "Taxiing"
      onGround = status === "Taxiing"
    } else if (progress > 0.95) {
      // Landing phase
      altitude = Math.random() * 3000 + 200
      speed = Math.random() * 80 + 120
      status = Math.random() > 0.5 ? "Landing" : "Taxiing"
      onGround = status === "Taxiing"
    } else {
      // Cruise phase
      altitude = aircraft.cruiseAlt + (Math.random() - 0.5) * 4000
      speed = aircraft.cruiseSpeed + (Math.random() - 0.5) * 50
      status = "En Route"
      onGround = false
    }

    // Calculate heading (bearing from current position to destination)
    const deltaLng = destination.lng - finalLng
    const deltaLat = destination.lat - finalLat
    let heading = (Math.atan2(deltaLng, deltaLat) * 180) / Math.PI
    if (heading < 0) heading += 360

    // Generate realistic callsign
    const flightNumber = Math.floor(Math.random() * 9000) + 1000
    const callsign = `${airline.code}${flightNumber}`

    // Generate registration based on country
    let registration: string
    if (airline.country === "United States") {
      registration = `N${Math.floor(Math.random() * 999)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`
    } else if (airline.country === "United Kingdom") {
      registration = `G-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`
    } else {
      registration = `${airline.code}-${Math.floor(Math.random() * 999)
        .toString()
        .padStart(3, "0")}`
    }

    flights.push({
      id: `mock_${i.toString().padStart(6, "0")}`,
      callsign,
      latitude: finalLat,
      longitude: finalLng,
      altitude: Math.max(0, altitude),
      speed: Math.max(0, speed),
      heading: heading,
      status,
      aircraft_type: aircraft.type,
      origin: origin.code,
      destination: destination.code,
      squawk: Math.floor(Math.random() * 7777)
        .toString()
        .padStart(4, "0"),
      registration,
      country: airline.country,
      lastContact: currentTime - Math.floor(Math.random() * 60), // Within last minute
      onGround,
      verticalRate: onGround ? 0 : (Math.random() - 0.5) * 1000, // -500 to +500 ft/min
    })
  }

  return flights
}

// Simplified API that prioritizes reliability
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const region = searchParams.get("region") || "global"
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "500"), 2000) // Cap at 2000
    const useMockData = searchParams.get("mock") === "true"

    console.log(`[Flight API] Request: region=${region}, limit=${limit}, mock=${useMockData}`)

    // Check cache first (regardless of mock setting)
    if (flightCache && Date.now() - flightCache.timestamp < CACHE_DURATION) {
      console.log("[Flight API] Returning cached data")
      return Response.json({
        flights: flightCache.data.slice(0, limit),
        cached: true,
        timestamp: flightCache.timestamp,
        total: flightCache.data.length,
        processed: Math.min(flightCache.data.length, limit),
        source: "cache",
      })
    }

    // If mock data is explicitly requested, return it immediately
    if (useMockData) {
      console.log("[Flight API] Generating enhanced mock data (user requested)")
      const mockFlights = generateEnhancedMockFlightData(limit)

      // Update cache
      flightCache = {
        data: mockFlights,
        timestamp: Date.now(),
      }

      return Response.json({
        flights: mockFlights,
        cached: false,
        timestamp: Date.now(),
        total: mockFlights.length,
        processed: mockFlights.length,
        source: "mock",
      })
    }

    // Try OpenSky API with minimal retries (since it's unreliable)
    console.log("[Flight API] Attempting OpenSky Network API (single attempt)...")

    try {
      // Single attempt with short timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout

      const response = await fetch("https://opensky-network.org/api/states/all", {
        method: "GET",
        headers: {
          "User-Agent": "Aircraft-Tracking-System/1.0",
          Accept: "application/json",
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()

        if (data.states && Array.isArray(data.states) && data.states.length > 0) {
          console.log(`[Flight API] OpenSky success: ${data.states.length} states received`)

          // Process the data quickly
          const processedFlights: ProcessedFlight[] = data.states
            .filter((state: any[]) => {
              return (
                state &&
                state.length >= 17 &&
                state[5] !== null && // longitude
                state[6] !== null && // latitude
                !isNaN(Number(state[5])) &&
                !isNaN(Number(state[6])) &&
                Math.abs(Number(state[5])) <= 180 &&
                Math.abs(Number(state[6])) <= 90
              )
            })
            .slice(0, limit)
            .map((state: any[], index: number): ProcessedFlight => {
              const [
                icao24,
                callsign,
                origin_country,
                ,
                last_contact,
                longitude,
                latitude,
                baro_altitude,
                on_ground,
                velocity,
                true_track,
                vertical_rate,
              ] = state

              const safeNumber = (value: any, fallback = 0): number => {
                const num = Number(value)
                return isFinite(num) && !isNaN(num) ? num : fallback
              }

              return {
                id: icao24 || `live_${index}`,
                callsign: (callsign?.trim() || `UNKN${index.toString().padStart(3, "0")}`).substring(0, 10),
                latitude: safeNumber(latitude),
                longitude: safeNumber(longitude),
                altitude: Math.max(0, safeNumber(baro_altitude)),
                speed: Math.max(0, safeNumber(velocity) * 1.94384), // m/s to knots
                heading: safeNumber(true_track, Math.random() * 360),
                status: on_ground ? "Taxiing" : "En Route",
                aircraft_type: "Unknown",
                origin: "LIVE",
                destination: "DATA",
                squawk: "0000",
                registration: (icao24 || `REG${index}`).toUpperCase().substring(0, 10),
                country: (origin_country || "Unknown").substring(0, 50),
                lastContact: safeNumber(last_contact, Math.floor(Date.now() / 1000)),
                onGround: Boolean(on_ground),
                verticalRate: safeNumber(vertical_rate),
              }
            })

          // Update cache
          flightCache = {
            data: processedFlights,
            timestamp: Date.now(),
          }

          return Response.json({
            flights: processedFlights,
            cached: false,
            timestamp: Date.now(),
            total: data.states.length,
            processed: processedFlights.length,
            source: "opensky",
          })
        }
      }

      throw new Error(`OpenSky API returned ${response.status}: ${response.statusText}`)
    } catch (apiError) {
      console.log(
        `[Flight API] OpenSky failed (expected): ${apiError instanceof Error ? apiError.message : "Unknown error"}`,
      )
      // Don't log this as an error since it's expected to fail often
    }

    // Default to enhanced mock data (this is the reliable path)
    console.log("[Flight API] Using enhanced mock data (OpenSky unavailable)")
    const mockFlights = generateEnhancedMockFlightData(limit)

    // Update cache
    flightCache = {
      data: mockFlights,
      timestamp: Date.now(),
    }

    return Response.json({
      flights: mockFlights,
      cached: false,
      timestamp: Date.now(),
      total: mockFlights.length,
      processed: mockFlights.length,
      source: "fallback",
      warning: "OpenSky Network API is currently unavailable. Using enhanced realistic flight data for demonstration.",
    })
  } catch (error) {
    console.error("[Flight API] Unexpected system error:", error)

    // Emergency fallback
    const emergencyFlights = generateEnhancedMockFlightData(
      Math.min(Number.parseInt(new URL(request.url).searchParams.get("limit") || "500"), 500),
    )

    return Response.json(
      {
        flights: emergencyFlights,
        cached: false,
        timestamp: Date.now(),
        total: emergencyFlights.length,
        processed: emergencyFlights.length,
        source: "emergency_fallback",
        error: error instanceof Error ? error.message : "Unknown system error",
        warning: "System error occurred. Using emergency flight data.",
      },
      { status: 200 },
    )
  }
}
