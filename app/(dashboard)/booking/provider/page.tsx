"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Navigation } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import LeafletMap from "@/components/leaflet-map"
import { useToast } from "@/components/ui/use-toast"

// Mock data for providers
const providers = [
  {
    id: 1,
    name: "ROHAN JOSHI",
    distance: "2.4",
    price: "200/Hr",
    location: "TATA Station",
    rating: 4,
    coordinates: { lat: 18.5204, lng: 73.8567 },
  },
  {
    id: 2,
    name: "ROHAN JOSHI",
    distance: "2.4",
    price: "200/Hr",
    location: "TATA Station",
    rating: 4,
    coordinates: { lat: 18.5304, lng: 73.8467 },
  },
  {
    id: 3,
    name: "ROHAN JOSHI",
    distance: "2.4",
    price: "200/Hr",
    location: "TATA Station",
    rating: 4,
    coordinates: { lat: 18.5104, lng: 73.8667 },
  },
]

export default function ProviderSelectionPage() {
  const [selectedProvider, setSelectedProvider] = useState<number | null>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const vehicleId = searchParams.get("vehicleId")
  const { toast } = useToast()

  useEffect(() => {
    // Set map as loaded after a short delay to ensure components are mounted
    const timer = setTimeout(() => {
      setIsMapLoaded(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const handleProceed = () => {
    if (selectedProvider) {
      router.push(`/booking/timeslot?vehicleId=${vehicleId}&providerId=${selectedProvider}`)
    } else {
      toast({
        title: "No provider selected",
        description: "Please select a provider to continue",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg overflow-hidden">
        <div className="h-[400px] relative">
          {isMapLoaded && (
            <LeafletMap
              providers={providers}
              selectedProvider={selectedProvider}
              setSelectedProvider={setSelectedProvider}
            />
          )}
        </div>

        <div className="p-6">
          <div className="relative">
            <div className="flex overflow-x-auto gap-4 py-4 scrollbar-hide">
              <button
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 rounded-full p-2"
                onClick={() => {
                  const container = document.getElementById("providers-container")
                  if (container) {
                    container.scrollBy({ left: -300, behavior: "smooth" })
                  }
                }}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <div id="providers-container" className="flex gap-4 overflow-x-auto scrollbar-hide">
                {providers.map((provider) => (
                  <div
                    key={provider.id}
                    className={`provider-card min-w-[280px] cursor-pointer ${selectedProvider === provider.id ? "border-primary" : ""}`}
                    onClick={() => setSelectedProvider(provider.id)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-black p-1 rounded">
                        <Navigation className="h-5 w-5" />
                      </div>
                      <h3 className="font-semibold">{provider.name}</h3>
                    </div>

                    <div className="flex justify-between items-center mb-2">
                      <div className="text-2xl font-bold">
                        {provider.distance} <span className="text-sm font-normal">km</span>
                      </div>
                      <div className="text-sm">{provider.price}</div>
                    </div>

                    <div className="mb-2">{provider.location}</div>

                    <div className="flex items-center justify-between">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-yellow-500">
                            {i < provider.rating ? "★" : "☆"}
                          </span>
                        ))}
                      </div>

                      <Button variant="outline" size="sm" className="rounded-full">
                        <Navigation className="h-4 w-4 mr-1" /> NAVIGATE
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 rounded-full p-2"
                onClick={() => {
                  const container = document.getElementById("providers-container")
                  if (container) {
                    container.scrollBy({ left: 300, behavior: "smooth" })
                  }
                }}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-8">
        <Button size="lg" onClick={handleProceed} disabled={!selectedProvider} className="px-8">
          PROCEED
        </Button>
      </div>
    </div>
  )
}

