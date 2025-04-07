"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

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

export default function LeafletMapClient({
  providers,
  selectedProvider,
  setSelectedProvider,
  height = "400px",
  zoom = 13,
  centerPosition = [18.5204, 73.8567], // Default: Pune, India
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return

    // Initialize map if it doesn't exist
    if (!leafletMapRef.current) {
      leafletMapRef.current = L.map(mapRef.current).setView(centerPosition, zoom)

      // Add dark theme tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(leafletMapRef.current)
    }

    // Clean up on unmount
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove()
        leafletMapRef.current = null
      }
    }
  }, [centerPosition, zoom])

  // Add markers for providers
  useEffect(() => {
    if (!leafletMapRef.current) return

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    // Create custom marker icons
    const defaultIcon = L.divIcon({
      html: `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-black text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
              </svg>
            </div>`,
      className: "",
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    })

    const selectedIcon = L.divIcon({
      html: `<div class="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
              </svg>
            </div>`,
      className: "",
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    })

    // Add markers for each provider
    const bounds = L.latLngBounds([])

    providers.forEach((provider) => {
      const marker = L.marker([provider.coordinates.lat, provider.coordinates.lng], {
        icon: provider.id === selectedProvider ? selectedIcon : defaultIcon,
      }).addTo(leafletMapRef.current!)

      // Add popup with provider info
      const popupContent = `
        <div class="p-2">
          <h3 class="font-bold">${provider.name}</h3>
          ${provider.location ? `<p>${provider.location}</p>` : ""}
          ${provider.price ? `<p>Price: ${provider.price}</p>` : ""}
          ${
            provider.rating
              ? `<div class="flex">
                  ${Array(5)
                    .fill(0)
                    .map((_, i) => (i < provider.rating! ? "★" : "☆"))
                    .join("")}
                </div>`
              : ""
          }
          <button class="mt-2 px-3 py-1 bg-primary text-white rounded-md text-sm select-provider-btn" data-id="${
            provider.id
          }">Select</button>
        </div>
      `

      const popup = L.popup().setContent(popupContent)
      marker.bindPopup(popup)

      // Add click event to marker
      marker.on("click", () => {
        setSelectedProvider(provider.id)
      })

      markersRef.current.push(marker)

      // Extend bounds to include this marker
      bounds.extend([provider.coordinates.lat, provider.coordinates.lng])
    })

    // If a provider is selected, center the map on it
    if (selectedProvider) {
      const selectedProviderData = providers.find((p) => p.id === selectedProvider)
      if (selectedProviderData) {
        leafletMapRef.current.setView([selectedProviderData.coordinates.lat, selectedProviderData.coordinates.lng], 15)
      }
    } else if (providers.length > 0) {
      // Fit map to show all providers
      if (bounds.isValid()) {
        leafletMapRef.current.fitBounds(bounds, { padding: [50, 50] })
      }
    }

    // Add click event to "Select" buttons in popups
    const handleSelectButtonClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.classList.contains("select-provider-btn")) {
        const providerId = Number.parseInt(target.getAttribute("data-id") || "0", 10)
        setSelectedProvider(providerId)
      }
    }

    document.addEventListener("click", handleSelectButtonClick)

    return () => {
      document.removeEventListener("click", handleSelectButtonClick)
    }
  }, [providers, selectedProvider, setSelectedProvider])

  // Update markers when selected provider changes
  useEffect(() => {
    if (!leafletMapRef.current) return

    markersRef.current.forEach((marker, index) => {
      const provider = providers[index]
      if (!provider) return

      // Create custom marker icons
      const defaultIcon = L.divIcon({
        html: `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-black text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                </svg>
              </div>`,
        className: "",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      })

      const selectedIcon = L.divIcon({
        html: `<div class="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                </svg>
              </div>`,
        className: "",
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      })

      // Update icon based on selection
      marker.setIcon(provider.id === selectedProvider ? selectedIcon : defaultIcon)

      // If this provider is selected, center the map on it
      if (provider.id === selectedProvider) {
        leafletMapRef.current?.setView([provider.coordinates.lat, provider.coordinates.lng], 15)
      }
    })
  }, [selectedProvider, providers])

  return <div ref={mapRef} className="w-full rounded-lg overflow-hidden" style={{ height }} />
}

