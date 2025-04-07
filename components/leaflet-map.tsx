"use client"
import dynamic from "next/dynamic"

// Import Leaflet dynamically to avoid SSR issues
const LeafletMapComponent = dynamic(() => import("./leaflet-map-client"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-card rounded-lg">
      <div className="animate-pulse text-primary">Loading map...</div>
    </div>
  ),
})

// Define provider type
interface Provider {
  id: number
  name: string
  distance?: string
  price?: string
  location?: string
  rating?: number
  coordinates: {
    lat: number
    lng: number
  }
}

interface MapComponentProps {
  providers: Provider[]
  selectedProvider: number | null
  setSelectedProvider: (id: number) => void
  height?: string
  zoom?: number
  centerPosition?: [number, number]
}

export default function LeafletMap(props: MapComponentProps) {
  return <LeafletMapComponent {...props} />
}

