"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Plane } from "lucide-react"

interface Aircraft {
  id: string
  callsign: string
  origin: string
  destination: string
  status: string
  aircraft_type: string
}

interface FlightSearchProps {
  aircraft: Aircraft[]
  onSelect: (aircraft: Aircraft) => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export const FlightSearch = ({ aircraft, onSelect, searchQuery, onSearchChange }: FlightSearchProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const filteredResults = aircraft
    .filter(
      (ac) =>
        ac.callsign.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ac.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ac.destination.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .slice(0, 5)

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search flights..."
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value)
              setIsOpen(e.target.value.length > 0)
            }}
            className="pl-10 bg-slate-800 border-slate-600 text-white w-64"
            onFocus={() => setIsOpen(searchQuery.length > 0)}
            onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          />
        </div>
      </div>

      {isOpen && filteredResults.length > 0 && (
        <Card className="absolute top-full mt-2 w-80 bg-slate-800 border-slate-600 z-50">
          <CardContent className="p-2">
            {filteredResults.map((ac) => (
              <div
                key={ac.id}
                className="flex items-center space-x-3 p-2 hover:bg-slate-700 rounded cursor-pointer"
                onClick={() => {
                  onSelect(ac)
                  setIsOpen(false)
                }}
              >
                <Plane className="w-4 h-4 text-cyan-400" />
                <div className="flex-1">
                  <div className="font-semibold text-white">{ac.callsign}</div>
                  <div className="text-sm text-gray-400">
                    {ac.origin} → {ac.destination} • {ac.aircraft_type}
                  </div>
                </div>
                <div className="text-xs text-gray-500">{ac.status}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
