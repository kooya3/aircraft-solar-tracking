"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Sphere } from "@react-three/drei"
import * as THREE from "three"

interface Aircraft {
  id: string
  callsign: string
  latitude: number
  longitude: number
  altitude: number
  origin: string
  destination: string
  flightPath: {
    points: Array<{ lat: number; lng: number; alt: number; timestamp: number }>
    currentProgress: number
  }
}

// Convert lat/lng to 3D coordinates on sphere
const latLngToVector3 = (lat: number, lng: number, radius = 5) => {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  )
}

const Earth = () => {
  const earthRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.002
    }
  })

  return (
    <Sphere ref={earthRef} args={[5, 64, 64]}>
      <meshStandardMaterial
        color="#1e40af"
        transparent
        opacity={0.8}
        wireframe={false}
        roughness={0.7}
        metalness={0.1}
      />
    </Sphere>
  )
}

const FlightPath = ({ aircraft }: { aircraft: Aircraft }) => {
  const points = useMemo(() => {
    return aircraft.flightPath.points.map((point) => latLngToVector3(point.lat, point.lng, 5.1))
  }, [aircraft.flightPath.points])

  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    return geometry
  }, [points])

  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial color="cyan" transparent opacity={0.6} />
    </line>
  )
}

const AircraftMarker = ({ aircraft }: { aircraft: Aircraft }) => {
  const markerRef = useRef<THREE.Mesh>(null)

  const position = useMemo(
    () => latLngToVector3(aircraft.latitude, aircraft.longitude, 5.2),
    [aircraft.latitude, aircraft.longitude],
  )

  useFrame(() => {
    if (markerRef.current) {
      // Create a new vector pointing towards the center
      const center = new THREE.Vector3(0, 0, 0)
      markerRef.current.lookAt(center)
    }
  })

  return (
    <mesh ref={markerRef} position={[position.x, position.y, position.z]}>
      <coneGeometry args={[0.1, 0.3, 4]} />
      <meshStandardMaterial color="yellow" />
    </mesh>
  )
}

const Globe3DScene = ({ aircraft }: { aircraft: Aircraft }) => {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      <Earth />
      <FlightPath aircraft={aircraft} />
      <AircraftMarker aircraft={aircraft} />
      <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} minDistance={8} maxDistance={20} />
    </>
  )
}

export const Globe3D = ({ aircraft }: { aircraft: Aircraft }) => {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }} gl={{ antialias: true }} dpr={[1, 2]}>
        <Globe3DScene aircraft={aircraft} />
      </Canvas>
    </div>
  )
}
