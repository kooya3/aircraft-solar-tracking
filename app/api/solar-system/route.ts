export const dynamic = "force-dynamic"

interface SolarSystemBody {
  id: string
  name: string
  englishName: string
  isPlanet: boolean
  moons?: Array<{ moon: string; rel: string }>
  semimajorAxis: number
  perihelion: number
  aphelion: number
  eccentricity: number
  inclination: number
  mass?: {
    massValue: number
    massExponent: number
  }
  vol?: {
    volValue: number
    volExponent: number
  }
  density: number
  gravity: number
  escape: number
  meanRadius: number
  equaRadius: number
  polarRadius: number
  flattening: number
  dimension: string
  sideralOrbit: number
  sideralRotation: number
  aroundPlanet?: {
    planet: string
    rel: string
  }
  discoveredBy?: string
  discoveryDate?: string
  alternativeName?: string
  axialTilt: number
  avgTemp: number
  mainAnomaly: number
  argPeriapsis: number
  longAscNode: number
  bodyType: string
  rel?: string
}

interface ProcessedSolarBody {
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

// Cache for solar system data
let solarSystemCache: { data: ProcessedSolarBody[]; timestamp: number } | null = null
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours (solar system data doesn't change frequently)

// Generate mock solar system data as fallback
function generateMockSolarSystemData(): ProcessedSolarBody[] {
  return [
    {
      id: "sun",
      name: "Sun",
      englishName: "Sun",
      type: "star",
      isPlanet: false,
      radius: 696340,
      mass: 1.989e30,
      density: 1408,
      gravity: 274,
      temperature: 5778,
      distanceFromSun: 0,
      orbitalPeriod: 0,
      rotationPeriod: 25.05,
      moons: 0,
    },
    {
      id: "mercury",
      name: "Mercury",
      englishName: "Mercury",
      type: "planet",
      isPlanet: true,
      radius: 2439.7,
      mass: 3.301e23,
      density: 5427,
      gravity: 3.7,
      temperature: 167,
      distanceFromSun: 57.9e6,
      orbitalPeriod: 88,
      rotationPeriod: 1407.6,
      moons: 0,
    },
    {
      id: "venus",
      name: "Venus",
      englishName: "Venus",
      type: "planet",
      isPlanet: true,
      radius: 6051.8,
      mass: 4.867e24,
      density: 5243,
      gravity: 8.87,
      temperature: 464,
      distanceFromSun: 108.2e6,
      orbitalPeriod: 225,
      rotationPeriod: -5832.5,
      moons: 0,
    },
    {
      id: "earth",
      name: "Earth",
      englishName: "Earth",
      type: "planet",
      isPlanet: true,
      radius: 6371,
      mass: 5.972e24,
      density: 5514,
      gravity: 9.8,
      temperature: 15,
      distanceFromSun: 149.6e6,
      orbitalPeriod: 365.25,
      rotationPeriod: 23.93,
      moons: 1,
    },
    {
      id: "mars",
      name: "Mars",
      englishName: "Mars",
      type: "planet",
      isPlanet: true,
      radius: 3389.5,
      mass: 6.39e23,
      density: 3933,
      gravity: 3.71,
      temperature: -65,
      distanceFromSun: 227.9e6,
      orbitalPeriod: 687,
      rotationPeriod: 24.62,
      moons: 2,
    },
    {
      id: "jupiter",
      name: "Jupiter",
      englishName: "Jupiter",
      type: "planet",
      isPlanet: true,
      radius: 69911,
      mass: 1.898e27,
      density: 1326,
      gravity: 24.79,
      temperature: -110,
      distanceFromSun: 778.5e6,
      orbitalPeriod: 4333,
      rotationPeriod: 9.93,
      moons: 95,
    },
    {
      id: "saturn",
      name: "Saturn",
      englishName: "Saturn",
      type: "planet",
      isPlanet: true,
      radius: 58232,
      mass: 5.683e26,
      density: 687,
      gravity: 10.44,
      temperature: -140,
      distanceFromSun: 1432e6,
      orbitalPeriod: 10759,
      rotationPeriod: 10.66,
      moons: 146,
    },
    {
      id: "uranus",
      name: "Uranus",
      englishName: "Uranus",
      type: "planet",
      isPlanet: true,
      radius: 25362,
      mass: 8.681e25,
      density: 1271,
      gravity: 8.69,
      temperature: -195,
      distanceFromSun: 2867e6,
      orbitalPeriod: 30687,
      rotationPeriod: -17.24,
      moons: 28,
    },
    {
      id: "neptune",
      name: "Neptune",
      englishName: "Neptune",
      type: "planet",
      isPlanet: true,
      radius: 24622,
      mass: 1.024e26,
      density: 1638,
      gravity: 11.15,
      temperature: -200,
      distanceFromSun: 4515e6,
      orbitalPeriod: 60190,
      rotationPeriod: 16.11,
      moons: 16,
    },
  ]
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
    const bodyType = searchParams.get("type") || "all"
    const useMockData = searchParams.get("mock") === "true"

    console.log(`[Solar System API] Request: type=${bodyType}, mock=${useMockData}`)

    // Check cache first
    if (solarSystemCache && Date.now() - solarSystemCache.timestamp < CACHE_DURATION) {
      console.log("[Solar System API] Returning cached data")
      const filteredData =
        bodyType === "all" ? solarSystemCache.data : solarSystemCache.data.filter((body) => body.type === bodyType)

      return Response.json({
        bodies: filteredData,
        cached: true,
        timestamp: solarSystemCache.timestamp,
        source: "cache",
      })
    }

    // If mock data is requested, return mock data immediately
    if (useMockData) {
      console.log("[Solar System API] Generating mock data")
      const mockBodies = generateMockSolarSystemData()
      const filteredData = bodyType === "all" ? mockBodies : mockBodies.filter((body) => body.type === bodyType)

      solarSystemCache = {
        data: mockBodies,
        timestamp: Date.now(),
      }

      return Response.json({
        bodies: filteredData,
        cached: false,
        timestamp: Date.now(),
        total: filteredData.length,
        source: "mock",
      })
    }

    // Try to fetch from Solar System API
    let lastError: Error | null = null
    const maxRetries = 2

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[Solar System API] Attempt ${attempt}/${maxRetries} - Fetching from Solar System API...`)

        const solarSystemUrl = "https://api.le-systeme-solaire.net/rest/bodies"
        const params = new URLSearchParams({
          data: "id,name,englishName,isPlanet,moons,semimajorAxis,mass,vol,density,gravity,meanRadius,sideralOrbit,sideralRotation,avgTemp,bodyType,aroundPlanet,discoveredBy,discoveryDate",
        })

        const response = await fetchWithTimeout(
          `${solarSystemUrl}?${params}`,
          {
            method: "GET",
            headers: {
              "User-Agent": "Aircraft-Solar-System-Tracker/1.0 (Educational)",
              Accept: "application/json",
              "Cache-Control": "no-cache",
            },
          },
          20000,
        )

        console.log(`[Solar System API] Solar System response status: ${response.status}`)

        if (!response.ok) {
          throw new Error(`Solar System API HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        console.log(`[Solar System API] Received data with ${data.bodies?.length || 0} bodies`)

        if (!data.bodies || !Array.isArray(data.bodies)) {
          throw new Error("Invalid data format from Solar System API - missing or invalid bodies array")
        }

        // Process the raw solar system data with better error handling
        const processedBodies: ProcessedSolarBody[] = data.bodies
          .filter((body: SolarSystemBody) => {
            return body && body.id && body.englishName
          })
          .map((body: SolarSystemBody): ProcessedSolarBody => {
            // Determine body type
            let type: ProcessedSolarBody["type"] = "asteroid"
            if (body.id === "soleil") type = "star"
            else if (body.isPlanet) type = "planet"
            else if (body.aroundPlanet) type = "moon"
            else if (body.bodyType === "Comet") type = "comet"

            // Calculate mass from scientific notation with null checks
            let mass = 0
            if (body.mass && typeof body.mass.massValue === "number" && typeof body.mass.massExponent === "number") {
              try {
                mass = body.mass.massValue * Math.pow(10, body.mass.massExponent)
                // Validate the result
                if (!isFinite(mass) || isNaN(mass)) {
                  mass = 0
                }
              } catch (error) {
                console.warn(`Error calculating mass for ${body.englishName}:`, error)
                mass = 0
              }
            }

            // Safe number parsing with fallbacks
            const safeNumber = (value: any, fallback = 0): number => {
              if (value === null || value === undefined) return fallback
              const num = Number(value)
              return isFinite(num) && !isNaN(num) ? num : fallback
            }

            return {
              id: body.id,
              name: body.name || body.englishName,
              englishName: body.englishName,
              type,
              isPlanet: body.isPlanet || false,
              radius: safeNumber(body.meanRadius || body.equaRadius),
              mass,
              density: safeNumber(body.density),
              gravity: safeNumber(body.gravity),
              temperature: safeNumber(body.avgTemp),
              distanceFromSun: safeNumber(body.semimajorAxis),
              orbitalPeriod: safeNumber(body.sideralOrbit),
              rotationPeriod: safeNumber(body.sideralRotation),
              moons: body.moons?.length || 0,
              discoveredBy: body.discoveredBy,
              discoveryDate: body.discoveryDate,
              parentBody: body.aroundPlanet?.planet,
            }
          })

        // Update cache
        solarSystemCache = {
          data: processedBodies,
          timestamp: Date.now(),
        }

        // Filter by type if requested
        const filteredData =
          bodyType === "all" ? processedBodies : processedBodies.filter((body) => body.type === bodyType)

        console.log(`[Solar System API] Successfully processed ${processedBodies.length} bodies`)

        return Response.json({
          bodies: filteredData,
          cached: false,
          timestamp: Date.now(),
          total: processedBodies.length,
          filtered: filteredData.length,
          source: "solar-system-api",
        })
      } catch (error) {
        lastError = error as Error
        console.error(`[Solar System API] Attempt ${attempt} failed:`, error)

        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
        }
      }
    }

    // If all attempts failed, fall back to mock data
    console.log("[Solar System API] All attempts failed, falling back to mock data")
    const mockBodies = generateMockSolarSystemData()
    const filteredData = bodyType === "all" ? mockBodies : mockBodies.filter((body) => body.type === bodyType)

    solarSystemCache = {
      data: mockBodies,
      timestamp: Date.now(),
    }

    return Response.json({
      bodies: filteredData,
      cached: false,
      timestamp: Date.now(),
      total: mockBodies.length,
      filtered: filteredData.length,
      source: "fallback",
      error: lastError?.message || "Unknown error",
      warning: "Using mock data due to API unavailability",
    })
  } catch (error) {
    console.error("[Solar System API] Unexpected error:", error)

    // Final fallback to mock data
    const mockBodies = generateMockSolarSystemData()
    const bodyType = new URL(request.url).searchParams.get("type") || "all"
    const filteredData = bodyType === "all" ? mockBodies : mockBodies.filter((body) => body.type === bodyType)

    return Response.json(
      {
        bodies: filteredData,
        cached: false,
        timestamp: Date.now(),
        total: mockBodies.length,
        filtered: filteredData.length,
        source: "emergency_fallback",
        error: error instanceof Error ? error.message : "Unknown error",
        warning: "Using emergency mock data",
      },
      { status: 200 },
    )
  }
}
