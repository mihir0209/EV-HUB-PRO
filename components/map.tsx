"use client"

import { useEffect, useRef } from "react"
import { Loader } from "@googlemaps/js-api-loader"
import type { google } from "@googlemaps/js-api-loader"

interface Provider {
  id: number
  name: string
  coordinates: {
    lat: number
    lng: number
  }
}

interface MapComponentProps {
  providers: Provider[]
  selectedProvider: number | null
  setSelectedProvider: (id: number) => void
}

export default function MapComponent({ providers, selectedProvider, setSelectedProvider }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])

  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        version: "weekly",
      })

      const googleMaps = await loader.load()

      if (mapRef.current) {
        // Center on Pune, India
        const center = { lat: 18.5204, lng: 73.8567 }

        googleMapRef.current = new googleMaps.maps.Map(mapRef.current, {
          center,
          zoom: 13,
          styles: [
            {
              elementType: "geometry",
              stylers: [{ color: "#242f3e" }],
            },
            {
              elementType: "labels.text.stroke",
              stylers: [{ color: "#242f3e" }],
            },
            {
              elementType: "labels.text.fill",
              stylers: [{ color: "#746855" }],
            },
            {
              featureType: "administrative.locality",
              elementType: "labels.text.fill",
              stylers: [{ color: "#d59563" }],
            },
            {
              featureType: "poi",
              elementType: "labels.text.fill",
              stylers: [{ color: "#d59563" }],
            },
            {
              featureType: "poi.park",
              elementType: "geometry",
              stylers: [{ color: "#263c3f" }],
            },
            {
              featureType: "poi.park",
              elementType: "labels.text.fill",
              stylers: [{ color: "#6b9a76" }],
            },
            {
              featureType: "road",
              elementType: "geometry",
              stylers: [{ color: "#38414e" }],
            },
            {
              featureType: "road",
              elementType: "geometry.stroke",
              stylers: [{ color: "#212a37" }],
            },
            {
              featureType: "road",
              elementType: "labels.text.fill",
              stylers: [{ color: "#9ca5b3" }],
            },
            {
              featureType: "road.highway",
              elementType: "geometry",
              stylers: [{ color: "#746855" }],
            },
            {
              featureType: "road.highway",
              elementType: "geometry.stroke",
              stylers: [{ color: "#1f2835" }],
            },
            {
              featureType: "road.highway",
              elementType: "labels.text.fill",
              stylers: [{ color: "#f3d19c" }],
            },
            {
              featureType: "transit",
              elementType: "geometry",
              stylers: [{ color: "#2f3948" }],
            },
            {
              featureType: "transit.station",
              elementType: "labels.text.fill",
              stylers: [{ color: "#d59563" }],
            },
            {
              featureType: "water",
              elementType: "geometry",
              stylers: [{ color: "#17263c" }],
            },
            {
              featureType: "water",
              elementType: "labels.text.fill",
              stylers: [{ color: "#515c6d" }],
            },
            {
              featureType: "water",
              elementType: "labels.text.stroke",
              stylers: [{ color: "#17263c" }],
            },
          ],
        })

        // Create custom marker icon
        const iconBase = {
          url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'%3E%3Cpath d='M13 2L3 14h9l-1 8 10-12h-9l1-8z'%3E%3C/path%3E%3C/svg%3E",
          scaledSize: new googleMaps.maps.Size(32, 32),
          anchor: new googleMaps.maps.Point(16, 32),
          labelOrigin: new googleMaps.maps.Point(16, 10),
        }

        const selectedIconBase = {
          url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='%234CAF82' stroke='white' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'%3E%3Cpath d='M13 2L3 14h9l-1 8 10-12h-9l1-8z'%3E%3C/path%3E%3C/svg%3E",
          scaledSize: new googleMaps.maps.Size(40, 40),
          anchor: new googleMaps.maps.Point(20, 40),
          labelOrigin: new googleMaps.maps.Point(20, 10),
        }

        // Add markers for each provider
        providers.forEach((provider) => {
          const marker = new googleMaps.maps.Marker({
            position: provider.coordinates,
            map: googleMapRef.current,
            icon: provider.id === selectedProvider ? selectedIconBase : iconBase,
            animation: provider.id === selectedProvider ? googleMaps.maps.Animation.BOUNCE : null,
          })

          marker.addListener("click", () => {
            setSelectedProvider(provider.id)
          })

          markersRef.current.push(marker)
        })
      }
    }

    initMap()

    return () => {
      // Clean up markers
      markersRef.current.forEach((marker) => marker.setMap(null))
      markersRef.current = []
    }
  }, [])

  // Update markers when selected provider changes
  useEffect(() => {
    if (googleMapRef.current && markersRef.current.length > 0) {
      markersRef.current.forEach((marker, index) => {
        const provider = providers[index]

        // Update icon and animation based on selection
        marker.setIcon({
          url:
            provider.id === selectedProvider
              ? "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='%234CAF82' stroke='white' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'%3E%3Cpath d='M13 2L3 14h9l-1 8 10-12h-9l1-8z'%3E%3C/path%3E%3C/svg%3E"
              : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'%3E%3Cpath d='M13 2L3 14h9l-1 8 10-12h-9l1-8z'%3E%3C/path%3E%3C/svg%3E",
          scaledSize: new googleMaps.maps.Size(
            provider.id === selectedProvider ? 40 : 32,
            provider.id === selectedProvider ? 40 : 32,
          ),
          anchor: new googleMaps.maps.Point(
            provider.id === selectedProvider ? 20 : 16,
            provider.id === selectedProvider ? 40 : 32,
          ),
          labelOrigin: new googleMaps.maps.Point(provider.id === selectedProvider ? 20 : 16, 10),
        })

        marker.setAnimation(provider.id === selectedProvider ? googleMaps.maps.Animation.BOUNCE : null)

        // Center map on selected provider
        if (provider.id === selectedProvider) {
          googleMapRef.current?.panTo(provider.coordinates)
        }
      })
    }
  }, [selectedProvider, providers])

  return <div ref={mapRef} className="w-full h-full" />
}

