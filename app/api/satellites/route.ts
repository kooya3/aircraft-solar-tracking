export const dynamic = "force-dynamic"

interface SatelliteAbove {
  satid: number
  satname: string
  intDesignator: string
  launchDate: string
  satlat: number
  satlng: number
  satalt: number
}

interface N2YOResponse {
  info: {
    category: string
    transactionscount: number
    satcount: number
  }
  above: SatelliteAbove[]
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

// Cache for satellite data
let satelliteCache: { data: SatelliteAbove[]; timestamp: number; key: string } | null = null
const CACHE_DURATION = 60000 // 1 minute

// Enhanced mock satellite data generator
function generateMockSatelliteData(categoryId: number, count = 50): SatelliteAbove[] {
  const categories = {
    0: "All Categories",
    1: "Brightest",
    2: "ISS",
    3: "Weather",
    18: "Amateur Radio",
    20: "GPS Operational",
    52: "Starlink",
  }

  const satelliteNames = {
    0: [
      "STARLINK-1234",
      "ISS (ZARYA)",
      "NOAA 19",
      "GPS BIIR-2",
      "IRIDIUM 33",
      "COSMOS 2251",
      "TERRA",
      "AQUA",
      "LANDSAT 8",
      "SENTINEL-1A",
    ],
    1: ["ISS (ZARYA)", "IRIDIUM 33", "COSMOS 2251", "TERRA", "AQUA"],
    2: ["ISS (ZARYA)", "PROGRESS MS-21", "SOYUZ MS-23"],
    3: ["NOAA 19", "NOAA 18", "GOES-16", "GOES-17", "METOP-B", "METOP-C"],
    18: ["AO-91", "AO-92", "SO-50", "ISS", "LILACSAT 2"],
    20: ["GPS BIIR-2", "GPS BIIF-3", "GPS BIIF-4", "GPS BIIF-5"],
    52: Array.from({ length: 20 }, (_, i) => `STARLINK-${1000 + i}`),
  }

  const names = satelliteNames[categoryId as keyof typeof satelliteNames] || satelliteNames[0]
  const satellites: SatelliteAbove[] = []

  for (let i = 0; i < Math.min(count, 100); i++) {
    const baseName = names[i % names.length]
    const satname = i < names.length ? baseName : `${baseName}-${i}`

    // Generate realistic positions around the globe
    const lat = (Math.random() - 0.5) * 160 // -80 to +80 degrees
    const lng = (Math.random() - 0.5) * 360 // -180 to +180 degrees

    // Generate realistic altitudes based on satellite type
    let altitude: number
    if (categoryId === 2) {
      // ISS altitude range
      altitude = 400 + Math.random() * 20
    } else if (categoryId === 52) {
      // Starlink altitude range
      altitude = 540 + Math.random() * 20
    } else if (categoryId === 20) {
      // GPS altitude range
      altitude = 20000 + Math.random() * 200
    } else {
      // General LEO to GEO range
      altitude = 200 + Math.random() * 35000
    }

    satellites.push({
      satid: 25544 + i,
      satname,
      intDesignator: `${1998 + Math.floor(i / 10)}-${String(Math.floor(Math.random() * 100)).padStart(3, "0")}${String.fromCharCode(65 + (i % 26))}`,
      launchDate: `${2000 + Math.floor(Math.random() * 24)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
      satlat: lat,
      satlng: lng,
      satalt: altitude,
    })
  }

  return satellites
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 15000): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const observerLat = Number.parseFloat(searchParams.get("lat") || "37.7749")
    const observerLng = Number.parseFloat(searchParams.get("lng") || "-122.4194")
    const observerAlt = Number.parseFloat(searchParams.get("alt") || "0")
    const searchRadius = Number.parseInt(searchParams.get("radius") || "70")
    const categoryId = Number.parseInt(searchParams.get("category") || "0")
    const useMockData = searchParams.get("mock") === "true"

    console.log(
      `[Satellite API] Request: lat=${observerLat}, lng=${observerLng}, alt=${observerAlt}, radius=${searchRadius}, category=${categoryId}, mock=${useMockData}`,
    )

    // Create cache key
    const cacheKey = `${observerLat}_${observerLng}_${observerAlt}_${searchRadius}_${categoryId}`

    // Check cache first
    if (satelliteCache && Date.now() - satelliteCache.timestamp < CACHE_DURATION && satelliteCache.key === cacheKey) {
      console.log("[Satellite API] Returning cached data")
      return Response.json({
        satellites: satelliteCache.data,
        cached: true,
        timestamp: satelliteCache.timestamp,
        total: satelliteCache.data.length,
        source: "cache",
        transactionCount: 0,
        categoryName: getCategoryName(categoryId),
      })
    }

    // If mock data is requested, return it immediately
    if (useMockData) {
      console.log("[Satellite API] Generating mock data")
      const mockSatellites = generateMockSatelliteData(categoryId, 50)

      satelliteCache = {
        data: mockSatellites,
        timestamp: Date.now(),
        key: cacheKey,
      }

      return Response.json({
        satellites: mockSatellites,
        cached: false,
        timestamp: Date.now(),
        total: mockSatellites.length,
        source: "mock",
        transactionCount: 0,
        categoryName: getCategoryName(categoryId),
      })
    }

    // Try to fetch from N2YO API
    let lastError: Error | null = null
    const maxRetries = 2

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[Satellite API] Attempt ${attempt}/${maxRetries} - Fetching from N2YO API...`)

        const apiKey = "THFY9W-2GZV3M-ETZ8RP-5I6W"
        const n2yoUrl = `https://api.n2yo.com/rest/v1/satellite/above/${observerLat}/${observerLng}/${observerAlt}/${searchRadius}/${categoryId}&apiKey=${apiKey}`

        const response = await fetchWithTimeout(
          n2yoUrl,
          {
            method: "GET",
            headers: {
              "User-Agent": "Aircraft-Satellite-Tracker/1.0 (Educational)",
              Accept: "application/json",
              "Cache-Control": "no-cache",
            },
          },
          10000,
        )

        console.log(`[Satellite API] N2YO response status: ${response.status}`)

        if (!response.ok) {
          throw new Error(`N2YO API HTTP ${response.status}: ${response.statusText}`)
        }

        const data: N2YOResponse = await response.json()
        console.log(`[Satellite API] Received data with ${data.above?.length || 0} satellites`)

        if (!data.above || !Array.isArray(data.above)) {
          throw new Error("Invalid data format from N2YO API - missing or invalid satellites array")
        }

        // Process and validate the satellite data
        const processedSatellites: SatelliteAbove[] = data.above
          .filter((sat) => {
            return (
              sat &&
              typeof sat.satid === "number" &&
              typeof sat.satname === "string" &&
              typeof sat.satlat === "number" &&
              typeof sat.satlng === "number" &&
              typeof sat.satalt === "number" &&
              !isNaN(sat.satlat) &&
              !isNaN(sat.satlng) &&
              !isNaN(sat.satalt) &&
              Math.abs(sat.satlat) <= 90 &&
              Math.abs(sat.satlng) <= 180
            )
          })
          .map((sat) => ({
            satid: sat.satid,
            satname: sat.satname.trim(),
            intDesignator: sat.intDesignator || "Unknown",
            launchDate: sat.launchDate || "Unknown",
            satlat: Number(sat.satlat),
            satlng: Number(sat.satlng),
            satalt: Number(sat.satalt),
          }))

        // Update cache
        satelliteCache = {
          data: processedSatellites,
          timestamp: Date.now(),
          key: cacheKey,
        }

        console.log(`[Satellite API] Successfully processed ${processedSatellites.length} satellites`)

        return Response.json({
          satellites: processedSatellites,
          cached: false,
          timestamp: Date.now(),
          total: processedSatellites.length,
          source: "n2yo",
          transactionCount: data.info.transactionscount || 0,
          categoryName: data.info.category || getCategoryName(categoryId),
        })
      } catch (error) {
        lastError = error as Error
        console.error(`[Satellite API] Attempt ${attempt} failed:`, error)

        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
        }
      }
    }

