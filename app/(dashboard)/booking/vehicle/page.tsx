"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

// Mock data for vehicles
const vehicles = [
  {
    id: 1,
    name: "Tata Nexon EV Max",
    chargeTime: "15 Hours",
    image: "/placeholder.svg?height=100&width=200",
  },
  {
    id: 2,
    name: "MG ZS EV",
    chargeTime: "8 Hours",
    image: "/placeholder.svg?height=100&width=200",
  },
  {
    id: 3,
    name: "Hyundai Kona Electric",
    chargeTime: "9 Hours",
    image: "/placeholder.svg?height=100&width=200",
  },
]

export default function VehicleSelectionPage() {
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null)
  const router = useRouter()

  const handleProceed = () => {
    if (selectedVehicle) {
      router.push(`/booking/provider?vehicleId=${selectedVehicle}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-8">VEHICLE SELECTION</h1>

        <div className="space-y-4">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className={`vehicle-card cursor-pointer ${selectedVehicle === vehicle.id ? "border-primary" : ""}`}
              onClick={() => setSelectedVehicle(vehicle.id)}
            >
              <div className="flex items-center gap-4">
                <Image
                  src={vehicle.image || "/placeholder.svg"}
                  alt={vehicle.name}
                  width={100}
                  height={60}
                  className="rounded-md"
                />
                <div>
                  <h3 className="text-lg font-semibold">{vehicle.name}</h3>
                  <p className="text-muted-foreground">Charge Time : {vehicle.chargeTime}</p>
                </div>
              </div>
              <div>
                {selectedVehicle === vehicle.id ? (
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                    <Plus className="h-6 w-6" />
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-full border border-border flex items-center justify-center">
                    <Plus className="h-6 w-6" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <Button size="lg" onClick={handleProceed} disabled={!selectedVehicle} className="px-8">
            PROCEED
          </Button>
        </div>
      </div>
    </div>
  )
}