    // If all attempts failed, fall back to mock data
    console.log("[Satellite API] All attempts failed, falling back to mock data")
    const mockSatellites = generateMockSatelliteData(categoryId, 50)

    satelliteCache = {
      data: mockSatellites,
      timestamp: Date.now(),
      key: cacheKey,
    }

    return Response.json({
      satellites: mockSatellites,
      cached: false,
      timestamp: Date.now(),
      total: mockSatellites.length,
      source: "fallback",
      transactionCount: 0,
      categoryName: getCategoryName(categoryId),
      error: lastError?.message || "Unknown error",
      warning: "N2YO API is currently unavailable. Using realistic satellite data for demonstration.",
    })
  } catch (error) {
    console.error("[Satellite API] Unexpected error:", error)

    // Emergency fallback to mock data
    const categoryId = Number.parseInt(new URL(request.url).searchParams.get("category") || "0")
    const mockSatellites = generateMockSatelliteData(categoryId, 30)

    return Response.json(
      {
        satellites: mockSatellites,
        cached: false,
        timestamp: Date.now(),
        total: mockSatellites.length,
        source: "emergency_fallback",
        transactionCount: 0,
        categoryName: getCategoryName(categoryId),
        error: error instanceof Error ? error.message : "Unknown system error",
        warning: "System error occurred. Using emergency satellite data.",
      },
      { status: 200 },
    )
  }
}

function getCategoryName(categoryId: number): string {
  const categories: Record<number, string> = {
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

  return categories[categoryId] || "Unknown Category"
}
